# 00 — README-WORKFLOW.md

File này là bản đồ tổng cho workflow làm game / Figma Make / React / PixiJS.

Mở file này đầu tiên trước khi audit, refactor, chỉnh UI, apply PixiJS, cleanup dependency, debug lỗi runtime, hoặc giao task cho AI agent.

---

# 0. Primary Rule

```txt
Không sửa code trước khi biết:
- Project thật sự là loại gì.
- Runtime thật chạy từ đâu.
- File nào reachable.
- File nào scaffold.
- Design source of truth là gì.
- Architecture boundary nằm đâu.
- Agent được sửa file nào.
- Behavior nào phải giữ.
- Verify bằng command nào.
```

Nếu chưa rõ các mục trên:

```txt
Audit first.
Do not refactor.
Do not cleanup.
Do not apply PixiJS.
Do not add feature.
Do not debug by guessing.
```

---

# 1. Folder Structure

```txt
docs/
  00-README-WORKFLOW.md
  01-FIGMA-TRIAGE-HANDOFF.md
  02-PROJECT-CONTRACT.md
  03-ARCHITECTURE.md
  04-AGENTS.md                         # optional mirror of root AGENTS.md
  05-DESIGN.md
  06-DESIGN-APPLICATION-GATE.md
  07-PHASE-PLAYBOOK.md
  08-VERIFICATION-GATES.md
  09-PROMPTS.md
  10-ADR.md
  11-DEBUG-RUNBOOK.md
  12-REFACTOR-EXECUTION-PLAN.md

AGENTS.md                               # official agent rules, should be at repo root

templates/
  TASK-CONTRACT.md
  PHASE-REPORT.md

reports/
  .gitkeep
```

Note:

```txt
AGENTS.md nên đặt ở root repo.
docs/04-AGENTS.md chỉ là bản mirror nếu muốn lưu chung trong docs/.
Bản chính mà agent nên đọc là root AGENTS.md.
```

---

# 2. What Each File Does

## 00 — README-WORKFLOW.md

```txt
Bản đồ tổng.
Cho biết phải đọc file nào, làm phase nào trước, khi nào được refactor, khi nào debug, và khi nào cleanup.
```

## 01 — FIGMA-TRIAGE-HANDOFF.md

```txt
Nhận kết quả từ figma-make-triage.
Chuyển triage report thành quyết định:
- project type
- strategy
- runtime map
- reachable/scaffold map
- dependency usage
- first safe patch
```

## 02 — PROJECT-CONTRACT.md

```txt
Khóa luật project.
Nói cái gì không được phá:
- gameplay
- route
- UI
- render/PixiJS
- data/storage
- audio
- dependency
```

## 03 — ARCHITECTURE.md

```txt
Vẽ kiến trúc project.
Nói code nằm ở đâu:
- core
- runtime
- input
- render/PixiJS
- UI
- data/storage
- audio
```

## AGENTS.md / 04-AGENTS.md

```txt
Luật cho AI agent.
Nói agent phải hành xử thế nào:
- default analysis-only
- allowed files strict
- stop if out-of-scope
- no destructive fixes
- no automatic next phase
- verify before PASS
```

## 05 — DESIGN.md

```txt
Design source of truth.
Nói UI phải trông như thế nào:
- product type
- screen type
- visual hierarchy
- theme/vibe
- tokens
- typography
- layout rules
- component rules
- game-first rule
```

## 06 — DESIGN-APPLICATION-GATE.md

```txt
Checklist mỗi lần chỉnh UI/component/layout.
Chống UI drift:
- game thành landing page
- game board bị mất spotlight
- hard-code màu/font/spacing
- UI patch sửa nhầm gameplay
```

## 07 — PHASE-PLAYBOOK.md

```txt
Thứ tự phase chuẩn.
Không cho agent nhảy phase hoặc làm nhiều layer cùng lúc.
```

## 08 — VERIFICATION-GATES.md

```txt
Gate kiểm tra:
- scope
- dirty tree
- build/test/typecheck
- import graph
- architecture boundary
- lifecycle
- design
- gameplay
- data/storage
- audio
- manual smoke
- final report
```

## 09 — PROMPTS.md

```txt
Kho prompt copy-paste.
Dùng cho:
- triage
- handoff
- contract
- architecture
- agents
- design
- layout
- component
- core
- PixiJS
- data
- audio
- cleanup
- debug
- final gate
```

## 10 — ADR.md

```txt
Architecture Decision Record.
Ghi lại vì sao project chọn quyết định kiến trúc đó:
- core pure
- React owns UI
- PixiJS owns render
- game-first is not landing page
- cleanup happens late
- unknowns must stay unknown
```

