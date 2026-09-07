import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
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
        "loadingAudio": "Loading audio...",
        "hudScore": "Score",
        "hudBest": "Best",
        "hudInstruction": "Join numbers to 2048!",
        "hudRestart": "Restart"
      }
    }
  },
  vi: {
    translation: {
      "dashboard": {
        "anonymous": "Người chơi ẩn danh",
        "player": "Người chơi",
        "yourRecord": "Kỷ Lục Của Bạn",
        "ranking": "Ranking 1-10",
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
        "loadingAudio": "Đang tải âm thanh...",
        "hudScore": "Điểm",
        "hudBest": "Tốt nhất",
        "hudInstruction": "Ghép số tới 2048!",
        "hudRestart": "Gỡ lại"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

