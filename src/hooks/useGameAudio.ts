import { useCallback, useEffect, useRef, useState } from "react";

const MUSIC_SRC = "/assets/audio-optimized/music.mp3";

// Volume preset: Calibrated against 01_fruit sound design standards.
// Master is full scale (1.0), with DynamicsCompressor providing safety headroom against clipping.
// BGM at 0.15 sits comfortably in the background without overpowering transient SFX.
// BGM ducking on merge/win provides clarity for gameplay feedback.
export const AUDIO_VOLUME = {
  bgm: 0.15,
  button: 0.65,
  tap: 0.65,
  move: 0.80,
  merge: 0.90,
  lose: 0.85,
  win: 0.95,
  master: 1.0,
} as const;

const SFX_SOURCES = {
  move: { ogg: "/assets/audio-optimized/click3.ogg", mp3: "/assets/audio-optimized/click3.mp3" },
  merge: { ogg: "/assets/audio-optimized/switch7.ogg", mp3: "/assets/audio-optimized/switch7.mp3" },
  win: { ogg: "/assets/audio-optimized/celebrate.ogg", mp3: "/assets/audio-optimized/celebrate.mp3" },
  lose: { ogg: "/assets/audio-optimized/switch24.ogg", mp3: "/assets/audio-optimized/switch24.mp3" },
  tap: { ogg: "/assets/audio-optimized/click3.ogg", mp3: "/assets/audio-optimized/click3.mp3" },
} as const;

export type GameSfx = keyof typeof SFX_SOURCES;

const SFX_VOLUMES: Record<GameSfx, number> = {
  move: AUDIO_VOLUME.move,
  merge: AUDIO_VOLUME.merge,
  win: AUDIO_VOLUME.win,
  lose: AUDIO_VOLUME.lose,
  tap: AUDIO_VOLUME.tap,
};

const BUTTON_SFX_SELECTOR = [
  "button",
  "[role='button']",
  "a[href]",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
].join(",");

export function shouldPlayButtonSfx(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  const control = target.closest(BUTTON_SFX_SELECTOR);
  if (!(control instanceof HTMLElement)) return false;
  if (control.closest("[data-sfx='off']")) return false;
  if (control.getAttribute("aria-disabled") === "true") return false;
  if ("disabled" in control && Boolean((control as HTMLButtonElement).disabled)) return false;

  return true;
}

// Global Web Audio API Context.
// Every playable sound routes through the Web Audio graph — the OS/hardware
// volume layer is left entirely to the browser/platform.
let audioCtx: AudioContext | null = null;
let sfxMuteGain: GainNode | null = null;
let bgmMuteGain: GainNode | null = null;
let masterGain: GainNode | null = null;
let bgmElement: HTMLAudioElement | null = null;
let bgmSource: MediaElementAudioSourceNode | null = null;
let bgmLocalGain: GainNode | null = null;
let bgmStarted = false;
let bgmPlayPromise: Promise<void> | null = null;
let audioUnlocked = false;
let bgmPendingStart = false;

function ensureAudioContext(): AudioContext | null {
  const AudioContextClass =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!audioCtx && AudioContextClass) {
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = AUDIO_VOLUME.master;

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -6;
    compressor.knee.value = 6;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;

    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);

    sfxMuteGain = audioCtx.createGain();
    sfxMuteGain.connect(masterGain);
    sfxMuteGain.gain.value = isSfxActive(policyState) ? 1 : 0;

    bgmMuteGain = audioCtx.createGain();
    bgmMuteGain.connect(masterGain);
    bgmMuteGain.gain.value = isMusicActive(policyState) ? 1 : 0;
  }
  return audioCtx;
}

let lastButtonSfxTime = 0;

/**
 * Synthesizes crisp button tap feedback (dual oscillator click+pop)
 * calibrated to exact 01_fruit standards. Runs with zero network delay.
 */
