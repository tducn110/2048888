# BIGUPDATE.md - Game Contract cho React/Vite Web Game có thể dùng PixiJS

> **Ghi chú chỉnh sửa:** Bản này giữ lại toàn bộ ý chính của file gốc, chuẩn hóa tiếng Việt, chỉnh lại phạm vi cho đúng với repo 2048 hiện tại, và tích hợp các nhận xét critical vào đúng vị trí trong contract. Mục tiêu không phải viết lại từ đầu, mà là làm cho file này đủ chặt để dùng với AI, Mimo, Codex hoặc bất kỳ agent refactor nào.

---

## 0. Mục đích

File này là **contract bắt buộc** trước khi cho AI, Mimo, Codex hoặc bất kỳ agent nào refactor game.

Lỗi lặp lại lớn nhất:

> Refactor khi chưa khóa contract, nên mỗi lần sửa là vừa đổi gameplay, vừa đổi UI, vừa đổi architecture, vừa xóa hoặc di chuyển file. Kết quả là không biết bug đến từ đâu.

Từ giờ, mọi task game phải bắt đầu bằng 5 dòng:

```txt
Goal:
Non-goals:
Allowed files:
Forbidden files:
Definition of done:
```

Nếu không viết được 5 dòng này, task đó **chưa sẵn sàng để refactor**.

---

## 0.1. Thứ tự ưu tiên và giới hạn phạm vi

Đây là phần quan trọng nhất để tránh AI sửa lan.

Thứ tự ưu tiên khi có mâu thuẫn:

```txt
1. Contract của task hiện tại là ưu tiên cao nhất.
2. Context riêng của repo hiện tại đứng thứ hai.
3. Product contract đứng thứ ba.
4. Architecture contract đứng thứ tư.
5. Checklist chỉ dùng để kiểm tra, không tự động cho phép sửa thêm file.
```

Quy tắc bắt buộc:

```txt
[ ] Checklist chỉ dùng để rà soát.
[ ] Checklist không mở rộng danh sách Allowed files.
[ ] Nếu phát hiện lỗi nằm ngoài Allowed files, chỉ báo thành follow-up.
[ ] Không tự patch file ngoài phạm vi, dù lỗi đó có vẻ đúng.
[ ] Nếu cần sửa rộng hơn, phải tạo task/contract riêng.
```

Nếu issue nằm ngoài Allowed files, agent phải báo theo format:

```txt
Out-of-scope issue:
- File:
- Vấn đề:
- Rủi ro:
- Vì sao không sửa trong task này:
- Đề xuất task riêng:
```

### Default forbidden files

Trừ khi task hiện tại cho phép rõ ràng, mặc định không được sửa:

```txt
[ ] package.json
[ ] package-lock.json
[ ] pnpm-lock.yaml
[ ] yarn.lock
[ ] vite.config.ts
[ ] tsconfig.json
[ ] eslint/prettier config
[ ] global CSS/theme files
[ ] design.md
[ ] README/docs
[ ] test files
[ ] generated assets
```

Đặc biệt:

```txt
[ ] Không sửa test chỉ để test pass.
[ ] Chỉ cập nhật test khi task cố ý thay đổi expected behavior.
[ ] Không sửa package/config chỉ vì agent muốn "dọn cho sạch".
```

### Không fix bằng cách phá feature

Không được sửa lỗi bằng cách xóa chức năng.

```txt
[ ] Không xóa feature để fix bug, trừ khi task yêu cầu rõ.
[ ] Không comment out code như một cách fix.
[ ] Không disable test/lint/typecheck.
[ ] Không xóa animation/effect/UI state nếu task không yêu cầu.
[ ] Không bỏ localStorage/Firebase/score flow chỉ vì đang lỗi.
[ ] Nếu bắt buộc phải bỏ một phần, phải báo rủi ro trước và tạo task riêng.
```

### Quy tắc dependency

```txt
[ ] Không thêm dependency mới nếu task không cho phép.
[ ] Không xóa dependency nếu không phải task cleanup.
[ ] Không thay lockfile nếu package.json không thay đổi có chủ đích.
[ ] Ưu tiên dùng utility có sẵn trong project trước khi thêm package.
[ ] Không tự thêm các thư viện như zustand, framer-motion, matter-js, lodash, classnames, gsap nếu chưa được phép.
```

### Dirty working tree safety

Khi `git status` đang dirty:

```txt
[ ] Không chạy git reset --hard.
[ ] Không chạy git checkout . nếu không được yêu cầu rõ.
[ ] Không xóa untracked files nếu không được yêu cầu rõ.
[ ] Trước khi sửa file đang dirty, phải đọc diff hiện tại.
[ ] Luôn giữ thay đổi của người dùng, kể cả khi chúng trông không liên quan.
[ ] Không revert thay đổi không phải của mình.
```

---

## 0.2. Risk classification, stop conditions và mental model commit

### High-risk changes

Các thay đổi sau luôn được xem là rủi ro cao:

```txt
[ ] Di chuyển gameplay source of truth.
[ ] Đổi renderer technology, ví dụ React DOM -> PixiJS hoặc ngược lại.
[ ] Đổi input system.
[ ] Đổi global CSS/layout shell.
[ ] Đổi storage/Firebase/score flow.
[ ] Đổi package dependencies.
[ ] Xóa legacy folders hoặc _unused.
[ ] Đổi test expectation.
[ ] Đổi cấu trúc file lớn.
```

Quy tắc:

```txt
[ ] High-risk changes phải được audit trước.
[ ] High-risk changes phải có task contract riêng.
[ ] Không gộp high-risk changes vào refactor nhỏ.
```

### Stop conditions

Agent phải dừng và báo lại nếu gặp một trong các trường hợp sau:

