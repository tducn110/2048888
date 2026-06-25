import Button from "@/components/ui/Button";
import { Trophy, Medal } from "lucide-react";
import type { LocalStats } from "@/types";
import { getTileConfig } from "@/constants/tileConfig";
import { buildLeaderboardModel, type RankedLeaderboardEntry } from "@/lib/dashboardHelpers";

interface LeaderboardProps {
  stats: LocalStats;
  username: string;
  onBack: () => void;
}

export default function Leaderboards({ stats, username, onBack }: LeaderboardProps) {
  const { topEntries, currentPlayer } = buildLeaderboardModel(stats, username || "Người chơi");

  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "28px 22px",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 18,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {topEntries.map((entry) => (
          <LeaderboardRow key={`${entry.name}-${entry.rank}`} entry={entry} />
        ))}

        {currentPlayer && (
          <>
            <div style={{ height: 1, background: "rgba(42,36,24,0.14)", margin: "4px 0" }} />
            <LeaderboardRow entry={currentPlayer} highlight label="Hạng của bạn" />
          </>
        )}
      </div>

      <Button onClick={onBack} size="md" variant="secondary" style={{ marginTop: 8 }}>
        ← Quay lại
      </Button>
    </div>
  );
}

function LeaderboardRow({
  entry,
  highlight = false,
  label,
}: {
  entry: RankedLeaderboardEntry;
  highlight?: boolean;
  label?: string;
}) {
  const rankIndex = entry.rank ? entry.rank - 1 : 10;
  const tileConfig = getTileConfig(entry.maxTile);
  const isTopThree = entry.rank != null && entry.rank <= 3;
  const rankColor = rankIndex === 0 ? "#f0b840" : rankIndex === 1 ? "#8f8f8f" : rankIndex === 2 ? "#CD7F32" : "var(--pencil-gray)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 10,
        background: highlight
          ? "rgba(232,116,50,0.1)"
          : isTopThree
            ? "rgba(240,184,64,0.14)"
            : "rgba(138,125,101,0.08)",
        padding: "10px 12px",
        borderRadius: 14,
        border: highlight
          ? "2px solid rgba(232,116,50,0.35)"
          : isTopThree
            ? "2px solid rgba(240,184,64,0.28)"
            : "2px solid transparent",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          color: rankColor,
          fontSize: entry.rank ? 16 : 12,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {isTopThree && <Medal size={14} />}
        {entry.rank ? `#${entry.rank}` : "Unknown"}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            color: "var(--ink-dark)",
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          {label && <span style={{ fontSize: 10, fontWeight: 800, color: "var(--orange-cta-edge)" }}>{label}</span>}
          {entry.maxTile > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: 6,
                background: tileConfig.colorBg,
                color: tileConfig.colorText,
              }}
            >
              {entry.maxTile}
            </span>
          )}
        </div>
      </div>

      <div style={{ fontWeight: 800, color: "var(--orange-cta-edge)", fontSize: 15, textAlign: "right" }}>
        {entry.score > 0 ? entry.score.toLocaleString("vi-VN") : "Chưa có điểm"}
      </div>
    </div>
  );
}
