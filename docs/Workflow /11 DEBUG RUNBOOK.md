# 11 — DEBUG-RUNBOOK.md

File này là runbook debug cho project game / React / Vite / PixiJS / Figma-generated UI.

Mục tiêu:

```txt
[ ] Debug theo quy trình.
[ ] Không sửa bừa.
[ ] Không phá architecture.
[ ] Không xóa feature để né lỗi.
[ ] Không cleanup dependency khi đang debug runtime.
[ ] Ghi rõ nguyên nhân, bằng chứng, fix scope, verification.
```

File này dùng khi gặp:

```txt
[ ] Blank screen.
[ ] Vite dev server / websocket lỗi.
[ ] Build/typecheck fail.
[ ] Console runtime error.
[ ] PixiJS black screen / black texture.
[ ] Passive event listener warning.
[ ] Duplicate ticker/listener/canvas.
[ ] Replay bị nhân đôi object.
[ ] Mobile input/swipe không ăn.
[ ] Overlay/modal bị canvas chặn.
[ ] Resize/DPR/canvas scale sai.
[ ] Firebase/save score lỗi.
[ ] localStorage lỗi.
[ ] Audio không phát.
[ ] UI drift sau khi sửa.
```

---

# 0. Primary Rule

```txt
Debug first.
Patch second.
Verify third.
Report last.
```

Không được:

```txt
[ ] Không sửa nhiều layer cùng lúc.
[ ] Không xóa feature để hết lỗi.
[ ] Không comment out code như một fix.
[ ] Không đổi gameplay khi lỗi chỉ nằm ở UI.
[ ] Không đổi UI khi lỗi chỉ nằm ở core.
[ ] Không đổi dependency/config nếu chưa chứng minh cần.
[ ] Không apply PixiJS để fix layout thường.
```

Nếu fix cần file ngoài scope:

```txt
Stop.
Report needed file.
Create separate task.
```

---

# 1. Required Debug Flow

Mọi bug phải đi theo flow này:

```txt
1. Reproduce
2. Classify
3. Locate owner layer
4. Inspect exact files
5. Identify root cause
6. Create small fix plan
7. Patch only allowed files
8. Run verification
9. Manual smoke test
10. Write debug report
```

Không nhảy thẳng vào sửa code.

---

# 2. Bug Report Template

Khi gặp bug, điền:

```txt
# Debug Report

## Symptom
- ...

## Reproduction steps
1. ...
2. ...
3. ...

## Expected behavior
- ...

## Actual behavior
- ...

## Console/log output
- ...

## Affected layer
[ ] UI
[ ] Core/game logic
[ ] Runtime/session
[ ] Input
[ ] Render/PixiJS
[ ] Data/storage
[ ] Audio
[ ] Build/config
[ ] Dependency
[ ] Unknown

## Suspected files
- ...

## Root cause
- ...

## Fix scope
- ...

## Files to touch
- ...

## Files not to touch
- ...

## Verification
- ...

## Result
PASS / FAIL / BLOCKED
```

---

# 3. Fast Triage Checklist

Trước khi sửa:

```bash
git status --short
cat package.json
npm run build
npm run typecheck
npm test
git diff --check
```

Chỉ chạy script có trong `package.json`.

Nếu script không có:

```txt
Report: NOT AVAILABLE.
Do not invent a new script.
```

Kiểm tra runtime path:

```bash
cat index.html
cat src/main.tsx
rg "createRoot|hydrateRoot|BrowserRouter|Routes|Route|createBrowserRouter" src
```

Kiểm tra lỗi phổ biến:

```bash
rg -n "addEventListener|removeEventListener|ticker.add|ticker.remove|setTimeout|clearTimeout|setInterval|clearInterval|destroy\\(" src
rg -n "localStorage|sessionStorage|firebase|saveScore|leaderboard" src
rg -n "from .*react|from .*pixi|window|document|audio" src/game
```

---

# 4. Blank Screen

