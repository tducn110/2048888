

File này là gate kiểm tra trước và sau mỗi UI/component/layout patch.

`DESIGN.md` mô tả UI phải trông như thế nào.  
`DESIGN-APPLICATION-GATE.md` kiểm tra patch hiện tại có đi lệch khỏi design đó không.

File này dùng khi task có liên quan đến:

```txt
[ ] UI layout
[ ] Component extraction
[ ] Responsive fix
[ ] Visual polish
[ ] Theme/token update
[ ] HUD/panel/modal/button/footer/topnav
[ ] Game screen composition
[ ] Figma design application
[ ] Reverting UI drift
```

Không dùng file này để thay thế `TASK-CONTRACT.md`.  
Không dùng file này để mở rộng scope patch.  
Không dùng file này để tự ý sửa gameplay.

---

# 0. Primary Rule

```txt
A UI patch must preserve product type, visual intent, responsive behavior, and gameplay behavior unless the task explicitly says otherwise.
```

For game-first apps:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
TopNav, Footer, Dashboard, stats, and panels are supporting UI only.
```

---

# 1. Required Inputs

Before applying any UI/component/layout patch, confirm these exist or are explicitly provided:

```txt
[ ] TASK-CONTRACT.md or explicit task scope.
[ ] docs/05-DESIGN.md.
[ ] docs/02-PROJECT-CONTRACT.md.
[ ] docs/03-ARCHITECTURE.md.
[ ] AGENTS.md.
[ ] Current Figma frame/screenshot/user instruction, if applicable.
[ ] Allowed files.
[ ] Forbidden files.
[ ] Behavior to preserve.
[ ] Validation commands.
```

If missing:

```txt
Do not patch yet.
Report what is missing.
Create or request the missing contract.
```

---

# 2. UI Task Classification

Choose exactly one primary task type:

```txt
[ ] Visual polish
[ ] Layout/grid stabilization
[ ] Responsive fix
[ ] Component extraction
[ ] Component restyle
[ ] New component
[ ] Modal/overlay update
[ ] HUD update
[ ] TopNav/Footer update
[ ] Dashboard/stats panel update
[ ] Theme/token update
[ ] Figma-to-code alignment
[ ] Revert UI drift
```

Secondary impact:

```txt
[ ] No gameplay impact
[ ] Possible gameplay layout impact
[ ] Possible input/touch impact
[ ] Possible render/canvas impact
[ ] Possible z-index/pointer-events impact
[ ] Possible mobile impact
```

If there is possible gameplay/render/input impact, verify with architecture and project contract before editing.

---

# 3. Scope Gate

Allowed files are strict.

```txt
[ ] Every file to edit is listed in Allowed files.
[ ] No file outside Allowed files will be edited.
[ ] No package/config/test/docs file will be edited unless explicitly allowed.
[ ] No global CSS/theme file will be edited unless explicitly allowed.
[ ] No game core/render/data/audio file will be edited unless task requires it.
```

If a design issue requires out-of-scope files:

```txt
Stop.
Report the needed file.
Explain why it is needed.
Suggest a separate task.
```

---

# 4. Product Type Gate

Confirm the patch preserves product type.

```txt
Current product type:
[ ] Game-first web app
[ ] Mini web app
[ ] Visual prototype
[ ] Landing/template scaffold
[ ] Dashboard/admin app
[ ] Mixed
```

For game-first app:

```txt
[ ] The game remains the main product.
[ ] The game board/canvas remains visually dominant.
[ ] The player can immediately see where to play.
[ ] TopNav remains compact.
[ ] Footer remains minimal.
[ ] Dashboard/stats remain secondary.
[ ] Mobile shows the game first.
```

Reject patch if it adds or emphasizes:

```txt
[ ] Hero section above the game.
[ ] Marketing CTA before gameplay.
[ ] Feature cards before gameplay.
[ ] Long landing scroll.
[ ] Pricing/testimonial sections.
[ ] SaaS/admin dashboard layout.
[ ] Oversized sidebar that competes with game board.
```

---

# 5. Design Source Gate

Identify the design source for this patch.

```txt
Design source:
[ ] DESIGN.md
[ ] Figma frame
[ ] Screenshot
[ ] Existing UI
[ ] User instruction
[ ] Bug report
[ ] Generated export
[ ] Other:
```

Fill:

```txt
Exact design section/frame:
- ...

What should change:
- ...

What must stay the same:
- ...

