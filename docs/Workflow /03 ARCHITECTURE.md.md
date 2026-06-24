

File này mô tả kiến trúc thật của project.

Mục tiêu của file này là giúp người hoặc AI agent hiểu:

```txt
Project chạy từ đâu?
Route nào là runtime thật?
File nào là source of truth?
Layer nào sở hữu logic nào?
Luồng game đi như thế nào?
Luồng render đi như thế nào?
Luồng input đi như thế nào?
Luồng data/save-score đi như thế nào?
Code mới nên đặt ở đâu?
Code nào đang là scaffold hoặc chưa chắc có chạy thật?
```

File này không phải là task refactor.  
File này không phải là luật agent.  
File này không phải là design system.

Các file liên quan:

```txt
01-FIGMA-TRIAGE-HANDOFF.md
= Kết quả triage và quyết định đầu vào.

02-PROJECT-CONTRACT.md
= Luật project, behavior cần giữ, forbidden dependency.

03-ARCHITECTURE.md
= Kiến trúc hiện tại và target architecture.

04-AGENTS.md
= Luật cho agent khi sửa repo.

05-DESIGN.md
= Design source of truth.

06-DESIGN-APPLICATION-GATE.md
= Checklist cho mỗi UI patch.
```

---

# 0. Architecture Phase Rule

Phase tạo hoặc cập nhật file này là docs-only phase.

```txt
[ ] Không sửa runtime code.
[ ] Không move file.
[ ] Không rename file.
[ ] Không xóa dependency.
[ ] Không tách component.
[ ] Không apply PixiJS.
[ ] Không thêm feature.
[ ] Không sửa UI/CSS.
[ ] Chỉ mô tả kiến trúc hiện tại và target architecture nếu cần.
```

Nếu phát hiện kiến trúc hiện tại chưa rõ, ghi vào:

```txt
Known Risks
Unknowns
Follow-up Audit Needed
```

Không tự sửa code trong phase này.

---

# 1. Project Summary

```txt
Project name:
Project source:
Project type:
Game type:
Main platform:
Current strategy:
Architecture status:
Last verified:
```

## Project source

Chọn một hoặc nhiều:

```txt
[ ] Figma Make
[ ] Figma-to-code
[ ] Design-to-code
[ ] Hand-written React
[ ] Mixed generated + hand-written
[ ] Unknown
```

## Project type

Chọn một:

```txt
[ ] Visual prototype
[ ] Mini web app
[ ] Landing/template scaffold
[ ] Game-first web app
[ ] Mixed/unclear
```

## Game type, nếu có

```txt
[ ] Board puzzle
[ ] Merge game
[ ] Arcade/action
[ ] Drag/drop puzzle
[ ] Serving/path game
[ ] Idle/clicker
[ ] Other:
[ ] Not a game
```

## Current strategy

```txt
[ ] wrap, do not deep-refactor
[ ] preserve core flow, extract hooks and pure logic
[ ] extract content, sections, reusable UI
[ ] deepen triage before refactor
[ ] isolate game core, then apply render layer
[ ] custom:
```

---

# 2. Runtime Entry Map

Runtime path thật của app.

```txt
index.html
-> src/main.tsx
-> ...
-> active App/router
-> active route/component
```

## Current runtime entry

```txt
Entrypoint:
- ...

Active App:
- ...

Router owner:
- ...

Main screen:
- ...

Runtime confidence:
- High / Medium / Low
```

## Evidence

```txt
Command:
- ...

Result:
- ...

Notes:
- ...
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
```

---

# 3. Route Map

## Route table

|Route|Component|File|Runtime reachable|Notes|Confidence|
|---|---|---|---|---|---|
|`/`||||||
|`/game`||||||
|`/settings`||||||

## If no router exists

```txt
No explicit route system.
Single-screen app.

Runtime component:
- ...

Notes:
- ...
```

## Route rules

```txt
[ ] Route map must reflect runtime code, not guessed file names.
[ ] If duplicate routers exist, mark which one is active.
[ ] If route ownership is unclear, mark as Unknown and audit more.
```

---

# 4. Current Architecture Graph

Vẽ kiến trúc hiện tại theo code đang có thật.

Không vẽ kiến trúc mong muốn ở phần này.

```txt
Current:
<fill current graph here>
```

Ví dụ template:

```txt
src/main.tsx
  -> src/App.tsx
    -> Page / Screen
      -> UI components
      -> hooks
      -> core logic
      -> render layer
      -> data layer
```

