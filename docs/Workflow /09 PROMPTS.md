

File này là kho prompt dùng lại cho project game / Figma Make / React / PixiJS.

Mục tiêu của file này:

```txt
[ ] Có prompt chuẩn cho từng phase.
[ ] Không phải nghĩ prompt lại từ đầu.
[ ] Không giao việc quá rộng cho agent.
[ ] Ép agent làm one phase / one patch.
[ ] Ép agent nêu allowed files, forbidden files, behavior to preserve.
[ ] Ép agent stop nếu task vượt scope.
[ ] Ép agent report sau khi sửa.
```

File này không thay thế:

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

Prompts chỉ là công cụ thực thi.  
Contract và gates mới là luật.

---

# 0. Global Prompt Rules

Dán phần này vào đầu mọi prompt nếu task có rủi ro.

```txt
You are working on one phase only.

Do not proceed to the next phase.
Do not fix unrelated issues.
Do not edit files outside Allowed files.
Checklist items do not expand Allowed files.
If an issue is out of scope, report it as follow-up.
Preserve current visual design.
Preserve current gameplay behavior.
Do not add or remove dependencies unless explicitly allowed.
Run available verification commands.
Return a patch/phase report.
```

---

# 1. Prompt — Figma Make Triage

Dùng khi project đến từ Figma Make / Figma-to-code / design-to-code / AI-generated UI.

```txt
Use figma-make-triage in analysis-only mode.

Analyze this Figma Make or design-to-code exported codebase.

Do not modify files.

Goal:
Identify what is real runtime code, what is generated visual code, what is scaffold, and what the first safe patch should be.

Tasks:
1. Trace runtime from index.html to src/main.tsx to the active App/router.
2. Create a route map.
3. Create a reachable file map from src/main.tsx.
4. Identify non-runtime TS/TSX files and scaffold candidates.
5. Check whether components/ui is used by runtime code.
6. Check whether shadcn/Radix dependencies are actually imported by reachable files.
7. Compare package.json dependencies against runtime imports.
8. List the largest TS/TSX components by line count.
9. Identify files mixing UI, state, routing, event handling, animation, storage, API, audio, timers, keyboard logic, or business logic.
10. Identify hardcoded content and mock data inside components.
11. Classify the project as:
    - visual prototype
    - mini web app
    - landing/template scaffold
    - game-first web app
    - mixed/unclear
12. Recommend a safe refactor order.
13. Recommend the first safe patch.

Rules:
- Do not edit files.
- Do not remove dependencies.
- Do not rename files.
- Do not move files.
- Do not add new features.
- Do not run install, build, format, lint --fix, snapshot update, codegen, or cleanup commands during analysis-only mode.
- Do not suggest a full rewrite unless the app cannot build.
- Output concrete file paths.
- Include commands or evidence used for each conclusion.
- If uncertain, mark confidence and explain what needs deeper audit.

Required output:
Use this report structure:
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

---

# 2. Prompt — Create Figma Triage Handoff

Dùng sau khi đã có triage report.

```txt
Create docs/01-FIGMA-TRIAGE-HANDOFF.md from the existing triage report.

Mode:
docs-only

Inputs:
- Figma Make Triage Report
- Runtime entry map
- Route map
- Reachable/scaffold map
- Dependency usage summary
- Project type classification
- Safe refactor order

Goal:
Convert the triage report into a clear handoff decision before refactor.

Required sections:
1. Project type
2. Recommended strategy
3. Can refactor now?
4. Runtime entry handoff
5. Route handoff
6. Reachable vs scaffold handoff
7. Dependency handoff
8. shadcn/Radix handoff
9. Largest components handoff
10. Mixed responsibilities handoff
11. Hardcoded content handoff
12. First safe patch decision
13. Files to touch
14. Files not to touch
15. Behavior to preserve
16. Validation command
17. Gate before refactor

