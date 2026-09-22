import { useEffect, useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import Dashboard from "@/components/screens/Dashboard";
import Settings from "@/components/screens/Settings";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useWink } from "@/wink";
import { preloadCriticalResources, preloadNonCriticalResources } from "@/utils/game-loader";
import { completeGameLoading, onGameLoadingDismiss, setGameLoadingProgress } from "@/utils/loading-controller";

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

  useEffect(() => {
    const blockCopyAction = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener("copy", blockCopyAction, true);
    document.addEventListener("cut", blockCopyAction, true);
    document.addEventListener("selectstart", blockCopyAction, true);
    document.addEventListener("dragstart", blockCopyAction, true);
    document.addEventListener("contextmenu", blockCopyAction, true);

    return () => {
      document.removeEventListener("copy", blockCopyAction, true);
      document.removeEventListener("cut", blockCopyAction, true);
      document.removeEventListener("selectstart", blockCopyAction, true);
      document.removeEventListener("dragstart", blockCopyAction, true);
      document.removeEventListener("contextmenu", blockCopyAction, true);
    };
  }, []);

  // Unified bootstrap barrier: Critical Resources + Wink SDK
  useEffect(() => {
    setGameLoadingProgress(20);

    const criticalPromise = preloadCriticalResources((pct) => {
      setGameLoadingProgress(Math.min(95, pct));
    });

    const winkPromise = wink.readyPromise ?? Promise.resolve(null);

    void Promise.allSettled([criticalPromise, winkPromise]).then(() => {
      completeGameLoading();
    });
  }, [wink.readyPromise]);

  // Trigger idle preloads on loading screen dismiss
  useEffect(() => {
    const unbind = onGameLoadingDismiss(() => {
      preloadNonCriticalResources();
    });
    return unbind;
  }, []);

  // Apply parent mute to audio engine without touching user prefs
  useEffect(() => {
    setParentMuted(wink.parentMuted);
  }, [wink.parentMuted, setParentMuted]);

  // Handle lost focus (window blur / tab hidden) -> pause game and open settings screen
  useEffect(() => {
    const handleLostFocus = () => {
      setScreen((prev) => (prev === "game" ? "settings" : prev));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLostFocus();
      }
    };

    window.addEventListener("blur", handleLostFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleLostFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // When host pauses, transition to settings if currently in game
  useEffect(() => {
    if (wink.hostPaused) {
      queueMicrotask(() => {
        setScreen((prev) => (prev === "game" ? "settings" : prev));
      });
    }
  }, [wink.hostPaused]);

  // Settings screen acts as pause state: pause renderer, disable gameplay input, and pause BGM
  const isPaused = wink.hostPaused || screen === "settings";

  useEffect(() => {
    setHostPaused(isPaused);
  }, [isPaused, setHostPaused]);

  // The game-start overlay owns the first audio gesture. Keep gameplay input
  // locked until that gesture has opened the audio context and loaded SFX.
  const inputEnabled = screen === "game" && !isPaused && audioStatus === "ready";

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
                rendererPaused={isPaused}
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
