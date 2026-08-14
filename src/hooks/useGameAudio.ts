import { useCallback, useEffect, useRef, useState } from "react";

const MUSIC_SRC = "/assets/audio/music.mp3";
const MUSIC_VOLUME = 0.15; // Set desired BGM volume here

const SFX_SOURCES = {
  move: { ogg: "/assets/audio/click3.ogg", mp3: "/assets/audio/click3.mp3" },
  merge: { ogg: "/assets/audio/switch7.ogg", mp3: "/assets/audio/switch7.mp3" },
  win: { ogg: "/assets/audio/switch33.ogg", mp3: "/assets/audio/switch33.mp3" },
  lose: { ogg: "/assets/audio/switch24.ogg", mp3: "/assets/audio/switch24.mp3" },
  tap: { ogg: "/assets/audio/click3.ogg", mp3: "/assets/audio/click3.mp3" },
} as const;

export type GameSfx = keyof typeof SFX_SOURCES;

const SFX_VOLUMES: Record<GameSfx, number> = {
  move: 1.0,
  merge: 1.0,
  win: 1.0,
  lose: 1.0,
  tap: 1.0,
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

// Global Web Audio API Context
let audioCtx: AudioContext | null = null;
let sfxGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let bgmElement: HTMLAudioElement | null = null;
let bgmSource: MediaElementAudioSourceNode | null = null;
let bgmLocalGain: GainNode | null = null;
let bgmStarted = false;
let bgmPlayPromise: Promise<void> | null = null;
let audioUnlocked = false;

const sfxBuffers: Partial<Record<GameSfx, AudioBuffer>> = {};

function pickSfxSource(source: (typeof SFX_SOURCES)[GameSfx]) {
  const probe = document.createElement("audio");
  const supportsOgg = probe.canPlayType('audio/ogg; codecs="vorbis"');
  return supportsOgg ? source.ogg : source.mp3;
}

function setupBgm() {
  if (bgmElement) return;

  bgmElement = new Audio(MUSIC_SRC);
  bgmElement.loop = true;
  bgmElement.preload = "auto";
  bgmElement.setAttribute("playsinline", "true");
  
  if (audioCtx) {
    if (!bgmGain) {
      bgmGain = audioCtx.createGain();
      bgmGain.connect(audioCtx.destination);
    }
    
    // Web Audio API Architecture: Wrap HTML Audio and route through GainNodes
    bgmSource = audioCtx.createMediaElementSource(bgmElement);
    bgmLocalGain = audioCtx.createGain();
    bgmLocalGain.gain.value = MUSIC_VOLUME; 
    
    bgmSource.connect(bgmLocalGain);
    bgmLocalGain.connect(bgmGain);
  }
}

function syncGainState(musicEnabled: boolean, sfxEnabled: boolean, parentMuted: boolean) {
  // Mute control: strictly by setting gain.value, not by pausing tracks
  if (bgmGain) {
    bgmGain.gain.value = (parentMuted || !musicEnabled) ? 0 : 1;
  }
  if (sfxGain) {
    sfxGain.gain.value = (parentMuted || !sfxEnabled) ? 0 : 1;
  }
}

function startBgm() {
  if (!bgmElement) return;
  if (bgmStarted && !bgmElement.paused) return;
  if (bgmPlayPromise) return;

  bgmPlayPromise = bgmElement
    .play()
    .then(() => {
      bgmStarted = true;
    })
    .catch((err) => {
      console.warn("BGM play failed, deferred until interaction", err);
      bgmStarted = false;
    })
    .finally(() => {
      bgmPlayPromise = null;
    });
}

// Tracks parent-imposed mute (Wink bridge) — does NOT change user prefs
let globalParentMuted = false;

export function useGameAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const musicEnabledRef = useRef(musicEnabled);
  const sfxEnabledRef = useRef(sfxEnabled);
  const [audioStatus, setAudioStatus] = useState<"idle" | "loading" | "ready">(audioUnlocked ? "ready" : "idle");

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
    syncGainState(musicEnabled, sfxEnabledRef.current, globalParentMuted);
    
    if (musicEnabled && audioUnlocked) {
      setupBgm();
      startBgm();
    }
  }, [musicEnabled]);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    syncGainState(musicEnabledRef.current, sfxEnabled, globalParentMuted);
  }, [sfxEnabled]);

  const playSfx = useCallback(
    (name: GameSfx) => {
      // Check parent and user preference dynamically
      if (!sfxEnabledRef.current || globalParentMuted) return;
      if (!audioCtx || !sfxGain) return;

      const buffer = sfxBuffers[name];
      if (!buffer) return;

      // Resume context if suspended (common on iOS)
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const localGain = audioCtx.createGain();
      localGain.gain.value = SFX_VOLUMES[name];

      // IMPORTANT: Connect to master sfxGain
      source.connect(localGain);
      localGain.connect(sfxGain);

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
      
      // Global Mixer Setup
      sfxGain = audioCtx.createGain();
      sfxGain.connect(audioCtx.destination);
      
      bgmGain = audioCtx.createGain();
      bgmGain.connect(audioCtx.destination);
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
    
    if (musicEnabledRef.current) {
      startBgm();
    } else {
      // Start it anyway silently in background so we don't need to .play() later
      startBgm();
    }

    audioUnlocked = true;

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
      if (shouldPlayButtonSfx(event.target)) {
        playSfx("tap");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;

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
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }
        // Always attempt to resume music if it was running, regardless of mute state 
        // because it should be silently playing in background
        startBgm();
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

  return { playSfx, audioStatus, unlockAudio, setParentMuted };
}