Rules:
- Do not modify runtime code.
- Do not move or delete files.
- Do not cleanup dependencies.
- Do not apply PixiJS.
- Do not start refactor.
- If evidence is missing, mark Unknown and recommend deeper triage.

Output:
Return the complete markdown content for docs/01-FIGMA-TRIAGE-HANDOFF.md.
```

---

# 3. Prompt — Create Project Contract

Dùng sau handoff.

```txt
Create docs/02-PROJECT-CONTRACT.md.

Mode:
docs-only

Inputs:
- docs/01-FIGMA-TRIAGE-HANDOFF.md
- Runtime entry map
- Project type
- First safe patch
- Current architecture observations

Goal:
Define what must not break before refactoring.

Required sections:
1. Project identity
2. Runtime contract
3. Product contract
4. Core/gameplay contract
5. Runtime/input/render/UI/data/audio ownership
6. Forbidden dependency edges
7. Default forbidden files
8. Behavior preservation contract
9. Patch scope contract
10. Stop conditions
11. First safe patch
12. Verification commands
13. Project contract summary

Rules:
- Do not modify runtime code.
- Do not implement architecture changes.
- Do not create target files as if they already exist.
- Label unclear items as Unknown.
- Preserve game-first product rule if applicable.
- State that PixiJS is render-only, not UI/layout, unless explicitly approved.

Output:
Return the complete markdown content for docs/02-PROJECT-CONTRACT.md.
```

---

# 4. Prompt — Create Architecture.md

Dùng để vẽ kiến trúc, không viết agent rules.

```txt
Create docs/03-ARCHITECTURE.md.

Mode:
docs-only

Inputs:
- docs/01-FIGMA-TRIAGE-HANDOFF.md
- docs/02-PROJECT-CONTRACT.md
- Runtime entry map
- Route map
- Reachable/scaffold map
- Current file structure

Goal:
Document the current architecture and target architecture without modifying code.

Required sections:
1. Project summary
2. Runtime entry map
3. Route map
4. Current architecture graph
5. Target architecture graph
6. Layer ownership
7. Game state flow
8. Input flow
9. Render flow
10. UI flow
11. Score/data flow
12. Audio flow
13. File map
14. Component map
15. Dependency architecture
16. Architecture decisions
17. Known risks
18. Unknowns
19. Where new code should go
20. Where new code must not go
21. Architecture readiness
22. Architecture summary

Rules:
- Do not modify runtime code.
- Do not move files.
- Do not rename files.
- Do not delete dependencies.
- Do not mix agent rules into this file.
- Do not mix design rules into this file.
- Label every future-state section as Target, Planned, or Unknown.
- Do not describe target architecture as if it already exists.

Output:
Return the complete markdown content for docs/03-ARCHITECTURE.md.
```

---

# 5. Prompt — Create AGENTS.md

Dùng để tạo luật cho agent ở root repo.

```txt
Create AGENTS.md for this repository.

Mode:
docs-only

Inputs:
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- docs/05-DESIGN.md if available
- docs/08-VERIFICATION-GATES.md if available

Goal:
Define how AI agents must work in this repo.

Required sections:
1. Primary rule
2. Files to read first
3. Priority order
4. Operating modes
5. Scope rules
6. Default forbidden files
7. Stop conditions
8. No destructive fixes
9. Git safety
10. Command safety
11. Architecture boundaries
12. Game-first product rules
13. Design rules for UI tasks
14. PixiJS rules
15. Dependency rules
16. Scaffold/generated code rules
17. High-risk changes
18. Feature-add rules
19. Small patch loop
20. Verification rules
21. Required report after editing
22. Definition of done

Rules:
- Do not modify runtime code.
- AGENTS.md must be operational, strict, and short enough for agents to follow.
- State that analysis-only is default.
- State that small-patch-refactor requires explicit scoped request.
- State that allowed files are strict.
- State that out-of-scope issues are reported, not patched.
- State that agent must not proceed to next phase automatically.

