# 05 — DESIGN.md

File này là **design source of truth** cho project.

Nó mô tả UI phải trông như thế nào, cảm giác sản phẩm là gì, component phải dùng style nào, layout phải ưu tiên thứ gì, và những gì không được tự ý thêm vào.

File này không phải là architecture document.  
File này không phải là agent rules.  
File này không phải là checklist patch.  
Checklist để kiểm tra từng UI patch nằm ở:

```txt
docs/06-DESIGN-APPLICATION-GATE.md
```

---

# 0. Purpose

Mục tiêu của `DESIGN.md`:

```txt
[ ] Khóa visual direction.
[ ] Khóa layout direction.
[ ] Tránh AI hiểu nhầm game thành landing page.
[ ] Tránh UI bị drift sang SaaS/dashboard generic.
[ ] Tránh hard-code màu/font/spacing mới lung tung.
[ ] Giúp mọi UI/component patch dùng cùng một design language.
[ ] Giúp agent biết phần nào là primary, phần nào là support UI.
```

Design source of truth phải đủ rõ để một agent không cần đoán:

```txt
Sản phẩm này nên nhìn như thế nào?
Màn hình này ưu tiên cái gì?
Component mới nên dùng style nào?
UI patch có được thêm section mới không?
Game board/canvas có còn là trung tâm không?
```

---

# 1. Related Files

```txt
docs/01-FIGMA-TRIAGE-HANDOFF.md
= Xác định project type, strategy, first safe patch.

docs/02-PROJECT-CONTRACT.md
= Khóa luật project, behavior không được phá, layer ownership.

docs/03-ARCHITECTURE.md
= Mô tả code nằm ở đâu, layer nào sở hữu gì.

AGENTS.md
= Luật cho AI agent khi sửa repo.

docs/05-DESIGN.md
= Design source of truth.

docs/06-DESIGN-APPLICATION-GATE.md
= Checklist mỗi lần chỉnh UI/component.

templates/TASK-CONTRACT.md
= Scope cụ thể cho từng patch.
```

Rule:

```txt
DESIGN.md tells what the UI should look like.
DESIGN-APPLICATION-GATE.md checks whether a UI patch follows DESIGN.md.
```

---

# 2. Design Status

```txt
Design status:
[ ] Current design documented
[ ] Target design documented
[ ] Partially documented
[ ] Unknown / needs Figma audit

Source:
[ ] Figma frame
[ ] Figma Make export
[ ] Existing app UI
[ ] Hand-written design.md
[ ] Screenshot reference
[ ] User instruction
[ ] Mixed

Last updated:
- ...

Owner:
- ...
```

Important labels:

```txt
Current:
Target:
Planned:
Deprecated:
Unknown:
```

Do not describe planned design as if it already exists.

---

# 3. Product Design Intent

## 3.1. Product type

Choose one:

```txt
[ ] Game-first web app
[ ] Mini web app
[ ] Visual prototype
[ ] Landing/template scaffold
[ ] Dashboard/admin app
[ ] Mixed
```

## 3.2. Primary user action

What should the user immediately understand?

```txt
Primary action:
- Play the game
- Start/replay
- Drag/drop blocks
- Move/swipe tiles
- Slice/click targets
- View result
- Save score
- Other:
```

## 3.3. Design intent

```txt
This product should feel:
- ...
```

Example for a Vietnamese countryside game:

```txt
This product should feel nostalgic, playful, warm, hand-made, and game-first.
The visual style should suggest Vietnamese countryside, rice paper, bamboo, warm sunlight, folk illustration, and playful game energy.
```

---

# 4. Screen Type

Choose the main screen type:

```txt
[ ] Game-first screen
[ ] Game menu
[ ] Game over/result screen
[ ] Dashboard/support screen
[ ] Settings screen
[ ] Landing page
[ ] Multi-route app
[ ] Mixed
```

## If this is a game-first screen

Mandatory rule:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
The player should immediately understand where to play.
```

Supporting UI:

```txt
TopNav:
- compact
- does not dominate
- supports navigation/login/settings only

Footer:
- minimal
- does not create landing-page scroll
- does not push the game away from the viewport

Dashboard/stats:
- secondary
- side panel, compact panel, or below-game section
- must not compete with the game board/canvas

