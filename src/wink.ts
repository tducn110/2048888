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

import { useCallback, useEffect, useRef, useState } from "react";

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
  maxTile?: number | null;
}

interface WinkLeaderboard {
  entries: readonly WinkLeaderboardEntry[];
  me: WinkLeaderboardEntry | null;
  total: number;
}

type WinkEvent = "pause" | "resume" | "mute" | "unmute" | "locale";

interface WinkPersonalBest {
  me: WinkLeaderboardEntry | null;
}

/** Only what this game calls after the canonical SDK has initialized. */
interface WinkApi {
  readonly locale?: string;
  readonly muted?: boolean;
  gameplayStart(): void;
  gameplayStop(): void;
  submitScore(input: number | { score: number; playTime?: number }): Promise<unknown>;
  getLeaderboard(options?: { limit?: number; offset?: number }): Promise<WinkLeaderboard>;
  getPersonalBest(): Promise<WinkPersonalBest>;
  on(event: WinkEvent, listener: (value?: string) => void): () => void;
  can(capability: "getLeaderboard" | "submitScore"): boolean;
  readonly status: "connecting" | "connected" | "online" | "standalone";
}

interface WinkBootstrap {
  init(): Promise<WinkApi | void>;
}

declare global {
  interface Window {
    Wink: WinkBootstrap & Partial<WinkApi>;
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

function resolveWinkApi(initialized: WinkApi | void): WinkApi {
  if (initialized && typeof initialized.getLeaderboard === "function") {
    return initialized;
  }
  return window.Wink as WinkApi;
}

export interface WinkIntegration {
  readyPromise: Promise<void>;
  hostPaused: boolean;
  parentMuted: boolean;
  leaderboard: readonly WinkLeaderboardEntry[];
  playerEntry: WinkLeaderboardEntry | null;
  bestScore: number;
  error: WinkError | null;
  refreshLeaderboard(): Promise<void>;
  submitScore(score: number, playTimeSec: number): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
}

let globalInitPromise: Promise<WinkApi> | null = null;
let globalReadyPromise: Promise<void> | null = null;
let boundWinkInstance: unknown = null;

function getWinkInitPromise(): Promise<WinkApi> {
  const currentWink = typeof window !== "undefined" ? window.Wink : undefined;
  if (!globalInitPromise || boundWinkInstance !== currentWink) {
    boundWinkInstance = currentWink;
    globalInitPromise = Promise.resolve()
      .then(() => (typeof window !== "undefined" && window.Wink?.init ? window.Wink.init() : undefined))
      .then(resolveWinkApi);
    globalReadyPromise = globalInitPromise.then(() => undefined).catch(() => undefined);
  }
  return globalInitPromise;
}

function getWinkReadyPromise(): Promise<void> {
  getWinkInitPromise();
  return globalReadyPromise ?? Promise.resolve();
}

export function useWink(): WinkIntegration {
  const sdkRef = useRef<WinkApi | null>(null);
  const initPromise = getWinkInitPromise();
  const readyPromise = getWinkReadyPromise();

  const [hostPaused, setHostPaused] = useState(false);
  const [parentMuted, setParentMuted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<readonly WinkLeaderboardEntry[]>([]);
  const [playerEntry, setPlayerEntry] = useState<WinkLeaderboardEntry | null>(null);
  const [error, setError] = useState<WinkError | null>(null);

  const refreshLeaderboard = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    let playerFromBoard: WinkLeaderboardEntry | null | undefined;

    if (sdk.can("getLeaderboard")) {
      try {
        const board = await sdk.getLeaderboard({ limit: BOARD_LIMIT });
        setLeaderboard(board.entries);
        // `me` is the player's own row, read on every refresh so their best is
        // on screen when the game loads rather than only after they finish a round.
        playerFromBoard = board.me ?? null;
      } catch {
        // A board that failed to load is not worth a banner: the last one stays
        // on screen, and the next round refreshes it.
      }
    } else {
      setLeaderboard([]);
      playerFromBoard = null;
    }

    try {
      const personalBest = await sdk.getPersonalBest();
      setPlayerEntry(personalBest.me ?? playerFromBoard ?? null);
    } catch {
      // Personal-best failure is non-fatal. Keep the board-derived row when it
      // was available, otherwise leave the last rendered row untouched.
      if (playerFromBoard !== undefined) {
        setPlayerEntry(playerFromBoard);
      }
    }
  }, []);

  useEffect(() => {
    let live = true;
    const detach: Array<() => void> = [];

    void initPromise.then((sdk) => {
      if (!live || !sdk) return;
      sdkRef.current = sdk;
      setParentMuted(Boolean(sdk.muted));
      // Bound after init because `on` replays a pause or a mute that already
      // happened — binding earlier would miss a parent that paused us during
      // the handshake.
      detach.push(sdk.on("pause", () => setHostPaused(true)));
      detach.push(sdk.on("resume", () => setHostPaused(false)));
      detach.push(sdk.on("mute", () => setParentMuted(true)));
      detach.push(sdk.on("unmute", () => setParentMuted(false)));
      // ponytail: game i18n owns language authority (English default, manual user toggle). Drain host event:
      detach.push(sdk.on("locale", () => {}));
      void refreshLeaderboard();
    });

    return () => {
      live = false;
      for (const off of detach) off();
      sdkRef.current = null;
    };
  }, [refreshLeaderboard, initPromise]);

  const gameplayStart = useCallback(() => {
    void initPromise.then((sdk) => sdk?.gameplayStart?.());
  }, [initPromise]);

  const gameplayStop = useCallback(() => {
    void initPromise.then((sdk) => sdk?.gameplayStop?.());
  }, [initPromise]);

  const submitScore = useCallback(
    async (score: number, playTimeSec: number) => {
      const sdk = sdkRef.current;
      if (!sdk) return;

      if (!sdk.can("submitScore")) {
        setError(asWinkError({ code: "CAPABILITY_DENIED" }));
        return;
      }

      try {
        await sdk.submitScore({ score, playTime: playTimeSec });
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
    readyPromise,
    hostPaused,
    parentMuted,
    leaderboard,
    playerEntry,
    bestScore: playerEntry?.score ?? 0,
    error,
    refreshLeaderboard,
    submitScore,
    gameplayStart,
    gameplayStop,
  };
}
