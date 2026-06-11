export const playAudio = (text: string, lang: string = "ja-JP") => {
  // Kiểm tra xem trình duyệt có hỗ trợ không (để tránh lỗi khi render ở Server-side)
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Hủy ngay lập tức các luồng âm thanh đang phát trước đó.
  // Tránh trường hợp người dùng lật thẻ liên tục làm các giọng đọc bị xếp hàng đè lên nhau.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  // Lấy danh sách giọng đọc hiện có trên máy
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Ưu tiên tìm giọng đọc khớp chính xác mã ngôn ngữ (ví dụ: 'ja-JP' hoặc 'ja_JP')
    let selectedVoice = voices.find(
      (v) => v.lang === lang || v.lang === lang.replace("-", "_"),
    );

    // Nếu không tìm thấy mã chính xác, tìm giọng bất kỳ có chứa tiền tố ngôn ngữ (ví dụ: 'ja')
    if (!selectedVoice) {
      const shortLang = lang.split("-")[0];
      selectedVoice = voices.find((v) => v.lang.startsWith(shortLang));
    }

    // Ép trình duyệt sử dụng giọng đọc này để tránh máy tự chuyển sang giọng tiếng Trung
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  // Giảm tốc độ đọc xuống một chút (0.8 - 0.9) để người học nghe rõ cách phát âm hơn
  utterance.rate = 0.85;

  window.speechSynthesis.speak(utterance);
};

// Kích hoạt tải trước danh sách giọng đọc để hàm getVoices() không bị rỗng ở lần bấm đầu tiên
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