## Symptoms

```txt
[ ] Browser trắng.
[ ] Không render app.
[ ] Console có runtime error.
[ ] Vite vẫn chạy nhưng UI không hiện.
```

## Common causes

```txt
[ ] main.tsx import sai App.
[ ] Runtime route không đúng.
[ ] Component crash khi render.
[ ] Missing export/import.
[ ] Asset import fail.
[ ] Pixi app init crash.
[ ] CSS/layout khiến app invisible.
[ ] Environment variable missing.
```

## Debug steps

```bash
cat index.html
cat src/main.tsx
npm run build
npm run typecheck
rg -n "throw new Error|console.error|createRoot|root.render" src
```

Check browser console first.

## Safe fix rules

```txt
[ ] Fix exact crash.
[ ] Do not rewrite App.
[ ] Do not change router unless route is the root cause.
[ ] Do not remove component tree to make screen render.
[ ] Do not delete PixiJS unless render layer is confirmed root cause.
```

## Verification

```txt
[ ] App loads.
[ ] Main route renders.
[ ] Console has no crash.
[ ] Build passes.
```

---

# 5. Vite Dev Server / WebSocket Disconnect

## Symptoms

```txt
[ ] [vite] server connection lost.
[ ] WebSocket connection failed.
[ ] Browser keeps polling for restart.
[ ] Dev server reloads repeatedly.
```

## Common causes

```txt
[ ] Vite server crashed.
[ ] Build/runtime error killed dev process.
[ ] Port conflict.
[ ] File watcher issue.
[ ] Node_modules corrupted.
[ ] Too many file changes.
```

## Debug steps

```bash
npm run dev
npm run build
npm run typecheck
lsof -i :5173
ps aux | rg vite
```

## Safe fix rules

```txt
[ ] Do not delete node_modules first unless install state is clearly broken.
[ ] Do not change Vite config unless config is root cause.
[ ] Fix compile/runtime error first.
[ ] Restart dev server after build/typecheck passes.
```

## Verification

```txt
[ ] npm run dev starts.
[ ] Browser connects.
[ ] Hot reload works.
[ ] No repeated websocket crash.
```

---

# 6. TypeScript / Build Fail

## Symptoms

```txt
[ ] npm run build fails.
[ ] npm run typecheck fails.
[ ] Missing type.
[ ] Wrong prop.
[ ] Import/export mismatch.
```

## Debug steps

```bash
npm run typecheck
npm run build
rg -n "export default|export const|interface|type" src
```

## Common causes

```txt
[ ] Component extracted but props not updated.
[ ] Type moved but imports not updated.
[ ] Test imports old path.
[ ] Vite path alias missing.
[ ] Duplicate type definition.
[ ] File renamed without import update.
```

## Safe fix rules

```txt
[ ] Fix type at source.
[ ] Do not use any to hide architecture problems.
[ ] Do not disable strictness.
[ ] Do not edit tsconfig to bypass errors.
[ ] Do not change tests just to pass unless test is in scope.
```

## Verification

```txt
[ ] typecheck passes.
[ ] build passes.
[ ] no unexpected files changed.
```

---

# 7. Passive Event Listener Warning

## Symptoms

```txt
Unable to preventDefault inside passive event listener invocation.
```

## Common causes

```txt
[ ] touchmove listener is passive by default.
[ ] code calls preventDefault inside passive listener.
[ ] mobile swipe/drag handler incorrectly registered.
```

## Debug steps

```bash
rg -n "preventDefault|touchstart|touchmove|touchend|addEventListener" src
```

## Safe fixes

Option A:

```txt
Register listener with { passive: false } only where preventDefault is necessary.
```

Option B:

```txt
Remove preventDefault if it is not required.
```

Option C:

```txt
Use CSS touch-action for interaction area when appropriate.
```

Example:

```ts
element.addEventListener("touchmove", handleTouchMove, { passive: false });
```

## Do not

