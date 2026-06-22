import { useEffect, useRef } from "react";
import { use2048Game } from "@/hooks/use2048Game";
import GameBoard from "./GameBoard";
import GameHUD from "./GameHUD";
import type { Direction } from "@/types";
import Button from "@/components/ui/Button";
import { Trophy, RefreshCw, AlertTriangle } from "lucide-react";
import { getMaxTile } from "@/utils/gameLogic";

interface Game2048Props {
  bestScore: number;
  onGameEnd: (score: number, maxTile: number) => void;
}

export default function Game2048({ bestScore, onGameEnd }: Game2048Props) {
  const { tiles, score, scoreDelta, status, canUndo, move, reset, undo, continueGame } = use2048Game();

  // Record game result exactly once per terminal status transition
  const recordedRef = useRef(false);
  useEffect(() => {
    if ((status === "won" || status === "lost") && !recordedRef.current) {
      recordedRef.current = true;
      onGameEnd(score, getMaxTile(tiles));
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    recordedRef.current = false;
    reset();
  };

  const handleSwipe = (dir: Direction) => move(dir);

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
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: -4 }}>
        <span style={{ fontSize: 22 }}>🥜</span>
        <h1
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(18px, 3vw, 24px)",
            color: "var(--ink-dark)",
            margin: 0,
            lineHeight: 1,
          }}
        >
          Bộ Lạc Đậu Phộng
        </h1>
      </div>

      <GameHUD
        score={score}
        bestScore={bestScore}
        scoreDelta={scoreDelta}
        onReset={handleReset}
        onUndo={undo}
        canUndo={canUndo}
      />

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
            <Button onClick={continueGame} size="md">Tiếp tục →</Button>
            <Button onClick={handleReset} variant="secondary" size="md">Ván mới</Button>
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
            <Button onClick={handleReset} size="md">
              <RefreshCw size={16} /> Thử lại
            </Button>
          </GameOverlay>
        )}
      </div>

      {/* Controls hint */}
      <p
        style={{
          fontSize: 11,
          color: "var(--pencil-gray)",
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
