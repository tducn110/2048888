// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import i18n, { LANGUAGE_STORAGE_KEY, getInitialLanguage } from "@/i18n";

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
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("vi");
    expect(i18n.t("settings.language")).toBe("Ngôn ngữ");
    expect(i18n.t("game.gameOver")).toBe("Hết cờ!");
  });

  it("persists when toggling back to English", async () => {
    await i18n.changeLanguage("vi");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("vi");

    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(i18n.t("settings.language")).toBe("Language");
  });

  it("migrates from legacy storage key if present", () => {
    localStorage.setItem("i18nextLng", "vi");
    expect(getInitialLanguage()).toBe("vi");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("vi");
  });

  it("falls back to 'en' when storage contains invalid language", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "invalid-lang");
    expect(getInitialLanguage()).toBe("en");
  });

  it("updates document.documentElement.lang on language change", async () => {
    await i18n.changeLanguage("vi");
    expect(document.documentElement.lang).toBe("vi");
    await i18n.changeLanguage("en");
    expect(document.documentElement.lang).toBe("en");
  });
});
