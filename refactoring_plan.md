# Kế hoạch Refactor Hệ thống (Figma Make + 2048)

You are a senior React/Vite/TypeScript refactoring agent.

Context:
This project appears to be a Figma Make generated React/Vite app with a real runtime app plus many scaffold-only shadcn/Radix UI files.

Main runtime path:
index.html
-> src/main.tsx
-> src/app/App.tsx
-> runtime components:
   - src/components/layout/TopNav.tsx
   - src/components/layout/Footer.tsx
   - src/components/game/Game2048.tsx
   - src/components/sidebar/Sidebar.tsx
   - src/components/dashboard/Dashboard.tsx
   - src/components/auth/LoginModal.tsx
   - src/hooks/use2048Game.ts
   - src/hooks/useLocalStats.ts

Project classification:
Landing/template scaffold or mini web app.
The goal is NOT to rewrite the app.
The goal is to safely clean, stabilize, and prepare the codebase for future development.

Critical rules:
1. Do NOT change game behavior.
2. Do NOT touch src/components/game/Tile.tsx unless absolutely necessary.
3. Do NOT edit src/app/components/ui/sidebar.tsx directly.
4. Do NOT delete generated/scaffold files immediately. Quarantine first.
5. Every patch must be small and reversible.
6. After every patch, run:
   - npm run build
   - npm run lint if available
   - npm test if available
7. If lint/test scripts do not exist, report that clearly and do not invent fake passing results.
8. Before modifying files, inspect imports and confirm whether a file is reachable from src/app/App.tsx or only scaffold.
9. Use git diff after each step and summarize exact changes.

Your tasks:

PHASE 0 — Baseline audit
- Inspect package.json, tsconfig, vite config, src/main.tsx, src/app/App.tsx.
- Build an import/reachability map starting from src/main.tsx and src/app/App.tsx.
- Classify files into:
  A. runtime-used
  B. scaffold-only
  C. unknown / needs manual confirmation
- Do not modify anything in this phase.
- Output a concise audit summary and proposed patch order.

PHASE 1 — Safe quarantine of scaffold files
- Identify files inside src/app/components/ui/* and figma/* that are not imported by the runtime tree.
- Move scaffold-only files to a quarantine folder, for example:
  src/_unused/figma-make/
- Preserve folder structure when moving.
- Do not delete files.
- Do not move src/app/components/ui/sidebar.tsx if there is any uncertainty.
- Update imports only if build proves something was still referenced.
- Run build after the move.
- If build fails, revert or fix only the minimal import/path issue.

PHASE 2 — Dependency cleanup proposal
- Inspect package.json.
- Determine which dependencies are runtime-used, scaffold-only, or unused.
- Do NOT uninstall packages immediately.
- Produce a dependency cleanup plan first.
- Only remove dependencies that are proven unused after quarantine and build passes.
- After each dependency removal, run npm install and npm run build.

PHASE 3 — Extract hardcoded content
- Move marketing/static text from src/app/App.tsx into a config file, for example:
  src/content/homeContent.ts
- Move sidebar guide/rules text from src/components/sidebar/Sidebar.tsx into:
  src/content/gameGuide.ts
- Move auth modal copy from src/components/auth/LoginModal.tsx into:
  src/content/authContent.ts
- Keep visual output and behavior identical.
- Do not introduce i18n library yet.
- Run build.

PHASE 4 — Component responsibility cleanup
- Refactor LoginModal.tsx carefully:
  - Extract form/timer/event logic into a hook such as src/hooks/useLoginModal.ts
  - Keep JSX output visually equivalent.
  - Do not change copy, animation, timing, or user-facing behavior unless required for correctness.
- Refactor Dashboard.tsx carefully:
  - Extract pure calculations/selectors into a helper or hook.
  - Keep rendering output the same.
- Keep each refactor patch small.
- Run build after each component.

PHASE 5 — Test readiness
- Check whether test tooling exists.
- If no tests exist, propose minimal setup using Vitest.
- Add a test script only if dependencies/tooling are installed or added intentionally.
- First recommended test target:
  - pure 2048 merge/move logic from use2048Game.ts
- If current logic is trapped inside a hook, extract pure functions into:
  src/lib/game2048.ts
- Add unit tests for:
  - merging equal tiles
  - preventing double merge in one move
  - movement without merge
  - game over / no moves if logic exists
- Run tests and build.

PHASE 6 — Final report
Produce a final report with:
- Files changed
- Files moved to quarantine
- Dependencies removed or proposed for removal
- Behavior preserved or changed
- Build/test results
- Remaining risks
- Recommended next refactor tasks

Important output style:
- Do not make huge rewrites.
- Do not silently delete generated code.
- Do not claim tests/build passed unless commands actually passed.
- Prefer boring safe patches over clever refactors.
- Stop and report if a step becomes risky or ambiguous.
