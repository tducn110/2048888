# Bo Lac 2048 PixiJS

Wink mini-game. Chạy trong iframe của Wink, và chạy được cả khi mở thẳng —
không có nền tảng ở đó thì mọi lời gọi trả về rỗng chứ không lỗi.

## Local verification

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Cổng phát hành chạy trên thư mục build, không phải trên repo:

```bash
node ../../wink/game-template/verify-build.mjs dist
```

## Tích hợp Wink

Một thẻ script trong `index.html`, không có file cấu hình nào trong repo:

```html
<script src="https://sdk.winkgames.fun/v1/wink.js"></script>
```

SDK là script thường, `src/main.tsx` là module — module luôn hoãn tới sau khi
phân tích xong, nên `window.Wink` chắc chắn đã có trước dòng code đầu tiên của
game, bất kể thứ tự thẻ.

Toàn bộ phần game chạm vào nền tảng nằm trong [`src/wink.ts`](src/wink.ts).
Nó chỉ làm một việc SDK không làm được: biến bốn câu trả lời bất đồng bộ thành
state của React. Vòng chơi do SDK giữ — `gameplayStart()` phát mã vòng,
`gameplayStop()` đo thời lượng, game không tự sinh `roundId` nữa.

Không có SRI trên thẻ script, và đó là chủ ý: ghim hash vào `index.html` của
từng game là mất đúng cái tính chất khiến SDK đáng làm — sửa được cả đàn mà
không phải deploy lại game nào.

Không commit secret, session token hoặc harness credential vào repository.
