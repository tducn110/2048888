import { describe, expect, it } from "vitest";
import type { LocalStats } from "@/types";
import { buildLeaderboardModel } from "./dashboardHelpers";

function stats(overrides: Partial<LocalStats>): LocalStats {
  return {
    bestScore: 0,
    lastScore: 0,
    totalGames: 0,
    history: [],
    ...overrides,
  };
}

describe("buildLeaderboardModel", () => {
  it("returns the top 10 leaderboard entries", () => {
    const model = buildLeaderboardModel(stats({}), "Người chơi");

    expect(model.topEntries).toHaveLength(10);
    expect(model.topEntries[0].rank).toBe(1);
    expect(model.topEntries[9].rank).toBe(10);
  });

  it("adds the current player separately when they are outside the top 10", () => {
    const model = buildLeaderboardModel(
      stats({
        bestScore: 1200,
        totalGames: 1,
        history: [{ date: "2026-06-24T00:00:00.000Z", score: 1200, maxTile: 64 }],
      }),
      "Tôi",
    );

    expect(model.topEntries).toHaveLength(10);
    expect(model.topEntries.some((entry) => entry.isLocal)).toBe(false);
    expect(model.currentPlayer).toMatchObject({
      name: "Tôi",
      score: 1200,
      maxTile: 64,
      rank: 11,
      isLocal: true,
    });
  });

  it("uses Unknown rank for a player without a saved score", () => {
    const model = buildLeaderboardModel(stats({}), "Tôi");

    expect(model.currentPlayer).toMatchObject({
      name: "Tôi",
      score: 0,
      maxTile: 0,
      rank: null,
      isLocal: true,
    });
  });
});
