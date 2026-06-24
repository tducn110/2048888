# 07 — PHASE-PLAYBOOK.md

File này định nghĩa thứ tự phase chuẩn cho project game / Figma Make / React / PixiJS.

Mục tiêu của file này là giúp người hoặc AI agent biết:

```txt
Làm bước nào trước?
Bước nào chưa được làm?
Mỗi phase được sửa gì?
Mỗi phase không được sửa gì?
Khi nào phase được coi là PASS?
Khi nào phải dừng?
Khi nào mới được qua phase tiếp theo?
```

File này không thay thế:

```txt
docs/01-FIGMA-TRIAGE-HANDOFF.md
docs/02-PROJECT-CONTRACT.md
docs/03-ARCHITECTURE.md
AGENTS.md
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
docs/08-VERIFICATION-GATES.md
templates/TASK-CONTRACT.md
templates/PHASE-REPORT.md
```

Playbook này chỉ nói **thứ tự làm việc**.

---

# 0. Primary Rule

```txt
One phase only.
One patch only.
Do not proceed to the next phase automatically.
```

Nếu phase hiện tại chưa PASS:

```txt
Không qua phase tiếp theo.
Không cleanup thêm.
Không refactor thêm.
Không tranh thủ sửa lỗi ngoài scope.
```

Mọi phase đều phải có:

```txt
[ ] Goal rõ.
[ ] Non-goals rõ.
[ ] Allowed files rõ.
[ ] Forbidden files rõ.
[ ] Behavior to preserve rõ.
[ ] Expected graph rõ nếu là architecture/refactor phase.
[ ] Verification commands rõ.
[ ] Stop conditions rõ.
[ ] Definition of Done rõ.
[ ] Phase report sau khi xong.
```

---

# 1. Phase Numbering

Có 2 loại số:

```txt
Document number:
07-PHASE-PLAYBOOK.md

Workflow phase:
PHASE 0, PHASE 1, PHASE 2...
```

Không nhầm lẫn hai cái này.

`07-PHASE-PLAYBOOK.md` là file tài liệu.  
Trong file này có nhiều phase workflow.

---

# 2. Global Workflow

Thứ tự chuẩn:

```txt
PHASE 0 — Figma Make Triage
PHASE 1 — Handoff + Project Contract
PHASE 2 — Architecture + Agent Rules
PHASE 3 — Design Contract + Design Gate
PHASE 4 — Layout/Grid Stabilization
PHASE 5 — Component Extraction
PHASE 6 — Game Core Extraction
PHASE 7 — PixiJS Render Integration
PHASE 8 — Cleanup
PHASE 9 — Final Gate
```

Short version:

```txt
Audit
-> Contract
-> Architecture
-> Agents
-> Design
-> Layout
-> Components
-> Core
-> Render
-> Cleanup
-> Final verify
```

---

# 3. Global Forbidden Rule

Không bao giờ làm các nhóm này trong cùng một patch:

```txt
[ ] UI redesign + gameplay logic.
[ ] PixiJS render + Firebase/storage.
[ ] Dependency cleanup + file move.
[ ] Component extraction + game rule change.
[ ] Layout/grid change + core refactor.
[ ] Audio refactor + render lifecycle refactor.
[ ] Scaffold deletion + feature add.
[ ] Test rewrite + production refactor.
```

Nếu task có nhiều nhóm:

```txt
Split into phases.
Do the safest phase first.
Verify.
Report.
Ask before continuing.
```

---

# 4. Phase Template

Mỗi phase phải viết theo format này.

```txt
# PHASE X — Name

## Goal

## Non-goals

## Inputs required

## Allowed files

## Forbidden files

## Expected graph before, if applicable

## Expected graph after, if applicable

## Forbidden edges, if applicable

## Steps

## Verification commands

## Manual checks, if applicable

## Definition of Done

## Stop conditions

## Output report
```

Nếu phase quá lớn, chia sub-phase:

```txt
PHASE XA
PHASE XB
PHASE XC
```

Mỗi sub-phase cũng phải PASS riêng.

---

# 5. PHASE 0 — Figma Make Triage

