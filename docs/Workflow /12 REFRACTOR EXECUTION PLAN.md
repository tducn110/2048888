

File này là kế hoạch tổng hợp để bắt đầu refactor code thật.

Nó nối các file docs/contract/gates thành một quy trình hành động cụ thể.

Mục tiêu:

```txt
[ ] Không refactor theo cảm hứng.
[ ] Không vừa nghĩ vừa làm.
[ ] Không nhảy phase.
[ ] Không sửa nhiều layer cùng lúc.
[ ] Biết patch đầu tiên là gì.
[ ] Biết file nào được sửa.
[ ] Biết file nào không được sửa.
[ ] Biết sau mỗi patch phải verify/report ra sao.
```

---

# 0. Primary Rule

```txt
Refactor only begins after workflow docs are ready.
```

Before refactor, these must exist:

```txt
[ ] docs/01-FIGMA-TRIAGE-HANDOFF.md
[ ] docs/02-PROJECT-CONTRACT.md
[ ] docs/03-ARCHITECTURE.md
[ ] AGENTS.md
[ ] docs/05-DESIGN.md, if UI is involved
[ ] docs/06-DESIGN-APPLICATION-GATE.md, if UI is involved
[ ] docs/07-PHASE-PLAYBOOK.md
[ ] docs/08-VERIFICATION-GATES.md
[ ] templates/TASK-CONTRACT.md
[ ] templates/PHASE-REPORT.md
```

If one of these is missing:

```txt
Do not refactor yet.
Create or complete the missing document first.
```

---

# 1. Refactor Readiness Checklist

Before touching code, confirm:

```txt
[ ] Project type is known.
[ ] Runtime entry path is known.
[ ] Route map is known or single-screen confirmed.
[ ] Reachable/scaffold files are known.
[ ] Current architecture is documented.
[ ] Target architecture is documented if needed.
[ ] Design source of truth exists.
[ ] Game-first rule is clear if this is a game.
[ ] Core/UI/render/data/audio ownership is clear.
[ ] First safe patch is known.
[ ] Allowed files are explicit.
[ ] Forbidden files are explicit.
[ ] Behavior to preserve is explicit.
[ ] Validation commands are known.
```

If any item is unclear:

```txt
Status = NOT READY.
Return to audit/contract/design phase.
```

---

# 2. Refactor Strategy

Refactor order:

```txt
1. Stabilize layout/grid.
2. Extract UI components.
3. Extract game core.
4. Stabilize runtime/input.
5. Apply or stabilize PixiJS render.
6. Clean data/storage/audio boundaries.
7. Cleanup unused imports/scaffold/dependencies.
8. Run final gate.
```

Do not start with:

```txt
[ ] Dependency cleanup.
[ ] Full rewrite.
[ ] PixiJS integration.
[ ] Firebase/auth/backend.
[ ] Deep refactor generated giant component.
[ ] Deleting scaffold.
[ ] Moving many folders.
```

---

# 3. Refactor Phase Order

## Phase 4 — Layout/Grid Stabilization

Use when:

```txt
[ ] UI is visually messy.
[ ] Game board is not primary.
[ ] Mobile order is wrong.
[ ] TopNav/Footer/Dashboard overpower the game.
[ ] Layout looks like landing page.
```

Allowed:

```txt
[ ] App shell layout.
[ ] Game page layout.
[ ] CSS grid/flex wrapper.
[ ] Responsive order.
[ ] z-index/pointer-events only if layout-related.
```

Forbidden:

```txt
[ ] Game logic.
[ ] Score formula.
[ ] PixiJS lifecycle.
[ ] Firebase/localStorage.
[ ] Audio.
[ ] Dependency cleanup.
```

---

## Phase 5 — Component Extraction

Use when:

```txt
[ ] One component owns too much JSX.
[ ] UI is hard to read.
[ ] HUD/modal/panel/footer can be separated.
[ ] Component is mixed but behavior is stable.
```

Good targets:

```txt
[ ] HUD.
[ ] Game over overlay.
[ ] Login modal.
[ ] Settings panel.
[ ] Dashboard/stats panel.
[ ] Footer.
[ ] Button primitive.
[ ] Panel primitive.
```

