// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import Game2048 from "../Game2048";
import { use2048Game } from "@/hooks/use2048Game";
import type { TileCell } from "@/types";

vi.mock("@/hooks/use2048Game", () => ({ use2048Game: vi.fn() }));
const mockedUse2048Game = vi.mocked(use2048Game);
const testTiles: TileCell[] = [
  { id: "tile-1", row: 0, col: 0, value: 8, isNew: false, isMerged: false },
];

// Setup React ACT environment
(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

// Mock audio and ads
vi.mock("@/integrations/ads/googleH5Ads", () => ({
  showRewardedVideo: vi.fn(async () => true),
  bootstrapGoogleH5Ads: vi.fn(async () => true),
  setGoogleH5AdSound: vi.fn(),
  isAdBreakActive: vi.fn(() => false),
}));

// Mock Pixi2048Renderer to avoid canvas/webgl initialization issues in jsdom
vi.mock("../Pixi2048Renderer", () => {
  return {
    Pixi2048Renderer: vi.fn().mockImplementation(() => ({
      init: vi.fn().mockResolvedValue(undefined),
      resize: vi.fn(),
      renderTiles: vi.fn(),
      setPaused: vi.fn(),
      destroy: vi.fn(),
      app: {
        renderer: {},
        stop: vi.fn(),
        start: vi.fn(),
      },
    })),
  };
});

describe("Round Lifecycle & Finalization Boundary", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockedUse2048Game.mockReturnValue({
      tiles: testTiles,
      score: 100,
      scoreDelta: 0,
      status: "playing",
      hasReached2048: false,
      moveCount: 1,
      move: vi.fn(),
      reset: vi.fn(),
      revive: vi.fn(),
      doubleScore: vi.fn(),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  it("does not call onGameEnd prematurely mid-game; tracks round start", async () => {
    const onGameEnd = vi.fn();
    const onRoundStart = vi.fn();
    const onScoreDoubled = vi.fn();

    await act(async () => {
      root.render(
        <Game2048
          bestScore={1000}
          onGameEnd={onGameEnd}
          onRoundStart={onRoundStart}
          onScoreDoubled={onScoreDoubled}
          bgId={1}
          setBgId={vi.fn()}
          onSettings={vi.fn()}
          onDashboard={vi.fn()}
          playSfx={vi.fn()}
          audioStatus="ready"
          unlockAudio={vi.fn()}
          inputEnabled={true}
        />
      );
    });

    // 1. First valid move fires onRoundStart
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    });
    expect(onRoundStart).toHaveBeenCalledTimes(1);
    expect(onGameEnd).not.toHaveBeenCalled();
  });

  it("does not start a round for an invalid swipe", async () => {
    mockedUse2048Game.mockReturnValue({
      tiles: testTiles, score: 100, scoreDelta: 0, status: "playing",
      hasReached2048: false, moveCount: 0, move: vi.fn(), reset: vi.fn(),
      revive: vi.fn(), doubleScore: vi.fn(),
    });
    const onRoundStart = vi.fn();
    await act(async () => {
      root.render(<Game2048 bestScore={500} onGameEnd={vi.fn()} onRoundStart={onRoundStart}
        bgId={1} setBgId={vi.fn()} onSettings={vi.fn()} onDashboard={vi.fn()}
        playSfx={vi.fn()} audioStatus="ready" unlockAudio={vi.fn()} inputEnabled />);
    });
    const card = container.querySelector(".game-card") as HTMLElement;
    await act(async () => {
      card.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 100, clientY: 100 }));
      card.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: 140, clientY: 100 }));
    });
    expect(onRoundStart).not.toHaveBeenCalled();
  });

  it("starts exactly once when moveCount transitions to the first successful move", async () => {
    mockedUse2048Game.mockReturnValue({
      tiles: testTiles, score: 0, scoreDelta: 0, status: "playing",
      hasReached2048: false, moveCount: 0, move: vi.fn(), reset: vi.fn(),
      revive: vi.fn(), doubleScore: vi.fn(),
    });
    const onRoundStart = vi.fn();
    const props = { bestScore: 0, onGameEnd: vi.fn(), onRoundStart,
      bgId: 1, setBgId: vi.fn(), onSettings: vi.fn(), onDashboard: vi.fn(),
      playSfx: vi.fn(), audioStatus: "ready" as const, unlockAudio: vi.fn(), inputEnabled: true };
    await act(async () => { root.render(<Game2048 {...props} />); });
    expect(onRoundStart).not.toHaveBeenCalled();
    mockedUse2048Game.mockReturnValue({ ...mockedUse2048Game.mock.results[0]?.value, moveCount: 1 });
    await act(async () => { root.render(<Game2048 {...props} />); });
    expect(onRoundStart).toHaveBeenCalledTimes(1);
    await act(async () => { root.render(<Game2048 {...props} />); });
    expect(onRoundStart).toHaveBeenCalledTimes(1);
  });

  it("finalizes active round with current score on manual reset", async () => {
    const onGameEnd = vi.fn();
    const onRoundStart = vi.fn();

    await act(async () => {
      root.render(
        <Game2048
          bestScore={500}
          onGameEnd={onGameEnd}
          onRoundStart={onRoundStart}
          bgId={1}
          setBgId={vi.fn()}
          onSettings={vi.fn()}
          onDashboard={vi.fn()}
          playSfx={vi.fn()}
          audioStatus="ready"
          unlockAudio={vi.fn()}
          inputEnabled={true}
        />
      );
    });

    // First move starts round
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    });
    expect(onRoundStart).toHaveBeenCalledTimes(1);

    // Find reset button in HUD
    const resetBtn = container.querySelector(".game-reset-button") as HTMLButtonElement | null;
    expect(resetBtn).toBeTruthy();

    await act(async () => {
      resetBtn?.click();
    });

    // Manual reset finalizes exactly once with the current score and max tile.
    expect(onGameEnd).toHaveBeenCalledTimes(1);
    expect(onGameEnd.mock.calls[0]?.[0]).toBe(100);
    expect(onGameEnd.mock.calls[0]?.[1]).toBe(8);

    await act(async () => {
      resetBtn?.click();
    });
    expect(onGameEnd).toHaveBeenCalledTimes(1);
  });

  it("keeps decline and x2 before one explicit finalization", async () => {
    mockedUse2048Game.mockReturnValue({
      tiles: testTiles,
      score: 100,
      scoreDelta: 0,
      status: "lost",
      hasReached2048: false,
      moveCount: 1,
      move: vi.fn(),
      reset: vi.fn(),
      revive: vi.fn(),
      doubleScore: vi.fn(),
    });
    const onGameEnd = vi.fn();
    await act(async () => {
      root.render(
        <Game2048 bestScore={500} onGameEnd={onGameEnd} onRoundStart={vi.fn()}
          bgId={1} setBgId={vi.fn()} onSettings={vi.fn()} onDashboard={vi.fn()}
          playSfx={vi.fn()} audioStatus="ready" unlockAudio={vi.fn()} inputEnabled />,
      );
    });

    const buttons = () => Array.from(container.querySelectorAll("button")) as HTMLButtonElement[];
    expect(buttons().length).toBeGreaterThanOrEqual(2);
    await act(async () => { buttons()[buttons().length - 1]?.click(); });
    expect(onGameEnd).not.toHaveBeenCalled();

    await act(async () => { buttons()[buttons().length - 2]?.click(); });
    await act(async () => { buttons()[buttons().length - 1]?.click(); });
    expect(onGameEnd).toHaveBeenCalledTimes(1);
    expect(onGameEnd.mock.calls[0]?.[0]).toBe(200);

    await act(async () => { buttons()[buttons().length - 1]?.click(); });
    expect(onGameEnd).toHaveBeenCalledTimes(1);
  });

  it("finalizes the base score when ending without x2", async () => {
    mockedUse2048Game.mockReturnValue({
      tiles: testTiles, score: 100, scoreDelta: 0, status: "lost",
      hasReached2048: false, moveCount: 1, move: vi.fn(), reset: vi.fn(),
      revive: vi.fn(), doubleScore: vi.fn(),
    });
    const onGameEnd = vi.fn();
    await act(async () => {
      root.render(<Game2048 bestScore={500} onGameEnd={onGameEnd} onRoundStart={vi.fn()}
        bgId={1} setBgId={vi.fn()} onSettings={vi.fn()} onDashboard={vi.fn()}
        playSfx={vi.fn()} audioStatus="ready" unlockAudio={vi.fn()} inputEnabled />);
    });
    const buttons = () => Array.from(container.querySelectorAll("button")) as HTMLButtonElement[];
    await act(async () => { buttons()[buttons().length - 1]?.click(); });
    await act(async () => { buttons()[buttons().length - 1]?.click(); });
    expect(onGameEnd).toHaveBeenCalledTimes(1);
    expect(onGameEnd.mock.calls[0]?.[0]).toBe(100);
    expect(onGameEnd.mock.calls[0]?.[1]).toBe(8);
  });

  it("preserves the active board when navigation rerenders the mounted game", async () => {
    const onRoundStart = vi.fn();
    const onGameEnd = vi.fn();
    await act(async () => {
      root.render(<Game2048 bestScore={500} onGameEnd={onGameEnd} onRoundStart={onRoundStart}
        bgId={1} setBgId={vi.fn()} onSettings={vi.fn()} onDashboard={vi.fn()}
        playSfx={vi.fn()} audioStatus="ready" unlockAudio={vi.fn()} inputEnabled />);
    });
    expect(container.querySelector(".game-card")).toBeTruthy();
    expect(onRoundStart).toHaveBeenCalledTimes(1);
    await act(async () => {
      root.render(<Game2048 bestScore={500} onGameEnd={onGameEnd} onRoundStart={onRoundStart}
        bgId={2} setBgId={vi.fn()} onSettings={vi.fn()} onDashboard={vi.fn()}
        playSfx={vi.fn()} audioStatus="ready" unlockAudio={vi.fn()} inputEnabled />);
    });
    expect(container.querySelector(".game-card")).toBeTruthy();
    expect(onRoundStart).toHaveBeenCalledTimes(1);
    expect(onGameEnd).not.toHaveBeenCalled();
  });

  it("does not finalize an active round when the component unmounts", async () => {
    const onGameEnd = vi.fn();
    const onRoundStart = vi.fn();

    await act(async () => {
      root.render(
        <Game2048
          bestScore={500}
          onGameEnd={onGameEnd}
          onRoundStart={onRoundStart}
          bgId={1}
          setBgId={vi.fn()}
          onSettings={vi.fn()}
          onDashboard={vi.fn()}
          playSfx={vi.fn()}
          audioStatus="ready"
          unlockAudio={vi.fn()}
          inputEnabled={true}
        />
      );
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    expect(onRoundStart).toHaveBeenCalledTimes(1);
    expect(onGameEnd).not.toHaveBeenCalled();

    // Unmount is a UI lifecycle event, not an explicit end-game decision.
    await act(async () => {
      root.unmount();
    });

    expect(onGameEnd).not.toHaveBeenCalled();
  });
});
