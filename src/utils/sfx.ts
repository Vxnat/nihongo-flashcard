// Quản lý các âm thanh Micro-interactions của app
export const playSFX = (type: "flip" | "success" | "fail" | "splash") => {
  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.4; // Chỉnh âm lượng nhỏ mượt mà, không làm át tiếng đọc từ vựng (TTS)

    // Play âm thanh (catch lỗi nếu trình duyệt chặn autoplay khi người dùng chưa tương tác)
    audio.play().catch((error) => {
      console.warn("SFX blocked by browser:", error);
    });
  } catch (error) {
    console.error("Lỗi phát âm thanh:", error);
  }
};
