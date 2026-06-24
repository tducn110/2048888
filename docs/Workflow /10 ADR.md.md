ADR = Architecture Decision Record.

File này ghi lại các quyết định kiến trúc quan trọng của project.

Mục tiêu:

```txt
[ ] Biết vì sao project chọn kiến trúc hiện tại.
[ ] Tránh agent tự sửa ngược quyết định cũ.
[ ] Tránh lặp lại tranh luận core/UI/render/data/audio.
[ ] Ghi rõ decision, reason, consequence.
[ ] Dùng làm nguồn tham chiếu khi refactor lớn.
```

File này không phải task list.  
File này không phải phase report.  
File này không phải nơi ghi bug nhỏ.

---

# 0. ADR Rule

Mỗi ADR phải trả lời 4 câu:

```txt
1. Quyết định là gì?
2. Vì sao chọn như vậy?
3. Hậu quả/tác động là gì?
4. Khi nào được thay đổi quyết định này?
```

Format chuẩn:

```txt
# ADR-XXX — Title

Status:
- Proposed / Accepted / Deprecated / Replaced

Date:
- YYYY-MM-DD

Context:
- ...

Decision:
- ...

Reason:
- ...

Consequences:
- ...

Allowed changes:
- ...

Forbidden changes:
- ...

Related files:
- ...

Superseded by:
- ...
```

---

# ADR-001 — Core Gameplay Remains Pure

Status:

```txt
Accepted
```

Context:

```txt
Project có gameplay logic, UI React, render layer có thể dùng DOM/canvas/PixiJS, data layer có thể dùng localStorage/Firebase, và audio layer riêng.
Nếu gameplay rule bị trộn vào UI/render/data/audio thì refactor sẽ khó, test khó, và dễ tạo bug khi đổi render layer.
```

Decision:

```txt
Core gameplay logic must remain pure.

Core không được import:
- React
- PixiJS
- Firebase/API
- window/document
- localStorage/sessionStorage
- audio manager
- CSS
- UI components
```

Reason:

```txt
Core là gameplay source of truth.
Core pure thì dễ test, dễ debug, dễ đổi UI/render layer, và ít bị regression khi apply PixiJS hoặc refactor component.
```

Consequences:

```txt
[ ] UI chỉ hiển thị state và gửi action.
[ ] Input chỉ normalize action.
[ ] Render/PixiJS chỉ render state.
[ ] Data/storage chỉ save/load dữ liệu.
[ ] Audio chỉ phát sound theo event/callback.
[ ] Core có thể test bằng unit test không cần browser.
```

Forbidden changes:

```txt
[ ] Không đưa score formula vào UI component.
[ ] Không đưa win/lose rule vào PixiJS render hook.
[ ] Không gọi Firebase/localStorage trong core.
[ ] Không gọi audio từ core.
```

Allowed changes:

```txt
[ ] Thêm pure helper.
[ ] Thêm type/config.
[ ] Thêm test cho state transition.
[ ] Thay đổi gameplay rule nếu task gameplay explicitly yêu cầu.
```

Related files:

```txt
docs/02-PROJECT-CONTRACT.md
docs/03-ARCHITECTURE.md
docs/08-VERIFICATION-GATES.md
src/game/core.ts
src/game/types.ts
src/game/config.ts
```

---

# ADR-002 — React Owns UI, PixiJS Owns Render Runtime

Status:

```txt
Accepted
```

Context:

```txt
Project có UI bình thường như TopNav, Footer, HUD, modal, panel, dashboard, button, form.
Project cũng có thể có game board/canvas cần animation-heavy render.
Nếu dùng PixiJS cho toàn bộ UI thì code khó maintain, kém accessibility, và dễ trộn game logic vào render.
```

Decision:

```txt
React owns normal UI.
PixiJS owns only game/canvas/render-heavy runtime.
```

React owns:

```txt
[ ] TopNav
[ ] Footer
[ ] HUD
[ ] Modal
[ ] Panel
[ ] Dashboard/stats
[ ] Button
[ ] Form
[ ] Layout grid
[ ] Route composition
```

PixiJS owns:

```txt
[ ] Game board/canvas
[ ] Sprite-heavy scene
[ ] Particles/effects
[ ] Animation-heavy runtime
[ ] High-frequency render loop
[ ] Render sync from game state
```

Reason:

```txt
React/CSS phù hợp cho UI, layout, accessibility và component composition.
PixiJS phù hợp cho sprite/canvas/effect/game render.
Tách rõ giúp tránh PixiJS nuốt luôn gameplay logic hoặc normal UI.
```

Consequences:

```txt
[ ] Không render navbar/modal/footer/dashboard text bằng PixiJS.
[ ] Game board có thể là PixiJS canvas, nhưng UI overlay vẫn do React quản.
[ ] PixiJS không được save score.
[ ] PixiJS không được quyết định gameplay truth.
```

