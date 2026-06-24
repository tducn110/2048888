# 08 — VERIFICATION-GATES.md

File này định nghĩa tất cả gate kiểm tra trước khi một patch, sub-phase, hoặc phase được coi là hoàn thành.

Mục tiêu của file này là trả lời:

```txt
Patch này có đúng scope không?
Build/test/typecheck có pass không?
Import graph có sạch không?
Core có còn pure không?
Render/PixiJS lifecycle có sạch không?
UI có lệch DESIGN.md không?
Gameplay có bị đổi ngoài ý muốn không?
Manual smoke có pass không?
Có được qua phase tiếp theo không?
```

File này không thay thế:

```txt
TASK-CONTRACT.md
PHASE-REPORT.md
AGENTS.md
PROJECT-CONTRACT.md
ARCHITECTURE.md
DESIGN.md
DESIGN-APPLICATION-GATE.md
```

Nó là tập hợp gate để kiểm tra kết quả.

---

# 0. Primary Rule

```txt
A patch is not PASS until all required gates pass.
A phase is not complete until PHASE-REPORT.md is complete.
Do not proceed to the next phase if any required gate is FAIL or BLOCKED.
```

If evidence is insufficient:

```txt
Status = BLOCKED
Do not guess.
Do not proceed.
```

---

# 1. Gate Status Values

Every gate must output one of:

```txt
PASS
FAIL
BLOCKED
NOT APPLICABLE
NOT AVAILABLE
```

Meaning:

```txt
PASS:
- Check was performed.
- Evidence supports success.

FAIL:
- Check was performed.
- Patch or phase violates requirement.

BLOCKED:
- Check cannot be completed because required information, file, tool, or permission is missing.

NOT APPLICABLE:
- Gate does not apply to this task.

NOT AVAILABLE:
- Script/tool does not exist in this repo.
```

Do not mark PASS if the check was not actually performed.

---

# 2. Required Gate Order

Use gates in this order:

```txt
1. Scope Gate
2. Dirty Tree Gate
3. Build / Typecheck / Test Gate
4. Code Graph Gate
5. Architecture Boundary Gate
6. Design Gate, if UI task
7. Gameplay Behavior Gate, if game task
8. Runtime / Lifecycle Gate
9. Data / Storage Gate
10. Audio Gate
11. Dependency / Cleanup Gate
12. Manual Smoke Gate
13. Final Report Gate
```

If an early gate fails badly, stop and report.  
Do not continue patching to “fix along the way”.

---

# 3. Scope Gate

## Purpose

Ensure the patch only touches allowed files.

## Checklist

```txt
[ ] Current task has a clear goal.
[ ] Current task has explicit Allowed files.
[ ] Current task has explicit Forbidden files.
[ ] Every changed file is inside Allowed files.
[ ] No unexpected files changed.
[ ] No docs/tests/config/package files changed unless allowed.
[ ] No global CSS/theme file changed unless allowed.
[ ] No generated asset/public file changed unless allowed.
```

## Commands

```bash
git status --short
git diff --stat
```

## PASS if

```txt
[ ] Changed files match Allowed files.
[ ] No unexpected file appears in git status.
```

## FAIL if

```txt
[ ] Any out-of-scope file changed.
[ ] Agent edited extra files because a checklist mentioned them.
[ ] Patch mixed unrelated concerns.
```

## BLOCKED if

```txt
[ ] Allowed files were never specified.
[ ] Existing dirty tree makes changed files impossible to distinguish.
```

---

# 4. Dirty Tree Gate

## Purpose

Protect existing user work.

## Before editing

Run:

```bash
git status --short
```

Record:

```txt
Existing modified files:
- ...

Existing untracked files:
- ...
```

## Forbidden

```txt
[ ] Do not run git reset --hard.
[ ] Do not run git checkout .
[ ] Do not run git clean -fd.
[ ] Do not delete untracked files.
[ ] Do not overwrite user changes.
```

## PASS if

```txt
[ ] Existing dirty files are documented.
[ ] Patch does not overwrite unrelated dirty files.
```

## FAIL if

```txt
[ ] User work was overwritten.
[ ] Unexpected dirty files were modified.
```

---

