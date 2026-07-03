import { Trophy } from "lucide-react";
import type { LocalStats } from "@/types";
import { getTileConfig } from "@/constants/tileConfig";
import { BADGE_COLORS, buildLeaderboardModel, getRank, type RankedLeaderboardEntry } from "@/lib/dashboardHelpers";
import ThemedBackButton from "@/components/ui/ThemedBackButton";

interface DashboardProps {
  username: string;
  bestScore: number;
  stats: LocalStats;
  onPlay: () => void;
}

export default function Dashboard({ username, bestScore, stats, onPlay }: DashboardProps) {
  const { topEntries, currentPlayer } = buildLeaderboardModel(stats, username || "Người chơi");
  const playerInTopTen = topEntries.find((entry) => entry.isLocal) ?? null;
  const playerRow = playerInTopTen ?? currentPlayer;

  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "clamp(18px, 5vw, 26px) clamp(14px, 4vw, 20px)",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        width: "100%",
        maxHeight: "calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(138,125,101,0.1)",
          padding: "17px 20px",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ fontSize: 12, color: "var(--pencil-gray)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Kỷ Lục Của Bạn
        </div>
        <div style={{ fontSize: 32, lineHeight: 1.05, fontWeight: 800, color: "var(--orange-cta-edge)", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {bestScore.toLocaleString("vi-VN")}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-dark)", fontWeight: 800 }}>
          Danh hiệu: {getRank(bestScore)}
        </div>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={19} color="var(--orange-cta-edge)" />
            <h2 style={{ margin: 0, fontSize: 16, lineHeight: 1.2, color: "var(--ink-dark)", fontWeight: 800 }}>
              Ranking 1-10
            </h2>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--pencil-gray)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Top điểm
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", paddingRight: 4 }}>
          {topEntries.map((entry) => (
            <RankingRow key={`${entry.name}-${entry.rank}`} entry={entry} highlight={entry.isLocal} />
          ))}
        </div>
      </section>

      {playerRow && (
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            textAlign: "left",
            background: "linear-gradient(180deg, rgba(232,116,50,0.14) 0%, rgba(240,184,64,0.12) 100%)",
            border: "2px solid rgba(232,116,50,0.28)",
            borderRadius: 16,
            padding: 12,
            boxShadow: "0 2px 0 rgba(255,255,255,0.5) inset",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--orange-cta-edge)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Bảng xếp hạng của bạn
          </div>
          <RankingRow entry={playerRow} highlight label={playerInTopTen ? "Đang ở top 10" : "Hạng của bạn"} />
        </section>
      )}

      <ThemedBackButton
        onClick={onPlay}
        size="lg"
      />
    </div>
  );
}

function RankingRow({
  entry,
  highlight = false,
  label,
}: {
  entry: RankedLeaderboardEntry;
  highlight?: boolean;
  label?: string;
}) {
  const isTopThree = entry.rank != null && entry.rank <= 3;
  const medal = isTopThree ? BADGE_COLORS[entry.rank! - 1] : null;
  const tileConfig = getTileConfig(entry.maxTile);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "42px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 9,
        borderRadius: 12,
        padding: "8px 10px",
        background: highlight
          ? "rgba(232,116,50,0.16)"
          : medal
            ? `linear-gradient(90deg, ${medal.bg}30 0%, rgba(255,255,255,0.18) 100%)`
            : "rgba(138,125,101,0.08)",
        border: highlight
          ? "2px solid rgba(232,116,50,0.45)"
          : medal
            ? `2px solid ${medal.border}55`
            : "2px solid transparent",
        boxShadow: isTopThree ? "0 2px 0 rgba(255,255,255,0.52) inset" : "none",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: medal?.bg ?? "rgba(42,36,24,0.1)",
          border: `2px solid ${medal?.border ?? "rgba(42,36,24,0.08)"}`,
          color: medal?.text ?? "var(--pencil-gray)",
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        {entry.rank ? `#${entry.rank}` : "--"}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "var(--ink-dark)",
            fontSize: 13,
            fontWeight: 800,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          {label && (
            <span style={{ color: "var(--orange-cta-edge)", fontSize: 10, fontWeight: 800 }}>
              {label}
            </span>
          )}
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

      <div style={{ color: "var(--orange-cta-edge)", fontSize: 13, fontWeight: 800, textAlign: "right" }}>
        {entry.score > 0 ? entry.score.toLocaleString("vi-VN") : "Chưa có"}
      </div>
    </div>
  );
}
