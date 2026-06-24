export default function CountrysideBackdrop({ themeId = 1 }: { themeId?: number }) {
  // Define themes
  const themes = {
    1: { // Peanut
      sky: ["#d4e8f0", "#eee4cf", "#f5ecd7"],
      sun: ["#f8d870", "#f8c840"],
      mountain1: ["#b8cfd8", "#9dbbc6"],
      mountain2: ["#c8d8a8", "#a8c888"],
      field: ["#c8d68a", "#a8c068"],
      mountain1Fill: "#e6d8b2",
      mountain2Fill: "#c8d68a",
      riceField: "#b8cc78",
      riceField2: "#a8bc68",
      fieldLines: "#88a848",
      skyFilter: "" // No filter
    },
    2: { // Yellow Dog (Golden/Sunset)
      sky: ["#ffe0b2", "#ffd54f", "#ffca28"],
      sun: ["#ff6f00", "#ff8f00"],
      mountain1: ["#ffb74d", "#ff9800"],
      mountain2: ["#ffcc80", "#ffa726"],
      field: ["#ffd54f", "#ffca28"],
      mountain1Fill: "#e6c27a",
      mountain2Fill: "#ffd54f",
      riceField: "#ffca28",
      riceField2: "#ffb300",
      fieldLines: "#ff8f00",
      skyFilter: ""
    },
    3: { // Bamboo Gift (Green/Forest)
      sky: ["#e0f2f1", "#b2dfdb", "#80cbc4"],
      sun: ["#aed581", "#8bc34a"],
      mountain1: ["#81c784", "#66bb6a"],
      mountain2: ["#aed581", "#8bc34a"],
      field: ["#81c784", "#66bb6a"],
      mountain1Fill: "#aed581",
      mountain2Fill: "#81c784",
      riceField: "#66bb6a",
      riceField2: "#4caf50",
      fieldLines: "#388e3c",
      skyFilter: ""
    },
    4: { // Orange Tabby (Autumn/Warm)
      sky: ["#ffccbc", "#ffab91", "#ff8a65"],
      sun: ["#ff7043", "#f4511e"],
      mountain1: ["#ff8a65", "#ff7043"],
      mountain2: ["#ffab91", "#ff8a65"],
      field: ["#ffa726", "#ff9800"],
      mountain1Fill: "#ffb74d",
      mountain2Fill: "#ffa726",
      riceField: "#ff9800",
      riceField2: "#fb8c00",
      fieldLines: "#f57c00",
      skyFilter: ""
    }
  };

  const t = themes[themeId as keyof typeof themes] || themes[1];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none"
      }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.sky[0]} />
            <stop offset="60%" stopColor={t.sky[1]} />
            <stop offset="100%" stopColor={t.sky[2]} />
          </linearGradient>
          <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.mountain1[0]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={t.mountain1[1]} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.mountain2[0]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={t.mountain2[1]} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.field[0]} />
            <stop offset="100%" stopColor={t.field[1]} />
          </linearGradient>
          <filter id="sketch" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1440" height="900" fill="url(#sky)" />

        {/* Sun / warm glow top-right */}
        <circle cx="1200" cy="120" r="70" fill={t.sun[0]} opacity="0.3" />
        <circle cx="1200" cy="120" r="50" fill={t.sun[1]} opacity="0.25" />

        {/* Distant mountains layer 1 */}
        <path
          d="M0 440 Q180 280 360 340 Q540 280 720 340 Q900 260 1080 330 Q1260 270 1440 340 L1440 560 L0 560 Z"
          fill={t.mountain1Fill}
          fillOpacity="0.6"
          stroke="#8a7d65"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Distant mountains layer 2 */}
        <path
          d="M0 500 Q200 380 400 420 Q600 370 800 420 Q1000 360 1200 410 Q1320 370 1440 420 L1440 580 L0 580 Z"
          fill={t.mountain2Fill}
          fillOpacity="0.5"
          stroke="#8a7d65"
          strokeWidth="0.8"
          strokeOpacity="0.25"
        />

        {/* Rice fields */}
        <path
          d="M0 580 Q360 540 720 570 Q1080 540 1440 570 L1440 700 L0 700 Z"
          fill={t.riceField}
          opacity="0.7"
        />
        <path
          d="M0 630 Q400 600 800 625 Q1100 600 1440 625 L1440 900 L0 900 Z"
          fill={t.riceField2 || "#a8bc68"}
          opacity="0.6"
        />

        {/* Field texture lines */}
        {[640, 660, 680, 700, 720].map((y, i) => (
          <path
            key={i}
            d={`M0 ${y} Q360 ${y - 8} 720 ${y} Q1080 ${y + 8} 1440 ${y}`}
            stroke={t.fieldLines || "#88a848"}
            strokeWidth="1.2"
            fill="none"
            opacity="0.4"
          />
        ))}

        {/* Bamboo grove left */}
        <BambooGrove x={80} y={520} count={5} />

        {/* Bamboo grove right */}
        <BambooGrove x={1260} y={500} count={4} />

        {/* Coconut palm mid-right */}
        <CoconutPalm x={1050} y={460} />

        {/* Flying egrets */}
        <Egret x={340} y={200} size={18} />
        <Egret x={380} y={190} size={14} />
        <Egret x={420} y={210} size={16} />
        <Egret x={900} y={230} size={20} />
        <Egret x={940} y={215} size={15} />

        {/* Kite */}
        <Kite x={600} y={150} />

        {/* Foreground grass tufts */}
        <GrassTuft x={200} y={760} />
        <GrassTuft x={600} y={780} />
        <GrassTuft x={1000} y={765} />
        <GrassTuft x={1300} y={775} />

        {/* Faint pencil texture overlay */}
        <rect width="1440" height="900" fill="url(#sky)" opacity="0.08" />
      </svg>
    </div>
  );
}