## 11 — DEBUG-RUNBOOK.md

```txt
Runbook debug lỗi.
Dùng khi gặp:
- blank screen
- Vite websocket disconnect
- build/typecheck fail
- passive event listener warning
- PixiJS black texture
- duplicate ticker/listener/canvas
- mobile input lỗi
- overlay bị canvas chặn
- Firebase/save score lỗi
- audio không phát
- UI drift
```

## 12 — REFACTOR-EXECUTION-PLAN.md

```txt
Bản kế hoạch tổng hợp để bắt đầu refactor code thật.
Nối toàn bộ docs/gates/prompts thành chuỗi hành động:
- chọn first patch
- tạo task contract
- patch một layer
- verify
- report
- stop
```

## templates/TASK-CONTRACT.md

```txt
Mẫu giao việc cho một patch.
Không có task contract thì chưa được sửa code.
```

## templates/PHASE-REPORT.md

```txt
Mẫu report sau phase/patch.
Không có phase report thì chưa coi phase là xong.
```

## reports/

```txt
Lưu lịch sử thực thi thật sau mỗi phase/patch.
Không để report lẫn vào docs source-of-truth.
```

---

# 3. Standard Workflow

Luôn đi theo thứ tự này:

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

Support docs:

```txt
ADR
= vì sao chọn kiến trúc đó.

Debug runbook
= khi bug thì debug theo quy trình.

Refactor execution plan
= khi bắt đầu sửa code thật thì theo kế hoạch tổng hợp.
```

---

# 4. When To Use Figma Triage

Use Figma triage when project comes from:

```txt
[ ] Figma Make
[ ] Figma-to-code
[ ] Design-to-code
[ ] AI-generated UI export
[ ] Generated React UI
[ ] Visual prototype export
```

Default mode:

```txt
analysis-only
```

During analysis-only:

```txt
[ ] Do not modify files.
[ ] Do not move files.
[ ] Do not rename files.
[ ] Do not delete files.
[ ] Do not install packages.
[ ] Do not run formatters/fixers.
[ ] Do not cleanup dependencies.
[ ] Do not add features.
[ ] Do not apply PixiJS.
```

Required output:

```txt
Figma Make Triage Report
```

It must include:

```txt
1. Executive decision
2. Runtime entry map
3. Route map
4. Reachable file list
5. Non-runtime/scaffold candidates
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

---

# 5. When To Create Project Contract

Create `docs/02-PROJECT-CONTRACT.md` after:

```txt
[ ] Triage report exists.
[ ] Runtime path is known.
[ ] Route map is known or single-screen confirmed.
[ ] Reachable/scaffold map exists.
[ ] Project type is selected.
[ ] First safe patch is proposed.
```

Project contract locks:

```txt
[ ] Runtime behavior.
[ ] Product type.
[ ] Gameplay behavior.
[ ] UI behavior.
[ ] Render/PixiJS boundary.
[ ] Data/storage boundary.
[ ] Audio boundary.
[ ] Forbidden dependencies.
[ ] Default forbidden files.
[ ] Stop conditions.
```

Do not refactor if project contract is missing.

---

# 6. When To Create Architecture.md

Create `docs/03-ARCHITECTURE.md` after project contract.

Architecture.md should document:

```txt
[ ] Runtime entry map.
[ ] Route map.
[ ] Current architecture graph.
[ ] Target architecture graph.
[ ] Layer ownership.
[ ] Game state flow.
[ ] Input flow.
[ ] Render flow.
[ ] UI flow.
[ ] Score/data flow.
[ ] Audio flow.
[ ] File map.
[ ] Component map.
[ ] Dependency architecture.
[ ] Known risks.
[ ] Unknowns.
[ ] Where new code should go.
```

Important:

```txt
ARCHITECTURE.md describes where code belongs.
It is not agent rules.
It is not design rules.
It is not a patch plan.
```

Use labels:

```txt
Current:
Target:
Planned:
Deprecated:
Unknown:
```

Do not describe future files as if they already exist.

---

# 7. When To Create AGENTS.md

Create root `AGENTS.md` after project contract and architecture.

AGENTS.md should define:

```txt
[ ] Files agent must read first.
[ ] Default mode: analysis-only.
[ ] Mode switch to small-patch-refactor.
[ ] Allowed files are strict.
[ ] Checklist does not expand allowed files.
[ ] Stop conditions.
[ ] No destructive fixes.
[ ] Git safety.
[ ] Command safety.
[ ] Architecture boundaries.
[ ] Game-first rules.
[ ] Design rules for UI tasks.
[ ] PixiJS rules.
[ ] Dependency rules.
[ ] Report format.
[ ] Definition of done.
```

AGENTS.md is operational.

It tells AI agents:

```txt
How to behave before, during, and after editing.
```

---

# 8. When To Create Design.md

Create `docs/05-DESIGN.md` before UI/component/layout work.

DESIGN.md should define:

```txt
[ ] Product design intent.
[ ] Screen type.
[ ] Visual hierarchy.
[ ] Layout contract.
[ ] Figma/design references.
[ ] Theme/vibe.
[ ] Color tokens.
[ ] Typography.
[ ] Spacing/radius/shadow/border.
[ ] Surface/panel system.
[ ] Component design rules.
[ ] Content/copy rules.
[ ] Motion/animation.
[ ] Responsive behavior.
[ ] Accessibility/usability.
[ ] Do not add.
[ ] Design drift risks.
```

For game-first apps, it must say:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
TopNav, Footer, Dashboard, stats, and panels are supporting UI only.
Do not add hero sections, marketing CTA, feature cards, or long landing scroll unless explicitly requested.
```

