# Restapify Monorepo

This repository now hosts a streamlined mock API platform focused on branch‑aware content serving and developer overrides. The original single‑package CLI implementation has been archived under `archive/legacy/` and all legacy build artifacts have been removed from the active codebase.

## Active Packages

| Path | Name | Purpose |
|------|------|---------|
| `packages/core-lib` | `@trrestapify/core-lib` | Core content loading, route parsing, git worktree management |
| `services/mock-service` | `@trrestapify/mock-service` | Express server runtime exposing branch + user override + proxy fallback |

## Key Concepts

1. Branch targeting via headers: `x-target-branch` selects which git branch content to serve. Missing or failed branches fall back to `DEFAULT_BRANCH` (primary default) if set.
2. Forced refresh: `x-branch-refresh: 1` invalidates the cached branch content and re-loads from the worktree.
3. User override: `Authorization: Bearer <JWT>` with a `sub` claim triggers user‑specific override logic if matching content exists.
4. Variable routes: Filenames / directory names like `[id].json` become parameterized Express routes (e.g. `/items/:id`). Variables are substituted inside file bodies.
5. Proxy fallback: If a requested path is not found locally and matches `PROXY_ACCEPT`, the server forwards the call to `PROXY_BASE_URL` (with optional local rewrite rules when `USE_LOCAL_PROXY=1`).
6. Worktrees: Each requested branch is materialized as a shallow git worktree under `WORKTREES_DIR`, using `AZDO_PAT` or standard git auth if needed.

## Environment Variables

| Name | Description | Default |
|------|-------------|---------|
| `REPO_URL` | Remote git URL to clone (required if repo not already present) | (none) |
| `REMOTE_NAME` | Remote name used for fetch operations | `origin` |
| `WORKTREES_DIR` | Directory where branch worktrees are created | `.worktrees` (auto) |
| `ALLOWED_BRANCHES` | Comma-separated whitelist of branches (supports `*` and simple globs like `feature*`) | (none) |
| `DISABLE_BRANCH_ALLOW_LIST` | If `1`, ignore `ALLOWED_BRANCHES` entirely | `0` |
| `DEFAULT_BRANCH` | Primary branch used when header missing or branch fails to load | `main` |
| `OFFLINE_SUBDIR` | Subdirectory inside worktree used as content root | `www-dev` |
| `AZDO_PAT` | Azure DevOps PAT (sets git extraheader for auth) | (none) |
| `PROXY_BASE_URL` | Base URL for upstream proxy fallback | (none) |
| `PROXY_ACCEPT` | Comma-separated list of path prefixes eligible for proxy | (none) |
| `USE_LOCAL_PROXY` | If `1`, apply local rewrite rules before proxying | `0` |
| `LOG_LEVEL` | `debug` | `info` | `error` | `silent` | `info` |

## Running Locally

Minimal steps to get the mock service serving branch content on your machine.

