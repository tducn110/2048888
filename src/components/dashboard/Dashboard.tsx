import { Medal, Trophy, Star, Hash, Clock } from "lucide-react";
import type { LocalStats, HistoryEntry } from "@/types";
import { getTileConfig } from "@/constants/tileConfig";
import { BADGE_COLORS, getRank, buildLeaderboard } from "@/lib/dashboardHelpers";

interface DashboardProps {
  stats: LocalStats;
}



export default function Dashboard({ stats }: DashboardProps) {
  const statCards = [
    { label: "Cao Nhất", value: stats.bestScore.toLocaleString("vi-VN"), icon: Trophy, color: "var(--mascot-yellow)" },
    { label: "Lần Trước", value: stats.lastScore.toLocaleString("vi-VN"), icon: Clock, color: "var(--bamboo-green)" },
    { label: "Tổng Ván", value: stats.totalGames.toString(), icon: Hash, color: "var(--orange-cta)" },
    { label: "Danh Hiệu", value: getRank(stats.bestScore), icon: Star, color: "var(--alert-red)" },
  ];

  const combined = buildLeaderboard(stats);

  return (
    <section
      id="dashboard"
      style={{
        padding: "60px 24px",
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pencil-gray)", marginBottom: 8 }}>
          🏆 Bảng Điểm
        </p>
        <h2
          style={{
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 38px)",
            color: "var(--ink-dark)",
            margin: 0,
            textShadow: "0 2px 0 rgba(255,255,255,0.6)",
          }}
        >
          Hành Trình Của Bạn
        </h2>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              background: "var(--cream-card)",
              borderRadius: 18,
              padding: "18px 20px",
              border: "2px solid rgba(42,36,24,0.1)",
              boxShadow: "0 2px 12px rgba(42,36,24,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pencil-gray)" }}>
                {label}
              </span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 26, color: "var(--ink-dark)", lineHeight: 1 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Leaderboard + History */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {/* Leaderboard */}
        <div
          style={{
            background: "var(--cream-card)",
            borderRadius: 20,
            border: "2px dashed rgba(42,36,24,0.15)",
            padding: "22px 20px",
          }}
        >
          <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--ink-dark)", margin: "0 0 18px" }}>
            Bảng Xếp Hạng
          </h3>
          {combined.length === 0 ? (
            <EmptyState text="Chưa có điểm số nào. Hãy chơi ngay!" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {combined.map((entry, i) => {
                const badge = BADGE_COLORS[i] ?? null;
                const tileCfg = getTileConfig(entry.maxTile);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "isLocal" in entry && entry.isLocal ? "rgba(232,116,50,0.07)" : i < 3 ? `${badge!.bg}18` : "rgba(42,36,24,0.04)",
                      border: "isLocal" in entry && entry.isLocal ? "1.5px solid rgba(232,116,50,0.2)" : "none",
                    }}
                  >
                    {/* Rank badge */}
                    {i < 3 ? (
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: badge!.bg, border: `2px solid ${badge!.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Medal size={13} color={badge!.text} />
                      </div>
                    ) : (
                      <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--pencil-gray)" }}>#{i + 1}</span>
                      </div>
                    )}

                    {/* Name */}
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ink-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.name}
                    </span>

                    {/* Max tile */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: tileCfg.colorBg, color: tileCfg.colorText }}>
                      {entry.maxTile}
                    </span>

                    {/* Score */}
                    <span style={{ fontWeight: 800, fontSize: 14, color: "var(--ink-dark)", minWidth: 60, textAlign: "right" }}>
                      {entry.score.toLocaleString("vi-VN")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History */}
        <div
          style={{
            background: "var(--cream-card)",
            borderRadius: 20,
            border: "2px dashed rgba(42,36,24,0.15)",
            padding: "22px 20px",
          }}
        >
          <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--ink-dark)", margin: "0 0 18px" }}>
            Lịch Sử Ván Chơi
          </h3>
          {stats.history.length === 0 ? (
            <EmptyState text="Chưa có ván nào hoàn thành. Bắt đầu ngay!" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.history.slice(0, 10).map((entry: HistoryEntry, i: number) => (
                <HistoryRow key={i} entry={entry} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HistoryRow({ entry, index }: { entry: HistoryEntry; index: number }) {
  const tileCfg = getTileConfig(entry.maxTile);
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 10,
        background: index === 0 ? "rgba(240,184,64,0.1)" : "rgba(42,36,24,0.04)",
        border: index === 0 ? "1.5px solid rgba(240,184,64,0.3)" : "none",
      }}
    >
      {index === 0 && <span style={{ fontSize: 14 }}>🥇</span>}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--ink-dark)" }}>
            {entry.score.toLocaleString("vi-VN")}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: tileCfg.colorBg, color: tileCfg.colorText }}>
            {tileCfg.label}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--pencil-gray)" }}>
          {dateStr} lúc {timeStr}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
      <p style={{ fontSize: 13, color: "var(--pencil-gray)", margin: 0 }}>{text}</p>
    </div>
  );
}