Bad targets:

```txt
[ ] Every div.
[ ] Every decorative pixel.
[ ] Generated giant component all at once.
[ ] Component extraction mixed with gameplay changes.
```

---

## Phase 6 — Game Core Extraction

Use when:

```txt
[ ] Score rule is inside UI.
[ ] Win/lose rule is inside component.
[ ] Input/render calculates gameplay.
[ ] Replay/reset logic is scattered.
[ ] Core is missing or impure.
```

Target:

```txt
src/game/core.ts
src/game/types.ts
src/game/config.ts
src/game/*.test.ts
```

Core must not import:

```txt
React
PixiJS
Firebase/API
window/document
localStorage/sessionStorage
audio
CSS
UI components
```

Recommended sub-phases:

```txt
6A — Extract types.
6B — Extract pure helpers.
6C — Extract state transition.
6D — Extract score/win/lose rule.
6E — Add core tests.
6F — Code graph gate.
```

---

## Phase 7 — PixiJS Render Integration

Use when:

```txt
[ ] Game visual runtime needs canvas/sprites/effects.
[ ] DOM render is not enough.
[ ] PixiJS already exists but lifecycle is messy.
[ ] Texture/sprite/ticker cleanup is risky.
```

Allowed:

```txt
[ ] Pixi Application.
[ ] Stage/layers.
[ ] Resize/DPR.
[ ] Textures/assets.
[ ] Sprites.
[ ] Particles/effects.
[ ] Render sync from state.
```

Forbidden:

```txt
[ ] Gameplay truth.
[ ] Score saving.
[ ] Firebase/localStorage.
[ ] Navbar/modal/footer/forms.
[ ] Dashboard text.
[ ] React state every frame.
```

Correct relation:

```txt
Core owns game truth.
React owns UI.
PixiJS owns render runtime.
```

---

## Phase 8 — Cleanup

Use only after architecture is stable.

Cleanup order:

```txt
8A — Unused imports.
8B — Local dead code.
8C — Scaffold report.
8D — Scaffold quarantine with approval.
8E — Dependency usage proof.
8F — Dependency removal in dedicated patch.
8G — Chunk/bundle cleanup.
```

Do not:

```txt
[ ] Remove dependency during refactor.
[ ] Delete scaffold immediately.
[ ] Change package.json during UI/core/render patch.
[ ] Cleanup while behavior is unstable.
```

---

# 4. How To Choose The First Refactor Patch

Use this decision tree:

```txt
If runtime is unclear:
-> return to Figma triage.

If project contract is missing:
-> create PROJECT-CONTRACT.md.

If architecture is unclear:
-> create ARCHITECTURE.md.

If UI product type is unclear:
-> create DESIGN.md.

If UI looks wrong but game works:
-> Phase 4 Layout/Grid.

If components are huge but layout is correct:
-> Phase 5 Component Extraction.

If game logic is mixed into UI/render:
-> Phase 6 Game Core Extraction.

If core is clean but render is messy:
-> Phase 7 PixiJS Render Integration.

If app is stable but bloated:
-> Phase 8 Cleanup.

If all done:
-> Phase 9 Final Gate.
```

---

# 5. Required Task Contract Before Every Patch

Before any patch, create or fill:

```txt
templates/TASK-CONTRACT.md
```

Minimum fields:

```txt
Goal:
Non-goals:
Allowed files:
Forbidden files:
Allowed changes:
Forbidden changes:
Behavior to preserve:
Validation commands:
Stop conditions:
Definition of done:
```

No task contract means:

```txt
Task is not ready to edit.
```

---

# 6. Standard Patch Loop

Every patch must follow:

```txt
1. Read relevant docs.
2. Read TASK-CONTRACT.md.
3. Check git status --short.
4. Inspect allowed files.
5. State patch plan.
6. Edit only allowed files.
7. Run verification.
8. Run gate checks.
9. Run git diff --check.
10. Run git status --short.
11. Run git diff --stat.
12. Write patch/phase report.
13. Stop.
```

Do not proceed to the next patch automatically.

---

# 7. Verification Required After Every Patch

Run available commands only:

```bash
npm run typecheck
npm test
npm run build
npm run lint
git diff --check
git status --short
git diff --stat
```

