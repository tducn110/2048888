# Bo Lac 2048 PixiJS

Wink mini-game chạy trong iframe của `https://winkgames.papastudio.net`.
Production game origin là `https://bo-lac-2048.papastudio.net`.

## Local verification

```bash
npm ci
npm run verify:wink-bridge
npm test
npm run typecheck
npm run build
```

Để chạy toàn bộ deployment gate với metadata trong `game.config.sh`:

```bash
./deploy.sh --check-only
```

## Runtime boundary

Production bắt buộc chạy trong Wink iframe. Mở game trực tiếp ngoài parent
được cho phép sẽ dừng với lỗi `PARENT_REQUIRED`. Runtime config chỉ chứa public
metadata; access token và session authority luôn nằm trong bridge closure.

Bridge contract hiện tại:

- Protocol version: `1`
- Bridge version: `9.2.0`
- Allowed parent: `https://winkgames.papastudio.net`

Không commit secret, session token hoặc harness credential vào repository.
