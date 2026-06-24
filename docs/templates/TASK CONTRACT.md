This file defines the exact scope for one patch.

A task is not ready to edit until this contract is clear.

Use this file before asking an AI agent to modify code.

---

# 0. Primary Rule

```txt
One task.
One goal.
One layer.
One patch.
No unrelated cleanup.
No automatic next phase.
```

If this contract is unclear, do not edit code.

If the patch requires more files than this contract allows, stop and report.

---

# 1. Task Identity

```txt
Task name:

Project:

Phase:

Sub-phase, if any:

Task type:
[ ] analysis-only
[ ] docs-only
[ ] UI/layout
[ ] component extraction
[ ] game core
[ ] runtime/session
[ ] input
[ ] render/PixiJS
[ ] data/storage
[ ] audio
[ ] cleanup
[ ] final verification
[ ] other:
```

---

# 2. Source Of Truth

The agent must read these files before editing.

```txt
Required docs:
[ ] docs/01-FIGMA-TRIAGE-HANDOFF.md
[ ] docs/02-PROJECT-CONTRACT.md
[ ] docs/03-ARCHITECTURE.md
[ ] AGENTS.md
[ ] docs/05-DESIGN.md, if UI task
[ ] docs/06-DESIGN-APPLICATION-GATE.md, if UI task
[ ] docs/07-PHASE-PLAYBOOK.md
[ ] docs/08-VERIFICATION-GATES.md
[ ] docs/09-PROMPTS.md
```

Additional source:

```txt
Figma frame:
- ...

Screenshot:
- ...

User instruction:
- ...

Issue/bug report:
- ...

Previous phase report:
- ...
```

---

# 3. Goal

State the exact goal.

```txt
Goal:
- ...
```

Good examples:

```txt
- Extract GameHUD from GameScreen without changing gameplay.
- Normalize game page layout so the game board remains primary.
- Extract pure score calculation into src/game/core.ts.
- Stabilize Pixi ticker cleanup in usePixiApp.
- Remove unused imports from one file only.
```

Bad examples:

```txt
- Refactor everything.
- Clean the project.
- Fix all UI.
- Improve architecture.
- Apply PixiJS.
- Make it better.
```

---

# 4. Non-Goals

State what this task must not do.

```txt
Non-goals:
- ...
```

Common non-goals:

```txt
[ ] Do not change gameplay rules.
[ ] Do not change UI design.
[ ] Do not change routing.
[ ] Do not change Firebase/API/localStorage.
[ ] Do not change audio.
[ ] Do not change PixiJS lifecycle.
[ ] Do not add dependencies.
[ ] Do not remove dependencies.
[ ] Do not delete scaffold.
[ ] Do not edit tests.
[ ] Do not edit config files.
[ ] Do not proceed to the next phase.
```

---

# 5. Allowed Files

Only these files may be edited.

```txt
Allowed files:
- ...
```

Rules:

```txt
[ ] Allowed files are strict.
[ ] Checklist items do not expand allowed files.
[ ] Nearby files are not automatically allowed.
[ ] If a required file is not listed here, stop and report.
```

Example:

```txt
Allowed files:
- src/components/game/GameScreen.tsx
- src/components/game/GameHUD.tsx
- src/components/game/GameHUD.module.css
```

---

# 6. Forbidden Files

These files must not be edited.

```txt
Forbidden files:
- ...
```

Default forbidden unless explicitly allowed:

```txt
[ ] package.json
[ ] package-lock.json
[ ] pnpm-lock.yaml
[ ] yarn.lock
[ ] vite.config.ts
[ ] tsconfig.json
[ ] eslint.config.*
[ ] global CSS/theme files
[ ] tests
[ ] docs
[ ] generated assets
[ ] public/*
[ ] .env
[ ] .env.*
```

Project-specific forbidden files:

```txt
- ...
```

---

# 7. Allowed Changes

What may change in this patch?

```txt
Allowed changes:
- ...
```

Examples:

```txt
[ ] Move JSX from parent component into a child component.
[ ] Add props needed for extracted component.
[ ] Rename local variables for clarity inside allowed files.
[ ] Add a pure helper inside allowed core file.
[ ] Add cleanup inside one render hook.
[ ] Adjust layout wrapper within allowed CSS file.
```

