import type { ReactElement } from "react";
import { getTileConfig } from "@/constants/tileConfig";
import type { TileCell } from "@/types";

interface TileProps {
  tile: TileCell;
  cellSize: number;
  gap: number;
  padding: number;
}

export default function Tile({ tile, cellSize, gap, padding }: TileProps) {
  const cfg = getTileConfig(tile.value);
  const x = padding + tile.col * (cellSize + gap);
  const y = padding + tile.row * (cellSize + gap);
  const fontSize = cellSize < 80 ? (tile.value >= 1000 ? 11 : tile.value >= 100 ? 13 : 14) : (tile.value >= 1000 ? 14 : tile.value >= 100 ? 16 : 18);

  return (
    <div
      data-tile-id={tile.id}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: cellSize,
        height: cellSize,
        transition: "left 0.13s ease, top 0.13s ease",
        zIndex: tile.isMerged ? 10 : 1,
      }}
    >
      <div
        className={tile.isNew ? "tile-spawn" : tile.isMerged ? "tile-pop" : ""}
        style={{
          width: "100%",
          height: "100%",
          background: cfg.colorBg,
          borderRadius: 16,
          border: "2px solid rgba(42,36,24,0.18)",
          boxShadow: "0 2px 6px rgba(42,36,24,0.12), inset 0 1px 0 rgba(255,255,255,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Sketch texture overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          borderRadius: 14,
          pointerEvents: "none",
        }} />

        {/* Mascot SVG */}
        {cfg.hasMascot && cellSize >= 60 && (
          <div style={{ width: cellSize * 0.52, height: cellSize * 0.42, flexShrink: 0 }}>
            <MascotSVG value={tile.value} color={cfg.colorText} />
          </div>
        )}

        {/* Label */}
        {cellSize >= 72 && (
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: cfg.colorText,
            opacity: 0.75,
            textTransform: "uppercase",
            lineHeight: 1,
            textAlign: "center",
            padding: "0 4px",
            maxWidth: "90%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {cfg.label}
          </span>
        )}

        {/* Number */}
        <span style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize,
          color: cfg.colorText,
          lineHeight: 1,
          textShadow: "0 1px 0 rgba(255,255,255,0.3)",
        }}>
          {tile.value}
        </span>
      </div>
    </div>
  );
}

