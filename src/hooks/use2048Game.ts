import { useCallback, useEffect, useReducer } from "react";
import {
  addRandomTile,
  canMove,
  createInitialTiles,
  moveBoard,
} from "@/utils/gameLogic";
import type { BoardState, Direction, GameSnapshot, GameStatus } from "@/types";

interface State {
  current: BoardState;
  previous: GameSnapshot | null;
}

type Action =
  | { type: "MOVE"; direction: Direction }
  | { type: "RESET" }
  | { type: "UNDO" }
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

      const snapshot: GameSnapshot = {
        tiles: current.tiles,
        score: current.score,
        moveCount: current.moveCount,
      };

      const withSpawn = addRandomTile(moved);
      const newScore = current.score + scoreDelta;

      let status: GameStatus = "playing";
      if (!canMove(withSpawn)) status = "lost";

      return {
        previous: snapshot,
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
      // Remove a 3x3 area
      const r0 = Math.floor(Math.random() * 2);
      const c0 = Math.floor(Math.random() * 2);
      const toKeep = state.current.tiles.filter(
        t => !(t.r >= r0 && t.r <= r0 + 2 && t.c >= c0 && t.c <= c0 + 2)
      );
      return {
        ...state,
        current: {
          ...state.current,
          tiles: toKeep,
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
    case "UNDO": {
      // Allow undo even after lost — casual game should let the player recover
      if (!state.previous) return state;
      return {
        previous: null,
        current: {
          tiles: state.previous.tiles,
          score: state.previous.score,
          scoreDelta: 0,
          status: "playing",
          moveCount: state.previous.moveCount,
        },
      };
    }
    case "RESET":
      return { current: makeFreshBoard(), previous: null };
    default:
      return state;
  }
}

export function use2048Game(inputEnabled = true) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    current: makeFreshBoard(),
    previous: null,
  }));

  const move = useCallback((dir: Direction) => {
    dispatch({ type: "MOVE", direction: dir });
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
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
    canUndo: state.previous !== null && state.current.status === "playing",
    move,
    reset,
    undo,
    revive,
    doubleScore,
  };
}