## Goal

Phân tích repo sinh từ Figma Make / Figma-to-code / design-to-code trước khi refactor.

Mục tiêu:

```txt
[ ] Biết runtime thật chạy từ đâu.
[ ] Biết route nào active.
[ ] Biết file nào reachable.
[ ] Biết file nào scaffold/non-runtime.
[ ] Biết dependency nào thật sự dùng.
[ ] Biết components/ui, shadcn, Radix có dùng runtime không.
[ ] Biết component nào quá lớn.
[ ] Biết file nào mixed responsibility.
[ ] Biết hardcoded content/mock data nằm đâu.
[ ] Biết project type.
[ ] Biết first safe patch.
```

## Mode

```txt
Mode: analysis-only
```

## Allowed

```txt
[ ] Read files.
[ ] Run read-only search commands.
[ ] Produce triage report.
[ ] Produce risk classification.
[ ] Recommend safe refactor order.
```

## Forbidden

```txt
[ ] Modify files.
[ ] Rename files.
[ ] Move files.
[ ] Delete scaffold.
[ ] Remove dependencies.
[ ] Install packages.
[ ] Run formatters/fixers.
[ ] Add features.
[ ] Apply PixiJS.
[ ] Start refactor.
```

## Output

```txt
Figma Make Triage Report
```

Required sections:

```txt
1. Executive decision
2. Runtime entry map
3. Route map
4. Reachable file list
5. Non-runtime / scaffold candidates
6. shadcn/Radix usage result
7. Dependency usage summary
8. Largest component list
9. Mixed responsibility list
10. Hardcoded content list
11. Test readiness
12. Project type classification
13. Risk classification
14. Safe refactor order
15. Gate before refactor
```

## Definition of Done

```txt
[ ] Report complete.
[ ] Runtime entry map included.
[ ] Route map included or single-screen confirmed.
[ ] Reachable/scaffold split included.
[ ] Project type selected.
[ ] Strategy selected.
[ ] First safe patch proposed.
[ ] No files modified.
```

---

# 6. PHASE 1 — Handoff + Project Contract

## Goal

Chuyển triage result thành luật project.

Outputs:

```txt
docs/01-FIGMA-TRIAGE-HANDOFF.md
docs/02-PROJECT-CONTRACT.md
```

## Inputs required

```txt
[ ] Figma Make Triage Report.
[ ] Runtime entry map.
[ ] Route map.
[ ] Reachable/scaffold map.
[ ] Project type classification.
[ ] Recommended strategy.
[ ] First safe patch.
```

## Allowed

```txt
[ ] Create/update docs only.
[ ] Summarize triage.
[ ] Define project contract.
[ ] Define behavior to preserve.
[ ] Define layer ownership.
[ ] Define forbidden dependency edges.
```

## Forbidden

```txt
[ ] Runtime code changes.
[ ] UI changes.
[ ] Dependency cleanup.
[ ] Scaffold deletion.
[ ] PixiJS integration.
[ ] Game logic extraction.
```

## Definition of Done

```txt
[ ] 01-FIGMA-TRIAGE-HANDOFF.md complete.
[ ] 02-PROJECT-CONTRACT.md complete.
[ ] Project type clear.
[ ] Runtime clear.
[ ] First safe patch clear.
[ ] Core/UI/render/data/audio ownership clear.
[ ] Behavior to preserve clear.
[ ] Refactor readiness stated.
```

## Stop conditions

```txt
[ ] Runtime path unclear.
[ ] Project type unclear.
[ ] Reachable/scaffold split unclear.
[ ] First safe patch unclear.
```

If stopped:

```txt
Return to PHASE 0.
Do not refactor.
```

---

# 7. PHASE 2 — Architecture + Agent Rules

## Goal

Tạo bản đồ kiến trúc và luật vận hành cho AI agent.

Outputs:

```txt
docs/03-ARCHITECTURE.md
AGENTS.md
```

## Inputs required

```txt
[ ] 01-FIGMA-TRIAGE-HANDOFF.md
[ ] 02-PROJECT-CONTRACT.md
[ ] Runtime entry map
[ ] Route map
[ ] Layer ownership
[ ] First safe patch
```