```txt
[ ] Do not add preventDefault globally.
[ ] Do not block all page scrolling unless intended.
[ ] Do not break mobile input while fixing warning.
```

## Verification

```txt
[ ] Mobile swipe/drag works.
[ ] Page does not scroll incorrectly during gameplay.
[ ] Warning gone.
[ ] Listeners cleanup correctly.
```

---

# 8. PixiJS Black Screen / Black Texture

## Symptoms

```txt
[ ] Canvas renders black.
[ ] Sprite appears black.
[ ] WebGL texImage2D bad image data.
[ ] Texture appears before asset loaded.
[ ] First render blank, later works sometimes.
```

## Common causes

```txt
[ ] Texture created before image loaded.
[ ] Image src invalid.
[ ] Async texture assignment after unmount.
[ ] Destroyed texture reused.
[ ] Shared texture destroyed by wrong hook.
[ ] Canvas/app initialized before container size exists.
```

## Debug steps

```bash
rg -n "Texture.from|Texture.EMPTY|new Image|onload|BaseTexture|destroy\\(" src/features src/components
```

Check:

```txt
[ ] Is image loaded before Texture.from?
[ ] Is texture owner clear?
[ ] Is component unmounted before async assignment?
[ ] Is destroyed texture reused?
[ ] Is canvas size 0x0?
```

## Safe fix pattern

```txt
Use placeholder texture first.
Assign real texture only after image loads.
Guard against unmount/destroy.
```

Example:

```ts
let disposed = false;

const sprite = new Sprite(Texture.EMPTY);

const img = new Image();
img.onload = () => {
  if (disposed) return;
  sprite.texture = Texture.from(img);
};
img.src = assetUrl;

return () => {
  disposed = true;
  sprite.destroy();
};
```

## Do not

```txt
[ ] Do not destroy shared textures from random component.
[ ] Do not call global Pixi resource cleanup by default.
[ ] Do not access sprite after destroy.
[ ] Do not create Texture.from unloaded image.
```

## Verification

```txt
[ ] Canvas renders.
[ ] Sprite texture visible.
[ ] No WebGL bad image data.
[ ] Replay/remount does not black out.
[ ] No console crash.
```

---

# 9. Duplicate Ticker / Listener / Canvas After Replay

## Symptoms

```txt
[ ] Game speed doubles after replay.
[ ] Effects happen twice.
[ ] Score increments twice.
[ ] SFX plays twice.
[ ] Multiple canvases appear.
[ ] Input fires multiple times.
```

## Common causes

```txt
[ ] ticker.add without ticker.remove.
[ ] addEventListener without removeEventListener.
[ ] useEffect dependencies wrong.
[ ] Pixi app created multiple times.
[ ] replay starts new loop without clearing old loop.
[ ] timers survive after game over/home.
```

## Debug steps

```bash
rg -n "ticker\\.add|ticker\\.remove|addEventListener|removeEventListener|setTimeout|clearTimeout|setInterval|clearInterval|new Application|destroy\\(" src
```

## Safe fix rules

```txt
[ ] One owner creates ticker listener.
[ ] Same owner removes ticker listener.
[ ] One owner creates DOM listener.
[ ] Same owner removes DOM listener.
[ ] Replay resets state but does not duplicate runtime resources.
[ ] Unmount destroys owned resources.
```

## Common fix pattern

```ts
useEffect(() => {
  const tick = () => {
    // update
  };

  app.ticker.add(tick);

  return () => {
    app.ticker.remove(tick);
  };
}, [app]);
```

## Verification

```txt
[ ] Start game.
[ ] Replay 3 times.
[ ] Input fires once.
[ ] Score changes once per action.
[ ] Only one canvas exists.
[ ] No duplicated SFX/effects.
```

---

# 10. Replay Creates Stale State

## Symptoms

```txt
[ ] Old fruits/tiles remain after replay.
[ ] Old particles remain.
[ ] Game over appears immediately.
[ ] Timers continue from previous run.
[ ] Score/lives not reset.
```

