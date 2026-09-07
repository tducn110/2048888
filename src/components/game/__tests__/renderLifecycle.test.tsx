// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameBoard from "../GameBoard";
import type { TileCell } from "@/types";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const harness = vi.hoisted(() => ({
  resolveInit: null as (() => void) | null,
  setPaused: vi.fn(),
  renderTiles: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("../Pixi2048Renderer", () => ({
  Pixi2048Renderer: vi.fn().mockImplementation(() => ({
    init: vi.fn(() => new Promise<void>((resolve) => { harness.resolveInit = resolve; })),
    resize: vi.fn(),
    renderTiles: harness.renderTiles,
    setPaused: harness.setPaused,
    destroy: harness.destroy,
    app: { renderer: {} },
  })),
}));

describe("GameBoard renderer lifecycle", () => {
  let container: HTMLDivElement;
  let root: Root;
  const tiles: TileCell[] = [];

  beforeEach(() => {
    harness.resolveInit = null;
    harness.setPaused.mockReset();
    harness.renderTiles.mockReset();
    harness.destroy.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("applies the latest pause state after async init and toggles idempotently", async () => {
    await act(async () => root.render(<GameBoard tiles={tiles} background="#fff" paused />));
    expect(harness.setPaused).not.toHaveBeenCalled();

    await act(async () => harness.resolveInit?.());
    expect(harness.setPaused).toHaveBeenLastCalledWith(true);

    await act(async () => root.render(<GameBoard tiles={tiles} background="#fff" paused={false} />));
    expect(harness.setPaused).toHaveBeenLastCalledWith(false);
  });

  it("does not destroy an async-init renderer twice after unmount", async () => {
    await act(async () => root.render(<GameBoard tiles={tiles} background="#fff" paused />));
    await act(async () => root.unmount());
    expect(harness.destroy).toHaveBeenCalledTimes(1);
    await act(async () => harness.resolveInit?.());
    expect(harness.destroy).toHaveBeenCalledTimes(1);
  });
});
