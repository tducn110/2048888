import { describe, it, expect } from "vitest";
import { isBgmPlaybackEligible } from "@/hooks/useGameAudio";

describe("isBgmPlaybackEligible — pure predicate", () => {
  it("music ON + not paused + visible → true", () => {
    expect(isBgmPlaybackEligible(true, false, false)).toBe(true);
  });

  it("music OFF → false", () => {
    expect(isBgmPlaybackEligible(false, false, false)).toBe(false);
  });

  it("hostPaused → false", () => {
    expect(isBgmPlaybackEligible(true, true, false)).toBe(false);
  });

  it("document hidden → false", () => {
    expect(isBgmPlaybackEligible(true, false, true)).toBe(false);
  });

  it("all不利 conditions → false", () => {
    expect(isBgmPlaybackEligible(false, true, true)).toBe(false);
  });
});