## Allowed

```txt
[ ] Create/update architecture docs.
[ ] Create/update AGENTS.md.
[ ] Document current graph.
[ ] Document target graph.
[ ] Document where new code belongs.
[ ] Document agent stop conditions.
```

## Forbidden

```txt
[ ] Runtime code changes.
[ ] Component extraction.
[ ] Game core extraction.
[ ] PixiJS integration.
[ ] Dependency cleanup.
[ ] UI redesign.
```

## Definition of Done

```txt
[ ] ARCHITECTURE.md describes current architecture.
[ ] ARCHITECTURE.md labels target/planned/unknown clearly.
[ ] AGENTS.md defines analysis-only default.
[ ] AGENTS.md defines small-patch-refactor mode.
[ ] AGENTS.md defines allowed files are strict.
[ ] AGENTS.md defines stop conditions.
[ ] AGENTS.md defines verification/report format.
```

## Stop conditions

```txt
[ ] Current architecture cannot be determined.
[ ] Runtime and target architecture conflict.
[ ] Agent rules would require code changes to be truthful.
```

If stopped:

```txt
Document Unknowns.
Do not guess.
Return to audit.
```

---

# 8. PHASE 3 — Design Contract + Design Gate

## Goal

Khóa design source of truth và gate kiểm tra UI patch.

Outputs:

```txt
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
```

## Inputs required

```txt
[ ] Figma frame or design source.
[ ] Existing app UI.
[ ] Project type.
[ ] Screen type.
[ ] Product intent.
[ ] Layout hierarchy.
```

## Allowed

```txt
[ ] Document design intent.
[ ] Document visual hierarchy.
[ ] Document layout rules.
[ ] Document color/token/typography rules.
[ ] Document game-first rules.
[ ] Document UI patch checklist.
```

## Forbidden

```txt
[ ] UI code changes.
[ ] CSS changes.
[ ] Component restyle.
[ ] Layout implementation.
[ ] Game logic changes.
[ ] PixiJS changes.
```

## Definition of Done

```txt
[ ] DESIGN.md states product type.
[ ] DESIGN.md states screen type.
[ ] DESIGN.md states visual hierarchy.
[ ] DESIGN.md states game-first rule if applicable.
[ ] DESIGN.md states what not to add.
[ ] DESIGN-APPLICATION-GATE.md checks UI patch scope.
[ ] DESIGN-APPLICATION-GATE.md checks visual drift.
[ ] DESIGN-APPLICATION-GATE.md checks responsive/game-first impact.
```

## Stop conditions

```txt
[ ] Design source unclear.
[ ] Figma and current UI conflict.
[ ] Product type unclear.
[ ] Game-first vs landing-page intent unclear.
```

If stopped:

```txt
Do not implement UI changes.
Ask for design decision or document alternatives.
```

---

# 9. PHASE 4 — Layout/Grid Stabilization

## Goal

Chuẩn hóa layout shell, grid, responsive order.

Không tách game logic ở phase này.  
Không apply PixiJS ở phase này.

## Inputs required

```txt
[ ] DESIGN.md
[ ] DESIGN-APPLICATION-GATE.md
[ ] PROJECT-CONTRACT.md
[ ] ARCHITECTURE.md
[ ] TASK-CONTRACT.md for this phase
```

## Allowed examples

```txt
[ ] App shell layout.
[ ] Game page layout.
[ ] CSS grid/flex wrapper.
[ ] Responsive order.
[ ] Layer z-index/pointer-events if layout-related.
[ ] TopNav/Footer positioning if scoped.
```

## Forbidden examples

```txt
[ ] Game rules.
[ ] Score formula.
[ ] Core logic.
[ ] Firebase/localStorage.
[ ] PixiJS app lifecycle.
[ ] Texture/sprite logic.
[ ] Dependency cleanup.
[ ] Component extraction beyond layout shell.
```

## Expected result

For game-first product:

