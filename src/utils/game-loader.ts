let criticalPreloadPromise: Promise<void> | null = null;

async function preloadFonts(): Promise<void> {
  if (!("fonts" in document)) return;
  try {
    await Promise.all([
      document.fonts.load('400 16px "Be Vietnam Pro"'),
      document.fonts.load('700 16px "Be Vietnam Pro"'),
      document.fonts.load('800 16px "Be Vietnam Pro"'),
    ]);
    await document.fonts.ready;
  } catch {
    // Non-fatal font load fallback
  }
}

async function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Non-blocking on network error
    img.src = src;
  });
}

/**
 * Preload strictly CRITICAL resources required for the initial 2048 game view.
 * Fonts, initial background, and core UI SFX are loaded before dismissing splash.
 */
export function preloadCriticalResources(onProgress?: (pct: number) => void): Promise<void> {
  if (criticalPreloadPromise) return criticalPreloadPromise;

  criticalPreloadPromise = (async () => {
    onProgress?.(25);

    // Phase 1: Custom typography & First theme background
    await Promise.allSettled([
      preloadFonts(),
      preloadImage("/assets/bg-1.webp"),
    ]);
    onProgress?.(65);

    // Phase 2: Core gameplay SFX (move click and merge sounds)
    const criticalAudioUrls = [
      "/assets/audio-optimized/click3.mp3",
      "/assets/audio-optimized/switch24.mp3",
    ];
    await Promise.allSettled(
      criticalAudioUrls.map((url) =>
        fetch(url, { mode: "cors" }).catch(() => null)
      )
    );
    onProgress?.(95);
  })()
    .then(() => undefined)
    .catch((error) => {
      criticalPreloadPromise = null;
      throw error;
    });

  return criticalPreloadPromise;
}

/**
 * Preload NON-CRITICAL assets (heavy BGM ~1.1MB, alternate theme backdrops)
 * in idle time AFTER player enters the start screen to eliminate splash latency.
 */
export function preloadNonCriticalResources(): void {
  const loadBackgroundAssets = () => {
    // 1. Heavy BGM track
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = "/assets/audio-optimized/music.mp3";

    // 2. Secondary theme backdrops & celebration audio
    const secondaryAssets = [
      "/assets/bg-2.webp",
      "/assets/bg-3.webp",
      "/assets/bg-4.webp",
      "/assets/audio-optimized/celebrate.ogg",
      "/assets/audio-optimized/switch33.mp3",
      "/assets/audio-optimized/switch7.mp3",
    ];
    secondaryAssets.forEach((src) => {
      if (src.endsWith(".webp")) {
        void preloadImage(src);
      } else {
        void fetch(src).catch(() => {});
      }
    });
  };

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(loadBackgroundAssets, { timeout: 4000 });
  } else {
    setTimeout(loadBackgroundAssets, 1200);
  }
}
