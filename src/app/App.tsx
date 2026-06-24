import { Suspense, lazy, useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import { useLocalStats } from "@/hooks/useLocalStats";

const Login = lazy(() => import("@/components/screens/Login"));
const Dashboard = lazy(() => import("@/components/screens/Dashboard"));
const Leaderboards = lazy(() => import("@/components/screens/Leaderboards"));
const Settings = lazy(() => import("@/components/screens/Settings"));

type Screen = "login" | "dashboard" | "game" | "leaderboards" | "settings";

export default function App() {
  const { stats, recordGame } = useLocalStats();
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("game");
  const [username, setUsername] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogin = (name: string) => {
    setUsername(name);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setUsername("");
    setScreen("login");
  };

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
        <Suspense fallback={null}>
        {screen === "login" && (
          <Login 
            onLogin={handleLogin} 
            onPlayGuest={() => {
              setBgId(Math.floor(Math.random() * 4) + 1);
              setScreen("game");
            }} 
          />
        )}
        
        {screen === "dashboard" && (
          <Dashboard 
            username={username} 
            bestScore={stats.bestScore} 
            onPlay={() => {
              setBgId(Math.floor(Math.random() * 4) + 1);
              setScreen("game");
            }} 
            onLogout={handleLogout} 
          />
        )}

        {screen === "leaderboards" && (
          <Leaderboards onBack={() => setScreen("game")} />
        )}

        {screen === "settings" && (
          <Settings
            soundEnabled={soundEnabled}
            onSoundChange={setSoundEnabled}
            onBack={() => setScreen("game")}
          />
        )}
        </Suspense>

        {screen === "game" && (
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
            onQuit={() => {
              // Return to login if guest, otherwise dashboard
              setScreen(username ? "dashboard" : "login");
            }}
            onSettings={() => setScreen("settings")}
            onLeaderboards={() => setScreen("leaderboards")}
            onLogin={() => setScreen(username ? "dashboard" : "login")}
            isGuest={!username}
            soundEnabled={soundEnabled}
          />
        )}
      </main>
    </div>
  );
}
