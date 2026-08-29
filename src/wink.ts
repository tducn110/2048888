/**
 * The game's whole connection to Wink.
 *
 * This replaces `src/integrations/wink/` — a 658-line client, a 437-line hook
 * and a 203-line type file that between them re-implemented the handshake, the
 * session, the message validation and the API proxy that the SDK now serves
 * from one URL. None of that was wrong; it was just a copy, and seven other
 * games carried their own copy of the same thing. What is left here is the only
 * part the SDK cannot do: turn four async answers into React state.
 *
 * `window.Wink` is always defined by the time this module runs. The SDK is a
 * classic script in index.html and this is a module, and a module is deferred
 * until after parsing — so the SDK has assigned `window.Wink` before the first
 * line of the app is evaluated, whatever order the tags appear in.
 *
 * Opened from disk with no platform around it, every call still resolves —
 * empty rather than rejected — so the game runs the same either way. That is
 * why nothing here branches on `status`.
 */

import { useCallback, useEffect, useState } from "react";

/** One row of the board. Shaped by the platform, not by this game. */
export interface WinkLeaderboardEntry {
  id: string;
  userId: string | null;
  isAnonymous: boolean;
  rank: number;
  score: number;
  playTime: number | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

interface WinkLeaderboard {
  entries: readonly WinkLeaderboardEntry[];
  me: WinkLeaderboardEntry | null;
  total: number;
}

type WinkEvent = "pause" | "resume" | "mute" | "unmute" | "locale";

/** Only what this game calls. The SDK's surface is larger. */
interface WinkSdk {
  init(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  submitScore(input: number | { score: number; playTime?: number }): Promise<unknown>;
  getLeaderboard(options?: { limit?: number; offset?: number }): Promise<WinkLeaderboard>;
  on(event: WinkEvent, listener: (value?: string) => void): () => void;
  can(capability: "getLeaderboard" | "submitScore" | "complete"): boolean;
  readonly status: "connecting" | "connected" | "online" | "standalone";
}

declare global {
  interface Window {
    Wink: WinkSdk;
  }
}

export interface WinkError {
  code: string;
  message: string;
}

/**
 * What the player is told. Kept in Vietnamese and kept short: the banner is one
 * line over the board, and a player who cannot save a score needs to know that
 * and nothing else.
 */
const MESSAGES: Record<string, string> = {
  CAPABILITY_DENIED: "Thao tác này không được cấp quyền cho phiên hiện tại.",
  SESSION_EXPIRED: "Phiên chơi đã hết hạn.",
  MESSAGE_REJECTED: "Thông điệp từ Wink không hợp lệ.",
  API_NETWORK_ERROR: "Không thể kết nối dịch vụ Wink.",
};

function asWinkError(value: unknown): WinkError {
  const code = (value as { code?: string } | null)?.code ?? "API_NETWORK_ERROR";
  return { code, message: MESSAGES[code] ?? MESSAGES.API_NETWORK_ERROR };
}

/** How many rows the dashboard shows. */
const BOARD_LIMIT = 10;

export interface WinkIntegration {
  hostPaused: boolean;
  parentMuted: boolean;
  leaderboard: readonly WinkLeaderboardEntry[];
  playerEntry: WinkLeaderboardEntry | null;
  bestScore: number;
  error: WinkError | null;
  refreshLeaderboard(): Promise<void>;
  submitScore(score: number, playTimeSec: number): Promise<void>;
}

export function useWink(): WinkIntegration {
  const [hostPaused, setHostPaused] = useState(false);
  const [parentMuted, setParentMuted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<readonly WinkLeaderboardEntry[]>([]);
  const [playerEntry, setPlayerEntry] = useState<WinkLeaderboardEntry | null>(null);
  const [error, setError] = useState<WinkError | null>(null);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const board = await window.Wink.getLeaderboard({ limit: BOARD_LIMIT });
      setLeaderboard(board.entries);
      // `me` is the player's own row, read on every refresh so their best is on
      // screen when the game loads rather than only after they finish a round.
      setPlayerEntry(board.me ?? null);
    } catch {
      // A board that failed to load is not worth a banner: the last one stays
      // on screen, and the next round refreshes it.
    }
  }, []);

  useEffect(() => {
    let live = true;
    const detach: Array<() => void> = [];

    void window.Wink.init().then(() => {
      if (!live) return;
      // Bound after init because `on` replays a pause or a mute that already
      // happened — binding earlier would miss a parent that paused us during
      // the handshake.
      detach.push(window.Wink.on("pause", () => setHostPaused(true)));
      detach.push(window.Wink.on("resume", () => setHostPaused(false)));
      detach.push(window.Wink.on("mute", () => setParentMuted(true)));
      detach.push(window.Wink.on("unmute", () => setParentMuted(false)));
      void refreshLeaderboard();
    });

    return () => {
      live = false;
      for (const off of detach) off();
    };
  }, [refreshLeaderboard]);

  const submitScore = useCallback(
    async (score: number, playTimeSec: number) => {
      try {
        await window.Wink.submitScore({ score, playTime: playTimeSec });
        setError(null);
        await refreshLeaderboard();
      } catch (value) {
        // Refused rather than answered empty, so the player is never shown a
        // rank that does not exist. CAPABILITY_DENIED is the ordinary answer
        // for an anonymous session, and the banner says so.
        setError(asWinkError(value));
      }
    },
    [refreshLeaderboard],
  );

  return {
    hostPaused,
    parentMuted,
    leaderboard,
    playerEntry,
    bestScore: playerEntry?.score ?? 0,
    error,
    refreshLeaderboard,
    submitScore,
  };
}
