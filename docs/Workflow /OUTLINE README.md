# Game / Figma / PixiJS Workflow Outline

## Folder structure

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

---

# 00 — README-WORKFLOW.md

Vai trò:

```txt
File mở đầu để biết toàn bộ workflow phải chạy theo thứ tự nào.
```

Nội dung chính:

```txt
1. Khi nào cần chạy Figma triage.
2. Khi nào cần tạo project contract.
3. Khi nào cần tạo architecture.
4. Khi nào cần tạo agents rules.
5. Khi nào cần apply design.
6. Khi nào mới bắt đầu refactor code.
7. Khi nào mới apply PixiJS.
8. Khi nào cleanup dependency/chunk.
9. Khi nào debug theo runbook.
10. Khi nào final gate.
```

Rule chính:

```txt
Không refactor trước khi biết:
- Project là loại gì.
- Runtime thật nằm đâu.
- Layer ownership ra sao.
- Design source of truth là gì.
- Agent được sửa file nào.
- Behavior nào phải giữ.
- Verify bằng gì.
```

---

# 01 — FIGMA-TRIAGE-HANDOFF.md

Vai trò:

```txt
Nhận kết quả từ skill figma-make-triage và chuyển thành quyết định refactor.
```

Dùng sau khi đã có:

```txt
Figma Make Triage Report
hoặc output từ triage_figma_export.py
hoặc manual triage report đủ bằng chứng.
```

Nội dung chính:

```txt
1. Project type.
2. Recommended strategy.
3. Runtime entry map.
4. Route map.
5. Reachable files.
6. Scaffold/non-runtime files.
7. Dependency usage.
8. shadcn/Radix usage.
9. Largest components.
10. Mixed responsibilities.
11. Hardcoded content.
12. First safe patch.
13. Files to touch.
14. Files not to touch.
15. Behavior to preserve.
16. Validation command.
```

Output cuối:

```txt
Ready for first safe patch
hoặc
Need deeper triage
hoặc
Blocked
```

---

# 02 — PROJECT-CONTRACT.md

Vai trò:

```txt
Khóa luật project: cái gì không được phá.
```

Nội dung chính:

```txt
1. Project identity.
2. Runtime contract.
3. Product contract.
4. Core/gameplay contract.
5. Runtime/input/render/UI/data/audio ownership.
6. Forbidden dependency edges.
7. Default forbidden files.
8. Behavior preservation contract.
9. Stop conditions.
10. First safe patch.
11. Verification commands.
```

Rule chính:

```txt
Core = gameplay truth.
React = UI.
PixiJS = render/game visual runtime.
Data/lib = Firebase/API/localStorage.
Audio = BGM/SFX/audio engine.
```

Không được:

```txt
- Core import React/Pixi/Firebase/window/localStorage/audio.
- UI tự tính gameplay rule.
- PixiJS save score.
- Data layer import UI component.
- Audio nằm trong core.
```

---

# 03 — ARCHITECTURE.md

Vai trò:

```txt
Vẽ kiến trúc thật và target architecture của repo.
```

Nội dung chính:

```txt
1. Project summary.
2. Runtime entry map.
3. Route map.
4. Current architecture graph.
5. Target architecture graph.
6. Layer ownership.
7. Data flow.
8. Input flow.
9. Render flow.
10. Score/save flow.
11. Audio flow.
12. File map.
13. Component map.
14. Dependency architecture.
15. Architecture decisions.
16. Known risks.
17. Unknowns.
18. Where new code should go.
```

Rule chính:

```txt
ARCHITECTURE.md describes how the project is organized.
Không dùng file này làm agent rule.
Không dùng file này làm design rule.
Không mô tả target architecture như thể nó đã tồn tại.
```

Label bắt buộc:

```txt
Current:
Target:
Planned:
Deprecated:
Unknown:
```

---

# 04 — AGENTS.md

Vai trò:

```txt
Luật cho AI/Codex/Mimo/Gemini khi sửa repo.
```

Vị trí chuẩn:

```txt
AGENTS.md ở root repo là bản chính.
docs/04-AGENTS.md chỉ là bản mirror nếu muốn lưu trong docs.
```

Nội dung chính:

