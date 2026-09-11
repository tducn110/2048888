import { useEffect, useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import Dashboard from "@/components/screens/Dashboard";
import Settings from "@/components/screens/Settings";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useWink } from "@/wink";

type Screen = "dashboard" | "game" | "settings";

export default function App() {
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("game");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const { playSfx, audioStatus, unlockAudio, setParentMuted, setHostPaused, startBgmFromUserGesture } = useGameAudio(musicEnabled, sfxEnabled);
  // Keep the Pixi board alive while navigating through Dashboard/Settings so
  // its renderer and in-progress round do not restart on a screen change.
  const keepGameMounted = true;

  const wink = useWink();

  // Apply parent mute to audio engine without touching user prefs
  useEffect(() => {
    setParentMuted(wink.parentMuted);
  }, [wink.parentMuted, setParentMuted]);

  useEffect(() => {
    setHostPaused(wink.hostPaused);
  }, [wink.hostPaused, setHostPaused]);

  // inputEnabled: game requires audio to be ready AND not host-paused AND on game screen
  const inputEnabled = screen === "game" && audioStatus === "ready" && !wink.hostPaused;

  /**
   * Called at first tile move. The round id and its clock belong to the SDK
   * now — calling this twice abandons the first round rather than reporting a
   * bogus duration for it, so the revive step needs no guard here.
   */
  const onRoundStart = () => {
    wink.gameplayStart();
  };

  /** Called when the player confirms final game-over. */
  const onGameEnd = async (
    score: number,
    _maxTile: number,
    playTimeMs: number,
    _doubled: boolean,
  ) => {
    wink.gameplayStop();
    await wink.submitScore(score, Math.round(playTimeMs / 1000));
  };

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

      {/* Wink error banner (visible failure for CAPABILITY_DENIED etc.) */}
      {wink.error && wink.error.code === "CAPABILITY_DENIED" && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "rgba(180,30,30,0.92)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 13,
            maxWidth: "90vw",
            textAlign: "center",
          }}
        >
          {wink.error.message}
        </div>
      )}

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
            bestScore={wink.bestScore}
            leaderboard={wink.leaderboard}
            player={wink.playerEntry}
            onPlay={() => setScreen("game")}
          />
        )}

        {keepGameMounted && (
          <>
            <div className="game-screen-slot" style={{ display: screen === "game" ? "block" : "none", width: "100%" }}>
              <Game2048
                bestScore={wink.bestScore}
                onGameEnd={onGameEnd}
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
                onMusicChange={(enabled) => {
                  setMusicEnabled(enabled);
                  if (enabled) {
                    startBgmFromUserGesture(enabled);
                  }
                }}
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
