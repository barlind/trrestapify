# Refactor & Branch-aware Serving Plan (Updated 2025-10-20)

## 1. Completed Work
- Monorepo structure created: `packages/core-lib`, `services/mock-service`, `archive/legacy`.
- Extracted core logic (route loading, variable & for-loop replacement) into `core-lib`.
- Added `BranchWorktreeManager` scaffold for Git branch worktrees.
- Migrated tests to Vitest; all current tests passing (12/12).
- Archived legacy implementation under `archive/legacy` and excluded it from TS compilation.
- CLI modernised (`serve`, `list`, config loading) and decoupled from side-effect startup.

## 2. In Progress / Next
1. Integrate branch-aware request handling in `mock-service`.
2. Add refresh endpoint (CI-triggered) to force re-fetch/recreate worktree.
3. Security: allow-list branches & optional token header for refresh.
4. Fallback logic: if branch missing, serve default `main` (or configurable) branch.
5. Cache parsed routes per branch for performance (LRU keyed by branch).
6. Tests for branch selection via `x-target-branch` header & fallback.
7. Extend tests: for-loop expansion & query string casting parity.
8. Document workflow in README (local dev, CI refresh, PR previews).
9. Optional: CLI flag `--branch` to launch server pinned to one branch (reuse manager).

## 3. Branch-aware Serving Design
Request flow:
1. Read header `x-target-branch` (fallback to `main`).
2. Use `BranchWorktreeManager.ensure(branch)` to get worktree path.
3. Load (or retrieve cached) route map for that branch root.
4. Match incoming path + method against branch routes.
5. If not found and branch !== fallback, retry fallback branch.
6. Respond with JSON; add headers: `x-branch-served`, `x-branch-fallback` (if fallback used).

## 4. Data Structures
- Branch cache: `Map<string, { loadedAt: number; routesByMethod: Record<HttpVerb, Record<string, Route>> }>`.
- Manager: already provides worktree path; we add `loadBranchRoutes(branch)`.

## 5. Endpoints To Add
- `GET /routes` -> expand to accept optional `?branch=` query for listing.
- `POST /__restapify/branch/refresh` -> body `{ branch: string }` or all; requires `Authorization: Bearer <TOKEN>`.

## 6. Security / Limits
- Env var `ALLOWED_BRANCHES` (comma-separated) if set -> restrict.
- Env var `REFRESH_TOKEN` for refresh endpoint authentication.
- Validate branch name via manager's sanitize (already implemented).

## 7. Testing Strategy
- Unit: BranchWorktreeManager ensure & eviction (mock git exec via spy).
- Integration: mock-service route resolution for two artificial branches with divergent JSON.
- Edge cases: missing branch -> fallback; invalid branch name -> 400; refresh unauthorized -> 401.

## 8. Performance Considerations
- Only reload branch routes if worktree updated (add mtime check or explicit refresh trigger invalidates cache).
- JSON parsing O(N files); consider lazy load per first-hit route later if needed.

## 9. Migration / Cleanup
- Once branch logic stable, remove direct legacy references from new code (already excluded in tsconfig).
- Provide deprecation notice in legacy README (done).

## 10. Implementation Order (Detailed)
A. Create branch cache loader in `core-lib` (pure function + small wrapper).
B. Enhance `mock-service` server to:
   - Middleware: extract branch header, load routes.
   - Route matching & response generation using existing `getRoute` logic.
C. Add refresh endpoint.
D. Add tests for new functionality.
E. Update docs.

## 11. Open Questions
- Do we need per-request git show fallback if worktree add fails? (Defer; current approach adequate.)
- Should cache eviction align with worktree LRU? (Yes: when manager evicts branch, drop cache entry.)

---
This plan will be updated as tasks complete.
