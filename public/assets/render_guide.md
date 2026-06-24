# Hướng dẫn render Mascot Lạc (Peanut)

Thư mục này chứa các file spritesheet của Mascot Lạc (Lạc bộ lạc) được sử dụng trong Speed Click Game:
- `peanut_idle_wave_spritesheet.png`: Hình ảnh chứa các frame của mascot.
- `peanut_idle_wave_spritesheet.json`: File map tọa độ các frame để PixiJS cắt ảnh.

## Vấn đề kĩ thuật (Vì sao cần code đặc biệt để render)
Bởi vì spritesheet gốc cắt các frame không được căn giữa một cách nhất quán (vị trí đôi chân của Lạc bị lệch qua lại, lên xuống giữa các frame). Nếu chỉ chạy `AnimatedSprite` thông thường, con Lạc sẽ bị giật và trượt chân trên mặt đất.

## Cách render chuẩn để Lạc đứng yên (Planted Feet)

Trong game, Lạc được render bằng PixiJS (`AnimatedSprite`). Để đôi chân luôn cố định một chỗ trên mặt đất, ta phải áp dụng một mảng `frameOffsets` để bù trừ tọa độ x/y thủ công theo từng frame.

### Đoạn code mẫu (dùng PixiJS):

```typescript
import { AnimatedSprite, Assets, type Spritesheet } from "pixi.js";

// 1. Load spritesheet
const sheet = await Assets.load<Spritesheet>("/assets/peanut_idle_wave_spritesheet.json");

// 2. Lấy ra các frame cần thiết cho hiệu ứng "idle_wave" (Đứng vẫy tay)
const frames = [
  sheet.textures["peanut_idle_wave_00.png"],
  sheet.textures["peanut_idle_wave_01.png"],
  sheet.textures["peanut_idle_wave_00.png"],
  sheet.textures["peanut_idle_wave_04.png"],
  sheet.textures["peanut_idle_wave_05.png"],
  sheet.textures["peanut_idle_wave_04.png"],
].filter(Boolean);

// 3. Khai báo bù trừ tọa độ cho từng frame tương ứng để chống lệch chân
const frameOffsets = [
  { x: 0, y: 0 },
  { x: 18, y: 1 },
  { x: 0, y: 0 },
  { x: -4, y: 2 },
  { x: 18, y: 2 },
  { x: -4, y: 2 },
];

// 4. Tạo AnimatedSprite và áp dụng offset khi đổi frame
const peanut = new AnimatedSprite(frames);
peanut.animationSpeed = 0.16;
peanut.loop = true;
peanut.roundPixels = true;

// Hàm này cực kì quan trọng để giữ chân Lạc cố định
peanut.onFrameChange = (frameIndex) => {
  const offset = frameOffsets[frameIndex] ?? frameOffsets[0];
  peanut.position.set(offset.x, offset.y);
};

peanut.play();
app.stage.addChild(peanut);
```

**Tóm tắt logic:** 
1. Ta xếp lại thứ tự frame để tạo loop vẫy tay và chớp mắt (00, 01, 00, 04, 05, 04).
2. Khi `AnimatedSprite` chuyển sang frame nào (`onFrameChange`), ta lập tức chỉnh `position.x` và `position.y` của cục sprite đó dịch đi một chút dựa theo `frameOffsets` để chân nó không bị trượt đi chỗ khác.