```txt
1. Files agent phải đọc trước khi sửa.
2. Mode mặc định: analysis-only.
3. Khi nào được chuyển sang small-patch-refactor.
4. Allowed files là strict.
5. Checklist không mở rộng allowed files.
6. Nếu gặp lỗi ngoài scope thì report-only.
7. Không tự proceed phase tiếp theo.
8. Không thêm/xóa dependency nếu task không cho phép.
9. Không sửa tests để fake pass.
10. Không xóa feature để fix bug.
11. Verification commands.
12. Report format.
```

Rule chính:

```txt
If an issue is outside Allowed files:
- Do not patch it.
- Report it as follow-up.
- Suggest a separate task.
```

---

# 05 — DESIGN.md

Vai trò:

```txt
Design source of truth cho UI/component/style.
```

Nội dung chính:

```txt
1. Product design intent.
2. Screen type.
3. Visual hierarchy.
4. Theme/vibe.
5. Color tokens.
6. Typography.
7. Spacing.
8. Radius/shadow/border.
9. Component style rules.
10. Layout rules.
11. Game-first rules.
12. Desktop/tablet/mobile rules.
13. Figma frame references.
14. What not to add.
```

Với game-first app:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
TopNav/Footer/Dashboard are supporting UI only.
Do not add hero sections, marketing CTA, feature cards, or long landing scroll unless explicitly requested.
```

---

# 06 — DESIGN-APPLICATION-GATE.md

Vai trò:

```txt
Checklist dùng mỗi lần muốn chỉnh UI/component.
```

Nội dung chính:

```txt
1. UI task type.
2. Figma/design source being applied.
3. Components affected.
4. Tokens used.
5. Layout impact.
6. Responsive impact.
7. Game-first check.
8. Visual drift check.
9. Component ownership check.
10. Before/after validation.
```

Rule chính:

```txt
DESIGN.md = luật thiết kế.
DESIGN-APPLICATION-GATE.md = kiểm tra patch UI có tuân luật không.
```

Không được:

```txt
- Hard-code màu/font/spacing mới nếu đã có token.
- Thêm section không có trong Figma/design.
- Làm game board/canvas mất spotlight.
- Đổi vibe từ game/art style sang SaaS/dashboard.
- Sửa gameplay trong UI-only task.
```

---

# 07 — PHASE-PLAYBOOK.md

Vai trò:

```txt
Chia thứ tự phase để refactor không lộn xộn.
```

Phase order chuẩn:

```txt
PHASE 0 — Figma Make Triage
  -> analysis-only, không sửa code

PHASE 1 — Handoff + Project Contract
  -> 01-FIGMA-TRIAGE-HANDOFF.md
  -> 02-PROJECT-CONTRACT.md

PHASE 2 — Architecture + Agent Rules
  -> 03-ARCHITECTURE.md
  -> AGENTS.md

PHASE 3 — Design Contract + Design Gate
  -> 05-DESIGN.md
  -> 06-DESIGN-APPLICATION-GATE.md

PHASE 4 — Layout/Grid Stabilization
  -> chuẩn hóa layout shell/grid/responsive

PHASE 5 — Component Extraction
  -> tách component theo ownership

PHASE 6 — Game Core Extraction
  -> tách core logic/types/config/tests

PHASE 7 — PixiJS Render Integration
  -> chỉ apply PixiJS vào game/render layer

PHASE 8 — Cleanup
  -> unused imports, scaffold, chunks, dependencies

PHASE 9 — Final Gate
  -> build/test/typecheck/import graph/manual smoke
