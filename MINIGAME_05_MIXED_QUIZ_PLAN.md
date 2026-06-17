# ⚔️ KẾ HOẠCH TRIỂN KHAI: ẢI "KIỂM TRA TỔNG HỢP" (MIXED QUIZ)

## 1. MỤC TIÊU
- **Trải nghiệm:** Bài kiểm tra cuối kỳ "Đủ món ăn chơi", kết hợp Gõ, Nghe, Nhìn, Đọc. Tránh việc bị nhàm chán khi ôn tập.
- **Cơ chế sống còn:** Người chơi có 5 Mạng (Shiba Hearts). Trả lời sai ở bất kỳ mode nào cũng bị trừ mạng. Sống sót đến cuối sẽ qua ải.

## 2. KIẾN TRÚC HỆ THỐNG
`MixedQuizGame.tsx` sẽ hoạt động như một "Người điều phối" (Container/Orchestrator).

**Logic:**
1. Nạp danh sách 15 câu hỏi. Mỗi câu hỏi sẽ được gán random một `mode` (Ví dụ: 3 câu Nối từ, 4 câu Nghe, 5 câu Điền chỗ trống, 3 câu Gõ máy).
2. Tạo một thanh Progress Bar tổng trên cùng màn hình, kèm theo **Thanh Mạng (HP)** hiển thị bằng 5 icon `<img src="/images/shiba_heart_placeholder.png" />`.
3. Sử dụng thẻ `<Switch>` hoặc cấu trúc `if/else` render Component tương ứng dựa theo câu hỏi hiện tại.
4. Trừ mạng tập trung: Bất cứ component con nào báo `onWrong` thì Mẹ sẽ trừ 1 `hp`. Nếu `hp === 0`, đá ra màn hình Game Over.

```tsx
// Giả mã (Pseudo code)
{currentQuestion.mode === "fill" && <FillBlanksGame data={...} onNext={handleNext} />}
{currentQuestion.mode === "listen" && <ListeningQuizGame data={...} onNext={handleNext} />}
{currentQuestion.mode === "match" && <MatchingPairsGame data={...} onNext={handleNext} />}
```

## 3. UI KẾT THÚC ẢI (REPORT CARD)
- Vì đây là bài kiểm tra tổng hợp, không nên hiện thưởng ngay lập tức.
- Cần một màn hình Thống Kê (Report) giống màn kết thúc game RPG:
  - Xếp hạng: S, A, B, C.
  - Mạng (Shiba Hearts) còn lại.
  - Số Xu 🦴 nhận được.

## 4. TÍCH HỢP ROADMAP
- Đây thường là Node có màu sắc đặc biệt nhất (Màu tím hoặc cầu vồng), đặt tên là "Bài Test Vượt Cấp".

---
*💡 Chú ý cho AI khi code: Phải quản lý state tổng cẩn thận, đặc biệt là việc unmount/mount liên tục giữa các loại minigame. Giữ logic chung ở Parent component, các component con chỉ xử lý hiển thị và trigger event `onAnswer`.*