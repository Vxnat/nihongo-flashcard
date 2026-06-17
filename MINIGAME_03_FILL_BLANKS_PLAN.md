# 🧩 KẾ HOẠCH TRIỂN KHAI: MINIGAME "ĐIỀN CHỖ TRỐNG" (FILL IN THE BLANKS)

## 1. MỤC TIÊU & GAMEPLAY
- **Trải nghiệm:** Đòi hỏi sự tỉ mỉ, rất hiệu quả để ôn Trợ từ (Particles) và Ngữ pháp.
- **Luồng chơi:** Hiển thị một câu khuyết chữ (VD: わたし ___ がくせいです). 4 đáp án lơ lửng dưới dạng viên kẹo.
- **Kết quả:** Click đúng kẹo bay vào chỗ trống, đi tiếp. Click sai kẹo văng ra và trừ 1 Máu (Shiba Heart).

## 2. CẤU TRÚC DỮ LIỆU
Mảng dữ liệu riêng vì cấu trúc câu hỏi khác với Flashcard thường.
Tạo thư mục `public/data/minigames/` và lưu file JSON (VD: `fill_blank_n5_01.json`).

```json
{
  "id": "quiz_01",
  "sentence": "わたし ___ がくせいです。",
  "correctAnswer": "は",
  "wrongAnswers": ["が", "を", "に"],
  "translation": "Tôi là học sinh."
}
```

## 3. KIẾN TRÚC COMPONENT (`FillBlanksGame.tsx`)

**State:**
- `currentQuizIndex`: Đang ở câu hỏi số mấy.
- `selectedAnswer`: Đáp án người dùng chọn (để làm hiệu ứng đúng/sai).
- `options`: Mảng trộn 4 đáp án.
- `hp`: Số mạng (VD: 3), hiển thị bằng ảnh Shiba.

**Logic:**
1. Dùng helper xáo trộn (shuffle) 1 `correctAnswer` và 3 `wrongAnswers` để render 4 nút bấm.
2. Khi click:
   - Nếu đúng: Hiện chữ "Chính xác" to bự, chờ 1s chuyển câu kế tiếp.
   - Nếu sai: Rung lắc (framer-motion `x: [-10, 10, -10, 10, 0]`), chuyển nút thành màu đỏ, trừ 1 `hp`.
   - Nếu `hp === 0`: Game Over.

## 4. TÍCH HỢP ROADMAP
- Khai báo `"type": "minigame_fill"` vào `system_decks.json`. 
- Hoặc có thể biến đây thành vũ khí mới trong Boss Fight (Điền đúng để tung chiêu thay vì Gõ phím).

---
*💡 Chú ý UI/UX: Hiển thị mảng ảnh `<img src="/images/shiba_heart_placeholder.png" />` trên đầu màn hình làm thanh Sinh lực.*
*💡 Chú ý cho AI khi code: UI nên có khoảng gạch chân `___` lấp lánh để user hiểu là cần điền vào đó.*