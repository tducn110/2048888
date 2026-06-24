

This file defines how AI agents must work in this repository.

It applies to all AI coding agents, including Codex, Mimo, Gemini, Claude Code, Copilot Workspace, or any assistant that edits files.

This repository may contain generated UI, Figma Make exports, React components, PixiJS render code, game logic, localStorage/Firebase score flow, audio, and scaffold files. Agents must work in small, scoped patches and must not guess architecture.

---

# 0. Primary Rule

Do not modify code until the current task scope is clear.

Before editing, the agent must know:

```txt
[ ] What phase this task belongs to.
[ ] What files are allowed to change.
[ ] What files are forbidden.
[ ] What behavior must be preserved.
[ ] What validation commands are available.
[ ] What the stop conditions are.
```

If this information is missing, ask for a task contract or create a patch plan first.

---

# 1. Files To Read First

Before any refactor or feature work, read these files if they exist:

```txt
docs/01-FIGMA-TRIAGE-HANDOFF.md
docs/02-PROJECT-CONTRACT.md
docs/03-ARCHITECTURE.md
AGENTS.md
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
docs/07-PHASE-PLAYBOOK.md
docs/08-VERIFICATION-GATES.md
templates/TASK-CONTRACT.md
templates/PHASE-REPORT.md
```

For UI/component tasks, always read:

```txt
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
```

For game logic/render/input/data/audio tasks, always read:

```txt
docs/02-PROJECT-CONTRACT.md
docs/03-ARCHITECTURE.md
docs/08-VERIFICATION-GATES.md
```

For Figma Make or design-to-code exports, always run or use the Figma triage workflow before refactoring.

---

# 2. Priority Order

When rules conflict, follow this priority order:

```txt
1. Current user request
2. Current TASK-CONTRACT.md
3. Repo-specific project contract
4. Architecture document
5. Design document
6. Verification gates
7. General checklist rules
```

Important:

```txt
Checklist items do not expand the allowed file list.
```

If a checklist finds a problem outside the allowed files:

```txt
Do not patch it.
Report it as a follow-up.
Suggest a separate task.
```

---

# 3. Operating Modes

## 3.1. Default mode: analysis-only

Default mode is:

```txt
Mode: analysis-only
```

In analysis-only mode:

```txt
[ ] Do not modify files.
[ ] Do not rename files.
[ ] Do not move files.
[ ] Do not delete files.
[ ] Do not format files.
[ ] Do not install packages.
[ ] Do not run codegen.
[ ] Do not run lint --fix.
[ ] Do not update snapshots.
[ ] Do not clean dependencies.
[ ] Do not apply PixiJS.
[ ] Do not add features.
```

Analysis-only mode may inspect the repo and produce reports, plans, risk classification, dependency maps, and proposed safe patches.

---

## 3.2. Small-patch-refactor mode

Only enter refactor mode when the user explicitly asks for a scoped patch, for example:

```txt
refactor now
apply the first safe patch
implement the next patch
do Phase X only
```

Before editing, output:

```txt
Mode: small-patch-refactor

Goal:
- ...

Files to touch:
- ...

Files not to touch:
- ...

Behavior to preserve:
- ...

Validation command:
- ...

Stop conditions:
- ...
```

Then apply only that patch.

---

# 4. Scope Rules

Allowed files are strict.

```txt
[ ] Only edit files listed in the current task contract.
[ ] Do not edit nearby files just because they look related.
[ ] Do not fix unrelated bugs.
[ ] Do not improve unrelated code.
[ ] Do not continue to the next phase.
[ ] Do not combine cleanup, refactor, feature, and dependency changes in one patch.
```

If a required change needs a file outside scope:

```txt
Stop.
Report the file.
Explain why it is needed.
Suggest a separate task.
```

---

# 5. Default Forbidden Files

These files are forbidden unless the current task explicitly allows them:

```txt
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
vite.config.ts
tsconfig.json
eslint.config.*
global CSS/theme files
docs/*
tests/*
generated assets
public/*
.env
.env.*
```

Rules:

```txt
[ ] Do not change package files unless this is a dependency task.
[ ] Do not change config files to hide errors.
[ ] Do not change tests just to make them pass.
[ ] Do not update snapshots unless explicitly requested.
[ ] Do not change docs during a code patch unless the task allows docs.
```

---

# 6. Stop Conditions

Stop and report if any of these happen:

```txt
[ ] Required file is outside Allowed files.
[ ] Fix requires changing gameplay but task is UI-only.
[ ] Fix requires changing UI but task is core-only.
[ ] Fix requires changing PixiJS/render but task is core-only.
[ ] Fix requires changing Firebase/storage but task is UI/render-only.
[ ] Build fails because of unrelated existing errors.
[ ] Tests require expected behavior changes.
[ ] Dependency change seems necessary.
[ ] Config change seems necessary.
[ ] More than 5 files need changes for a small patch.
[ ] Unexpected files changed.
[ ] Architecture ownership is unclear.
[ ] Runtime path is unclear.
[ ] The patch would mix unrelated concerns.
```

When stopping, report:

```txt
Blocked by out-of-scope change.

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

# 7. No Destructive Fixes

Do not use destructive fixes.

Forbidden:

```txt
[ ] Do not remove features to fix bugs.
[ ] Do not comment out code as a fix.
[ ] Do not disable tests.
[ ] Do not disable lint/typecheck.
[ ] Do not delete animations, overlays, storage, score flow, audio, or render effects unless explicitly requested.
[ ] Do not replace working gameplay with placeholder logic.
[ ] Do not remove Firebase/localStorage fallback just to simplify.
[ ] Do not remove mobile input just to fix desktop.
```

---

# 8. Git Safety

Never destroy user work.

Forbidden unless explicitly requested:

```txt
git reset --hard
git checkout .
git clean -fd
rm -rf
mv large folders
delete untracked files
force overwrite files
```

Before editing, inspect:

```bash
git status --short
```

After editing, report:

```bash
git status --short
git diff --stat
git diff --check
```

If unexpected files changed:

```txt
Stop.
Report the unexpected files.
Do not continue patching.
```

---

# 9. Command Safety

Use read-only commands during analysis:

```bash
pwd
git status --short
cat package.json
cat index.html
cat src/main.tsx
find src -type f
rg "createBrowserRouter|BrowserRouter|Routes|Route" src
rg "components/ui|@radix-ui" src
```

Do not run write-risk commands in analysis mode:

```bash
npm install
pnpm install
yarn install
npm run lint -- --fix
npm run format
npm test -- -u
rm -rf
mv
git checkout
codegen
```

Only run build/typecheck/test when the task enters verification/refactor mode or the user explicitly requests verification.

---

# 10. Architecture Boundaries

Follow the project architecture.

## Core/gameplay

Core owns:

```txt
game state
initial state
state transition
gameplay rules
score rules
win/lose condition
pure helpers
```

Core must not import:

```txt
React
PixiJS
Firebase/API
window
document
localStorage
sessionStorage
audio manager
CSS
UI components
```

## React UI

React owns:

```txt
layout
HUD
modals
panels
menus
dashboard
buttons
forms
routing composition
```

React UI must not own:

```txt
game simulation
score formula
Pixi resource cleanup
low-level audio engine
network save implementation
```

## PixiJS/render

PixiJS owns:

```txt
canvas
stage/layers
textures
sprites
particles
effects
animation-heavy render loop
render sync from state
```

PixiJS must not own:

```txt
gameplay truth
score saving
Firebase/localStorage
route behavior
React modal logic
static content/copy
```

## Input

Input owns:

```txt
keyboard
pointer
touch
drag/drop
swipe
coordinate conversion
listener setup/cleanup
```

Input must not own:

```txt
score formula
win/lose rule
score persistence
Firebase/localStorage
UI layout
texture/sprite cleanup
```

## Data/storage

Data owns:

```txt
Firebase/API calls
localStorage fallback
leaderboard
user stats
score save
loading/error state
```

Data must not own:

```txt
Pixi app
game loop
sprite/texture lifecycle
UI visual layout
gameplay rules
```

## Audio

Audio owns:

```txt
AudioContext
BGM
SFX
mute state
preload/decode
user gesture unlock
cleanup
```

Audio must not own:

```txt
gameplay core
score rule
Pixi app creation
UI layout
Firebase
```

---

# 11. Game-First Product Rules

If this project is a game-first app:

```txt
[ ] The game board/canvas is the primary visual area.
[ ] HUD is supporting UI.
[ ] Dashboard/stats/sidebar are secondary.
[ ] TopNav/Footer must not dominate the screen.
[ ] Mobile layout must show the game first.
[ ] Do not turn the game into a landing page.
```

Do not add unless explicitly requested:

```txt
hero section
marketing CTA
feature cards
long landing scroll
pricing section
testimonials
SaaS dashboard layout
```

---

# 12. Design Rules For UI Tasks

For UI/component changes:

```txt
[ ] Read docs/05-DESIGN.md.
[ ] Read docs/06-DESIGN-APPLICATION-GATE.md.
[ ] Use existing tokens when available.
[ ] Preserve the visual intent.
[ ] Preserve responsive behavior.
[ ] Preserve game-first hierarchy if applicable.
```

Do not:

```txt
[ ] Hard-code new colors when tokens exist.
[ ] Hard-code new fonts when typography tokens exist.
[ ] Add new spacing/radius/shadow systems without permission.
[ ] Add sections not present in Figma/design.
[ ] Change product type from game-first to landing/dashboard.
[ ] Change gameplay in a UI-only patch.
```

If design.md is unclear, report ambiguity instead of inventing a new UI direction.

---

# 13. PixiJS Rules

Only use PixiJS for:

```txt
game board/canvas
sprite-heavy scenes
particle/effect rendering
animation-heavy runtime
high-frequency render loop
```

Do not use PixiJS for:

```txt
navbar
button
modal
form
dashboard text
footer
normal layout grid
static content sections
```

PixiJS lifecycle rules:

```txt
[ ] Create/destroy Pixi Application in the render owner only.
[ ] Clean up ticker listeners.
[ ] Clean up pointer/listener handlers.
[ ] Destroy owned sprites/graphics/containers.
[ ] Do not destroy textures/resources owned by another hook.
[ ] Do not access Pixi objects after destroy.
[ ] Guard async texture/image assignment after unmount.
[ ] Do not duplicate ticker/listeners after replay/remount.
```

Do not call global Pixi resource cleanup by default.

Only consider global resource cleanup when debugging confirmed GPU/resource leaks and after checking shared textures/assets.

---

# 14. Dependency Rules

Do not add or remove dependencies unless the task explicitly allows it.

```txt
[ ] Do not add dependencies to solve simple local problems.
[ ] Do not remove dependencies during a refactor/move patch.
[ ] Do not change lockfiles unless package.json intentionally changes.
[ ] Do not delete dependency just because it appears unused.
[ ] Prove dependency is unused by runtime before cleanup.
[ ] Dependency cleanup must be its own patch.
```

Dependency cleanup requires:

```txt
[ ] Reachable runtime import check.
[ ] Scaffold-only import check.
[ ] Build pass.
[ ] Test/typecheck pass if available.
[ ] Dedicated cleanup task.
```

---

# 15. Scaffold / Generated Code Rules

Generated/Figma code can contain scaffold and unused files.

During analysis:

```txt
[ ] Scaffold is report-only.
[ ] Do not move scaffold.
[ ] Do not delete scaffold.
[ ] Do not rename scaffold.
[ ] Do not remove dependencies because scaffold looks unused.
```

During refactor:

```txt
[ ] Quarantine scaffold only with explicit user approval.
[ ] Move scaffold to _unused only in a dedicated cleanup patch.
[ ] Delete scaffold only in a later cleanup patch after build passes.
[ ] Do not deep-refactor generated giant components unless explicitly targeted.
```

Generated giant component rule:

```txt
If a generated component is 800+ lines, avoid broad refactor.
Prefer wrapping, extracting one helper, or extracting one isolated hook.
```

---

# 16. High-Risk Changes

These require a separate task contract:

```txt
moving gameplay source of truth
changing renderer technology
changing input system
changing global CSS/layout shell
changing storage/Firebase flow
changing package dependencies
deleting legacy folders
rewriting router
replacing generated visual structure
```

Rule:

```txt
High-risk changes must be audited first and patched separately.
```

---

# 17. Feature-Add Rules

When adding a feature:

```txt
[ ] Use previous triage/project contract as source of truth.
[ ] Place feature logic in src/features/<feature-name>/.
[ ] Place reusable UI only in generic UI folders if truly generic.
[ ] Place API/service code in service/lib files.
[ ] Place content/copy in content files.
[ ] Preserve current visual design unless explicitly requested.
[ ] Preserve current route behavior unless explicitly requested.
[ ] Add tests for pure/core behavior when possible.
```

Do not:

```txt
[ ] Add API calls inside generic UI components.
[ ] Add backend/auth/dashboard/payment/analytics before architecture boundary is clear.
[ ] Modify generated visual internals unless necessary.
[ ] Change gameplay rules while adding unrelated UI feature.
```

---

# 18. Small Patch Loop

Every refactor patch must follow this loop:

```txt
1. Read relevant docs.
2. Inspect current files.
3. State patch plan.
4. List exact files to touch.
5. State behavior to preserve.
6. Apply only the patch.
7. Run validation commands if available.
8. Run git status --short.
9. Run git diff --stat.
10. Report changed files and unexpected changes.
11. Recommend next safe patch.
```

One task should produce one coherent commit.

If the diff mixes unrelated concerns, split the task.

---

# 19. Verification Rules

Run only scripts that exist in package.json.

Preferred verification:

```bash
npm run typecheck
npm test
npm run build
npm run lint
git diff --check
git status --short
git diff --stat
```

If a script does not exist:

```txt
Report: not available.
Do not invent a new script.
```

Manual testing does not replace automated verification.

If automated verification cannot run, report why.

---

# 20. Code Graph Gate

For architecture/refactor phases, validate dependency direction.

Check:

```txt
[ ] core has no React/Pixi/Firebase/window/localStorage/audio import.
[ ] render has no Firebase/score persistence import.
[ ] input has no score persistence import.
[ ] UI primitives do not import game-specific mutation logic.
[ ] data layer does not import UI components.
[ ] no circular dependencies.
[ ] no unexpected reverse references.
```

If a code graph/MCP tool is available, use it after build/typecheck/test.

The phase is not complete if forbidden edges remain.

---

# 21. Required Report After Editing

After every patch, output:

```txt
# Patch Report