---

# 8. Forbidden Changes

What must not change?

```txt
Forbidden changes:
- ...
```

Common forbidden changes:

```txt
[ ] Do not change score formula.
[ ] Do not change win/lose condition.
[ ] Do not change input behavior.
[ ] Do not change game timing/spawn behavior.
[ ] Do not change save score flow.
[ ] Do not change login/auth flow.
[ ] Do not change route behavior.
[ ] Do not change visual style outside design source.
[ ] Do not change package dependencies.
[ ] Do not disable lint/typecheck/tests.
[ ] Do not delete features to make build pass.
```

---

# 9. Behavior To Preserve

List behavior that must remain identical.

```txt
Behavior to preserve:
- ...
```

For game tasks:

```txt
[ ] Game starts.
[ ] Game can be played.
[ ] Score updates.
[ ] Game over works.
[ ] Replay works.
[ ] Desktop input works.
[ ] Mobile input works.
[ ] Save score behavior unchanged.
[ ] Leaderboard/localStorage behavior unchanged.
[ ] Audio behavior unchanged.
```

For UI tasks:

```txt
[ ] Product type preserved.
[ ] Game-first hierarchy preserved.
[ ] Game board/canvas remains primary.
[ ] Responsive behavior preserved.
[ ] Existing visual style preserved.
[ ] No landing-page drift.
```

For PixiJS/render tasks:

```txt
[ ] Canvas still renders.
[ ] Ticker cleanup remains correct.
[ ] Listeners cleanup correctly.
[ ] No duplicate canvas/ticker/listener after replay/remount.
[ ] Overlay/panel z-index remains correct.
```

---

# 10. Architecture Rules For This Task

Select relevant rules.

```txt
[ ] Core remains pure.
[ ] React owns UI.
[ ] PixiJS owns render only.
[ ] Input sends actions/intents only.
[ ] Runtime orchestrates but does not become second core.
[ ] Data/storage owns persistence only.
[ ] Audio owns sound only.
```

Forbidden import edges for this task:

```txt
[ ] core -> React
[ ] core -> PixiJS
[ ] core -> Firebase/API
[ ] core -> window/document
[ ] core -> localStorage/sessionStorage
[ ] core -> audio
[ ] render -> Firebase/API
[ ] render -> score persistence
[ ] input -> score persistence
[ ] data/lib -> UI component
[ ] UI primitive -> game-specific mutation logic
```

Task-specific architecture note:

```txt
- ...
```

---

# 11. Design Source, If UI Task

Fill this only if task touches UI/component/layout/style.

```txt
Design source:
[ ] docs/05-DESIGN.md
[ ] docs/06-DESIGN-APPLICATION-GATE.md
[ ] Figma frame
[ ] Screenshot
[ ] Existing UI
[ ] User instruction
```

Exact design section/frame:

```txt
- ...
```

Design rules to preserve:

```txt
[ ] This is a game-first product, not a landing page.
[ ] Game board/canvas remains primary.
[ ] TopNav/Footer/Dashboard are supporting UI only.
[ ] Do not add hero section.
[ ] Do not add marketing CTA.
[ ] Do not add feature cards.
[ ] Do not add long landing scroll.
[ ] Use existing color/font/spacing tokens.
[ ] Preserve responsive behavior.
```

---

# 12. Expected Dependency Graph

Use this for architecture/refactor phases.

## Before

```txt
Expected graph before:
- ...
```

## After

```txt
Expected graph after:
- ...
```

## Forbidden edges after patch

```txt
Forbidden edges:
- ...
```

Example:

```txt
Expected graph after:
src/components/game/GameScreen.tsx
  -> src/components/game/GameHUD.tsx
  -> src/components/game/GameBoard.tsx

Forbidden edges:
src/components/game/GameHUD.tsx -> src/game/core.ts mutation helpers
src/components/game/GameHUD.tsx -> src/lib/firebase.ts
```

---

# 13. Validation Commands

Only run commands that exist in `package.json`.

```txt
Validation commands:
[ ] npm run typecheck
[ ] npm test
[ ] npm run build
[ ] npm run lint
[ ] git diff --check
[ ] git status --short
[ ] git diff --stat
```

