/**
 * useWinkIntegration — connects the 2048 game to the Wink platform bridge.
 *
 * Exposes only what the game components need:
 *   - winkPaused   : boolean  → gate inputEnabled and audio
 *   - winkMuted    : boolean  → mute audio output without touching user prefs
 *   - winkReady    : boolean  → bridge is in a ready phase
 *   - canSubmitScore: boolean → identity has submitScore capability
 *   - onRoundStart : call at first tile move after audio unlock
 *   - onGameEnd    : call when final game-over is confirmed (decline revive or reset)
 *   - onScoreDoubled: call when x2 score is applied before final submission
 *
 * All Wink SDK interaction stays in this file; no other file imports from the
 * integrations/wink directory except this hook and the test suite.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { winkGame } from "@/integrations/wink/client";
import type { WinkRound } from "@/integrations/wink/client";

export interface WinkIntegrationState {
  winkPaused: boolean;
  winkMuted: boolean;
  winkReady: boolean;
  canSubmitScore: boolean;
  onRoundStart: () => void;
  onGameEnd: (score: number, playTimeMs: number, doubled: boolean) => void;
}

export function useWinkIntegration(): WinkIntegrationState {
  const [winkPaused, setWinkPaused] = useState(false);
  const [winkMuted, setWinkMuted] = useState(false);
  const [canSubmitScore, setCanSubmitScore] = useState(false);
  const [winkReady, setWinkReady] = useState(false);

  const roundRef = useRef<WinkRound | null>(null);

  // Observe bridge state changes
  useEffect(() => {
    const stop = winkGame.observe((state) => {
      const phase = state.phase;
      const ready = phase === "ready_anonymous" || phase === "ready_authenticated" || phase === "renewing";
      setWinkReady(ready);
      setCanSubmitScore(state.capabilities.submitScore === true);
      // Sync lifecycle from bridge state snapshot too
      setWinkPaused(state.lifecycle.paused);
      setWinkMuted(state.lifecycle.muted);
    });
    return stop;
  }, []);

  // Bind lifecycle callbacks
  useEffect(() => {
    const stop = winkGame.bindLifecycle({
      onPause: () => setWinkPaused(true),
      onResume: () => setWinkPaused(false),
      onMute: () => setWinkMuted(true),
      onUnmute: () => setWinkMuted(false),
    });
    return stop;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      winkGame.dispose();
    };
  }, []);

  /**
   * Call when the player makes their first tile move after audio unlock.
   * Opens a new semantic round and stores the handle.
   */
  const onRoundStart = useCallback(() => {
    if (roundRef.current) return; // round already active
    roundRef.current = winkGame.startRound();
  }, []);

  /**
   * Call when the final game-over is confirmed.
   *
   * @param score     - the final score (possibly doubled)
   * @param playTimeMs - elapsed ms since round start (pass 0 if unknown)
   * @param doubled   - whether the x2 bonus was applied
   *
   * Submits score (if authenticated) and completes the round — both are
   * independent operations; neither triggers the other internally.
   */
  const onGameEnd = useCallback(
    async (score: number, playTimeMs: number, doubled: boolean) => {
      const round = roundRef.current;

      // Complete the round first (independent from score)
      if (round) {
        winkGame.completeRound(round, {
          playDurationMs: playTimeMs,
          metadata: { outcome: "lost", doubled },
        });
        roundRef.current = null;
      }

      // Then submit score (independent; will throw CAPABILITY_DENIED for anon)
      if (winkGame.canSubmitScore) {
        try {
          await winkGame.submitFinalScore({
            score,
            playTime: Math.round(playTimeMs / 1000),
            gameMode: "classic",
            metadata: { doubled },
          });
        } catch (err: unknown) {
          // CAPABILITY_DENIED is expected for anonymous — surface only if
          // it's an unexpected error
          const code = (err as { code?: string })?.code;
          if (code !== "CAPABILITY_DENIED") {
            console.error("[Wink] submitScore failed", err);
          }
        }
      }
    },
    []
  );

  return {
    winkPaused,
    winkMuted,
    winkReady,
    canSubmitScore,
    onRoundStart,
    onGameEnd,
  };
}
