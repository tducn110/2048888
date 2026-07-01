export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface TileCell {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

export interface GameSnapshot {
  tiles: TileCell[];
  score: number;
  moveCount: number;
}

export interface LocalStats {
  bestScore: number;
  lastScore: number;
}

export interface BoardState {
  tiles: TileCell[];
  score: number;
  scoreDelta: number;
  status: GameStatus;
  moveCount: number;
}

export interface TileConfig {
  value: number;
  label: string;
  colorBg: string;
  colorText: string;
  hasMascot: boolean;
}
