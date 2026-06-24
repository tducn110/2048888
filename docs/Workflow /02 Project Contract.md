# 02 — Project Contract

File này là contract chính của project sau khi đã hoàn thành `01-FIGMA-TRIAGE-HANDOFF.md`.

Mục tiêu của file này là khóa rõ:

```txt
Project này là gì?
Runtime thật bắt đầu từ đâu?
Game/app logic nằm ở đâu?
UI layer nằm ở đâu?
Render/PixiJS layer nằm ở đâu?
Data/storage/audio nằm ở đâu?
File nào được sửa?
File nào không được sửa?
Behavior nào phải giữ nguyên?
Patch được verify bằng gì?
```

Không được bắt đầu refactor nếu file này chưa đủ rõ.

---

# 0. Mục đích

`PROJECT-CONTRACT.md` dùng để chống các lỗi sau:

```txt
[ ] AI tự sửa quá rộng.
[ ] AI đổi gameplay khi chỉ sửa UI.
[ ] AI đổi UI khi chỉ sửa core logic.
[ ] AI tự apply PixiJS vào toàn bộ UI.
[ ] AI tự xóa scaffold/dependency quá sớm.
[ ] AI tự thêm backend/auth/API khi chưa có boundary.
[ ] AI sửa file ngoài scope.
[ ] AI làm build pass nhưng architecture bị bẩn.
```

Contract này là nguồn sự thật cho các phase refactor sau.

---

# 1. Input bắt buộc

Trước khi điền file này, phải có:

```txt
[ ] Figma triage report hoặc codebase triage report.
[ ] 01-FIGMA-TRIAGE-HANDOFF.md đã điền.
[ ] Runtime entry map đã rõ.
[ ] Route map đã rõ hoặc xác nhận single-screen app.
[ ] Reachable/scaffold files đã phân loại.
[ ] Project type đã xác định.
[ ] First safe patch đã được đề xuất.
```

Nếu thiếu các mục trên, chưa được viết contract sâu hoặc refactor.

---

# 2. Project Identity

```txt
Project name:
Project source:
- Figma Make / Figma-to-code / hand-written / mixed / unknown

Project type:
- Visual prototype
- Mini web app
- Landing/template scaffold
- Game-first web app
- Mixed/unclear

Game type, nếu có:
- Board puzzle
- Merge game
- Arcade/action
- Drag/drop puzzle
- Serving/path game
- Idle/clicker
- Other:

Current strategy:
- wrap, do not deep-refactor
- preserve core flow, extract hooks and pure logic
- extract content, sections, reusable UI
- deepen triage before refactor
- custom:
```

## Decision

```txt
Can refactor now:
[ ] Yes
[ ] No
[ ] Only small patch
[ ] Need deeper triage

Reason:
- ...
```

---

# 3. Runtime Contract

Điền runtime path thật của project.

```txt
Runtime path:

index.html
-> src/main.tsx
-> ...
-> active App/router
-> active route/component
```

## Runtime source of truth

```txt
Entrypoint:
- ...

Active App file:
- ...

Router owner:
- ...

Active routes:
- ...

Main screen/component:
- ...
```

## Runtime rules

```txt
[ ] Không sửa route behavior nếu task không yêu cầu.
[ ] Không đổi entrypoint nếu task không yêu cầu.
[ ] Không tạo router mới nếu router cũ vẫn là source of truth.
[ ] Không xóa file chỉ vì không thấy trong một screen; phải kiểm tra reachable map.
[ ] Không sửa scaffold/non-runtime files trong runtime patch nếu không có lý do rõ.
```

---

# 4. Product Contract

## 4.1. Screen type

Chọn screen type chính:

```txt
[ ] Game-first screen
[ ] Landing page
[ ] Dashboard
[ ] Menu screen
[ ] Modal flow
[ ] Multi-route app
[ ] Mixed
```

## 4.2. Product rules

Với game-first app:

```txt
[ ] Game board/canvas là vùng chính.
[ ] HUD/score/timer là UI phụ trợ.
[ ] Dashboard/stats/sidebar không được chiếm spotlight.
[ ] TopNav/Footer không được biến game thành landing page.
[ ] Mobile ưu tiên vùng chơi trước.
[ ] Không thêm hero section, marketing CTA, feature cards nếu Figma không yêu cầu.
```

Với landing/template scaffold:

```txt
[ ] Section order phải theo Figma/design contract.
[ ] Content/copy tĩnh nên tách ra content config.
[ ] Không thêm backend trước khi form/CTA boundary rõ.
[ ] Không hard-code thêm marketing copy trong component reusable.
```

Với mini web app:

```txt
[ ] Preserve user flow.
[ ] Preserve route behavior.
[ ] Tách hook/pure logic trước khi thêm API lớn.
[ ] Không refactor tất cả routes cùng lúc.
```

