import { useCallback, useEffect, useRef } from "react";

const MUSIC_SRC = "/assets/audio/music.mp3";
const MUSIC_VOLUME = 0.12;

const SFX_SOURCES = {
  move: "/assets/audio/click3.ogg",
  merge: "/assets/audio/switch7.ogg",
  win: "/assets/audio/switch33.ogg",
  lose: "/assets/audio/switch24.ogg",
  tap: "/assets/audio/click3.ogg",
} as const;

export type GameSfx = keyof typeof SFX_SOURCES;

const SFX_VOLUMES: Record<GameSfx, number> = {
  move: 0.58,
  merge: 0.68,
  win: 0.72,
  lose: 0.72,
  tap: 0.62,
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

export function useGameAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<Partial<Record<GameSfx, HTMLAudioElement>>>({});
  const unlockedRef = useRef(false);

  useEffect(() => {
    sfxRef.current = Object.fromEntries(
      Object.entries(SFX_SOURCES).map(([key, src]) => {
        const audio = new Audio(src);
        audio.volume = SFX_VOLUMES[key as GameSfx];
        audio.preload = "auto";
        return [key, audio];
      })
    ) as Record<GameSfx, HTMLAudioElement>;

    return () => {
      const music = musicRef.current;
      music?.pause();
      musicRef.current = null;
      sfxRef.current = {};
    };
  }, []);

  const startMusic = useCallback(() => {
    if (!musicEnabled) return;

    if (!musicRef.current) {
      const music = new Audio(MUSIC_SRC);
      music.loop = true;
      music.volume = MUSIC_VOLUME;
      music.preload = "none";
      musicRef.current = music;
    }

    const music = musicRef.current;

    music.play().catch(() => {
      // Browser autoplay policy can still reject until a trusted user gesture.
    });
  }, [musicEnabled]);

  const playSfx = useCallback(
    (name: GameSfx) => {
      if (!sfxEnabled) return;

      const source = sfxRef.current[name];
      if (!source) return;

      const sound = source.cloneNode(true) as HTMLAudioElement;
      sound.volume = source.volume;
      sound.play().catch(() => {
        // Ignore user-agent audio gating for noncritical effects.
      });
    },
    [sfxEnabled]
  );

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    if (musicEnabled && unlockedRef.current) {
      startMusic();
    } else {
      music.pause();
    }
  }, [musicEnabled, startMusic]);

  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      startMusic();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [startMusic]);

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
