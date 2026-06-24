import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface LoginProps {
  onLogin: (username: string) => void;
  onPlayGuest: () => void;
}

export default function Login({ onLogin, onPlayGuest }: LoginProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

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
        Bộ Lạc Đậu Phộng
      </h1>
      
      <p style={{ margin: 0, color: "var(--pencil-gray)", fontWeight: 500 }}>
        Đăng nhập để lưu điểm và so tài cùng bạn bè!
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="text"
          placeholder="Nhập tên của bạn..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "16px",
            borderRadius: 16,
            border: "2px solid rgba(138,125,101,0.2)",
            background: "rgba(255,255,255,0.7)",
            fontSize: 16,
            fontFamily: "inherit",
            fontWeight: 600,
            outline: "none",
            color: "var(--ink-dark)",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--orange-cta-edge)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(138,125,101,0.2)"}
        />
        <Button type="submit" size="lg" disabled={!username.trim()}>
          Vào Làng!
        </Button>
      </form>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(138,125,101,0.2)" }} />
        <span style={{ fontSize: 13, color: "var(--pencil-gray)", fontWeight: 600 }}>HOẶC</span>
        <div style={{ flex: 1, height: 1, background: "rgba(138,125,101,0.2)" }} />
      </div>

      <Button type="button" variant="secondary" size="md" onClick={onPlayGuest}>
        Chơi ngay (Không lưu điểm)
      </Button>
    </div>
  );
}