HUD:
- visible
- readable
- does not block player interaction
```

Forbidden reinterpretation:

```txt
Do not reinterpret this game as:
[ ] Marketing landing page
[ ] SaaS dashboard
[ ] Portfolio site
[ ] Product homepage
[ ] Long-scroll promotional page
```

---

# 5. Visual Hierarchy

Define visual priority from most important to least important.

For a game-first app:

```txt
1. Game board / canvas / play area
2. HUD: score, lives, timer, combo, status
3. Primary action: start, replay, continue
4. Game over / result overlay
5. Secondary stats / leaderboard / dashboard
6. Login/settings/support panels
7. TopNav
8. Footer
9. Decorative background
```

Rules:

```txt
[ ] Game area must be visually dominant.
[ ] Decorative elements must not reduce playability.
[ ] Support panels must not look more important than the game.
[ ] TopNav/Footer must not frame the product like a landing page.
[ ] If space is limited, preserve game area first.
```

---

# 6. Layout Contract

This section defines how the screen is structured.

## 6.1. Primary layout rule

```txt
The main play area must be centered, dominant, and immediately visible.
```

Do not create:

```txt
[ ] Hero section above the game.
[ ] Large marketing headline pushing the game down.
[ ] Feature cards before gameplay.
[ ] Long landing page scroll before gameplay.
[ ] Pricing/testimonial/CTA sections unless explicitly requested.
```

## 6.2. Desktop layout

Recommended structure:

```txt
TopNav: compact
Main content: game-centered
Optional side panel: stats/dashboard
Footer: minimal/supportive
```

Desktop rules:

```txt
[ ] Game center.
[ ] Optional side stats/dashboard only if game remains dominant.
[ ] TopNav compact.
[ ] Footer minimal.
[ ] Avoid 3-column layout if it makes the game board lose focus.
[ ] Avoid oversized sidebars.
```

## 6.3. Tablet layout

```txt
[ ] Game remains above secondary panels.
[ ] Stats can move below or become collapsible.
[ ] Controls remain touch-friendly.
[ ] Avoid cramped side-by-side layout.
```

## 6.4. Mobile layout

```txt
[ ] Game first.
[ ] HUD readable.
[ ] Main controls reachable by thumb.
[ ] Stats below or collapsible.
[ ] No large landing scroll.
[ ] No fixed footer blocking gameplay.
[ ] Buttons large enough for touch.
[ ] Game area not hidden below header/hero copy.
```

## 6.5. Overlay layout

```txt
[ ] Game over overlay appears above game.
[ ] Modal appears above overlay when needed.
[ ] Panels do not block active play unless intentionally modal.
[ ] Pointer events are clear.
[ ] Overlay text remains readable on animated/canvas background.
```

---

# 7. Figma / Design References

Use this section to map design source to implementation.

## 7.1. Figma frames

|Purpose|Frame name|URL / ID|Notes|
|---|---|---|---|
|Main game screen||||
|Mobile game screen||||
|Game over||||
|Login modal||||
|Dashboard/stats||||
|Settings||||

## 7.2. Source confidence

```txt
Figma source confidence:
[ ] High
[ ] Medium
[ ] Low
[ ] Unknown
```

If Figma and current app disagree:

```txt
[ ] Document the mismatch.
[ ] Do not guess.
[ ] Do not silently redesign.
[ ] Ask for design decision or create a design decision note.
```

---

# 8. Theme / Vibe

## 8.1. Theme keywords

```txt
Primary vibe:
- ...

Secondary vibe:
- ...

Avoid:
- ...
```

Example:

```txt
Primary vibe:
- Vietnamese countryside
- nostalgic childhood
- warm rice paper
- hand-drawn
- playful
- cozy
- light folk-art inspiration

Avoid:
- SaaS dashboard
- corporate landing page
- cold glassmorphism
- neon cyberpunk
- generic mobile game UI
- overly realistic 3D
```

## 8.2. Art direction

```txt
Illustration style:
- hand-drawn
- soft watercolor wash
- pencil/sketch edges
- warm paper texture
- simple playful icons
```

Decorative assets should support the game, not become the product.

---

# 9. Color System

## 9.1. Design tokens

Define tokens here.

```css
:root {
  --rice-paper: ;
  --paper-warm: ;
  --bamboo: ;
  --peanut: ;
  --earth-brown: ;
  --ink-dark: ;
  --sun-warm: ;
  --danger: ;
  --success: ;
  --warning: ;
}
```

Example direction:

```txt
Base:
- warm paper background
- soft cream surfaces
- earthy brown text
- bamboo/leaf accents
- peanut/gold highlight