```

Rule chính:

```txt
One phase only.
Do not proceed to the next phase.
Each phase must have TASK-CONTRACT.md.
Each phase must produce PHASE-REPORT.md.
```

---

# 08 — VERIFICATION-GATES.md

Vai trò:

```txt
Kiểm tra patch có thật sự an toàn không.
```

Gate chính:

```txt
1. Scope gate.
2. Dirty tree gate.
3. Build/typecheck/test gate.
4. Code graph / dependency graph gate.
5. Architecture boundary gate.
6. Lifecycle gate.
7. UI/design gate.
8. Game behavior gate.
9. Data/storage gate.
10. Audio gate.
11. Dependency/cleanup gate.
12. Manual smoke gate.
13. Final report gate.
```

Checklist:

```txt
[ ] Changed files nằm trong allowed files.
[ ] Không có unexpected changed files.
[ ] Build/typecheck/test pass nếu có.
[ ] core không import React/Pixi/Firebase/window/localStorage.
[ ] render không save score.
[ ] input không tự tính gameplay rule.
[ ] UI không mutate game state bừa.
[ ] data layer không import UI component.
[ ] ticker/listener/timer cleanup.
[ ] texture/sprite ownership rõ.
[ ] replay không duplicate object/listener.
[ ] UI không drift khỏi DESIGN.md.
```

---

# 09 — PROMPTS.md

Vai trò:

```txt
Kho prompt dùng lại cho agent.
```

Prompt nên có:

```txt
1. Figma triage prompt.
2. Handoff prompt.
3. Project contract prompt.
4. Architecture prompt.
5. AGENTS.md prompt.
6. DESIGN.md prompt.
7. Design application gate prompt.
8. Layout/grid patch prompt.
9. Component extraction prompt.
10. Game core extraction prompt.
11. PixiJS render integration prompt.
12. Data/score/storage prompt.
13. Audio patch prompt.
14. Cleanup prompt.
15. Final gate prompt.
16. Task contract prompt.
17. Phase report prompt.
```

Rule chung cho mọi prompt:

```txt
Only do this phase.
Do not proceed to the next phase.
Allowed files are strict.
Checklist does not expand allowed files.
Out-of-scope issues must be reported, not patched.
Preserve visual design.
Preserve gameplay behavior.
Do not add/remove dependencies unless explicitly allowed.
```

---

# 10 — ADR.md

Vai trò:

```txt
Ghi lại các quyết định kiến trúc quan trọng và vì sao chọn chúng.
```

Nội dung chính:

```txt
1. ADR-001 — Core Gameplay Remains Pure.
2. ADR-002 — React Owns UI, PixiJS Owns Render Runtime.
3. ADR-003 — Game-First UI Is Not A Landing Page.
4. ADR-004 — Refactor Must Use Small Patches.
5. ADR-005 — Figma Triage Must Happen Before Refactor.
6. ADR-006 — DESIGN.md Is The UI Source Of Truth.
7. ADR-007 — Score Saving Is Non-Blocking.
8. ADR-008 — Cleanup Happens Late And In Dedicated Patches.
9. ADR-009 — Reports Are Execution History, Docs Are Source Of Truth.
10. ADR-010 — Unknowns Must Stay Unknown Until Audited.
```

Rule chính:

```txt
ADR records why an architecture decision exists.
Do not change an accepted ADR silently.
If a decision changes, create a new ADR or mark the old ADR as Replaced.
```

---

# 11 — DEBUG-RUNBOOK.md

Vai trò:

```txt
Runbook debug khi game/build/runtime/UI/Pixi/Firebase/audio bị lỗi.
```

Nội dung chính:

```txt
1. Required debug flow.
2. Bug report template.
3. Fast triage checklist.
4. Blank screen.
5. Vite websocket disconnect.
6. TypeScript/build fail.
7. Passive event listener warning.
8. PixiJS black screen / black texture.
9. Duplicate ticker/listener/canvas after replay.
10. Replay stale state.
11. Mobile swipe/touch/drag not working.
12. Coordinate/hitbox bug.
13. Overlay/modal/panel blocked by canvas.
14. Resize/DPR/canvas scale bug.
15. Game loop performance / React state per frame.
16. Firebase/save score bug.
17. localStorage bug.
18. Audio not playing.
19. UI drift bug.
20. Dependency/package bug.
21. Scaffold/generated code confusion.
22. Debug patch report.
```

Rule chính:

```txt
Debug first.
Patch second.
Verify third.
Report last.
```

Không được:

```txt
- Không sửa nhiều layer cùng lúc.
- Không xóa feature để hết lỗi.
- Không comment out code như một fix.
- Không đổi gameplay khi lỗi chỉ nằm ở UI.
- Không đổi UI khi lỗi chỉ nằm ở core.
- Không đổi dependency/config nếu chưa chứng minh cần.
```

---

# 12 — REFACTOR-EXECUTION-PLAN.md

Vai trò:

```txt
Bản kế hoạch tổng hợp để bắt đầu refactor code thật.
```

Nội dung chính:

```txt
1. Refactor readiness checklist.
2. Refactor strategy.
3. Refactor phase order.
4. How to choose the first refactor patch.
5. Required task contract before every patch.
6. Standard patch loop.
7. Verification required after every patch.
8. Manual smoke checks.
9. Report required after every phase.
10. Refactor stop conditions.
11. Refactor anti-patterns.
12. Recommended first execution sequence.
```

Rule chính:

```txt
Refactor only begins after workflow docs are ready.
Không refactor theo cảm hứng.
Không vừa nghĩ vừa làm.
Không nhảy phase.
Không sửa nhiều layer cùng lúc.
```

Recommended first execution sequence:

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

---

# templates/TASK-CONTRACT.md

Vai trò:

```txt
Mẫu giao việc cho từng patch/phase.
```

Template:

```txt
# Task Contract