# 5. Build / Typecheck / Test Gate

## Purpose

Prove the project still compiles and baseline checks pass.

## Discover available scripts

Run or inspect:

```bash
cat package.json
```

Only run scripts that exist.

## Preferred commands

```bash
npm run typecheck
npm test
npm run build
npm run lint
git diff --check
```

## Required output format

```txt
Build / Typecheck / Test Gate

[PASS/FAIL/NOT AVAILABLE] npm run typecheck
Evidence:
- ...

[PASS/FAIL/NOT AVAILABLE] npm test
Evidence:
- ...

[PASS/FAIL/NOT AVAILABLE] npm run build
Evidence:
- ...

[PASS/FAIL/NOT AVAILABLE] npm run lint
Evidence:
- ...

[PASS/FAIL] git diff --check
Evidence:
- ...
```

## PASS if

```txt
[ ] All available required commands pass.
[ ] Missing scripts are reported as NOT AVAILABLE.
```

## FAIL if

```txt
[ ] A command fails because of this patch.
[ ] Agent changes config/tests to hide failure.
[ ] Agent marks pass without running or reporting unavailable scripts.
```

## BLOCKED if

```txt
[ ] Baseline already fails before patch.
[ ] Dependency install is missing and cannot be restored safely.
[ ] Environment prevents running commands.
```

If baseline already fails:

```txt
Report baseline failure.
Do not patch unrelated files to force green.
```

---

# 6. Code Graph Gate

## Purpose

Prove import/dependency graph matches expected architecture.

This gate is mandatory for:

```txt
[ ] Core extraction.
[ ] Runtime hook extraction.
[ ] Input hook extraction.
[ ] Render/PixiJS refactor.
[ ] Data/storage refactor.
[ ] Dependency cleanup.
[ ] Large component extraction.
[ ] Any patch moving shared types.
```

## Inputs required

```txt
[ ] Expected graph before.
[ ] Expected graph after.
[ ] Forbidden edges.
[ ] Changed files list.
```

## Required checks

```txt
[ ] Import edges checked.
[ ] Reverse references checked.
[ ] Circular dependencies checked.
[ ] Forbidden edges checked.
[ ] Changed files match phase scope.
[ ] New files are in correct layer.
[ ] No dependency points back into component root unexpectedly.
```

## Generic forbidden edges

```txt
core -> React
core -> PixiJS
core -> Firebase/API
core -> window/document
core -> localStorage/sessionStorage
core -> audio manager
core -> CSS/UI component

render -> Firebase/API
render -> score persistence
render -> route behavior
render -> React modal logic

input -> score persistence
input -> Firebase/localStorage
input -> UI layout
input -> texture/sprite cleanup

data/lib -> UI component
UI primitive -> game-specific mutation logic
production -> test helper
```

## Example targeted commands

```bash
rg -n "from .*react|from .*pixi|firebase|localStorage|window|document|Audio|audio-manager" src/game
rg -n "from .*firebase|from .*useScoreData|localStorage|audio-manager" src/features/game/render
rg -n "firebase|localStorage|useScoreData|audio-manager" src/features/game/input src/features/game/runtime
```

## Required output format

```txt
Code Graph Gate

Changed files:
- ...

New files:
- ...

Import edges:
- ...

Reverse references:
- ...

Forbidden edge check:
[PASS/FAIL] core has no React/Pixi/Firebase/browser/audio import
[PASS/FAIL] render has no persistence/data dependency
[PASS/FAIL] input has no persistence dependency
[PASS/FAIL] data does not import UI components
[PASS/FAIL] no reverse dependency into root game component
[PASS/FAIL] no circular dependencies

Final status:
PASS / FAIL / BLOCKED
```

## PASS if

```txt
[ ] Expected graph matches actual graph.
[ ] No forbidden edge remains.
[ ] No new circular dependency exists.
```

## FAIL if

```txt
[ ] Any forbidden edge exists.
[ ] New cycle exists.
[ ] Shared type still imported from a UI component.
[ ] Data layer imports game component.
[ ] Render layer imports score saving.
```

## BLOCKED if

```txt
[ ] Graph evidence cannot be produced.
[ ] Expected graph is missing.
[ ] Dynamic imports make ownership unclear.
```