export function MascotSVG({ value, color }: { value: number; color: string }) {
  const c = color;
  const ops: Record<number, ReactElement> = {
    2: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="35" x2="20" y2="20" stroke="#6b8e3d" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M20 24 Q11 16 9 8 Q16 13 20 20" fill="#6b8e3d"/>
        <path d="M20 24 Q29 16 31 8 Q24 13 20 20" fill="#8eb84a"/>
        <circle cx="16" cy="36" r="2.5" fill="#8e4e22" opacity="0.45"/>
        <circle cx="24" cy="36" r="2.5" fill="#8e4e22" opacity="0.45"/>
      </svg>
    ),
    4: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="14" rx="11" ry="10" fill="#f0b840" stroke="#8e4e22" strokeWidth="1.5"/>
        <ellipse cx="20" cy="28" rx="9" ry="8" fill="#f0b840" stroke="#8e4e22" strokeWidth="1.5"/>
        <path d="M12 20 Q20 22 28 20" stroke="#8e4e22" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 10 Q20 8 27 10" stroke="#b85a22" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <path d="M14 26 Q20 24 26 26" stroke="#b85a22" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    8: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="14" rx="11" ry="10" fill="#f0b840" stroke="#8e4e22" strokeWidth="1.5"/>
        <ellipse cx="20" cy="28" rx="9" ry="8" fill="#f0b840" stroke="#8e4e22" strokeWidth="1.5"/>
        <path d="M12 20 Q20 22 28 20" stroke="#8e4e22" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="13" r="2" fill="#8e4e22"/>
        <circle cx="24" cy="13" r="2" fill="#8e4e22"/>
        <path d="M16 17 Q20 19.5 24 17" stroke="#8e4e22" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 27 Q20 29 22 27" stroke="#8e4e22" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    16: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cat face */}
        <ellipse cx="20" cy="22" rx="14" ry="13" fill="#e87432" stroke="#2a2418" strokeWidth="1.5"/>
        {/* Ears */}
        <path d="M8 14 L10 4 L18 12" fill="#e87432" stroke="#2a2418" strokeWidth="1.5"/>
        <path d="M32 14 L30 4 L22 12" fill="#e87432" stroke="#2a2418" strokeWidth="1.5"/>
        <path d="M10 12 L11 6 L17 12" fill="#f0a860" />
        <path d="M30 12 L29 6 L23 12" fill="#f0a860" />
        {/* Eyes */}
        <ellipse cx="15" cy="20" rx="3" ry="3.5" fill="#2a2418"/>
        <ellipse cx="25" cy="20" rx="3" ry="3.5" fill="#2a2418"/>
        <circle cx="16" cy="19" r="1" fill="white"/>
        <circle cx="26" cy="19" r="1" fill="white"/>
        {/* Nose */}
        <path d="M18 25 L20 23 L22 25 L20 26 Z" fill="#2a2418"/>
        {/* Mouth */}
        <path d="M17 27 Q20 29.5 23 27" stroke="#2a2418" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Whiskers */}
        <line x1="6" y1="24" x2="14" y2="25" stroke="#2a2418" strokeWidth="1" opacity="0.6"/>
        <line x1="6" y1="26" x2="14" y2="26" stroke="#2a2418" strokeWidth="1" opacity="0.6"/>
        <line x1="26" y1="25" x2="34" y2="24" stroke="#2a2418" strokeWidth="1" opacity="0.6"/>
        <line x1="26" y1="26" x2="34" y2="26" stroke="#2a2418" strokeWidth="1" opacity="0.6"/>
      </svg>
    ),
    32: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0,1,2].map(i => {
          const cx = 12 + i * 8;
          return (
            <g key={i}>
              <rect x={cx - 2.5} y={10 + i*2} width={5} height={28 - i*2} rx="2" fill="#6b8e3d" stroke="#4c6630" strokeWidth="1"/>
              <line x1={cx-2.5} y1={20+i} x2={cx+2.5} y2={20+i} stroke="#4c6630" strokeWidth="1.2"/>
              <line x1={cx-2.5} y1={27+i} x2={cx+2.5} y2={27+i} stroke="#4c6630" strokeWidth="1.2"/>
              <path d={`M${cx} ${10+i*2} Q${cx-12} ${5+i} ${cx-16} ${2}`} stroke="#6b8e3d" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d={`M${cx} ${10+i*2} Q${cx+10} ${4+i} ${cx+13} ${1}`} stroke="#4c6630" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </g>
          );
        })}
      </svg>
    ),
    64: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 5 L32 20 L20 35 L8 20 Z" fill="#e87432" stroke="#2a2418" strokeWidth="1.5"/>
        <line x1="20" y1="5" x2="20" y2="35" stroke="#2a2418" strokeWidth="1" opacity="0.4"/>
        <line x1="8" y1="20" x2="32" y2="20" stroke="#2a2418" strokeWidth="1" opacity="0.4"/>
        <circle cx="20" cy="20" r="4" fill="#f0b840" stroke="#2a2418" strokeWidth="1"/>
        <path d="M20 35 Q26 42 24 48" stroke="#2a2418" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M24 40 Q28 38 26 43" stroke="#c23838" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    128: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mountain layers */}
        <path d="M2 32 Q10 18 20 22 Q28 16 38 32 Z" fill="#8eb84a" opacity="0.6"/>
        <path d="M2 38 Q12 22 22 26 Q30 20 38 30 L38 38 Z" fill="#6b8e3d" opacity="0.8"/>
        {/* Sun */}
        <circle cx="30" cy="10" r="6" fill="#f0b840" opacity="0.9"/>
        {/* Rice field rows */}
        <line x1="4" y1="34" x2="36" y2="34" stroke="#4c6630" strokeWidth="1.5" opacity="0.5"/>
        <line x1="4" y1="37" x2="36" y2="37" stroke="#4c6630" strokeWidth="1.5" opacity="0.5"/>
        {/* Bird */}
        <path d="M12 16 Q14 14 16 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M6 18 Q8 16 10 18" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    256: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Drum body */}
        <ellipse cx="20" cy="12" rx="14" ry="6" fill="#c23838" stroke="#2a2418" strokeWidth="1.5"/>
        <rect x="6" y="12" width="28" height="18" rx="1" fill="#c23838" stroke="#2a2418" strokeWidth="1.5"/>
        <ellipse cx="20" cy="30" rx="14" ry="6" fill="#b02828" stroke="#2a2418" strokeWidth="1.5"/>
        {/* Straps */}
        <line x1="10" y1="12" x2="14" y2="30" stroke="#f0b840" strokeWidth="2"/>
        <line x1="30" y1="12" x2="26" y2="30" stroke="#f0b840" strokeWidth="2"/>
        <line x1="20" y1="6" x2="20" y2="36" stroke="#f0b840" strokeWidth="1.5" strokeDasharray="3 3"/>
        {/* Drum sticks */}
        <line x1="8" y1="5" x2="18" y2="14" stroke="#8e4e22" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="8" cy="5" r="3" fill="#8e4e22"/>
        <line x1="32" y1="5" x2="22" y2="14" stroke="#8e4e22" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="5" r="3" fill="#8e4e22"/>
      </svg>
    ),
    512: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Star/sun */}
        {[0,45,90,135,180,225,270,315].map(angle => {
          const rad = angle * Math.PI / 180;
          return (
            <line key={angle}
              x1={20 + Math.cos(rad)*8} y1={20 + Math.sin(rad)*8}
              x2={20 + Math.cos(rad)*18} y2={20 + Math.sin(rad)*18}
              stroke="#f0b840" strokeWidth="2.5" strokeLinecap="round"
            />
          );
        })}
        <circle cx="20" cy="20" r="9" fill="#d99820" stroke="#2a2418" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="5" fill="#f0b840"/>
        {/* Tribal dots */}
        {[0,60,120,180,240,300].map(a => {
          const r = a * Math.PI / 180;
          return <circle key={a} cx={20+Math.cos(r)*6.5} cy={20+Math.sin(r)*6.5} r="1.2" fill="#8e4e22"/>;
        })}
      </svg>
    ),
    1024: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dragon/phoenix head */}
        <path d="M8 28 Q10 20 16 18 Q14 14 18 10 Q22 8 24 12 Q28 8 30 12 Q36 16 34 24 Q32 30 26 32 Q20 36 14 32 Q10 30 8 28 Z" fill="#b85a22" stroke="#2a2418" strokeWidth="1.5"/>
        {/* Eyes */}
        <circle cx="17" cy="18" r="3" fill="#f0b840" stroke="#2a2418" strokeWidth="1"/>
        <circle cx="25" cy="18" r="3" fill="#f0b840" stroke="#2a2418" strokeWidth="1"/>
        <circle cx="17" cy="18" r="1.5" fill="#2a2418"/>
        <circle cx="25" cy="18" r="1.5" fill="#2a2418"/>
        {/* Horns */}
        <path d="M16 10 Q12 4 14 2" stroke="#f0b840" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 10 Q28 4 26 2" stroke="#f0b840" strokeWidth="2" strokeLinecap="round"/>
        {/* Scales */}
        <path d="M14 22 Q17 20 20 22 Q23 20 26 22" stroke="#8e4e22" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M13 26 Q17 24 21 26 Q25 24 27 26" stroke="#8e4e22" strokeWidth="1" fill="none" strokeLinecap="round"/>
        {/* Fire breath */}
        <path d="M18 32 Q16 38 12 40" stroke="#e87432" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M22 33 Q22 39 20 42" stroke="#f0b840" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    2048: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Aura */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
          const r = a * Math.PI / 180;
          return <line key={a} x1={20+Math.cos(r)*9} y1={20+Math.sin(r)*9} x2={20+Math.cos(r)*19} y2={20+Math.sin(r)*19} stroke="#f0b840" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>;
        })}
        {/* Crowned peanut */}
        <ellipse cx="20" cy="15" rx="9" ry="8" fill="#f0b840" stroke="#2a2418" strokeWidth="1.5"/>
        <ellipse cx="20" cy="27" rx="7.5" ry="6.5" fill="#f0b840" stroke="#2a2418" strokeWidth="1.5"/>
        <path d="M13 19.5 Q20 21 27 19.5" stroke="#2a2418" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Crown */}
        <path d="M12 10 L14 4 L17 8 L20 2 L23 8 L26 4 L28 10 Z" fill="#f0b840" stroke="#2a2418" strokeWidth="1.5"/>
        {/* Face */}
        <circle cx="16.5" cy="14" r="2" fill="#2a2418"/>
        <circle cx="23.5" cy="14" r="2" fill="#2a2418"/>
        <circle cx="17" cy="13.2" r="0.8" fill="white"/>
        <circle cx="24" cy="13.2" r="0.8" fill="white"/>
        <path d="M15.5 17.5 Q20 20 24.5 17.5" stroke="#2a2418" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Stars */}
        <text x="4" y="8" fontSize="7" fill="#f0b840">★</text>
        <text x="31" y="8" fontSize="7" fill="#f0b840">★</text>
      </svg>
    ),
  };

  const fallback = (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill={c} opacity="0.4" stroke={c} strokeWidth="2"/>
    </svg>
  );

  return ops[value] ?? fallback;
}
