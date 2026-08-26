/** Mocked Ads adapter. The real SDK integration has been removed. */
export type AdSound = "on" | "off";

export interface AdLifecycle {
  beforeAd?: () => void;
  afterAd?: () => void;
}

export interface RewardedAdOptions extends AdLifecycle {
  name: string;
}

export interface InterstitialAdOptions extends AdLifecycle {
  name: string;
  type?: "next" | "start" | "pause" | "browse";
}

let activeBreak = false;
let configuredSound: AdSound = "on";

export function bootstrapGoogleH5Ads(): Promise<boolean> {
  return Promise.resolve(true);
}

export function setGoogleH5AdSound(sound: AdSound): void {
  configuredSound = sound;
}

function runLifecycleMock(
  lifecycle: AdLifecycle,
  outcome: "viewed" | "dismissed",
): Promise<boolean> {
  lifecycle.beforeAd?.();
  return new Promise((resolve) => {
    window.setTimeout(() => {
      lifecycle.afterAd?.();
      resolve(outcome === "viewed");
    }, 120);
  });
}

export async function showRewardedVideo(options: RewardedAdOptions): Promise<boolean> {
  if (activeBreak) return false;
  activeBreak = true;
  try {
    return await runLifecycleMock(options, "viewed");
  } finally {
    activeBreak = false;
  }
}

export async function showInterstitial(options: InterstitialAdOptions): Promise<void> {
  if (activeBreak) return;
  activeBreak = true;
  try {
    await runLifecycleMock(options, "dismissed");
  } finally {
    activeBreak = false;
  }
}

export function isAdBreakActive(): boolean {
  return activeBreak;
}