```txt
[ ] Game board/canvas is primary.
[ ] HUD remains visible.
[ ] Panels/dashboard are secondary.
[ ] Mobile shows game first.
[ ] Footer/topnav do not create landing-page feel.
```

## Verification

```bash
npm run typecheck
npm test
npm run build
git diff --check
git status --short
git diff --stat
```

Only run commands that exist.

## Manual checks

```txt
[ ] Desktop layout OK.
[ ] Tablet layout OK.
[ ] Mobile layout OK.
[ ] Game still starts.
[ ] UI overlays still clickable.
[ ] Canvas does not block modal/panel clicks.
```

## Definition of Done

```txt
[ ] Only allowed layout files changed.
[ ] Game behavior unchanged.
[ ] Design gate PASS.
[ ] No core/render/data/audio changes.
[ ] Build/typecheck/test pass if available.
[ ] Phase report complete.
```

---

# 10. PHASE 5 — Component Extraction

## Goal

Tách component theo ownership, không tách theo từng div/pixel.

## Inputs required

```txt
[ ] ARCHITECTURE.md
[ ] PROJECT-CONTRACT.md
[ ] DESIGN.md
[ ] DESIGN-APPLICATION-GATE.md
[ ] TASK-CONTRACT.md
```

## Good extraction targets

```txt
[ ] HUD.
[ ] Game over overlay.
[ ] Login modal.
[ ] Settings panel.
[ ] Dashboard/stats panel.
[ ] Footer.
[ ] Button primitives.
[ ] Panel primitives.
```

## Bad extraction targets

```txt
[ ] Every div.
[ ] Every decorative pixel.
[ ] Generated giant component all at once.
[ ] Mixed UI + gameplay extraction.
[ ] UI component that starts owning business/game logic.
```

## Allowed

```txt
[ ] Move JSX into smaller components.
[ ] Move static content into content files if scoped.
[ ] Preserve props and visual behavior.
[ ] Extract UI primitives only if truly reusable.
```

## Forbidden

```txt
[ ] Change gameplay.
[ ] Change score/save flow.
[ ] Change PixiJS lifecycle.
[ ] Change routing.
[ ] Delete generated/scaffold files.
[ ] Add dependencies.
[ ] Convert normal UI to PixiJS.
```

## Definition of Done

```txt
[ ] Component ownership is clearer.
[ ] Parent component is smaller.
[ ] Visual behavior preserved.
[ ] Props are explicit.
[ ] No gameplay logic moved into UI components.
[ ] Design gate PASS.
[ ] Build/typecheck/test pass if available.
[ ] Phase report complete.
```

---

# 11. PHASE 6 — Game Core Extraction

## Goal

Tách gameplay logic thành pure core.

Đây là phase quan trọng trước khi PixiJS/render layer phình to.

## Inputs required

```txt
[ ] PROJECT-CONTRACT.md
[ ] ARCHITECTURE.md
[ ] Current gameplay files
[ ] TASK-CONTRACT.md
```

## Target files

Typical target:

```txt
src/game/core.ts
src/game/types.ts
src/game/config.ts
src/game/*.test.ts
```

## Core owns

```txt
[ ] Game state shape.
[ ] Initial state.
[ ] State transition.
[ ] Score rule.
[ ] Win/lose rule.
[ ] Valid/invalid action.
[ ] Pure helpers.
[ ] Deterministic config.
```

## Core must not own

```txt
[ ] React.
[ ] PixiJS.
[ ] DOM event.
[ ] window/document.
[ ] localStorage/sessionStorage.
[ ] Firebase/API.
[ ] Audio.
[ ] CSS/UI components.
```

## Sub-phase recommendation

For existing messy game:

```txt
6A — Extract shared types.
6B — Extract pure helpers.
6C — Extract state transition.
6D — Extract scoring/win/lose.
6E — Add core tests.
6F — Code graph gate.
```

## Forbidden

```txt
[ ] UI polish.
[ ] PixiJS lifecycle changes.
[ ] Firebase changes.
[ ] Audio changes.
[ ] Dependency cleanup.
[ ] Major layout changes.
```

## Verification

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

Targeted checks:

```bash
rg -n "from .*react|from .*pixi|firebase|localStorage|window|document|Audio|audio-manager" src/game
```

Expected:

```txt
Clean / No forbidden core imports.
```

## Definition of Done

```txt
[ ] Core exists or is cleaner.
[ ] Core has no forbidden imports.
[ ] UI/render calls core instead of duplicating rules.
[ ] Tests exist for pure logic if possible.
[ ] Gameplay behavior unchanged unless task explicitly changed it.
[ ] Code graph gate PASS.
[ ] Phase report complete.
```

---

# 12. PHASE 7 — PixiJS Render Integration

## Goal

Apply PixiJS only to game/render layer when needed.

PixiJS is not a UI cleanup tool.  
PixiJS is not for navbar/modal/footer/dashboard text.  
PixiJS is for game board, canvas, sprite, effect, animation-heavy runtime.

## Inputs required

```txt
[ ] Core/game truth already clear.
[ ] PROJECT-CONTRACT.md
[ ] ARCHITECTURE.md
[ ] DESIGN.md
[ ] TASK-CONTRACT.md
```

## Allowed target files

Typical:

```txt
src/features/game/render/usePixiApp.ts
src/features/game/render/useFruitTextures.ts
src/features/game/render/useFruitSprites.ts
src/features/game/render/useParticleSystem.ts
src/features/game/render/useGameFeedback.ts
src/features/game/render/useSliceEffects.ts
src/components/game/GameBoard.tsx
src/components/game/FruitGame.tsx only as wiring shell
```

## Render owns

```txt
[ ] Pixi Application/canvas.
[ ] Stage/layers.
[ ] Resize/DPR lifecycle.
[ ] Textures/assets.
[ ] Sprites.
[ ] Particles/effects.
[ ] Render sync from game state.
```

## Render must not own

```txt
[ ] Gameplay truth.
[ ] Score saving.
[ ] Firebase/localStorage.
[ ] Route behavior.
[ ] React modal logic.
[ ] Static content/copy.
```

## Sub-phase recommendation

```txt
7A — Stabilize Pixi app lifecycle.
7B — Stabilize texture/asset lifecycle.
7C — Stabilize sprite sync.
7D — Stabilize particles/effects.
7E — Stabilize feedback/screen shake.
7F — Final render graph/lifecycle gate.
```

## Forbidden

```txt
[ ] Normal UI in PixiJS.
[ ] Gameplay rules in PixiJS.
[ ] Firebase/localStorage in render hooks.
[ ] Global resource cleanup by default.
[ ] Destroying shared textures blindly.
[ ] Setting React state every frame.
[ ] Duplicating ticker/listeners after replay/remount.
```

## Verification

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

Targeted checks:

```bash
rg -n "from .*firebase|from .*useScoreData|localStorage|audio-manager|GamePage|App" src/features/game/render
rg -n "ticker.add|ticker.remove|addEventListener|removeEventListener|destroy\\(" src/features/game/render src/components/game
```

Manual checks:

```txt
[ ] Game starts.
[ ] Replay works.
[ ] Resize works.
[ ] Mobile input works.
[ ] No black texture/canvas issue.
[ ] No duplicate ticker/listener.
[ ] No console crash/spam.
[ ] Overlay/panel z-index still works.
```

## Definition of Done

```txt
[ ] PixiJS owns render only.
[ ] Core still owns game truth.
[ ] React still owns UI.
[ ] Render hooks clean up owned resources.
[ ] No forbidden imports.
[ ] Lifecycle gate PASS.
[ ] Manual smoke PASS.
[ ] Phase report complete.
```

---

# 13. PHASE 8 — Cleanup

## Goal

Dọn unused imports, scaffold, chunks, dependencies.

Cleanup chỉ làm sau khi runtime, architecture, design, core, render đã ổn.

## Cleanup order

```txt
8A — Unused imports/local dead code.
8B — Scaffold quarantine report.
8C — Move scaffold to _unused only with approval.
8D — Dependency usage proof.
8E — Remove dependencies only in dedicated patch.
8F — Chunk/bundle cleanup.
8G — Final cleanup verification.
```