Output:
Return the complete markdown content for AGENTS.md.
```

---

# 6. Prompt — Create DESIGN.md

Dùng để khóa design source of truth.

```txt
Create docs/05-DESIGN.md.

Mode:
docs-only

Inputs:
- Figma frame or design source
- Existing app UI
- User product intent
- Project type
- Screen type
- Previous UI drift issues if any

Goal:
Create the design source of truth for UI/component/layout work.

Required sections:
1. Purpose
2. Related files
3. Design status
4. Product design intent
5. Screen type
6. Visual hierarchy
7. Layout contract
8. Figma/design references
9. Theme/vibe
10. Color system
11. Typography
12. Spacing/radius/shadow/border
13. Surface/panel system
14. Component design rules
15. Content/copy rules
16. Motion/animation
17. Responsive behavior
18. Accessibility/usability
19. Do not add
20. Design drift risks
21. Design change process
22. Updating DESIGN.md
23. Design summary

Rules:
- Do not modify UI code.
- Do not implement the design.
- Do not create CSS.
- Do not invent a new UI direction if the design source is unclear.
- If this is a game-first app, state clearly:
  This is a game-first product, not a landing page.
  The game board/canvas must remain the primary visual area.
  TopNav/Footer/Dashboard are supporting UI only.
  Do not add hero sections, marketing CTA, feature cards, or long landing scroll unless explicitly requested.

Output:
Return the complete markdown content for docs/05-DESIGN.md.
```

---

# 7. Prompt — Create Design Application Gate

Dùng để tạo checklist cho UI patch.

```txt
Create docs/06-DESIGN-APPLICATION-GATE.md.

Mode:
docs-only

Inputs:
- docs/05-DESIGN.md
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- AGENTS.md

Goal:
Create a gate checklist for every UI/component/layout patch.

Required sections:
1. Primary rule
2. Required inputs
3. UI task classification
4. Scope gate
5. Product type gate
6. Design source gate
7. Visual hierarchy gate
8. Layout/grid gate
9. Component ownership gate
10. Token gate
11. Content/copy gate
12. Game behavior preservation gate
13. Render/PixiJS boundary gate
14. Responsive/touch gate
15. Accessibility/usability gate
16. Visual drift gate
17. Before editing checklist
18. After editing checklist
19. UI patch report format
20. Pass/fail criteria
21. Revert UI drift gate
22. Design gate summary

Rules:
- Do not modify UI code.
- Do not implement any design changes.
- This gate does not expand allowed files.
- If design issue is out of scope, report it as follow-up.
- UI-only patches must not change gameplay, score, save flow, PixiJS lifecycle, or audio.

Output:
Return the complete markdown content for docs/06-DESIGN-APPLICATION-GATE.md.
```

---

# 8. Prompt — Create Phase Playbook

Dùng để tạo phase order.

```txt
Create docs/07-PHASE-PLAYBOOK.md.

Mode:
docs-only

Inputs:
- docs/01-FIGMA-TRIAGE-HANDOFF.md
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- AGENTS.md
- docs/05-DESIGN.md
- docs/06-DESIGN-APPLICATION-GATE.md
- docs/08-VERIFICATION-GATES.md if available

Goal:
Define the workflow phase order for this repo.

Required phase order:
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

For each phase, include:
1. Goal
2. Inputs required
3. Allowed work
4. Forbidden work
5. Verification
6. Definition of Done
7. Stop conditions

Rules:
- One phase only.
- One patch only.
- Do not proceed automatically.
- Every phase must use TASK-CONTRACT.md.
- Every phase must produce PHASE-REPORT.md.
- PixiJS integration must happen after game core boundaries are clear.
- Dependency cleanup must happen late and in a dedicated patch.

Output:
Return the complete markdown content for docs/07-PHASE-PLAYBOOK.md.
```

---

# 9. Prompt — Create Verification Gates

Dùng để tạo gate tổng.

```txt
Create docs/08-VERIFICATION-GATES.md.

