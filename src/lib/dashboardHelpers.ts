import type { WinkLeaderboardEntry } from "@/integrations/wink/types";

export const BADGE_COLORS = [
  { bg: "#f0b840", border: "#c8941a", text: "#2a2418", label: "Vang" },
  { bg: "#d0c4a0", border: "#a8a080", text: "#2a2418", label: "Bac" },
  { bg: "#d99258", border: "#a86e38", text: "#fff8ee", label: "Dong" },
] as const;

export interface RankedLeaderboardEntry {
  name: string;
  score: number;
  maxTile: number;
  isLocal?: boolean;
  rank: number | null;
}

export interface RemoteLeaderboardModel {
  topEntries: RankedLeaderboardEntry[];
  currentPlayer: RankedLeaderboardEntry | null;
}

export function buildRemoteModel(
  entries: readonly WinkLeaderboardEntry[],
  player: WinkLeaderboardEntry | null,
  t: (key: string) => string
): RemoteLeaderboardModel {
  const ranked = entries.map((entry) => ({
    name: entry.displayName ?? (entry.isAnonymous ? t("dashboard.anonymous") : t("dashboard.player")),
    score: entry.score,
    maxTile: entry.maxTile ?? 0,
    isLocal: player?.id === entry.id,
    rank: entry.rank,
  }));
  const playerRow = player
    ? {
        name: player.displayName ?? (player.isAnonymous ? t("dashboard.anonymous") : t("dashboard.player")),
        score: player.score,
        maxTile: player.maxTile ?? 0,
        isLocal: true,
        rank: player.rank,
      }
    : null;
  return { topEntries: ranked.slice(0, 10), currentPlayer: playerRow };
}
