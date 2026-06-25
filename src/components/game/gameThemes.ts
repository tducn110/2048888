export const GAME_THEME_COUNT = 4;

export type MascotKind = "peanut" | "banhtung" | "tiguayel" | "dogoin";

export interface GameTheme {
  id: number;
  mascot: MascotKind;
  titleColor: string;
  titleShadow: string;
  panelBackground: string;
  panelBorder: string;
  panelShadow: string;
  scoreCardBg: string;
  scoreCardBorder: string;
  labelColor: string;
  valueColor: string;
  instructionBg: string;
  boardFrameBg: string;
  boardFrameBorder: string;
  boardBg: string;
  ctaGradient: string;
  ctaBorder: string;
  ctaShadow: string;
  settingsBg: string;
  settingsBorder: string;
  settingsColor: string;
  overlayBg: string;
  overlayPanelBg: string;
  overlayPanelBorder: string;
  danger: string;
  joinPanelMarginLeft: number;
  joinPanelPaddingLeft: number;
  joinPanelTextAlign: "left" | "center";
  joinPanelJustifyContent: "flex-start" | "center";
  instructionTextColor: string;
}

const THEMES: Record<number, GameTheme> = {
  1: {
    id: 1,
    mascot: "peanut",
    titleColor: "#74451f",
    titleShadow: "0 3px 0 rgba(255,255,255,0.5)",
    panelBackground: "linear-gradient(180deg, rgba(255,238,194,0.98) 0%, rgba(255,205,111,0.98) 100%)",
    panelBorder: "rgba(188,128,49,0.34)",
    panelShadow: "0 16px 40px rgba(114,82,37,0.22), 0 2px 0 rgba(255,255,255,0.62) inset",
    scoreCardBg: "rgba(255,245,211,0.9)",
    scoreCardBorder: "rgba(185,132,57,0.28)",
    labelColor: "#6e4d2f",
    valueColor: "#4b341f",
    instructionBg: "rgba(255,247,222,0.92)",
    boardFrameBg: "rgba(210,145,63,0.54)",
    boardFrameBorder: "rgba(169,103,43,0.2)",
    boardBg: "rgba(171,109,45,0.26)",
    ctaGradient: "linear-gradient(180deg, #ff7b38 0%, #e95b22 100%)",
    ctaBorder: "#c74818",
    ctaShadow: "0 3px 0 #b23a11, 0 8px 16px rgba(182,72,18,0.28)",
    settingsBg: "rgba(255,230,167,0.74)",
    settingsBorder: "rgba(183,113,35,0.42)",
    settingsColor: "#7b542d",
    overlayBg: "rgba(199,132,48,0.38)",
    overlayPanelBg: "rgba(253,246,234,0.95)",
    overlayPanelBorder: "rgba(176,107,38,0.32)",
    danger: "#c23838",
    joinPanelMarginLeft: -58,
    joinPanelPaddingLeft: 54,
    joinPanelTextAlign: "left",
    joinPanelJustifyContent: "flex-start",
    instructionTextColor: "#6e4d2f",
  },
  2: {
    id: 2,
    mascot: "dogoin",
    titleColor: "#8b5522",
    titleShadow: "0 3px 0 rgba(255,246,214,0.76)",
    panelBackground: "linear-gradient(180deg, rgba(255,224,164,0.98) 0%, rgba(255,184,70,0.98) 100%)",
    panelBorder: "rgba(204,128,37,0.36)",
    panelShadow: "0 16px 40px rgba(133,83,32,0.22), 0 2px 0 rgba(255,255,255,0.62) inset",
    scoreCardBg: "rgba(255,238,188,0.9)",
    scoreCardBorder: "rgba(194,126,44,0.3)",
    labelColor: "#8a5828",
    valueColor: "#6b401c",
    instructionBg: "rgba(255,247,216,0.92)",
    boardFrameBg: "rgba(219,139,45,0.48)",
    boardFrameBorder: "rgba(177,96,27,0.22)",
    boardBg: "rgba(174,101,32,0.24)",
    ctaGradient: "linear-gradient(180deg, #f49445 0%, #d86b22 100%)",
    ctaBorder: "#b95519",
    ctaShadow: "0 3px 0 #984311, 0 8px 16px rgba(165,82,22,0.28)",
    settingsBg: "rgba(255,230,159,0.82)",
    settingsBorder: "rgba(184,108,30,0.42)",
    settingsColor: "#8a5523",
    overlayBg: "rgba(202,124,35,0.34)",
    overlayPanelBg: "rgba(255,249,230,0.95)",
    overlayPanelBorder: "rgba(184,108,30,0.28)",
    danger: "#c23838",
    joinPanelMarginLeft: -78,
    joinPanelPaddingLeft: 74,
    joinPanelTextAlign: "left",
    joinPanelJustifyContent: "flex-start",
    instructionTextColor: "#7b4f25",
  },
  3: {
    id: 3,
    mascot: "banhtung",
    titleColor: "#2f6b35",
    titleShadow: "0 3px 0 rgba(246,255,214,0.72)",
    panelBackground: "linear-gradient(180deg, rgba(222,243,178,0.98) 0%, rgba(108,184,91,0.98) 100%)",
    panelBorder: "rgba(70,139,58,0.36)",
    panelShadow: "0 16px 40px rgba(47,98,48,0.24), 0 2px 0 rgba(255,255,255,0.6) inset",
    scoreCardBg: "rgba(197,232,143,0.9)",
    scoreCardBorder: "rgba(66,139,58,0.28)",
    labelColor: "#2d7438",
    valueColor: "#226432",
    instructionBg: "rgba(242,255,210,0.9)",
    boardFrameBg: "rgba(74,139,63,0.42)",
    boardFrameBorder: "rgba(41,107,48,0.24)",
    boardBg: "rgba(53,105,53,0.22)",
    ctaGradient: "linear-gradient(180deg, #86c85a 0%, #3f963d 100%)",
    ctaBorder: "#2e7c2f",
    ctaShadow: "0 3px 0 #236525, 0 8px 16px rgba(44,112,42,0.28)",
    settingsBg: "rgba(200,235,147,0.84)",
    settingsBorder: "rgba(63,136,50,0.42)",
    settingsColor: "#2e7434",
    overlayBg: "rgba(55,116,54,0.36)",
    overlayPanelBg: "rgba(247,255,226,0.95)",
    overlayPanelBorder: "rgba(63,136,50,0.26)",
    danger: "#c23838",
    joinPanelMarginLeft: -40,
    joinPanelPaddingLeft: 36,
    joinPanelTextAlign: "left",
    joinPanelJustifyContent: "flex-start",
    instructionTextColor: "#256531",
  },
  4: {
    id: 4,
    mascot: "tiguayel",
    titleColor: "#e85f12",
    titleShadow: "0 3px 0 rgba(255,246,217,0.72)",
    panelBackground: "linear-gradient(180deg, rgba(255,224,145,0.98) 0%, rgba(255,157,37,0.98) 100%)",
    panelBorder: "rgba(218,116,24,0.35)",
    panelShadow: "0 16px 40px rgba(147,79,24,0.23), 0 2px 0 rgba(255,255,255,0.56) inset",
    scoreCardBg: "rgba(255,151,54,0.9)",
    scoreCardBorder: "rgba(210,100,20,0.24)",
    labelColor: "#fff7dd",
    valueColor: "#ffffff",
    instructionBg: "rgba(255,235,177,0.9)",
    boardFrameBg: "rgba(243,137,25,0.48)",
    boardFrameBorder: "rgba(197,91,13,0.2)",
    boardBg: "rgba(214,112,25,0.22)",
    ctaGradient: "linear-gradient(180deg, #ff8f37 0%, #ef6e18 100%)",
    ctaBorder: "#ce5710",
    ctaShadow: "0 3px 0 #b2460b, 0 8px 16px rgba(180,74,13,0.28)",
    settingsBg: "rgba(255,219,126,0.82)",
    settingsBorder: "rgba(226,105,19,0.4)",
    settingsColor: "#e85f12",
    overlayBg: "rgba(223,120,21,0.36)",
    overlayPanelBg: "rgba(255,248,226,0.95)",
    overlayPanelBorder: "rgba(205,94,12,0.28)",
    danger: "#c23838",
    joinPanelMarginLeft: -48,
    joinPanelPaddingLeft: 44,
    joinPanelTextAlign: "left",
    joinPanelJustifyContent: "flex-start",
    instructionTextColor: "#9a4310",
  },
};

export function getGameTheme(themeId: number): GameTheme {
  return THEMES[themeId] ?? THEMES[1];
}

export function getNextGameThemeId(currentThemeId: number): number {
  const candidates = Array.from({ length: GAME_THEME_COUNT }, (_, index) => index + 1).filter(
    (themeId) => themeId !== currentThemeId
  );

  return candidates[Math.floor(Math.random() * candidates.length)] ?? 1;
}
