import { describe, expect, it, vi } from "vitest";
import {
  bootstrapGoogleH5Ads,
  isAdBreakActive,
  showInterstitial,
  showRewardedVideo,
} from "./googleH5Ads";

describe("Google H5 ads adapter", () => {
  it("fails closed until a real SDK is configured", async () => {
    expect(await bootstrapGoogleH5Ads()).toBe(false);
    expect(await showRewardedVideo({ name: "revive_after_loss" })).toBe(false);
    await expect(showInterstitial({ name: "pause" })).resolves.toBeUndefined();
    expect(isAdBreakActive()).toBe(false);
  });

  it("never invokes lifecycle callbacks for unavailable ads", async () => {
    const beforeAd = vi.fn();
    const afterAd = vi.fn();
    await showRewardedVideo({ name: "double_final_score", beforeAd, afterAd });
    await showInterstitial({ name: "browse", beforeAd, afterAd });
    expect(beforeAd).not.toHaveBeenCalled();
    expect(afterAd).not.toHaveBeenCalled();
  });
});