---

# 7. Architecture Boundary Gate

## Purpose

Check whether layer ownership is preserved.

## Checklist

```txt
[ ] Core remains gameplay source of truth.
[ ] Runtime orchestrates but does not become a second core.
[ ] Input sends actions/intents only.
[ ] Render/PixiJS renders state only.
[ ] React UI displays state and sends events.
[ ] Data/storage owns persistence only.
[ ] Audio owns sound only.
```

## Core boundary

```txt
[PASS/FAIL] core owns state transition
[PASS/FAIL] core owns score/win/lose rules
[PASS/FAIL] core has no UI/render/data/audio/browser dependency
[PASS/FAIL] core is deterministic where expected
```

## Runtime boundary

```txt
[PASS/FAIL] runtime owns session/timer/replay orchestration
[PASS/FAIL] runtime does not own texture/sprite lifecycle
[PASS/FAIL] runtime does not save score directly unless scoped
[PASS/FAIL] runtime does not duplicate gameplay math
```

## Input boundary

```txt
[PASS/FAIL] input owns listeners/normalization
[PASS/FAIL] input cleanup exists
[PASS/FAIL] input does not duplicate score/hitbox/win/loss rules
[PASS/FAIL] input does not save score
```

## Render boundary

```txt
[PASS/FAIL] render owns only visual runtime
[PASS/FAIL] render does not mutate gameplay truth
[PASS/FAIL] render does not save score
[PASS/FAIL] render does not render normal UI like navbar/modal/footer
```

## UI boundary

```txt
[PASS/FAIL] UI owns layout/HUD/panels/modals
[PASS/FAIL] UI does not own core simulation
[PASS/FAIL] UI does not implement score formula
[PASS/FAIL] UI does not own Pixi resource cleanup
```

## Data boundary

```txt
[PASS/FAIL] data owns Firebase/API/localStorage
[PASS/FAIL] data does not import UI component
[PASS/FAIL] data does not own game loop/render lifecycle
```

## Audio boundary

```txt
[PASS/FAIL] audio owns BGM/SFX/mute/unlock/cleanup
[PASS/FAIL] core does not import audio
[PASS/FAIL] audio does not own gameplay rules
```

---

# 8. Design Gate

## Purpose

Check UI/component/layout changes against `DESIGN.md`.

This gate is mandatory for:

```txt
[ ] Layout changes.
[ ] Component extraction.
[ ] Visual polish.
[ ] Responsive changes.
[ ] HUD/panel/modal/button/topnav/footer changes.
[ ] Figma design application.
```

## Required inputs

```txt
[ ] docs/05-DESIGN.md
[ ] docs/06-DESIGN-APPLICATION-GATE.md
[ ] Design source for this patch
[ ] UI task type
```

## Checklist

```txt
[ ] Product type preserved.
[ ] Visual hierarchy preserved.
[ ] Game-first hierarchy preserved if applicable.
[ ] Responsive behavior preserved.
[ ] Existing tokens used when available.
[ ] No random new color/font/spacing system introduced.
[ ] No landing-page sections added unless requested.
[ ] No gameplay behavior changed in UI-only task.
```

For game-first app:

```txt
[PASS/FAIL] game board/canvas remains primary
[PASS/FAIL] topnav remains compact
[PASS/FAIL] footer remains minimal
[PASS/FAIL] dashboard/stats remain secondary
[PASS/FAIL] mobile shows game first
[PASS/FAIL] no hero/CTA/feature-card/pricing/testimonial section added
```

## PASS if

```txt
[ ] UI still matches DESIGN.md.
[ ] No visual drift found.
[ ] Game-first product is not reinterpreted as landing/dashboard.
```

## FAIL if

```txt
[ ] Game board/canvas loses spotlight.
[ ] UI turns into landing page unintentionally.
[ ] Random SaaS/dashboard visual style appears.
[ ] UI-only patch changes gameplay.
```

---

# 9. Gameplay Behavior Gate

## Purpose

Ensure gameplay did not change unless explicitly requested.

Mandatory for:

```txt
[ ] Core changes.
[ ] Runtime changes.
[ ] Input changes.
[ ] Render changes that affect game board/canvas.
[ ] UI changes that affect active play area.
```