```txt
[ ] File cần sửa nằm ngoài Allowed files.
[ ] Fix yêu cầu đổi gameplay nhưng task là UI-only.
[ ] Fix yêu cầu đổi UI nhưng task là core-only.
[ ] Build fail do lỗi có sẵn không liên quan.
[ ] Test fail vì expected behavior cần đổi.
[ ] Cần thêm/xóa dependency.
[ ] Một refactor nhỏ cần sửa hơn 5 file.
[ ] Không xác định được source of truth.
[ ] Không xác định được script verify.
```

Format báo dừng:

```txt
Stop reason:
Scope conflict:
Files affected:
Recommended next task:
```

### One task = one commit

```txt
[ ] Một task nên tương đương một commit rõ nghĩa.
[ ] Nếu diff trộn nhiều concern khác nhau, phải tách task.
[ ] Không gộp UI + gameplay + backend + dependency cleanup trong một lần.
```

---

## 1. Context riêng cho repo 2048 hiện tại

Repo hiện tại là **React + Vite + TypeScript mini-game**.

> **Lưu ý:** Đây là snapshot context của repo hiện tại. Trước mỗi refactor lớn, phải kiểm tra lại `package.json` và cây thư mục `src`. Không được giả định các path này luôn đúng khi copy file này sang project khác.

Runtime path:

```txt
index.html
-> src/main.tsx
-> src/app/App.tsx
```

Runtime game chính:

```txt
src/app/App.tsx
src/components/game/Game2048.tsx
src/components/game/GameBoard.tsx
src/components/game/GameHUD.tsx
src/components/game/Tile.tsx
src/hooks/use2048Game.ts
src/hooks/useLocalStats.ts
src/utils/gameLogic.ts
src/types/index.ts
```

Pure 2048 gameplay logic hiện tại nằm ở:

```txt
src/utils/gameLogic.ts
```

React game state hiện tại nằm ở:

```txt
src/hooks/use2048Game.ts
```

PixiJS hiện tại **không phải gameplay core của 2048**. PixiJS đang là render/background/support layer, ví dụ:

```txt
src/components/background/PixiBackground.tsx
```

Quy tắc cứng cho repo 2048 hiện tại:

```txt
[ ] PixiJS không phải renderer chính của gameplay 2048, trừ khi task nói rõ.
[ ] Không migrate GameBoard/Game2048/Tile sang PixiJS nếu chưa có contract riêng.
[ ] Không biến 2048 thành landing page.
[ ] Game board phải là trung tâm màn hình.
[ ] Không sửa gameplay logic khi chỉ sửa UI.
[ ] Không sửa UI khi chỉ sửa game logic.
[ ] Không đưa PixiJS vào core 2048 nếu không có lý do rõ.
[ ] Không import Firebase/backend/storage vào game core.
[ ] Không xóa/move file legacy nếu chưa grep import và build/test.
```

Verification scripts phải được đọc từ `package.json` trước khi chạy.

```txt
[ ] Chỉ chạy script thật sự tồn tại.
[ ] Nếu script không tồn tại, báo "script not available".
[ ] Không tự tạo script mới nếu task không yêu cầu.
```

Ví dụ scripts có thể có:

```bash
npm run build
npm test
npm run typecheck # chỉ chạy nếu script tồn tại
npm run lint      # chỉ chạy nếu script tồn tại
```

Baseline trước khi patch:

```txt
Baseline:
- build: pass/fail/not available
- test: pass/fail/not available
- typecheck: pass/fail/not available
- lint: pass/fail/not available
```

Nếu baseline fail trước khi sửa:

```txt
[ ] Ghi lại lỗi baseline.
[ ] Không tự sửa lỗi ngoài phạm vi.
[ ] Sau patch, phân biệt lỗi cũ và lỗi mới.
```

---

## 2. Product contract: game-first, không phải landing page

Đây là web game, không phải marketing site.

Bắt buộc ghi trong mọi prompt UI:

```txt
This is a game-first web app, not a landing page.
The game board/canvas must remain the visual center.
Preserve the existing game-first layout and do not reinterpret the app as a marketing landing page.
```

Cấm agent tự ý biến game thành:

```txt
[ ] Hero section.
[ ] Marketing CTA.
[ ] Feature cards.
[ ] Long landing-page scroll.
[ ] Dashboard chiếm spotlight.
[ ] Footer lớn như website thường.
[ ] Product shell làm game nhỏ lại.
```

UI hỗ trợ được phép có, nhưng phải nhỏ gọn:

```txt
[ ] TopNav là support UI.
[ ] Footer là support UI.
[ ] Dashboard/stats là panel phụ.
[ ] Login modal là overlay phụ.
[ ] Sidebar/guide không được cạnh tranh với board.
[ ] Mobile ưu tiên màn chơi trước.
```

Primary screen:

```txt
[ ] Game board/canvas centered and dominant.
[ ] Người chơi phải thấy ngay chỗ để chơi.
[ ] Layout không đẩy người chơi xuống dưới như landing page.
[ ] Thông tin phụ nên collapsible hoặc nằm dưới/sau game.
```

Desktop:

```txt
[ ] Game ở trung tâm.
[ ] Optional side stats/dashboard chỉ được dùng nếu không làm nhỏ game.
[ ] TopNav compact.
[ ] Không dùng 3-column nếu làm board mất tập trung.
```

Mobile:

```txt
[ ] Game first.
[ ] Stats nằm dưới hoặc collapsible.
[ ] No large landing scroll.
[ ] Button đủ lớn để chạm.
[ ] HUD không che vùng thao tác.
```

---

## 3. Architecture contract

Mục tiêu là mỗi lớp có một trách nhiệm rõ ràng.

Structure chuẩn cho web game có PixiJS:

```txt
src/game/core.ts        = gameplay pure logic
src/game/config.ts      = balance/config
src/game/types.ts       = shared game types
src/features/render/*   = PixiJS rendering hooks/components
src/components/game/*   = React overlay/game UI
src/lib/*               = Firebase/localStorage/API
src/content/*           = static copy/content
```

