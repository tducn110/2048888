import Button from "@/components/ui/Button";
import type { GameTheme } from "./gameThemes";

interface GameHUDProps {
  score: number;
  bestScore: number;
  scoreDelta: number;
  onReset: () => void;
  theme: GameTheme;
}

export default function GameHUD({ score, bestScore, scoreDelta, onReset, theme }: GameHUDProps) {
  return (
    <GameControls>
      <div className="game-score-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8 }}>
        <ScoreCard label="Điểm" value={score} delta={scoreDelta} theme={theme} />
        <ScoreCard label="Tốt nhất" value={bestScore} theme={theme} />
      </div>
      <div
        className="game-reset-row"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(68px, auto)",
          gap: 8,
          alignItems: "stretch",
          marginLeft: `clamp(0px, 5vw, ${theme.joinPanelMarginLeft}px)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <InstructionCard theme={theme} />
        <NewGameButton onReset={onReset} theme={theme} />
      </div>
    </GameControls>
  );
}

function GameControls({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="game-controls"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

function InstructionCard({ theme }: { theme: GameTheme }) {
  return (
    <div
      className="game-instruction-card"
      style={{
        background: theme.instructionBg,
        borderRadius: 8,
        border: `2px solid ${theme.scoreCardBorder}`,
        color: theme.instructionTextColor,
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontSize: "clamp(8px, 2.6vw, 9px)",
        fontWeight: 800,
        lineHeight: 1.18,
        padding: `7px 8px 7px clamp(8px, 4vw, ${theme.joinPanelPaddingLeft}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: theme.joinPanelJustifyContent,
          minHeight: "clamp(34px, min(12vw, 7dvh), 44px)",
        boxSizing: "border-box",
        textAlign: theme.joinPanelTextAlign,
        letterSpacing: 0,
        boxShadow: "0 2px 0 rgba(48,31,18,0.08)",
      }}
    >
      Ghép số tới 2048!
    </div>
  );
}

function NewGameButton({ onReset, theme }: { onReset: () => void; theme: GameTheme }) {
  return (
    <Button
      className="game-reset-button"
      size="sm"
      variant="primary"
      onClick={onReset}
      aria-label="Gỡ lại"
      style={{
        minWidth: 0,
        minHeight: "clamp(34px, 7dvh, 44px)",
        borderRadius: 8,
        whiteSpace: "normal",
        padding: "4px clamp(7px, 2.7vw, 11px)",
        fontSize: "clamp(10px, 3.4vw, 12px)",
        lineHeight: 1.05,
        background: theme.ctaGradient,
        borderColor: theme.ctaBorder,
        boxShadow: theme.ctaShadow,
      }}
    >
      <span>Gỡ lại</span>
    </Button>
  );
}

function ScoreCard({
  label,
  value,
  delta,
  theme,
}: {
  label: string;
  value: number;
  delta?: number;
  theme: GameTheme;
}) {
  return (
    <div
      className="game-score-card"
      style={{
        flex: 1,
        background: theme.scoreCardBg,
        borderRadius: 8,
        padding: "7px clamp(6px, 2.8vw, 10px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: `2px solid ${theme.scoreCardBorder}`,
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
        minHeight: "clamp(46px, 10dvh, 58px)",
        boxSizing: "border-box",
      }}
    >
      <span
        className="game-score-label"
        style={{
          fontSize: "clamp(8px, 2.8vw, 10px)",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: theme.labelColor,
          textAlign: "center",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {label}
      </span>
      <span
        className="game-score-value"
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(16px, 5.6vw, 21px)",
          color: theme.valueColor,
          lineHeight: 1.1,
          maxWidth: "100%",
          overflowWrap: "anywhere",
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {value.toLocaleString("vi-VN")}
      </span>
      {delta != null && delta > 0 && (
        <span
          className="score-delta"
          key={value}
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            fontSize: 11,
            fontWeight: 700,
            color: theme.ctaBorder,
          }}
        >
          +{delta}
        </span>
      )}
    </div>
  );
}
