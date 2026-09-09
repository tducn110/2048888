/**
 * game2048.test.ts
 * Unit tests for core 2048 game logic in src/utils/gameLogic.ts
 * Phase 5 — Test readiness
 *
 * Run with: npx vitest run
 */

import { describe, it, expect, vi, afterEach } from "vitest";
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

  it("removes minimum value tiles as fallback if no 2 or 4 tiles exist", () => {
    const tiles = fromGrid([
      [8, 16, 32, 64],
      [16, 8, 64, 128],
      [32, 64, 128, 256],
      [64, 128, 256, 512],
    ]);

    const result = removeReviveTiles(tiles);

    expect(toMatrix(result)).toEqual([
      [0, 16, 32, 64],
      [16, 0, 64, 128],
      [32, 64, 128, 256],
      [64, 128, 256, 512],
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

// ── Milestone 2048 — latching behavior via reducer ──────────────────────────

import { reducer, makeFreshBoard } from "@/hooks/use2048Game";
import type { State } from "@/hooks/use2048Game";

describe("milestone 2048 — latching behavior via reducer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fresh state hasReached2048=false", () => {
    const state: State = { current: makeFreshBoard() };
    expect(state.current.hasReached2048).toBe(false);
  });

  it("first move reaching >=2048 sets hasReached2048=true, status=playing", () => {
    // Controlled board: left merge of two 1024s creates 2048.
    // After merge the board has 15 tiles; spawned tile goes to (1,3) — board
    // still has legal moves (4s at (2,0)&(3,0) can merge on a later move).
    const initial: State = {
      current: {
        ...makeFreshBoard(),
        tiles: fromGrid([
          [1024, 1024, 4, 8],
          [2,    4,    8, 0],
          [4,    2,    4, 8],
          [8,    4,    2, 4],
        ]),
        status: "playing",
      },
    };

    // Math.random: first call → position index 0 of empty cells, second → value 2
    vi.spyOn(Math, "random").mockReturnValue(0);

    const next = reducer(initial, { type: "MOVE", direction: "left" });

    expect(next.current.hasReached2048).toBe(true);
    expect(next.current.status).toBe("playing");
  });

  it("later moves preserve latched hasReached2048=true", () => {
    // Board already contains a 2048 tile from a prior move.
    const initial: State = {
      current: {
        ...makeFreshBoard(),
        tiles: fromGrid([
          [2048, 4, 8, 2],
          [4,    2, 4, 8],
          [8,    4, 2, 4],
          [2,    8, 4, 2],
        ]),
        hasReached2048: true,
        status: "playing",
      },
    };

    // Spawned tile goes to (0,3) — no merge possible, but status stays playing
    // because other legal moves exist on the board.
    vi.spyOn(Math, "random").mockReturnValue(0);

    const next = reducer(initial, { type: "MOVE", direction: "left" });

    expect(next.current.hasReached2048).toBe(true);
  });

  it("MOVE that first reaches >=2048 AND leaves no legal moves → hasReached2048=true, status=lost", () => {
    // Board where left move merges two 1024s into 2048, and the only empty
    // cell after merge is filled by the spawned tile — resulting in a full
    // board with no adjacent equal tiles (no legal moves).
    //
    // Pre-move layout (16 tiles, full board):
    //   [1024, 1024, 2, 8]    ← left merge → [2048, 2, 8, null]
    //   [4,    8,    2, 4]    → unchanged
    //   [8,    2,    4, 8]    → unchanged
    //   [2,    4,    8, 2]    → unchanged
    //
    // After merge: one empty cell at (0,3).
    // Mock Math.random → 0: picks first empty cell (0,3), spawns value 2.
    //
    // Resulting board (16 tiles, full):
    //   [2048, 2, 8, 2]    no adjacent equals
    //   [4,    8, 2, 4]    no adjacent equals
    //   [8,    2, 4, 8]    no adjacent equals
    //   [2,    4, 8, 2]    no adjacent equals
    //
    // canMove = false → status = "lost"
    // hasReached2048 = true (latched)
    const initial: State = {
      current: {
        ...makeFreshBoard(),
        tiles: fromGrid([
          [1024, 1024, 2, 8],
          [4,    8,    2, 4],
          [8,    2,    4, 8],
          [2,    4,    8, 2],
        ]),
        status: "playing",
      },
    };

    vi.spyOn(Math, "random").mockReturnValue(0);

    const next = reducer(initial, { type: "MOVE", direction: "left" });

    expect(next.current.hasReached2048).toBe(true);
    expect(next.current.status).toBe("lost");
  });

  it("lost → REVIVE preserves hasReached2048=true", () => {
    const initial: State = {
      current: {
        ...makeFreshBoard(),
        tiles: fromGrid([
          [2048, 4, 8, 2],
          [4,    2, 4, 8],
          [8,    4, 2, 4],
          [2,    8, 4, 2],
        ]),
        hasReached2048: true,
        status: "lost",
      },
    };

    const next = reducer(initial, { type: "REVIVE" });

    expect(next.current.hasReached2048).toBe(true);
    expect(next.current.status).toBe("playing");
  });

  it("RESET returns hasReached2048=false", () => {
    const initial: State = {
      current: {
        ...makeFreshBoard(),
        hasReached2048: true,
        status: "playing",
      },
    };

    const next = reducer(initial, { type: "RESET" });

    expect(next.current.hasReached2048).toBe(false);
    expect(next.current.status).toBe("playing");
  });

  it("MOVE while already lost returns unchanged state", () => {
    const initial: State = {
      current: {
        ...makeFreshBoard(),
        tiles: fromGrid([
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2],
        ]),
        hasReached2048: true,
        status: "lost",
      },
    };

    const next = reducer(initial, { type: "MOVE", direction: "left" });

    expect(next).toBe(initial);
    expect(next.current.status).toBe("lost");
    expect(next.current.hasReached2048).toBe(true);
  });
});

describe("Milestone celebration subsystem", () => {
  it("moveBoard emits milestoneCreated when merge produces 2048", () => {
    const tiles = fromGrid([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const res = moveBoard(tiles, "left");
    expect(res.moved).toBe(true);
    expect(res.milestoneCreated).toBe(2048);
  });

  it("moveBoard applies highest-only policy when multiple milestones created in one move", () => {
    // 1024+1024 -> 2048, 2048+2048 -> 4096 in the same swipe
    const tiles = fromGrid([
      [1024, 1024, 0, 0],
      [2048, 2048, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const res = moveBoard(tiles, "left");
    expect(res.moved).toBe(true);
    expect(res.milestoneCreated).toBe(4096);
  });

  it("moveBoard returns milestoneCreated=null for normal non-milestone merges", () => {
    const tiles = fromGrid([
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const res = moveBoard(tiles, "left");
    expect(res.moved).toBe(true);
    expect(res.milestoneCreated).toBeNull();
  });

  it("reducer tracks highestCelebratedMilestone monotonically without duplicate celebrations", () => {
    // Initial state
    let state: State = {
      current: {
        ...makeFreshBoard(),
        tiles: fromGrid([
          [1024, 1024, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]),
      },
    };

    // First merge reaches 2048 -> triggers celebration
    state = reducer(state, { type: "MOVE", direction: "left" });
    expect(state.current.highestCelebratedMilestone).toBe(2048);
    expect(state.current.celebrationMilestone).toBe(2048);

    // Setup another merge of 1024+1024 -> 2048
    state = {
      current: {
        ...state.current,
        tiles: fromGrid([
          [1024, 1024, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]),
      },
    };
    state = reducer(state, { type: "MOVE", direction: "left" });
    // Should NOT celebrate 2048 again because highestCelebratedMilestone is already 2048
    expect(state.current.highestCelebratedMilestone).toBe(2048);
    expect(state.current.celebrationMilestone).toBeNull();

    // Setup merge of 2048+2048 -> 4096
    state = {
      current: {
        ...state.current,
        tiles: fromGrid([
          [2048, 2048, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]),
      },
    };
    state = reducer(state, { type: "MOVE", direction: "left" });
    // Higher milestone 4096 triggers celebration
    expect(state.current.highestCelebratedMilestone).toBe(4096);
    expect(state.current.celebrationMilestone).toBe(4096);

    // RESET clears highestCelebratedMilestone
    state = reducer(state, { type: "RESET" });
    expect(state.current.highestCelebratedMilestone).toBeNull();
    expect(state.current.celebrationMilestone).toBeNull();
  });
});