## Common causes

```txt
[ ] reset only resets React state, not refs.
[ ] particlesRef/spriteMapRef not cleared.
[ ] timers not cleared.
[ ] game status not reset.
[ ] stale closure in callback.
```

## Debug steps

```bash
rg -n "reset|replay|restart|gameOver|particlesRef|spriteMapRef|timersRef|useRef" src
```

## Safe fix rules

```txt
[ ] Reset state.
[ ] Clear refs.
[ ] Clear timers.
[ ] Clear particles/effects.
[ ] Clear sprites/display objects if owned.
[ ] Do not recreate global app unnecessarily.
```

## Verification

```txt
[ ] Replay from game over.
[ ] Replay mid-game if supported.
[ ] No old objects remain.
[ ] No old timers continue.
[ ] Score/lives/timer reset correctly.
```

---

# 11. Mobile Swipe / Touch / Drag Not Working

## Symptoms

```txt
[ ] Swipe not detected.
[ ] Drag cancels randomly.
[ ] Page scrolls instead of game input.
[ ] Touch works desktop simulator but not phone.
[ ] Pointer coordinates wrong.
```

## Common causes

```txt
[ ] passive listener issue.
[ ] CSS touch-action wrong.
[ ] pointer events blocked by overlay.
[ ] coordinate conversion wrong after resize.
[ ] canvas scaling/DPR not accounted.
[ ] listener attached to wrong element.
```

## Debug steps

```bash
rg -n "pointerdown|pointermove|pointerup|touchstart|touchmove|touchend|touch-action|clientX|clientY|getBoundingClientRect" src
```

Check:

```txt
[ ] Input target is correct.
[ ] Overlay not covering target.
[ ] Coordinates use getBoundingClientRect.
[ ] DPR/render scale considered.
[ ] touch-action set intentionally.
```

## Safe fix rules

```txt
[ ] Input layer normalizes input.
[ ] Core decides gameplay result.
[ ] UI layout does not own input rule.
[ ] Do not add global touch blocking unless necessary.
```

## Verification

```txt
[ ] Mobile swipe works.
[ ] Mobile drag works if applicable.
[ ] Page does not scroll during active gameplay gesture.
[ ] Buttons/modals still clickable.
[ ] Desktop input still works.
```

---

# 12. Coordinate / Hitbox Bug

## Symptoms

```txt
[ ] Click/slice misses visible object.
[ ] Hitbox offset from sprite.
[ ] Works desktop but not mobile.
[ ] Hit detection wrong after resize.
```

## Common causes

```txt
[ ] Screen/world coordinate mismatch.
[ ] DPR scaling mismatch.
[ ] Canvas CSS size differs from internal renderer size.
[ ] Object origin/anchor ignored.
[ ] Mobile scale not accounted.
```

## Debug steps

```bash
rg -n "worldToScreen|screenToWorld|getBoundingClientRect|resolution|devicePixelRatio|anchor|scale|hitbox|collision" src
```

## Safe fix rules

```txt
[ ] Keep coordinate conversion in input/render boundary.
[ ] Keep gameplay rule in core.
[ ] Do not hard-code magic offsets without documenting.
[ ] Add debug overlay only behind debug flag.
```

## Verification

```txt
[ ] Hitbox aligns desktop.
[ ] Hitbox aligns mobile.
[ ] Resize does not offset hitbox.
[ ] Debug flag can be removed/disabled.
```

---

# 13. Overlay / Modal / Panel Blocked By Canvas

## Symptoms

```txt
[ ] Button not clickable.
[ ] Modal appears but clicks hit canvas.
[ ] Game over overlay hidden behind Pixi canvas.
[ ] Dashboard panel below game layer.
```

## Common causes

```txt
[ ] z-index wrong.
[ ] pointer-events wrong.
[ ] canvas positioned above UI.
[ ] overlay not portal/layered correctly.
[ ] parent stacking context issue.
```

