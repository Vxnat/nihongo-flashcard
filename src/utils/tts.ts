// Cập nhật để hỗ trợ phát âm thanh qua VOICEVOX (Zundamon cute voice) thông qua API tts.quest.
// Nếu bị lỗi (chặn tự động phát hoặc mạng lỗi) sẽ tự động quay về Web Speech API nội bộ.

let currentAudio: HTMLAudioElement | null = null;

// Bộ nhớ đệm lưu trữ: key (lang:text) -> audioUrl (string)
const ttsCache = new Map<string, string>();

// Hàm phát giọng đọc offline có sẵn của hệ điều hành, tinh chỉnh Pitch cao hơn để tạo giọng "cute/squeaky"
const fallbackSpeechSynthesis = (text: string, lang: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let selectedVoice = voices.find(
      (v) => v.lang === lang || v.lang === lang.replace("-", "_")
    );
    if (!selectedVoice) {
      const shortLang = lang.split("-")[0];
      selectedVoice = voices.find((v) => v.lang.startsWith(shortLang));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  // Tinh chỉnh để tạo giọng dễ thương/mascot:
  // utterance.rate = 0.95;  // Tốc độ đọc tự nhiên, hơi nhanh nhẹn chút
  utterance.pitch = 1.15; // Tăng tông độ (pitch) cao lên 1.35 để giọng trong và cực kỳ cute/đáng yêu!

  window.speechSynthesis.speak(utterance);
};

// Hàm tải trước (preload) âm thanh từ API để lưu vào bộ đệm cache
export const preloadAudio = async (text: string, lang: string = "ja-JP") => {
  if (typeof window === "undefined" || !lang.startsWith("ja")) return;
  const cacheKey = `${lang}:${text}`;
  if (ttsCache.has(cacheKey)) return;

  try {
    const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=8`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.success && (data.mp3StreamingUrl || data.mp3DownloadUrl || data.wavDownloadUrl)) {
      const audioUrl = data.mp3StreamingUrl || data.mp3DownloadUrl || data.wavDownloadUrl;
      ttsCache.set(cacheKey, audioUrl);

      // Kích hoạt trình duyệt tải trước dữ liệu file âm thanh vào bộ đệm
      const audio = new Audio(audioUrl);
      audio.preload = "auto";
    }
  } catch (e) {
    console.warn("Preloading VOICEVOX audio failed:", e);
  }
};

export const playAudio = async (text: string, lang: string = "ja-JP") => {
  if (typeof window === "undefined") return;

  // Dừng âm thanh cũ đang phát để tránh đè âm thanh
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  fallbackSpeechSynthesis(text, lang);

  // Nếu là tiếng Nhật, sử dụng VOICEVOX speaker=8
  // if (lang.startsWith("ja")) {
  //   const cacheKey = `${lang}:${text}`;
  //   let audioUrl = ttsCache.get(cacheKey);

  //   try {
  //     // Nếu chưa có trong cache, tiến hành fetch từ API
  //     if (!audioUrl) {
  //       const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=8`;
  //       const response = await fetch(url);
  //       const data = await response.json();

  //       if (data.success && (data.mp3StreamingUrl || data.mp3DownloadUrl || data.wavDownloadUrl)) {
  //         audioUrl = data.mp3StreamingUrl || data.mp3DownloadUrl || data.wavDownloadUrl;
  //         ttsCache.set(cacheKey, audioUrl!);
  //       }
  //     }

  //     if (audioUrl) {
  //       currentAudio = new Audio(audioUrl);
  //       currentAudio.volume = 0.9;
  //       currentAudio.play().catch((err) => {
  //         console.warn("VOICEVOX TTS failed, using SpeechSynthesis fallback:", err);
  //         fallbackSpeechSynthesis(text, lang);
  //       });
  //     } else {
  //       fallbackSpeechSynthesis(text, lang);
  //     }
  //   } catch (e) {
  //     console.warn("VOICEVOX fetch failed, fallback used:", e);
  //     fallbackSpeechSynthesis(text, lang);
  //   }
  // } else {
  //   // Với các ngôn ngữ khác (vi-VN), fallback về SpeechSynthesis mặc định
  //   fallbackSpeechSynthesis(text, lang);
  // }
};

export const playAudioUrl = (url: string, volume: number = 0.6) => {
  if (typeof window === "undefined") return;
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch((err) => console.warn("Failed to play audio url:", err));
};

// Kích hoạt tải trước danh sách giọng đọc để hàm getVoices() không bị rỗng ở lần bấm đầu tiên
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