Với visual prototype:

```txt
[ ] Preserve visual design.
[ ] Wrap trước, không deep-refactor generated giant component ngay.
[ ] Không tách từng pixel/div thành component.
```

---

# 5. Architecture Ownership Contract

Mỗi layer phải có trách nhiệm rõ.

## 5.1. Gameplay/Core layer

```txt
Owner files:
- src/game/core.ts
- src/game/types.ts
- src/game/config.ts
- other:
```

Core được sở hữu:

```txt
[ ] Game state shape.
[ ] Initial state.
[ ] State transition.
[ ] Gameplay rules.
[ ] Score rules.
[ ] Win/lose condition.
[ ] Valid/invalid action.
[ ] Random/spawn helper nếu đã được inject/mock rõ.
[ ] Pure helpers.
```

Core không được sở hữu:

```txt
[ ] React.
[ ] PixiJS/canvas app.
[ ] DOM event.
[ ] window/document.
[ ] localStorage/sessionStorage.
[ ] Firebase/API/network.
[ ] Audio.
[ ] CSS.
[ ] UI component.
```

Rule:

```txt
Core is the gameplay source of truth.
UI and PixiJS must not re-implement gameplay rules.
```

---

## 5.2. Runtime layer

```txt
Owner files:
- src/features/<game>/runtime/*
- src/hooks/*
- other:
```

Runtime được sở hữu:

```txt
[ ] Session start/reset.
[ ] Countdown.
[ ] Timer.
[ ] Replay.
[ ] Game over submission guard.
[ ] Ticker orchestration nếu game có game loop.
[ ] Bridge giữa core và render/input.
```

Runtime không được sở hữu:

```txt
[ ] Texture generation.
[ ] Sprite ownership.
[ ] Firebase implementation.
[ ] UI layout.
[ ] Visual design token.
[ ] Low-level audio engine.
```

Rule:

```txt
Runtime orchestrates.
Runtime does not become a second gameplay core.
```

---

## 5.3. Input layer

```txt
Owner files:
- src/features/<game>/input/*
- other:
```

Input được sở hữu:

```txt
[ ] Keyboard input.
[ ] Pointer/mouse/touch input.
[ ] Drag/drop.
[ ] Swipe.
[ ] Coordinate conversion.
[ ] Input normalization.
[ ] Listener setup/cleanup.
```

Input không được sở hữu:

```txt
[ ] Score formula.
[ ] Win/lose rule.
[ ] Score persistence.
[ ] Firebase/localStorage.
[ ] UI layout.
[ ] Texture/sprite cleanup.
```

Rule:

```txt
Input sends actions/intents.
Core decides game result.
```

---

## 5.4. Render/PixiJS layer

```txt
Owner files:
- src/features/<game>/render/*
- src/components/background/*
- other:
```

Render/PixiJS được sở hữu:

```txt
[ ] Pixi Application/canvas nếu có.
[ ] Stage/layers.
[ ] Resize/DPR lifecycle.
[ ] Texture/asset lifecycle.
[ ] Sprite/object lifecycle.
[ ] Particles.
[ ] Visual effects.
[ ] Background animation.
[ ] Render sync from state.
```

Render/PixiJS không được sở hữu:

```txt
[ ] Gameplay truth.
[ ] Score saving.
[ ] Firebase/localStorage.
[ ] Route behavior.
[ ] React modal logic.
[ ] Text content/copy.
```

Rule:

```txt
PixiJS renders state.
PixiJS does not own game truth.
```

PixiJS chỉ được dùng cho:

```txt
[ ] Game board/canvas.
[ ] Sprite-heavy scene.
[ ] Animation-heavy layer.
[ ] Particles/effects.
[ ] High-frequency render loop.
```

PixiJS không dùng cho:

```txt
[ ] Navbar.
[ ] Button.
[ ] Modal.
[ ] Form.
[ ] Dashboard text.
[ ] Footer.
[ ] Normal layout grid.
```

---

## 5.5. UI layer

```txt
Owner files:
- src/components/game/*
- src/components/ui/*
- src/app/*
- other:
```

UI được sở hữu:

```txt
[ ] JSX layout.
[ ] HUD.
[ ] Panels.
[ ] Modals.
[ ] Buttons.
[ ] Menus.
[ ] Dashboard.
[ ] Static visual composition.
[ ] Responsive layout.
```

UI không được sở hữu:

```txt
[ ] Core game simulation.
[ ] Score formula.
[ ] Network save implementation.
[ ] Pixi resource cleanup.
[ ] AudioContext.
```

Rule:

```txt
UI displays state and sends events.
UI does not become the game engine.
```

---

## 5.6. Data/storage layer

```txt
Owner files:
- src/lib/*
- src/hooks/useScoreData.ts
- src/services/*
- other:
```

