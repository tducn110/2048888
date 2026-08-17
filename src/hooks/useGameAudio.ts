import { useCallback, useEffect, useRef, useState } from "react";

const MUSIC_SRC = "/assets/audio/music.mp3";

// Volume preset: BGM stays perceptually below gameplay SFX.
// UI SFX +3-6 dB / gameplay SFX +6-9 dB / important SFX +8-10 dB over BGM.
// Never default to 1.0 — keep master headroom and duck BGM instead.
const AUDIO_VOLUME = {
  bgm: 0.18,
  tap: 0.35,
  move: 0.40,
  merge: 0.50,
  lose: 0.50,
  win: 0.55,
  master: 0.85,
} as const;

const SFX_SOURCES = {
  move: { ogg: "/assets/audio/click3.ogg", mp3: "/assets/audio/click3.mp3" },
  merge: { ogg: "/assets/audio/switch7.ogg", mp3: "/assets/audio/switch7.mp3" },
  win: { ogg: "/assets/audio/switch33.ogg", mp3: "/assets/audio/switch33.mp3" },
  lose: { ogg: "/assets/audio/switch24.ogg", mp3: "/assets/audio/switch24.mp3" },
  tap: { ogg: "/assets/audio/click3.ogg", mp3: "/assets/audio/click3.mp3" },
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

function shouldPlayButtonSfx(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  const control = target.closest(BUTTON_SFX_SELECTOR);
  if (!(control instanceof HTMLElement)) return false;
  if (control.closest("[data-sfx='off']")) return false;
  if (control.getAttribute("aria-disabled") === "true") return false;
  if ("disabled" in control && Boolean(control.disabled)) return false;

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
let globalHostPaused = false;

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

function syncGainState(musicEnabled: boolean, sfxEnabled: boolean, parentMuted: boolean) {
  // Mute control: strictly by gain gates, not by pausing tracks.
  // Ramp briefly so toggles never cause clicks/pops (no abrupt gain jumps).
  const now = audioCtx?.currentTime ?? 0;
  if (bgmMuteGain) {
    holdAndRamp(bgmMuteGain.gain, parentMuted || globalHostPaused || !musicEnabled ? 0 : 1, now, 0.03);
  }
  if (sfxMuteGain) {
    holdAndRamp(sfxMuteGain.gain, parentMuted || globalHostPaused || !sfxEnabled ? 0 : 1, now, 0.03);
  }
}

export function isBgmPlaybackEligible(
  musicEnabled: boolean,
  hostPaused: boolean,
  documentHidden: boolean,
): boolean {
  return musicEnabled && !hostPaused && !documentHidden;
}

function canStartBgm(musicEnabled: boolean) {
  return isBgmPlaybackEligible(musicEnabled, globalHostPaused, document.hidden);
}

function startBgm(musicEnabled: boolean) {
  if (!bgmElement) return;
  if (!canStartBgm(musicEnabled)) return;
  if (bgmStarted && !bgmElement.paused) return;
  if (bgmPlayPromise) return;

  bgmPlayPromise = bgmElement
    .play()
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
}

// Tracks parent-imposed mute (Wink bridge) — does NOT change user prefs
let globalParentMuted = false;

// Duck BGM ~4 dB for important events so SFX stands out without high gain.
// Uses holdAndRamp so consecutive merges never jump or fight automation.
function duckBgm() {
  if (!audioCtx || !bgmLocalGain) return;
  const now = audioCtx.currentTime;

  holdAndRamp(bgmLocalGain.gain, AUDIO_VOLUME.bgm * 0.6, now, 0.03);
  holdAndRamp(bgmLocalGain.gain, AUDIO_VOLUME.bgm, now + 0.03, 0.22);
}

export function useGameAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const musicEnabledRef = useRef(musicEnabled);
  const sfxEnabledRef = useRef(sfxEnabled);
  const [audioStatus, setAudioStatus] = useState<"idle" | "loading" | "ready">(audioUnlocked ? "ready" : "idle");

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
    syncGainState(musicEnabled, sfxEnabledRef.current, globalParentMuted);

    if (musicEnabled && audioUnlocked) {
      setupBgm();
      startBgm(musicEnabled);
    }

    if (!musicEnabled) {
      // Music off: a pending start must not survive into a later gesture
      bgmPendingStart = false;
    }
  }, [musicEnabled]);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    syncGainState(musicEnabledRef.current, sfxEnabled, globalParentMuted);
  }, [sfxEnabled]);

  const playSfx = useCallback(
    (name: GameSfx) => {
      // Check parent and user preference dynamically
      if (!sfxEnabledRef.current || globalParentMuted || globalHostPaused) return;
      if (!audioCtx || !sfxMuteGain) return;

      const buffer = sfxBuffers[name];
      if (!buffer) return;

      // Duck BGM on important events (merge/win/lose) — not on tap/move
      if (name === "merge" || name === "win" || name === "lose") {
        duckBgm();
      }

      // Resume context if suspended (common on iOS)
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const localGain = audioCtx.createGain();
      localGain.gain.value = SFX_VOLUMES[name];

      // IMPORTANT: Connect to the shared SFX mute gate -> masterGain
      source.connect(localGain);
      localGain.connect(sfxMuteGain);

      source.start(0);
    },
    []
  );

  const unlockAudio = useCallback(async () => {
    if (audioUnlocked) {
      setAudioStatus("ready");
      return;
    }
    setAudioStatus("loading");

    // 1. Sync actions for iOS
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
      
      // Master chain: both buses -> masterGain -> compressor -> destination
      // Prevents clipping when BGM + multiple SFX fire simultaneously
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

      // Global Mixer Setup: SFX/BGM buses -> mute gates -> masterGain.
      // Set initial mute state immediately (no ramp) so no audio can leak
      // during the first 30ms if user/parent starts muted.
      sfxMuteGain = audioCtx.createGain();
      sfxMuteGain.connect(masterGain);
      sfxMuteGain.gain.value = globalParentMuted || globalHostPaused || !sfxEnabledRef.current ? 0 : 1;

      bgmMuteGain = audioCtx.createGain();
      bgmMuteGain.connect(masterGain);
      bgmMuteGain.gain.value = globalParentMuted || globalHostPaused || !musicEnabledRef.current ? 0 : 1;
    }
    
    setupBgm();
    syncGainState(musicEnabledRef.current, sfxEnabledRef.current, globalParentMuted);

    if (audioCtx?.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    
    if (audioCtx) {
      // Play a silent buffer to truly unlock Web Audio on iOS
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start(0);
    }
    
    audioUnlocked = true;
    if (canStartBgm(musicEnabledRef.current)) {
      startBgm(musicEnabledRef.current);
    }

    // 2. Async actions (Loading SFX buffers)
    const promises: Promise<void>[] = [];
    if (bgmPlayPromise) {
      promises.push(bgmPlayPromise);
    }

    Object.entries(SFX_SOURCES).forEach(([key, source]) => {
      if (sfxBuffers[key as GameSfx]) return;
      const src = pickSfxSource(source);
      const fetchPromise = fetch(src)
        .then(res => res.arrayBuffer())
        .then(buffer => audioCtx!.decodeAudioData(buffer))
        .then(audioBuffer => {
          sfxBuffers[key as GameSfx] = audioBuffer;
        })
        .catch(e => console.error("Failed to load sfx", src, e));
      promises.push(fetchPromise);
    });

    await Promise.all(promises);
    setAudioStatus("ready");
  }, []);

  // Global button SFX listener
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      // Retry a pending BGM start inside this real user gesture,
      // but only while music is still enabled.
      if (bgmPendingStart && canStartBgm(musicEnabledRef.current) && audioUnlocked) {
        setupBgm();
        startBgm(musicEnabledRef.current);
      }

      if (shouldPlayButtonSfx(event.target)) {
        playSfx("tap");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;

      if (bgmPendingStart && canStartBgm(musicEnabledRef.current) && audioUnlocked) {
        setupBgm();
        startBgm(musicEnabledRef.current);
      }

      if (shouldPlayButtonSfx(event.target)) {
        playSfx("tap");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [playSfx]);

  // Handle visibility change (tab switch / minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (bgmElement && !bgmElement.paused) {
          bgmElement.pause();
          bgmStarted = false;
        }
        if (audioCtx && audioCtx.state === "running") {
          audioCtx.suspend().catch(() => {});
        }
      } else {
        if (!globalHostPaused && audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }
        // Resume/start BGM only while music is enabled — foregrounding
        // must never initialize BGM for a music-off session.
        if (!globalHostPaused && canStartBgm(musicEnabledRef.current)) {
          startBgm(musicEnabledRef.current);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const setParentMuted = useCallback((muted: boolean) => {
    globalParentMuted = muted;
    syncGainState(musicEnabledRef.current, sfxEnabledRef.current, globalParentMuted);
  }, []);

  const setHostPaused = useCallback((paused: boolean) => {
    globalHostPaused = paused;
    if (paused) {
      bgmPendingStart = false;
      if (bgmElement && !bgmElement.paused) {
        bgmElement.pause();
        bgmStarted = false;
      }
    }
    syncGainState(musicEnabledRef.current, sfxEnabledRef.current, globalParentMuted);
    if (!paused && audioUnlocked && canStartBgm(musicEnabledRef.current)) {
      const resume = audioCtx?.state === "suspended" ? audioCtx.resume() : Promise.resolve();
      resume
        .catch(() => {})
        .then(() => {
          if (!globalHostPaused && canStartBgm(musicEnabledRef.current)) {
            setupBgm();
            startBgm(musicEnabledRef.current);
          }
        });
    }
  }, []);

  // Explicit user-gesture path for a Music OFF → ON toggle. The caller passes
  // the semantic "enabled" value directly so this callback never reads a stale ref.
  const startBgmFromUserGesture = useCallback(
    (enabled: boolean) => {
      if (!audioUnlocked) return;
      if (!isBgmPlaybackEligible(enabled, globalHostPaused, document.hidden)) return;

      setupBgm();
      startBgm(enabled);
    },
    [],
  );

  return { playSfx, audioStatus, unlockAudio, setParentMuted, setHostPaused, startBgmFromUserGesture };
}
