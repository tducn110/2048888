import { useCallback, useEffect, useRef } from "react";

const MUSIC_SRC = "/assets/audio/music.mp3";
const MUSIC_VOLUME = 0.05; // Background < SFX

const SFX_SOURCES = {
  move: { ogg: "/assets/audio/click3.ogg", mp3: "/assets/audio/click3.mp3" },
  merge: { ogg: "/assets/audio/switch7.ogg", mp3: "/assets/audio/switch7.mp3" },
  win: { ogg: "/assets/audio/switch33.ogg", mp3: "/assets/audio/switch33.mp3" },
  lose: { ogg: "/assets/audio/switch24.ogg", mp3: "/assets/audio/switch24.mp3" },
  tap: { ogg: "/assets/audio/click3.ogg", mp3: "/assets/audio/click3.mp3" },
} as const;

export type GameSfx = keyof typeof SFX_SOURCES;

const SFX_VOLUMES: Record<GameSfx, number> = {
  move: 0.6,
  merge: 0.8,
  win: 0.9,
  lose: 0.9,
  tap: 0.7,
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
let bgmElement: HTMLAudioElement | null = null;
let bgmStarted = false;
let bgmPlayPromise: Promise<void> | null = null;
let bgmDesiredPlaying = false;
let audioUnlocked = false;

const sfxBuffers: Partial<Record<GameSfx, AudioBuffer>> = {};

function pickSfxSource(source: (typeof SFX_SOURCES)[GameSfx]) {
  const probe = document.createElement("audio");
  const supportsOgg = probe.canPlayType('audio/ogg; codecs="vorbis"');
  return supportsOgg ? source.ogg : source.mp3;
}

function initAudioSystem() {
  if (audioCtx) return;
  const AudioContextClass =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  audioCtx = new AudioContextClass();
  
  sfxGain = audioCtx.createGain();
  sfxGain.connect(audioCtx.destination);

  // Load SFX buffers
  Object.entries(SFX_SOURCES).forEach(async ([key, source]) => {
    const src = pickSfxSource(source);
    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx!.decodeAudioData(arrayBuffer);
      sfxBuffers[key as GameSfx] = audioBuffer;
    } catch (e) {
      console.error("Failed to load sfx", src, e);
    }
  });
}

function setupBgm() {
  if (bgmElement) return;

  bgmElement = new Audio(MUSIC_SRC);
  bgmElement.loop = true;
  bgmElement.preload = "auto";
  bgmElement.setAttribute("playsinline", "true");
  bgmElement.volume = MUSIC_VOLUME;
}

function syncGainState(musicEnabled: boolean, sfxEnabled: boolean) {
  if (bgmElement) bgmElement.volume = musicEnabled ? MUSIC_VOLUME : 0;
  if (sfxGain) sfxGain.gain.value = sfxEnabled ? 1 : 0;
}

function startBgm() {
  if (!bgmElement) return;
  bgmDesiredPlaying = true;
  if (bgmStarted && !bgmElement.paused) return;
  if (bgmPlayPromise) return;

  bgmPlayPromise = bgmElement
    .play()
    .then(() => {
      bgmStarted = bgmDesiredPlaying;
      if (!bgmDesiredPlaying) {
        bgmElement?.pause();
      }
    })
    .catch((err) => {
      console.warn("BGM play failed, retrying on next interaction", err);
      bgmStarted = false;
    })
    .finally(() => {
      bgmPlayPromise = null;
    });
}

function pauseBgm() {
  bgmDesiredPlaying = false;
  bgmStarted = false;
  if (!bgmElement) return;
  bgmElement.pause();
}

export function useGameAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const musicEnabledRef = useRef(musicEnabled);
  const sfxEnabledRef = useRef(sfxEnabled);

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
  }, [musicEnabled]);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  // Sync mute state to gain nodes
  useEffect(() => {
    if (bgmElement) {
      bgmElement.volume = musicEnabled ? MUSIC_VOLUME : 0;
    }

    if (!musicEnabled) {
      pauseBgm();
      return;
    }

    if (audioUnlocked) {
      setupBgm();
      startBgm();
    }
  }, [musicEnabled]);

  useEffect(() => {
    if (!audioCtx) return;
    if (sfxGain) {
      sfxGain.gain.value = sfxEnabled ? 1 : 0;
    }
  }, [sfxEnabled]);

  const playSfx = useCallback(
    (name: GameSfx) => {
      // We check sfxGain.gain.value dynamically, but if sfxEnabled is false, we can skip
      if (!sfxEnabled) return;
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

      source.connect(localGain);
      localGain.connect(sfxGain);

      source.start(0);
    },
    [sfxEnabled]
  );

  // Initialize and unlock audio on real user interaction.
  useEffect(() => {
    const unlock = () => {
      initAudioSystem();
      setupBgm();
      syncGainState(musicEnabledRef.current, sfxEnabledRef.current);

      if (audioCtx?.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      
      audioUnlocked = true;

      // On iOS, we must call play() synchronously in the event handler to unlock the element.
      if (bgmElement && bgmElement.paused) {
        const p = bgmElement.play();
        if (p !== undefined) {
          p.then(() => {
            bgmStarted = true;
            // If music is actually disabled in settings, pause immediately after unlocking
            if (!musicEnabledRef.current) {
              bgmElement?.pause();
              bgmStarted = false;
              bgmDesiredPlaying = false;
            } else {
              bgmDesiredPlaying = true;
            }
          }).catch(() => {
            bgmStarted = false;
          });
        }
      }
    };

    window.addEventListener("pointerdown", unlock, { capture: true });
    window.addEventListener("click", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });
    window.addEventListener("touchstart", unlock, { capture: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("click", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
      window.removeEventListener("touchstart", unlock, { capture: true });
    };
  }, []); // Only run once to attach unlock listeners

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

  return { playSfx };
}
