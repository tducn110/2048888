import type { TileCell, Direction } from "@/types";

let _idCounter = 0;
export function genId(): string {
  _idCounter = (_idCounter + 1) % 99999;
  return `t${_idCounter}`;
}

// ── Grid helpers ─────────────────────────────────────────

export function tilesToGrid(tiles: TileCell[]): (TileCell | null)[][] {
  const grid: (TileCell | null)[][] = Array.from({ length: 4 }, () =>
    Array(4).fill(null)
  );
  for (const t of tiles) {
    if (t.row >= 0 && t.row < 4 && t.col >= 0 && t.col < 4) {
      grid[t.row][t.col] = t;
    }
  }
  return grid;
}

export function gridToTiles(grid: (TileCell | null)[][]): TileCell[] {
  const tiles: TileCell[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = grid[r][c];
      if (cell) tiles.push({ ...cell, row: r, col: c });
    }
  }
  return tiles;
}

function transpose(grid: (TileCell | null)[][]): (TileCell | null)[][] {
  return grid[0].map((_, c) => grid.map((row) => row[c]));
}

function flipH(grid: (TileCell | null)[][]): (TileCell | null)[][] {
  return grid.map((row) => [...row].reverse());
}

// ── Core merge ───────────────────────────────────────────

function slideRow(
  row: (TileCell | null)[],
  accumScore: { value: number }
): (TileCell | null)[] {
  const cells = row.filter((c): c is TileCell => c !== null);
  const result: (TileCell | null)[] = [];
  let i = 0;

  while (i < cells.length) {
    if (i + 1 < cells.length && cells[i].value === cells[i + 1].value) {
      const newVal = cells[i].value * 2;
      accumScore.value += newVal;
      result.push({
        ...cells[i],
        id: genId(),
        value: newVal,
        isMerged: true,
        isNew: false,
      });
      i += 2;
    } else {
      result.push({ ...cells[i], isMerged: false });
      i++;
    }
  }

  while (result.length < 4) result.push(null);
  return result;
}

// ── Public API ────────────────────────────────────────────

export interface MoveResult {
  tiles: TileCell[];
  scoreDelta: number;
  moved: boolean;
}

export function moveBoard(tiles: TileCell[], direction: Direction): MoveResult {
  let grid = tilesToGrid(tiles);
  const accumScore = { value: 0 };

  if (direction === "right") grid = flipH(grid);
  if (direction === "up") grid = transpose(grid);
  if (direction === "down") grid = flipH(transpose(grid));

  const slid = grid.map((row) => slideRow(row, accumScore));

  let result = slid;
  if (direction === "right") result = flipH(slid);
  if (direction === "up") result = transpose(slid);
  if (direction === "down") result = transpose(flipH(slid));

  const newTiles = gridToTiles(result);
  const moved = didTilesChange(tiles, newTiles);

  return { tiles: newTiles, scoreDelta: accumScore.value, moved };
}

function didTilesChange(prev: TileCell[], next: TileCell[]): boolean {
  if (prev.length !== next.length) return true;
  const prevMap = new Map(prev.map((t) => [`${t.row},${t.col}`, t.value]));
  for (const t of next) {
    if (prevMap.get(`${t.row},${t.col}`) !== t.value) return true;
  }
  return false;
}

export function addRandomTile(tiles: TileCell[]): TileCell[] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!occupied.has(`${r},${c}`)) empty.push({ row: r, col: c });
    }
  }
  if (!empty.length) return tiles;

  const pos = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const cleared = tiles.map((t) => ({ ...t, isNew: false, isMerged: false }));
  return [
    ...cleared,
    { id: genId(), value, row: pos.row, col: pos.col, isNew: true, isMerged: false },
  ];
}

export function canMove(tiles: TileCell[]): boolean {
  if (tiles.length < 16) return true;

  const grid = tilesToGrid(tiles);

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cur = grid[r][c];
      if (!cur) return true; // empty cell exists

      const right = c < 3 ? grid[r][c + 1] : null;
      const down  = r < 3 ? grid[r + 1][c] : null;

      if (right?.value === cur.value) return true;
      if (down?.value === cur.value) return true;
    }
  }

  return false;
}

export function hasWon(tiles: TileCell[]): boolean {
  return tiles.some((t) => t.value >= 2048);
}

export function createInitialTiles(): TileCell[] {
  return addRandomTile(addRandomTile([]));
}

export function getMaxTile(tiles: TileCell[]): number {
  return tiles.reduce((max, t) => Math.max(max, t.value), 0);
}
