import { useEffect, useState } from "react";
import Game2048 from "@/components/game/Game2048";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import { useLocalStats } from "@/hooks/useLocalStats";
import Dashboard from "@/components/screens/Dashboard";
import Settings from "@/components/screens/Settings";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useWinkIntegration } from "@/integrations/wink/useWinkIntegration";

type Screen = "dashboard" | "game" | "settings";

// UUID v4 — only used locally to correlate round events until the bridge
// starts managing roundId ownership from the new full typed client.
function newRoundId(): string {
  const cr = globalThis.crypto;
  if (cr && typeof cr.randomUUID === "function") return cr.randomUUID();
  return `round-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

export default function App() {
  const { stats, recordGame, updateLastGameScore } = useLocalStats();
  const [bgId, setBgId] = useState(() => Math.floor(Math.random() * 4) + 1);
  const [screen, setScreen] = useState<Screen>("game");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const { playSfx, audioStatus, unlockAudio, setParentMuted, setHostPaused, startBgmFromUserGesture } = useGameAudio(musicEnabled, sfxEnabled);
  const keepGameMounted = screen === "game" || screen === "settings";

  // Wink bridge integration — full typed WinkIntegration
  const wink = useWinkIntegration();

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
   * Called at first tile move — opens a new semantic round.
   * The roundId is kept alive through any revive step.
   */
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [roundStartMs, setRoundStartMs] = useState<number>(0);

  const onRoundStart = () => {
    if (activeRoundId) return; // already active
    const id = newRoundId();
    setActiveRoundId(id);
    setRoundStartMs(Date.now());
  };

  /**
   * Called when the player confirms final game-over (declines revive or resets).
   * Submits score then completes the round — both are independent operations.
   */
  const onGameEnd = async (
    score: number,
    _maxTile: number,
    playTimeMs: number,
    doubled: boolean,
  ) => {
    const roundId = activeRoundId;
    setActiveRoundId(null);

    if (!roundId) return;

    const playTimeSec = Math.round(playTimeMs / 1000);

    // Submit score first (independent from completion)
    try {
      await wink.submitFinalScore({
        roundId,
        score,
        playTimeSec,
        qualifies: true,
      });
    } catch (err: unknown) {
      // CAPABILITY_DENIED is expected for anonymous — already handled by the
      // hook setting the error state. Log unexpected errors only.
      const code = (err as { code?: string })?.code;
      if (code !== "CAPABILITY_DENIED") {
        console.error("[Wink] submitFinalScore failed", err);
      }
    }

    // Complete the round independently
    try {
      await wink.completeRound({
        roundId,
        playDurationMs: Math.max(0, playTimeMs ?? Date.now() - roundStartMs),
      });
    } catch (err: unknown) {
      console.error("[Wink] completeRound failed", err);
    }

    // Persist local stats regardless of Wink outcome
    recordGame(score, _maxTile);
    if (doubled) updateLastGameScore(score);
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
                onGameEnd={onGameEnd}
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
                onMusicChange={(enabled) => {
                  setMusicEnabled(enabled);
                  if (enabled) {
                    // Play attempt happens inside this click gesture —
                    // never relies on a ref from the next render.
                    startBgmFromUserGesture();
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
