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
const FALLBACK_BRANCH = process.env.FALLBACK_BRANCH || 'main';
const ALLOWED_BRANCHES = (process.env.ALLOWED_BRANCHES || '').split(',').map(b => b.trim()).filter(Boolean);
const OFFLINE_SUBDIR = process.env.OFFLINE_SUBDIR || 'www-dev'; // subfolder within worktree used as route root
// (Refresh via header only now; endpoint removed)
// Ensure repo exists (optional auto-clone)
function ensureLocalRepo() {
    const gitDir = path.join(REPO_ROOT, '.git');
    if (!fs.existsSync(gitDir)) {
        if (!REPO_URL) {
            console.warn('[mock-service] REPO_ROOT is not a git repository and REPO_URL not provided; branch features will fail.');
            return;
        }
        console.log(`[mock-service] Cloning ${REPO_URL} into ${REPO_ROOT} ...`);
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
            console.error('[mock-service] Failed to clone repository:', e.message);
        }
    }
}
ensureLocalRepo();
// Manager & caches (pass remoteName option)
const manager = new BranchWorktreeManager(REPO_ROOT, WORKTREES_DIR, 10, { remoteName: REMOTE_NAME });
const branchCache = new Map();
function isBranchAllowed(branch) {
    if (ALLOWED_BRANCHES.length === 0)
        return true;
    return ALLOWED_BRANCHES.includes(branch);
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
    branchCache.set(branch, { loadedAt: Date.now(), core });
    return core;
}
// Unified middleware: handle refresh header then attach branch core
app.use((req, res, next) => {
    const requestedBranch = (req.header('x-target-branch') || FALLBACK_BRANCH).trim();
    const refreshHeader = req.header('x-branch-refresh');
    const forceReload = refreshHeader === 'true';
    if (forceReload) {
        branchCache.delete(requestedBranch);
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
        console.error('Failed to load branch worktree', requestedBranch, e.message);
        if (requestedBranch !== FALLBACK_BRANCH) {
            try {
                const fallbackCore = loadBranchCore(FALLBACK_BRANCH, forceReload);
                req.branchCore = fallbackCore;
                req.branch = FALLBACK_BRANCH;
                res.setHeader('x-branch-fallback', 'true');
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
    if (!match && branch !== FALLBACK_BRANCH) {
        // attempt fallback branch direct lookup
        const fallbackCore = loadBranchCore(FALLBACK_BRANCH);
        const fallbackMatch = fallbackCore.getRouteByPath(method, urlPath);
        if (fallbackMatch) {
            res.setHeader('x-branch-fallback', 'true');
            res.json({ branch: FALLBACK_BRANCH, route: fallbackMatch });
            return;
        }
    }
    if (!match) {
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
    const body = match.getBody(vars, queryVars);
    const responseRoute = { ...match, body };
    res.setHeader('x-branch-served', branch);
    res.json({ branch, route: responseRoute });
});
const port = process.env.PORT || 4001;
if (!process.env.VITEST) {
    app.listen(port, () => { console.log(`mock-service listening on ${port}`); });
}
export { app, manager, branchCache };
//# sourceMappingURL=server.js.map