## Debug steps

```bash
rg -n "z-index|pointer-events|position: fixed|position: absolute|canvas|overlay|modal|panel" src
```

Check browser devtools:

```txt
[ ] Which element receives click?
[ ] Which stacking context owns overlay?
[ ] Is canvas above panel?
[ ] Does parent have transform/filter/opacity creating stacking context?
```

## Safe fix rules

```txt
[ ] Canvas/game layer below overlay.
[ ] HUD above canvas if needed.
[ ] Game over above game.
[ ] Modal above game over if needed.
[ ] Panels clickable when open.
[ ] Active canvas can receive input only when no modal blocks it.
```

## Verification

```txt
[ ] Start game.
[ ] Open modal/panel.
[ ] Click buttons inside modal/panel.
[ ] Game canvas does not steal clicks.
[ ] Game input resumes after close.
```

---

# 14. Resize / DPR / Canvas Scale Bug

## Symptoms

```txt
[ ] Canvas blurry.
[ ] Canvas too large/small.
[ ] Game objects offset after resize.
[ ] Mobile layout breaks.
[ ] Performance tanks on high-DPR screen.
```

## Common causes

```txt
[ ] Renderer size not synced with CSS size.
[ ] DPR too high.
[ ] ResizeObserver missing cleanup.
[ ] Scale calculated once only.
[ ] Canvas parent size is 0 on init.
```

## Debug steps

```bash
rg -n "ResizeObserver|resize|devicePixelRatio|resolution|renderer.resize|screen.width|screen.height|getBoundingClientRect" src
```

## Safe fix rules

```txt
[ ] Measure container after mount.
[ ] Use ResizeObserver with cleanup.
[ ] Cap DPR if performance needs it.
[ ] Keep world/screen conversion centralized.
[ ] Do not recalc layout in core.
```

## Verification

```txt
[ ] Resize browser.
[ ] Rotate mobile viewport if possible.
[ ] Canvas remains sharp enough.
[ ] Objects align.
[ ] Input coordinates still correct.
[ ] No resize observer leak.
```

---

# 15. Game Loop Performance / React State Per Frame

## Symptoms

```txt
[ ] Game stutters.
[ ] React re-renders every frame.
[ ] CPU high.
[ ] Mobile lag.
[ ] Input feels delayed.
```

## Common causes

```txt
[ ] setState inside ticker every frame.
[ ] React owns per-object animation state.
[ ] Too many DOM nodes for game objects.
[ ] Effects recreate objects every render.
[ ] Unmemoized callbacks recreate listeners.
```

## Debug steps

```bash
rg -n "setState|useState|ticker\\.add|requestAnimationFrame|useEffect" src/features src/components
```

## Safe fix rules

```txt
[ ] High-frequency visuals stay in Pixi/render refs.
[ ] React state updates only for UI-level state.
[ ] Core state updates on gameplay action/tick boundary, not every visual frame unless needed.
[ ] Avoid recreating listeners/ticker callbacks on every render.
```

## Verification

```txt
[ ] Game feels smooth.
[ ] React render count not excessive.
[ ] Mobile playable.
[ ] No duplicate ticker/listeners.
```

---

# 16. Firebase / Save Score Bug

## Symptoms

```txt
[ ] Score not saved.
[ ] Leaderboard not updated.
[ ] Save fires twice.
[ ] Game crashes on save error.
[ ] Login required blocks gameplay.
```

## Common causes

```txt
[ ] Save called from wrong layer.
[ ] Game over effect fires multiple times.
[ ] Missing user guard.
[ ] Firebase config missing.
[ ] localStorage fallback removed.
[ ] playTimeSec hardcoded incorrectly.
```

## Debug steps

```bash
rg -n "saveScore|leaderboard|localStorage|firebase|GameResult|playTimeSec|onGameOver" src
```

## Safe fix rules

