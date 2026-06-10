export const playAudio = (text: string, lang: string = 'ja-JP') => {
  // Kiểm tra xem trình duyệt có hỗ trợ không (để tránh lỗi khi render ở Server-side)
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Hủy ngay lập tức các luồng âm thanh đang phát trước đó.
  // Tránh trường hợp người dùng lật thẻ liên tục làm các giọng đọc bị xếp hàng đè lên nhau.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // Giảm tốc độ đọc xuống một chút (0.8 - 0.9) để người học nghe rõ cách phát âm hơn
  utterance.rate = 0.85; 
  
  window.speechSynthesis.speak(utterance);
};