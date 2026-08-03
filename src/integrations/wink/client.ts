/**
 * The single Wink adapter for the 2048 game.
 *
 * Wires the game into the certified Wink iframe bridge using only the public
 * `window.WinkBridge` surface. This file holds no credential, no network
 * authority, no browser storage, and no message protocol of its own.
 *
 * 2048 semantic boundaries documented in wink-integration.json:
 *
 *   roundId     — generated at first tile move (first meaningful interaction
 *                 after the "Chơi ngay" unlock button). Stable through any
 *                 revive step within the same game session.
 *   completion  — fired when the player confirms the final game-over (clicks
 *                 "Không" to decline revive, or "Thử lại" to start over).
 *                 Revive keeps the same roundId; the round is not complete yet.
 *   score       — submitted at the same completion boundary, only for
 *                 authenticated users who have the submitScore capability.
 *   pauseResume — the game has no explicit ticker; keyboard/touch input is
 *                 blocked by the inputEnabled prop and audio is suspended.
 *   muteUnmute  — parent mute overrides audio output but does NOT touch the
 *                 player's own music/SFX preference flags stored in state.
 */

import {
  complete,
  getCapabilities,
  getLeaderboard,
  getState,
  onMute,
  onPause,
  onResume,
  onUnmute,
  submitScore,
  subscribe,
  type CompletionInput,
  type LeaderboardOptions,
  type LeaderboardResponse,
  type SubmitScoreInput,
  type SubmitScoreResponse,
  type WinkBridgeCapabilities,
  type WinkBridgeState,
} from './wink-bridge';

export interface WinkRound {
  readonly roundId: string;
  readonly startedAtMs: number;
}

export interface WinkLifecycleHandlers {
  onPause?: () => void;
  onResume?: () => void;
  onMute?: () => void;
  onUnmute?: () => void;
}

const DENIED: WinkBridgeCapabilities = Object.freeze({
  getLeaderboard: false,
  submitScore: false,
  complete: false,
});

function newRoundId(): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return cryptoRef.randomUUID();
  }
  // Non-secret correlation id; only used to keep one round's events together.
  const random = Math.random().toString(16).slice(2, 10);
  return `round-${Date.now().toString(16)}-${random}`;
}

export class WinkGameIntegration {
  #completedRounds = new Set<string>();

  #disposers: Array<() => void> = [];

  /**
   * Open a new semantic round.
   *
   * For 2048: call this when the player unlocks audio and makes their first
   * tile move (the first meaningful game action). Keep the returned handle
   * until the round is fully over — including through any "Revive" step.
   */
  startRound(): WinkRound {
    return Object.freeze({
      roundId: newRoundId(),
      startedAtMs: Date.now(),
    });
  }

  /**
   * Report the semantic end of a round exactly once.
   *
   * For 2048: call this when the player clicks "Không" (decline revive) and
   * the final results overlay appears, OR immediately when they click "Thử lại"
   * (new game). Safe to call multiple times: only the first call per round
   * reaches the parent. Returns `true` on the first call, `false` thereafter.
   */
  completeRound(
    round: WinkRound,
    extra: Omit<CompletionInput, 'roundId' | 'playDurationMs'> & {
      playDurationMs?: number;
    } = {},
  ): boolean {
    if (this.#completedRounds.has(round.roundId)) {
      return false;
    }
    this.#completedRounds.add(round.roundId);

    const { playDurationMs, ...rest } = extra;
    complete({
      roundId: round.roundId,
      playDurationMs: Math.max(
        0,
        Math.round(playDurationMs ?? Date.now() - round.startedAtMs),
      ),
      ...rest,
    });
    return true;
  }

  /**
   * Submit the final qualifying score.
   *
   * For 2048: call this at the same moment as `completeRound` — when the
   * player declines revive or starts over after the game is fully over. This
   * is independent from completion: do not call one from the other.
   *
   * An anonymous player has no submitScore capability; the bridge rejects with
   * `CAPABILITY_DENIED` before any network I/O. Surface that error in the UI;
   * never substitute a local success.
   */
  submitFinalScore(input: SubmitScoreInput): Promise<SubmitScoreResponse> {
    return submitScore(input);
  }

  refreshLeaderboard(
    options?: LeaderboardOptions,
  ): Promise<LeaderboardResponse> {
    return getLeaderboard(options);
  }

  get capabilities(): WinkBridgeCapabilities {
    return getCapabilities() ?? DENIED;
  }

  get state(): WinkBridgeState | null {
    return getState();
  }

  /** True when the current identity may persist a score. */
  get canSubmitScore(): boolean {
    return this.capabilities.submitScore === true;
  }

  observe(listener: (state: WinkBridgeState) => void): () => void {
    const stop = subscribe(listener);
    this.#disposers.push(stop);
    return stop;
  }

  /**
   * Bind the parent's pause/resume and mute/unmute signals to the game.
   *
   * For 2048:
   * - Pause: disable keyboard/touch input (via inputEnabled prop) and suspend
   *   AudioContext. Do NOT reset the board or round.
   * - Resume: re-enable input and resume AudioContext.
   * - Mute: silence bgm and sfx gain nodes without changing the player's own
   *   musicEnabled/sfxEnabled preferences.
   * - Unmute: restore audio output to the player's preference level.
   */
  bindLifecycle(handlers: WinkLifecycleHandlers): () => void {
    const stops: Array<() => void> = [];
    if (handlers.onPause) stops.push(onPause(handlers.onPause));
    if (handlers.onResume) stops.push(onResume(handlers.onResume));
    if (handlers.onMute) stops.push(onMute(handlers.onMute));
    if (handlers.onUnmute) stops.push(onUnmute(handlers.onUnmute));

    const stopAll = () => stops.forEach((stop) => stop());
    this.#disposers.push(stopAll);
    return stopAll;
  }

  dispose(): void {
    this.#disposers.forEach((stop) => stop());
    this.#disposers = [];
    this.#completedRounds.clear();
  }
}

export const winkGame = new WinkGameIntegration();