## Allowed

```txt
[ ] Remove unused imports.
[ ] Remove unreachable local variables.
[ ] Quarantine scaffold with approval.
[ ] Remove dependency only after proof.
[ ] Update lockfile only in dependency cleanup patch.
```

## Forbidden

```txt
[ ] Delete scaffold immediately after triage.
[ ] Remove dependencies in same patch as file move.
[ ] Remove dependency because it “looks unused”.
[ ] Delete generated files without approval.
[ ] Change gameplay/UI while cleaning.
[ ] Change build config to hide issues.
```

## Dependency cleanup requires

```txt
[ ] Runtime import check.
[ ] Scaffold import check.
[ ] package.json usage check.
[ ] Build pass.
[ ] Typecheck/test pass if available.
[ ] Dedicated cleanup task.
```

## Definition of Done

```txt
[ ] Cleanup scope is isolated.
[ ] No gameplay/UI behavior changed.
[ ] Deleted/moved files are justified.
[ ] Dependency removal is proven.
[ ] Build/typecheck/test pass if available.
[ ] git diff is narrow.
[ ] Phase report complete.
```

---

# 14. PHASE 9 — Final Gate

## Goal

Chứng minh project đã sạch, build-safe, architecture-safe, design-safe.

## Gates

```txt
[ ] Scope gate.
[ ] Build/typecheck/test gate.
[ ] Code graph gate.
[ ] Lifecycle gate.
[ ] Design gate.
[ ] Game behavior gate.
[ ] Responsive/manual smoke gate.
[ ] Dependency cleanup gate.
[ ] Final report gate.
```

## Verification commands

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

## Code graph checks

```txt
[ ] core has no React/Pixi/Firebase/window/localStorage/audio import.
[ ] render has no Firebase/score persistence import.
[ ] input has no score persistence import.
[ ] data layer does not import UI components.
[ ] UI primitives do not import game-specific mutation logic.
[ ] no circular dependencies.
[ ] no forbidden reverse references.
```

## Manual game checks

```txt
[ ] Game starts.
[ ] Game can be played.
[ ] Replay works.
[ ] Game over works once.
[ ] Score updates.
[ ] Save/leaderboard flow unaffected.
[ ] Desktop input works.
[ ] Mobile input works.
[ ] Resize works.
[ ] Overlay/panels clickable.
[ ] Console clean.
```

## Final status

```txt
Final status:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
```

A project is not final-PASS if:

```txt
[ ] Build/typecheck/test fails due to patch.
[ ] Forbidden dependency edges remain.
[ ] Game behavior broken.
[ ] UI drifted from DESIGN.md.
[ ] Unexpected files changed.
[ ] Cleanup deleted unverified runtime files.
```

---

# 15. How To Choose The Next Phase

Use this decision tree.

## If project has not been triaged

```txt
Go to PHASE 0.
```

## If triage exists but no contract

```txt
Go to PHASE 1.
```

## If contract exists but no architecture/agent rules

```txt
Go to PHASE 2.
```

## If architecture exists but no design source of truth

```txt
Go to PHASE 3.
```

## If UI is messy but gameplay works

```txt
Go to PHASE 4 or PHASE 5.
```

## If gameplay logic is mixed into UI/render

```txt
Go to PHASE 6 before heavy PixiJS/render refactor.
```

## If core is clean but render is unstable or DOM render is insufficient

```txt
Go to PHASE 7.
```

## If app is stable but bloated

```txt
Go to PHASE 8.
```

## If all phases are done

```txt
Go to PHASE 9.
```

---

# 16. Phase Completion Rule

A phase is complete only when:

```txt
[ ] All allowed tasks are done.
[ ] All forbidden changes avoided.
[ ] Verification commands run or unavailable scripts reported.
[ ] Code graph gate PASS if applicable.
[ ] Design gate PASS if UI task.
[ ] Manual behavior PASS if game task.
[ ] PHASE-REPORT.md completed.
[ ] User approves moving to the next phase.
```

If any item fails:

```txt
Phase status = FAIL or BLOCKED.
Do not proceed.
```