Confidence:
[ ] High
[ ] Medium
[ ] Low
```

If design source is unclear:

```txt
Do not invent a new UI direction.
Report ambiguity.
Use the smallest safe patch.
```

---

# 6. Visual Hierarchy Gate

For game-first screens, confirm visual priority:

```txt
[ ] Game board/canvas is priority #1.
[ ] HUD is connected to the game area.
[ ] Primary action is visible but not oversized.
[ ] Game over/result overlay appears above game.
[ ] Stats/dashboard are secondary.
[ ] Login/settings panels are secondary.
[ ] Decorative background does not compete with gameplay.
```

Reject if:

```txt
[ ] Game board becomes smaller than support panels.
[ ] TopNav/Footer visually dominate.
[ ] Decorative art hides interactive area.
[ ] Layout makes player scroll before playing.
[ ] Main CTA becomes marketing instead of gameplay.
```

---

# 7. Layout/Grid Gate

## Desktop

```txt
[ ] Game area remains centered or clearly primary.
[ ] Side panel, if present, is secondary.
[ ] TopNav is compact.
[ ] Footer is minimal.
[ ] Layout does not become generic landing page.
[ ] No excessive empty space around the game.
```

## Tablet

```txt
[ ] Game area remains above secondary content.
[ ] Panels can stack below.
[ ] Controls remain touch-friendly.
[ ] No cramped multi-column layout.
```

## Mobile

```txt
[ ] Game appears first.
[ ] HUD remains readable.
[ ] Buttons are reachable.
[ ] Stats/dashboard move below or collapse.
[ ] Fixed header/footer does not block gameplay.
[ ] No large landing scroll before game.
[ ] Game over/replay is reachable without awkward scrolling.
```

---

# 8. Component Ownership Gate

Confirm the component being edited owns the responsibility being changed.

```txt
Component:
- ...

Current owner role:
[ ] App shell
[ ] Page/screen composition
[ ] Game board/canvas wrapper
[ ] HUD
[ ] Modal/overlay
[ ] Button/control
[ ] Dashboard/stats panel
[ ] Footer
[ ] Generic UI primitive
[ ] Generated visual component
```

Allowed ownership examples:

```txt
App shell:
- TopNav placement
- global background
- main frame
- footer placement

Game screen:
- game layout composition
- responsive order
- HUD/panel placement

Game board/canvas wrapper:
- board/canvas boundary
- sizing
- interaction area

HUD:
- score/timer/lives/combo display
- compact game status

Modal/overlay:
- login/game over/settings overlay
- close/replay/confirm UI

