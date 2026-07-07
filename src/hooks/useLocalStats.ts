import { useCallback, useEffect, useState } from "react";
import type { HistoryEntry, LocalStats } from "@/types";

const STORAGE_KEY = "bolacdauphong_v1_stats";
const MAX_HISTORY = 20;

function loadStats(): LocalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as LocalStats;
    return {
      bestScore: parsed.bestScore ?? 0,
      lastScore: parsed.lastScore ?? 0,
      totalGames: parsed.totalGames ?? 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { bestScore: 0, lastScore: 0, totalGames: 0, history: [] };
  }
}

function persistStats(stats: LocalStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function useLocalStats() {
  const [stats, setStats] = useState<LocalStats>(loadStats);

  useEffect(() => {
    const onFocus = () => setStats(loadStats());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const recordGame = useCallback((score: number, maxTile: number) => {
    setStats((prev) => {
      const entry: HistoryEntry = {
        date: new Date().toISOString(),
        score,
        maxTile,
      };
      const next: LocalStats = {
        bestScore: Math.max(prev.bestScore, score),
        lastScore: score,
        totalGames: prev.totalGames + 1,
        history: [entry, ...prev.history].slice(0, MAX_HISTORY),
      };
      persistStats(next);
      return next;
    });
  }, []);

  const clearStats = useCallback(() => {
    const fresh: LocalStats = { bestScore: 0, lastScore: 0, totalGames: 0, history: [] };
    persistStats(fresh);
    setStats(fresh);
  }, []);

  const updateLastGameScore = useCallback((newScore: number) => {
    setStats((prev) => {
      if (prev.history.length === 0) return prev;
      const latest = prev.history[0];
      const updatedLatest = { ...latest, score: newScore };
      const next: LocalStats = {
        ...prev,
        bestScore: Math.max(prev.bestScore, newScore),
        lastScore: newScore,
        history: [updatedLatest, ...prev.history.slice(1)],
      };
      persistStats(next);
      return next;
    });
  }, []);

  return { stats, recordGame, clearStats, updateLastGameScore };
}
