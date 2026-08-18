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
  it("does not invent leaderboard entries when no local score exists", () => {
    const model = buildLeaderboardModel(stats({}), "Người chơi");

    expect(model.topEntries).toEqual([]);
  });

  it("ranks only the real local best score", () => {
    const model = buildLeaderboardModel(
      stats({
        bestScore: 1200,
        totalGames: 1,
        history: [{ date: "2026-06-24T00:00:00.000Z", score: 1200, maxTile: 64 }],
      }),
      "Tôi",
    );

    expect(model.topEntries).toEqual([
      expect.objectContaining({
        name: "Tôi",
        score: 1200,
        maxTile: 64,
        rank: 1,
        isLocal: true,
      }),
    ]);
    expect(model.currentPlayer).toBeNull();
  });

  it("uses an unknown rank for a player without a saved score", () => {
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
