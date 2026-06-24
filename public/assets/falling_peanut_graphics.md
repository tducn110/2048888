# Hướng dẫn Render Fruit: Lạc Lạc (Peanut)

Trong game Fruit Slashing, mục tiêu "củ lạc" (Fruit Peanut) không được render bằng file ảnh PNG thông thường mà được vẽ trực tiếp bằng **PixiJS Graphics API**. Cách tiếp cận này giúp củ lạc sắc nét ở mọi độ phân giải (Vector-like rendering) và cho phép linh hoạt trong việc vẽ nửa củ lạc khi bị chém.

## Mã Nguồn Render Lạc Lạc

Dưới đây là mã nguồn vẽ Lạc Lạc (trích xuất từ `src/features/game/render/fruitVisuals.ts`):

```typescript
const peanut = {
  radius: 24,
  colors: { body: 0xd4a574, edge: 0x8b6914, flesh: 0xfff5e0 },
  
  // Hàm vẽ toàn bộ củ lạc khi chưa bị chém
  drawFull: (g, r, c) => {
    // lobeR: bán kính của mỗi "củ" (nửa trên và nửa dưới)
    const lobeR = r * 0.58;
    // offset: khoảng cách dịch chuyển tâm của mỗi củ so với tâm điểm chung
    const offset = r * 0.48;
    
    // 1. Vẽ hai củ tròn ở trên và dưới
    g.circle(0, -offset, lobeR).fill(c.body).stroke({ color: c.edge, width: 2 });
    g.circle(0, offset, lobeR).fill(c.body).stroke({ color: c.edge, width: 2 });
    
    // 2. Vẽ phần thân giữa nối 2 củ
    g.ellipse(0, 0, r * 0.42, r * 0.55).fill(c.body).stroke({ color: c.edge, width: 1.5 });
    
    // 3. Vẽ các đường cong (vết lõm/rãnh) ở eo củ lạc
    g.moveTo(-r * 0.4, -r * 0.15).quadraticCurveTo(0, 0, -r * 0.4, r * 0.15)
      .stroke({ color: c.edge, width: 1.2, alpha: 0.5, cap: "round" });
    g.moveTo(r * 0.4, -r * 0.15).quadraticCurveTo(0, 0, r * 0.4, r * 0.15)
      .stroke({ color: c.edge, width: 1.2, alpha: 0.5, cap: "round" });
      
    // 4. Vẽ các đường kẻ ngang đặc trưng của vỏ lạc
    for (let i = 0; i < 5; i += 1) {
      const ay = -r * 0.7 + i * r * 0.35;
      g.moveTo(-r * 0.45, ay).lineTo(r * 0.45, ay)
        .stroke({ color: c.edge, width: 0.6, alpha: 0.3 });
    }
    
    // 5. Vẽ điểm sáng (highlight) tạo hiệu ứng khối 3D cho nửa trên
    g.ellipse(-r * 0.18, -r * 0.5, r * 0.14, r * 0.1)
      .fill({ color: 0xffffff, alpha: 0.2 });
  },

  // Hàm vẽ nửa củ lạc (sau khi bị chém)
  drawHalf: (g, r, c, isLeft) => {
    // ... code vẽ nửa củ lạc tương tự nhưng với hình dạng bị cắt đôi ...
  }
};
```

## Vì sao lại render theo cách này? (Lý do kỹ thuật)

1. **Hiệu ứng "Chém đứt" linh hoạt (Procedural Slicing):** Việc vẽ bằng Graphics giúp game dễ dàng định nghĩa hàm `drawHalf` để vẽ mặt cắt (thịt lạc bên trong) sao cho ăn khớp với hiệu ứng chém, thay vì phải load thêm các file ảnh PNG cho từng mảnh vỡ.
2. **Tối ưu bộ nhớ & Caching:** Game chỉ chạy đoạn code vẽ này **Đúng 1 Lần** khi khởi động (`app.renderer.generateTexture`). Khối `Graphics` này sau đó được PixiJS nén thành Texture tĩnh. Khi vẽ hàng trăm củ lạc rơi trên màn hình, game dùng Object Pooling & Sprite tái sử dụng Texture đó (như đã tối ưu ở Phase 2). Do đó, vẽ bằng code không làm tốn CPU khi game đang chạy.
3. **Cấu trúc số 8:** Hàm `drawFull` mô phỏng cấu trúc của củ lạc bằng 2 hình tròn ghép lại (`g.circle`) ở trên và dưới, nối nhau bằng 1 elip (`g.ellipse`) ở giữa. Bề mặt vỏ được giả lập bằng vòng lặp vẽ đường kẻ ngang và đường Quadratic Bezier hai bên hông.