## Phase

## Goal

## Non-goals

## Allowed files

## Forbidden files

## Allowed changes

## Forbidden changes

## Behavior to preserve

## Design source, if UI task

## Architecture source

## Validation commands

## Stop conditions

## Definition of done
```

Rule:

```txt
Không có TASK-CONTRACT.md thì chưa được patch.
Allowed files are strict.
Checklist does not expand allowed files.
```

---

# templates/PHASE-REPORT.md

Vai trò:

```txt
Mẫu report sau mỗi phase.
```

Template:

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

## Code graph result

## Commands run

## Results

## Manual smoke result

## Unexpected changes

## Risks / follow-up

## Next recommended patch
```

Rule:

```txt
Không có PHASE-REPORT.md thì chưa coi phase là xong.
Nếu phase FAIL hoặc BLOCKED thì không được qua phase tiếp theo.
```

---

# reports/

Vai trò:

```txt
Lưu lịch sử thực thi thật sau mỗi phase/patch.
```

Ví dụ:

```txt
reports/
  2026-06-24-phase-0-triage.md
  2026-06-24-phase-1-contract.md
  2026-06-24-phase-4-layout.md
  2026-06-24-phase-6-core.md
  2026-06-24-phase-7-pixi.md
```

Rule chính:

```txt
docs/ = luật và source of truth.
templates/ = mẫu dùng lại.
reports/ = lịch sử agent đã làm gì.
AGENTS.md = luật vận hành cho AI agent.
```

---

# Short version

```txt
00-README-WORKFLOW.md
= bản đồ tổng workflow

01-FIGMA-TRIAGE-HANDOFF.md
= triage xong thì làm gì tiếp

02-PROJECT-CONTRACT.md
= cái gì không được phá

03-ARCHITECTURE.md
= repo được tổ chức như thế nào

AGENTS.md / 04-AGENTS.md
= agent phải hành xử ra sao

05-DESIGN.md
= UI phải trông như thế nào

06-DESIGN-APPLICATION-GATE.md
= mỗi UI patch có lệch design không

07-PHASE-PLAYBOOK.md
= thứ tự làm phase

08-VERIFICATION-GATES.md
= patch có an toàn không

09-PROMPTS.md
= prompt dùng lại

10-ADR.md
= vì sao chọn kiến trúc đó

11-DEBUG-RUNBOOK.md
= debug lỗi theo quy trình

12-REFACTOR-EXECUTION-PLAN.md
= bắt đầu refactor thật theo thứ tự

TASK-CONTRACT.md
= giao việc cho patch hiện tại

PHASE-REPORT.md
= báo cáo sau patch

reports/
= lịch sử thực thi
```

---

# Final mental model

```txt
Figma triage tells what the project is.
Project contract tells what must not break.
Architecture tells where code belongs.
Agents tells how AI must behave.
Design tells what UI should look like.
Design gate prevents UI drift.
Phase playbook tells what to do next.
Verification gates prove the patch is safe.
Prompts make the workflow reusable.
ADR records why decisions exist.
Debug runbook fixes bugs without chaos.
Refactor execution plan turns docs into action.
Task contract controls the current patch.
Phase report records what actually changed.
Reports folder stores execution history.
```