## Generic game checks

```txt
[PASS/FAIL] game starts
[PASS/FAIL] game can be played
[PASS/FAIL] score updates
[PASS/FAIL] win/lose condition works
[PASS/FAIL] game over appears correctly
[PASS/FAIL] replay works
[PASS/FAIL] input still works on desktop
[PASS/FAIL] input still works on mobile
[PASS/FAIL] responsive layout does not block gameplay
```

## Fruit/arcade-style checks

```txt
[PASS/FAIL] countdown works
[PASS/FAIL] fruits spawn normally
[PASS/FAIL] fruit physics/timing feels unchanged
[PASS/FAIL] slicing works
[PASS/FAIL] slash trail appears/fades
[PASS/FAIL] particles appear
[PASS/FAIL] bomb feedback works
[PASS/FAIL] screen shake resets
[PASS/FAIL] missed fruits/lives behavior unchanged
[PASS/FAIL] game over fires once
[PASS/FAIL] replay does not duplicate ticker/listeners
```

## Board puzzle / 2048-style checks

```txt
[PASS/FAIL] board initializes
[PASS/FAIL] movement input works
[PASS/FAIL] merge/scoring rules unchanged
[PASS/FAIL] invalid move behavior unchanged
[PASS/FAIL] win/loss condition unchanged
[PASS/FAIL] local best score behavior unchanged
[PASS/FAIL] swipe/keyboard input works
[PASS/FAIL] replay/reset works
```

## Drag/drop puzzle checks

```txt
[PASS/FAIL] drag starts
[PASS/FAIL] drop target works
[PASS/FAIL] invalid drop rejects correctly
[PASS/FAIL] row/column clear logic unchanged
[PASS/FAIL] score logic unchanged
[PASS/FAIL] mobile touch drag works
[PASS/FAIL] reset/replay works
```

## PASS if

```txt
[ ] All relevant manual checks pass.
[ ] Behavior changes, if any, were explicitly requested.
```

## FAIL if

```txt
[ ] Gameplay behavior changed in a non-gameplay task.
[ ] Game cannot start/replay.
[ ] onGameOver/save flow fires twice.
[ ] Input breaks on mobile or desktop.
```

---

# 10. Runtime / Lifecycle Gate

## Purpose

Catch memory leaks, duplicate listeners, stale refs, Pixi lifecycle bugs, timer leaks, and replay/remount bugs.

Mandatory for:

```txt
[ ] PixiJS/render refactor.
[ ] Runtime hook extraction.
[ ] Input hook extraction.
[ ] Timer/countdown/ticker changes.
[ ] Feedback/effect/particle changes.
```

## Ticker lifecycle

```txt
[PASS/FAIL] ticker.add has matching ticker.remove
[PASS/FAIL] ticker callback is not duplicated after replay/remount
[PASS/FAIL] ticker cleanup runs on unmount
[PASS/FAIL] ticker does not own unrelated responsibilities
```

## DOM listener lifecycle

```txt
[PASS/FAIL] addEventListener has matching removeEventListener
[PASS/FAIL] touch/pointer listeners cleanup correctly
[PASS/FAIL] passive listener behavior intentional
[PASS/FAIL] listener does not duplicate after replay/remount
```

## Timer lifecycle

```txt
[PASS/FAIL] setTimeout/setInterval tracked if needed
[PASS/FAIL] clearTimeout/clearInterval cleanup exists
[PASS/FAIL] state update after unmount is guarded or cleaned
[PASS/FAIL] countdown/replay does not leak timers
```

## Pixi app lifecycle

```txt
[PASS/FAIL] Pixi Application created by render owner only
[PASS/FAIL] Pixi Application destroyed safely
[PASS/FAIL] no duplicate canvas/app after remount
[PASS/FAIL] no stage.children[index] fragile dependency
[PASS/FAIL] layer refs are explicit
[PASS/FAIL] ResizeObserver/listeners cleaned up
[PASS/FAIL] DPR/resolution capped or intentionally configured
```

## Texture/sprite lifecycle

