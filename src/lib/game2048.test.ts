/**
 * game2048.test.ts
 * Unit tests for core 2048 game logic in src/utils/gameLogic.ts
 * Phase 5 — Test readiness
 *
 * Run with: npx vitest run
 */

import { describe, it, expect } from "vitest";
import {
  moveBoard,
  canMove,
  hasWon,
  addRandomTile,
  tilesToGrid,
  gridToTiles,
  removeReviveTiles,
} from "@/utils/gameLogic";
import type { TileCell } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
function tile(value: number, row: number, col: number): TileCell {
  return { id: `test-${_id++}`, value, row, col, isNew: false, isMerged: false };
}

/** Build a full 4×4 board from a 2D array (0 = empty) */
function fromGrid(matrix: number[][]): TileCell[] {
  const tiles: TileCell[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (matrix[r][c]) tiles.push(tile(matrix[r][c], r, c));
    }
  }
  return tiles;
}

/** Collapse the tile list into a 4×4 number array for easy assertions */
function toMatrix(tiles: TileCell[]): number[][] {
  const m = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (const t of tiles) m[t.row][t.col] = t.value;
  return m;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("moveBoard — left", () => {
  it("slides tiles to the left", () => {
    const tiles = fromGrid([
      [0, 0, 2, 0],
      [0, 0, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { tiles: result, moved } = moveBoard(tiles, "left");
    const m = toMatrix(result);
    expect(moved).toBe(true);
    expect(m[0][0]).toBe(2);
    expect(m[1][0]).toBe(4);
  });

  it("merges equal adjacent tiles into one", () => {
    const tiles = fromGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { tiles: result, scoreDelta, moved } = moveBoard(tiles, "left");
    const m = toMatrix(result);
    expect(moved).toBe(true);
    expect(m[0][0]).toBe(4);
    expect(m[0][1]).toBe(0);
    expect(scoreDelta).toBe(4);
  });

  it("does NOT double-merge in a single move (2 2 2 2 → 4 4 0 0)", () => {
    const tiles = fromGrid([
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { tiles: result, scoreDelta } = moveBoard(tiles, "left");
    const m = toMatrix(result);
    expect(m[0][0]).toBe(4);
    expect(m[0][1]).toBe(4);
    expect(m[0][2]).toBe(0);
    expect(m[0][3]).toBe(0);
    expect(scoreDelta).toBe(8); // 4 + 4
  });

  it("returns moved=false when board is unchanged", () => {
    const tiles = fromGrid([
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { moved } = moveBoard(tiles, "left");
    expect(moved).toBe(false);
  });
});

describe("moveBoard — right", () => {
  it("merges and slides to the right", () => {
    const tiles = fromGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { tiles: result } = moveBoard(tiles, "right");
    const m = toMatrix(result);
    expect(m[0][3]).toBe(4);
    expect(m[0][2]).toBe(0);
  });
});

describe("moveBoard — up", () => {
  it("merges and slides upward", () => {
    const tiles = fromGrid([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { tiles: result, scoreDelta } = moveBoard(tiles, "up");
    const m = toMatrix(result);
    expect(m[0][0]).toBe(4);
    expect(m[1][0]).toBe(0);
    expect(scoreDelta).toBe(4);
  });
});

describe("moveBoard — down", () => {
  it("merges and slides downward", () => {
    const tiles = fromGrid([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const { tiles: result } = moveBoard(tiles, "down");
    const m = toMatrix(result);
    expect(m[3][0]).toBe(4);
    expect(m[2][0]).toBe(0);
  });
});

describe("canMove", () => {
  it("returns true when board has empty cells", () => {
    const tiles = fromGrid([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 0],
      [0, 0, 0, 0],
    ]);
    expect(canMove(tiles)).toBe(true);
  });

  it("returns true when adjacent tiles can merge", () => {
    // This board has adjacent mergeable tiles in the bottom row
    const mergeable = fromGrid([
      [2, 4,   8,  16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 32768],
    ]);
    expect(canMove(mergeable)).toBe(true);
  });

  it("returns false when no moves possible", () => {
    // Fully packed, no adjacent pairs
    const tiles = fromGrid([
      [2,    4,    2,    4   ],
      [4,    2,    4,    2   ],
      [2,    4,    2,    4   ],
      [4,    2,    4,    2   ],
    ]);
    expect(canMove(tiles)).toBe(false);
  });
});

describe("hasWon", () => {
  it("returns false when no tile reaches 2048", () => {
    const tiles = fromGrid([
      [1024, 512, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    expect(hasWon(tiles)).toBe(false);
  });

  it("returns true when a 2048 tile exists", () => {
    const tiles = fromGrid([
      [2048, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    expect(hasWon(tiles)).toBe(true);
  });

  it("returns true for values > 2048", () => {
    const tiles = fromGrid([
      [4096, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    expect(hasWon(tiles)).toBe(true);
  });
});

describe("addRandomTile", () => {
  it("adds exactly one tile", () => {
    const tiles = fromGrid([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const result = addRandomTile(tiles);
    expect(result.length).toBe(2);
  });

  it("marks the new tile with isNew=true", () => {
    const tiles: TileCell[] = [];
    const result = addRandomTile(tiles);
    const newTile = result.find((t) => t.isNew);
    expect(newTile).toBeDefined();
    expect([2, 4]).toContain(newTile!.value);
  });

  it("does not add a tile to a full board", () => {
    const tiles = fromGrid([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ]);
    const result = addRandomTile(tiles);
    expect(result.length).toBe(16);
  });
});

describe("removeReviveTiles", () => {
  it("removes every 2 and 4 tile and keeps higher tiles", () => {
    const tiles = fromGrid([
      [2, 4, 8, 16],
      [32, 2, 64, 4],
      [128, 256, 512, 1024],
      [2048, 4096, 8192, 16384],
    ]);

    const result = removeReviveTiles(tiles);

    expect(toMatrix(result)).toEqual([
      [0, 0, 8, 16],
      [32, 0, 64, 0],
      [128, 256, 512, 1024],
      [2048, 4096, 8192, 16384],
    ]);
  });
});

describe("tilesToGrid / gridToTiles roundtrip", () => {
  it("preserves all tiles through the roundtrip", () => {
    const original = fromGrid([
      [2, 0, 4, 0],
      [0, 8, 0, 16],
      [0, 0, 0, 0],
      [32, 0, 0, 0],
    ]);
    const grid = tilesToGrid(original);
    const restored = gridToTiles(grid);
    const origMatrix = toMatrix(original);
    const restoredMatrix = toMatrix(restored);
    expect(restoredMatrix).toEqual(origMatrix);
  });
});
