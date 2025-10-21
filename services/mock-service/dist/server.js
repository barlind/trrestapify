import express from 'express';
// Using relative path to core-lib dist to satisfy Vitest/Vite module resolution in monorepo during tests.
// TODO: restore package import once export map configured.
import { BranchWorktreeManager, createCoreLib } from '../../../packages/core-lib/dist/index.js';
import path from 'path';
import { execFileSync } from 'child_process';
import fs from 'fs';
const app = express();
app.use(express.json());
// Configuration
const REPO_ROOT = process.env.REPO_ROOT || process.cwd();
const REPO_URL = process.env.REPO_URL; // optional: if provided and REPO_ROOT is not a git repo, will be cloned
const REMOTE_NAME = process.env.REMOTE_NAME || 'origin';
const AZDO_PAT = process.env.AZDO_PAT; // personal access token for Azure DevOps (if HTTPS clone)
const WORKTREES_DIR = process.env.WORKTREES_DIR || path.join(process.cwd(), '.worktrees');
// Backward compatibility: honor legacy FALLBACK_BRANCH if DEFAULT_BRANCH unset
const DEFAULT_BRANCH = process.env.DEFAULT_BRANCH || process.env.FALLBACK_BRANCH || 'main';
// Branch allow-list is evaluated per request to allow tests / runtime to modify env without restart
function getAllowedBranches() {
    const raw = process.env.ALLOWED_BRANCHES || '';
    return raw.split(',').map(b => b.trim()).filter(Boolean);
}
const OFFLINE_SUBDIR = process.env.OFFLINE_SUBDIR || 'www-dev'; // subfolder within worktree used as route root
function currentEnv() {
    return {
        PROXY_BASE_URL: process.env.PROXY_BASE_URL || '',
        USE_LOCAL_PROXY: process.env.USE_LOCAL_PROXY === 'true',
        PROXY_ACCEPT: process.env.PROXY_ACCEPT || 'application/json',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info'
    };
}
// (Refresh via header only now; endpoint removed)
// Ensure repo exists (optional auto-clone)
function log(level, message, meta) {
    const { LOG_LEVEL } = currentEnv();
    const levels = ['debug', 'info', 'error'];
    if (LOG_LEVEL === 'silent')
        return;
    const allowed = LOG_LEVEL === 'debug' ? levels : LOG_LEVEL === 'info' ? ['info', 'error'] : ['error'];
    if (!allowed.includes(level))
        return;
    const base = `[mock-service] ${message}`;
    if (meta) {
        console.log(base, meta);
    }
    else {
        console.log(base);
    }
}
function ensureLocalRepo() {
    const gitDir = path.join(REPO_ROOT, '.git');
    if (!fs.existsSync(gitDir)) {
        if (!REPO_URL) {
            log('error', 'REPO_ROOT is not a git repository and REPO_URL not provided; branch features will fail.');
            return;
        }
        log('info', `Cloning ${REPO_URL} into ${REPO_ROOT} ...`);
        try {
            if (AZDO_PAT) {
                // Use extraheader for PAT basic auth
                const header = Buffer.from(`:${AZDO_PAT}`, 'utf8').toString('base64');
                execFileSync('git', ['-c', `http.extraheader=Authorization: Basic ${header}`, 'clone', '--no-tags', '--depth=1', REPO_URL, REPO_ROOT], { stdio: 'inherit' });
            }
            else {
                execFileSync('git', ['clone', '--no-tags', '--depth=1', REPO_URL, REPO_ROOT], { stdio: 'inherit' });
            }
            if (REMOTE_NAME !== 'origin') {
                execFileSync('git', ['-C', REPO_ROOT, 'remote', 'rename', 'origin', REMOTE_NAME], { stdio: 'ignore' });
            }
        }
        catch (e) {
            log('error', 'Failed to clone repository', e.message);
        }
    }
}
ensureLocalRepo();
// Manager & caches (pass remoteName option)
const manager = new BranchWorktreeManager(REPO_ROOT, WORKTREES_DIR, 10, { remoteName: REMOTE_NAME });
const branchCache = new Map();
function isBranchAllowed(branch) {
    // Disabled allow list means everything allowed
    if (process.env.DISABLE_BRANCH_ALLOW_LIST === 'true')
        return true;
    const list = getAllowedBranches();
    // Empty list -> allow all (no lock down by default)
    if (list.length === 0)
        return true;
    // If explicit wildcard '*' present allow all
    if (list.includes('*'))
        return true;
    // Support simple glob patterns with '*'
    return list.some(pattern => matchesBranchPattern(pattern, branch));
}
function matchesBranchPattern(pattern, branch) {
    if (pattern === branch)
        return true;
    // Escape regex special chars except '*'
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, r => `\\${r}`);
    const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$';
    try {
        const re = new RegExp(regexStr);
        return re.test(branch);
    }
    catch {
        return false;
    }
}
function loadBranchCore(branch, forceReload = false) {
    const cached = branchCache.get(branch);
    if (cached && !forceReload)
        return cached.core;
    const ensured = manager.ensure(branch);
    // Use subdirectory (e.g. www-dev) if it exists; fallback to worktree root
    let rootDir = ensured.worktreePath;
    const candidate = path.join(rootDir, OFFLINE_SUBDIR);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        rootDir = candidate;
    }
    const core = createCoreLib(rootDir);
    log('debug', `Loaded branch '${branch}'${forceReload ? ' (forceReload)' : ''} rootDir=${rootDir}`);
    branchCache.set(branch, { loadedAt: Date.now(), core });
    return core;
}
// Unified middleware: handle refresh header then attach branch core
app.use((req, res, next) => {
    // Default to configured default branch when header not provided
    const requestedBranch = (req.header('x-target-branch') || DEFAULT_BRANCH).trim();
    const refreshHeader = req.header('x-branch-refresh');
    const forceReload = refreshHeader === 'true';
    if (forceReload) {
        branchCache.delete(requestedBranch);
        log('info', `Force reload requested for branch '${requestedBranch}'`);
    }
    if (!isBranchAllowed(requestedBranch)) {
        res.status(403).json({ error: 'branch_not_allowed', branch: requestedBranch });
        return;
    }
    try {
        const core = loadBranchCore(requestedBranch, forceReload);
        req.branchCore = core;
        req.branch = requestedBranch;
        req.forceReloadBranch = forceReload;
        next();
    }
    catch (e) {
        log('error', `Failed to load branch worktree '${requestedBranch}'`, e.message);
        if (requestedBranch !== DEFAULT_BRANCH) {
            try {
                const fallbackCore = loadBranchCore(DEFAULT_BRANCH, forceReload);
                req.branchCore = fallbackCore;
                req.branch = DEFAULT_BRANCH;
                res.setHeader('x-branch-fallback', 'true');
                log('info', `Falling back to '${DEFAULT_BRANCH}' for branch '${requestedBranch}'`);
                next();
            }
            catch (fallbackErr) {
                res.status(500).json({ error: 'branch_load_failed', branch: requestedBranch, detail: fallbackErr.message });
            }
        }
        else {
            res.status(500).json({ error: 'branch_load_failed', branch: requestedBranch, detail: e.message });
        }
    }
});
app.get('/healthz', (_req, res) => { res.json({ status: 'ok' }); });
// /routes endpoint removed (can be re-enabled for debugging if needed)
// Generic dynamic route handler (example): echo route list match
app.all('*', (req, res) => {
    const core = req.branchCore;
    const branch = req.branch;
    const method = req.method.toUpperCase();
    const urlPath = req.path;
    // attempt exact then variable match
    let match = core.getRouteByPath(method, urlPath);
    if (!match)
        match = core.getMatchedRoute(method, urlPath);
    if (!match && branch !== DEFAULT_BRANCH) {
        // attempt fallback branch direct lookup
        const fallbackCore = loadBranchCore(DEFAULT_BRANCH);
        const fallbackMatch = fallbackCore.getRouteByPath(method, urlPath);
        if (fallbackMatch) {
            res.setHeader('x-branch-fallback', 'true');
            res.json({ branch: DEFAULT_BRANCH, route: fallbackMatch });
            return;
        }
    }
    if (!match) {
        const { PROXY_BASE_URL } = currentEnv();
        if (PROXY_BASE_URL) {
            forwardToProxy(req, res, branch);
            return;
        }
        res.status(404).json({ error: 'not_found', branch, path: urlPath });
        return;
    }
    // Build variable map for replacement
    const vars = {};
    const reqSegs = urlPath.split('/').filter(Boolean);
    const routeSegs = match.normalizedRoute.split('/').filter(Boolean);
    routeSegs.forEach((seg, i) => { if (seg.startsWith(':'))
        vars[seg.slice(1)] = reqSegs[i]; });
    const queryVars = {};
    Object.entries(req.query).forEach(([k, v]) => { if (typeof v === 'string')
        queryVars[k] = v; });
    let body = match.getBody(vars, queryVars);
    // User-specific override: if Authorization header contains JWT with sub claim
    function extractSubFromAuth(authHeader) {
        if (!authHeader)
            return undefined;
        const parts = authHeader.split(/\s+/);
        let token = parts.pop();
        if (!token || token.split('.').length < 2)
            return undefined;
        const payloadB64 = token.split('.')[1];
        try {
            const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = Buffer.from(normalized, 'base64').toString('utf8');
            const json = JSON.parse(decoded);
            if (typeof json.sub === 'string' && json.sub)
                return json.sub;
        }
        catch { /* ignore */ }
        return undefined;
    }
    const authHeader = req.headers['authorization'];
    const userId = extractSubFromAuth(authHeader || '');
    if (userId && match.directoryPath) {
        const overridePath = path.join(match.directoryPath, `${userId}.json`);
        if (fs.existsSync(overridePath)) {
            try {
                const raw = fs.readFileSync(overridePath, 'utf8');
                const parsed = JSON.parse(raw);
                body = parsed;
                res.setHeader('x-user-override', 'true');
                res.setHeader('x-user-id', userId);
                log('debug', `User override applied userId=${userId} path=${overridePath}`);
            }
            catch { /* ignore parse errors */ }
        }
    }
    const responseRoute = { ...match, body };
    res.setHeader('x-branch-served', branch);
    log('info', `Served route ${method} ${urlPath} branch=${branch}${userId ? ' userId=' + userId : ''}`);
    res.json({ branch, route: responseRoute });
});
async function forwardToProxy(req, res, branch) {
    const { PROXY_BASE_URL, USE_LOCAL_PROXY, PROXY_ACCEPT } = currentEnv();
    try {
        let originalUrl = req.originalUrl || req.path;
        if (USE_LOCAL_PROXY) {
            if (originalUrl.startsWith('/content')) {
                originalUrl = originalUrl.replace('/content', '');
            }
            if (originalUrl.startsWith('/settings/content')) {
                originalUrl = originalUrl.replace('/settings/content', '/api/settings/public');
            }
        }
        const proxyUrl = PROXY_BASE_URL + originalUrl;
        const forwardedHeaders = {};
        Object.entries(req.headers).forEach(([k, v]) => {
            if (typeof v === 'string')
                forwardedHeaders[k] = v;
            else if (Array.isArray(v))
                forwardedHeaders[k] = v.join(', ');
        });
        forwardedHeaders['Accept'] = PROXY_ACCEPT;
        const init = { method: req.method, headers: forwardedHeaders };
        if (!['GET', 'HEAD'].includes(req.method) && req.body) {
            init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            forwardedHeaders['Content-Type'] = forwardedHeaders['Content-Type'] || 'application/json';
        }
        const proxyResp = await fetch(proxyUrl, init);
        const text = await proxyResp.text();
        let data;
        try {
            data = JSON.parse(text);
            if (USE_LOCAL_PROXY && originalUrl.startsWith('/api/settings/public')) {
                data = { epiSettings: data };
            }
        }
        catch (err) {
            log('error', 'Proxy JSON parse error', { proxyUrl, err });
            res.status(502).send(`Invalid JSON from proxy ${proxyUrl}`);
            return;
        }
        res.setHeader('x-proxied', 'true');
        res.setHeader('x-proxy-url', proxyUrl);
        res.status(proxyResp.status).json(data);
        log('info', `Forwarded ${req.method} ${req.path} to proxy=${proxyUrl} status=${proxyResp.status} branch=${branch}`);
    }
    catch (err) {
        log('error', 'Proxy request failed', err?.message || err);
        res.status(500).json({ error: 'proxy_failed', detail: err?.message || String(err) });
    }
}
const port = process.env.PORT || 4001;
if (!process.env.VITEST) {
    app.listen(port, () => { const { PROXY_BASE_URL } = currentEnv(); log('info', `mock-service listening on ${port} proxy=${PROXY_BASE_URL || 'none'} offlineSubdir=${OFFLINE_SUBDIR}`); });
}
export { app, manager, branchCache };
//# sourceMappingURL=server.js.map