## Status
PASS / FAIL / BLOCKED

## Changed files
- ...

## Why each file changed
- ...

## Behavior preserved
- ...

## Architecture/ownership result
- ...

## Design compliance, if UI task
- ...

## Verification commands
- ...

## Results
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

If status is FAIL or BLOCKED, do not proceed to the next phase.

---

# 22. Definition Of Done

A patch is done only when:

```txt
[ ] It touches only allowed files.
[ ] It preserves required behavior.
[ ] It does not introduce forbidden dependency edges.
[ ] It does not create unrelated changes.
[ ] It passes available verification or reports why verification is unavailable.
[ ] It includes a patch report.
[ ] It recommends the next safe patch without applying it.
```

A phase is done only when:

```txt
[ ] All phase tasks are complete.
[ ] Verification gates pass.
[ ] Code graph matches expected architecture if applicable.
[ ] Manual smoke check is complete if applicable.
[ ] PHASE-REPORT.md is filled.
[ ] User approves moving to the next phase.
```

---

# 23. Final Agent Reminder

```txt
Do one phase only.
Do one patch only.
Do not proceed automatically.
Allowed files are strict.
Out-of-scope issues are reported, not patched.
Preserve visual design.
Preserve gameplay behavior.
Keep core pure.
Keep React UI separate from PixiJS render.
Keep data/storage outside core/render.
Verify before reporting PASS.
```