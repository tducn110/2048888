// @vitest-environment jsdom

import { act, useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const harness = vi.hoisted(() => ({
  mountCount: 0,
  unmountCount: 0,
  nextInstanceId: 0,
  instanceId: null as number | null,
  gameOnDashboard: null as (() => void) | null,
  dashboardOnPlay: null as (() => void) | null,
  settingsOnBack: null as (() => void) | null,
}));

vi.mock("@/components/game/Game2048", () => ({
  default: function MockGame2048(props: { onDashboard: () => void }) {
    const id = useRef(++harness.nextInstanceId);
    useEffect(() => {
      harness.mountCount += 1;
      harness.instanceId = id.current;
      return () => {
        harness.unmountCount += 1;
      };
    }, []);
    harness.gameOnDashboard = props.onDashboard;
    return <div data-testid="game">game-{id.current}</div>;
  },
}));

vi.mock("@/components/screens/Dashboard", () => ({
  default: (props: { onPlay: () => void }) => {
    harness.dashboardOnPlay = props.onPlay;
    return <button onClick={props.onPlay}>back-to-game</button>;
  },
}));

vi.mock("@/components/screens/Settings", () => ({
  default: (props: { onBack: () => void }) => {
    harness.settingsOnBack = props.onBack;
    return <button onClick={props.onBack}>back-from-settings</button>;
  },
}));
vi.mock("@/components/background/CountrysideBackdrop", () => ({ default: () => null }));
vi.mock("@/hooks/useGameAudio", () => ({
  useGameAudio: () => ({
    playSfx: vi.fn(), audioStatus: "ready", unlockAudio: vi.fn(),
    setParentMuted: vi.fn(), setHostPaused: vi.fn(), startBgmFromUserGesture: vi.fn(),
  }),
}));
vi.mock("@/wink", () => ({
  useWink: () => ({
    hostPaused: false, parentMuted: false, error: null,
    leaderboard: [], playerEntry: null, bestScore: 0,
    refreshLeaderboard: vi.fn(async () => {}),
    submitScore: vi.fn(async () => {}),
    gameplayStart: vi.fn(), gameplayStop: vi.fn(),
  }),
}));

describe("App navigation ownership", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    harness.mountCount = 0;
    harness.unmountCount = 0;
    harness.nextInstanceId = 0;
    harness.instanceId = null;
    harness.gameOnDashboard = null;
    harness.dashboardOnPlay = null;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("keeps Game2048 mounted across Game → Dashboard → Game", async () => {
    await act(async () => root.render(<App />));
    expect(harness.mountCount).toBe(1);
    expect(harness.unmountCount).toBe(0);
    const originalInstanceId = harness.instanceId;
    expect(container.querySelector('[data-testid="game"]')?.textContent).toBe(`game-${originalInstanceId}`);

    await act(async () => harness.gameOnDashboard?.());
    expect(container.querySelector("button")?.textContent).toBe("back-to-game");
    expect(harness.mountCount).toBe(1);
    expect(harness.unmountCount).toBe(0);
    expect(harness.instanceId).toBe(originalInstanceId);

    await act(async () => harness.dashboardOnPlay?.());
    expect(container.querySelector('[data-testid="game"]')?.textContent).toBe(`game-${originalInstanceId}`);
    expect(harness.mountCount).toBe(1);
    expect(harness.unmountCount).toBe(0);
    expect(harness.instanceId).toBe(originalInstanceId);
  });

  it("navigates to settings on lost focus (blur/visibility hidden) and resumes on back", async () => {
    await act(async () => root.render(<App />));
    const originalInstanceId = harness.instanceId;
    expect(container.querySelector('[data-testid="game"]')?.textContent).toBe(`game-${originalInstanceId}`);

    // Lost focus via window blur
    await act(async () => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(container.querySelector("button")?.textContent).toBe("back-from-settings");
    expect(harness.mountCount).toBe(1);
    expect(harness.instanceId).toBe(originalInstanceId);

    // Click back from settings
    await act(async () => harness.settingsOnBack?.());
    expect(container.querySelector('[data-testid="game"]')?.textContent).toBe(`game-${originalInstanceId}`);
  });
});
