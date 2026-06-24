import React from "react";
import Button from "@/components/ui/Button";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboards({ onBack }: LeaderboardProps) {
  const mockData = [
    { name: "PeanutKing", score: 125400 },
    { name: "BambooMaster", score: 98200 },
    { name: "DoggoPlayer", score: 85300 },
    { name: "CatLover", score: 72100 },
    { name: "Guest_2048", score: 65400 },
  ];

  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "32px 24px",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Trophy size={28} color="#f0b840" />
        <h1
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(24px, 5vw, 28px)",
            color: "var(--ink-dark)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Bảng Xếp Hạng
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mockData.map((user, idx) => (
          <div key={idx} style={{ 
            display: "flex", 
            alignItems: "center", 
            background: idx < 3 ? "rgba(240, 184, 64, 0.15)" : "rgba(138,125,101,0.08)",
            padding: "12px 16px",
            borderRadius: 16,
            border: idx < 3 ? "2px solid rgba(240, 184, 64, 0.3)" : "2px solid transparent"
          }}>
            <div style={{ 
              width: 40, // Increased from 28 to 40 to prevent text overlap
              fontWeight: 800, 
              color: idx === 0 ? "#f0b840" : idx === 1 ? "#A0A0A0" : idx === 2 ? "#CD7F32" : "var(--pencil-gray)",
              fontSize: 18
            }}>
              #{idx + 1}
            </div>
            <div style={{ flex: 1, fontWeight: 700, color: "var(--ink-dark)", fontSize: 16 }}>
              {user.name}
            </div>
            <div style={{ fontWeight: 800, color: "var(--orange-cta-edge)", fontSize: 16 }}>
              {user.score.toLocaleString("vi-VN")}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onBack} size="md" variant="secondary" style={{ marginTop: 8 }}>
        ← Quay lại
      </Button>
    </div>
  );
}
