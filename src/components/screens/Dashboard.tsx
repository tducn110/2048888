import React from "react";
import Button from "@/components/ui/Button";

interface DashboardProps {
  username: string;
  bestScore: number;
  onPlay: () => void;
  onLogout: () => void;
}

export default function Dashboard({ username, bestScore, onPlay, onLogout }: DashboardProps) {
  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "32px",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center"
      }}
    >
      <h1
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(24px, 5vw, 32px)",
          color: "var(--ink-dark)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        Xin chào, {username}!
      </h1>
      
      <div style={{
        background: "rgba(138,125,101,0.1)",
        padding: "24px",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}>
        <div style={{ fontSize: 14, color: "var(--pencil-gray)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kỷ Lục Của Bạn</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "var(--orange-cta-edge)", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {bestScore.toLocaleString("vi-VN")}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Button onClick={onPlay} size="lg" variant="primary">
          ▶ Chơi Ngay
        </Button>
        <Button onClick={onLogout} size="md" variant="ghost">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
