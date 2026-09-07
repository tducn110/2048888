/** Fail-closed adapter until a real rewarded-ad SDK contract is available. */
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

const activeBreak = false;
export function bootstrapGoogleH5Ads(): Promise<boolean> {
  return Promise.resolve(false);
}

export function setGoogleH5AdSound(sound: AdSound): void {
  void sound;
}

export async function showRewardedVideo(options: RewardedAdOptions): Promise<boolean> {
  void options;
  return false;
}

export async function showInterstitial(options: InterstitialAdOptions): Promise<void> {
  void options;
}

export function isAdBreakActive(): boolean {
  return activeBreak;
}