If command does not exist:

```txt
Report: NOT AVAILABLE.
Do not invent a script.
```

For core patch, also check:

```bash
rg -n "from .*react|from .*pixi|firebase|localStorage|window|document|Audio|audio-manager" src/game
```

For render/Pixi patch, also check:

```bash
rg -n "from .*firebase|from .*useScoreData|localStorage|audio-manager" src/features/game/render
rg -n "ticker.add|ticker.remove|addEventListener|removeEventListener|destroy\\(" src/features/game/render src/components/game
```

For UI patch, also run:

```txt
docs/06-DESIGN-APPLICATION-GATE.md
```

---

# 8. Manual Smoke Checks

After UI/game/render/input changes:

```txt
[ ] App loads.
[ ] Game starts.
[ ] Game can be played.
[ ] Score updates.
[ ] Game over works.
[ ] Replay works.
[ ] Desktop input works.
[ ] Mobile input works.
[ ] Modal/panel clickable.
[ ] Responsive layout acceptable.
[ ] No console crash/spam.
```

For PixiJS:

```txt
[ ] No duplicate canvas after replay.
[ ] No duplicate ticker/listener.
[ ] No black texture.
[ ] Resize works.
[ ] Overlay z-index still correct.
```

---

# 9. Report Required After Every Phase

After patch/phase, fill:

```txt
templates/PHASE-REPORT.md
```

Required report:

```txt
Status:
Changed files:
Why each file changed:
Scope result:
Behavior preserved:
Design compliance, if UI:
Architecture/ownership result:
Code graph result:
Verification commands:
Results:
Manual smoke:
git status --short:
git diff --stat:
Unexpected changes:
Risks/follow-up:
Next recommended patch:
```

If report is missing:

```txt
Phase is not done.
```

---

# 10. Refactor Stop Conditions

Stop immediately if:

```txt
[ ] Required file is outside Allowed files.
[ ] Patch needs dependency change.
[ ] Patch needs config change.
[ ] UI task needs gameplay change.
[ ] Core task needs UI/render change.
[ ] Render task needs data/storage change.
[ ] Baseline build/test fails for unrelated reason.
[ ] More than 5 files need changes.
[ ] Unexpected files changed.
[ ] Design source is unclear.
[ ] Architecture boundary is unclear.
[ ] Runtime path is unclear.
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

# 11. Refactor Anti-Patterns

Do not do:

```txt
[ ] “Refactor everything.”
[ ] “Clean project.”
[ ] “Apply PixiJS everywhere.”
[ ] “Delete unused deps first.”
[ ] “Move all files into folders.”
[ ] “Fix UI and scoring together.”
[ ] “Change Firebase while doing render.”
[ ] “Tweak tests to pass.”
[ ] “Comment out broken code.”
```

Safer version:

```txt
One layer.
One goal.
One patch.
Verify.
Report.
Stop.
```

---

# 12. Recommended First Execution Sequence

For a typical game project:

```txt
Patch 1:
Layout/Grid Stabilization
- make game board primary
- preserve gameplay

Patch 2:
Component Extraction
- extract HUD or GameOverOverlay
- preserve visual behavior

Patch 3:
Game Core Extraction
- extract types/core/config
- add pure tests if possible

Patch 4:
Runtime/Input Stabilization
- cleanup listener/timer/replay ownership

Patch 5:
PixiJS Render Stabilization
- app lifecycle
- texture lifecycle
- sprite sync
- particle/effect cleanup

Patch 6:
Data/Score Boundary
- save score non-blocking
- localStorage/Firebase isolated

Patch 7:
Audio Boundary
- mute/BGM/SFX isolated

Patch 8:
Cleanup
- unused imports
- scaffold quarantine
- dependency proof/removal

Patch 9:
Final Gate
- build/test/typecheck
- code graph
- manual smoke
```

---

# 13. Final Refactor Rule

```txt
Refactor is allowed only when:
- the docs define the rules,
- the task contract defines the current patch,
- the gates prove safety,
- the phase report records what happened.
```

If unsure:

```txt
Do not patch.
Audit.
Mark Unknown.
Create a smaller task.
```