---

# 9. When To Use Design Application Gate

Use `docs/06-DESIGN-APPLICATION-GATE.md` for any task touching:

```txt
[ ] layout
[ ] component extraction
[ ] responsive behavior
[ ] visual polish
[ ] HUD
[ ] panels
[ ] modal
[ ] button
[ ] footer
[ ] topnav
[ ] game screen composition
[ ] Figma design application
```

The gate checks:

```txt
[ ] Product type preserved.
[ ] Game-first hierarchy preserved.
[ ] Design source clear.
[ ] Visual hierarchy preserved.
[ ] Layout/grid safe.
[ ] Component ownership correct.
[ ] Tokens used.
[ ] No UI drift.
[ ] Gameplay not changed in UI-only patch.
[ ] Responsive behavior preserved.
```

Remember:

```txt
DESIGN.md = design law.
DESIGN-APPLICATION-GATE.md = patch checklist.
```

---

# 10. When To Use ADR.md

Use `docs/10-ADR.md` when the project makes or changes a major architecture decision.

Create or update an ADR for decisions like:

```txt
[ ] Core remains pure.
[ ] React owns UI.
[ ] PixiJS owns render runtime.
[ ] Game-first UI is not a landing page.
[ ] Score saving is non-blocking.
[ ] Cleanup happens late.
[ ] Reports are execution history.
[ ] Unknowns must stay unknown.
```

ADR format:

```txt
Context:
Decision:
Reason:
Consequences:
Allowed changes:
Forbidden changes:
Related files:
```

Rule:

```txt
Do not change accepted architecture silently.
If a decision changes, create a new ADR or mark the old ADR as Replaced.
```

---

# 11. When To Use Debug Runbook

Use `docs/11-DEBUG-RUNBOOK.md` when there is an actual bug or regression.

Use it for:

```txt
[ ] blank screen
[ ] Vite server/websocket issue
[ ] build/typecheck fail
[ ] runtime console error
[ ] PixiJS black screen/black texture
[ ] duplicate ticker/listener/canvas
[ ] replay stale state
[ ] mobile swipe/touch/drag not working
[ ] overlay/modal blocked by canvas
[ ] save score/Firebase/localStorage bug
[ ] audio not playing
[ ] UI drift
```

Debug flow:

```txt
1. Reproduce.
2. Classify.
3. Locate owner layer.
4. Inspect exact files.
5. Identify root cause.
6. Create small fix plan.
7. Patch only allowed files.
8. Run verification.
9. Manual smoke test.
10. Write debug report.
```

Rule:

```txt
Debug first.
Patch second.
Verify third.
Report last.
```

---

# 12. When To Use Refactor Execution Plan

Use `docs/12-REFACTOR-EXECUTION-PLAN.md` when moving from docs into real code refactor.

Use it after these are ready:

```txt
[ ] 01-FIGMA-TRIAGE-HANDOFF.md
[ ] 02-PROJECT-CONTRACT.md
[ ] 03-ARCHITECTURE.md
[ ] AGENTS.md
[ ] 05-DESIGN.md, if UI is involved
[ ] 06-DESIGN-APPLICATION-GATE.md, if UI is involved
[ ] 07-PHASE-PLAYBOOK.md
[ ] 08-VERIFICATION-GATES.md
[ ] templates/TASK-CONTRACT.md
[ ] templates/PHASE-REPORT.md
```

Execution order:

```txt
Patch 1: Layout/Grid Stabilization.
Patch 2: Component Extraction.
Patch 3: Game Core Extraction.
Patch 4: Runtime/Input Stabilization.
Patch 5: PixiJS Render Stabilization.
Patch 6: Data/Score Boundary.
Patch 7: Audio Boundary.
Patch 8: Cleanup.
Patch 9: Final Gate.
```