```txt
[ ] Game remains playable without login/network.
[ ] Save score is non-blocking.
[ ] Save failure shows UI error, not crash.
[ ] Data layer owns Firebase/API/localStorage.
[ ] Core/render/input do not save score.
[ ] Guard duplicate save.
```

## Verification

```txt
[ ] Game over triggers result once.
[ ] Save score fires once.
[ ] Replay works even if save fails.
[ ] localStorage fallback works if applicable.
[ ] Leaderboard/user stats unchanged.
```

---

# 17. localStorage Bug

## Symptoms

```txt
[ ] Best score resets.
[ ] localStorage parse crash.
[ ] App crashes in SSR-like environment.
[ ] Old schema breaks new code.
```

## Common causes

```txt
[ ] JSON.parse without try/catch.
[ ] window/localStorage used in core.
[ ] schema changed without migration/default.
[ ] storage unavailable.
```

## Debug steps

```bash
rg -n "localStorage|sessionStorage|JSON.parse|JSON.stringify" src
```

## Safe fix rules

```txt
[ ] localStorage belongs in data/storage layer.
[ ] Core does not import localStorage.
[ ] Parse safely.
[ ] Provide default fallback.
[ ] Do not block gameplay if storage fails.
```

## Verification

```txt
[ ] New user default works.
[ ] Existing stored data works.
[ ] Corrupt stored data does not crash app.
[ ] Best score persists.
```

---

# 18. Audio Not Playing

## Symptoms

```txt
[ ] BGM does not start.
[ ] SFX silent.
[ ] Audio works after second click only.
[ ] Browser blocks audio.
[ ] Duplicate SFX after replay.
```

## Common causes

```txt
[ ] AudioContext not unlocked by user gesture.
[ ] Mute state true.
[ ] Audio manager initialized too early.
[ ] Multiple audio managers created.
[ ] Event callback duplicated after replay.
```

## Debug steps

```bash
rg -n "AudioContext|HTMLAudioElement|new Audio|mute|muted|play\\(|pause\\(|useGameSound|audio-manager" src
```

## Safe fix rules

```txt
[ ] Audio layer owns AudioContext/BGM/SFX.
[ ] Core does not import audio.
[ ] User gesture unlock preserved.
[ ] Mute state preserved.
[ ] No duplicate trigger after replay.
```

## Verification

```txt
[ ] First user gesture unlocks audio.
[ ] Mute toggles sound.
[ ] SFX plays once.
[ ] BGM behavior preserved.
[ ] Replay does not duplicate SFX.
```

---

# 19. UI Drift Bug

## Symptoms

```txt
[ ] Game UI becomes landing page.
[ ] Game board is pushed down.
[ ] Dashboard/sidebar dominates.
[ ] New hero/CTA/feature cards appear.
[ ] Mobile shows marketing before game.
```

## Common causes

```txt
[ ] DESIGN.md wording vague.
[ ] Agent interpreted TopNav/Footer/Dashboard as landing page.
[ ] Component extraction changed hierarchy.
[ ] Layout grid made support panels primary.
```

## Debug steps

```bash
rg -n "hero|CTA|features|pricing|testimonials|dashboard|footer|TopNav|GameBoard|GameScreen" src docs
```

## Safe fix rules

```txt
[ ] Use docs/05-DESIGN.md.
[ ] Use docs/06-DESIGN-APPLICATION-GATE.md.
[ ] Game board/canvas remains primary.
[ ] TopNav/Footer/Dashboard are supporting UI.
[ ] Do not touch gameplay/core/render/data.
```

## Verification

```txt
[ ] Desktop game-first.
[ ] Mobile game-first.
[ ] No long landing scroll.
[ ] Game board remains primary.
[ ] Gameplay unchanged.
```

---

# 20. Dependency / Package Bug

## Symptoms

```txt
[ ] Module not found.
[ ] Build fails after dependency cleanup.
[ ] Lockfile changed unexpectedly.
[ ] Package installed but unused.
```

