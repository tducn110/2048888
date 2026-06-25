/**
 * dashboardHelpers.ts
 * Pure calculation/selector functions extracted from Dashboard.tsx.
 * Phase 4 of refactor plan — no side effects, fully testable.
 */

import type { LocalStats } from "@/types";
import { MOCK_LEADERBOARD } from "@/constants/tileConfig";

// ── Rank badge colours (from design-system-doc.md §5.7) ────────────────────

export const BADGE_COLORS = [
  { bg: "#f0b840", border: "#c8941a", text: "#2a2418", label: "Vàng" },
  { bg: "#d0c4a0", border: "#a8a080", text: "#2a2418", label: "Bạc"  },
  { bg: "#d99258", border: "#a86e38", text: "#fff8ee", label: "Đồng" },
] as const;

// ── Rank label ──────────────────────────────────────────────────────────────

export function getRank(bestScore: number): string {
  if (bestScore >= 10000) return "Huyền Thoại";
  if (bestScore >= 5000)  return "Cao Thủ";
  if (bestScore >= 2000)  return "Lãng Tử";
  if (bestScore >= 500)   return "Tập Sự";
  return "Mầm Non";
}

// ── Combined leaderboard ────────────────────────────────────────────────────

export interface LeaderboardEntry {
  name: string;
  score: number;
  maxTile: number;
  isLocal?: boolean;
}

export interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number | null;
}

export interface LeaderboardModel {
  topEntries: RankedLeaderboardEntry[];
  currentPlayer: RankedLeaderboardEntry | null;
}

function getBestLocalEntry(stats: LocalStats, playerName: string): LeaderboardEntry | null {
  const bestHistory = stats.history.reduce<LocalStats["history"][number] | null>((best, entry) => {
    if (!best || entry.score > best.score) return entry;
    return best;
  }, null);

  if (!bestHistory && stats.bestScore <= 0) return null;

  return {
    name: playerName || "Người chơi",
    score: Math.max(stats.bestScore, bestHistory?.score ?? 0),
    maxTile: bestHistory?.maxTile ?? 0,
    isLocal: true,
  };
}

export function buildLeaderboardModel(stats: LocalStats, playerName = "Người chơi"): LeaderboardModel {
  const localBest = getBestLocalEntry(stats, playerName);
  const leaderboardEntries: LeaderboardEntry[] = [...MOCK_LEADERBOARD, ...(localBest ? [localBest] : [])];
  const ranked: RankedLeaderboardEntry[] = leaderboardEntries
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const topEntries = ranked.slice(0, 10);
  const currentPlayer = localBest
    ? ranked.find((entry) => entry.isLocal && entry.score === localBest.score) ?? null
    : { name: playerName || "Người chơi", score: 0, maxTile: 0, isLocal: true, rank: null };

  return {
    topEntries,
    currentPlayer: currentPlayer && !topEntries.some((entry) => entry.isLocal) ? currentPlayer : null,
  };
}

export function buildLeaderboard(stats: LocalStats): LeaderboardEntry[] {
  const localEntries: LeaderboardEntry[] = stats.history.slice(0, 3).map((h, i) => ({
    name: `Tôi (ván ${stats.totalGames - i})`,
    score: h.score,
    maxTile: h.maxTile,
    isLocal: true,
  }));

  return [...MOCK_LEADERBOARD, ...localEntries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