Ví dụ cho game:

```txt
src/main.tsx
  -> src/app/App.tsx
    -> src/components/game/GamePage.tsx
      -> src/components/game/GameScreen.tsx
        -> GameBoard / CanvasArea
        -> GameHUD
        -> GameOverOverlay
        -> useGameSession
        -> useGameInput
        -> useGameRender
        -> core.ts
        -> useScoreData
```

## Current architecture notes

```txt
What is clean:
- ...

What is mixed:
- ...

What is risky:
- ...

What is unknown:
- ...
```

---

# 5. Target Architecture Graph

Target architecture là hướng muốn đạt sau refactor.

Không được ghi target architecture như thể nó đã tồn tại.

Phải gắn label rõ:

```txt
Status:
[ ] Current
[ ] Target
[ ] Planned
[ ] Deprecated
[ ] Unknown
```

## Target graph

```txt
Target:
App / Router
  -> Page / Screen
    -> UI composition
    -> Runtime layer
    -> Input layer
    -> Render layer
    -> Core layer
    -> Data layer
    -> Audio layer
```

Ví dụ target cho game:

```txt
src/app/App.tsx
  -> src/pages/GamePage.tsx
    -> src/components/game/GameScreen.tsx
      -> src/components/game/GameBoard.tsx
      -> src/components/game/GameHUD.tsx
      -> src/components/game/GameOverOverlay.tsx

src/game/
  -> core.ts
  -> types.ts
  -> config.ts

src/features/game/runtime/
  -> session / timer / replay / game-over / ticker orchestration

src/features/game/input/
  -> keyboard / pointer / touch / drag / swipe / coordinate conversion

src/features/game/render/
  -> Pixi app / canvas / stage / textures / sprites / particles / effects

src/lib/
  -> Firebase / API / localStorage helpers

src/hooks/
  -> React-facing app/data/audio hooks

src/content/
  -> static copy / guide text / labels / config content
```

## Target architecture notes

```txt
Target benefits:
- ...

Migration risks:
- ...

Must preserve:
- ...

Must not change yet:
- ...
```

---

# 6. Layer Ownership

Phần này mô tả layer nào sở hữu cái gì.

Luật chi tiết nằm ở `02-PROJECT-CONTRACT.md`.  
Ở đây chỉ ghi kiến trúc và file owner.

---

## 6.1. Core Layer

```txt
Owner files:
- src/game/core.ts
- src/game/types.ts
- src/game/config.ts
- other:
```

Core owns:

```txt
[ ] Game state shape.
[ ] Initial state.
[ ] State transitions.
[ ] Gameplay rules.
[ ] Score rules.
[ ] Win/lose conditions.
[ ] Valid/invalid actions.
[ ] Pure helpers.
[ ] Deterministic logic.
```

Core must not own:

```txt
[ ] React.
[ ] PixiJS.
[ ] DOM events.
[ ] window/document.
[ ] localStorage/sessionStorage.
[ ] Firebase/API/network.
[ ] Audio.
[ ] CSS.
[ ] UI components.
```

Current status:

```txt
[ ] Clean
[ ] Mixed
[ ] Missing
[ ] Unknown
```

Notes:

```txt
- ...
```

---

## 6.2. Runtime Layer

```txt
Owner files:
- src/features/game/runtime/*
- src/hooks/*
- other:
```

Runtime owns:

```txt
[ ] Session start/reset.
[ ] Countdown/timer.
[ ] Replay.
[ ] Game-over guard.
[ ] Ticker orchestration if the game has a loop.
[ ] Bridge between core, input, render, and UI.
```

Runtime must not own:

```txt
[ ] Texture generation.
[ ] Sprite ownership.
[ ] Firebase implementation.
[ ] UI layout.
[ ] Visual design tokens.
[ ] Low-level audio engine.
```

Current status:

```txt
[ ] Clean
[ ] Mixed
[ ] Missing
[ ] Unknown
```

Notes:

```txt
- ...
```

---

## 6.3. Input Layer

```txt
Owner files:
- src/features/game/input/*
- other:
```

Input owns:

```txt
[ ] Keyboard input.
[ ] Pointer/mouse/touch input.
[ ] Drag/drop.
[ ] Swipe.
[ ] Coordinate conversion.
[ ] Input normalization.
[ ] Listener setup/cleanup.
```

Input must not own:

