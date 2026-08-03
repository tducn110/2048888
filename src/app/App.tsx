import { useEffect, useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import { useLocalStats } from "@/hooks/useLocalStats";
import Dashboard from "@/components/screens/Dashboard";
import Settings from "@/components/screens/Settings";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useWinkIntegration } from "@/hooks/useWinkIntegration";

type Screen = "dashboard" | "game" | "settings";

export default function App() {
  const { stats, recordGame, updateLastGameScore } = useLocalStats();
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("game");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const { playSfx, audioStatus, unlockAudio, setParentMuted } = useGameAudio(musicEnabled, sfxEnabled);
  const keepGameMounted = screen === "game" || screen === "settings";

  // Wink bridge integration
  const {
    winkPaused,
    winkMuted,
    onRoundStart,
    onGameEnd: winkOnGameEnd,
  } = useWinkIntegration();

  // Apply parent mute to audio engine without touching user prefs
  useEffect(() => {
    setParentMuted(winkMuted);
  }, [winkMuted, setParentMuted]);

  // inputEnabled: game requires audio to be ready AND not wink-paused AND on the game screen
  const inputEnabled = screen === "game" && audioStatus === "ready" && !winkPaused;

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
                onGameEnd={(score, maxTile, playTimeMs, doubled) => {
                  recordGame(score, maxTile);
                  winkOnGameEnd(score, playTimeMs, doubled);
                }} 
                onScoreDoubled={(newScore) => {
                  updateLastGameScore(newScore);
                }} 
                onRoundStart={onRoundStart}
                bgId={bgId} 
                setBgId={setBgId} 
                onSettings={() => setScreen("settings")}
                onDashboard={() => setScreen("dashboard")}
                playSfx={playSfx}
                audioStatus={audioStatus}
                unlockAudio={unlockAudio}
                inputEnabled={inputEnabled}
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
