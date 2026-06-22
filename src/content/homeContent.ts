/**
 * homeContent.ts
 * Static copy for the home/hero section of the app.
 * Extracted from src/app/App.tsx — Phase 3 of refactor plan.
 */

export const HOME_CONTENT = {
  hero: {
    eyebrow: "🌾 Trò Chơi Dân Gian",
    title: "Gộp Đậu, Lớn Mạnh",
    subtitle: "Đưa Mầm Đậu nhỏ trở thành Huyền Thoại Đậu Phộng!",
  },
  sections: ["play", "evolution", "dashboard", "about"] as const,
} as const;
