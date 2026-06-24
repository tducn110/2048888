import { RotateCcw, Undo2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface GameHUDProps {
  score: number;
  bestScore: number;
  scoreDelta: number;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function GameHUD({ score, bestScore, scoreDelta, onReset, onUndo, canUndo }: GameHUDProps) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Score row */}
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
        <ScoreCard label="Điểm" value={score} delta={scoreDelta} highlight />
        <ScoreCard label="Cao nhất" value={bestScore} />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingBottom: 2 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
            style={{ padding: "8px 10px" }}
          >
            <Undo2 size={15} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onReset}
            aria-label="Ván mới"
          >
            <RotateCcw size={14} />
            <span>Mới</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  delta,
  highlight,
}: {
  label: string;
  value: number;
  delta?: number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: highlight ? "var(--orange-cta)" : "rgba(42,36,24,0.1)",
        borderRadius: 14,
        padding: "8px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: highlight ? "2px solid var(--orange-cta-edge)" : "1.5px solid rgba(42,36,24,0.1)",
        position: "relative",
        overflow: "hidden",
        minWidth: 80,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: highlight ? "var(--ink-dark)" : "var(--ink-dark)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: highlight ? "#fff8ee" : "var(--ink-dark)",
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
            color: highlight ? "#fff8ee" : "var(--orange-cta)",
          }}
        >
          +{delta}
        </span>
      )}
    </div>
  );
}
