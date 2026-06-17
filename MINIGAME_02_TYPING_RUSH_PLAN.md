# ⌨️ KẾ HOẠCH TRIỂN KHAI: MINIGAME "BĂNG CHUYỀN" (TYPING RUSH)

## 1. MỤC TIÊU & GAMEPLAY
- **Trải nghiệm:** Hồi hộp, đòi hỏi tốc độ gõ phím và phản xạ.
- **Luồng chơi:** Các từ vựng (chữ Nhật) sẽ liên tục xuất hiện từ cạnh trên và rơi từ từ xuống đáy màn hình. Người chơi gõ đúng Romaji (hoặc Hiragana) để bắn tia laser tiêu diệt từ vựng đó.
- **Thua cuộc:** Rớt 1 từ xuống rãnh lửa dưới đáy hoặc gõ sai quá nhiều -> Mất 1 Máu (Shiba Heart). Hết máu thì Game Over.

## 2. CẤU TRÚC DỮ LIỆU
- Dùng lại dữ liệu Flashcard của các bài trước. 
- Cần chắc chắn các từ vựng dùng trong mode này có trường Romaji hoặc cách đọc rõ ràng để user gõ.

## 3. KIẾN TRÚC COMPONENT (`TypingRushGame.tsx`)

**Các State cần thiết:**
- `hp`: Máu của user (Max 3 hoặc 5), đại diện bằng icon Shiba.
- `score`: Điểm số.
- `activeEnemies`: Mảng các từ đang rơi. `{ id, text, expectedInput, x, y, speed }`.
- `userInput`: Chuỗi user đang gõ.

**Game Loop (Vòng lặp Game):**
1. Sử dụng `requestAnimationFrame` để liên tục cộng giá trị `y` cho các `activeEnemies` (làm chúng rớt xuống).
2. Cứ mỗi `N` giây, lấy ngẫu nhiên 1 từ trong kho, tạo tọa độ `x` ngẫu nhiên và đẩy vào `activeEnemies`.

**Logic Nhập liệu:**
1. Bắt sự kiện bàn phím.
2. Kiểm tra xem `userInput` có trùng khớp với `expectedInput` của bất kỳ con quái nào không.
3. Nếu trùng -> Bắn laser (Animation CSS), kích nổ `canvas-confetti` tại tọa độ `(x, y)` của con quái đó, xóa quái khỏi mảng, cộng điểm.

## 4. TÍCH HỢP ROADMAP
1. Khai báo `"type": "minigame_rush"` vào `system_decks.json`.
2. Mở full-screen khi bắt đầu chơi.

## 5. UI/UX
- **Hệ thống Máu (HP):** Render dãy Icon Shiba (`<img src="/images/shiba_heart_placeholder.png" />`) ở góc trên màn hình. Mỗi lần mất máu, icon Shiba rung lắc và mờ đi.
- Nên có một background bầu trời sao hoặc không gian mạng mẽo (Cyberpunk/Lofi).
- Có thanh rãnh lửa (Lava) ở dưới đáy màn hình lấp lánh nguy hiểm.

---
*💡 Chú ý cho AI khi code: Hiệu năng cực kỳ quan trọng ở vòng lặp game. Hạn chế re-render React toàn bộ cây, nên tách riêng vùng hiển thị chữ rơi để update nhanh.*