export function playButtonSfx(volume = AUDIO_VOLUME.button): void {
  const nowMs = Date.now();
  if (nowMs - lastButtonSfxTime < 80) return;
  lastButtonSfxTime = nowMs;

  if (!isSfxActive(policyState)) return;
  ensureAudioContext();
  if (!audioCtx) return;

  if (audioCtx.state === "suspended") {
    void audioCtx.resume().catch(() => {});
  }

  if (typeof audioCtx.createOscillator !== "function") return;

  const now = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  const click = audioCtx.createOscillator();
  const pop = audioCtx.createOscillator();

  click.type = "triangle";
  click.frequency.setValueAtTime(920, now);
  click.frequency.exponentialRampToValueAtTime(520, now + 0.055);

  pop.type = "sine";
  pop.frequency.setValueAtTime(210, now);
  pop.frequency.exponentialRampToValueAtTime(130, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  click.connect(gain);
  pop.connect(gain);

  if (sfxMuteGain) {
    gain.connect(sfxMuteGain);
  } else if (masterGain) {
    gain.connect(masterGain);
  } else {
    gain.connect(audioCtx.destination);
  }

  click.start(now);
  pop.start(now);
  click.stop(now + 0.09);
  pop.stop(now + 0.09);

  setTimeout(() => {
    try {
      click.disconnect();
      pop.disconnect();
      gain.disconnect();
    } catch {
      // already disconnected
    }
  }, 120);
}

const sfxBuffers: Partial<Record<GameSfx, AudioBuffer>> = {};

function pickSfxSource(source: (typeof SFX_SOURCES)[GameSfx]) {
  const probe = document.createElement("audio");
  const supportsOgg = probe.canPlayType('audio/ogg; codecs="vorbis"');
  return supportsOgg ? source.ogg : source.mp3;
}

function setupBgm() {
  if (bgmElement) {
    if (bgmElement.preload !== "auto") {
      bgmElement.preload = "auto";
    }
    return;
  }

  bgmElement = new Audio(MUSIC_SRC);
  bgmElement.loop = true;
  bgmElement.preload = "auto";
  bgmElement.setAttribute("playsinline", "true");
  
  if (audioCtx) {
    if (!bgmMuteGain) {
      bgmMuteGain = audioCtx.createGain();
      bgmMuteGain.connect(masterGain ?? audioCtx.destination);
    }
    
    // Web Audio API Architecture: Wrap HTML Audio and route through GainNodes
    bgmSource = audioCtx.createMediaElementSource(bgmElement);
    bgmLocalGain = audioCtx.createGain();
    bgmLocalGain.gain.value = AUDIO_VOLUME.bgm; 
    
    bgmSource.connect(bgmLocalGain);
    bgmLocalGain.connect(bgmMuteGain);
  }
}

// Hold current automation then ramp to target — safe under rapid toggles/ducks.
// cancelAndHoldAtTime keeps the exact instantaneous value of a running ramp
// (fallback: cancel + resample from param.value).
function holdAndRamp(param: AudioParam, target: number, at: number, duration: number) {
  const p = param as AudioParam & { cancelAndHoldAtTime?: (time: number) => AudioParam };
  if (typeof p.cancelAndHoldAtTime === "function") {
    p.cancelAndHoldAtTime(at);
  } else {
    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
  }
  param.linearRampToValueAtTime(target, at + duration);
}

export function isBgmPlaybackEligible(
  musicEnabled: boolean,
  hostPaused: boolean,
  documentHidden: boolean,
): boolean {
  return musicEnabled && !hostPaused && !documentHidden;
}

function canStartBgm(musicEnabled: boolean) {
  return isBgmPlaybackEligible(musicEnabled, policyState.hostPaused, policyState.documentHidden);
}

function startBgm(musicEnabled: boolean) {
  if (!bgmElement) return;
  if (!canStartBgm(musicEnabled)) return;
  if (bgmStarted && !bgmElement.paused) return;
  if (bgmPlayPromise) return;

  try {
    const playRes = bgmElement.play();
    if (playRes && typeof playRes.then === "function") {
      bgmPlayPromise = playRes
        .then(() => {
          bgmStarted = true;
          bgmPendingStart = false;
        })
        .catch((err) => {
          bgmStarted = false;

          if (err?.name === "NotAllowedError") {
            // Autoplay policy blocked playback: keep pending until a real
            // user interaction retries. Never fake a playing state.
            bgmPendingStart = true;
          } else {
            console.warn("BGM play failed, deferred until interaction", err);
          }
        })
        .finally(() => {
          bgmPlayPromise = null;
        });
    } else {
      bgmStarted = true;
      bgmPendingStart = false;
    }
  } catch (err) {
    bgmStarted = false;
    console.warn("BGM play exception", err);
  }
}

// Tracks central audio policy authority
interface AudioPolicyState {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  parentMuted: boolean;
  hostPaused: boolean;
  documentHidden: boolean;
  unlocked: boolean;
}

const policyState: AudioPolicyState = {
  musicEnabled: true,
  sfxEnabled: true,
  parentMuted: false,
  hostPaused: false,
  documentHidden: false,
  unlocked: false,
};

export function isMusicActive(state: AudioPolicyState = policyState): boolean {
  return (
    state.musicEnabled &&
    !state.parentMuted &&
    !state.hostPaused &&
    !state.documentHidden &&
    state.unlocked
  );
}

export function isSfxActive(state: AudioPolicyState = policyState): boolean {
  return (
    state.sfxEnabled &&
    !state.parentMuted &&
    !state.documentHidden
  );
}

// Duck BGM ~4 dB for important events so SFX stands out without high gain.
// Uses holdAndRamp so consecutive merges never jump or fight automation.
function duckBgm(duration = 0.22) {
  if (!audioCtx || !bgmLocalGain) return;
  const now = audioCtx.currentTime;

  holdAndRamp(bgmLocalGain.gain, AUDIO_VOLUME.bgm * 0.4, now, 0.04);
  holdAndRamp(bgmLocalGain.gain, AUDIO_VOLUME.bgm, now + duration, 0.35);
}

function syncAudioPolicy() {
  const now = audioCtx?.currentTime ?? 0;
  const musicActive = isMusicActive(policyState);
  const sfxActive = isSfxActive(policyState);

  // 1. Gain Gate Control
  if (bgmMuteGain) {
    holdAndRamp(bgmMuteGain.gain, musicActive ? 1 : 0, now, 0.03);
  }
  if (sfxMuteGain) {
    holdAndRamp(sfxMuteGain.gain, sfxActive ? 1 : 0, now, 0.03);
  }

  // 2. BGM Playback Control (pause track when muted/paused/hidden to conserve battery)
  if (!musicActive) {
    bgmPendingStart = false;
    if (bgmElement && !bgmElement.paused) {
      bgmElement.pause();
      bgmStarted = false;
    }
  } else if (policyState.unlocked && isBgmPlaybackEligible(policyState.musicEnabled, policyState.hostPaused, policyState.documentHidden)) {
    setupBgm();
    startBgm(policyState.musicEnabled);
  }

  // 3. AudioContext Resume if Suspended on Returning to Foreground
  if (!policyState.documentHidden && !policyState.hostPaused && policyState.unlocked && audioCtx?.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

export function useGameAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const pendingSfxRef = useRef<GameSfx[]>([]);
  const sfxLoadPromiseRef = useRef<Promise<void> | null>(null);
  const [audioStatus, setAudioStatus] = useState<"idle" | "loading" | "ready">(
    audioUnlocked ? "ready" : "idle",
  );
  const [sfxAssetsReady, setSfxAssetsReady] = useState(() =>
    Object.keys(SFX_SOURCES).every((key) => Boolean(sfxBuffers[key as GameSfx])),
  );

  // Sync user preferences into policy authority
  useEffect(() => {
    policyState.musicEnabled = musicEnabled;
    policyState.sfxEnabled = sfxEnabled;
    syncAudioPolicy();
  }, [musicEnabled, sfxEnabled]);

  // Unified visibilitychange listener to pause/resume audio automatically
  useEffect(() => {
    const handleVisibilityChange = () => {
      policyState.documentHidden = Boolean(document.hidden);
      syncAudioPolicy();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const playSfx = useCallback((name: GameSfx) => {
    // Check unified authority for SFX playback eligibility
    if (!isSfxActive(policyState)) return;

    if (name === "tap") {
      playButtonSfx();
      return;
    }

    // A real gameplay gesture can unlock the context before the first SFX
    // finishes decoding. Keep that semantic event until the asset is ready.
    if (!audioCtx || !sfxMuteGain) {
      pendingSfxRef.current = [...pendingSfxRef.current.slice(-7), name];
      return;
    }

    const buffer = sfxBuffers[name];
    if (!buffer) {
      pendingSfxRef.current = [...pendingSfxRef.current.slice(-7), name];
      return;
    }

    // Duck BGM on important events (merge/win/lose), not on ordinary moves.
    if (name === "win") {
      duckBgm(2.4);
    } else if (name === "merge" || name === "lose") {
      duckBgm(0.22);
    }

    // Resume context if suspended (common on iOS)
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const localGain = audioCtx.createGain();
    localGain.gain.value = SFX_VOLUMES[name];

    // Connect: source -> localGain -> sfxMuteGain -> masterGain
    source.connect(localGain);
    localGain.connect(sfxMuteGain);

    // Clean node cleanup on completion to avoid memory accumulation
    source.onended = () => {
      try {
        source.disconnect();
        localGain.disconnect();
      } catch {
        // already disconnected
      }
    };

    source.start(0);
  }, []);

  const unlockAudio = useCallback(async () => {
    ensureAudioContext();
    setupBgm();

    if (audioCtx?.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    if (audioCtx) {
      // Play a silent buffer to truly unlock Web Audio on iOS
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        try {
          source.disconnect();
        } catch {
          // ignore
        }
      };
      source.start(0);
    }

    audioUnlocked = true;
    policyState.unlocked = true;
    syncAudioPolicy();

    // Always start BGM if policy allows and track is not yet playing
    if (isMusicActive(policyState) && (!bgmElement || bgmElement.paused)) {
      startBgm(policyState.musicEnabled);
    }

    // 2. Async actions (Loading SFX buffers in background without stalling input)
    // App and the board can observe the same first gesture. Share one load
    // promise so that gesture unlock never starts duplicate fetch/decode work.
    if (!sfxLoadPromiseRef.current) {
      const decodedPromises: Record<string, Promise<AudioBuffer | null>> = {};
      const pendingSfxLoads = Object.entries(SFX_SOURCES).map(([key, source]) => {
        if (sfxBuffers[key as GameSfx]) return Promise.resolve();
        const src = pickSfxSource(source);
        if (!decodedPromises[src]) {
          decodedPromises[src] = fetch(src)
            .then((res) => res.arrayBuffer())
            .then((buffer) => (audioCtx ? audioCtx.decodeAudioData(buffer) : null))
            .catch((e) => {
              console.error("Failed to load sfx", src, e);
              return null;
            });
        }
        return decodedPromises[src].then((audioBuffer) => {
          if (audioBuffer) {
            sfxBuffers[key as GameSfx] = audioBuffer;
          }
        });
      });
      sfxLoadPromiseRef.current = Promise.all(pendingSfxLoads).then(() => {
        setSfxAssetsReady(true);
        const pendingSfx = pendingSfxRef.current.splice(0);
        pendingSfx.forEach(playSfx);
      });
    }

    await sfxLoadPromiseRef.current;

    setAudioStatus("ready");
  }, [playSfx]);

  // Retry pending BGM playback from real user gestures and trigger button tap SFX
  useEffect(() => {
    const handleUserGesture = () => {
      ensureAudioContext();
      if (!policyState.unlocked) {
        policyState.unlocked = true;
        audioUnlocked = true;
      }
      if (audioCtx?.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      if (isMusicActive(policyState) && (!bgmElement || bgmElement.paused || bgmPendingStart)) {
        setupBgm();
        startBgm(policyState.musicEnabled);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      handleUserGesture();
      if (shouldPlayButtonSfx(event.target)) {
        playButtonSfx();
      }
    };

    const handleButtonClick = (event: MouseEvent) => {
      handleUserGesture();
      if (shouldPlayButtonSfx(event.target)) {
        playButtonSfx();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      handleUserGesture();
      if ((event.key === "Enter" || event.key === " ") && shouldPlayButtonSfx(event.target)) {
        playButtonSfx();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    document.addEventListener("click", handleButtonClick, {
      capture: true,
    });
    document.addEventListener("touchstart", handleUserGesture, {
      capture: true,
      passive: true,
    });
    document.addEventListener("touchend", handleUserGesture, {
      capture: true,
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
      document.removeEventListener("click", handleButtonClick, {
        capture: true,
      });
      document.removeEventListener("touchstart", handleUserGesture, {
        capture: true,
      });
      document.removeEventListener("touchend", handleUserGesture, {
        capture: true,
      });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  const setParentMuted = useCallback((muted: boolean) => {
    policyState.parentMuted = muted;
    syncAudioPolicy();
  }, []);

  const setHostPaused = useCallback((paused: boolean) => {
    policyState.hostPaused = paused;
    syncAudioPolicy();
  }, []);

  // Explicit user-gesture path for a Music OFF → ON toggle
  const startBgmFromUserGesture = useCallback((enabled: boolean) => {
    policyState.musicEnabled = enabled;
    if (!policyState.unlocked) return;
    if (!isBgmPlaybackEligible(enabled, policyState.hostPaused, policyState.documentHidden)) return;

    setupBgm();
    startBgm(enabled);
  }, []);

  return {
    playSfx,
    audioStatus,
    unlockAudio,
    setParentMuted,
    setHostPaused,
    startBgmFromUserGesture,
    audioInteractionReady: audioStatus === "ready",
    sfxAssetsReady,
  };
}