```txt
[PASS/FAIL] texture owner is clear
[PASS/FAIL] sprite owner is clear
[PASS/FAIL] no shared texture destroyed by wrong hook
[PASS/FAIL] async image/texture assignment guarded after unmount
[PASS/FAIL] no black texture/canvas issue
[PASS/FAIL] no orphan display objects after replay/home
```

## Effects/particles lifecycle

```txt
[PASS/FAIL] temporary effects expire or are destroyed
[PASS/FAIL] particles are cleaned after TTL
[PASS/FAIL] feedback timers/text clear on replay/home
[PASS/FAIL] screen shake resets to neutral position
[PASS/FAIL] no effect hook mutates gameplay state
```

## Suggested commands

```bash
rg -n "ticker\\.add|ticker\\.remove|addEventListener|removeEventListener|setTimeout|clearTimeout|setInterval|clearInterval|requestAnimationFrame|cancelAnimationFrame|destroy\\(" src
```

## PASS if

```txt
[ ] No duplicate runtime resources after replay/remount.
[ ] Owned resources have cleanup.
[ ] No stale refs/state updates after unmount.
```

## FAIL if

```txt
[ ] Duplicate canvas/ticker/listener appears.
[ ] Pixi object accessed after destroy.
[ ] Timer survives replay/home unexpectedly.
[ ] Shared texture destroyed by non-owner.
```

---

# 11. Data / Storage Gate

## Purpose

Protect score saving, leaderboard, localStorage fallback, Firebase/API behavior.

Mandatory for:

```txt
[ ] useScoreData changes.
[ ] Firebase/API changes.
[ ] localStorage changes.
[ ] GameResult type changes.
[ ] Game over/save score flow changes.
```

## Checklist

```txt
[PASS/FAIL] GameResult type comes from shared type file
[PASS/FAIL] score saving accepts correct playTimeSec
[PASS/FAIL] playTimeSec is not hardcoded incorrectly
[PASS/FAIL] localStorage fallback behavior preserved
[PASS/FAIL] Firebase/API behavior preserved
[PASS/FAIL] save failure is non-blocking
[PASS/FAIL] leaderboard/user stats behavior preserved
[PASS/FAIL] data layer does not import UI/game component
[PASS/FAIL] game remains playable without login/network
```

## Suggested commands

```bash
rg -n "GameResult" src
rg -n "playTimeSec: 180|playTimeSec = 180" src
rg -n "localStorage|sessionStorage" src
rg -n "firebase|saveScore|leaderboard" src
```

## FAIL if

```txt
[ ] score save flow fires twice
[ ] save score blocks gameplay
[ ] local fallback removed accidentally
[ ] Firebase imports UI/game component
[ ] playTimeSec becomes hardcoded incorrectly
```

---

# 12. Audio Gate

## Purpose

Protect BGM/SFX/mute/audio unlock behavior.

Mandatory for:

```txt
[ ] audio-manager changes
[ ] useGameSound changes
[ ] mute UI changes
[ ] game event sound wiring changes
```

## Checklist

```txt
[PASS/FAIL] mute state preserved
[PASS/FAIL] user gesture unlock preserved
[PASS/FAIL] BGM behavior preserved
[PASS/FAIL] SFX behavior preserved
[PASS/FAIL] audio cleanup exists
[PASS/FAIL] core does not import audio
[PASS/FAIL] render hook does not own audio
[PASS/FAIL] no duplicate sound trigger after replay/remount
```

## FAIL if

```txt
[ ] core imports audio
[ ] mute no longer works
[ ] audio starts before allowed user gesture
[ ] duplicate SFX fires after replay
```

---

# 13. Dependency / Cleanup Gate

## Purpose

Prevent unsafe dependency removal and scaffold deletion.

Mandatory for:

```txt
[ ] package.json changes
[ ] lockfile changes
[ ] dependency cleanup
[ ] scaffold quarantine
[ ] scaffold deletion
[ ] chunk/bundle cleanup
```

## Dependency cleanup requirements

```txt
[ ] Dedicated cleanup task.
[ ] Runtime import check.
[ ] Scaffold import check.
[ ] package.json usage check.
[ ] Build pass.
[ ] Typecheck/test pass if available.
[ ] Lockfile change intentional.
```

## Forbidden