Task-specific commands:

```bash
# example
rg -n "from .*react|from .*pixi|firebase|localStorage|window|document|audio" src/game
```

If a command is unavailable:

```txt
Report: NOT AVAILABLE.
Do not invent a new script.
```

---

# 14. Manual Checks

Use this if task affects UI/game/runtime.

```txt
Manual checks:
[ ] App loads.
[ ] Main route renders.
[ ] Game starts.
[ ] Game can be played.
[ ] Game over works.
[ ] Replay works.
[ ] Desktop input works.
[ ] Mobile input works.
[ ] Responsive layout works.
[ ] Modal/panel clickable.
[ ] No console crash/spam.
```

Task-specific manual checks:

```txt
- ...
```

---

# 15. Stop Conditions

Stop and report if any of these happen.

```txt
[ ] Required file is outside Allowed files.
[ ] Fix requires changing gameplay but task is UI-only.
[ ] Fix requires changing UI but task is core-only.
[ ] Fix requires changing render/PixiJS but task is core-only.
[ ] Fix requires changing Firebase/storage but task is UI/render-only.
[ ] Dependency change seems necessary.
[ ] Config change seems necessary.
[ ] Test expected behavior must change.
[ ] Baseline build/test fails due to unrelated error.
[ ] More than 5 files need changes for this small patch.
[ ] Unexpected files changed.
[ ] Architecture ownership is unclear.
[ ] Design source is unclear.
[ ] Runtime path is unclear.
[ ] Patch would mix unrelated concerns.
```

When stopped, report:

```txt
Blocked by out-of-scope requirement.

Needed file:
- ...

Reason:
- ...

Risk if ignored:
- ...

Suggested separate task:
- ...
```

---

# 16. Before Editing Output Required

Before editing, the agent must output:

```txt
Mode:
- small-patch-refactor

Goal:
- ...

Files to touch:
- ...

Files not to touch:
- ...

Behavior to preserve:
- ...

Architecture rules:
- ...

Design rules, if UI task:
- ...

Validation commands:
- ...

Stop conditions:
- ...
```

No editing before this is clear.

---

# 17. Definition Of Done

This task is done only when:

```txt
[ ] Only allowed files changed.
[ ] No forbidden files changed.
[ ] Required behavior preserved.
[ ] No forbidden dependency edge introduced.
[ ] Build/typecheck/test pass if available.
[ ] git diff --check passes.
[ ] git status --short reviewed.
[ ] git diff --stat reported.
[ ] Manual checks complete if applicable.
[ ] Design gate PASS if UI task.
[ ] Code graph gate PASS if architecture/refactor task.
[ ] Patch report complete.
[ ] Agent does not proceed to next phase.
```

---

# 18. Patch Report Required

After editing, produce:

```txt
# Patch Report

## Status
PASS / FAIL / BLOCKED

## Task
- ...

## Changed files
- ...

## Why each file changed
- ...

## Scope result
- ...

## Behavior preserved
- ...

## Architecture/ownership result
- ...

## Design compliance, if UI task
- ...

## Code graph result, if applicable
- ...

## Runtime/lifecycle result, if applicable
- ...

## Verification commands
- ...

## Results
- ...

## Manual checks
- ...

## git status --short
- ...

## git diff --stat
- ...

## Unexpected changes
- ...

## Risks / follow-up
- ...

## Next recommended patch
- ...
```

Do not mark PASS if any required gate failed.

---

# 19. Commit Mental Model

One task should produce one coherent commit.

```txt
Good:
- extract GameHUD component
- fix Pixi ticker cleanup
- move score localStorage helper to lib/localScores.ts
- normalize game layout shell

Bad:
- extract GameHUD + change scoring + cleanup dependencies
- apply PixiJS + rewrite UI + add Firebase
- move files + delete scaffold + change package.json
```

If the diff mixes unrelated concerns:

```txt
Split the task.
Do not continue.
```

---

# 20. Final Reminder

```txt
Allowed files are strict.
Checklists do not expand scope.
Out-of-scope issues are reported, not patched.
Preserve visual design.
Preserve gameplay behavior.
Verify before PASS.
Do not proceed to the next phase.
```