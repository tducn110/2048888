import { useEffect, useRef } from "react";
import { use2048Game } from "@/hooks/use2048Game";
import GameBoard from "./GameBoard";
import GameHeader from "./GameHeader";
import GameHUD from "./GameHUD";
import type { Direction } from "@/types";
import Button from "@/components/ui/Button";
import { Trophy, RefreshCw, AlertTriangle, Settings } from "lucide-react";
import type { GameSfx } from "@/hooks/useGameAudio";
import { getGameTheme, getNextGameThemeId, type GameTheme } from "./gameThemes";

interface Game2048Props {
  bestScore: number;
  onGameEnd: (score: number) => void;
  bgId: number;
  setBgId: (id: number) => void;
  onSettings: () => void;
  playSfx: (name: GameSfx) => void;
  inputEnabled?: boolean;
}

export default function Game2048({ bestScore, onGameEnd, bgId, setBgId, onSettings, playSfx, inputEnabled = true }: Game2048Props) {
  const { tiles, score, scoreDelta, status, moveCount, move, reset, continueGame, revive, doubleScore } = use2048Game(inputEnabled);
  const theme = getGameTheme(bgId);

  // Record game result exactly once per terminal status transition
  const recordedRef = useRef(false);
  const previousMoveCountRef = useRef(0);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    if ((status === "won" || status === "lost") && !recordedRef.current) {
      recordedRef.current = true;
      onGameEnd(score);
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
      style={{
        background: theme.panelBackground,
        border: `2px solid ${theme.panelBorder}`,
        borderRadius: 28,
        boxShadow: theme.panelShadow,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        padding: "14px 14px 18px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          display: "flex",
          gap: 8,
          zIndex: 2,
        }}
      >
        <IconButton
          ariaLabel="Cài đặt"
          onClick={onSettings}
          theme={theme}
        >
          <Settings size={22} />
        </IconButton>
      </div>

      <h1
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(40px, 11vw, 58px)",
          color: theme.titleColor,
          margin: "0 96px 0 0",
          lineHeight: 0.95,
          textAlign: "center",
          letterSpacing: 0,
          textShadow: theme.titleShadow,
        }}
      >
        2048
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "118px 1fr", alignItems: "end", width: "100%", columnGap: 9, boxSizing: "border-box" }}>
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
        style={{
          background: theme.boardFrameBg,
          borderRadius: 16,
          padding: 8,
          border: `3px solid ${theme.boardFrameBorder}`,
          boxShadow: "0 3px 0 rgba(115,76,38,0.18) inset",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Board */}
        <div style={{ position: "relative" }}>
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
                <div style={{ display: "flex", gap: 8 }}>
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
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
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
        padding: 16,
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
        gap: 14,
          padding: 22,
          boxSizing: "border-box",
      }}
    >
      {icon}
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: titleColor,
            margin: "0 0 6px",
            textShadow: "0 2px 0 rgba(255,255,255,0.6)",
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 14, color: "var(--pencil-gray)", margin: 0, fontWeight: 500 }}>
          {subtitle}
        </p>
      </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
        {children}
      </div>
      </div>
    </div>
  );
}
