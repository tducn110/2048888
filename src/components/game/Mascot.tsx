import { getGameTheme, type MascotKind } from "./gameThemes";

interface MascotProps {
  width?: number | string;
  height?: number | string;
  themeId?: number;
}

const STATIC_MASCOTS: Record<MascotKind, string> = {
  peanut: "/assets/optimized/peanut_static-180.webp",
  banhtung: "/assets/optimized/016_avatar_banhtung_nobg-180.webp",
  tiguayel: "/assets/optimized/017_avatar_tiguayel_nobg-180.webp",
  dogoin: "/assets/optimized/035_avatar_dogoin_nobg-180.webp",
};

const MASCOT_SCALE: Record<MascotKind, number> = {
  peanut: 0.9,
  banhtung: 1.08,
  tiguayel: 1.1,
  dogoin: 1.18,
};

const MASCOT_OFFSET_Y: Record<MascotKind, string> = {
  peanut: "6%",
  banhtung: "0",
  tiguayel: "0",
  dogoin: "0",
};

export default function Mascot({ width = 120, height = 120, themeId = 1 }: MascotProps) {
  const mascot = getGameTheme(themeId).mascot;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "grid",
        placeItems: "center",
      }}
      aria-label="Mascot"
    >
      <img
        src={STATIC_MASCOTS[mascot]}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 5px 4px rgba(40,27,16,0.18))",
          transform: `translateY(${MASCOT_OFFSET_Y[mascot]}) scale(${MASCOT_SCALE[mascot]})`,
          transformOrigin: "center bottom",
        }}
      />
    </div>
  );
}