```txt
[ ] Remove dependencies during unrelated refactor.
[ ] Remove dependencies just because they look unused.
[ ] Delete scaffold immediately after triage.
[ ] Delete generated files without approval.
[ ] Change config to hide issues.
[ ] Remove features to reduce bundle.
```

## Suggested commands

```bash
cat package.json
rg -n "<dependency-name>" src package.json
npm run build
npm run typecheck
npm test
git diff -- package.json package-lock.json pnpm-lock.yaml yarn.lock
```

## PASS if

```txt
[ ] Dependency/scaffold action is proven and scoped.
[ ] Build and relevant checks pass.
```

## FAIL if

```txt
[ ] Dependency removed without proof.
[ ] Runtime file still imports removed package.
[ ] Scaffold deletion breaks build.
[ ] Lockfile changed unexpectedly.
```

---

# 14. Manual Smoke Gate

## Purpose

Confirm user-visible behavior still works.

Manual smoke is required after:

```txt
[ ] UI/layout patch.
[ ] Game core patch.
[ ] Runtime/input/render patch.
[ ] Data/save score patch.
[ ] Audio patch.
[ ] Dependency cleanup patch.
```

## Generic app smoke

```txt
[PASS/FAIL] app loads without blank screen
[PASS/FAIL] main route renders
[PASS/FAIL] navigation still works if applicable
[PASS/FAIL] no console crash/spam
[PASS/FAIL] responsive layout not obviously broken
```

## Game smoke

```txt
[PASS/FAIL] home/menu renders normally
[PASS/FAIL] clicking play enters game
[PASS/FAIL] game starts
[PASS/FAIL] game can be played
[PASS/FAIL] HUD updates correctly
[PASS/FAIL] game over works
[PASS/FAIL] replay works
[PASS/FAIL] returning home works if applicable
[PASS/FAIL] remounting game does not duplicate canvas/listeners/ticker
```

## UI smoke

```txt
[PASS/FAIL] desktop layout OK
[PASS/FAIL] tablet layout OK
[PASS/FAIL] mobile layout OK
[PASS/FAIL] modals/overlays clickable
[PASS/FAIL] panels clickable
[PASS/FAIL] footer/topnav do not block play
```

## PASS if

```txt
[ ] Relevant manual behavior is verified.
```

## BLOCKED if

```txt
[ ] Browser/manual verification was not possible.
```

If blocked, report why.

---

# 15. Final Report Gate

## Purpose

Ensure every patch or phase records what actually happened.

## Required patch report

```txt
# Patch Report

## Status
PASS / FAIL / BLOCKED

## Changed files
- ...

## Why each file changed
- ...

## Scope result
- ...

## Behavior preserved
- ...

## Design compliance, if UI task
- ...

## Architecture/ownership result
- ...

## Code graph result
- ...

## Lifecycle result, if applicable
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

## Required phase report

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

## Manual smoke result

## Unexpected changes

## Risks / follow-up

## Next recommended phase
```

## PASS if

```txt
[ ] Report includes changed files.
[ ] Report explains why each file changed.
[ ] Report includes command results.
[ ] Report includes git status and diff stat.
[ ] Report includes unexpected changes.
[ ] Report includes final PASS/FAIL/BLOCKED.
```

## FAIL if

```txt
[ ] Agent claims done without report.
[ ] Agent does not explain changed files.
[ ] Agent omits failed commands.
[ ] Agent proceeds to next phase without user approval.
```

---

# 16. Phase-Specific Gate Matrix

Use this matrix to know which gates are required.

|Phase|Required gates|
|---|---|
|Phase 0 — Figma Triage|Scope, Dirty Tree, Final Report|
|Phase 1 — Handoff + Contract|Scope, Dirty Tree, Final Report|
|Phase 2 — Architecture + Agents|Scope, Dirty Tree, Final Report|
|Phase 3 — Design Contract + Design Gate|Scope, Dirty Tree, Design, Final Report|
|Phase 4 — Layout/Grid|Scope, Dirty Tree, Build/Test, Design, Manual Smoke, Final Report|
|Phase 5 — Component Extraction|Scope, Dirty Tree, Build/Test, Code Graph, Design, Manual Smoke, Final Report|
|Phase 6 — Game Core Extraction|Scope, Dirty Tree, Build/Test, Code Graph, Architecture, Gameplay, Final Report|
|Phase 7 — PixiJS Render Integration|Scope, Dirty Tree, Build/Test, Code Graph, Architecture, Lifecycle, Gameplay, Manual Smoke, Final Report|
|Phase 8 — Cleanup|Scope, Dirty Tree, Build/Test, Code Graph, Dependency/Cleanup, Manual Smoke, Final Report|
|Phase 9 — Final Gate|All relevant gates|

