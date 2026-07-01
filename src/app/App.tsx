import { useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import { useLocalStats } from "@/hooks/useLocalStats";
import Settings from "@/components/screens/Settings";
import { useGameAudio } from "@/hooks/useGameAudio";

type Screen = "game" | "settings";

export default function App() {
  const { stats, recordGame } = useLocalStats();
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("game");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const { playSfx } = useGameAudio(musicEnabled, sfxEnabled);
  const keepGameMounted = screen === "game" || screen === "settings";

  return (
    <div style={{
      height: "100dvh",
      width: "100vw",
      overflowX: "hidden",
      overflowY: "auto",
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
      <main style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 460,
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {keepGameMounted && (
          <>
            <div style={{ display: screen === "game" ? "block" : "none" }}>
              <Game2048 
                bestScore={stats.bestScore} 
                onGameEnd={(score) => {
                  recordGame(score);
                }} 
                bgId={bgId} 
                setBgId={setBgId} 
                onSettings={() => setScreen("settings")}
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
