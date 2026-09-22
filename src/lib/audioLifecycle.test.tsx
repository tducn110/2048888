// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUDIO_VOLUME,
  isMusicActive,
  isSfxActive,
  isBgmPlaybackEligible,
  playButtonSfx,
  shouldPlayButtonSfx,
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

    it("calibrates audio volume ratio against 01_fruit standards", () => {
      expect(AUDIO_VOLUME.bgm).toBe(0.15);
      expect(AUDIO_VOLUME.button).toBe(0.65);
      expect(AUDIO_VOLUME.move).toBe(0.80);
      expect(AUDIO_VOLUME.merge).toBe(0.90);
    });

    it("evaluates shouldPlayButtonSfx targeting rules accurately", () => {
      const btn = document.createElement("button");
      expect(shouldPlayButtonSfx(btn)).toBe(true);

      const spanInsideBtn = document.createElement("span");
      btn.appendChild(spanInsideBtn);
      expect(shouldPlayButtonSfx(spanInsideBtn)).toBe(true);

      const roleBtn = document.createElement("div");
      roleBtn.setAttribute("role", "button");
      expect(shouldPlayButtonSfx(roleBtn)).toBe(true);

      const link = document.createElement("a");
      link.href = "#";
      expect(shouldPlayButtonSfx(link)).toBe(true);

      // Disabled button
      const disabledBtn = document.createElement("button");
      disabledBtn.disabled = true;
      expect(shouldPlayButtonSfx(disabledBtn)).toBe(false);

      // Aria-disabled button
      const ariaDisabledBtn = document.createElement("button");
      ariaDisabledBtn.setAttribute("aria-disabled", "true");
      expect(shouldPlayButtonSfx(ariaDisabledBtn)).toBe(false);

      // data-sfx="off" opt-out
      const optOutBtn = document.createElement("button");
      optOutBtn.setAttribute("data-sfx", "off");
      expect(shouldPlayButtonSfx(optOutBtn)).toBe(false);

      // Plain container (board / background)
      const plainDiv = document.createElement("div");
      expect(shouldPlayButtonSfx(plainDiv)).toBe(false);
      expect(shouldPlayButtonSfx(null)).toBe(false);
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
        audioInstance.playSfx("tap");
        audioInstance.playSfx("move");
        audioInstance.playSfx("merge");
        audioInstance.playSfx("win");
        audioInstance.playSfx("lose");
      }).not.toThrow();

      // Restart / reset game and fire sounds again
      expect(() => {
        audioInstance.playSfx("tap");
        audioInstance.playSfx("move");
        audioInstance.playSfx("merge");
      }).not.toThrow();
    });

    it("triggers button tap SFX handling on button pointerdown and Enter keydown", async () => {
      await act(async () => {
        root.render(<TestAudioComponent />);
      });

      const button = document.createElement("button");
      document.body.appendChild(button);

      expect(() => {
        act(() => {
          button.dispatchEvent(
            new MouseEvent("pointerdown", { bubbles: true, cancelable: true })
          );
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          button.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true })
          );
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          button.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
          );
        });
      }).not.toThrow();

      expect(() => {
        playButtonSfx();
      }).not.toThrow();

      button.remove();
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
        "click",
        expect.any(Function),
        { capture: true }
      );
      expect(removeEventSpy).toHaveBeenCalledWith(
        "touchstart",
        expect.any(Function),
        { capture: true }
      );
      expect(removeEventSpy).toHaveBeenCalledWith(
        "touchend",
        expect.any(Function),
        { capture: true }
      );
      expect(removeEventSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
        { capture: true }
      );
    });

    it("unlocks audio on arrow keydown, touchstart, and touchend events", async () => {
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, "play");

      await act(async () => {
        root.render(<TestAudioComponent />);
      });

      // User presses ArrowUp to move a tile
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      });
      expect(playSpy).toHaveBeenCalled();

      // Touchstart event on board
      act(() => {
        document.dispatchEvent(new Event("touchstart"));
      });
      expect(playSpy).toHaveBeenCalled();

      // Touchend event on swipe finish
      act(() => {
        document.dispatchEvent(new Event("touchend"));
      });
      expect(playSpy).toHaveBeenCalled();
    });
  });
});
