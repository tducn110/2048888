import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { use2048Game } from "@/hooks/use2048Game";
import GameBoard from "./GameBoard";
import GameHeader from "./GameHeader";
import GameHUD from "./GameHUD";
import type { Direction } from "@/types";
import Button from "@/components/ui/Button";
import { ChartColumnBig, Settings, Loader2, Clapperboard } from "lucide-react";
import type { GameSfx } from "@/hooks/useGameAudio";
import { getMaxTile } from "@/utils/gameLogic";
import { getGameTheme, getNextGameThemeId, type GameTheme } from "./gameThemes";
import { showRewardedVideo } from "@/integrations/ads/googleH5Ads";
interface Game2048Props {
  bestScore: number;
  onGameEnd: (score: number, maxTile: number, playTimeMs: number, doubled: boolean) => void;
  bgId: number;
  setBgId: (id: number) => void;
  onSettings: () => void;
  onDashboard: () => void;
  playSfx: (name: GameSfx) => void;
  audioStatus: "idle" | "loading" | "ready";
  unlockAudio: () => void;
  inputEnabled?: boolean;
  rendererPaused?: boolean;
  onScoreDoubled?: (newScore: number) => void;
  onRoundStart?: () => void;
}
export default function Game2048({ bestScore, onGameEnd, bgId, setBgId, onSettings, onDashboard, playSfx, audioStatus, unlockAudio, inputEnabled = true, rendererPaused = false, onScoreDoubled, onRoundStart }: Game2048Props) {
  const { t } = useTranslation();
  const { tiles, score, scoreDelta, status, hasReached2048, moveCount, celebrationMilestone, move, reset, revive, doubleScore } = use2048Game(inputEnabled);
  const theme = getGameTheme(bgId);
  // Record game result exactly once per terminal status transition
  const recordedRef = useRef(false);
  const previousMoveCountRef = useRef(0);
  const previousStatusRef = useRef(status);
  // Track play time for Wink score submission
  const roundStartMsRef = useRef<number | null>(null);
  const roundStartedRef = useRef(false);
  const [showContinue, setShowContinue] = useState(true);
  const [isScoreDoubled, setIsScoreDoubled] = useState(false);
  const [pendingDoubleScore, setPendingDoubleScore] = useState(0);
  const [adPending, setAdPending] = useState(false);
  // Explicit round finalizer called by an end-game or manual-reset action.
  const finalizeRound = (scoreToRecord?: number, doubled = isScoreDoubled) => {
    if (!roundStartedRef.current || recordedRef.current) return;
    recordedRef.current = true;
    const playTimeMs = roundStartMsRef.current ? Date.now() - roundStartMsRef.current : 0;
    const finalScore = scoreToRecord ?? (doubled ? (pendingDoubleScore || score) : score);
    onGameEnd(finalScore, getMaxTile(tiles), playTimeMs, doubled);
  };
  useEffect(() => {
    if (status !== previousStatusRef.current) {
      if (status === "lost") playSfx("lose");
      previousStatusRef.current = status;
    }
  }, [playSfx, status]);
  useEffect(() => {
    if (celebrationMilestone && status !== "lost") {
      playSfx("win");
    }
  }, [celebrationMilestone, playSfx, status]);

  useEffect(() => {
    if (previousMoveCountRef.current === 0 && moveCount === 1) {
      // First actual move — start the Wink round (covers keyboard input path)
      if (!roundStartedRef.current) {
        roundStartedRef.current = true;
        roundStartMsRef.current = Date.now();
        onRoundStart?.();
      }
      previousMoveCountRef.current = moveCount;
      playSfx(scoreDelta > 0 ? "merge" : "move");
      return;
    }
    if (moveCount > previousMoveCountRef.current) {
      playSfx(scoreDelta > 0 ? "merge" : "move");
    }
    previousMoveCountRef.current = moveCount;
  }, [moveCount, playSfx, scoreDelta, onRoundStart]);
  const handleReset = () => {
    // Finalize active round on manual reset or ending game over
    finalizeRound();
    recordedRef.current = false;
    roundStartedRef.current = false;
    roundStartMsRef.current = null;
    setShowContinue(true);
    setIsScoreDoubled(false);
    setPendingDoubleScore(0);
    setBgId(getNextGameThemeId(bgId));
    reset();
  };
  const handleRevive = async () => {
    if (adPending) return;
    setAdPending(true);
    const rewarded = await showRewardedVideo({ name: "revive_after_loss" });
    setAdPending(false);
    setShowContinue(false);
    if (!rewarded) return;
    revive();
  };
  const gameCardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleSwipe = (dir: Direction) => {
    if (inputEnabled) {
      // The move-count effect starts the round only after the reducer accepts a move.
      move(dir);
    }
  };
  const handleSwipeRef = useRef(handleSwipe);
  useEffect(() => {
    handleSwipeRef.current = handleSwipe;
  });
  useEffect(() => {
    if (!inputEnabled || status !== "playing") {
      return;
    }
    const targetElement: HTMLElement =
      (gameCardRef.current?.closest(".app-main--game") as HTMLElement | null) ??
      (gameCardRef.current?.closest(".game-screen-slot") as HTMLElement | null) ??
      gameCardRef.current ??
      document.body;
    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'button, a, input, textarea, select, [role="button"], [data-no-game-swipe]'
        )
      );
    };
    const handleStart = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (isInteractive(target)) {
        touchStartRef.current = null;
        return;
      }
      touchStartRef.current = { x: clientX, y: clientY };
    };
    const handleMove = (e: Event) => {
      if (touchStartRef.current && e.cancelable) {
        e.preventDefault();
      }
    };
    const handleEnd = (clientX: number, clientY: number) => {
      if (!touchStartRef.current) return;
      const start = touchStartRef.current;
      touchStartRef.current = null;
      const dx = clientX - start.x;
      const dy = clientY - start.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const THRESHOLD = 24;
      if (Math.max(absDx, absDy) < THRESHOLD) return;
      if (absDx > absDy) {
        handleSwipeRef.current(dx > 0 ? "right" : "left");
      } else {
        handleSwipeRef.current(dy > 0 ? "down" : "up");
      }
    };
    const handleCancel = () => {
      touchStartRef.current = null;
    };
    let wheelCooldownTimer: ReturnType<typeof setTimeout> | null = null;
    let wheelAccumResetTimer: ReturnType<typeof setTimeout> | null = null;
    let wheelAccumX = 0;
    let wheelAccumY = 0;
    const onWheel = (e: WheelEvent) => {
      if (isInteractive(e.target)) return;
      if (e.cancelable) e.preventDefault();
      if (wheelCooldownTimer) {
        clearTimeout(wheelCooldownTimer);
        wheelCooldownTimer = setTimeout(() => {
          wheelCooldownTimer = null;
        }, 200);
        return;
      }
      if (wheelAccumResetTimer) clearTimeout(wheelAccumResetTimer);
      wheelAccumResetTimer = setTimeout(() => {
        wheelAccumX = 0;
        wheelAccumY = 0;
      }, 100);
      wheelAccumX += e.deltaX;
      wheelAccumY += e.deltaY;
      const absX = Math.abs(wheelAccumX);
      const absY = Math.abs(wheelAccumY);
      const WHEEL_THRESHOLD = 40;
      if (Math.max(absX, absY) >= WHEEL_THRESHOLD) {
        if (absX > absY) {
          handleSwipeRef.current(wheelAccumX > 0 ? "left" : "right");
        } else {
          handleSwipeRef.current(wheelAccumY > 0 ? "up" : "down");
        }
        wheelAccumX = 0;
        wheelAccumY = 0;
        wheelCooldownTimer = setTimeout(() => {
          wheelCooldownTimer = null;
        }, 200);
      }
    };
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0]?.clientX || 0, e.touches[0]?.clientY || 0, e.target);
    const onTouchMove = (e: TouchEvent) => handleMove(e);
    const onTouchEnd = (e: TouchEvent) => handleEnd(e.changedTouches[0]?.clientX || 0, e.changedTouches[0]?.clientY || 0);
    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY, e.target);
    const onMouseMove = (e: MouseEvent) => handleMove(e);
    const onMouseUp = (e: MouseEvent) => handleEnd(e.clientX, e.clientY);
    targetElement.addEventListener("touchstart", onTouchStart, { passive: true });
    targetElement.addEventListener("touchmove", onTouchMove, { passive: false });
    targetElement.addEventListener("touchend", onTouchEnd, { passive: true });
    targetElement.addEventListener("touchcancel", handleCancel, { passive: true });
    targetElement.addEventListener("mousedown", onMouseDown, { passive: true });
    targetElement.addEventListener("mousemove", onMouseMove, { passive: false });
    targetElement.addEventListener("mouseup", onMouseUp, { passive: true });
    targetElement.addEventListener("mouseleave", handleCancel, { passive: true });
    targetElement.addEventListener("wheel", onWheel as EventListener, { passive: false });
    window.addEventListener("blur", handleCancel, { passive: true });
    return () => {
      if (wheelCooldownTimer) clearTimeout(wheelCooldownTimer);
      if (wheelAccumResetTimer) clearTimeout(wheelAccumResetTimer);
      targetElement.removeEventListener("touchstart", onTouchStart);
      targetElement.removeEventListener("touchmove", onTouchMove);
      targetElement.removeEventListener("touchend", onTouchEnd);
      targetElement.removeEventListener("touchcancel", handleCancel);
      targetElement.removeEventListener("mousedown", onMouseDown);
      targetElement.removeEventListener("mousemove", onMouseMove);
      targetElement.removeEventListener("mouseup", onMouseUp);
      targetElement.removeEventListener("mouseleave", handleCancel);
      targetElement.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("blur", handleCancel);
    };
  }, [inputEnabled, status]);
  return (
    <div
      ref={gameCardRef}
      className="game-card"
      style={{
        background: theme.panelBackground,
        border: `2px solid ${theme.panelBorder}`,
        borderRadius: 28,
        boxShadow: theme.panelShadow,
        display: "flex",
        flexDirection: "column",
        gap: "clamp(7px, 1.8dvh, 14px)",
        position: "relative",
        width: "100%",
        maxWidth: "min(390px, calc(100dvh - 156px - env(safe-area-inset-top) - env(safe-area-inset-bottom)))",
        maxHeight: "calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        margin: "0 auto",
        padding: "clamp(8px, 2dvh, 14px) clamp(10px, 3.6vw, 14px) clamp(10px, 2.4dvh, 18px)",
        boxSizing: "border-box",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <div
        className="game-title-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          width: "100%",
          position: "relative",
          zIndex: 3,
        }}
      >
        <h1
          className="game-title"
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(30px, min(13vw, 8dvh), 58px)",
            color: theme.titleColor,
            margin: 0,
            lineHeight: 0.95,
            textAlign: "left",
            letterSpacing: 0,
            textShadow: theme.titleShadow,
            whiteSpace: "nowrap",
          }}
        >
          2048
        </h1>
        <div
          className="game-card-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            zIndex: 2,
          }}
        >
          <IconButton
            ariaLabel={t("dashboard.leaderboard")}
            onClick={onDashboard}
            theme={theme}
          >
            <ChartColumnBig size={21} />
          </IconButton>
          <IconButton
            ariaLabel={t("settings.title")}
            onClick={onSettings}
            theme={theme}
          >
            <Settings size={22} />
          </IconButton>
        </div>
      </div>
      <div className="game-header-row" style={{ display: "grid", gridTemplateColumns: "clamp(64px, min(28vw, 18dvh), 118px) minmax(0, 1fr)", alignItems: "end", width: "100%", columnGap: "clamp(6px, 2.4vw, 9px)", boxSizing: "border-box" }}>
        <GameHeader bgId={bgId} />
        <div style={{ width: "100%", paddingBottom: 2 }}>
          <GameHUD
            score={score}
            bestScore={bestScore}
            scoreDelta={scoreDelta}
            onReset={handleReset}
            theme={theme}
          />
        </div>
      </div>
      <div
        className="game-board-frame"
        style={{
          background: theme.boardFrameBg,
          borderRadius: 16,
          padding: "clamp(5px, 1.3dvh, 8px)",
          border: `3px solid ${theme.boardFrameBorder}`,
          boxShadow: "0 3px 0 rgba(115,76,38,0.18) inset",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Board */}
        <div className="game-board-shell" style={{ position: "relative" }}>
          <GameBoard
            tiles={tiles}
            onSwipe={handleSwipe}
            background={theme.boardBg}
            paused={rendererPaused}
            celebrationMilestone={celebrationMilestone}
          />
          {/* Audio Unlock Overlay */}
          {audioStatus !== "ready" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
                cursor: "default",
                borderRadius: 12,
              }}
            >
              {audioStatus === "idle" ? (
                <Button
                  type="button"
                  size="md"
                  variant="primary"
                  onClick={unlockAudio}
                  style={{
                    minWidth: 132,
                    color: "#fff8ee",
                    background: theme.ctaGradient,
                    borderColor: theme.ctaBorder,
                    boxShadow: theme.ctaShadow,
                    animation: "mascotBreathe 2s infinite",
                  }}
                >
                  {t("game.playNow")}
                </Button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--wood-dark)" }}>
                  <Loader2 size={36} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {t("game.loadingAudio")}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Overlay: LOST (Continue / Final Results) */}
          {status === "lost" && (
            <GameDecisionOverlay
              mode={showContinue ? "revive" : "final"}
              score={score}
              adPending={adPending}
              theme={theme}
              t={t}
              onContinue={handleRevive}
              onDecline={() => setShowContinue(false)}
              onDouble={
                isScoreDoubled
                  ? undefined
                  : async () => {
                      if (adPending) return;
                      setAdPending(true);
                      const rewarded = await showRewardedVideo({ name: "double_final_score" });
                      setAdPending(false);
                      if (!rewarded) {
                        alert("Không có video quảng cáo vào lúc này.");
                        return;
                      }
                      const doubled = score * 2;
                      setPendingDoubleScore(doubled);
                      setIsScoreDoubled(true);
                      doubleScore();
                      onScoreDoubled?.(doubled);
                    }
              }
              onEnd={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
function IconButton({
  ariaLabel,
  onClick,
  theme,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  theme: GameTheme;
  children: React.ReactNode;
}) {
  return (
    <button
      className="game-icon-button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: "clamp(36px, 11vw, 40px)",
        height: "clamp(36px, 11vw, 40px)",
        minWidth: 36,
        borderRadius: "50%",
        border: `2px solid ${theme.settingsBorder}`,
        background: theme.settingsBg,
        color: theme.settingsColor,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        boxShadow: "0 3px 0 rgba(48,31,18,0.2)",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
interface GameDecisionOverlayProps {
  mode: "revive" | "final";
  score: number;
  onContinue: () => void;
  onDecline: () => void;
  onDouble?: () => void;
  onEnd: () => void;
  theme: GameTheme;
  adPending: boolean;
  t: TFunction;
}

function GameDecisionOverlay({ mode, score, onContinue, onDecline, onDouble, onEnd, theme, adPending, t }: GameDecisionOverlayProps) {
  const cardStyle = {
    width: "100%",
    maxWidth: 320,
    background: theme.overlayPanelBg,
    border: `2px solid ${theme.overlayPanelBorder}`,
    borderRadius: 28,
    boxShadow: "0 10px 32px rgba(58,38,17,0.18), 0 2px 0 rgba(255,255,255,0.7) inset",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(24px, 6vw, 32px) clamp(16px, 4vw, 24px)",
    gap: "clamp(20px, 5vw, 28px)",
    boxSizing: "border-box",
  } as const;
  const textColor = "var(--wood-dark)";
  const renderRewardButton = (label: string, onClick: () => void) => (
    <Button
      onClick={onClick}
      disabled={adPending}
      size="md"
      variant="primary"
      style={{
        width: "100%",
        background: theme.ctaGradient,
        borderColor: theme.ctaBorder,
        boxShadow: theme.ctaShadow,
        height: 54,
        fontSize: 18,
        borderRadius: 27,
      }}
    >
      <Clapperboard size={22} strokeWidth={2.5} />
      {label}
    </Button>
  );
  const renderSecondaryButton = (label: string, onClick: () => void) => (
    <Button
      onClick={onClick}
      disabled={adPending}
      size="md"
      variant="secondary"
      style={{
        width: "100%",
        height: 54,
        fontSize: 18,
        borderRadius: 27,
        background: "rgba(255,255,255,0.9)",
        fontWeight: 600,
        color: textColor,
      }}
    >
      {label}
    </Button>
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        background: theme.overlayBg,
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(16px, 4vw, 24px)",
        boxSizing: "border-box",
      }}
    >
      <div style={cardStyle}>
        {mode === "revive" ? (
          <>
            <div
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(36px, 8vw, 42px)",
                lineHeight: 1.1,
                color: textColor,
                textShadow: "0 2px 0 rgba(255,255,255,0.6)",
                textAlign: "center",
              }}
            >
              {t('game.youLost')}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
              {renderRewardButton(t('game.continuePlaying'), onContinue)}
              {renderSecondaryButton(t('game.no'), onDecline)}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(42px, 10vw, 56px)",
                  lineHeight: 1,
                  color: textColor,
                  textShadow: "0 2px 0 rgba(255,255,255,0.6)",
                }}
              >
                {score.toLocaleString("vi-VN")}
              </div>
              <div
                style={{
                  fontSize: "clamp(16px, 4vw, 20px)",
                  fontWeight: 700,
                  color: "var(--pencil-gray)",
                  letterSpacing: 1,
                }}
              >
                {t('game.score')}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
              {!onDouble ? null : renderRewardButton(t('game.x2Score'), onDouble)}
              {renderSecondaryButton(t('game.end'), onEnd)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