Forbidden changes:

```txt
[ ] Không apply PixiJS vào toàn bộ app.
[ ] Không dùng PixiJS để vẽ normal button/modal/form.
[ ] Không đưa Firebase/localStorage vào render hook.
[ ] Không set React state mỗi frame nếu không cần.
```

Allowed changes:

```txt
[ ] Dùng PixiJS cho game board.
[ ] Dùng PixiJS cho particles/effects.
[ ] Dùng React overlay phía trên canvas.
[ ] Dùng CSS/React cho layout/responsive.
```

Related files:

```txt
docs/03-ARCHITECTURE.md
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
src/features/game/render/*
src/components/game/*
```

---

# ADR-003 — Game-First UI Is Not A Landing Page

Status:

```txt
Accepted
```

Context:

```txt
Project game có thể có TopNav, Footer, Dashboard, Login modal, stats panel, guide text.
AI agent dễ hiểu nhầm các thành phần này thành landing page hoặc SaaS dashboard.
Điều đó làm game board/canvas bị đẩy xuống dưới, UI bị dài, và gameplay mất spotlight.
```

Decision:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
TopNav, Footer, Dashboard, stats, and panels are supporting UI only.
```

Reason:

```txt
Người dùng vào app để chơi game trước.
UI phụ trợ chỉ giúp chơi, xem điểm, login, settings, replay.
Nếu UI chuyển thành landing page, product intent bị sai.
```

Consequences:

```txt
[ ] Game board/canvas đứng trung tâm.
[ ] HUD gần vùng chơi.
[ ] Dashboard/stats là secondary.
[ ] TopNav compact.
[ ] Footer minimal.
[ ] Mobile hiển thị game trước.
```

Forbidden changes:

```txt
[ ] Không thêm hero section nếu không được yêu cầu.
[ ] Không thêm marketing CTA trước gameplay.
[ ] Không thêm feature cards/pricing/testimonials.
[ ] Không tạo long landing scroll.
[ ] Không biến dashboard/stats thành màn chính nếu task không yêu cầu.
```

Allowed changes:

```txt
[ ] Chỉnh layout để game dễ chơi hơn.
[ ] Thêm compact stats panel nếu không chiếm spotlight.
[ ] Thêm login/settings modal nếu không phá flow chơi.
[ ] Thêm footer nhỏ nếu không đẩy game khỏi viewport.
```

Related files:

```txt
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
docs/07-PHASE-PLAYBOOK.md
```

---

# ADR-004 — Refactor Must Use Small Patches

Status:

```txt
Accepted
```

Context:

```txt
Project có thể chứa generated UI, game logic, render layer, data layer, audio, CSS, scaffold, dependencies.
Nếu refactor quá rộng, rất khó biết lỗi đến từ UI, core, PixiJS, data, audio hay dependency cleanup.
```

Decision:

```txt
Every refactor must be one phase, one patch, one layer, one goal.
```

Reason:

```txt
Small patch giúp dễ review, dễ rollback, dễ verify, ít phá gameplay hơn.
```

Consequences:

```txt
[ ] Mỗi patch phải có TASK-CONTRACT.md.
[ ] Allowed files là strict.
[ ] Checklist không mở rộng allowed files.
[ ] Out-of-scope issue phải report, không patch.
[ ] Mỗi phase phải có PHASE-REPORT.md.
```

Forbidden changes:

```txt
[ ] Không gộp UI redesign + gameplay logic.
[ ] Không gộp PixiJS render + Firebase cleanup.
[ ] Không gộp dependency cleanup + file move.
[ ] Không gộp component extraction + scoring change.
[ ] Không tự qua phase tiếp theo.
```

Allowed changes:

```txt
[ ] Tách một component group.
[ ] Tách một pure helper.
[ ] Sửa một render lifecycle issue.
[ ] Normalize một layout shell.
[ ] Cleanup unused imports trong một scope nhỏ.
```

Related files:

```txt
AGENTS.md
docs/07-PHASE-PLAYBOOK.md
docs/08-VERIFICATION-GATES.md
templates/TASK-CONTRACT.md
templates/PHASE-REPORT.md
```

---

# ADR-005 — Figma Triage Must Happen Before Refactor

Status:

```txt
Accepted
```

Context:

```txt
Figma Make / design-to-code exports thường có generated components, scaffold files, unused dependencies, duplicate UI, hardcoded content, và unclear runtime.
Nếu refactor ngay, agent có thể sửa nhầm scaffold hoặc xóa dependency vẫn còn dùng.
```

Decision:

```txt
For Figma Make / Figma-to-code / AI-generated UI projects, run triage before refactor.
```

Reason:

```txt
Triage xác định runtime thật, route thật, reachable files, scaffold candidates, dependency usage, component risks và first safe patch.
```

Consequences:

```txt
[ ] Default mode là analysis-only.
[ ] Không sửa file trong triage.
[ ] Không xóa scaffold trong triage.
[ ] Không cleanup dependency trong triage.
[ ] Không apply PixiJS trong triage.
```

Forbidden changes:

```txt
[ ] Không refactor trước khi runtime path rõ.
[ ] Không xóa generated/scaffold file khi mới audit.
[ ] Không xóa dependency chỉ vì trông unused.
[ ] Không thêm backend/auth/dashboard trước khi boundary rõ.
```

Allowed changes:

```txt
[ ] Tạo triage report.
[ ] Tạo handoff doc.
[ ] Tạo project contract.
[ ] Đề xuất first safe patch.
```

Related files:

```txt
docs/01-FIGMA-TRIAGE-HANDOFF.md
docs/02-PROJECT-CONTRACT.md
docs/07-PHASE-PLAYBOOK.md
```

---

# ADR-006 — Design.md Is The UI Source Of Truth

Status:

```txt
Accepted
```

Context:

```txt
UI patch dễ drift khi agent tự thêm màu, font, spacing, section, hero, cards, hoặc layout không có trong design.
Project game cần giữ game-first hierarchy và visual vibe.
```

Decision:

```txt
DESIGN.md is the source of truth for UI/component/layout/style.
Every UI patch must pass DESIGN-APPLICATION-GATE.md.
```

Reason:

```txt
Tách design law và design gate giúp agent hiểu UI phải trông như thế nào và patch có lệch không.
```

Consequences:

```txt
[ ] UI patch phải đọc DESIGN.md.
[ ] UI patch phải chạy DESIGN-APPLICATION-GATE.md.
[ ] Không hard-code màu/font/spacing mới nếu token đã có.
[ ] Không thêm section mới nếu design không yêu cầu.
[ ] Không sửa gameplay trong UI-only patch.
```

Forbidden changes:

```txt
[ ] Không tạo visual direction mới nếu design unclear.
[ ] Không đổi game-first thành landing page.
[ ] Không thêm random SaaS styling.
[ ] Không thêm hero/feature/pricing/testimonials vào game screen.
```

Allowed changes:

```txt
[ ] Refine UI theo token đã có.
[ ] Fix responsive layout trong scope.
[ ] Extract component nhưng preserve visual.
[ ] Update DESIGN.md nếu task explicitly là design update.
```

Related files:

```txt
docs/05-DESIGN.md
docs/06-DESIGN-APPLICATION-GATE.md
templates/TASK-CONTRACT.md
```

---

# ADR-007 — Score Saving Is Non-Blocking

Status:

```txt
Accepted
```

Context:

```txt
Game có thể save score bằng localStorage, Firebase, API hoặc leaderboard.
Nếu save score block gameplay/game over/replay, network lỗi sẽ làm game crash hoặc UX tệ.
```

Decision:

```txt
Score saving must be non-blocking.
Game must remain playable without login or network.
```

Reason:

```txt
Gameplay phải hoạt động độc lập với backend.
Network/storage error nên hiện UI message, không phá core game.
```

Consequences:

```txt
[ ] Game vẫn chơi được khi user chưa login.
[ ] Firebase/API lỗi không crash game.
[ ] localStorage fallback được giữ nếu có.
[ ] Save score không được fire duplicate.
[ ] Data layer không import UI component hoặc render hook.
```

Forbidden changes:

```txt
[ ] Không gọi Firebase từ core.
[ ] Không gọi save score từ PixiJS render hook.
[ ] Không block replay vì save score fail.
[ ] Không hard-code playTimeSec sai để né type error.
```

Allowed changes:

```txt
[ ] Tách useScoreData.
[ ] Tách localStorage helper.
[ ] Thêm error state non-blocking.
[ ] Thêm guard chống duplicate save.
```

Related files:

```txt
docs/02-PROJECT-CONTRACT.md
docs/03-ARCHITECTURE.md
docs/08-VERIFICATION-GATES.md
src/lib/*
src/hooks/useScoreData.ts
```

---

# ADR-008 — Cleanup Happens Late And In Dedicated Patches

Status:

```txt
Accepted
```

Context:

```txt
Generated/Figma projects thường có nhiều file và dependency nhìn như unused.
Nhưng nếu chưa prove reachable/scaffold, cleanup sớm có thể xóa nhầm runtime file hoặc dependency đang dùng.
```

Decision:

```txt
Cleanup must happen late and in dedicated patches.
Dependency cleanup must be separate from layout/component/core/render refactor.
```

Reason:

```txt
Cleanup an toàn cần runtime proof, build proof, và diff nhỏ.
Trộn cleanup với refactor làm review khó và bug khó truy nguyên.
```

Consequences:

```txt
[ ] Unused import cleanup có thể làm nhỏ sớm nếu scope rõ.
[ ] Scaffold quarantine phải có approval.
[ ] Dependency removal phải có proof.
[ ] Lockfile changes chỉ xảy ra trong dependency cleanup patch.
```

Forbidden changes:

```txt
[ ] Không xóa scaffold ngay sau triage.
[ ] Không remove dependency trong component extraction.
[ ] Không đổi package.json trong layout/core/render patch.
[ ] Không xóa dependency chỉ vì grep sơ qua không thấy.
```

Allowed changes:

```txt
[ ] Create scaffold report.
[ ] Move scaffold to _unused with approval.
[ ] Remove dependency in dedicated cleanup patch after proof.
[ ] Run build/typecheck/test after cleanup.
```

Related files:

```txt
docs/07-PHASE-PLAYBOOK.md
docs/08-VERIFICATION-GATES.md
reports/*
```

---

# ADR-009 — Reports Are Execution History, Docs Are Source Of Truth

Status:

```txt
Accepted
```

Context:

```txt
Nếu phase reports nằm lẫn trong docs, rất dễ nhầm lịch sử patch với luật project.
Docs cần là source of truth ổn định.
Reports cần ghi lại điều đã xảy ra.
```

Decision:

```txt
Use docs/ for rules and source of truth.
Use reports/ for execution history.
Use templates/ for reusable formats.
```

Reason:

```txt
Tách rõ giúp project dễ đọc, dễ audit và agent không lấy report cũ làm rule mới.
```

Consequences:

```txt
[ ] docs/ chứa workflow, contract, architecture, design, gates, prompts.
[ ] reports/ chứa phase report thật theo ngày/phase.
[ ] templates/ chứa mẫu TASK-CONTRACT và PHASE-REPORT.
[ ] AGENTS.md nằm root để agent dễ đọc.
```

Forbidden changes:

```txt
[ ] Không để report rải lung tung trong docs/.
[ ] Không sửa docs trong code patch nếu task không cho phép.
[ ] Không biến phase report thành architecture source of truth.
```

Allowed changes:

```txt
[ ] Tạo reports/yyyy-mm-dd-phase-x-name.md.
[ ] Update docs khi architecture/design/contract thật sự thay đổi.
[ ] Dùng templates để copy contract/report.
```

Related files:

```txt
docs/*
reports/*
templates/*
AGENTS.md
```

---

# ADR-010 — Unknowns Must Stay Unknown Until Audited

Status:

```txt
Accepted
```

Context:

```txt
Agent rất dễ hallucinate architecture: tưởng file tồn tại, tưởng route active, tưởng component reachable, tưởng target architecture đã được implement.
Điều này làm docs sai và patch sai scope.
```

Decision:

```txt
Unknown information must be labeled Unknown.
Target/planned architecture must not be described as current implementation.
```

Reason:

```txt
Rõ ràng giữa Current / Target / Planned / Deprecated / Unknown giúp tránh agent sửa theo giả định sai.
```

Consequences:

```txt
[ ] ARCHITECTURE.md phải label Current/Target/Planned/Unknown.
[ ] Handoff phải ghi confidence.
[ ] Nếu runtime path chưa rõ, quay lại audit.
[ ] Nếu design source chưa rõ, không implement UI patch.
```

Forbidden changes:

```txt
[ ] Không viết target files như thể đã tồn tại.
[ ] Không đoán route active.
[ ] Không đoán dependency unused.
[ ] Không đoán design intent khi Figma/user instruction unclear.
```

Allowed changes:

```txt
[ ] Mark Unknown.
[ ] Add Follow-up Audit Needed.
[ ] Ask for missing source.
[ ] Run read-only audit commands.
```

Related files:

```txt
docs/01-FIGMA-TRIAGE-HANDOFF.md
docs/03-ARCHITECTURE.md
docs/08-VERIFICATION-GATES.md
```

---

# ADR Index

```txt
ADR-001 — Core Gameplay Remains Pure
ADR-002 — React Owns UI, PixiJS Owns Render Runtime
ADR-003 — Game-First UI Is Not A Landing Page
ADR-004 — Refactor Must Use Small Patches
ADR-005 — Figma Triage Must Happen Before Refactor
ADR-006 — Design.md Is The UI Source Of Truth
ADR-007 — Score Saving Is Non-Blocking
ADR-008 — Cleanup Happens Late And In Dedicated Patches
ADR-009 — Reports Are Execution History, Docs Are Source Of Truth
ADR-010 — Unknowns Must Stay Unknown Until Audited
```

---

# Final Rule

```txt
ADR records why an architecture decision exists.
Do not change an accepted ADR silently.
If a decision changes, create a new ADR or mark the old ADR as Replaced.
```