```txt
[ ] Score formula.
[ ] Win/lose rule.
[ ] Score persistence.
[ ] Firebase/localStorage.
[ ] UI layout.
[ ] Texture/sprite cleanup.
```

Current status:

```txt
[ ] Clean
[ ] Mixed
[ ] Missing
[ ] Unknown
```

Notes:

```txt
- ...
```

---

## 6.4. Render / PixiJS / Canvas Layer

```txt
Owner files:
- src/features/game/render/*
- src/components/background/*
- other:
```

Render owns:

```txt
[ ] Pixi Application/canvas if used.
[ ] Stage/layers.
[ ] Resize/DPR lifecycle.
[ ] Texture/asset lifecycle.
[ ] Sprite/object lifecycle.
[ ] Particles.
[ ] Visual effects.
[ ] Background animation.
[ ] Render sync from game state.
```

Render must not own:

```txt
[ ] Gameplay truth.
[ ] Score saving.
[ ] Firebase/localStorage.
[ ] Route behavior.
[ ] React modal logic.
[ ] Static copy/content.
```

Current render mode:

```txt
[ ] React DOM
[ ] Canvas
[ ] PixiJS
[ ] Mixed
[ ] Unknown
```

PixiJS needed:

```txt
[ ] No
[ ] Not yet
[ ] Yes, only for game/render layer
[ ] Need render contract first
```

Notes:

```txt
- ...
```

---

## 6.5. UI Layer

```txt
Owner files:
- src/components/game/*
- src/components/ui/*
- src/app/*
- src/pages/*
- other:
```

UI owns:

```txt
[ ] JSX layout.
[ ] HUD.
[ ] Panels.
[ ] Modals.
[ ] Buttons.
[ ] Menus.
[ ] Dashboard.
[ ] Responsive layout.
[ ] Static visual composition.
```

UI must not own:

```txt
[ ] Core simulation.
[ ] Score formula.
[ ] Network save implementation.
[ ] Pixi resource cleanup.
[ ] AudioContext.
```

Current status:

```txt
[ ] Clean
[ ] Mixed
[ ] Generated-heavy
[ ] Unknown
```

Notes:

```txt
- ...
```

---

## 6.6. Data / Storage Layer

```txt
Owner files:
- src/lib/*
- src/services/*
- src/hooks/useScoreData.ts
- other:
```

Data owns:

```txt
[ ] Firebase/API calls.
[ ] localStorage fallback.
[ ] Leaderboard.
[ ] User stats.
[ ] Save score.
[ ] Loading/error state for data.
```

Data must not own:

```txt
[ ] Pixi app.
[ ] Game loop.
[ ] Sprite/texture.
[ ] UI visual layout.
[ ] Gameplay rules.
```

Current data mode:

```txt
[ ] None
[ ] localStorage only
[ ] Firebase
[ ] API
[ ] Mixed
[ ] Unknown
```

Notes:

```txt
- ...
```

---

## 6.7. Audio Layer

```txt
Owner files:
- src/utils/audio-manager.ts
- src/hooks/useGameSound.ts
- other:
```

Audio owns:

```txt
[ ] AudioContext.
[ ] BGM.
[ ] SFX.
[ ] Mute state.
[ ] Preload/decode.
[ ] User gesture unlock.
[ ] Cleanup.
```

Audio must not own:

```txt
[ ] Gameplay core.
[ ] Score rule.
[ ] Pixi app creation.
[ ] UI layout.
[ ] Firebase.
```

Current audio mode:

```txt
[ ] None
[ ] HTMLAudio
[ ] Audio manager
[ ] Hook wrapper
[ ] Unknown
```

Notes:

```txt
- ...
```

---

# 7. Data Flow

Mô tả các luồng chính.

---

## 7.1. Game State Flow

```txt
User input
-> input layer normalizes action
-> core applies action
-> runtime updates session state
-> UI/render display new state
```

Current flow:

```txt
<fill current flow>
```

Target flow:

```txt
<fill target flow>
```

Risks:

```txt
- ...
```

---

## 7.2. Render Flow

```txt
Core/runtime state
-> render sync function
-> Pixi/canvas/DOM render layer
-> visual output
```

Current flow:

```txt
<fill current flow>
```

Target flow:

```txt
<fill target flow>
```

Risks:

```txt
- ...
```

---

## 7.3. Input Flow

```txt
Keyboard/pointer/touch
-> input normalization
-> action/intent
-> core/runtime
-> UI/render update
```

Current flow:

```txt
<fill current flow>
```

Target flow:

```txt
<fill target flow>
```

Risks:

```txt
- ...
```

---

## 7.4. UI Flow

```txt
State/hooks
-> UI components
-> user clicks/buttons/modals
-> callbacks/actions
-> runtime/core/data layer
```

Current flow:

```txt
<fill current flow>
```

Target flow:

```txt
<fill target flow>
```

Risks:

```txt
- ...
```

---

## 7.5. Score / Data Flow

```txt
Game ends
-> core/runtime produces GameResult
-> UI shows result
-> local state/localStorage updates
-> if user logged in, data layer saves score
-> if save fails, show non-blocking error
```

Current flow:

```txt
<fill current flow>
```

Target flow:

```txt
<fill target flow>
```

Risks:

```txt
- ...
```

---

## 7.6. Audio Flow

```txt
User gesture / game event
-> React hook/callback
-> audio manager
-> BGM/SFX
```

Current flow:

```txt
<fill current flow>
```

Target flow:

```txt
<fill target flow>
```

Risks:

```txt
- ...
```

---

# 8. File Map

## 8.1. Runtime / Reachable Files

|File|Reached from|Layer|Notes|Confidence|
|---|---|---|---|---|
||||||

## 8.2. Non-runtime / Scaffold Candidates

|File/Folder|Reason|Safe Action|Confidence|
|---|---|---|---|
|||report only||
|||quarantine later||
|||cleanup later||

Rules:

```txt
[ ] Scaffold files are not deleted in architecture phase.
[ ] Scaffold files are documented only.
[ ] Cleanup must happen in a separate cleanup patch.
```

---

# 9. Component Map

|Component|File|Role|Layer|Risk|Notes|
|---|---|---|---|---|---|
|||App shell|UI|||
|||Page/screen composition|UI|||
|||Game board/canvas|UI/render boundary|||
|||HUD|UI|||
|||Modal/overlay|UI|||
|||Generated giant component|Visual prototype|high||

Risk scale:

```txt
0-150 lines: low
150-400 lines: medium
400-800 lines: high
800+ lines: generated giant
```

Notes:

```txt
- ...
```

---

# 10. Dependency Architecture

## 10.1. Runtime Dependencies

|Dependency|Used by|Layer|Keep?|Notes|
|---|---|---|---|---|
||||||

## 10.2. Scaffold-only / Unknown Dependencies

|Dependency|Evidence|Action|Confidence|
|---|---|---|---|
|||investigate||
|||cleanup later||

Rules:

```txt
[ ] Do not delete dependencies in architecture phase.
[ ] Do not delete dependency only because it looks unused.
[ ] Cleanup dependencies only in a dedicated cleanup patch.
[ ] Lockfile changes require explicit scope.
```

---

# 11. Architecture Decisions

Ghi lại quyết định kiến trúc quan trọng.

---

## ADR-001 — Core remains pure

```txt
Decision:
Core gameplay logic must remain pure and cannot import React, PixiJS, DOM, Firebase, localStorage, audio, or CSS.

Reason:
Core should be testable, deterministic, and reusable across render layers.

Consequence:
UI/input/render layers must send actions to core instead of duplicating gameplay rules.
```

---

## ADR-002 — React owns UI, PixiJS owns render runtime

```txt
Decision:
React owns UI layout, HUD, modal, panels, and route composition.
PixiJS only owns game/canvas/animation-heavy render layer.

Reason:
Normal UI is easier, more accessible, and more maintainable in React/CSS.
PixiJS is useful only for high-frequency visual rendering.

Consequence:
Do not render navbar, modal, footer, forms, or dashboard text in PixiJS.
```

---

## ADR-003 — Data saving is non-blocking

```txt
Decision:
Score saving and leaderboard sync must not block gameplay.

Reason:
Game must remain playable without login or network.

Consequence:
Firebase/API errors become UI messages, not game crashes.
```

---

## ADR-004 — Refactor uses small patches

```txt
Decision:
Each refactor phase must touch a strict file list and preserve behavior.

Reason:
Generated/Figma code and game code are fragile when refactored broadly.

Consequence:
Out-of-scope issues are reported, not patched.
```

---

## ADR-005 — Architecture docs must separate Current and Target

```txt
Decision:
Architecture.md must not describe planned architecture as if it already exists.

Reason:
Agents can hallucinate implemented files or boundaries if docs mix current state with target state.

Consequence:
Every future-state section must be labeled Target, Planned, or Unknown.
```

