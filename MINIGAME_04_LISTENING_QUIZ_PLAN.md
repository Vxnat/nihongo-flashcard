# 🎧 KẾ HOẠCH TRIỂN KHAI: MINIGAME "NGHE THẤU THỊ" (LISTENING QUIZ)

## 1. MỤC TIÊU & GAMEPLAY
- **Trải nghiệm:** Ép người chơi rời mắt khỏi mặt chữ, chỉ sử dụng thính giác để nhận diện từ vựng.
- **Luồng chơi:** Màn hình chỉ có một Icon Loa to bự ở giữa. App phát tiếng. Phía dưới là 4 đáp án nghĩa Tiếng Việt (hoặc Hình ảnh). Chọn sai trừ máu (Shiba Heart).

## 2. CẤU TRÚC DỮ LIỆU
- Có thể tái sử dụng Flashcard Data.
- Hệ thống sẽ lấy random 1 thẻ làm đáp án đúng (play `audio_url` của thẻ này).
- Lấy random 3 thẻ khác trong deck để lấy `meaning` làm đáp án nhiễu.

## 3. KIẾN TRÚC COMPONENT (`ListeningQuizGame.tsx`)

**State:**
- `hp`: Máu của user (Max 3, bằng ảnh Shiba). Khi sai thì trừ 1. Bằng 0 thì Game Over.

**Logic:**
1. Khi câu hỏi mount -> Auto-play audio. Icon Loa có animation tỏa sóng âm (Ripple effect).
2. Nút "Nghe Lại": Cho phép user bấm vào loa để phát lại.
3. Chọn đúng đáp án -> Lật mặt thẻ ra hiển thị chữ Kanji/Hiragana để user "A ha! Ra là chữ này". 
4. Đợi 1.5s -> Chuyển câu tiếp. Chọn sai -> Báo đỏ, trừ 1 HP.

## 4. TÍCH HỢP ROADMAP
- Khai báo `"type": "minigame_listening"` vào `system_decks.json`.

## 5. UI/UX
- **Thanh máu (HP):** Dùng icon `<img src="/images/shiba_heart_placeholder.png" />` xếp thành hàng ở trên cùng.
- Phong cách "Mù mịt": Có thể làm nền tối mờ, làm nổi bật mỗi cái Loa và 4 nút chọn.
- Hiệu ứng sóng âm thanh (Sound wave bars) sinh động khi phát tiếng.

---
*💡 Chú ý cho AI khi code: Cần xử lý kịch bản lỗi khi không load được Audio hoặc User tắt tiếng. Có thể cung cấp nút "Trợ giúp: Hiện chữ" nhưng sẽ bị trừ Xu.*