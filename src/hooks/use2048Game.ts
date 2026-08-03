import { useCallback, useEffect, useReducer } from "react";
import {
  addRandomTile,
  canMove,
  createInitialTiles,
  moveBoard,
  removeReviveTiles,
} from "@/utils/gameLogic";
import type { BoardState, Direction, GameStatus } from "@/types";

interface State {
  current: BoardState;
}

type Action =
  | { type: "MOVE"; direction: Direction }
  | { type: "RESET" }
  | { type: "REVIVE" }
  | { type: "DOUBLE_SCORE" };

function makeFreshBoard(): BoardState {
  return {
    tiles: createInitialTiles(),
    score: 0,
    scoreDelta: 0,
    status: "playing",
    moveCount: 0,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "MOVE": {
      const { current } = state;
      if (current.status === "lost") return state;

      const { tiles: moved, scoreDelta, moved: didMove } = moveBoard(
        current.tiles,
        action.direction
      );
      if (!didMove) return state;

      const withSpawn = addRandomTile(moved);
      const newScore = current.score + scoreDelta;

      let status: GameStatus = "playing";
      if (!canMove(withSpawn)) status = "lost";

      return {
        current: {
          tiles: withSpawn,
          score: newScore,
          scoreDelta,
          status,
          moveCount: current.moveCount + 1,
        },
      };
    }
    case "REVIVE": {
      if (state.current.status !== "lost") return state;
      const toKeep = removeReviveTiles(state.current.tiles);
      if (toKeep.length === state.current.tiles.length) return state;

      return {
        ...state,
        current: {
          ...state.current,
          tiles: toKeep,
          scoreDelta: 0,
          status: "playing",
        }
      };
    }
    case "DOUBLE_SCORE": {
      return {
        ...state,
        current: {
          ...state.current,
          score: state.current.score * 2,
        }
      };
    }
    case "RESET":
      return { current: makeFreshBoard() };
    default:
      return state;
  }
}

export function use2048Game(inputEnabled = true) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    current: makeFreshBoard(),
  }));

  const move = useCallback((dir: Direction) => {
    dispatch({ type: "MOVE", direction: dir });
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const revive = useCallback(() => dispatch({ type: "REVIVE" }), []);
  const doubleScore = useCallback(() => dispatch({ type: "DOUBLE_SCORE" }), []);

  // Keyboard
  useEffect(() => {
    if (!inputEnabled) return;

    const KEY_MAP: Record<string, Direction> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
      W: "up", S: "down", A: "left", D: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (!dir) return;

      // Don't intercept when typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;

      e.preventDefault();
      move(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputEnabled, move]);

  return {
    tiles: state.current.tiles,
    score: state.current.score,
    scoreDelta: state.current.scoreDelta,
    status: state.current.status,
    moveCount: state.current.moveCount,
    move,
    reset,
    revive,
    doubleScore,
  };
}
