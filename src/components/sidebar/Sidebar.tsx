import { useState } from "react";
import { BookOpen, Layers, Zap } from "lucide-react";
import { TILE_CONFIG } from "@/constants/tileConfig";
import { HOW_TO_STEPS, COMBO_LIST, SIDEBAR_LABELS } from "@/content/gameGuide";

const TABS = [
  { id: "howto",     label: SIDEBAR_LABELS.tabs.howto,     icon: BookOpen },
  { id: "evolution", label: SIDEBAR_LABELS.tabs.evolution,  icon: Layers   },
  { id: "combo",     label: SIDEBAR_LABELS.tabs.combo,      icon: Zap      },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Sidebar() {
  const [tab, setTab] = useState<TabId>("howto");

  return (
    <div
      id="evolution"
      style={{
        background: "var(--cream-card)",
        borderRadius: 20,
        border: "2px dashed rgba(42,36,24,0.18)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "fit-content",
      }}
    >
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, background: "rgba(42,36,24,0.07)", borderRadius: 14, padding: 4 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "7px 6px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.04em",
              background: tab === id ? "var(--cream-card)" : "transparent",
              color: tab === id ? "var(--ink-dark)" : "var(--pencil-gray)",
              boxShadow: tab === id ? "0 1px 4px rgba(42,36,24,0.1)" : "none",
              transition: "all 0.15s",
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "howto"     && <HowToTab />}
      {tab === "evolution" && <EvolutionTab />}
      {tab === "combo"     && <ComboTab />}
    </div>
  );
}

function HowToTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--ink-dark)", margin: 0 }}>
        {SIDEBAR_LABELS.howtoTitle}
      </h3>
      {HOW_TO_STEPS.map(({ emoji, text }, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{emoji}</span>
          <p style={{ fontSize: 13, color: "var(--body-text)", margin: 0, lineHeight: 1.6 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}

function EvolutionTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--ink-dark)", margin: "0 0 6px" }}>
        {SIDEBAR_LABELS.evoTitle}
      </h3>
      {TILE_CONFIG.map((cfg) => (
        <div
          key={cfg.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px",
            borderRadius: 10,
            background: cfg.colorBg,
            border: "1.5px solid rgba(42,36,24,0.12)",
          }}
        >
          <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: 13, color: cfg.colorText, minWidth: 36 }}>
            {cfg.value}
          </span>
          <div style={{ width: 1, height: 16, background: "rgba(42,36,24,0.12)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: cfg.colorText, flex: 1 }}>
            {cfg.label}
          </span>
          {cfg.value === 2048 && <span style={{ fontSize: 12 }}>👑</span>}
        </div>
      ))}
    </div>
  );
}

function ComboTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--ink-dark)", margin: 0 }}>
        {SIDEBAR_LABELS.comboTitle}
      </h3>
      <p style={{ fontSize: 12, color: "var(--pencil-gray)", margin: 0, fontStyle: "italic" }}>
        {SIDEBAR_LABELS.comboNote}
      </p>
      {COMBO_LIST.map(({ name, desc, points }) => (
        <div
          key={name}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(240,184,64,0.12)",
            border: "1.5px dashed rgba(240,184,64,0.4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            opacity: 0.7,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-dark)" }}>{name}</div>
            <div style={{ fontSize: 11, color: "var(--pencil-gray)" }}>{desc}</div>
          </div>
          <span style={{ fontWeight: 800, fontSize: 12, color: "var(--orange-cta)", background: "rgba(232,116,50,0.12)", padding: "3px 8px", borderRadius: 8, flexShrink: 0 }}>
            {points}
          </span>
        </div>
      ))}
    </div>
  );
}