Dashboard/stats:
- best score
- last score
- leaderboard
- user stats
```

Reject if:

```txt
[ ] UI primitive starts owning game-specific behavior.
[ ] HUD calculates gameplay rules.
[ ] Game board wrapper saves score.
[ ] Dashboard becomes main product screen accidentally.
[ ] Component extraction changes visual behavior.
```

---

# 9. Token Gate

Before adding or changing visual values:

```txt
[ ] Existing color tokens checked.
[ ] Existing typography tokens checked.
[ ] Existing spacing scale checked.
[ ] Existing radius/shadow/border rules checked.
[ ] Existing component style checked.
```

Do not:

```txt
[ ] Hard-code random new colors if tokens exist.
[ ] Hard-code random font families.
[ ] Add new spacing/radius/shadow systems without updating DESIGN.md.
[ ] Change warm/game/hand-made vibe into corporate/SaaS style.
[ ] Introduce unrelated Tailwind color palette.
```

If new token is needed:

```txt
[ ] Explain why existing tokens are insufficient.
[ ] Add token in the correct design/theme file.
[ ] Update DESIGN.md if docs update is in scope.
[ ] Use the token consistently.
```

If docs update is not in scope:

```txt
Stop and report that a token/design-doc update is needed.
```

---

# 10. Content/Copy Gate

For text changes:

```txt
[ ] Copy supports the gameplay/product flow.
[ ] No new marketing copy unless task asks for it.
[ ] No large text blocks inside reusable components.
[ ] Vietnamese diacritics preserved.
[ ] Labels are short and clear for game UI.
```

Static content may belong in:

```txt
src/content/*
src/features/<feature>/<feature>.content.ts
```

Dynamic game state is not content:

```txt
score
timer
lives
combo
tile value
fruit type
game status
leaderboard loading/error
```

Reject if:

```txt
[ ] Patch adds feature-card/CTA/testimonial copy to game screen.
[ ] Reusable component gets hardcoded project-specific text.
[ ] Game labels become long marketing slogans.
```

---

# 11. Game Behavior Preservation Gate

For UI-only patches:

```txt
[ ] Do not change score formula.
[ ] Do not change win/lose rules.
[ ] Do not change random/spawn behavior.
[ ] Do not change input rules.
[ ] Do not change save score behavior.
[ ] Do not change Firebase/localStorage behavior.
[ ] Do not change audio behavior.
[ ] Do not change PixiJS/game loop behavior.
```

Manual smoke check:

```txt
[ ] Game starts.
[ ] Game can be played.
[ ] Game over/replay works.
[ ] Score displays correctly.
[ ] Mobile input still works.
[ ] Desktop input still works.
[ ] UI overlay does not block active gameplay unless intended.
```

If UI change requires gameplay change:

```txt
Stop.
Report that this is not a UI-only patch.
Create a separate gameplay/core task.
```

---

# 12. Render/PixiJS Boundary Gate

If the UI patch touches canvas/game board/render wrapper:

```txt
[ ] React owns layout around canvas.
[ ] PixiJS owns only canvas/render runtime.
[ ] UI patch does not move gameplay rules into PixiJS.
[ ] UI patch does not make PixiJS render normal UI like navbar/modal/footer.
[ ] Canvas sizing remains stable.
[ ] Canvas z-index/pointer-events remain correct.
```

Layering check:

```txt
[ ] Canvas/game layer below HUD/overlay where needed.
[ ] HUD above canvas.
[ ] Game over overlay above game.
[ ] Modal above game over if needed.
[ ] Panels clickable when open.
[ ] Canvas does not capture clicks intended for modal/panel.
```

Reject if:

```txt
[ ] Normal UI is moved into PixiJS.
[ ] Canvas blocks modal/panel interactions.
[ ] UI layout patch changes render lifecycle.
[ ] Game board size changes without responsive reason.
```

---

# 13. Responsive / Touch Gate

For mobile/tablet changes:

```txt
[ ] Tap targets remain large enough.
[ ] Swipe/drag/touch area is not blocked.
[ ] HUD does not cover active interaction area.
[ ] Fixed elements do not block gameplay.
[ ] Viewport height behavior checked.
[ ] Game is visible without unnecessary scrolling.
[ ] Overlays are usable on small screens.
```

Reject if:

```txt
[ ] Mobile opens with header/hero and game below fold.
[ ] Stats panel appears before game.
[ ] Footer blocks bottom controls.
[ ] Modal cannot be closed on small screen.
[ ] Board/canvas becomes too small to play.
```

---

# 14. Accessibility / Usability Gate

Minimum checks:

```txt
[ ] Text contrast remains readable.
[ ] Buttons have clear labels.
[ ] Interactive elements look interactive.
[ ] Important state is not only color-coded.
[ ] Loading/error states remain visible.
[ ] Modal close/replay action is clear.
[ ] UI remains understandable without reading long instructions.
```

For game-first UI:

```txt
[ ] Player immediately understands where to interact.
[ ] Primary action is obvious.
[ ] HUD values are readable at a glance.
```

---

# 15. Visual Drift Gate

Compare before/after.

```txt
[ ] Product still feels like the same app.
[ ] Theme/vibe preserved.
[ ] Color palette preserved.
[ ] Typography preserved.
[ ] Spacing/radius/shadow style preserved.
[ ] Game-first hierarchy preserved.
[ ] No new generic SaaS/dashboard feel.
[ ] No accidental landing-page sections.
```

Common drift signals:

```txt
[ ] Blue corporate buttons appear in warm game UI.
[ ] Game board loses visual dominance.
[ ] Sidebar/dashboard becomes primary.
[ ] Decorative art overpowers gameplay.
[ ] Large heading/hero appears above game.
[ ] Footer becomes a marketing section.
[ ] Component looks copied from unrelated template.
```

If drift is found:

```txt
Do not mark patch PASS.
Either fix within allowed files or report as follow-up if out of scope.
```

---

# 16. Before Editing Checklist

Before editing, agent must output:

```txt
UI Patch Plan

Task type:
- ...

Design source:
- ...

Files to touch:
- ...

Files not to touch:
- ...

Behavior to preserve:
- ...

Design rules to preserve:
- ...

Responsive risks:
- ...

Game-first risks:
- ...

Validation commands:
- ...
```

Required confirmation:

```txt
[ ] This patch is UI/component/layout only.
[ ] Gameplay behavior will not change.
[ ] Files are within allowed scope.
[ ] DESIGN.md has been checked.
[ ] This gate has been checked.
```

---

# 17. After Editing Checklist

After editing, agent must verify:

```txt
[ ] Only allowed files changed.
[ ] No unexpected files changed.
[ ] Visual intent preserved.
[ ] Game-first hierarchy preserved.
[ ] Responsive behavior preserved.
[ ] Component ownership preserved.
[ ] No forbidden dependency edge introduced.
[ ] No gameplay rule changed.
[ ] No save score/storage behavior changed.
[ ] No PixiJS lifecycle/render behavior changed unless task allowed it.
```

Run available commands:

```bash
npm run typecheck
npm test
npm run build
npm run lint
git diff --check
git status --short
git diff --stat
```

Only run commands that exist in `package.json`.

---

# 18. UI Patch Report Format

After a UI patch, output:

```txt
# UI Patch Report

## Status
PASS / FAIL / BLOCKED

## Task type
- ...

## Design source used
- ...

## Changed files
- ...

## Why each file changed
- ...

## Design rules preserved
- ...

## Game-first hierarchy result
- ...

## Responsive result
- ...

## Component ownership result
- ...

## Behavior preserved
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

## Visual drift risks
- ...

## Follow-up
- ...
```

---

# 19. Pass / Fail Criteria

## PASS

A UI patch can pass only if:

```txt
[ ] It touches only allowed files.
[ ] It follows DESIGN.md.
[ ] It preserves product type.
[ ] It preserves game-first hierarchy if applicable.
[ ] It preserves responsive behavior.
[ ] It does not change gameplay unless explicitly requested.
[ ] It does not introduce forbidden imports.
[ ] It passes available verification or clearly reports unavailable scripts.
[ ] It includes a UI Patch Report.
```

## FAIL

Mark FAIL if:

```txt
[ ] Game becomes less playable.
[ ] Game board/canvas loses primary visual role.
[ ] UI turns into landing page/dashboard unintentionally.
[ ] Patch changes gameplay in UI-only task.
[ ] Patch changes save score/storage behavior in UI-only task.
[ ] Patch introduces random visual style.
[ ] Patch edits unexpected files.
[ ] Build/typecheck/test fails due to patch.
```

## BLOCKED

Mark BLOCKED if:

```txt
[ ] Design source is unclear.
[ ] Needed file is outside allowed scope.
[ ] Required architecture boundary is unclear.
[ ] Existing code state prevents safe UI patch.
[ ] Required token/design update is out of scope.
```

---

# 20. Revert UI Drift Gate

Use this section when UI has drifted into landing page/dashboard style.

Problem statement:

```txt
Current problem:
The app has been interpreted too much like a landing page/dashboard website.
The UI must return to a game-first layout.
```

Revert requirements:

```txt
[ ] Keep game board/canvas as the main visual center.
[ ] Remove or reduce landing-page-like sections.
[ ] TopNav compact.
[ ] Footer minimal.
[ ] Dashboard/stats secondary.
[ ] Mobile shows game first.
[ ] Preserve existing gameplay.
[ ] Preserve PixiJS logic.
[ ] Do not touch game core unless required by layout integration.
[ ] Do not change scoring.
[ ] Do not change Firebase/localStorage.
```

After revert, report:

```txt
[ ] Which files caused landing-page interpretation.
[ ] Which wording in DESIGN.md or prompt may have caused it.
[ ] Safer future prompt.
[ ] Commands run and results.
```

---

# 21. Design Gate Summary

Fill this before marking UI patch done.

```txt
Design gate status:
[ ] PASS
[ ] FAIL
[ ] BLOCKED

Task type:
- ...

Design source:
- ...

Files changed:
- ...

Product type preserved:
[ ] Yes
[ ] No

Game-first hierarchy preserved:
[ ] Yes
[ ] No
[ ] Not applicable

Responsive behavior preserved:
[ ] Yes
[ ] No

Gameplay behavior preserved:
[ ] Yes
[ ] No

Visual drift found:
[ ] No
[ ] Yes:

Unexpected files:
[ ] No
[ ] Yes:

Verification:
- ...

Follow-up:
- ...
```

---

# 22. Final Rule

```txt
DESIGN.md is the design source of truth.
DESIGN-APPLICATION-GATE.md is the UI patch safety checklist.
A UI patch is not done until this gate passes.
```

For game-first projects, preserve this every time:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
TopNav, Footer, Dashboard, stats, and panels are supporting UI only.
Do not add hero sections, marketing CTA, feature cards, or long landing scroll unless explicitly requested.
```