1. Clone (or ensure) a git repo whose branch content you want to serve. If the mock service repo itself should serve its own test fixtures you can skip `REPO_URL`.
2. Export required environment variables (at minimum `REPO_URL` if `REPO_ROOT` isn't already a git repo). Optionally set `DEFAULT_BRANCH`.
3. Install dependencies.
4. Start the dev server (hot reload via `tsx`).
5. Hit routes with `curl` providing `x-target-branch`.

### Quickstart

```bash
git clone https://github.com/your-org/your-content-repo.git /tmp/offline-repo
export REPO_ROOT=/tmp/offline-repo            # Override root instead of using REPO_URL clone
export DEFAULT_BRANCH=main                   # Optional; defaults to main
export LOG_LEVEL=info                        # Or debug
export ALLOWED_BRANCHES="*"                 # Allow all branches (optional)
export OFFLINE_SUBDIR=www-dev                # If your content lives under this subdir
yarn install
yarn workspace @trrestapify/mock-service dev
```

Then request a route (assuming a file `www-dev/hello.json` exists on branch `featureA`):

```bash
curl -H 'x-target-branch: featureA' http://localhost:4001/hello
```

Force a reload after modifying branch content (e.g. you pulled new commits):

```bash
curl -H 'x-target-branch: featureA' -H 'x-branch-refresh: true' http://localhost:4001/hello
```

If a branch can't be loaded, the server falls back to `DEFAULT_BRANCH` and sets header `x-branch-fallback: true`.

### Using REPO_URL Auto-clone

Instead of pre-cloning, let the service clone shallow worktrees:

```bash
export REPO_URL=https://github.com/your-org/your-content-repo.git
export WORKTREES_DIR=$(pwd)/.worktrees
export DEFAULT_BRANCH=main
yarn workspace @trrestapify/mock-service dev
```

On first request for a branch the server creates a shallow worktree under `${WORKTREES_DIR}/<branch>`.

### Proxy Fallback Example

```bash
export PROXY_BASE_URL=https://public-api.example.com
export PROXY_ACCEPT=/users,/settings
curl -H 'x-target-branch: main' http://localhost:4001/users/profile   # If not found locally, proxies upstream
```

### Running Tests

All workspaces:
```bash
npm test --workspaces
```
Individual package:
```bash
yarn workspace @trrestapify/core-lib test
yarn workspace @trrestapify/mock-service test
```

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| 403 branch_not_allowed | Branch not in allow list | Adjust `ALLOWED_BRANCHES` or set `DISABLE_BRANCH_ALLOW_LIST=1` |
| 500 branch_load_failed | Git worktree add failed (branch missing or auth) | Verify branch exists; ensure repo has remote access; set `AZDO_PAT` if Azure DevOps |
| Missing route variables | File naming pattern incorrect | Use `[id].json` (not `:id.json`) |
| Fallback always triggers | Requested branch absent | Create branch or specify existing one; check `x-target-branch` spelling |
| Dev script permission denied / stale dead links | Corrupted `node_modules` (ACLs, partial prune) | `yarn sanitize:node_modules && rm -rf node_modules && yarn install` |



## Typical Development Flow

1. Decide package manager (project uses Yarn; `package-lock.json` removed to avoid dual locks).
2. Export required env vars (at minimum `REPO_URL`).
3. Run the mock service:
  ```bash
  yarn workspace @trrestapify/mock-service dev
  ```
4. Call the API with a target branch:
  ```bash
  curl -H 'x-target-branch: main' http://localhost:4001/content/mitt-trr
  ```
5. Force refresh after updating branch content:
  ```bash
  curl -H 'x-target-branch: feature/x' -H 'x-branch-refresh: 1' http://localhost:4001/content/some-path
  ```

## User Override (JWT)

Send `Authorization: Bearer <token>`; if the token’s decoded `sub` matches a user‑specific override file, that override is layered onto the base route response.

Override file discovery (example):
```
content/
  profile.json               # base response
  profile--user-12345.json   # override served when sub === '12345'
```
Merge strategy (current): override file fully replaces base for simplicity. Future enhancement could deep-merge.

Security notes:
- Only `sub` is consumed; ensure tokens are validated upstream if exposure matters.
- No override path traversal: filenames constrained to expected pattern.

## Proxy Fallback

When local content is absent and request path matches any prefix in `PROXY_ACCEPT`, the request is forwarded to `PROXY_BASE_URL`. With `USE_LOCAL_PROXY=1`, certain paths are rewritten (e.g. `/settings/content` → `/api/settings/public`).

Configuration example:
```
PROXY_BASE_URL=https://upstream.example.com
PROXY_ACCEPT=/settings,/users,/auth
USE_LOCAL_PROXY=1
```
Behavior:
- If request path starts with one of the prefixes, attempt proxy.
- Local rewrite (sample) `/settings/content` → `/api/settings/public` (implementation-specific; see service code).
- On proxy error, respond with upstream status & log an error line.

Planned enhancements:
- Timeout & retry controls via env.
- Metrics on proxy hit ratio.

## Branch Workflow Examples

List routes from `featureA`:
```bash
curl -H 'x-target-branch: featureA' http://localhost:4001/content/mitt-trr
```
Refresh branch cache & worktree:
```bash
curl -H 'x-target-branch: featureA' -H 'x-branch-refresh: true' http://localhost:4001/content/mitt-trr
```
Fallback when branch missing:
```bash
curl -H 'x-target-branch: non-existent' http://localhost:4001/content/mitt-trr  # serves DEFAULT_BRANCH
```

Wildcard allow list examples:
```bash
export ALLOWED_BRANCHES="feature*"       # allow featureA, featureB, feature/foo, etc.
export ALLOWED_BRANCHES="*"              # allow all branches explicitly
export ALLOWED_BRANCHES="release*,hotfix*"  # allow release and hotfix patterns
```

## Refresh Strategies

Current: header `x-branch-refresh: true`.
Upcoming (optional): authenticated endpoint `POST /__restapify/branch/refresh` with header `Authorization: Bearer <REFRESH_TOKEN>`.

## Development Conventions

- Use Yarn (`yarn install`) for dependency management.
- Run tests: `npm run workspaces:test` (aggregated) or per workspace `yarn workspace @trrestapify/core-lib test`.
- Avoid committing build artifacts; rely on source in `packages/` & `services/`.
- Keep environment-specific secrets out of `.env` committed files.

## Linting & Formatting

Unified ESLint config (`.eslintrc`) will lint TS across workspaces. Ignored paths declared in `.eslintignore`. Run:
```bash
yarn eslint packages/** services/** --ext .ts
```

## Logging

Set `LOG_LEVEL` to control verbosity. Levels: `silent`, `error`, `info`, `debug`. Internal events (branch load, proxy forward, override hits) emit structured lines.

## CORS

The mock service now enables permissive CORS by default (all origins, common methods/headers). Adjust by introducing a future `CORS_ORIGINS` env (comma list) and replacing the middleware in `services/mock-service/src/server.ts`.

## Legacy Notice

The previous CLI, dashboard, and internal implementation remain for historical reference only in `archive/legacy/`. They are excluded from builds and should not be modified.

## Contributing

See `CONTRIBUTING.md` for updated guidelines. Focus contributions on `packages/core-lib` or `services/mock-service`.

## License

MIT
