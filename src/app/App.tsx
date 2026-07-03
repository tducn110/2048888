import { useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import { useLocalStats } from "@/hooks/useLocalStats";
import Dashboard from "@/components/screens/Dashboard";
import Settings from "@/components/screens/Settings";
import { useGameAudio } from "@/hooks/useGameAudio";

type Screen = "dashboard" | "game" | "settings";

export default function App() {
  const { stats, recordGame } = useLocalStats();
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const { playSfx } = useGameAudio(musicEnabled, sfxEnabled);
  const keepGameMounted = screen === "game" || screen === "settings";

  return (
    <div className="app-shell" style={{
      minHeight: "100svh",
      height: "100dvh",
      width: "100vw",
      maxWidth: "100vw",
      overflowX: "hidden",
      overflowY: "hidden",
      overscrollBehavior: "none",
      background: "var(--rice-paper)",
      fontFamily: "'Be Vietnam Pro', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      position: "relative",
    }}>
      <CountrysideBackdrop themeId={bgId} />

      {/* Main content */}
      <main className={screen === "game" ? "app-main app-main--game" : "app-main"} style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: screen === "dashboard" ? 520 : 460,
        minHeight: 0,
        height: "100%",
        padding: "max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left))",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}>
        {screen === "dashboard" && (
          <Dashboard
            username="Khách"
            bestScore={stats.bestScore}
            stats={stats}
            onPlay={() => setScreen("game")}
          />
        )}

        {keepGameMounted && (
          <>
            <div className="game-screen-slot" style={{ display: screen === "game" ? "block" : "none", width: "100%" }}>
              <Game2048 
                bestScore={stats.bestScore} 
                onGameEnd={(score, maxTile) => {
                  recordGame(score, maxTile);
                }} 
                bgId={bgId} 
                setBgId={setBgId} 
                onSettings={() => setScreen("settings")}
                onDashboard={() => setScreen("dashboard")}
                playSfx={playSfx}
                inputEnabled={screen === "game"}
              />
            </div>

            {screen === "settings" && (
              <Settings
                musicEnabled={musicEnabled}
                sfxEnabled={sfxEnabled}
                onMusicChange={setMusicEnabled}
                onSfxChange={setSfxEnabled}
                onBack={() => setScreen("game")}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
