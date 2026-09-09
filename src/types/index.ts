export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "idle" | "playing" | "lost";

export interface TileCell {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}


export interface BoardState {
  tiles: TileCell[];
  score: number;
  scoreDelta: number;
  status: GameStatus;
  hasReached2048: boolean;
  moveCount: number;
  highestCelebratedMilestone?: number | null;
  celebrationMilestone?: number | null;
}

export interface TileConfig {
  value: number;
  label: string;
  colorBg: string;
  colorText: string;
  hasMascot: boolean;
}