---

# 17. PASS / FAIL / BLOCKED Decision

## Patch PASS

A patch is PASS only if:

```txt
[ ] Scope Gate PASS.
[ ] Dirty Tree Gate PASS.
[ ] Available verification commands PASS.
[ ] Required architecture/code graph gates PASS.
[ ] Required design/gameplay/lifecycle gates PASS.
[ ] Manual smoke PASS if applicable.
[ ] Final report complete.
```

## Patch FAIL

Mark FAIL if:

```txt
[ ] Patch touched unexpected files.
[ ] Patch introduced forbidden dependency edges.
[ ] Patch broke build/typecheck/test.
[ ] Patch changed gameplay unintentionally.
[ ] Patch drifted UI from DESIGN.md.
[ ] Patch created duplicate listeners/tickers/Pixi apps.
[ ] Patch broke save score/localStorage/Firebase behavior.
```

## Patch BLOCKED

Mark BLOCKED if:

```txt
[ ] Required scope is missing.
[ ] Required design/architecture source is missing.
[ ] Expected graph is unclear.
[ ] Baseline build/test fails for unrelated reasons.
[ ] Tool/environment prevents verification.
[ ] Required file is outside Allowed files.
```

---

# 18. Do Not Proceed Rule

Do not proceed to the next phase if:

```txt
[ ] Any required gate is FAIL.
[ ] Any required gate is BLOCKED.
[ ] PHASE-REPORT.md is missing.
[ ] User has not approved moving forward.
[ ] Unexpected files changed.
[ ] Current phase status is not PASS.
```

Safe final line after each phase:

```txt
Phase status: PASS / FAIL / BLOCKED.
Do not proceed to the next phase until user confirms.
```

---

# 19. Final Project Gate

Use this after all planned phases.

## Final commands

```bash
npm run typecheck
npm test
npm run build
npm run lint
git diff --check
git status --short
git diff --stat
```

Only run available scripts.

## Final architecture checks

```txt
[PASS/FAIL] core has no React/Pixi/Firebase/browser/audio import
[PASS/FAIL] render has no persistence/data dependency
[PASS/FAIL] input has no persistence dependency
[PASS/FAIL] data layer does not import UI components
[PASS/FAIL] UI primitives do not import game-specific mutation logic
[PASS/FAIL] no circular dependencies
[PASS/FAIL] no unexpected reverse dependency into game component root
```

## Final design checks

```txt
[PASS/FAIL] product type preserved
[PASS/FAIL] visual hierarchy preserved
[PASS/FAIL] game-first layout preserved if applicable
[PASS/FAIL] no landing-page drift
[PASS/FAIL] responsive behavior acceptable
```

## Final gameplay checks

```txt
[PASS/FAIL] game starts
[PASS/FAIL] game can be played
[PASS/FAIL] replay works
[PASS/FAIL] game over works
[PASS/FAIL] score updates
[PASS/FAIL] input works desktop/mobile
[PASS/FAIL] save/leaderboard flow unaffected
[PASS/FAIL] no duplicate ticker/listener/canvas after replay/remount
[PASS/FAIL] console has no crash/spam
```

## Final status

```txt
Final project status:
[ ] PASS
[ ] FAIL
[ ] BLOCKED

Reason:
- ...
```

---

# 20. Final Rule

```txt
Verification Gates prove whether the patch is safe.
They do not expand scope.
They do not authorize extra edits.
If a gate finds an out-of-scope issue, report it as follow-up.
```

Never say a patch is done unless:

```txt
Scope is clean.
Build/test evidence is clear.
Graph is clean.
Behavior is preserved.
Report is complete.
```