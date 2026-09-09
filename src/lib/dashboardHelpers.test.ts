import { describe, expect, it } from "vitest";
import { BADGE_COLORS, buildRemoteModel } from "./dashboardHelpers";
import type { WinkLeaderboardEntry } from "@/integrations/wink/types";

describe("dashboardHelpers", () => {
  const dummyT = (key: string) => (key === "dashboard.anonymous" ? "Ẩn danh" : "Người chơi");

  function createEntry(partial: Partial<WinkLeaderboardEntry> & { id: string; rank: number; score: number }): WinkLeaderboardEntry {
    return {
      userId: null,
      isAnonymous: false,
      playTime: null,
      displayName: null,
      avatarUrl: null,
      createdAt: null,
      maxTile: 0,
      ...partial,
    };
  }

  it("exports valid BADGE_COLORS for top 3 rankings", () => {
    expect(BADGE_COLORS).toHaveLength(3);
    expect(BADGE_COLORS[0].label).toBe("Vang");
    expect(BADGE_COLORS[1].label).toBe("Bac");
    expect(BADGE_COLORS[2].label).toBe("Dong");
  });

  describe("buildRemoteModel", () => {
    it("handles empty remote leaderboard and null player", () => {
      const model = buildRemoteModel([], null, dummyT);
      expect(model.topEntries).toEqual([]);
      expect(model.currentPlayer).toBeNull();
    });

    it("maps remote leaderboard entries and marks local player", () => {
      const entries: WinkLeaderboardEntry[] = [
        createEntry({ id: "p1", rank: 1, score: 2048, maxTile: 2048, displayName: "Player 1", isAnonymous: false }),
        createEntry({ id: "p2", rank: 2, score: 1024, maxTile: 1024, displayName: null, isAnonymous: true }),
      ];
      const player: WinkLeaderboardEntry = entries[0];

      const model = buildRemoteModel(entries, player, dummyT);

      expect(model.topEntries).toHaveLength(2);
      expect(model.topEntries[0]).toEqual({
        name: "Player 1",
        score: 2048,
        maxTile: 2048,
        isLocal: true,
        rank: 1,
      });
      expect(model.topEntries[1]).toEqual({
        name: "Ẩn danh",
        score: 1024,
        maxTile: 1024,
        isLocal: false,
        rank: 2,
      });
      expect(model.currentPlayer).toEqual({
        name: "Player 1",
        score: 2048,
        maxTile: 2048,
        isLocal: true,
        rank: 1,
      });
    });

    it("caps top entries to 10", () => {
      const entries: WinkLeaderboardEntry[] = Array.from({ length: 15 }, (_, i) =>
        createEntry({
          id: `p${i + 1}`,
          rank: i + 1,
          score: (15 - i) * 100,
          maxTile: 512,
          displayName: `Player ${i + 1}`,
        })
      );

      const model = buildRemoteModel(entries, null, dummyT);
      expect(model.topEntries).toHaveLength(10);
      expect(model.topEntries[0].rank).toBe(1);
      expect(model.topEntries[9].rank).toBe(10);
    });
  });
});