Trong repo 2048 hiện tại, mapping tạm thời:

```txt
src/utils/gameLogic.ts    = gameplay pure logic
src/hooks/use2048Game.ts  = React reducer/game state wrapper
src/types/index.ts        = shared types
src/components/game/*     = React game UI
src/hooks/useLocalStats.ts = local stats/storage
```

Pure game core không được import:

```txt
React
PixiJS
window
document
Firebase
localStorage
CSS
```

Nếu cần Firebase/localStorage:

```txt
[ ] Để trong src/lib hoặc hook data.
[ ] Game core chỉ trả về result/data.
[ ] UI/hook quyết định save hay không save.
[ ] Game vẫn chơi được khi network lỗi.
```

Layer separation:

```txt
Gameplay change -> core/config/test only
Render change   -> Pixi hooks/sprites/textures only
UI change       -> React components/CSS only
Backend change  -> src/lib/data hooks only
Docs change     -> markdown only
```

Không trộn nhiều layer trong cùng một pass.

---

## 3.1. Component ownership

Để tránh agent nhét nhầm logic vào component sai chỗ, mỗi component phải có owner rõ.

Với repo 2048 hiện tại:

```txt
src/app/App.tsx
= app shell, layout tổng, route/modal cấp app nếu có.

src/components/game/Game2048.tsx
= composition của màn game 2048.

src/components/game/GameBoard.tsx
= render board, nhận state/action từ hook, không tự tính gameplay rule.

src/components/game/Tile.tsx
= visual tile only, không chứa logic merge/move.

src/components/game/GameHUD.tsx
= hiển thị score/status/action, không tính lại gameplay.

src/hooks/use2048Game.ts
= React state wrapper/reducer, gọi pure logic.

src/utils/gameLogic.ts
= source of truth cho merge/move/spawn/canMove/game-over.
```

Quy tắc:

```txt
[ ] Board không tự tính rule 2048.
[ ] Tile không tự tính score/merge.
[ ] HUD không tự tính game-over.
[ ] Hook không chứa logic render PixiJS.
[ ] Core không biết React/PixiJS/UI.
```

---

## 4. Những lỗi tư duy refactor cần tránh

### 4.1. Refactor quá rộng trong một lần

Sai:

```txt
Refactor lại sạch hơn, tối ưu hơn, UI đẹp hơn, chia component ra.
```

Đúng:

```txt
Goal:
Refactor PixiJS lifecycle into usePixiApp.

Non-goals:
Do not change gameplay, UI layout, Firebase, scoring, CSS theme.
```

Mỗi pass chỉ được có một mục tiêu chính.

### 4.2. Không định nghĩa UI cũ phải giữ lại

Nếu design doc có các từ:

```txt
top nav
dashboard
login modal
footer
section
responsive layout
```

AI dễ hiểu thành landing/dashboard app.

Phải khóa lại:

```txt
This is a game-first screen, not a landing page.
The game board/canvas must remain the visual center.
TopNav/Footer are support UI only, not marketing sections.
Do not create hero section, CTA blocks, feature cards, or landing-page layout.
```

### 4.3. Không có source of truth

Tránh tình trạng:

```txt
[ ] core.ts có logic game.
[ ] component cũng có logic game.
[ ] localStorage nằm lẫn trong UI.
[ ] Firebase dính vào flow game.
[ ] mock leaderboard còn sót.
[ ] legacy hook còn tồn tại làm AI hiểu nhầm.
```

Bắt buộc có owner:

```txt
[ ] Gameplay pure logic có một source of truth.
[ ] UI chỉ hiển thị và gửi action.
[ ] Storage/backend nằm ngoài core.
[ ] Mock/legacy phải nằm trong _unused hoặc được ghi rõ.
```

### 4.4. Vừa sửa gameplay vừa sửa render

Khi bug xảy ra sẽ không biết đến từ:

```txt
logic game
render loop
asset texture
React state
CSS overlay
input event
```

Quy tắc:

```txt
[ ] Gameplay pass không sửa Pixi lifecycle.
[ ] Pixi lifecycle pass không sửa scoring/balance.
[ ] UI pass không sửa reducer/core.
[ ] Backend pass không sửa game loop.
```

---

## 5. Phase workflow trước khi refactor

### Phase 0 - Snapshot

Trước khi sửa:

```txt
[ ] git status sạch hoặc biết rõ file nào đang thay đổi.
[ ] Tạo branch mới nếu task lớn.
[ ] Ghi current behavior ngắn gọn.
[ ] Đọc package.json để biết scripts thật sự tồn tại.
[ ] Chạy baseline verification nếu có thể.
```

Command:

```bash
git status
npm run build
npm test
git checkout -b refactor/<ten-muc-tieu>
```

Nếu working tree đang dirty:

```txt
[ ] Không revert thay đổi không phải của mình.
[ ] Chỉ sửa file nằm trong Allowed files.
[ ] Nếu file cần sửa đang có thay đổi lạ, đọc kỹ trước khi patch.
[ ] Không chạy git reset --hard.
[ ] Không xóa untracked files.
```

Baseline report:

```txt
Baseline:
- build:
- test:
- typecheck:
- lint:
- known existing errors:
```

### Phase 1 - Khóa phạm vi

Bắt buộc viết:

```txt
Goal:
Non-goals:
Allowed files:
Forbidden files:
Definition of done:
```

Ví dụ:

```txt
Goal:
Refactor PixiJS app lifecycle into usePixiApp.

Non-goals:
Do not change gameplay, UI layout, Firebase, scoring, CSS theme.

Allowed files:
src/features/game/render/usePixiApp.ts
src/components/game/FruitGame.tsx

Forbidden files:
src/game/core.ts
src/lib/firebase.ts
src/styles/theme.css
package.json
package-lock.json
tests

Definition of done:
Build passes, tests pass, game still starts, canvas resizes, no duplicate ticker/listeners.
```

