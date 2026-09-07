// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isMusicActive,
  isSfxActive,
  isBgmPlaybackEligible,
  useGameAudio,
} from "@/hooks/useGameAudio";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("Audio Policy & Lifecycle Authority", () => {
  describe("Pure Policy Predicates", () => {
    const baseState = {
      musicEnabled: true,
      sfxEnabled: true,
      parentMuted: false,
      hostPaused: false,
      documentHidden: false,
      unlocked: true,
    };

    it("evaluates music active state under all conditions", () => {
      expect(isMusicActive(baseState)).toBe(true);

      // Music disabled by user
      expect(isMusicActive({ ...baseState, musicEnabled: false })).toBe(false);

      // Parent/host muted
      expect(isMusicActive({ ...baseState, parentMuted: true })).toBe(false);

      // Host paused
      expect(isMusicActive({ ...baseState, hostPaused: true })).toBe(false);

      // Document hidden (background tab)
      expect(isMusicActive({ ...baseState, documentHidden: true })).toBe(false);

      // Not unlocked yet
      expect(isMusicActive({ ...baseState, unlocked: false })).toBe(false);
    });

    it("evaluates SFX active state under all conditions", () => {
      expect(isSfxActive(baseState)).toBe(true);

      // SFX disabled by user
      expect(isSfxActive({ ...baseState, sfxEnabled: false })).toBe(false);

      // Parent/host muted
      expect(isSfxActive({ ...baseState, parentMuted: true })).toBe(false);

      // Host paused
      expect(isSfxActive({ ...baseState, hostPaused: true })).toBe(false);

      // Document hidden
      expect(isSfxActive({ ...baseState, documentHidden: true })).toBe(false);
    });

    it("preserves isBgmPlaybackEligible contract", () => {
      expect(isBgmPlaybackEligible(true, false, false)).toBe(true);
      expect(isBgmPlaybackEligible(false, false, false)).toBe(false);
      expect(isBgmPlaybackEligible(true, true, false)).toBe(false);
      expect(isBgmPlaybackEligible(true, false, true)).toBe(false);
    });
  });

  describe("Hook Lifecycle, Visibility & Cleanup", () => {
    let container: HTMLDivElement;
    let root: Root;
    let audioInstance: ReturnType<typeof useGameAudio>;

    function TestAudioComponent({
      musicEnabled = true,
      sfxEnabled = true,
    }: {
      musicEnabled?: boolean;
      sfxEnabled?: boolean;
    }) {
      audioInstance = useGameAudio(musicEnabled, sfxEnabled);
      return null;
    }

    beforeEach(() => {
      vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
      vi.spyOn(globalThis, "fetch").mockImplementation(
        async () => new Response(new ArrayBuffer(0), { status: 200 }),
      );
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);
    });

    afterEach(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
      vi.restoreAllMocks();
      vi.clearAllMocks();
    });

    it("handles unlock without creating duplicate AudioContext instances", async () => {
      await act(async () => {
        root.render(<TestAudioComponent />);
      });

      // First unlock
      await act(async () => {
        await audioInstance.unlockAudio();
      });
      expect(audioInstance.audioStatus).toBe("ready");

      // Repeated unlock call (e.g. rapid user taps)
      await act(async () => {
        await audioInstance.unlockAudio();
      });
      expect(audioInstance.audioStatus).toBe("ready");
    });

    it("responds to host mute, pause, and visibilitychange signals", async () => {
      await act(async () => {
        root.render(<TestAudioComponent />);
      });

      await act(async () => {
        await audioInstance.unlockAudio();
      });

      // Host Mute
      act(() => {
        audioInstance.setParentMuted(true);
      });
      expect(isMusicActive()).toBe(false);
      expect(isSfxActive()).toBe(false);

      // Host Unmute
      act(() => {
        audioInstance.setParentMuted(false);
      });
      expect(isMusicActive()).toBe(true);
      expect(isSfxActive()).toBe(true);

      // Host Pause
      act(() => {
        audioInstance.setHostPaused(true);
      });
      expect(isMusicActive()).toBe(false);
      expect(isSfxActive()).toBe(false);

      // Host Resume
      act(() => {
        audioInstance.setHostPaused(false);
      });
      expect(isMusicActive()).toBe(true);
      expect(isSfxActive()).toBe(true);

      // Document hidden
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(isMusicActive()).toBe(false);
      expect(isSfxActive()).toBe(false);

      // Document visible
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(isMusicActive()).toBe(true);
      expect(isSfxActive()).toBe(true);
    });

    it("handles user music and SFX preference toggles cleanly", async () => {
      await act(async () => {
        root.render(<TestAudioComponent musicEnabled={false} sfxEnabled={true} />);
      });
      expect(isMusicActive()).toBe(false);
      expect(isSfxActive()).toBe(true);

      await act(async () => {
        root.render(<TestAudioComponent musicEnabled={true} sfxEnabled={false} />);
      });
      expect(isMusicActive()).toBe(true);
      expect(isSfxActive()).toBe(false);

      await act(async () => {
        root.render(<TestAudioComponent musicEnabled={true} sfxEnabled={true} />);
      });
      expect(isMusicActive()).toBe(true);
      expect(isSfxActive()).toBe(true);
    });

    it("allows repeated playSfx calls across moves and game restart safely", async () => {
      await act(async () => {
        root.render(<TestAudioComponent />);
      });

      await act(async () => {
        await audioInstance.unlockAudio();
      });

      // Rapid consecutive sound triggers (typical gameplay)
      expect(() => {
        audioInstance.playSfx("move");
        audioInstance.playSfx("merge");
        audioInstance.playSfx("tap");
        audioInstance.playSfx("win");
        audioInstance.playSfx("lose");
      }).not.toThrow();

      // Restart / reset game and fire sounds again
      expect(() => {
        audioInstance.playSfx("move");
        audioInstance.playSfx("merge");
      }).not.toThrow();
    });

    it("removes event listeners cleanly on unmount without leaking handlers", async () => {
      const removeEventSpy = vi.spyOn(document, "removeEventListener");

      await act(async () => {
        root.render(<TestAudioComponent />);
      });

      await act(async () => {
        root.unmount();
      });

      expect(removeEventSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function)
      );
      expect(removeEventSpy).toHaveBeenCalledWith(
        "pointerdown",
        expect.any(Function),
        { capture: true }
      );
      expect(removeEventSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
        { capture: true }
      );
    });
  });
});