Mode:
docs-only

Inputs:
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- AGENTS.md
- docs/05-DESIGN.md
- docs/06-DESIGN-APPLICATION-GATE.md
- docs/07-PHASE-PLAYBOOK.md

Goal:
Create verification gates for patch/phase completion.

Required gates:
1. Scope Gate
2. Dirty Tree Gate
3. Build / Typecheck / Test Gate
4. Code Graph Gate
5. Architecture Boundary Gate
6. Design Gate
7. Gameplay Behavior Gate
8. Runtime / Lifecycle Gate
9. Data / Storage Gate
10. Audio Gate
11. Dependency / Cleanup Gate
12. Manual Smoke Gate
13. Final Report Gate
14. Phase-specific gate matrix
15. PASS / FAIL / BLOCKED decision
16. Do Not Proceed rule
17. Final Project Gate

Rules:
- A patch is not PASS until required gates pass.
- Missing evidence means BLOCKED, not PASS.
- Gates do not expand scope.
- If a gate finds an out-of-scope issue, report it as follow-up.
- Do not proceed to next phase if any required gate is FAIL or BLOCKED.

Output:
Return the complete markdown content for docs/08-VERIFICATION-GATES.md.
```

---

# 10. Prompt — Small Patch Refactor

Dùng khi bắt đầu sửa code thật.

```txt
Work in a small-patch loop.

Use these files as source of truth:
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- AGENTS.md
- docs/05-DESIGN.md if UI task
- docs/06-DESIGN-APPLICATION-GATE.md if UI task
- docs/08-VERIFICATION-GATES.md
- Current TASK-CONTRACT.md

Task:
Apply only this patch:
<describe exact patch>

Mode:
small-patch-refactor

Allowed files:
<list files>

Forbidden files:
<list files>

Behavior to preserve:
<list behavior>

Validation commands:
<list commands>

Rules:
- Do not touch unrelated files.
- Do not proceed to the next phase.
- Do not refactor generated giant components unless this task specifically targets them.
- Do not add new features unless explicitly requested.
- Do not add/remove dependencies unless explicitly allowed.
- Do not delete scaffold unless this is a dedicated cleanup patch.
- If moving files, update imports only for affected files.
- If an issue requires out-of-scope files, stop and report.

Before editing, output:
1. Mode
2. Goal
3. Files to touch
4. Files not to touch
5. Behavior to preserve
6. Validation commands
7. Stop conditions

After editing, output:
1. Changed files
2. Why each file changed
3. Behavior preserved
4. Verification results
5. git status --short
6. git diff --stat
7. Unexpected changed files
8. Risks/follow-up
9. Next safe patch recommendation

Do not proceed to the next patch.
```

---

# 11. Prompt — Layout/Grid Stabilization

Dùng khi sửa layout shell/grid/responsive.

```txt
Do PHASE 4 — Layout/Grid Stabilization only.

Goal:
Stabilize the layout shell, grid, responsive order, and visual hierarchy.

Allowed files:
<list layout/component/style files>

