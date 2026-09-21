import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGE_STORAGE_KEY = '02-2048-language';

type SupportedLanguage = 'vi' | 'en';
export const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
  value === 'vi' || value === 'en';

export const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(value)) return value;
  } catch {
    // Storage read failure fallback
  }
  return 'en';
};

export const persistLanguage = (language: string): void => {
  const normalized = language.split('-')[0];
  if (typeof window === 'undefined' || !isSupportedLanguage(normalized)) return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = normalized;
    }
  } catch {
    // Optional persistence
  }
};

export const formatNumber = (value: number, lang?: string): string => {
  const current = lang || i18n.resolvedLanguage || i18n.language || 'en';
  return value.toLocaleString(current.startsWith('vi') ? 'vi-VN' : 'en-US');
};

const resources = {
  en: {
    translation: {
      "common": {
        "back": "← Back"
      },
      "wink": {
        "CAPABILITY_DENIED": "This action is not permitted for the current session.",
        "SESSION_EXPIRED": "The game session has expired.",
        "MESSAGE_REJECTED": "Invalid message received from Wink.",
        "API_NETWORK_ERROR": "Unable to connect to Wink services."
      },
      "dashboard": {
        "anonymous": "Anonymous Player",
        "player": "Player",
        "yourRecord": "Your Record",
        "ranking": "Ranking 1-10",
        "topScore": "Top score",
        "noRecords": "No records yet. Play to set the first record.",
        "yourRanking": "Your ranking",
        "none": "None", "leaderboard": "Leaderboard"
      },
      "settings": {
        "title": "Settings",
        "music": "Background music",
        "sfx": "Sound effects",
        "language": "Language",
        "on": "On",
        "off": "Off",
        "en": "EN",
        "vi": "VI"
      },
      "game": {
        "score": "SCORE",
        "best": "BEST",
        "gameOver": "Game Over!",
        "youLost": "You Lost!",
        "noMoves": "No more moves available",
        "tryAgain": "Try Again",
        "revive": "Revive",
        "milestone": "2048!",
        "milestoneMsg": "You've reached 2048 tile!",
        "keepPlaying": "Keep Playing",
        "continuePlaying": "Continue Playing",
        "no": "No",
        "x2Score": "2X Score",
        "end": "End",
        "playNow": "Play Now",
        "tapToStartAudio": "Tap to start and enable sound",
        "loadingAudio": "Loading audio...",
        "hudScore": "Score",
        "hudBest": "Best",
        "hudInstruction": "Join numbers to 2048!",
        "hudRestart": "Restart",
        "board": "2048 Game Board"
      }
    }
  },
  vi: {
    translation: {
      "common": {
        "back": "← Quay lại"
      },
      "wink": {
        "CAPABILITY_DENIED": "Thao tác này không được cấp quyền cho phiên hiện tại.",
        "SESSION_EXPIRED": "Phiên chơi đã hết hạn.",
        "MESSAGE_REJECTED": "Thông điệp từ Wink không hợp lệ.",
        "API_NETWORK_ERROR": "Không thể kết nối dịch vụ Wink."
      },
      "dashboard": {
        "anonymous": "Người chơi ẩn danh",
        "player": "Người chơi",
        "yourRecord": "Kỷ Lục Của Bạn",
        "ranking": "Xếp hạng 1-10",
        "topScore": "Top điểm",
        "noRecords": "Chưa có thành tích. Hãy chơi để thiết lập kỷ lục đầu tiên.",
        "yourRanking": "Bảng xếp hạng của bạn",
        "none": "Chưa có", "leaderboard": "Bảng xếp hạng"
      },
      "settings": {
        "title": "Cài Đặt",
        "music": "Nhạc nền",
        "sfx": "Hiệu ứng âm thanh",
        "language": "Ngôn ngữ",
        "on": "Bật",
        "off": "Tắt",
        "en": "EN",
        "vi": "VI"
      },
      "game": {
        "score": "ĐIỂM",
        "best": "KỶ LỤC",
        "gameOver": "Hết cờ!",
        "youLost": "Thua rồi!",
        "noMoves": "Không còn nước đi nào",
        "tryAgain": "Chơi Lại",
        "revive": "Hồi Sinh",
        "milestone": "2048!",
        "milestoneMsg": "Bạn đã đạt được ngói 2048!",
        "keepPlaying": "Chơi Tiếp",
        "continuePlaying": "Tiếp tục chơi",
        "no": "Không",
        "x2Score": "X2 Điểm",
        "end": "Kết thúc",
        "playNow": "Chơi ngay",
        "tapToStartAudio": "Chạm để bắt đầu và bật âm thanh",
        "loadingAudio": "Đang tải âm thanh...",
        "hudScore": "Điểm",
        "hudBest": "Tốt nhất",
        "hudInstruction": "Ghép số tới 2048!",
        "hudRestart": "Gỡ lại",
        "board": "Bàn chơi 2048"
      }
    }
  }
};

const initialLanguage = getInitialLanguage();
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    supportedLngs: ['en', 'vi'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', persistLanguage);

export default i18n;
