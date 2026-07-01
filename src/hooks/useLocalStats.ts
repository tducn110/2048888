import { useCallback, useEffect, useState } from "react";
import type { LocalStats } from "@/types";

const STORAGE_KEY = "bolacdauphong_v1_stats";

function loadStats(): LocalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as LocalStats;
    return {
      bestScore: parsed.bestScore ?? 0,
      lastScore: parsed.lastScore ?? 0,
    };
  } catch {
    return { bestScore: 0, lastScore: 0 };
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

  const recordGame = useCallback((score: number) => {
    setStats((prev) => {
      const next: LocalStats = {
        bestScore: Math.max(prev.bestScore, score),
        lastScore: score,
      };
      persistStats(next);
      return next;
    });
  }, []);

  const clearStats = useCallback(() => {
    const fresh: LocalStats = { bestScore: 0, lastScore: 0 };
    persistStats(fresh);
    setStats(fresh);
  }, []);

  return { stats, recordGame, clearStats };
}