Data/storage được sở hữu:

```txt
[ ] Firebase/API calls.
[ ] localStorage fallback.
[ ] Leaderboard.
[ ] User stats.
[ ] Save score.
[ ] Loading/error state for data.
```

Data/storage không được sở hữu:

```txt
[ ] Pixi app.
[ ] Game loop.
[ ] Sprite/texture.
[ ] UI visual layout.
[ ] Gameplay rules.
```

Rule:

```txt
Game must remain playable without login or network.
Score save should be non-blocking.
```

---

## 5.7. Audio layer

```txt
Owner files:
- src/utils/audio-manager.ts
- src/hooks/useGameSound.ts
- other:
```

Audio được sở hữu:

```txt
[ ] AudioContext.
[ ] BGM.
[ ] SFX.
[ ] Mute state.
[ ] Preload/decode.
[ ] User gesture unlock.
[ ] Audio cleanup.
```

Audio không được sở hữu:

```txt
[ ] Gameplay core.
[ ] Score rule.
[ ] Pixi app creation.
[ ] UI layout.
[ ] Firebase.
```

Rule:

```txt
Core never knows audio exists.
Components call audio through hook/callback.
```

---

# 6. Forbidden Dependency Contract

Các import edge này bị cấm.

|Forbidden edge|Reason|
|---|---|
|`core -> React`|Core phải pure.|
|`core -> PixiJS`|Render không được nằm trong gameplay truth.|
|`core -> Firebase/API`|Game rule không phụ thuộc network.|
|`core -> localStorage/window/document`|Core không phụ thuộc browser.|
|`core -> audio-manager`|Gameplay không biết sound tồn tại.|
|`data/lib -> UI component`|Data layer không phụ thuộc view.|
|`render hook -> Firebase/API`|Render không save data.|
|`input hook -> score persistence`|Input không save score.|
|`UI primitive -> game core mutation`|UI primitive phải generic.|
|`production -> test helper`|Prod code không import test code.|

## Allowed dependency direction

```txt
App/Page
-> UI components
-> hooks/runtime/input/render
-> core/types/config
-> lib/data/audio where needed
```

Nhưng:

```txt
core/types/config
must not import back upward into UI/runtime/render/data.
```

---

# 7. Default Forbidden Files

Những file này mặc định không được sửa trừ khi task cho phép rõ:

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
```

Rules:

```txt
[ ] Không thêm dependency nếu task không cho phép.
[ ] Không xóa dependency trong cùng patch với move/refactor file lớn.
[ ] Không sửa tests chỉ để làm test pass.
[ ] Không disable lint/typecheck.
[ ] Không sửa config để né lỗi.
```

---

# 8. Behavior Preservation Contract

Mỗi patch phải ghi behavior cần giữ.

## Default behavior to preserve

```txt
[ ] Route behavior không đổi.
[ ] Visual design không drift ngoài Figma/design contract.
[ ] Gameplay rule không đổi nếu task không yêu cầu.
[ ] Score formula không đổi nếu task không yêu cầu.
[ ] Input feel không đổi nếu task không yêu cầu.
[ ] Save score/local fallback không đổi nếu task không yêu cầu.
[ ] Audio behavior không đổi nếu task không yêu cầu.
[ ] Responsive behavior không bị vỡ.
```

## Game-specific behavior to preserve

```txt
[ ] Start game.
[ ] Replay.
[ ] Game over.
[ ] Win/lose condition.
[ ] Score increase.
[ ] Timer/countdown.
[ ] Keyboard/touch/pointer input.
[ ] Mobile layout.
[ ] Leaderboard/save score nếu có.
```

---

# 9. Patch Scope Contract

Mỗi task phải tạo scope riêng theo format này.

```txt
Goal:
- ...

Non-goals:
- ...

Allowed files:
- ...

Forbidden files:
- ...

Allowed changes:
- ...

Forbidden changes:
- ...

Behavior to preserve:
- ...

Validation commands:
- ...

Stop conditions:
- ...

Definition of done:
- ...
```

Rule:

```txt
Checklist does not expand allowed files.
If an issue is outside allowed files, report it as follow-up instead of editing it.
```

---

# 10. Stop Conditions

Agent phải dừng và report nếu gặp một trong các trường hợp sau:

```txt
[ ] Cần sửa file ngoài Allowed files.
[ ] Cần đổi gameplay trong UI-only task.
[ ] Cần đổi UI trong core-only task.
[ ] Cần thêm/xóa dependency.
[ ] Cần sửa config để build pass.
[ ] Cần sửa test expected behavior.
[ ] Baseline build/test đã fail sẵn vì lỗi ngoài scope.
[ ] Diff quá rộng so với task.
[ ] Không xác định được ownership.
[ ] Cần apply PixiJS nhưng chưa có render contract.
[ ] Cần proceed sang phase tiếp theo.
```

Khi stop, report theo mẫu:

```txt
Need out-of-scope change:
- file:
- reason:
- risk if not changed:
- suggested separate task:
```

---

# 11. Project-Specific Map

Điền phần này cho từng project.

## Runtime

```txt
Entrypoint:
- ...

