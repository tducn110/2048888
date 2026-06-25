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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ScoreCard label="Điểm" value={score} delta={scoreDelta} theme={theme} />
        <ScoreCard label="Tốt nhất" value={bestScore} theme={theme} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 8,
          alignItems: "stretch",
          marginLeft: theme.joinPanelMarginLeft,
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
      style={{
        background: theme.instructionBg,
        borderRadius: 8,
        border: `2px solid ${theme.scoreCardBorder}`,
        color: theme.instructionTextColor,
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontSize: 9,
        fontWeight: 800,
        lineHeight: 1.18,
        padding: `7px 8px 7px ${theme.joinPanelPaddingLeft}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: theme.joinPanelJustifyContent,
        minHeight: 44,
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
      size="sm"
      variant="primary"
      onClick={onReset}
      aria-label="Gỡ lại"
      style={{
        height: "100%",
        minWidth: 84,
        borderRadius: 8,
        whiteSpace: "nowrap",
        padding: "0 11px",
        fontSize: 12,
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
      style={{
        flex: 1,
        background: theme.scoreCardBg,
        borderRadius: 8,
        padding: "7px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: `2px solid ${theme.scoreCardBorder}`,
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
        minHeight: 58,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: theme.labelColor,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize: 21,
          color: theme.valueColor,
          lineHeight: 1.1,
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
            right: 8,
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