### Phase 2 - Architecture boundary check

Trước khi sửa:

```txt
[ ] core pure chưa?
[ ] PixiJS chỉ nằm trong render layer chưa?
[ ] React UI có tách khỏi canvas chưa?
[ ] Firebase/localStorage có nằm ngoài game core chưa?
[ ] Types dùng chung có ở game/types.ts hoặc types/index.ts chưa?
[ ] Có file legacy/mock gây nhầm không?
```

Grep hữu ích:

```bash
grep -R "MOCK_LEADERBOARD" src
grep -R "verifyingScore" src
grep -R "useGameStorage" src
grep -R "firebase" src/game src/features/game
grep -R "window\|document\|localStorage" src/game
```

Với repo 2048 hiện tại:

```bash
grep -R "pixi.js" src
grep -R "localStorage" src
grep -R "use2048Game" src
grep -R "moveBoard\|addRandomTile\|canMove" src
```

### Phase 3 - Refactor nhỏ

Quy tắc:

```txt
[ ] Một lần chỉ extract 1 hook/component.
[ ] Không đổi behavior.
[ ] Không đổi CSS nếu không liên quan.
[ ] Không đổi public API nếu không cần.
[ ] Không sửa test để che lỗi.
[ ] Sau mỗi bước build/test.
```

Sai:

```txt
Refactor toàn bộ FruitGame.tsx cho sạch.
```

Đúng:

```txt
Extract only timer cleanup logic into useGameFeedback.
Keep public behavior identical.
```

### Phase 4 - Test sau mỗi bước

Ít nhất:

```bash
npm run build
npm test
```

Nếu có script:

```bash
npm run typecheck
npm run lint
```

Manual check không thay thế automated verification.

```txt
[ ] Nếu không chạy được build/test/typecheck/lint, phải báo lý do.
[ ] Không được nói "manual likely works" nếu chưa verify.
```

Manual check:

```txt
[ ] Game start được.
[ ] Replay được.
[ ] Score tăng đúng.
[ ] Game over đúng.
[ ] Mobile input được.
[ ] Desktop input được.
[ ] Resize không vỡ.
[ ] Modal/dashboard click được.
[ ] Console không spam error.
```

---

## 6. PixiJS lifecycle contract

Dùng cho bất kỳ file nào tạo `Application`.

Checklist bắt buộc:

```txt
[ ] Application chỉ tạo 1 lần cho mỗi mount.
[ ] app.init() đã await trước khi dùng app.canvas/app.stage/app.renderer.
[ ] Canvas append đúng container.
[ ] Có appRef.
[ ] Có destroyedRef hoặc isDestroyed guard.
[ ] Cleanup ticker.
[ ] Cleanup pointer/touch listeners.
[ ] Cleanup ResizeObserver.
[ ] Cleanup timers/requestAnimationFrame.
[ ] Cleanup sprites/containers.
[ ] Không setState sau unmount.
[ ] Không gọi app.stage/app.renderer/app.canvas sau destroy.
[ ] app.destroy() chỉ gọi trong cleanup.
[ ] Không tạo nhiều ticker song song.
```

Mẫu lifecycle intent:

```txt
Create:
- new Application()
- await app.init(options)
- guard destroyed
- append canvas
- create stage/containers/assets

Run:
- ticker owns per-frame render sync
- React state only receives coarse game state

Cleanup:
- set destroyed guard
- remove ticker callbacks
- remove event listeners
- disconnect observers
- destroy stage children
- destroy app and remove canvas
```

PixiJS v8 note:

```txt
[ ] Constructor không nhận options.
[ ] Options đi vào async app.init().
[ ] Dùng app.canvas sau khi init xong.
[ ] Dùng ticker.deltaMS hoặc deltaTime nhất quán.
[ ] Không gọi global Pixi resource cleanup mặc định.
[ ] Chỉ cân nhắc global resource cleanup khi đã xác nhận có GPU/resource leak và đã kiểm tra shared textures/assets.
```

---

## 7. Texture/assets contract

Lỗi hay gặp:

```txt
WebGL: texImage2D: bad image data
black texture
```

Nguyên nhân thường là dùng image/texture khi ảnh chưa load xong.

Checklist:

```txt
[ ] Asset preload trước gameplay start nếu cần.
[ ] Không Texture.from(image) khi image chưa onload.
[ ] Dùng Texture.EMPTY làm placeholder nếu asset async.
[ ] Khi ảnh load xong mới assign texture.
[ ] Có fallback nếu asset fail.
[ ] Không destroy texture đang được sprite dùng.
[ ] Không destroy shared/base texture nếu sprite khác còn dùng.
[ ] Sprite reuse thay vì tạo/xóa liên tục nếu object nhiều.
```

Asset pipeline trước khi code:

```txt
[ ] Asset dùng PNG/WebP/SVG?
[ ] Có transparent background không?
[ ] Kích thước chuẩn?
[ ] Có sprite states không?
[ ] Có animation frame hay skeletal/lottie?
[ ] PixiJS render trực tiếp hay convert sang spritesheet?
[ ] Tên file ổn định?
[ ] Đường dẫn asset ổn định?
```

Ưu tiên cho PixiJS game đơn giản:

```txt
PNG/WebP spritesheet > nhiều file lẻ > SVG động phức tạp
```

SVG vẫn dùng được, nhưng nếu animate nhiều trong Pixi thì nên convert sang texture/spritesheet.

---

## 8. Coordinate, resize và input contract

Tránh nhầm:

```txt
game world
screen pixel
render scale
resize mobile/desktop
hitbox
physics position
```

Nếu không tách rõ sẽ gặp:

```txt
fruit bay lệch
click không trúng
hitbox sai
mobile khác desktop
resize xong sprite lệch
```

Checklist:

```txt
[ ] Có worldToScreen().
[ ] Có screenToWorld() nếu cần input.
[ ] renderScale tính tập trung một chỗ.
[ ] Không tự nhân scale rải rác nhiều file.
[ ] Hitbox dùng cùng coordinate system với input.
[ ] Mobile/desktop config tách riêng.
```

Mobile input:

```txt
[ ] Pointer/mouse/touch normalize về một format.
[ ] Touch listener cần preventDefault thì phải { passive: false }.
[ ] Không preventDefault bừa trên toàn page.
[ ] Canvas có touch-action: none nếu cần swipe.
[ ] Swipe threshold rõ ràng.
[ ] Không bị double input do mouse + touch cùng bắn.
[ ] Listener remove đầy đủ.
```

PixiJS event rule:

```txt
[ ] Dùng pointer events nếu cần cross-device.
[ ] eventMode = "static" cho object interactive.
[ ] Dùng hitArea rõ nếu bounds phức tạp.
[ ] Dùng globalpointermove cho drag nếu pointer có thể rời target.
[ ] Cleanup .off() đúng handler reference.
```

---

## 9. Game loop vs React state contract

React state phù hợp cho:

```txt
[ ] score
[ ] lives
[ ] game status
[ ] modal open/close
[ ] final result
[ ] leaderboard loading/error
```

Pixi/ref/game loop phù hợp cho:

```txt
[ ] sprite position
[ ] velocity
[ ] particles
[ ] trail
[ ] screen shake
[ ] collision frame-by-frame
[ ] per-frame animation state
```

Game loop checklist:

```txt
[ ] delta time dùng nhất quán.
[ ] Không setState liên tục mỗi frame.
[ ] Object pool nếu nhiều particles/sprites.
[ ] Collision chạy trên data/game objects, không phụ thuộc sprite.
[ ] Sprite chỉ sync từ game state/render state.
[ ] Pause/resume rõ ràng.
[ ] Cleanup khi game over/replay.
```

Performance budget:

```txt
[ ] Không React setState mỗi frame.
[ ] Không tạo Sprite/Graphics mới mỗi frame nếu không có lý do rõ.
[ ] Không generate texture mỗi frame.
[ ] Không đo layout DOM đắt đỏ mỗi frame.
[ ] Không để arrays particles/trails tăng vô hạn.
[ ] Có cap cho particles/effects.
[ ] Reuse object khi có thể.
```

---

## 10. UI layering contract

Mẫu layer chuẩn:

```txt
.game-root
  .game-canvas-layer        z-index: 0
  .game-hud-layer           z-index: 20
  .game-over-layer          z-index: 50
  .game-panel-layer         z-index: 80
  .modal-layer              z-index: 100
```

Checklist:

```txt
[ ] Canvas layer z-index thấp nhất.
[ ] Game HUD above canvas.
[ ] Game over overlay above HUD.
[ ] Modal/dashboard/settings above game over.
[ ] pointer-events kiểm tra từng layer.
[ ] Không để canvas ăn click của modal.
[ ] Overlay nào block game input phải nói rõ.
[ ] Overlay nào không block input phải pointer-events đúng.
```

Overlay cần định nghĩa:

```txt
[ ] HUD
[ ] Pause/settings
[ ] Login modal
[ ] Game over
[ ] Leaderboard/dashboard
[ ] Loading/countdown
```

Mỗi overlay phải biết:

```txt
[ ] z-index
[ ] pointer-events
[ ] open/close state ở đâu
[ ] có block game input không
[ ] mobile layout ra sao
```

---

## 11. Responsive game-screen contract

Game web khác landing page.

Checklist:

```txt
[ ] Dùng 100dvh thay vì 100vh nếu mobile.
[ ] Có safe area cho notch/mobile.
[ ] Canvas/board resize theo container.
[ ] Board không bị footer/topnav bóp.
[ ] Không scroll ngoài ý muốn trong màn chơi.
[ ] Button đủ lớn cho mobile.
[ ] HUD không che vùng thao tác.
[ ] Text không overflow button/card.
```

Game-first layout:

```txt
[ ] Màn chơi là trung tâm.
[ ] Không hero section.
[ ] Không marketing section.
[ ] Không dashboard chiếm màn chơi.
[ ] TopNav/Footer nhỏ gọn.
[ ] Mobile ưu tiên chơi trước, thông tin phụ sau.
```

---

## 12. Gameplay/balance contract

Mỗi game nên có config tập trung:

```txt
src/game/config.ts
```

Ví dụ:

```ts
export const GAME_CONFIG = {
  desktop: {
    gravity: 2200,
    spawnIntervalMs: 700,
    hitboxScale: 1.3,
  },
  mobile: {
    gravity: 2000,
    spawnIntervalMs: 850,
    hitboxScale: 1.45,
  },
};
```

Checklist:

```txt
[ ] Desktop config riêng.
[ ] Mobile config riêng.
[ ] Gravity/speed/spawn không hard-code trong component.
[ ] Hitbox scale có config.
[ ] Debug mode bằng query param, ví dụ ?fruitDebug=1.
[ ] Có test cho pure gameplay logic.
[ ] Không balance bằng cách sửa random nhiều file.
```

Với 2048:

```txt
[ ] Merge rule nằm trong pure logic.
[ ] Random tile spawn test được hoặc mock được nếu cần deterministic tests.
[ ] Undo/status/move count nằm trong hook/reducer.
[ ] UI không tự tính lại gameplay rule.
```

2048 core test contract:

```txt
[ ] move left merges once only.
[ ] 2 + 2 + 2 + 2 -> 4 + 4, không phải 8.
[ ] Score increment bằng tổng giá trị tile được merge.
[ ] Không spawn tile mới nếu board không đổi.
[ ] Game over chỉ xảy ra khi không còn move hợp lệ.
[ ] Win state xảy ra khi có tile 2048.
[ ] Random spawn injectable hoặc mockable.
[ ] Score được tính ở core/hook, UI chỉ hiển thị.
```

---

## 13. Firebase/localStorage/score contract

