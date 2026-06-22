# Walkthrough: Triển khai Chế độ Đấu Boss Gõ Phím (Typing Boss Fight) cho Flashcard

Chế độ đấu Boss gõ phím sau khi hoàn thành học từ vựng đã được triển khai hoàn tất, tối ưu hóa hiệu năng và biên dịch thành công 100%.

## Tóm tắt các thay đổi (Changes Made)

### 1. Zustand Store & Database Schema (`useAppStore.ts`)
- **Word Stats & History Tracking**:
  - Thêm trường `wordStats` vào dữ liệu người dùng (`UserStats`) để theo dõi số lần gõ đúng/sai của từng từ vựng.
  - Triển khai action `recordWordStat` để tự động cộng dồn chỉ số đúng/sai và đồng bộ hóa lên bộ sưu tập `user_stats` của Firestore.
- **Trạng thái Boss**:
  - Mở rộng collection `user_progress` để lưu trữ thêm trạng thái: `bossStatus` (`"learning" | "boss_unlocked" | "completed"`) và `bossFailedAttempts` (số lần thua liên tiếp).
  - Tự động chuyển trạng thái của bài học sang `"boss_unlocked"` khi người học đã ghi nhớ (quẹt phải) tất cả các từ trong bài.
- **Phạt Khóa Boss & Thưởng Thắng Trận**:
  - Thắng Boss: Nhận ngay phần thưởng `+100 EXP` và `+50 xu`, cập nhật trạng thái `bossStatus` thành `"completed"`.
  - Thua Boss: Tăng chỉ số thua liên tiếp. Nếu thua **3 lần liên tiếp**, hệ thống sẽ khóa Boss, đặt trạng thái về `"learning"`, và reset toàn bộ tiến độ học của bài học đó về 0 (`knownIds = []`), buộc người dùng phải học và quẹt lại từ đầu để mở khóa Boss.

### 2. Tách Logic đấu Boss vào Custom Hook (`useFlashcardDeck.ts`)
- **Quản lý trạng thái trận chiến**: Khai báo và quản lý tập trung các biến trạng thái bao gồm: máu Boss (`bossHp`, `bossMaxHp`), mạng Shiba (`shibaHp` - tối đa 3 tim), danh sách từ đấu Boss (`bossWordsList`), từ đang đấu hiện tại, thời gian đếm ngược của từ đó, và các cờ hiệu ứng (bay chiêu thức, rung màn hình, flash).
- **Thuật toán trộn từ lai (Hybrid Word Selector)**:
  - Chọn lọc tối đa số từ đấu Boss dựa theo quy mô của bài học ($8 \to 20$ từ).
  - Kết hợp tỉ lệ: 60-70% từ bài học, 20-30% từ yếu nhất (gõ sai nhiều nhất trong `wordStats`), và 10% từ ôn tập (từ đã thuộc).
- **Cân bằng độ khó thích ứng (Adaptive Pacing)**:
  - Khi Combo = 0: Ưu tiên bốc từ Dễ/Trung bình để người chơi bắt nhịp.
  - Khi Combo $\ge$ 3: Bắt buộc rút từ Khó (từ dài, chứa Kanji, hoặc hay sai) để tăng độ thử thách.
  - Khi gõ sai: Reset Combo = 0 và lùi về từ nhóm Dễ để họ hồi sức.
- **Công thức sát thương và thời gian động**:
  - Sát thương gốc: $\text{Base Damage} = 10 + (\text{độ dài Romaji}) + (\text{chứa Kanji} ? 5 : 0)$. HP Boss = Tổng sát thương gốc các từ.
  - Hệ số nhân Combo: Combo x1-x2 ($100\%$), Combo x3-x4 ($150\%$), Combo x5+ ($200\%$ + Siêu kỹ năng Shiba).
  - Thời gian gõ động: $\text{Time} = \text{clamp}(2.5 + 0.35 \times \text{length}, 3, 9) + \text{Hệ số Kanji (+1.5s) / Chỉ Kana (-0.5s) / Học yếu (+1.0s) / Thuộc sâu (-1.0s)}$.
- **Hỗ trợ Shiba Master**:
  - Triển khai **Phao Bơi** (chi phí 5 xu): Cộng thêm 5 giây đóng băng thời gian.
  - Triển khai **Kính Lúp** (chi phí 3 xu): Gợi ý ký tự phiên âm đầu tiên.
  - *Đã loại bỏ hoàn toàn nút Bỏ Qua từ*. Nếu gõ sai hoặc hết giờ, từ đó sẽ tự động được đưa ngược lại hàng đợi để gõ lại sau và Shiba bị trừ 1 mạng tim.

### 3. Thành phần giao diện Đấu trường Neon (`BossBattleScreen.tsx`)
- Thiết kế giao diện đậm chất game chiến đấu neon trên nền tối huyền bí:
  - **Phía trên**: Thanh máu Boss đỏ rực phát sáng, ảnh đại diện Boss là Mặt quỷ Kanji trôi nổi phát xung nhịp, cùng các chỉ số sát thương bay nhảy và nổ critical.
  - **Chính giữa**: Trạng thái 3 tim sinh mệnh của Shiba, từ Kanji hiển thị siêu to kèm thanh đếm ngược cyan (có hiệu ứng băng tuyết khi dùng Phao).
  - **Phía dưới**: Ô nhập Romaji tự động focus, nút gửi sát thương và 2 nút hỗ trợ Shiba Master hiển thị thông tin chi phí xu rõ ràng.

### 4. Tích hợp Giao diện và Luồng Sảnh (`FlashcardDeck.tsx`)
- Thêm nút **THÁCH ĐẤU BOSS 🦊** lấp lánh ở sảnh học khi Boss được mở khóa hoặc đã hoàn thành.
- Nếu học xong hoặc mở bài học đã thuộc hết, thay thế `EndScreen` cũ bằng **Sảnh chuẩn bị quyết chiến** (hiển thị nút đấu Boss, ôn tập lại, hoặc học lại từ đầu để reset tiến độ).

---

## Kết quả kiểm thử (Validation Results)

### Kiểm thử tự động (Build Validation)
- Lệnh `npm run build` đã chạy thành công hoàn toàn mà không có bất kỳ lỗi biên dịch TypeScript hay Turbopack:
```bash
> nihongo-flashcard@0.1.0 build
> next build
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 10.4s
✓ Finished TypeScript in 8.0s
✓ Collecting page data using 7 workers in 770ms
✓ Generating static pages using 7 workers (7/7) in 434ms
✓ Finalizing page optimization in 22ms
```

### Hướng dẫn kiểm thử thủ công (Manual Test Steps)
1. Truy cập vào local dev server.
2. Hoàn thành quẹt phải tất cả từ vựng trong một bài học để chuyển sang Sảnh quyết chiến Boss.
3. Bấm **QUYẾT CHIẾN BOSS** để mở đấu trường gõ phím.
4. Thử nghiệm gõ đúng liên tiếp để tích Combo và quan sát hoạt cảnh quả cầu lửa bay lên, chớp màn hình va chạm, và số sát thương bay ra to hơn.
5. Thử nghiệm dùng **Phao Bơi** và **Kính Lúp** để kiểm tra tính năng cộng thời gian / hiển thị ký tự đầu và trừ xu tương ứng.
6. Thử để hết giờ hoặc gõ sai 3 lần để thua Boss 3 lần liên tiếp và kiểm tra xem hệ thống có tự động khóa Boss, reset toàn bộ tiến độ học của bài đó về 0% hay không.
