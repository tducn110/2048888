/**
 * gameGuide.ts
 * Static game guide content for the Sidebar component.
 * Extracted from src/components/sidebar/Sidebar.tsx — Phase 3 of refactor plan.
 */

export const HOW_TO_STEPS = [
  { emoji: "👆", text: "Dùng phím mũi tên, WASD hoặc vuốt màn hình để di chuyển tất cả các ô." },
  { emoji: "🔗", text: "Khi 2 ô cùng giá trị chạm nhau, chúng gộp thành 1 ô mới có giá trị gấp đôi." },
  { emoji: "🥜", text: "Mục tiêu: đạt đến ô Huyền Thoại Đậu Phộng (2048)!" },
  { emoji: "🏆", text: "Gộp ô càng cao, điểm số càng lớn. Ô mới (2 hoặc 4) xuất hiện sau mỗi lượt." },
  { emoji: "💡", text: "Hết ô trống và không thể gộp = thua. Dùng Undo để đi lại 1 bước!" },
] as const;

export const COMBO_LIST = [
  { name: "Lạc Đôi",  desc: "Gộp 2 ô trong cùng 1 lượt",    points: "+50%"       },
  { name: "Tam Lạc",  desc: "Gộp 3 ô trong cùng 1 lượt",    points: "+100%"      },
  { name: "Đại Lạc",  desc: "Gộp 4+ ô trong cùng 1 lượt",   points: "+200%"      },
  { name: "Liên Hoàn",desc: "5 lượt liên tiếp có gộp",       points: "Huy chương" },
] as const;

export const SIDEBAR_LABELS = {
  tabs: {
    howto:     "Cách Chơi",
    evolution: "Tiến Hoá",
    combo:     "Combo",
  },
  howtoTitle:  "Luật Chơi",
  evoTitle:    "Hệ Tiến Hoá",
  comboTitle:  "Combo & Phần Thưởng",
  comboNote:   "Tính năng combo sẽ ra mắt trong ver 2 🚀",
} as const;
