/**
 * useWinkIntegration — connects the 2048 game to the Wink platform bridge.
 *
 * Full typed implementation for the 2048 Wink iframe contract.
 * Exposes a WinkIntegration handle with:
 *   - phase / capabilities / state / error — bridge state projection
 *   - hostPaused / parentMuted — lifecycle signals
 *   - leaderboard — cached leaderboard entries
 *   - refreshLeaderboard / submitFinalScore / completeRound — operations
 *
 * Offline mode (VITE_WINK_OFFLINE_MODE=true, dev only) bypasses the bridge
 * for local development. It does NOT certify the iframe/security contract.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createWinkGameClient,
  getInstalledWinkBridge,
  WinkGameClientError,
} from "./client";
import type {
  RedactedWinkState,
  WinkCapabilities,
  WinkIntegration,
  WinkIntegrationError,
  WinkIntegrationErrorCode,
  WinkLeaderboardEntry,
  WinkGameClient,
  WinkSubmitScoreResult,
} from "./types";

const EMPTY_CAPABILITIES: WinkCapabilities = Object.freeze({
  getLeaderboard: false,
  submitScore: false,
  complete: false,
});

const OFFLINE_STATE: RedactedWinkState = Object.freeze({
  phase: "ready_anonymous",
  gameId: null,
  environment: "dev",
  sessionId: null,
  identityType: "anonymous",
  capabilities: EMPTY_CAPABILITIES,
  expiresAt: null,
  lifecycle: Object.freeze({ paused: false, muted: false }),
  error: null,
});

const SAFE_ERROR_MESSAGES: Record<WinkIntegrationErrorCode, string> = {
  PARENT_REQUIRED: "Mini-game phải được mở trong iframe Wink.",
  BRIDGE_READY_TIMEOUT: "Không thể khởi tạo kết nối với Wink.",
  PROTOCOL_MISMATCH: "Phiên bản giao thức Wink không tương thích.",
  RUNTIME_CONFIG_INVALID: "Cấu hình mini-game không hợp lệ.",
  SESSION_CREATE_FAILED: "Không thể tạo phiên chơi.",
  SESSION_RENEWAL_FAILED: "Không thể gia hạn phiên chơi.",
  SESSION_EXPIRED: "Phiên chơi đã hết hạn.",
  CAPABILITY_DENIED: "Thao tác này không được cấp quyền cho phiên hiện tại.",
  API_NETWORK_ERROR: "Không thể kết nối dịch vụ Wink.",
  MESSAGE_REJECTED: "Thông điệp từ Wink không hợp lệ.",
  BRIDGE_MISSING: "Wink bridge chưa được cài đặt.",
  INVALID_SCORE: "Điểm số cuối không hợp lệ.",
  INVALID_ROUND: "Mã vòng chơi không hợp lệ.",
};

export function isOfflineModeEnabled(input: {
  dev: boolean;
  flag: string | undefined;
}): boolean {
  return input.dev === true && input.flag === "true";
}

function safeError(
  value: unknown,
  fallbackCode: WinkIntegrationErrorCode = "API_NETWORK_ERROR",
): WinkIntegrationError {
  const candidateCode =
    value instanceof WinkGameClientError
      ? value.code
      : typeof value === "object" &&
          value !== null &&
          "code" in value
        ? (value as { code?: unknown }).code
        : value;
  const code = isIntegrationErrorCode(candidateCode)
    ? candidateCode
    : fallbackCode;
  const retryable =
    value instanceof WinkGameClientError
      ? value.retryable
      : code === "API_NETWORK_ERROR" || code === "BRIDGE_READY_TIMEOUT";
  return Object.freeze({
    code,
    retryable,
    message: SAFE_ERROR_MESSAGES[code],
  });
}

function isIntegrationErrorCode(value: unknown): value is WinkIntegrationErrorCode {
  return (
    typeof value === "string" &&
    Object.hasOwn(SAFE_ERROR_MESSAGES, value)
  );
}

function stateWithError(
  state: RedactedWinkState,
  error: WinkIntegrationError | null,
): RedactedWinkState {
  return Object.freeze({
    ...state,
    error,
    lifecycle: Object.freeze({ ...state.lifecycle }),
    capabilities: Object.freeze({ ...state.capabilities }),
  });
}

function stateWithLifecycle(
  state: RedactedWinkState,
  lifecycle: Partial<RedactedWinkState["lifecycle"]>,
): RedactedWinkState {
  return stateWithError(
    {
      ...state,
      lifecycle: Object.freeze({ ...state.lifecycle, ...lifecycle }),
    },
    errorFromState(state),
  );
}

function errorFromState(state: RedactedWinkState): WinkIntegrationError | null {
  return state.error ? safeError(state.error) : null;
}

function initialConnection(): {
  client: WinkGameClient | null;
  state: RedactedWinkState;
  error: WinkIntegrationError | null;
} {
  const bridge = getInstalledWinkBridge();
  if (!bridge) {
    const error = safeError(undefined, "BRIDGE_MISSING");
    return {
      client: null,
      state: stateWithError(
        Object.freeze({
          phase: "error",
          gameId: null,
          environment: null,
          sessionId: null,
          identityType: null,
          capabilities: EMPTY_CAPABILITIES,
          expiresAt: null,
          lifecycle: Object.freeze({ paused: false, muted: false }),
          error: null,
        }),
        error,
      ),
      error,
    };
  }

  try {
    const client = createWinkGameClient(bridge);
    const state = client.getState();
    return { client, state, error: state.error };
  } catch (value) {
    const error = safeError(value, "MESSAGE_REJECTED");
    return {
      client: null,
      state: stateWithError(
        Object.freeze({
          phase: "error",
          gameId: null,
          environment: null,
          sessionId: null,
          identityType: null,
          capabilities: EMPTY_CAPABILITIES,
          expiresAt: null,
          lifecycle: Object.freeze({ paused: false, muted: false }),
          error: null,
        }),
        error,
      ),
      error,
    };
  }
}

function readBuildFlag(): boolean {
  return isOfflineModeEnabled({
    dev: import.meta.env.DEV === true,
    flag: import.meta.env.VITE_WINK_OFFLINE_MODE,
  });
}

type WinkConnectionSnapshot = Readonly<{
  client: WinkGameClient | null;
  state: RedactedWinkState;
  error: WinkIntegrationError | null;
}>;

function initializeConnection(offline: boolean): WinkConnectionSnapshot {
  if (offline) {
    return {
      client: null,
      state: OFFLINE_STATE,
      error: null,
    };
  }
  return initialConnection();
}

export function useWinkIntegration(): WinkIntegration {
  const offline = readBuildFlag();
  const [connection] = useState<WinkConnectionSnapshot>(() =>
    initializeConnection(offline),
  );
  const [state, setState] = useState<RedactedWinkState>(connection.state);
  const [error, setError] = useState<WinkIntegrationError | null>(
    connection.error,
  );
  const [parentPaused, setParentPaused] = useState(
    connection.state.lifecycle.paused,
  );
  const [documentHidden, setDocumentHidden] = useState(
    () => typeof document !== "undefined" && Boolean(document.hidden),
  );
  const [windowBlurred, setWindowBlurred] = useState(false);
  const hostPaused = parentPaused || documentHidden || windowBlurred;
  const parentPausedRef = useRef(parentPaused);
  const documentHiddenRef = useRef(documentHidden);
  const windowBlurredRef = useRef(windowBlurred);
  const getEffectivePaused = () =>
    parentPausedRef.current || documentHiddenRef.current || windowBlurredRef.current;

  const [parentMuted, setParentMuted] = useState(
    connection.state.lifecycle.muted,
  );
  const [leaderboard, setLeaderboard] = useState<
    readonly WinkLeaderboardEntry[]
  >([]);
  const [playerEntry, setPlayerEntry] = useState<WinkLeaderboardEntry | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    let active = true;
    const client = connection.client;
    const cleanups: Array<() => void> = [];

    const handleWindowBlur = () => {
      windowBlurredRef.current = true;
      setWindowBlurred(true);
      setState((current) => stateWithLifecycle(current, { paused: getEffectivePaused() }));
    };

    const handleWindowFocus = () => {
      windowBlurredRef.current = false;
      setWindowBlurred(false);
      setState((current) => stateWithLifecycle(current, { paused: getEffectivePaused() }));
    };

    const handleVisibilityChange = () => {
      const isHidden = Boolean(document.hidden);
      documentHiddenRef.current = isHidden;
      setDocumentHidden(isHidden);
      setState((current) => stateWithLifecycle(current, { paused: getEffectivePaused() }));
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    cleanups.push(() => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    if (client) {
      const applyState = (next: RedactedWinkState) => {
        const projectedError = next.error ? safeError(next.error) : null;
        const nextParentPaused = next.lifecycle.paused;
        parentPausedRef.current = nextParentPaused;
        setParentPaused(nextParentPaused);
        const effective = getEffectivePaused();
        setState(
          stateWithError(
            {
              ...next,
              lifecycle: { ...next.lifecycle, paused: effective },
            },
            projectedError,
          ),
        );
        setError(projectedError);
        setParentMuted(next.lifecycle.muted);
      };

      try {
        cleanups.push(client.subscribe(applyState));
        cleanups.push(
          client.onPause(() => {
            parentPausedRef.current = true;
            setParentPaused(true);
            setState((current) => stateWithLifecycle(current, { paused: getEffectivePaused() }));
          }),
        );
        cleanups.push(
          client.onResume(() => {
            parentPausedRef.current = false;
            setParentPaused(false);
            setState((current) => stateWithLifecycle(current, { paused: getEffectivePaused() }));
          }),
        );
      cleanups.push(
        client.onMute(() => {
          setParentMuted(true);
          setState((current) => stateWithLifecycle(current, { muted: true }));
        }),
      );
      cleanups.push(
        client.onUnmute(() => {
          setParentMuted(false);
          setState((current) => stateWithLifecycle(current, { muted: false }));
        }),
      );
      } catch (value) {
        const nextError = safeError(value, "MESSAGE_REJECTED");
        cleanups.splice(0).forEach((cleanup) => cleanup());
        queueMicrotask(() => {
          if (!active) return;
          setError(nextError);
          setState((current) => stateWithError(current, nextError));
        });
      }
    }

    return () => {
      active = false;
      cleanups.splice(0).forEach((cleanup) => {
        try {
          cleanup();
        } catch {
          // Cleanup must not turn a normal React unmount into an integration error.
        }
      });
    };
  }, [connection]);

  const recordError = useCallback((value: unknown, fallback?: WinkIntegrationErrorCode) => {
    const nextError = safeError(value, fallback);
    setError(nextError);
    setState((current) => stateWithError(current, nextError));
    return nextError;
  }, []);


  const fetchPersonalBest = useCallback(async () => {
    if (offline) return;
    if (!connection.client) return; // Silent return, handled elsewhere
    try {
      const { me } = await connection.client.getPersonalBest();
      if (me) {
        setPlayerEntry(me);
        setDisplayName(me.displayName);
        setBestScore((current) => Math.max(current, me.score));
      }
    } catch (value) {
      // API_NETWORK_ERROR or CAPABILITY_DENIED can be ignored for personal best
      // so it doesn't interrupt the game
      console.warn('[Wink] fetchPersonalBest failed:', value);
    }
  }, [connection, offline]);

  const refreshLeaderboard = useCallback(async () => {
    if (offline) {
      setLeaderboard([]);
      return;
    }
    if (!connection.client) {
      throw recordError(undefined, "BRIDGE_MISSING");
    }
    if (!state.capabilities.getLeaderboard) {
      throw recordError(undefined, "CAPABILITY_DENIED");
    }
    try {
      const entries = await connection.client.getLeaderboard({ limit: 100 });
      setLeaderboard(entries);
      setBestScore((current) => {
        const remoteBest = playerEntry?.score ?? 0;
        return Math.max(current, remoteBest);
      });
      setError(null);
      setState((current) => stateWithError(current, null));
    } catch (value) {
      throw recordError(value);
    }
  }, [connection, offline, playerEntry?.score, recordError, state.capabilities.getLeaderboard]);

  const submitFinalScore = useCallback(
    async (input: {
      roundId: string;
      score: number;
      playTimeSec: number;
      qualifies: boolean;
      metadata?: Record<string, string | number | boolean>;
    }): Promise<WinkSubmitScoreResult | null> => {
      if (!input.qualifies || offline) return null;
      if (!connection.client) {
        throw recordError(undefined, "BRIDGE_MISSING");
      }
      if (!state.capabilities.submitScore) {
        throw recordError(undefined, "CAPABILITY_DENIED");
      }
      try {
        const result = await connection.client.submitScore({
          score: input.score,
          playTime: input.playTimeSec,
          metadata: { roundId: input.roundId, ...(input.metadata ?? {}) },
        });
        setPlayerEntry(result.entry);
        setDisplayName(result.entry.displayName);
        setBestScore(
          result.isNewBest
            ? result.entry.score
            : result.previousBest ?? result.entry.score,
        );
        await refreshLeaderboard();
        setError(null);
        setState((current) => stateWithError(current, null));
        return result;
      } catch (value) {
        throw recordError(value);
      }
    },
    [connection, offline, recordError, refreshLeaderboard, state.capabilities.submitScore],
  );

  const completeRound = useCallback(
    async (input: { roundId: string; playDurationMs: number }) => {
      if (offline) return;
      if (!connection.client) {
        throw recordError(undefined, "BRIDGE_MISSING");
      }
      if (!state.capabilities.complete) {
        throw recordError(undefined, "CAPABILITY_DENIED");
      }
      try {
        await connection.client.complete(input);
        setError(null);
        setState((current) => stateWithError(current, null));
      } catch (value) {
        throw recordError(value);
      }
    },
    [connection, offline, recordError, state.capabilities.complete],
  );

  const projectedState = stateWithError(state, error);
  return {
    mode: offline ? "offline" : "wink",
    phase: projectedState.phase,
    capabilities: projectedState.capabilities,
    state: projectedState,
    client: connection.client,
    hostPaused,
    parentMuted,
    error,
    leaderboard,
    playerEntry,
    displayName,
    bestScore,
    refreshLeaderboard,
    fetchPersonalBest,
    submitFinalScore,
    completeRound,
  };
}
