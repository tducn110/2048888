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
