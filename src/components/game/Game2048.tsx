import { useEffect, useRef } from "react";
import { use2048Game } from "@/hooks/use2048Game";
import GameBoard from "./GameBoard";
import GameHeader from "./GameHeader";
import GameHUD from "./GameHUD";
import type { Direction } from "@/types";
import Button from "@/components/ui/Button";
import { Trophy, RefreshCw, AlertTriangle, Settings, User } from "lucide-react";
import { getMaxTile } from "@/utils/gameLogic";
import { useGameAudio } from "@/hooks/useGameAudio";

interface Game2048Props {
  bestScore: number;
  onGameEnd: (score: number, maxTile: number) => void;
  bgId: number;
  setBgId: (id: number) => void;
  onQuit: () => void;
  onSettings: () => void;
  onLeaderboards: () => void;
  onLogin: () => void;
  isGuest: boolean;
  soundEnabled: boolean;
}

export default function Game2048({ bestScore, onGameEnd, bgId, setBgId, onQuit, onSettings, onLeaderboards, onLogin, isGuest, soundEnabled }: Game2048Props) {
  const { tiles, score, scoreDelta, status, moveCount, canUndo, move, reset, undo, continueGame, revive, doubleScore } = use2048Game();
  const { playSfx } = useGameAudio(soundEnabled);

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
    setBgId(Math.floor(Math.random() * 4) + 1);
    playSfx("tap");
    reset();
  };

  const handleSwipe = (dir: Direction) => move(dir);

  const handleUndo = () => {
    playSfx("tap");
    undo();
  };

  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "20px 20px 24px",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 4 }}>
        {/* Mascot */}
        <GameHeader bgId={bgId} />

        {/* Title & Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <h1
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 4vw, 26px)",
              color: "var(--ink-dark)",
              margin: 0,
              lineHeight: 1.2,
              textAlign: "right",
            }}
          >
            Bộ Lạc Đậu Phộng
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button aria-label="Bảng xếp hạng" onClick={() => { playSfx("tap"); onLeaderboards(); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pencil-gray)", padding: 4 }}>
              <Trophy size={20} />
            </button>
            <button aria-label="Cài đặt" onClick={() => { playSfx("tap"); onSettings(); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pencil-gray)", padding: 4 }}>
              <Settings size={20} />
            </button>
            <button aria-label={isGuest ? "Đăng nhập" : "Tài khoản"} onClick={() => { playSfx("tap"); onLogin(); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: isGuest ? "var(--orange-cta-edge)" : "var(--pencil-gray)", padding: 4 }}>
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", marginBottom: 16 }}>
        <GameHUD
          score={score}
          bestScore={bestScore}
          scoreDelta={scoreDelta}
          onReset={handleReset}
          onUndo={handleUndo}
          canUndo={canUndo}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => { playSfx("tap"); onQuit(); }} style={{ fontSize: 13, padding: "4px 12px" }}>
            ← Về Làng
          </Button>
        </div>
      </div>

      {/* Board */}
      <div style={{ position: "relative" }}>
        <GameBoard tiles={tiles} onSwipe={handleSwipe} />

        {/* Overlay: WON */}
        {status === "won" && (
          <GameOverlay
            icon={<Trophy size={40} color="#f0b840" />}
            title="Huyền Thoại!"
            subtitle={`Bạn đã đạt ${score.toLocaleString("vi-VN")} điểm! 🎉`}
            titleColor="var(--mascot-yellow)"
          >
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <Button onClick={() => { playSfx("tap"); doubleScore(); continueGame(); }} size="md" variant="primary">
                ▶ Xem QC x2 Điểm
              </Button>
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => { playSfx("tap"); continueGame(); }} size="md" variant="secondary" style={{ flex: 1 }}>Tiếp tục</Button>
                <Button onClick={handleReset} variant="secondary" size="md" style={{ flex: 1 }}>Ván mới</Button>
              </div>
            </div>
          </GameOverlay>
        )}

        {/* Overlay: LOST */}
        {status === "lost" && (
          <GameOverlay
            icon={<AlertTriangle size={40} color="var(--alert-red)" />}
            title="Hết Đường!"
            subtitle={`Kết quả: ${score.toLocaleString("vi-VN")} điểm`}
            titleColor="var(--alert-red)"
          >
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <Button onClick={() => { playSfx("tap"); recordedRef.current = false; revive(); }} size="md" variant="primary">
                ▶ Xem QC Cứu Hộ (Tiếp tục)
              </Button>
              <Button onClick={handleReset} size="md" variant="secondary">
                <RefreshCw size={16} /> Thử lại
              </Button>
            </div>
          </GameOverlay>
        )}
      </div>

      {/* Controls hint */}
      <p
        style={{
          fontSize: 11,
          color: "var(--ink-dark)",
          textAlign: "center",
          margin: 0,
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}
      >
        ↑ ↓ ← → hoặc WASD để di chuyển • Vuốt màn hình trên mobile
      </p>
    </div>
  );
}

function GameOverlay({
  icon,
  title,
  subtitle,
  titleColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 20,
        background: "rgba(253,246,234,0.93)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        zIndex: 20,
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}