function BambooGrove({ x, y, count }: { x: number; y: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const cx = x + i * 22 + (i % 2) * 8;
        const height = 180 + (i % 3) * 30;
        return (
          <g key={i}>
            {/* Stalk */}
            <line x1={cx} y1={y} x2={cx} y2={y + height} stroke="#6b8e3d" strokeWidth="6" strokeLinecap="round" />
            {/* Segments */}
            {[0.25, 0.5, 0.75].map((seg, j) => (
              <line key={j} x1={cx - 3} y1={y + height * seg} x2={cx + 3} y2={y + height * seg} stroke="#4c6630" strokeWidth="2" />
            ))}
            {/* Leaves */}
            <path d={`M${cx} ${y + 20} Q${cx - 30} ${y - 10} ${cx - 40} ${y - 30}`} stroke="#6b8e3d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${cx} ${y + 20} Q${cx + 25} ${y - 5} ${cx + 38} ${y - 25}`} stroke="#4c6630" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

function CoconutPalm({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y + 180} Q${x - 20} ${y + 100} ${x + 10} ${y}`} stroke="#8e4e22" strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* Fronds */}
      {[0, 40, 80, 130, 200, 260, 310].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const ex = x + 10 + Math.cos(rad) * 90;
        const ey = y + Math.sin(rad) * 40;
        return (
          <path key={i} d={`M${x + 10} ${y} Q${(x + 10 + ex) / 2} ${(y + ey) / 2 - 20} ${ex} ${ey}`} stroke="#4c6630" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        );
      })}
    </g>
  );
}

function Egret({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g opacity="0.75">
      <path d={`M${x} ${y} Q${x - size} ${y - size * 0.5} ${x - size * 1.8} ${y}`} stroke="#d8ccb8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={`M${x} ${y} Q${x + size} ${y - size * 0.5} ${x + size * 1.8} ${y}`} stroke="#d8ccb8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y - 4} r="3.5" fill="#d8ccb8" />
      <path d={`M${x} ${y - 4} L${x + 8} ${y - 2}`} stroke="#f0b840" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Kite({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Diamond body */}
      <path d={`M${x} ${y - 50} L${x + 35} ${y} L${x} ${y + 60} L${x - 35} ${y} Z`} fill="#e87432" stroke="#2a2418" strokeWidth="2" opacity="0.85" />
      <line x1={x} y1={y - 50} x2={x} y2={y + 60} stroke="#2a2418" strokeWidth="1.2" opacity="0.5" />
      <line x1={x - 35} y1={y} x2={x + 35} y2={y} stroke="#2a2418" strokeWidth="1.2" opacity="0.5" />
      {/* Cross decoration */}
      <circle cx={x} cy={y} r="5" fill="#f0b840" />
      {/* Tail string */}
      <path d={`M${x} ${y + 60} Q${x + 30} ${y + 100} ${x + 10} ${y + 140} Q${x + 40} ${y + 180} ${x + 20} ${y + 220}`} stroke="#2a2418" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Tail bows */}
      {[80, 130, 180].map((dy, i) => (
        <path key={i} d={`M${x + (i % 2 === 0 ? 20 : 30)} ${y + dy} Q${x + (i % 2 === 0 ? 35 : 15)} ${y + dy - 8} ${x + (i % 2 === 0 ? 10 : 20)} ${y + dy - 16}`} stroke="#c23838" strokeWidth="2" fill="none" opacity="0.7" />
      ))}
    </g>
  );
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  const blades = [-20, -12, -5, 0, 7, 14, 22];
  return (
    <g>
      {blades.map((dx, i) => (
        <path
          key={i}
          d={`M${x + dx} ${y} Q${x + dx - 5 + (i % 3)} ${y - 30 - (i % 3) * 8} ${x + dx + 5} ${y - 50 - (i % 4) * 10}`}
          stroke="#6b8e3d"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
    </g>
  );
}