Forbidden files:
- src/game/*
- src/features/game/render/*
- src/features/game/input/*
- src/features/game/runtime/*
- src/lib/*
- package.json
- lockfiles
- config files
- tests unless explicitly allowed

Design source:
- docs/05-DESIGN.md
- docs/06-DESIGN-APPLICATION-GATE.md

Rules:
- Preserve gameplay behavior.
- Preserve route behavior.
- Preserve score/save behavior.
- Do not change PixiJS lifecycle.
- Do not change game core.
- Do not add hero section, marketing CTA, feature cards, pricing, testimonials, or long landing scroll.
- If this is a game-first app, keep game board/canvas as the primary visual area.
- Mobile must show the game first.
- TopNav and Footer must remain supporting UI.

Verification:
- Run available build/typecheck/test commands.
- Run git diff --check.
- Report git status --short and git diff --stat.
- Run design gate checklist.
- Run manual smoke checks for desktop/mobile layout.

Output:
Return a UI Patch Report.
Do not proceed to component extraction.
```

---

# 12. Prompt — Component Extraction

Dùng khi tách component UI.

```txt
Do PHASE 5 — Component Extraction only.

Goal:
Extract UI components by ownership, not by every div/pixel.

Allowed files:
<list parent component and target component files>

Forbidden files:
- src/game/*
- src/features/game/render/*
- src/features/game/input/*
- src/features/game/runtime/*
- src/lib/*
- package.json
- lockfiles
- config files

Good extraction targets:
- HUD
- Game over overlay
- Login modal
- Settings panel
- Dashboard/stats panel
- Footer
- Button primitive
- Panel primitive

Rules:
- Preserve visual design.
- Preserve responsive behavior.
- Preserve gameplay behavior.
- Do not change score rules.
- Do not change save score flow.
- Do not change PixiJS lifecycle.
- Do not add dependencies.
- Do not deep-refactor generated giant components unless explicitly scoped.
- Extract one component group only.
- Props must be explicit.
- Component should own only its UI responsibility.

Before editing:
- State exact files to touch.
- State props/API to preserve.
- State visual behavior to preserve.

After editing:
- Run available verification.
- Run design gate.
- Report changed files and why.
- Report component ownership result.
- Do not proceed to next component group.
```

---

# 13. Prompt — Game Core Extraction

Dùng khi tách logic game ra core pure.

```txt
Do PHASE 6 — Game Core Extraction only.

Goal:
Extract gameplay logic into pure core files.

Target files:
- src/game/core.ts
- src/game/types.ts
- src/game/config.ts
- src/game/*.test.ts if test scope allows

Allowed files:
<list current game component/core files>

Forbidden files:
- src/features/game/render/*
- src/lib/*
- Firebase/API files
- audio files
- UI style files
- package.json
- lockfiles
- config files

Core owns:
- game state shape
- initial state
- state transitions
- score rules
- win/lose condition
- valid/invalid actions
- pure helpers
- deterministic config

Core must not import:
- React
- PixiJS
- Firebase/API
- window/document
- localStorage/sessionStorage
- audio manager
- CSS
- UI components

Rules:
- Preserve current gameplay behavior unless explicitly requested.
- Do not change UI layout.
- Do not change PixiJS lifecycle.
- Do not change Firebase/localStorage behavior.
- Do not change audio behavior.
- Extract the smallest pure logic unit first.
- Add tests for pure logic if available/scope allows.

Verification:
- Run npm run typecheck if available.
- Run npm test if available.
- Run npm run build if available.
- Run git diff --check.
- Check core forbidden imports.
- Run code graph gate.

Output:
Return Phase 6 report only.
Do not proceed to PixiJS integration.
```

---

# 14. Prompt — PixiJS Render Integration

Dùng khi apply/refactor PixiJS.

```txt
Do PHASE 7 — PixiJS Render Integration only.

Goal:
Apply or stabilize PixiJS only inside the game/render layer.

Allowed files:
<list render hooks/components>

Forbidden files:
- src/game/core.ts unless explicitly allowed
- src/lib/*
- Firebase/API files
- audio files
- normal UI components unrelated to game board
- package.json
- lockfiles
- config files

PixiJS owns:
- canvas
- Pixi Application
- stage/layers
- textures/assets
- sprites
- particles/effects
- animation-heavy render loop
- render sync from game state

PixiJS must not own:
- gameplay truth
- score saving
- Firebase/localStorage
- route behavior
- React modal logic
- static content/copy
- navbar/button/modal/footer/dashboard text

Rules:
- React owns normal UI.
- Core owns game truth.
- PixiJS renders state.
- Do not render navbar, modal, footer, forms, or dashboard text in PixiJS.
- Do not set React state every frame.
- Cleanup ticker/listeners/timers.
- Guard async texture/image assignment after unmount.
- Do not destroy shared textures from the wrong owner.
- Do not call global resource cleanup by default.
- Do not duplicate ticker/listeners after replay/remount.

Verification:
- Run available build/typecheck/test.
- Run lifecycle targeted checks.
- Run forbidden import checks for render layer.
- Run manual smoke:
  game start, replay, resize, mobile input, overlay clicks, console clean.

Output:
Return Phase 7 report only.
Do not proceed to cleanup.
```

---

# 15. Prompt — Data / Score / Firebase Cleanup

Dùng khi sửa score save/localStorage/Firebase.

```txt
Do data/score/storage patch only.

Goal:
<describe exact data/score/storage change>

Allowed files:
<list data/lib/hooks files>

Forbidden files:
- src/game/core.ts unless type contract requires it
- src/features/game/render/*
- UI layout files
- audio files
- package.json
- lockfiles

Rules:
- Game must remain playable without login/network.
- Score saving must be non-blocking.
- Firebase/API failure must not crash the game.
- localStorage fallback must be preserved unless explicitly removed.
- Do not change gameplay score formula unless task explicitly says so.
- Do not change UI layout.
- Do not change PixiJS lifecycle.
- Data layer must not import UI components.
- Render layer must not import data saving.

Verification:
- Run available build/typecheck/test.
- Check GameResult imports.
- Check playTimeSec is not incorrectly hardcoded.
- Check Firebase/localStorage imports.
- Run manual game over/save score smoke if possible.

Output:
Return data patch report.
Do not proceed to unrelated cleanup.
```

---

# 16. Prompt — Audio Patch

Dùng khi sửa BGM/SFX/mute.

```txt
Do audio patch only.

Goal:
<describe exact audio change>

Allowed files:
- src/utils/audio-manager.ts
- src/hooks/useGameSound.ts
- specific UI mute control file if needed

Forbidden files:
- src/game/core.ts
- src/features/game/render/*
- src/lib/firebase.ts
- score/data files unless explicitly allowed
- package.json
- lockfiles

Rules:
- Core must not import audio.
- Audio must not own gameplay rules.
- Preserve mute state.
- Preserve user gesture unlock behavior.
- Avoid duplicate SFX after replay/remount.
- Do not change score/gameplay logic.
- Do not change PixiJS lifecycle.

Verification:
- Run available build/typecheck/test.
- Check core has no audio imports.
- Manual smoke:
  mute works, SFX triggers once, BGM behavior preserved.

Output:
Return audio patch report.
```

---

# 17. Prompt — Cleanup

Dùng khi cleanup unused imports/scaffold/deps/chunks.

```txt
Do PHASE 8 — Cleanup only.

Cleanup type:
[ ] unused imports/local dead code
[ ] scaffold quarantine report
[ ] scaffold move to _unused
[ ] dependency usage proof
[ ] dependency removal
[ ] chunk/bundle cleanup

Allowed files:
<list files>

Forbidden files:
<list files>

Rules:
- Cleanup must be isolated.
- Do not change gameplay behavior.
- Do not change UI design.
- Do not change PixiJS lifecycle.
- Do not remove dependencies in the same patch as file moves.
- Do not delete scaffold immediately after triage.
- Do not remove dependencies without runtime import proof.
- Lockfile changes require explicit dependency cleanup scope.
- If unsure whether a file is runtime or scaffold, mark Unknown and stop.

Dependency cleanup requires:
1. Runtime import check
2. Scaffold import check
3. package.json usage check
4. Build pass
5. Typecheck/test pass if available
6. Dedicated cleanup report

Verification:
- Run available build/typecheck/test.
- Run git diff --check.
- Run git status --short.
- Run git diff --stat.
- Run manual smoke if runtime files changed.

Output:
Return cleanup report.
Do not proceed to final gate unless user asks.
```

---

# 18. Prompt — Revert UI Drift To Game-First

Dùng khi agent/Mimo/Figma output làm UI lệch thành landing page/dashboard.

```txt
Revert the UI direction back to the game-first layout.

Current problem:
The app has been interpreted too much like a landing page/dashboard website.
We need the UI to prioritize the game screen.

Mode:
small-patch-refactor

Allowed files:
<list UI/layout files only>

Forbidden files:
- src/game/*
- src/features/game/render/*
- src/lib/*
- Firebase/localStorage files
- audio files
- package.json
- lockfiles
- config files

Requirements:
- Keep the game board/canvas as the main visual center.
- Remove or reduce landing-page-like sections.
- TopNav should be compact.
- Footer should not dominate the layout.
- Dashboard/stats should be secondary.
- Mobile should show the game first.
- Preserve existing gameplay.
- Preserve PixiJS logic.
- Do not touch game core unless required by layout integration.
- Do not change scoring.
- Do not change Firebase/localStorage.
- Do not add hero sections, marketing CTA, feature cards, pricing, testimonials, or long landing scroll.

After changes:
1. Explain which files caused the landing-page interpretation.
2. Explain which DESIGN.md lines or prompt wording may have led to it.
3. Provide a safer future prompt to avoid this mistake.
4. Run available build/typecheck/test.
5. Run design gate.
6. Return UI Patch Report.
```

---

# 19. Prompt — Final Gate

Dùng sau khi hoàn thành các phase.

```txt
Do PHASE 9 — Final Gate only.

Goal:
Verify the project is stable, build-safe, architecture-safe, design-safe, and gameplay-safe.

Do not modify files unless explicitly asked.

Run available commands:
- npm run typecheck
- npm test
- npm run build
- npm run lint
- git diff --check
- git status --short
- git diff --stat

Check architecture:
- core has no React/Pixi/Firebase/browser/audio import
- render has no persistence/data dependency
- input has no persistence dependency
- data layer does not import UI components
- UI primitives do not import game-specific mutation logic
- no circular dependencies
- no unexpected reverse dependencies

Check design:
- product type preserved
- game-first hierarchy preserved if applicable
- no landing-page drift
- responsive behavior acceptable
- design tokens used consistently

Check gameplay:
- game starts
- game can be played
- score updates
- game over works
- replay works
- desktop input works
- mobile input works
- save/leaderboard flow unaffected
- no duplicate ticker/listener/canvas after replay/remount
- console has no crash/spam

Output:
# Final Gate Report

## Status
PASS / FAIL / BLOCKED

## Commands run

## Command results

## Architecture gate

## Design gate

## Gameplay gate

## Runtime/lifecycle gate

## Data/audio gate

## Unexpected changes

## Remaining risks

## Final recommendation

Do not proceed to new work.
```

---

# 20. Prompt — Create Task Contract

Dùng trước mỗi patch.

```txt
Create a TASK-CONTRACT.md for the next patch.

Inputs:
- Current phase
- User goal
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- AGENTS.md
- docs/05-DESIGN.md if UI task
- docs/08-VERIFICATION-GATES.md

Required output:

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

Rules:
- Scope must be narrow.
- Allowed files must be explicit.
- Forbidden files must be explicit.
- Behavior to preserve must be testable.
- If the task is too broad, split it into smaller tasks.
- Do not implement the patch yet.
```

---

# 21. Prompt — Create Phase Report

Dùng sau mỗi phase.

```txt
Create PHASE-REPORT.md for the completed phase.

Inputs:
- Current phase
- TASK-CONTRACT.md
- Changed files
- Command results
- Gate results
- Manual checks
- Known risks

Required output:

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

## Manual smoke result

## Unexpected changes

## Risks / follow-up

## Next recommended patch

Rules:
- Do not hide failed commands.
- Do not mark PASS if any required gate failed.
- Do not proceed to next phase.
- If blocked, explain what information or scope is missing.
```

---

# 22. Prompt — Audit Before Fixing A Messy Game Repo

Dùng khi chưa biết code đang loạn chỗ nào.

```txt
Audit this React + Vite + web game codebase.

Do not modify files.

Find issues in these areas:
1. Architecture boundaries
2. Core gameplay purity
3. Runtime/session/timer ownership
4. PixiJS lifecycle cleanup
5. Texture/asset loading
6. Game loop and React state separation
7. Input handling for desktop/mobile
8. UI overlay z-index and pointer-events
9. Firebase/localStorage score flow
10. Audio ownership
11. Legacy/mock/unused files
12. Mobile responsive layout
13. Test/build risk

For every issue, provide:
- File path
- Exact problematic code or pattern
- Why it is risky
- Safe fix plan
- Priority: high / medium / low
- Suggested phase
- Whether it is in scope for the current task

Important:
This is a game-first app, not a landing page.
Do not recommend redesigning the app as a landing page.
Do not recommend large rewrites unless absolutely necessary.
Do not patch anything yet.

Output:
1. Executive summary
2. Risk table
3. Architecture boundary issues
4. UI/design issues
5. Runtime/lifecycle issues
6. Data/storage/audio issues
7. First safe patch
8. Files not to touch
9. Verification needed
```

---

# 23. Prompt — Ask Agent To Stop At One Sub-Phase

Dùng khi phase lớn, ví dụ Phase 6A/6B/7A.

```txt
Do only this sub-phase:

PHASE:
<phase name>

SUB-PHASE:
<sub-phase name>

Goal:
<one exact goal>

Allowed files:
<list files>

Forbidden files:
<list files>

Expected graph before:
<paste graph>

Expected graph after:
<paste graph>

Forbidden edges:
<paste forbidden imports/ownership>

Rules:
- Do not proceed to the next sub-phase.
- Do not extract anything else.
- Do not cleanup unrelated code.
- Do not change behavior unless explicitly required.
- If you need a file outside Allowed files, stop and report.
- If expected graph cannot be achieved safely, stop and report.

Verification:
<commands>

Output required:
1. Sub-phase summary
2. Files changed
3. New files created
4. Dependency graph before/after
5. Code graph result
6. Verification command results
7. Manual behavior result if applicable
8. Remaining risks
9. Sub-phase PASS / FAIL / BLOCKED

Do not proceed to the next sub-phase.
```

---

# 24. Prompt — Safer Feature Add

Dùng khi thêm feature sau khi triage/contract đã có.

```txt
Add this feature using the existing architecture.

Feature:
<describe feature>

Use these source-of-truth files:
- docs/02-PROJECT-CONTRACT.md
- docs/03-ARCHITECTURE.md
- AGENTS.md
- docs/05-DESIGN.md if UI is affected
- docs/08-VERIFICATION-GATES.md

Rules:
- Place feature logic in src/features/<feature-name>/.
- Place reusable UI in src/components/ui or src/shared/components only if truly generic.
- Place API/service code in service/lib files, not inside visual components.
- Place content/copy in content files.
- Preserve current visual design and routes unless explicitly requested.
- Preserve current gameplay behavior unless explicitly requested.
- Do not modify generated visual internals unless necessary.
- Do not add dependencies unless explicitly allowed.
- Add tests for core behavior when possible.

Before editing:
1. State files to touch.
2. State files not to touch.
3. State behavior to preserve.
4. State validation commands.

After editing:
1. Files added
2. Files changed
3. Feature flow
4. Test/build result
5. git status --short
6. git diff --stat
7. Risk notes
8. Follow-up
```

---

# 25. Final Prompt Rule

If task has no contract, default assumption:

```txt
The task is not ready to edit.
```

Minimum contract:

```txt
Goal:
Non-goals:
Allowed files:
Forbidden files:
Behavior to preserve:
Validation command:
Definition of done:
```

If agent tries to expand beyond contract:

```txt
Stop.
Narrow the goal.
Audit first.
Patch one layer only.
Verify.
Report.
Then wait for next instruction.
```