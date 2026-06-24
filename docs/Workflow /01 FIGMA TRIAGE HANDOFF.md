# 01 — Figma Triage Handoff

File này dùng sau khi đã chạy `figma-make-triage` ở chế độ `analysis-only`.

Mục tiêu của file này là chuyển kết quả triage thành quyết định rõ ràng trước khi refactor:

```txt
Triage report
-> Project classification
-> Recommended strategy
-> First safe patch
-> Files được sửa
-> Files không được sửa
-> Behavior phải giữ nguyên
-> Validation command
-> Gate trước khi refactor
```

Không dùng file này để thay thế triage report.  
File này chỉ là lớp handoff giữa triage và refactor.

---

# 0. Khi nào dùng file này?

Dùng file này khi project có nguồn gốc từ:

```txt
Figma Make
Figma-to-code
Design-to-code
AI-generated UI export
Generated React UI
Visual prototype export
```

Không dùng file này cho repo React viết tay bình thường, trừ khi project có phần UI generated hoặc user yêu cầu áp dụng workflow Figma triage.

---

# 1. Input bắt buộc

Trước khi điền file này, phải có ít nhất một trong các đầu vào sau:

```txt
[ ] Figma Make Triage Report
[ ] Output từ script triage_figma_export.py
[ ] Manual triage report theo schema chuẩn
[ ] Runtime/reachable/scaffold audit đủ bằng chứng
```

Nếu chưa có triage report, không được refactor.

Phải quay lại chạy:

```txt
Use figma-make-triage in analysis-only mode.
Analyze this Figma Make exported codebase.
Do not modify files.
```

---

# 2. Nguyên tắc bắt buộc

```txt
[ ] Không sửa file trong bước handoff.
[ ] Không refactor trong bước handoff.
[ ] Không xóa scaffold trong bước handoff.
[ ] Không xóa dependency trong bước handoff.
[ ] Không thêm feature trong bước handoff.
[ ] Không apply PixiJS trong bước handoff.
[ ] Không tách component trong bước handoff.
[ ] Chỉ đọc triage report và quyết định chiến lược tiếp theo.
```

Handoff là bước ra quyết định, không phải bước patch code.

---

# 3. Executive Decision

Điền phần này bằng kết quả từ triage report.

```txt
Project name:
Source:
Triage date:
Triage mode:
Triage report location:
Confidence:
```

## 3.1. Project type

Chọn một loại:

```txt
[ ] Visual prototype
[ ] Mini web app
[ ] Landing/template scaffold
[ ] Mixed/unclear
```

## 3.2. Recommended strategy

Chọn theo project type:

```txt
Visual prototype
-> wrap, do not deep-refactor

Mini web app
-> preserve core flow, extract hooks and pure logic

Landing/template scaffold
-> extract content, sections, reusable UI

Mixed/unclear
-> no refactor yet; deepen triage
```

## 3.3. Can refactor now?

```txt
Can refactor now:
[ ] Yes
[ ] No
[ ] Only small patch
[ ] Need deeper triage first
```

Nếu chọn `No` hoặc `Need deeper triage first`, dừng ở đây và ghi lý do.

```txt
Reason:
- ...
```

---

# 4. Runtime Entry Handoff

Dựa trên triage report, ghi lại runtime path thật.

```txt
Runtime entry map:

index.html
-> src/main.tsx
-> ...
-> active App/router
-> active route/component
```

## Evidence

```txt
Command:
Result:
Confidence:
```

Ví dụ:

```txt
Command:
cat index.html
cat src/main.tsx
rg "createBrowserRouter|BrowserRouter|Routes|Route" src

Result:
index.html loads /src/main.tsx.
src/main.tsx renders App.
App owns active route tree.

Confidence:
High
```

---

# 5. Route Handoff

Dựa trên route map trong triage report.

|Route|Component|File|Runtime reachable|Confidence|
|---|---|---|---|---|
|`/`|||||
|`/game`|||||
|`/settings`|||||

Nếu không có router, ghi:

```txt
No explicit route system.
Single-screen app.
Runtime component:
- ...
```

---

# 6. Reachable vs Scaffold Handoff

Mục tiêu là biết file nào đang chạy thật và file nào chỉ là scaffold/generated leftovers.

## 6.1. Runtime/reachable files

|File|Reached from|Notes|Confidence|
|---|---|---|---|
|||||

## 6.2. Non-runtime / scaffold candidates

|File/Folder|Reason|Safe action|Confidence|
|---|---|---|---|
|||Report only||
|||Quarantine later||
|||Delete only in later cleanup patch||

Rule:

```txt
Scaffold candidates are report-only in this phase.
Do not move, delete, or rename them during handoff.
```

---

# 7. Dependency Handoff

Dựa trên dependency usage trong triage report.

|Dependency|Runtime used|Scaffold only|Not found|Action|
|---|---|---|---|---|
|||||Keep|
|||||Investigate|
|||||Cleanup later|

Rules:

```txt
[ ] Không xóa dependency ở handoff phase.
[ ] Không xóa dependency chỉ vì “có vẻ không dùng”.
[ ] Chỉ cleanup dependency trong cleanup patch riêng.
[ ] Chỉ xóa sau khi đã chứng minh không dùng và build pass.
```

---

# 8. shadcn/Radix Handoff

Dựa trên triage report.

```txt
Verdict:
[ ] Runtime used
[ ] Scaffold only
[ ] Mixed
[ ] Not found
```

Evidence:

```txt
Runtime imports:
- ...

Scaffold-only imports:
- ...

Confidence:
- ...
```

Safe action:

```txt
[ ] Keep for now
[ ] Report-only scaffold
[ ] Quarantine later
[ ] Cleanup later after build passes
```

Không được xóa `components/ui` hoặc Radix dependency trong patch đầu tiên nếu chưa có bằng chứng chắc chắn và validation rõ.

---

# 9. Largest Components Handoff

Liệt kê các component lớn nhất từ triage report.

|File|Lines|Risk|Suggested action|
|---|--:|---|---|
|||||

Risk scale:

```txt
0-150 lines
-> low risk

150-400 lines
-> medium risk

400-800 lines
-> high risk

800+ lines
-> generated giant component
```

Rule:

```txt
Generated giant component không nên deep-refactor ngay.
Nếu là visual prototype, ưu tiên wrap hoặc tạo shell quanh nó.
Nếu là mini web app, chỉ extract một hook hoặc một pure helper trước.
```

---

# 10. Mixed Responsibilities Handoff

Dựa trên triage report, liệt kê file đang ôm nhiều trách nhiệm.

|File|Responsibilities found|Risk|Extraction target|
|---|---|---|---|
||UI + state + timers||runtime hook|
||UI + storage + API||data hook|
||UI + pointer + animation||input/render hook|

Responsibility signals:

```txt
UI
state
event handling
animation
storage
API
audio
timers
keyboard logic
pointer/touch logic
business rules
mock data
routing
```

Rule:

```txt
Nếu một component có hơn 4 nhóm trách nhiệm, không refactor toàn bộ một lần.
Chỉ chọn một responsibility để extract trong patch đầu tiên.
```

---

# 11. Hardcoded Content Handoff

Dựa trên triage report.

|File|Content type|Example/evidence|Extraction target|
|---|---|---|---|
||CTA text||src/content/site.content.ts|
||mock data||src/features//.mock.ts|
||guide text||src/content/game-guide.content.ts|

Rules:

```txt
[ ] Text/copy tĩnh có thể extract sang content file.
[ ] Mock/sample data có thể tách sang mock/config file.
[ ] Không tách dynamic game state thành content.
[ ] Không hard-code thêm marketing copy vào component.
```

Dynamic game state không phải content:

```txt
score
timer
combo
lives
tile value
fruit kind
game status
leaderboard loading/error
```

---

# 12. Project Type Decision Matrix

Dùng phần này để kiểm tra lại classification.

## 12.1. Visual Prototype

Signals:

```txt
[ ] UI đẹp nhưng component rất lớn.
[ ] Ít hoặc không có domain/core logic rõ.
[ ] Nhiều content hardcoded.
[ ] Nhiều scaffold/dependency thừa.
[ ] Không có service/data boundary thật.
```

Strategy:

```txt
wrap, do not deep-refactor
```

First safe patch:

```txt
Tạo app shell/route wrapper quanh generated experience.
Không tách từng div/pixel component.
```

Avoid:

```txt
[ ] Deep-refactor generated giant component.
[ ] Thêm backend vào generated UI.
[ ] Tách mọi pixel thành component.
```

---

## 12.2. Mini Web App

Signals:

```txt
[ ] Có route thật.
[ ] Có user flow thật.
[ ] Có state/session/core logic.
[ ] Có architecture nhưng đang lẫn trong UI.
```

Strategy:

```txt
preserve core flow, extract hooks and pure logic
```

First safe patch:

```txt
Tách một hook nhỏ hoặc một pure logic helper.
```

Avoid:

```txt
[ ] Thêm API trước khi session/state boundary rõ.
[ ] Refactor tất cả routes cùng lúc.
[ ] Đổi visual behavior khi chỉ đang cleanup logic.
```

---

## 12.3. Landing / Template Scaffold

Signals:

```txt
[ ] Nhiều section.
[ ] CTA/marketing content.
[ ] Simple form.
[ ] Ít interaction phức tạp.
[ ] Có potential reuse cho section/component.
```

Strategy:

```txt
extract content, sections, reusable UI
```

First safe patch:

```txt
Tạo content config và truyền vào một section.
```

Avoid:

```txt
[ ] Thêm backend trước khi form/CTA boundary rõ.
[ ] Hard-code thêm marketing copy trong component.
```

---

## 12.4. Mixed / Unclear

Signals:

```txt
[ ] Runtime path chưa rõ.
[ ] Route map mâu thuẫn.
[ ] Dynamic imports làm khó trace ownership.
[ ] Build/test state chưa biết.
[ ] Không rõ file nào chạy thật.
```

Strategy:

```txt
no refactor yet; deepen triage
```

First safe patch:

```txt
Không patch.
Tiếp tục triage cho đến khi runtime và ownership rõ.
```

Avoid:

```txt
[ ] Move files.
[ ] Delete dependencies.
[ ] Add features.
[ ] Refactor generated components.
```

---

# 13. First Safe Patch Decision

Chọn đúng một patch đầu tiên.

```txt
First safe patch:
- ...

Why this patch:
- ...

Files to touch:
- ...

Files not to touch:
- ...

Behavior to preserve:
- ...

Validation command:
- ...
```

Patch đầu tiên nên thuộc một trong các loại:

```txt
[ ] Add app shell/wrapper
[ ] Extract one content config
[ ] Extract one pure helper
[ ] Extract one isolated hook
[ ] Normalize one layout shell
[ ] Add one test for pure logic
[ ] Create report-only scaffold list
```

Patch đầu tiên không nên là:

```txt
[ ] Add Firebase/Supabase/auth
[ ] Apply PixiJS to whole UI
[ ] Delete all unused dependencies
[ ] Refactor all components
[ ] Move many folders
[ ] Rewrite routing
[ ] Deep-refactor generated giant component
```

---

# 14. Game-Specific Handoff

Chỉ điền phần này nếu project là game hoặc có game screen.

## 14.1. Game classification

```txt
Game type:
[ ] Board puzzle
[ ] Merge game
[ ] Arcade/action
[ ] Drag/drop puzzle
[ ] Serving/path game
[ ] Idle/clicker
[ ] Other:
```

## 14.2. Game-first decision

```txt
Screen type:
[ ] Game-first screen
[ ] Menu screen
[ ] Dashboard screen
[ ] Landing screen
[ ] Mixed
```

Nếu là game-first:

```txt
[ ] Game board/canvas là trung tâm.
[ ] HUD là phụ trợ.
[ ] Side panel/dashboard không được chiếm spotlight.
[ ] TopNav/Footer không được biến màn chơi thành landing page.
[ ] Mobile ưu tiên vùng chơi trước.
```

## 14.3. Game architecture handoff

```txt
Gameplay source of truth:
- unknown / existing file / target file

Render layer:
- React DOM / Canvas / PixiJS / unknown

UI layer:
- existing components

Input layer:
- keyboard / pointer / touch / drag / swipe

Data/storage layer:
- localStorage / Firebase / API / none

Audio layer:
- audio manager / hook / none
```

## 14.4. PixiJS decision

```txt
Should use PixiJS now?
[ ] No
[ ] Not yet
[ ] Yes, only for game/render layer
[ ] Need render contract first
```

Rules:

```txt
[ ] PixiJS không dùng để render navbar/button/modal/footer bình thường.
[ ] PixiJS chỉ dùng cho game board/canvas/sprite/effect/animation-heavy layer.
[ ] React owns UI.
[ ] PixiJS owns render runtime.
[ ] Core owns gameplay truth.
```

---

# 15. Gate Before Refactor

Trước khi chuyển sang small-patch-refactor, phải tick hết:

```txt
[ ] Project type đã xác định.
[ ] Recommended strategy đã rõ.
[ ] Runtime entry map đã rõ.
[ ] Route map đã rõ hoặc xác nhận single-screen.
[ ] Reachable vs scaffold files đã phân loại.
[ ] Largest components đã biết.
[ ] Mixed responsibilities đã biết.
[ ] First safe patch đã chọn.
[ ] Files to touch đã liệt kê.
[ ] Files not to touch đã liệt kê.
[ ] Behavior to preserve đã liệt kê.
[ ] Validation command đã liệt kê.
[ ] Out-of-scope issues sẽ report-only.
```

Nếu thiếu bất kỳ mục nào, chưa được refactor.

---

# 16. Mode Switch

Default mode:

```txt
Mode: analysis-only
```

Chỉ chuyển sang refactor khi user xác nhận:

```txt
Mode: small-patch-refactor
```

Trước khi edit, agent phải output:

```txt
Mode: small-patch-refactor

Files to touch:
- ...

Files not to touch:
- ...

Behavior to preserve:
- ...

Validation command:
- ...

Stop conditions:
- If an out-of-scope file must be edited, stop and report.
- If behavior must change, stop and report.
- If dependency change is required, stop and report.
```

---

# 17. Handoff Output Summary

Kết thúc file này bằng summary ngắn:

```txt
Triage handoff status:
[ ] Ready for first safe patch
[ ] Not ready; needs deeper triage
[ ] Blocked

Reason:
- ...

Next action:
- ...

First safe patch:
- ...

Do not touch:
- ...

Validation:
- ...
```

---

# 18. Example Filled Summary

Ví dụ:

```txt
Triage handoff status:
Ready for first safe patch.

Project type:
Mini web app.

Recommended strategy:
Preserve core flow, extract hooks and pure logic.

First safe patch:
Normalize game screen layout shell without touching gameplay logic.

Files to touch:
- src/components/game/GamePage.tsx
- src/styles/game-layout.css

Files not to touch:
- src/game/core.ts
- src/lib/firebase.ts
- src/features/game/render/*
- package.json
- package-lock.json

Behavior to preserve:
- Routes unchanged.
- Game still starts.
- Score/game state unchanged.
- Visual style preserved.

Validation:
- npm run typecheck if available.
- npm test if available.
- npm run build.
- git diff --check.

Next action:
Create TASK-CONTRACT.md for first safe patch.
```

---

# 19. Final Rule

Figma triage tells what the project really is.

This handoff tells what the next safe move is.

Do not refactor until this handoff can clearly answer:

```txt
[ ] What project type is this?
[ ] What strategy should be used?
[ ] What is the first safe patch?
[ ] What files can be touched?
[ ] What files must not be touched?
[ ] What behavior must be preserved?
[ ] How will the patch be validated?
```