## Common causes

```txt
[ ] Dependency removed while scaffold still imports it.
[ ] Runtime import missed.
[ ] package.json and lockfile out of sync.
[ ] Wrong package version.
```

## Debug steps

```bash
cat package.json
rg -n "<package-name>" src package.json
npm run build
npm run typecheck
```

## Safe fix rules

```txt
[ ] Dependency cleanup must be dedicated patch.
[ ] Prove runtime/scaffold usage before removal.
[ ] Do not change package files during UI/core/render patch.
[ ] Lockfile changes must be intentional.
```

## Verification

```txt
[ ] build passes.
[ ] typecheck passes.
[ ] runtime imports clean.
[ ] lockfile change expected.
```

---

# 21. Scaffold / Generated Code Confusion

## Symptoms

```txt
[ ] Agent edits file that is not runtime.
[ ] Agent deletes file that was actually reachable.
[ ] Dependency usage unclear.
[ ] Duplicate components exist.
```

## Common causes

```txt
[ ] Figma/generated export has scaffold.
[ ] Runtime map not checked.
[ ] Search result mistaken for active route.
[ ] Similar component names.
```

## Debug steps

```bash
cat src/main.tsx
rg -n "import .*<ComponentName>|from .*<file>" src
rg -n "Routes|Route|BrowserRouter|createBrowserRouter" src
```

## Safe fix rules

```txt
[ ] Runtime/reachable proof first.
[ ] Scaffold is report-only unless cleanup task approved.
[ ] Do not delete generated code during debug.
[ ] Do not move scaffold without approval.
```

## Verification

```txt
[ ] Active runtime file identified.
[ ] Edited file is reachable or intentionally targeted.
[ ] Build passes.
```

---

# 22. Emergency Debug Modes

## Mode A — Analysis Only

Use when root cause unclear.

```txt
Allowed:
- read files
- run safe search commands
- run build/typecheck/test if allowed
- produce report

Forbidden:
- edit files
- move files
- delete files
- install packages
- cleanup
```

## Mode B — Small Fix

Use when root cause and files are clear.

```txt
Allowed:
- edit exact allowed files
- fix one root cause
- run verification
- report

Forbidden:
- unrelated cleanup
- next phase
- dependency changes unless scoped
```

## Mode C — Blocked

Use when fix requires unknown/out-of-scope change.

```txt
Action:
- stop
- report blocker
- suggest separate task
```

---

# 23. Debug Patch Report

After any debug patch, output:

```txt
# Debug Patch Report

## Status
PASS / FAIL / BLOCKED

## Bug
- ...

## Root cause
- ...

## Changed files
- ...

## Why each file changed
- ...

## Scope result
- ...

## Behavior preserved
- ...

## Verification commands
- ...

## Results
- ...

## Manual checks
- ...

## git status --short
- ...

## git diff --stat
- ...

## Unexpected changes
- ...

## Follow-up
- ...
```

---

# 24. Common “Do Not Fix Like This”

Avoid these bad fixes:

```txt
[ ] Delete the feature causing error.
[ ] Comment out code until build passes.
[ ] Add any everywhere.
[ ] Disable TypeScript strictness.
[ ] Disable tests.
[ ] Remove mobile input to fix desktop.
[ ] Remove save score to fix game over.
[ ] Replace PixiJS render with placeholder.
[ ] Reset git worktree.
[ ] Remove dependency without proof.
[ ] Move all files into one folder.
```

Safer:

```txt
[ ] Isolate root cause.
[ ] Fix owner layer.
[ ] Keep behavior.
[ ] Verify.
[ ] Report.
```

---

# 25. Final Rule

```txt
A debug fix is only successful if:
- the root cause is known,
- the patch touches only scoped files,
- behavior is preserved,
- verification passes,
- and the report explains what changed.
```

If unsure:

```txt
Mark Unknown.
Do not guess.
Audit more.
```