---

# 17. Patch Size Rule

Small patch target:

```txt
[ ] 1 goal.
[ ] 1 layer.
[ ] 1 small file group.
[ ] Ideally 1-5 files.
[ ] No unrelated cleanup.
```

If patch needs more than 5 files:

```txt
Split into sub-phases.
```

Exceptions:

```txt
[ ] Mechanical import update after approved move.
[ ] Test files directly related to the same core logic.
[ ] CSS file directly paired with component layout change.
```

---

# 18. Sub-phase Rule

Use sub-phases when a phase touches runtime/game/render logic.

Example:

```txt
PHASE 6A — Extract types
PHASE 6B — Extract pure helpers
PHASE 6C — Extract state transitions
PHASE 6D — Add core tests
PHASE 6E — Final core graph gate
```

Each sub-phase must report:

```txt
1. Sub-phase summary
2. Files changed
3. New files created
4. Dependency graph before/after
5. Code graph result
6. Verification command results
7. Manual behavior result if applicable
8. Remaining risks
9. Sub-phase PASS/FAIL
```

Do not proceed to next sub-phase unless current sub-phase is PASS.

---

# 19. Phase Report Requirement

Every phase must end with:

```txt
templates/PHASE-REPORT.md
```

Required report:

```txt
# Phase Report

## Phase

## Status
PASS / FAIL / BLOCKED

## Changed files

## Why each file changed

## Scope result

## Behavior preserved

## Design compliance, if UI task

## Architecture/ownership result

## Forbidden dependency edge check

## Commands run

## Results

## Unexpected changes

## Risks / follow-up

## Next recommended patch
```

If no report:

```txt
Phase is not complete.
```

---

# 20. Common Wrong Orders

Avoid these orders.

## Wrong: PixiJS too early

```txt
Figma triage
-> layout cleanup
-> apply PixiJS
-> later extract game logic
```

Why wrong:

```txt
PixiJS may absorb gameplay logic.
Render becomes source of truth.
Core extraction becomes harder.
```

Better:

```txt
Figma triage
-> contract
-> layout/component cleanup
-> core extraction
-> PixiJS render integration
```

---

## Wrong: dependency cleanup too early

```txt
Figma triage
-> delete unused deps
-> refactor components
```

Why wrong:

```txt
Generated/scaffold code can distort dependency usage.
Reachable runtime must be proven first.
Build must pass after cleanup.
```

Better:

```txt
Triage
-> reachable/scaffold map
-> stable architecture
-> dedicated dependency cleanup patch
```

---

## Wrong: UI and gameplay together

```txt
Fix mobile layout + change scoring + cleanup Firebase
```

Why wrong:

```txt
Impossible to verify cause/effect.
High regression risk.
```

Better:

```txt
Patch 1: mobile layout only
Patch 2: scoring rule only
Patch 3: Firebase cleanup only
```

---

## Wrong: full Phase prompt too big

```txt
Do all Phase 2: session, trail, pointer, ticker, controller, cleanup.
```

Why wrong:

```txt
Agent may proceed beyond safe sub-phase.
Diff becomes hard to audit.
One failure contaminates entire phase.
```

Better:

```txt
Do Phase 2A only.
Stop after Phase 2A report.
Do not proceed to 2B.
```

---

# 21. Recommended Prompt Prefix For Every Phase

Use this at the start of every phase prompt:

```txt
You are working on one phase only.

Do not proceed to the next phase.
Do not fix unrelated issues.
Do not edit files outside Allowed files.
Checklist items do not expand Allowed files.
If an issue is out of scope, report it as follow-up.
Preserve current visual design.
Preserve current gameplay behavior.
Run available verification commands.
Return a phase report.
```

---

# 22. Final Rule

```txt
PHASE-PLAYBOOK.md tells what to do next.
TASK-CONTRACT.md controls the current patch.
PHASE-REPORT.md proves what actually happened.
```

Never skip this chain:

```txt
Phase selected
-> Task contract
-> Small patch
-> Verification
-> Phase report
-> User approval
-> Next phase
```