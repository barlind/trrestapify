# Refactor & Branch-aware Serving Plan (Updated 2025-10-21)

## 1. Completed Work
- Monorepo structure finalized: `packages/core-lib`, `services/mock-service`, `archive/legacy` retained for reference only.
- Core extraction: route loading, variable casting, for-loop & query string replacement lives in `core-lib`.
- Implemented `BranchWorktreeManager` with shallow worktree creation, dynamic allow‑list, default branch fallback logic, and forced reload.
- Branch-aware serving in `mock-service` via headers:
   - `x-target-branch` selects branch (with fallback to configured default).
   - `x-branch-refresh: true` forces branch cache & worktree refresh.
- JWT user override support (uses `sub` claim to serve user-specific file variants).
- Proxy fallback and optional local proxy acceptance implemented.
- Logging levels (`LOG_LEVEL`) integrated; structured log lines added for served routes & refresh events.
- Environment variable catalog added to `README.md` (initial pass).
- Tests migrated to Vitest & updated (current pass count: core-lib 2, mock-service 8 = 10 tests total).
- Legacy root sources & docs removed; archived under `archive/legacy` (tsconfig excludes them).
- ACL / permission issues resolved; repository cleaned of deny-delete ACLs.
- Removed `bin/` legacy CLI and `docs/` legacy documentation.

## 2. Remaining / Next
1. Formal refresh endpoint (e.g. `POST /__restapify/branch/refresh`) with auth token env var (`REFRESH_TOKEN`) – optional vs current header approach.
2. Harden branch allow‑list behavior: add `DISABLE_BRANCH_ALLOW_LIST` doc & ensure env precedence documented clearly.
3. Expand README: branch workflow examples, JWT override explanation, proxy configuration, and refresh strategies.
4. Add CI (GitHub Actions) to run `npm ci && npm run workspaces:test` on PRs; optionally build and publish preview artifact.
5. Lint setup consolidation (shared ESLint config + run on both workspaces).
6. Remove/replace remaining legacy build artifacts (`dist/`, rollup config, `.babelrc`, `.parcelrc`) if fully unused.
7. Add versioning/release strategy (decide if packages remain private or publish `core-lib`).
8. Performance enhancement: consider TTL or size-based eviction for branch route cache; metrics/logging around cache hits.
9. Optional: script to prune stale worktrees on disk based on last access time.
10. Add tests for proxy fallback & error handling (expand beyond current success paths).
11. Add tests for query string casting & extended syntax edge cases (number/boolean casts in nested arrays, default query values).
12. Document maintenance steps for ACL normalization (macOS note) in CONTRIBUTING.

## 3. Branch-aware Serving Design (Implemented)
Request flow:
1. Read header `x-target-branch` (fallback to configured `DEFAULT_BRANCH`).
2. `BranchWorktreeManager.ensure(branch)` produces/updates shallow worktree directory.
3. Load or reuse cached route map for target branch.
4. Match incoming path + method; if miss and target ≠ default, retry default branch.
5. Respond with JSON; headers include `x-branch-served` and `x-branch-fallback` when fallback applies.
6. If header `x-branch-refresh: true` present, purge cache & re-fetch before matching.

## 4. Data Structures
- Branch cache: `Map<branch, { loadedAt: number; routesByMethod: Record<HttpVerb, Record<string, Route>> }>` with manual invalidation on refresh or eviction.
- Worktree manager: exposes `ensure(branch)`; future: `evict(branch)` & `list()` for observability.

## 5. Endpoints (Planned / Optional)
- `GET /routes?branch=<branch>` list routes for a given branch (read from cache).
- `POST /__restapify/branch/refresh` body `{ branch?: string }` to refresh one or all branches (auth protected).
- Metrics endpoint (optional): `GET /__restapify/metrics` for cache stats.

## 6. Security / Limits
- `ALLOWED_BRANCHES` (CSV) restricts accepted branches unless `DISABLE_BRANCH_ALLOW_LIST=true`.
- Planned `REFRESH_TOKEN` (or PAT) to secure POST refresh endpoint (header-based refresh currently open; consider gating with env flag `ALLOW_REFRESH_HEADER`).
- Branch name sanitization performed inside manager (rejects suspicious names).
- JWT user override: only file-level personalization; ensure no path traversal by validating `sub`.

## 7. Testing Strategy
Current coverage:
- Branch selection & fallback.
- Forced refresh via header.
- User override (JWT `sub`).
- Proxy basic behavior.
- Variable route matching.
To add:
- Query string casting & extended syntax edge cases.
- Boolean/number casting inside arrays & nested objects.
- Negative tests: invalid branch name (expect 400), unauthorized refresh when token enabled, missing override file, proxy error propagation.
- Cache refresh timing (ensure new content after refresh).

## 8. Performance Considerations
- Current: full parse per branch on first use; manual refresh wipes cache.
- Future: track worktree mtime or git commit hash to skip unnecessary reloads.
- Possible lazy route load: map filenames initially; parse on demand.
- Add debug metrics (cache size, load duration) to logs or `/metrics`.

## 9. Migration / Cleanup
- Legacy code & docs removed; archive retained.
- Remaining legacy build artifacts slated for removal (`dist/` & old config files) – pending decision.
- Normalize permissions (done) & note macOS ACL remediation in docs (pending doc update).

## 10. Implementation Order (Revised Next Steps)
1. Documentation expansion (README & CONTRIBUTING additions).
2. Add optional secured refresh endpoint & env flags.
3. CI workflow & shared lint config.
4. Metrics & cache introspection utilities.
5. Performance tweaks (mtime/commit hash check).
6. Optional: remove legacy root build artifacts & finalize release strategy.

## 11. Open Questions
- Should header-based refresh be gated behind an auth token by default? (Security vs convenience.)
- Implement automatic LRU eviction of seldom-used branches to reclaim disk? Threshold?
- Publish `@trrestapify/core-lib` publicly or keep private (naming & semantic versioning strategy)?
- Introduce structured logging format (JSON) for easier ingestion?
- Need cross-branch diff endpoint for debugging changes?

---
## 12. Summary
Core branch-aware and personalization features are in place; remaining work centers on polish (docs, security hardening, CI, performance). This document reflects the current state after major refactor and cleanup.

---
This plan will be updated as tasks complete.
