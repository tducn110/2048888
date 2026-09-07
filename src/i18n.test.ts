// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import i18n from "@/i18n";

describe("i18n configuration and persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to English ('en') when no language is saved in localStorage", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
    expect(i18n.t("settings.language")).toBe("Language");
    expect(i18n.t("game.gameOver")).toBe("Game Over!");
  });

  it("persists language choice to localStorage when user changes language", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.language).toBe("vi");
    expect(localStorage.getItem("i18nextLng")).toBe("vi");
    expect(i18n.t("settings.language")).toBe("Ngôn ngữ");
    expect(i18n.t("game.gameOver")).toBe("Hết cờ!");
  });

  it("persists when toggling back to English", async () => {
    await i18n.changeLanguage("vi");
    expect(localStorage.getItem("i18nextLng")).toBe("vi");

    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
    expect(localStorage.getItem("i18nextLng")).toBe("en");
    expect(i18n.t("settings.language")).toBe("Language");
  });
});
