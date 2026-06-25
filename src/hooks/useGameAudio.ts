import { useCallback, useEffect, useRef } from "react";

const MUSIC_SRC = "/assets/audio/music.mp3";

const SFX_SOURCES = {
  move: "/assets/audio/click3.ogg",
  merge: "/assets/audio/switch7.ogg",
  win: "/assets/audio/switch33.ogg",
  lose: "/assets/audio/switch24.ogg",
  tap: "/assets/audio/click3.ogg",
} as const;

export type GameSfx = keyof typeof SFX_SOURCES;

export function useGameAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<Partial<Record<GameSfx, HTMLAudioElement>>>({});
  const unlockedRef = useRef(false);

  useEffect(() => {
    sfxRef.current = Object.fromEntries(
      Object.entries(SFX_SOURCES).map(([key, src]) => {
        const audio = new Audio(src);
        audio.volume = key === "win" || key === "lose" ? 0.54 : 0.38;
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
      music.volume = 0.26;
      music.preload = "none";
      musicRef.current = music;
    }

    const music = musicRef.current;

    music.play().catch(() => {
      // Browser autoplay policy can still reject until a trusted user gesture.
    });
  }, [musicEnabled]);

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

  return { playSfx };
}