Rule:

```txt
Refactor only begins after workflow docs are ready.
Do not refactor by instinct.
Do not think and patch at the same time.
```

---

# 13. When To Start Code Refactor

Only start code refactor when these are ready:

```txt
[ ] Triage report exists, if Figma/design-to-code project.
[ ] 01-FIGMA-TRIAGE-HANDOFF.md complete.
[ ] 02-PROJECT-CONTRACT.md complete.
[ ] 03-ARCHITECTURE.md complete.
[ ] AGENTS.md complete.
[ ] 05-DESIGN.md complete if UI task.
[ ] 06-DESIGN-APPLICATION-GATE.md complete if UI task.
[ ] 12-REFACTOR-EXECUTION-PLAN.md complete.
[ ] TASK-CONTRACT.md created for current patch.
```

Before editing, agent must output:

```txt
Mode:
Goal:
Files to touch:
Files not to touch:
Behavior to preserve:
Validation commands:
Stop conditions:
```

No editing before this is clear.

---

# 14. Standard Patch Loop

Every patch follows:

```txt
1. Read relevant docs.
2. Read TASK-CONTRACT.md.
3. Check git status --short.
4. Inspect current files.
5. State patch plan.
6. List exact files to touch.
7. State behavior to preserve.
8. Apply only the patch.
9. Run verification commands if available.
10. Run gate checks.
11. Run git diff --check.
12. Run git status --short.
13. Run git diff --stat.
14. Write patch/phase report.
15. Recommend next patch.
16. Stop.
```

Do not proceed automatically.

---

# 15. Default Forbidden Files

Do not edit these unless explicitly allowed:

```txt
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
vite.config.ts
tsconfig.json
eslint.config.*
global CSS/theme files
tests/*
docs/*
generated assets
public/*
.env
.env.*
```

Rules:

```txt
[ ] Do not add dependencies unless explicitly allowed.
[ ] Do not remove dependencies unless this is a cleanup task.
[ ] Do not change lockfile unless package.json intentionally changes.
[ ] Do not edit tests just to fake pass.
[ ] Do not change config to hide errors.
```

---

# 16. Universal Stop Conditions

Stop and report if:

```txt
[ ] Required file is outside Allowed files.
[ ] Fix requires changing gameplay but task is UI-only.
[ ] Fix requires changing UI but task is core-only.
[ ] Fix requires changing render/PixiJS but task is core-only.
[ ] Fix requires changing Firebase/storage but task is UI/render-only.
[ ] Dependency change seems necessary.
[ ] Config change seems necessary.
[ ] Test expected behavior must change.
[ ] Baseline build/test fails due to unrelated errors.
[ ] More than 5 files need changes for a small patch.
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

# 17. Game Architecture Mental Model

For game projects:

```txt
Core = gameplay truth.
Runtime = session/timer/replay orchestration.
Input = keyboard/pointer/touch normalization.
Render/PixiJS = canvas/sprites/effects/render sync.
React UI = layout/HUD/modal/panel.
Data/storage = Firebase/API/localStorage/leaderboard.
Audio = BGM/SFX/mute/unlock.
```

Forbidden:

```txt
[ ] Core imports React/PixiJS/Firebase/window/localStorage/audio.
[ ] UI calculates gameplay rules.
[ ] PixiJS saves score.
[ ] Input saves score.
[ ] Data imports UI component.
[ ] Audio exists inside core.
```

---

# 18. PixiJS Rule

PixiJS is allowed for:

```txt
[ ] game board/canvas
[ ] sprite-heavy scene
[ ] particles/effects
[ ] high-frequency render loop
[ ] animation-heavy runtime
```

PixiJS is not for:

```txt
[ ] navbar
[ ] button
[ ] modal
[ ] form
[ ] footer
[ ] dashboard text
[ ] normal layout grid
```

Order:

```txt
Do not apply PixiJS before core/game truth is clear.
```

Correct order:

```txt
layout/component cleanup
-> game core extraction
-> PixiJS render integration
```

Wrong order:

```txt
layout cleanup
-> PixiJS
-> later extract game logic
```

Why wrong:

```txt
PixiJS may absorb gameplay logic.
Render becomes source of truth.
Core extraction becomes harder.
```

---

# 19. Cleanup Rule

Cleanup is late.

Do not cleanup dependencies/scaffold early.

Cleanup order:

```txt
1. Prove runtime/reachable files.
2. Prove scaffold/non-runtime files.
3. Stabilize architecture.
4. Stabilize build/test.
5. Cleanup unused imports.
6. Quarantine scaffold with approval.
7. Remove dependencies only in dedicated cleanup patch.
8. Verify build/typecheck/test.
```

Do not:

```txt
[ ] Delete scaffold immediately after triage.
[ ] Remove dependency because it looks unused.
[ ] Remove dependencies during component extraction.
[ ] Change package.json during layout/core/render patch.
```

---

# 20. Verification Summary

Use `docs/08-VERIFICATION-GATES.md`.

Common commands:

```bash
npm run typecheck
npm test
npm run build
npm run lint
git diff --check
git status --short
git diff --stat
```

Only run scripts that exist.

If script does not exist:

```txt
Report: NOT AVAILABLE.
Do not invent a new script.
```

Core checks:

```txt
[ ] core has no React/Pixi/Firebase/browser/audio import.
[ ] render has no persistence/data dependency.
[ ] input has no persistence dependency.
[ ] data layer does not import UI components.
[ ] UI primitives do not import game-specific mutation logic.
[ ] no circular dependencies.
```

Manual game checks:

```txt
[ ] game starts.
[ ] game can be played.
[ ] score updates.
[ ] game over works.
[ ] replay works.
[ ] desktop input works.
[ ] mobile input works.
[ ] save/leaderboard flow unaffected.
[ ] no duplicate ticker/listener/canvas after replay/remount.
[ ] console has no crash/spam.
```

---

# 21. Reports Folder Rule

Use `reports/` to store real execution history.

Examples:

```txt
reports/
  2026-06-24-phase-0-triage.md
  2026-06-24-phase-1-contract.md
  2026-06-24-phase-4-layout.md
  2026-06-24-phase-6-core.md
  2026-06-24-phase-7-pixi.md
