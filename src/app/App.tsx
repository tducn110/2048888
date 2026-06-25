import { useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import { useLocalStats } from "@/hooks/useLocalStats";
import Login from "@/components/screens/Login";
import Dashboard from "@/components/screens/Dashboard";
import Leaderboards from "@/components/screens/Leaderboards";
import Settings from "@/components/screens/Settings";
import { getNextGameThemeId } from "@/components/game/gameThemes";

type Screen = "login" | "dashboard" | "game" | "leaderboards" | "settings";

export default function App() {
  const { stats, recordGame } = useLocalStats();
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("game");
  const [username, setUsername] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const keepGameMounted = screen === "game" || screen === "settings" || screen === "leaderboards";

  const handleLogin = (name: string) => {
    setUsername(name);
    setScreen("dashboard");
  };

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
        maxWidth: screen === "dashboard" ? 520 : 460,
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {screen === "login" && (
          <Login 
            onLogin={handleLogin} 
            onPlayGuest={() => {
              setBgId((current) => getNextGameThemeId(current));
              setScreen("game");
            }} 
          />
        )}
        
        {screen === "dashboard" && (
          <Dashboard 
            username={username || "Khách"} 
            bestScore={stats.bestScore} 
            stats={stats}
            onPlay={() => {
              setBgId((current) => getNextGameThemeId(current));
              setScreen("game");
            }} 
          />
        )}

        {keepGameMounted && (
          <>
            <div style={{ display: screen === "game" ? "block" : "none" }}>
              <Game2048 
                bestScore={stats.bestScore} 
                onGameEnd={(score, maxTile) => {
                  // Only save if the user is logged in
                  if (username) {
                    recordGame(score, maxTile);
                  }
                }} 
                bgId={bgId} 
                setBgId={setBgId} 
                onSettings={() => setScreen("settings")}
                onDashboard={() => setScreen("dashboard")}
                onLeaderboards={() => setScreen("leaderboards")}
                musicEnabled={musicEnabled}
                sfxEnabled={sfxEnabled}
                inputEnabled={screen === "game"}
              />
            </div>

            {screen === "leaderboards" && (
              <Leaderboards stats={stats} username={username} onBack={() => setScreen("game")} />
            )}

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
