import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import LogoBubble from "@/components/ui/LogoBubble";
import Button from "@/components/ui/Button";

const NAV_ITEMS = [
  { id: "play",       label: "Chơi Ngay" },
  { id: "evolution",  label: "Tiến Hoá"  },
  { id: "dashboard",  label: "Bảng Điểm" },
  { id: "about",      label: "Giới Thiệu"},
  { id: "community",  label: "Cộng Đồng" },
];

interface TopNavProps {
  onLoginClick: () => void;
  activeSection?: string;
}

export default function TopNav({ onLoginClick, activeSection = "play" }: TopNavProps) {
  const [muted, setMuted] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        background: "rgba(245,236,215,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(42,36,24,0.12)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
      }}
    >
      {/* Brand */}
      <button
        onClick={() => scrollTo("play")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          padding: 0,
        }}
        aria-label="Về trang chủ"
      >
        <LogoBubble size={38} />
        <span
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: "var(--ink-dark)",
            lineHeight: 1.1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--pencil-gray)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Bộ Lạc
          </span>
          Đậu Phộng
        </span>
      </button>

      {/* Nav dots — center */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
        }}
        aria-label="Điều hướng chính"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: 12,
                transition: "background 0.15s",
              }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isActive ? "var(--orange-cta)" : "var(--pencil-gray)",
                  border: isActive ? "2px solid var(--orange-cta-edge)" : "2px solid transparent",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              />
              <span
                className="nav-label"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: isActive ? "var(--orange-cta)" : "var(--pencil-gray)",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Mute */}
        <button
          onClick={() => setMuted((m) => !m)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--paper-warm)",
            border: "1.5px solid var(--border)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--pencil-gray)",
            transition: "background 0.15s",
          }}
          aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Language pill */}
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 20,
            background: "var(--paper-warm)",
            border: "1.5px solid var(--border)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--ink-dark)",
            userSelect: "none",
          }}
        >
          VIE
        </span>

        {/* Login CTA */}
        <Button size="sm" onClick={onLoginClick} aria-label="Đăng nhập">
          Đăng nhập
        </Button>
      </div>
    </header>
  );
}