Dùng cho game có backend hoặc leaderboard.

Flow chuẩn:

```txt
Game ends
-> produce GameResult
-> update local state/localStorage
-> if user logged in: try save score
-> if fail: show non-blocking saveError
```

Checklist:

```txt
[ ] User chưa login vẫn chơi được.
[ ] Game vẫn chơi được khi Firebase lỗi.
[ ] Score save lỗi thì show message, không crash.
[ ] localStorage fallback có sẵn.
[ ] Firebase nằm ở src/lib hoặc hook data, không nằm trong core.
[ ] Không import Firebase vào Pixi component trực tiếp nếu tránh được.
[ ] Game loop không đợi network.
[ ] Không overengineer anti-cheat ở v1.
```

Đặt tên state rõ:

```txt
savingScore
saveError
scoreSubmitted
leaderboardLoading
```

Tránh tên gây hiểu nhầm:

```txt
verifyingScore
antiCheatPending
scoreVerification
```

Nếu đã bỏ anti-cheat mà còn tên cũ, AI sau này sẽ tưởng system đó còn tồn tại.

---

## 14. Dependency, legacy và mock cleanup contract

Không để file cũ/mock/unused làm AI hiểu nhầm.

Rủi ro:

```txt
mock leaderboard
legacy storage hook
unused Figma UI
dependency không dùng
component cũ nằm trong src
```

Cleanup checklist:

```txt
[ ] File cũ đưa vào src/_unused hoặc xóa nếu chắc chắn.
[ ] Có README warning trong _unused.
[ ] Không để mock data cùng tên với production data.
[ ] grep import trước khi xóa.
[ ] npm run build.
[ ] npm test.
[ ] Không để dependency không dùng kéo context rối.
```

Lệnh hữu ích:

```bash
grep -R "MOCK_LEADERBOARD" src
grep -R "verifyingScore" src
grep -R "useGameStorage" src
grep -R "firebase" src/game src/features/game
grep -R "window\|document\|localStorage" src/game
```

Với repo này, nếu thấy `src/_unused` bị xóa/deleted trong git status:

```txt
[ ] Không tự restore hoặc delete tiếp nếu không được yêu cầu.
[ ] Xác nhận nó có phải cleanup đang làm do người dùng tạo không.
[ ] Không import lại file trong _unused vào runtime.
```

---

## 15. design.md contract để AI không hiểu sai

Design doc nên chia 2 phần: visual style và layout contract.

### Visual style

Ví dụ:

```txt
Theme:
Vietnamese countryside, nostalgic, rice paper, hand-drawn, warm, playful.

Colors:
--rice-paper
--paper-warm
--bamboo
--peanut
```

### Layout contract bắt buộc

```txt
This is a game-first product, not a landing page.

Primary screen:
- Game board/canvas must be centered and dominant.
- Navigation, dashboard, footer are supporting UI only.
- Do not create hero sections, marketing sections, feature cards, or CTA landing layout.
- The player should immediately understand where to play.

Desktop:
- Game center.
- Optional side stats/dashboard.
- TopNav compact.

Mobile:
- Game first.
- Stats below or collapsible.
- No large landing scroll.
```

Câu bắt buộc trong mọi prompt UI:

```txt
Preserve the existing game-first layout and do not reinterpret the app as a marketing landing page.
```

Design token rule:

```txt
[ ] Không hard-code màu ngẫu nhiên nếu project đã có theme tokens.
[ ] Không đưa visual style khác vào nếu chưa cập nhật design.md.
[ ] Giữ aesthetic Vietnamese countryside / rice paper / hand-drawn nếu đây là theme chính.
[ ] UI mới phải dùng lại spacing, border, shadow, radius, font tokens hiện có nếu có.
```

---

## 16. Setup/handoff khi nhảy qua project mới

Mỗi lần chuyển sang project game mới, làm theo thứ tự:

```txt
1. Đọc package.json.
2. Xác định runtime path từ index/main/app.
3. Xác định gameplay core nằm ở đâu.
4. Xác định render layer nằm ở đâu.
5. Xác định UI overlay nằm ở đâu.
6. Xác định storage/backend nằm ở đâu.
7. Xác định scripts build/test/typecheck/lint.
8. Grep PixiJS imports.
9. Grep localStorage/Firebase imports.
10. Tìm file mock/legacy/_unused/imports.
11. Ghi project context trước khi sửa.
12. Viết Goal/Non-goals/Allowed/Forbidden/Done.
```

Template context:

```txt
Project:
Runtime path:
Game type:
Gameplay source of truth:
Render source of truth:
UI overlay owner:
Storage/backend owner:
Build command:
Test command:
Typecheck command:
Lint command:
Known dirty files:
Known legacy/mock files:
```

Không được bắt đầu patch nếu chưa biết:

```txt
[ ] App entrypoint.
[ ] File gameplay chính.
[ ] File UI chính.
[ ] File render/Pixi chính.
[ ] Cách verify.
```

Không được giả định path từ project cũ luôn đúng ở project mới.

---

## 17. Definition of Done chuẩn

Mỗi task game chỉ gọi là xong khi đạt:

```txt
[ ] Build pass.
[ ] Test pass.
[ ] Typecheck pass nếu có.
[ ] Lint pass nếu có.
[ ] Game playable.
[ ] Start/replay/game over OK.
[ ] Desktop input OK.
[ ] Mobile input OK.
[ ] Resize OK.
[ ] No console crash.
[ ] No duplicate ticker/listener.
[ ] No PixiJS access after destroy.
[ ] No UI layer bị che.
[ ] No core import React/Pixi/Firebase/window/document/localStorage/CSS.
[ ] No legacy/mock confusing files.
[ ] Docs/checklist cập nhật nếu architecture đổi.
```

Manual replay/leak check:

```txt
[ ] Replay game 3 lần liên tiếp.
[ ] Resize browser trong khi game đang chạy.
[ ] Mở/đóng modal/dashboard/settings.
[ ] Kiểm tra console sau mỗi thao tác.
[ ] Mobile touch không làm page scroll lỗi.
```

Manual checks không thay thế automated verification.

```txt
[ ] Nếu build/test không chạy được, phải nói rõ lý do.
[ ] Không kết luận task pass chỉ dựa vào cảm giác.
```

---

## 18. Prompt chuẩn để refactor một mục tiêu

Copy template này và thay phần `<...>`.

```txt
You are working on a React + Vite + PixiJS v8 web game.

IMPORTANT PRODUCT CONTEXT:
This is a game-first web app, not a landing page.
The game board/canvas must remain the visual center.
Do not create hero sections, marketing sections, feature cards, or CTA landing-page layouts.
TopNav, dashboard, login modal, and footer are supporting UI only.

TASK GOAL:
<describe exactly one refactor goal>

NON-GOALS:
- Do not change gameplay behavior.
- Do not redesign the UI.
- Do not change Firebase/backend logic.
- Do not change scoring rules.
- Do not remove existing features.
- Do not modify unrelated files.

ARCHITECTURE RULES:
- src/game/core.ts must stay pure, or use the current project equivalent.
- core gameplay must not import React, PixiJS, Firebase, window, document, localStorage, or CSS.
- PixiJS lifecycle/rendering belongs in render hooks/components.
- React owns UI overlays, routing, auth, dashboard, and modals.
- Firebase/localStorage logic belongs in src/lib or data hooks, not game core.
- Keep canvas rendering and React overlay layers separated.

SCOPE RULES:
- Checklist items are for inspection only.
- Checklist items do not expand the allowed file list.
- If an issue is outside Allowed files, report it as follow-up instead of editing it.

FILES ALLOWED:
<list files>

FILES FORBIDDEN:
<list files>

BEFORE EDITING:
1. Summarize current relevant architecture.
2. List exact files to change.
3. Explain why each file is within scope.
4. Record baseline verification if possible.
5. Then patch only those files.

CHECKLIST BEFORE EDITING:
- Identify current behavior.
- Identify imports and dependencies.
- Check whether legacy/mock files are still referenced.
- Make the smallest safe change.

CHECKLIST AFTER EDITING:
- npm run build must pass if available.
- npm test must pass if available.
- npm run typecheck must pass if available.
- npm run lint must pass if available.
- No TypeScript errors.
- No new circular imports.
- No duplicate ticker/listeners/timers.
- No PixiJS access after destroy.
- No UI layer regression.

OUTPUT REQUIRED:
1. Summary of changed files.
2. Exact reason each file was changed.
3. What behavior was intentionally preserved.
4. Risks or follow-up checks.
5. Commands run and results.
```

---

## 19. Prompt chuẩn để audit trước khi sửa

Dùng khi chưa chắc code đang loạn chỗ nào.

```txt
Audit this React + Vite + PixiJS web game codebase.

Do not modify files yet.

Find issues in these areas:
1. Architecture boundaries
2. PixiJS lifecycle cleanup
3. Texture/asset loading
4. Game loop and React state separation
5. Input handling for desktop/mobile
6. UI overlay z-index and pointer-events
7. Firebase/localStorage score flow
8. Legacy/mock/unused files
9. Mobile responsive layout
10. Test/build risk
11. Dependency/config risk
12. Dirty working tree risk

For every issue, provide:
- File path
- Exact problematic code or pattern
- Why it is risky
- Safe fix plan
- Whether it is high/medium/low priority
- Whether it is inside or outside the current scope

Important:
This is a game-first app, not a landing page.
Do not recommend redesigning the app as a landing page.
Do not recommend large rewrites unless absolutely necessary.
Do not patch anything during audit.
```

---

## 20. Prompt chuẩn để revert UI về game-first layout

Dùng khi AI/Mimo làm lệch UI thành landing page/dashboard.

```txt
Revert the UI direction back to the previous game-first layout.

Current problem:
The app has been interpreted too much like a landing page/dashboard website.
We need the UI to prioritize the game screen.

Requirements:
- Keep the game board/canvas as the main visual center.
- Remove or reduce landing-page-like sections.
- TopNav should be compact.
- Footer should not dominate the layout.
- Dashboard/stats should be secondary panels.
- Mobile should show the game first.
- Preserve existing gameplay and PixiJS logic.
- Do not touch game core unless required by layout integration.
- Do not change scoring, Firebase, or localStorage.
- Do not change theme tokens unless explicitly requested.
- Do not convert gameplay renderer to PixiJS unless explicitly requested.

After changes:
- Explain which files caused the landing-page interpretation.
- Explain which design.md lines or prompt wording may have led to it.
- Provide a safer future prompt to avoid this mistake.
- Run build/tests if scripts exist.
```

---

## 21. Prompt chuẩn cho docs/checklist nhỏ đặt đầu project

Nếu cần tạo `docs/game-refactor-checklist.md`, dùng nội dung này:

```txt
# Game Refactor Checklist

## Product Rule
- This is a game-first app, not a landing page.
- Game board/canvas must remain the visual center.

## Scope Rule
- Current task contract wins.
- Checklist does not expand Allowed files.
- Out-of-scope issues must be reported as follow-up.

## Architecture Rule
- core.ts is pure gameplay logic.
- core.ts must not import React, PixiJS, Firebase, window, document, localStorage, or CSS.
- PixiJS owns canvas rendering.
- React owns UI overlays.
- Firebase/localStorage stay outside game core.

## Before Refactor
- Define goal.
- Define non-goals.
- Define allowed files.
- Define forbidden files.
- Read package.json.
- Run available build/test scripts first.

## During Refactor
- One goal per pass.
- Do not change gameplay and UI together.
- Do not mix backend with game loop.
- Keep behavior identical unless explicitly requested.
- Do not remove features to fix bugs.
- Do not add dependencies unless explicitly allowed.

## PixiJS Safety
- Cleanup ticker.
- Cleanup listeners.
- Cleanup ResizeObserver.
- Cleanup timers.
- Guard against destroyed app.
- Do not use textures before loaded.
- Do not set React state every frame.

## UI Safety
- Canvas layer below.
- HUD above canvas.
- Game over above HUD.
- Panels/modals above game over.
- pointer-events checked.
- Mobile game-first.

## Score Safety
- Game playable without login.
- Firebase failure must not crash.
- localStorage fallback exists.
- Use savingScore/saveError naming.

## Done
- npm run build passes if available.
- npm test passes if available.
- Game start/replay works.
- Desktop/mobile input works.
- Resize works.
- Console clean.
- No legacy/mock confusion.
```

