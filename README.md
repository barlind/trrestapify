# Restapify Monorepo

This repository now hosts a streamlined mock API platform focused on branch‑aware content serving and developer overrides. The original single‑package CLI implementation has been archived under `archive/legacy/` and all legacy build artifacts have been removed from the active codebase.

## Active Packages

| Path | Name | Purpose |
|------|------|---------|
| `packages/core-lib` | `@trrestapify/core-lib` | Core content loading, route parsing, git worktree management |
| `services/mock-service` | `@trrestapify/mock-service` | Express server runtime exposing branch + user override + proxy fallback |

## Key Concepts

1. Branch targeting via headers: `x-target-branch` selects which git branch content to serve. Missing branches fall back to `FALLBACK_BRANCH` if set.
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
| `ALLOWED_BRANCHES` | Comma-separated whitelist of branches | (none) |
| `DISABLE_BRANCH_ALLOW_LIST` | If `1`, ignore `ALLOWED_BRANCHES` entirely | `0` |
| `FALLBACK_BRANCH` | Branch used when target branch missing | (none) |
| `OFFLINE_SUBDIR` | Subdirectory inside worktree used as content root | `www-dev` |
| `AZDO_PAT` | Azure DevOps PAT (sets git extraheader for auth) | (none) |
| `PROXY_BASE_URL` | Base URL for upstream proxy fallback | (none) |
| `PROXY_ACCEPT` | Comma-separated list of path prefixes eligible for proxy | (none) |
| `USE_LOCAL_PROXY` | If `1`, apply local rewrite rules before proxying | `0` |
| `LOG_LEVEL` | `debug` | `info` | `error` | `silent` | `info` |


## Typical Development Flow

1. Export required env vars (at minimum `REPO_URL`).
2. Run the mock service:
  ```bash
  yarn workspace @trrestapify/mock-service dev
  ```
3. Call the API with a target branch:
  ```bash
  curl -H 'x-target-branch: main' http://localhost:4001/content/mitt-trr
  ```
4. Force refresh after updating branch content:
  ```bash
  curl -H 'x-target-branch: feature/x' -H 'x-branch-refresh: 1' http://localhost:4001/content/some-path
  ```

## User Override (JWT)

Send `Authorization: Bearer <token>`; if the token’s decoded `sub` matches a user‑specific override file, that override is layered onto the base route response.

## Proxy Fallback

When local content is absent and request path matches any prefix in `PROXY_ACCEPT`, the request is forwarded to `PROXY_BASE_URL`. With `USE_LOCAL_PROXY=1`, certain paths are rewritten (e.g. `/settings/content` → `/api/settings/public`).

## Logging

Set `LOG_LEVEL` to control verbosity. Levels: `silent`, `error`, `info`, `debug`. Internal events (branch load, proxy forward, override hits) emit structured lines.

## Legacy Notice

The previous CLI, dashboard, and internal implementation remain for historical reference only in `archive/legacy/`. They are excluded from builds and should not be modified.

## Contributing

See `CONTRIBUTING.md` for updated guidelines. Focus contributions on `packages/core-lib` or `services/mock-service`.

## License

MIT