Interaction:
- clear primary action
- readable disabled state
- accessible contrast
```

## 9.2. Color rules

```txt
[ ] Use existing tokens when available.
[ ] Do not hard-code random new colors in components.
[ ] Do not introduce a new palette without updating DESIGN.md.
[ ] Do not change the visual style from warm/playful to corporate/dashboard.
[ ] Use semantic tokens for error/success/warning.
[ ] Canvas/Pixi colors should align with the same palette.
```

## 9.3. Forbidden color drift

Avoid:

```txt
[ ] Random Tailwind colors unrelated to theme.
[ ] Cold blue SaaS palette unless explicitly requested.
[ ] Neon gradients unless part of the game style.
[ ] High-saturation colors that fight the game board.
[ ] Low-contrast text on textured backgrounds.
```

---

# 10. Typography

## 10.1. Fonts

```txt
Primary font:
- ...

Secondary/accent font:
- ...

Fallback:
- ...
```

Example:

```txt
Primary:
- Be Vietnam Pro or similar readable Vietnamese-supporting sans font.

Accent:
- Hand-drawn or rounded display style only for small decorative headings.
```

## 10.2. Typography rules

```txt
[ ] Body text must support Vietnamese diacritics.
[ ] HUD numbers must be readable quickly.
[ ] Buttons must be readable on mobile.
[ ] Do not use too many fonts.
[ ] Do not use decorative font for long text.
[ ] Do not shrink score/timer until unreadable.
```

## 10.3. Text hierarchy

```txt
Page title:
- ...

Section title:
- ...

HUD number:
- ...

Button:
- ...

Small helper text:
- ...
```

---

# 11. Spacing / Radius / Shadow / Border

## 11.1. Spacing scale

```txt
Spacing scale:
- xs:
- sm:
- md:
- lg:
- xl:
- 2xl:
```

Rules:

```txt
[ ] Use consistent spacing scale.
[ ] Do not add arbitrary margins/padding without reason.
[ ] Game area spacing has priority over decorative whitespace.
[ ] Mobile spacing should preserve play area.
```

## 11.2. Radius

```txt
Radius:
- small:
- medium:
- large:
- pill:
```

Rules:

```txt
[ ] Buttons/cards should use existing radius scale.
[ ] Game tiles/blocks should feel consistent with theme.
[ ] Avoid mixing sharp corporate cards with soft hand-made theme.
```

## 11.3. Shadows and borders

```txt
Shadow style:
- ...

Border style:
- ...

Surface style:
- ...
```

Rules:

```txt
[ ] Shadows should feel soft and warm.
[ ] Borders can use ink/hand-drawn style if theme supports it.
[ ] Avoid heavy glassmorphism unless explicitly part of design.
```

---

# 12. Surface / Panel System

Define common surfaces.

```txt
App background:
- ...

Game board surface:
- ...

HUD surface:
- ...

Panel surface:
- ...

Modal surface:
- ...

Button surface:
- ...
```

Rules:

```txt
[ ] Game board must stand out from background.
[ ] HUD must be readable without overpowering game.
[ ] Panels must be secondary.
[ ] Modal must be readable above canvas/animation.
[ ] Paper/texture effects should not reduce contrast.
```

---

# 13. Component Design Rules

## 13.1. App shell

App shell owns:

```txt
[ ] TopNav placement.
[ ] Main layout frame.
[ ] Footer placement.
[ ] Global background.
```

App shell must not:

```txt
[ ] Calculate gameplay.
[ ] Own Pixi resources.
[ ] Save score directly unless explicitly designed.
```

Design rules:

```txt
[ ] Shell supports game-first layout.
[ ] Shell does not turn the app into landing page.
[ ] Shell should be visually calm around the game.
```

---

## 13.2. Game screen

Game screen owns:

```txt
[ ] Layout composition for game board, HUD, panels.
[ ] Responsive order.
[ ] Overlay placement.
```

Design rules:

```txt
[ ] Game board/canvas centered and dominant.
[ ] HUD close enough to game to feel connected.
[ ] Dashboard/stats secondary.
[ ] Mobile order: game first, support content later.
```

---

## 13.3. Game board / canvas

Game board owns:

```txt
[ ] Board visual boundary.
[ ] Game visual area.
[ ] Interaction area.
```

Design rules:

```txt
[ ] Board must be immediately recognizable.
[ ] Board must not be visually smaller than support panels.
[ ] Board must maintain safe touch area on mobile.
[ ] Decorative background must not confuse interactive area.
```

---

## 13.4. HUD

HUD owns:

```txt
[ ] Score.
[ ] Timer.
[ ] Lives.
[ ] Combo.
[ ] Game status.
[ ] Minimal controls if needed.
```

Design rules:

```txt
[ ] HUD readable at a glance.
[ ] HUD does not block gameplay.
[ ] HUD uses compact surfaces.
[ ] HUD should match game theme, not generic admin dashboard.
```

---

## 13.5. Buttons

Button types:

```txt
Primary:
- Start / replay / continue

