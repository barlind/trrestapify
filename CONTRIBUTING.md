6. Submit your pull request.


# Contributing

Thank you for considering a contribution! The repository has transitioned from a legacy single‑package CLI to a focused monorepo with two active workspaces. Please read these guidelines to align with the current architecture.

## Scope

Active code lives only in:
* `packages/core-lib`
* `services/mock-service`

The directory `archive/legacy/` is read‑only historical material. Do not modify or delete its contents (except for clearly tagged documentation corrections).

## Pull Request Checklist

1. Branch from `main`.
2. Name your branch `feat/...`, `fix/...`, or `chore/...`.
3. Implement changes inside the appropriate workspace.
4. Run tests: `npm test --workspace @trrestapify/mock-service` (and add tests for new behavior).
5. Ensure logging at `LOG_LEVEL=debug` is still coherent (no noisy loops, structured messages).
6. Update README if you add or change environment variables.
7. Use conventional commits or gitmoji if you prefer (consistency over style).

## Development Setup

```bash
git clone <repo>
cd trrestapify
yarn install
```

Run the mock service:
```bash
yarn workspace @trrestapify/mock-service dev
```

Run tests for both workspaces (if/when core-lib gains tests):
```bash
npm test --workspaces
```

## Adding Environment Variables

Document new env vars in `README.md` (table) and ensure they have sensible defaults. Avoid hardcoding secrets—use process env only.

## Code Style & Tooling

* TypeScript strict where practical (child tsconfigs already enforce strict null checks).
* Prefer small pure helpers in core-lib; keep side effects (fs/network) localized in mock-service.
* Avoid introducing additional build layers (no root-level Babel / Rollup) unless justified.

## Testing Guidelines

* Cover: branch selection, refresh behavior, proxy fallback, variable substitution, user override.
* For new features: happy path + one failure case minimum.
* Keep tests fast—no real network calls (mock proxy targets).

## Logging

Add logs at `debug` level for lifecycle events; use `info` only for high-level actions (branch loaded, proxy forwarded). Avoid verbose per-request dumps unless behind `debug`.

## Performance Considerations

* Worktree creation should remain shallow; avoid fetching full history.
* Cache parsed route structures per branch + invalidate on refresh header.

## Release & Versioning

Currently private (monorepo root marked `private`). If publishing packages later, add per-package `CHANGELOG` entries and SemVer.

## Out of Scope

* Modifying legacy CLI / dashboard code (archived).
* Reintroducing large build toolchains at root (Rollup, Parcel, Babel).

## Questions

Open an issue or start a discussion thread. Thanks again!

3. Run the test script

You can easily see your change by running the `./test/run.ts` script that serve the mocked API from `./test/api`:

```bash
yarn test:manual
```

## 💻 Use the cli locally

If you make some update on the cli of restapify and want to test the changes, just run the command `yarn link` at the root of the project.

## 🎨 Design

All the icons are created by using Figma https://www.figma.com/file/ggaBPd6ix2QvIyCx8QQpWg/icons.