Active App:
- ...

Routes:
- ...

Main game/screen:
- ...
```

## Core

```txt
Current gameplay source of truth:
- ...

Target gameplay source of truth:
- ...

Core tests:
- existing / missing / target:
```

## UI

```txt
Main UI files:
- ...

Generated giant components:
- ...

Reusable UI primitives:
- ...

Scaffold UI:
- ...
```

## Render

```txt
Current render layer:
- React DOM / Canvas / PixiJS / mixed / unknown

Target render layer:
- ...

PixiJS needed:
[ ] No
[ ] Not yet
[ ] Yes, only for game/render layer
[ ] Need render contract first
```

## Data

```txt
Storage:
- none / localStorage / Firebase / API / mixed

Score/leaderboard:
- none / local / remote / mixed

Auth:
- none / mock / real / unknown
```

## Audio

```txt
Audio:
- none / simple HTMLAudio / audio-manager / unknown

Owner:
- ...
```

---

# 12. Refactor Readiness

Chỉ được chuyển sang refactor khi đạt:

```txt
[ ] Project type rõ.
[ ] Runtime path rõ.
[ ] Route map rõ hoặc single-screen xác nhận.
[ ] Reachable/scaffold map rõ.
[ ] Ownership matrix rõ.
[ ] Core/render/UI/data/audio boundaries rõ.
[ ] Forbidden dependency rules rõ.
[ ] First safe patch rõ.
[ ] Allowed files rõ.
[ ] Forbidden files rõ.
[ ] Behavior to preserve rõ.
[ ] Validation command rõ.
```

Nếu thiếu một mục, quay lại triage/handoff.

---

# 13. First Safe Patch

Điền patch đầu tiên sau contract.

```txt
First safe patch:
- ...

Why:
- ...

Allowed files:
- ...

Forbidden files:
- ...

Behavior to preserve:
- ...

Validation:
- ...

Expected report:
- changed files
- behavior preserved
- commands run
- risks/follow-up
```

Patch đầu tiên nên là một trong các loại:

```txt
[ ] Normalize layout shell.
[ ] Extract one content config.
[ ] Extract one pure helper.
[ ] Extract one isolated hook.
[ ] Add one core test.
[ ] Create report-only scaffold list.
[ ] Wrap generated visual prototype.
```

Patch đầu tiên không nên là:

```txt
[ ] Apply PixiJS to whole UI.
[ ] Add Firebase/Supabase/auth.
[ ] Delete unused dependencies.
[ ] Refactor all components.
[ ] Move many folders.
[ ] Rewrite router.
[ ] Deep-refactor generated giant component.
```

---

# 14. Verification Commands

Chỉ chạy script có thật trong `package.json`.

```txt
Available scripts:
- build:
- typecheck:
- test:
- lint:
- e2e:
```

Default validation:

```txt
[ ] npm run typecheck, nếu có.
[ ] npm test, nếu có.
[ ] npm run build, nếu có.
[ ] npm run lint, nếu có.
[ ] git diff --check.
[ ] git status --short.
[ ] git diff --stat.
```

Rules:

```txt
[ ] Nếu script không tồn tại, report “not available”.
[ ] Không tạo script mới chỉ để validate.
[ ] Không chạy lint --fix trong audit mode.
[ ] Không update snapshot nếu không được yêu cầu.
```

---

# 15. Project Contract Summary

Điền summary ngắn sau khi hoàn tất contract.

```txt
Project contract status:
[ ] Ready for first safe patch
[ ] Not ready
[ ] Blocked

Project type:
- ...

Strategy:
- ...

Runtime:
- ...

Core owner:
- ...

Render owner:
- ...

UI owner:
- ...

Data owner:
- ...

Audio owner:
- ...

First safe patch:
- ...

Do not touch:
- ...

Validation:
- ...

Main risks:
- ...
```

---

# 16. Final Rule

Không được refactor nếu chưa trả lời được:

```txt
[ ] Project này là loại gì?
[ ] Runtime thật đi qua file nào?
[ ] Game/core truth nằm ở đâu?
[ ] UI layer nằm ở đâu?
[ ] Render/PixiJS layer nằm ở đâu?
[ ] Data/audio layer nằm ở đâu?
[ ] File nào được sửa?
[ ] File nào không được sửa?
[ ] Behavior nào phải giữ?
[ ] Verify bằng gì?
```

Câu chốt:

```txt
Triage tells what the project is.
Project contract tells what must not break.
Only after this contract is clear can refactor begin.
```