Secondary:
- Settings / close / back

Danger:
- Reset / delete / quit

Ghost:
- subtle nav/support actions
```

Rules:

```txt
[ ] Primary action should be obvious.
[ ] Touch target must be large enough on mobile.
[ ] Button style must reuse tokens.
[ ] Avoid generic blue SaaS buttons unless in design.
```

---

## 13.6. Modals / overlays

Modal owns:

```txt
[ ] Login prompt.
[ ] Game over.
[ ] Settings.
[ ] Confirmation.
```

Rules:

```txt
[ ] Overlay above game/canvas.
[ ] Text readable over background.
[ ] Close action clear.
[ ] Does not mutate gameplay unless intentionally part of flow.
[ ] Game over overlay should focus result and replay.
```

---

## 13.7. Dashboard / stats panel

Dashboard/stats owns:

```txt
[ ] Best score.
[ ] Last score.
[ ] Total games.
[ ] Leaderboard.
[ ] User status.
```

Rules:

```txt
[ ] Secondary to game.
[ ] Compact on desktop.
[ ] Below/collapsible on mobile.
[ ] Does not become the main screen unless task is dashboard-specific.
[ ] Should not introduce full SaaS admin styling.
```

---

## 13.8. Footer

Footer owns:

```txt
[ ] Small credits.
[ ] Minimal links.
[ ] Help text if needed.
```

Rules:

```txt
[ ] Footer must not dominate.
[ ] Footer must not create landing-page feel.
[ ] Footer should not push gameplay below the fold.
```

---

# 14. Content / Copy Rules

Static copy should live in content/config files when it grows.

```txt
Recommended:
src/content/*
src/features/<feature>/<feature>.content.ts
```

Rules:

```txt
[ ] Do not hard-code large marketing copy inside reusable components.
[ ] Do not add new marketing sections without explicit request.
[ ] Game labels should be short and clear.
[ ] Vietnamese text must preserve diacritics.
[ ] Copy should support gameplay, not distract from it.
```

Game dynamic state is not content:

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

---

# 15. Motion / Animation

Motion should support game feel.

```txt
Animation style:
- playful
- responsive
- clear feedback
- not overly distracting
```

Rules:

```txt
[ ] Animation must not hide game state.
[ ] Feedback animation should be short and readable.
[ ] Avoid expensive UI animations that hurt game performance.
[ ] Respect reduced motion if implemented.
[ ] Do not add animation-heavy UI without task scope.
```

For PixiJS/game render:

```txt
[ ] Use PixiJS for sprite/effect/canvas-heavy visuals only.
[ ] React UI remains responsible for nav, modal, HUD, forms.
[ ] Canvas animation should align with DESIGN.md theme.
```

---

# 16. Responsive Behavior

## Desktop

```txt
[ ] Game center.
[ ] Optional side panel if space allows.
[ ] TopNav compact.
[ ] Footer minimal.
[ ] Game area remains visually dominant.
```

## Tablet

```txt
[ ] Game first.
[ ] Panels may stack below.
[ ] Controls remain touch-friendly.
[ ] Avoid cramped multi-column layout.
```

## Mobile

```txt
[ ] Game first.
[ ] HUD compact.
[ ] Stats below or collapsible.
[ ] No large landing scroll.
[ ] Buttons large enough to tap.
[ ] Canvas/board not blocked by fixed UI.
[ ] Game over/replay reachable without awkward scrolling.
```

---

# 17. Accessibility / Usability

Minimum usability rules:

```txt
[ ] Text contrast is readable.
[ ] Buttons have clear labels.
[ ] Important state is visible, not only color-coded.
[ ] Touch targets are large enough.
[ ] Game controls are understandable.
[ ] Modals can be closed.
[ ] Error/loading states are visible.
```

For game-first UI:

```txt
[ ] Player sees where to play immediately.
[ ] Game input area is not hidden behind overlay.
[ ] HUD does not block active gestures.
```

---

# 18. Do Not Add

Unless explicitly requested, do not add:

```txt
[ ] Hero section
[ ] Marketing CTA block
[ ] Feature cards
[ ] Pricing section
[ ] Testimonials
[ ] Long landing page sections
[ ] SaaS dashboard layout
[ ] Admin sidebar
[ ] Analytics widgets
[ ] Auth-heavy onboarding flow
[ ] Payment/subscription UI
[ ] Random decorative sections before gameplay
```

If a future task requires one of these, update DESIGN.md first and explain why product type changed.

---

# 19. Design Drift Risks

Common risks:

```txt
[ ] Agent sees TopNav/Footer/Dashboard and assumes landing page.
[ ] Agent makes game board smaller to fit cards/panels.
[ ] Agent introduces random SaaS colors.
[ ] Agent adds hardcoded marketing copy inside components.
[ ] Agent uses PixiJS for normal UI.
[ ] Agent changes component layout without checking mobile.
[ ] Agent creates generic dashboard instead of game support panel.
[ ] Agent changes visual style while refactoring logic.
```

Mitigation:

```txt
[ ] Keep game-first statement in every UI task.
[ ] Use tokens.
[ ] Use DESIGN-APPLICATION-GATE.md before UI patches.
[ ] Keep layout changes separate from gameplay changes.
[ ] Preserve current visual design unless task explicitly changes it.
```

---

# 20. Design Change Process

Any UI/design change must follow this process:

```txt
1. Identify task type:
   - visual polish
   - layout change
   - component extraction
   - responsive fix
   - new screen
   - theme update

2. Identify source:
   - Figma frame
   - screenshot
   - DESIGN.md section
   - explicit user instruction

3. Check impact:
   - layout
   - tokens
   - components
   - mobile
   - game-first hierarchy
   - gameplay behavior

4. Apply only scoped patch.

5. Run DESIGN-APPLICATION-GATE.md.

6. Report:
   - files changed
   - design rule applied
   - behavior preserved
   - visual risks
```

---

# 21. Updating DESIGN.md

Update this file when:

```txt
[ ] Visual direction changes.
[ ] Product type changes.
[ ] Figma frame changes.
[ ] New theme tokens are introduced.
[ ] Layout hierarchy changes.
[ ] New reusable component style is introduced.
[ ] Game-first rule changes.
[ ] Mobile/desktop behavior changes.
```

Do not update this file during a code patch unless docs update is explicitly allowed.

If code and design disagree:

```txt
[ ] Report mismatch.
[ ] Do not pretend both are true.
[ ] Label design as Current / Target / Planned / Unknown.
```

---

# 22. Design Summary

Fill this section for each project.

```txt
Design status:
- ...

Product type:
- ...

Screen type:
- ...

Primary visual area:
- ...

Theme:
- ...

Color system:
- ...

Typography:
- ...

Layout rule:
- ...

Game-first rule:
- ...

Do not add:
- ...

Main design risks:
- ...

Design gate:
- See docs/06-DESIGN-APPLICATION-GATE.md
```

---

# 23. Final Rule

```txt
DESIGN.md tells what the UI should look like.
ARCHITECTURE.md tells where code belongs.
AGENTS.md tells how agents must behave.
DESIGN-APPLICATION-GATE.md prevents UI patches from drifting away from design.
TASK-CONTRACT.md controls the current patch.
```

For game-first apps, always preserve this rule:

```txt
This is a game-first product, not a landing page.
The game board/canvas must remain the primary visual area.
TopNav/Footer/Dashboard are supporting UI only.
Do not add hero sections, marketing CTA, feature cards, or long landing scroll unless explicitly requested.
```