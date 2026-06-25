import type { TileConfig } from "@/types";

export const TILE_CONFIG: TileConfig[] = [
  { value: 2,    label: "Mầm Đậu",              colorBg: "#f0e8d0", colorText: "#4a4232", hasMascot: true  },
  { value: 4,    label: "Đậu Nhỏ",              colorBg: "#e8d8b0", colorText: "#4a4232", hasMascot: true  },
  { value: 8,    label: "Lạc Lạc",              colorBg: "#f0b840", colorText: "#2a2418", hasMascot: true  },
  { value: 16,   label: "Mèo Cam",              colorBg: "#e87432", colorText: "#fff8ee", hasMascot: true  },
  { value: 32,   label: "Tre Làng",             colorBg: "#6b8e3d", colorText: "#f5ecd7", hasMascot: true  },
  { value: 64,   label: "Diều Tuổi Thơ",        colorBg: "#4c6630", colorText: "#c8d68a", hasMascot: true  },
  { value: 128,  label: "Cánh Đồng",            colorBg: "#8e4e22", colorText: "#f5ecd7", hasMascot: true  },
  { value: 256,  label: "Trống Hội",            colorBg: "#c23838", colorText: "#fff8ee", hasMascot: true  },
  { value: 512,  label: "Bộ Lạc Vàng",          colorBg: "#d99820", colorText: "#2a2418", hasMascot: true  },
  { value: 1024, label: "Linh Vật Làng",         colorBg: "#b85a22", colorText: "#fff8ee", hasMascot: true  },
  { value: 2048, label: "Huyền Thoại",           colorBg: "#2a2418", colorText: "#f0b840", hasMascot: true  },
];

export function getTileConfig(value: number): TileConfig {
  return (
    TILE_CONFIG.find((t) => t.value === value) ?? {
      value,
      label: `Cấp ${value}`,
      colorBg: "#2a2418",
      colorText: "#f0b840",
      hasMascot: false,
    }
  );
}

export const MOCK_LEADERBOARD = [
  { name: "Minh Tài 🏆", score: 18240, maxTile: 2048 },
  { name: "Lan Anh",      score: 14560, maxTile: 1024 },
  { name: "Quốc Hùng",   score: 11200, maxTile: 1024 },
  { name: "Thu Hà",       score: 8840,  maxTile: 512  },
  { name: "Đức Thành",   score: 6400,  maxTile: 512  },
  { name: "Bảo Ngọc",     score: 5200,  maxTile: 512  },
  { name: "Hải Long",     score: 4100,  maxTile: 256  },
  { name: "Mai Chi",      score: 3200,  maxTile: 256  },
  { name: "An Nhiên",     score: 2400,  maxTile: 128  },
  { name: "Tùng Lâm",     score: 1800,  maxTile: 128  },
];