```

Rule:

```txt
docs/ = luật và source of truth.
templates/ = mẫu dùng lại.
reports/ = lịch sử agent đã làm gì.
AGENTS.md = luật vận hành cho AI agent.
```

Do not put phase reports randomly inside docs/.

---

# 22. Recommended Daily Workflow

When starting a new work session:

```txt
1. Read 00-README-WORKFLOW.md.
2. Check current phase in 07-PHASE-PLAYBOOK.md.
3. Read last report in reports/.
4. Read TASK-CONTRACT.md for current patch.
5. Check git status --short.
6. Confirm allowed files.
7. Patch one thing only.
8. Verify.
9. Report.
10. Stop.
```

---

# 23. Common Wrong Workflows

## Wrong: one giant prompt

```txt
Refactor UI, cleanup dependencies, apply PixiJS, add Firebase, fix mobile.
```

Why wrong:

```txt
Too many layers.
Impossible to verify.
High risk of breaking game.
```

Better:

```txt
Patch 1: layout only.
Patch 2: component extraction only.
Patch 3: core extraction only.
Patch 4: PixiJS render only.
Patch 5: cleanup only.
```

## Wrong: PixiJS too early

```txt
Figma triage
-> UI cleanup
-> PixiJS
-> core extraction later
```

Better:

```txt
Figma triage
-> contract
-> layout/component cleanup
-> core extraction
-> PixiJS render integration
```

## Wrong: dependency cleanup too early

```txt
Audit
-> delete unused dependencies immediately
```

Better:

```txt
Audit
-> reachable/scaffold proof
-> build stable
-> dedicated cleanup patch
```

## Wrong: UI and gameplay together

```txt
Fix mobile layout and change scoring.
```

Better:

```txt
Patch 1: mobile layout.
Patch 2: scoring.
```

## Wrong: debugging by deletion

```txt
Delete overlay/audio/save score/Pixi effect until the error disappears.
```

Better:

```txt
Use DEBUG-RUNBOOK.md.
Reproduce.
Locate owner layer.
Patch exact root cause.
Verify.
Report.
```

---

# 24. Final Mental Model

```txt
Figma triage tells what the project is.
Project contract tells what must not break.
Architecture tells where code belongs.
AGENTS tells how AI must behave.
Design tells what UI should look like.
Design gate prevents UI drift.
Phase playbook tells what to do next.
Verification gates prove the patch is safe.
Prompts make the workflow reusable.
ADR records why decisions exist.
Debug runbook fixes bugs without chaos.
Refactor execution plan turns docs into action.
Task contract controls the current patch.
Phase report records what actually happened.
Reports folder stores execution history.
```

Final rule:

```txt
If there is no contract, the task is not ready to edit.
If the phase is not PASS, do not proceed.
If an issue is out of scope, report it, do not patch it.
If the root cause is unknown, debug first, patch second.
```