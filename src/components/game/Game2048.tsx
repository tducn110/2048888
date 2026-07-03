import { useEffect, useRef } from "react";
import { use2048Game } from "@/hooks/use2048Game";
import GameBoard from "./GameBoard";
import GameHeader from "./GameHeader";
import GameHUD from "./GameHUD";
import type { Direction } from "@/types";
import Button from "@/components/ui/Button";
import { Trophy, RefreshCw, AlertTriangle, ChartColumnBig, Settings } from "lucide-react";
import type { GameSfx } from "@/hooks/useGameAudio";
import { getMaxTile } from "@/utils/gameLogic";
import { getGameTheme, getNextGameThemeId, type GameTheme } from "./gameThemes";

interface Game2048Props {
  bestScore: number;
  onGameEnd: (score: number, maxTile: number) => void;
  bgId: number;
  setBgId: (id: number) => void;
  onSettings: () => void;
  onDashboard: () => void;
  playSfx: (name: GameSfx) => void;
  inputEnabled?: boolean;
}

export default function Game2048({ bestScore, onGameEnd, bgId, setBgId, onSettings, onDashboard, playSfx, inputEnabled = true }: Game2048Props) {
  const { tiles, score, scoreDelta, status, moveCount, move, reset, continueGame, revive, doubleScore } = use2048Game(inputEnabled);
  const theme = getGameTheme(bgId);

  // Record game result exactly once per terminal status transition
  const recordedRef = useRef(false);
  const previousMoveCountRef = useRef(0);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    if ((status === "won" || status === "lost") && !recordedRef.current) {
      recordedRef.current = true;
      onGameEnd(score, getMaxTile(tiles));
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status !== previousStatusRef.current) {
      if (status === "won") playSfx("win");
      if (status === "lost") playSfx("lose");
      previousStatusRef.current = status;
    }
  }, [playSfx, status]);

  useEffect(() => {
    if (previousMoveCountRef.current === 0) {
      previousMoveCountRef.current = moveCount;
      return;
    }

    if (moveCount > previousMoveCountRef.current) {
      playSfx(scoreDelta > 0 ? "merge" : "move");
    }
    previousMoveCountRef.current = moveCount;
  }, [moveCount, playSfx, scoreDelta]);

  const handleReset = () => {
    recordedRef.current = false;
    setBgId(getNextGameThemeId(bgId));
    reset();
  };

  const handleSwipe = (dir: Direction) => {
    if (inputEnabled) move(dir);
  };

  return (
    <div
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
            ariaLabel="Mở bảng điểm"
            onClick={onDashboard}
            theme={theme}
          >
            <ChartColumnBig size={21} />
          </IconButton>
          <IconButton
            ariaLabel="Cài đặt"
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
          <GameBoard tiles={tiles} onSwipe={handleSwipe} background={theme.boardBg} />

          {/* Overlay: WON */}
          {status === "won" && (
            <GameOverlay
              icon={<Trophy size={40} color="#f0b840" />}
              title="Huyền Thoại!"
              subtitle={`Bạn đã đạt ${score.toLocaleString("vi-VN")} điểm`}
              titleColor="#d09a25"
              theme={theme}
            >
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                <Button
                  onClick={() => { doubleScore(); continueGame(); }}
                  size="md"
                  variant="primary"
                  style={{ background: theme.ctaGradient, borderColor: theme.ctaBorder, boxShadow: theme.ctaShadow }}
                >
                  ▶ Xem QC x2 Điểm
                </Button>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Button onClick={continueGame} size="md" variant="secondary" style={{ flex: 1 }}>Tiếp tục</Button>
                  <Button onClick={handleReset} variant="secondary" size="md" style={{ flex: 1 }}>Ván mới</Button>
                </div>
              </div>
            </GameOverlay>
          )}

          {/* Overlay: LOST */}
          {status === "lost" && (
            <GameOverlay
              icon={<AlertTriangle size={40} color={theme.danger} />}
              title="Hết Đường!"
              subtitle={`Kết quả: ${score.toLocaleString("vi-VN")} điểm`}
              titleColor={theme.danger}
              theme={theme}
            >
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                <Button
                  onClick={() => { recordedRef.current = false; revive(); }}
                  size="md"
                  variant="primary"
                  style={{ background: theme.ctaGradient, borderColor: theme.ctaBorder, boxShadow: theme.ctaShadow }}
                >
                  ▶ Xem QC Cứu Hộ (Tiếp tục)
                </Button>
                <Button onClick={handleReset} size="md" variant="secondary">
                  <RefreshCw size={16} /> Thử lại
                </Button>
              </div>
            </GameOverlay>
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

function GameOverlay({
  icon,
  title,
  subtitle,
  titleColor,
  theme,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleColor: string;
  theme: GameTheme;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 20,
        background: theme.overlayBg,
        backdropFilter: "blur(4px)",
        padding: "clamp(8px, 3vw, 16px)",
        boxSizing: "border-box",
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 22,
          background: theme.overlayPanelBg,
          border: `2px solid ${theme.overlayPanelBorder}`,
          boxShadow: "0 10px 24px rgba(58,38,17,0.16), 0 2px 0 rgba(255,255,255,0.74) inset",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(10px, 3.4vw, 14px)",
          padding: "clamp(12px, 4vw, 22px)",
          boxSizing: "border-box",
      }}
    >
      {icon}
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(22px, 7vw, 28px)",
            lineHeight: 1.08,
            color: titleColor,
            margin: "0 0 6px",
            textShadow: "0 2px 0 rgba(255,255,255,0.6)",
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: "clamp(12px, 3.8vw, 14px)", color: "var(--pencil-gray)", margin: 0, fontWeight: 500, lineHeight: 1.35 }}>
          {subtitle}
        </p>
      </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280, minWidth: 0 }}>
        {children}
      </div>
      </div>
    </div>
  );
}