---

# 12. Known Risks

|Risk|Area|Severity|Mitigation|
|---|---|---|---|
||runtime|||
||UI|||
||render|||
||data|||
||dependency|||

Risk examples:

```txt
Generated giant component is too large to deep-refactor safely.
Runtime path has duplicate App/router.
Pixi render layer may be mixed with game logic.
localStorage/Firebase may be inside UI component.
Unused scaffold may still import heavy dependencies.
Design doc may imply landing-page layout.
Game core may be missing or mixed into UI.
```

---

# 13. Unknowns

Ghi rõ những gì chưa chắc.

```txt
[ ] Exact active route is unclear.
[ ] Some files may be dynamically imported.
[ ] Build/test status unknown.
[ ] PixiJS ownership unclear.
[ ] Core gameplay source of truth unclear.
[ ] Data layer boundary unclear.
[ ] components/ui usage unclear.
[ ] Dependency usage unclear.
[ ] Generated scaffold status unclear.
```

Rules:

```txt
[ ] Unknowns must be resolved by audit before broad refactor.
[ ] Do not guess architecture.
[ ] Do not write unknown target files as if they exist.
```

---

# 14. Where New Code Should Go

## Gameplay logic

```txt
src/game/core.ts
src/game/types.ts
src/game/config.ts
```

## Runtime orchestration

```txt
src/features/<game>/runtime/*
```

## Input

```txt
src/features/<game>/input/*
```

## Render / PixiJS

```txt
src/features/<game>/render/*
```

## UI components

```txt
src/components/game/*
src/components/ui/*
src/pages/*
src/app/*
```

## Data / API / storage

```txt
src/lib/*
src/services/*
src/hooks/useScoreData.ts
```

## Audio

```txt
src/utils/audio-manager.ts
src/hooks/useGameSound.ts
```

## Static content

```txt
src/content/*
src/features/<feature>/<feature>.content.ts
```

## Tests

```txt
src/game/*.test.ts
src/features/**/*.test.ts
```

---

# 15. Where New Code Must Not Go

```txt
[ ] Do not put gameplay rules inside UI components.
[ ] Do not put Firebase/API calls inside render hooks.
[ ] Do not put PixiJS resource cleanup inside core.
[ ] Do not put AudioContext inside core.
[ ] Do not put route logic inside UI primitives.
[ ] Do not put content/copy inside reusable primitives.
[ ] Do not put test helpers into production imports.
[ ] Do not put score persistence inside input hooks.
[ ] Do not put design tokens inside gameplay core.
```

---

# 16. Architecture Readiness

Before any code refactor, confirm:

```txt
[ ] Runtime path is documented.
[ ] Route map is documented.
[ ] Current architecture graph is documented.
[ ] Target architecture graph is documented if needed.
[ ] Layer ownership is documented.
[ ] File map is documented.
[ ] Component map is documented.
[ ] Dependency architecture is documented.
[ ] Known risks are documented.
[ ] Unknowns are listed.
[ ] First safe patch is defined in project contract.
```

If not all checked, do not refactor yet.

---

# 17. Architecture Update Rules

Update this file when:

```txt
[ ] A new layer is introduced.
[ ] Gameplay source of truth moves.
[ ] Render ownership changes.
[ ] Route structure changes.
[ ] Data/storage boundary changes.
[ ] Audio system changes.
[ ] A new major feature changes flow.
[ ] Dependency graph changes meaningfully.
[ ] A scaffold folder is quarantined or removed.
```

Do not update this file to describe a desired future state as if it already exists.

Use labels:

```txt
Current:
Target:
Planned:
Deprecated:
Unknown:
```

---

# 18. Architecture Summary

```txt
Architecture status:
[ ] Current architecture documented
[ ] Target architecture documented
[ ] Not enough information

Runtime:
- ...

Core:
- ...

Runtime layer:
- ...

Input:
- ...

UI:
- ...

Render:
- ...

Data:
- ...

Audio:
- ...

Main risks:
- ...

Unknowns:
- ...

First safe patch reference:
- See 02-PROJECT-CONTRACT.md
```

---

# 19. Final Rule

```txt
ARCHITECTURE.md tells where code belongs.
PROJECT-CONTRACT.md tells what must not break.
AGENTS.md tells how agents must behave.
DESIGN.md tells what UI should look like.
TASK-CONTRACT.md controls the current patch.
```