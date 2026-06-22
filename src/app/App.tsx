import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import Game2048 from "@/components/game/Game2048";
import { useLocalStats } from "@/hooks/useLocalStats";

export default function App() {
  const { stats, recordGame } = useLocalStats();

  return (
    <div style={{ 
      height: "100dvh", 
      width: "100vw", 
      overflow: "hidden", 
      background: "var(--rice-paper)", 
      fontFamily: "'Be Vietnam Pro', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      {/* Countryside SVG backdrop — fixed behind content */}
      <CountrysideBackdrop />

      {/* Main content */}
      <main style={{ 
        position: "relative", 
        zIndex: 1, 
        width: "100%", 
        maxWidth: 460, 
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>
        {/* Game Layout */}
        <Game2048 bestScore={stats.bestScore} onGameEnd={recordGame} />
      </main>
    </div>
  );
}