---

## 22. Quy trình phát triển game từ đầu

Thứ tự chuẩn:

```txt
1. Chốt game type.
2. Chốt game-first layout.
3. Viết design.md nhưng có layout contract rõ.
4. Viết architecture.md.
5. Viết core pure logic trước.
6. Test core logic.
7. Làm Pixi render nếu game thật sự cần PixiJS.
8. Làm React overlay.
9. Thêm localStorage.
10. Thêm Firebase sau.
11. Mobile tuning.
12. Cleanup legacy/mock.
13. Build/test.
14. Ghi lại checklist thay đổi.
```

Không nên làm:

```txt
UI + Pixi + Firebase + cleanup + dependency + mobile + animation trong cùng một prompt
```

Nên làm:

```txt
Prompt 1: Audit only
Prompt 2: Refactor Pixi lifecycle only
Prompt 3: Refactor overlay only
Prompt 4: Fix mobile input only
Prompt 5: Cleanup unused files only
Prompt 6: Update docs only
```

---

## 23. Final rule

Nếu task không có contract, mặc định task chưa sẵn sàng để sửa.

Contract tối thiểu:

```txt
Goal:
Non-goals:
Allowed files:
Forbidden files:
Definition of done:
```

Contract này phải đủ rõ để một engineer khác có thể implement mà không cần tự quyết định:

```txt
[ ] Sửa file nào?
[ ] Không sửa file nào?
[ ] Behavior nào phải giữ?
[ ] Behavior nào được đổi?
[ ] Chạy lệnh nào để verify?
[ ] Rủi ro nào cần check manual?
```

Nếu agent đề xuất sửa rộng hơn contract:

```txt
Stop.
Narrow the goal.
Audit first.
Patch one layer only.
Verify.
Then continue.
```

Nếu issue nằm ngoài Allowed files:

```txt
Report as follow-up.
Do not patch.
Do not silently expand scope.
```

---

## 24. Nhận xét critical đã được tích hợp

Bản này giữ tinh thần ban đầu của BIGUPDATE.md: biến checklist rời rạc thành contract chống AI sửa lan man. Tuy nhiên, để dùng thật với AI/Codex/Mimo, bản chỉnh sửa đã bổ sung các điểm critical sau:

```txt
[ ] Thêm priority order để biết rule nào thắng khi mâu thuẫn.
[ ] Nói rõ checklist không mở rộng Allowed files.
[ ] Thêm default forbidden files.
[ ] Thêm no destructive fixes.
[ ] Thêm dirty tree safety.
[ ] Thêm dependency rule.
[ ] Thêm baseline before patch.
[ ] Thêm high-risk changes.
[ ] Thêm stop conditions.
[ ] Thêm one task = one commit.
[ ] Sửa lại phạm vi PixiJS cho đúng với repo 2048.
[ ] Thêm component ownership.
[ ] Thêm design token rule.
[ ] Thêm performance budget.
[ ] Thêm 2048 deterministic test contract.
[ ] Sửa note releaseGlobalResources để tránh agent gọi bừa.
[ ] Yêu cầu prompt refactor phải có patch plan trước khi patch.
```

Đánh giá tổng thể:

```txt
Ý tưởng:          9/10
Độ đúng hướng:    9/10
Dùng để học:      9/10
Dùng để AI chạy:  8.5/10 sau khi bổ sung scope rules
Dùng lâu dài:     8/10 nếu vẫn giữ một file lớn
```

Lý do chưa phải 10/10: file này vẫn là một mega-doc. Nó rất tốt để học và làm checklist tổng, nhưng nếu đưa nguyên file dài cho agent trong mọi task nhỏ, agent có thể bị quá nhiều context.

---

## 25. Khuyến nghị tổ chức file lâu dài

Có thể giữ file này làm bản tổng hợp lớn:

```txt
docs/BIGUPDATE.md
```

Nhưng nếu muốn dùng hiệu quả hơn với AI, nên tách thành 3 file:

```txt
docs/game-contract.md
= rule bắt buộc, ngắn, dùng trong mọi task.

docs/game-refactor-checklist.md
= checklist chi tiết để rà soát.

docs/prompts.md
= prompt mẫu cho audit/refactor/revert UI.
```

Nếu chỉ sửa một câu duy nhất trong mọi prompt, phải có câu này:

```txt
Checklist items are for inspection only.
They do not expand the allowed file list.
If an issue is outside Allowed files, report it as follow-up instead of editing it.
```

Câu đó sẽ tránh phần lớn lỗi AI sửa lan làm nát project.

---

## 26. Kết luận ngắn

Bản contract này nên được dùng như sau:

```txt
1. Đọc repo context.
2. Viết 5 dòng contract.
3. Chạy baseline nếu có thể.
4. Audit đúng phạm vi.
5. Patch một layer.
6. Verify.
7. Báo follow-up cho issue ngoài phạm vi.
```

Không dùng file này như giấy phép để sửa toàn bộ project.

Quy tắc cuối cùng:

```txt
Không có contract = chưa refactor.
Không có Allowed files = chưa patch.
Issue ngoài scope = báo follow-up, không tự sửa.
```
