# Kế hoạch Thiết kế và Triển khai Chế độ Đấu Boss Gõ Phím (Typing Boss Fight) cho Flashcard

Bản kế hoạch thiết kế và triển khai chế độ **Đấu Boss gõ phím (Typing Boss Fight)** sau khi người dùng thuộc hết từ vựng của bài học, bao gồm hệ thống mở khóa, hình phạt khóa Boss khi thua 3 lần liên tiếp, thuật toán trộn từ thông minh, và công thức tính thời gian động theo độ khó tiếng Nhật.

## User Review Required

> [!IMPORTANT]
> - **Cách lưu trữ trạng thái Boss**:
>   - Trạng thái Boss được tích hợp trực tiếp vào collection `user_progress` trên Firestore với cấu trúc mở rộng:
>     ```json
>     {
>       "userId": "...",
>       "deckId": "...",
>       "knownIds": ["card_1", "card_2"],
>       "bossStatus": "learning" | "boss_unlocked" | "completed",
>       "bossFailedAttempts": 0
>     }
>     ```
> - **Hình phạt khóa Boss**: Nếu người chơi thua Boss liên tiếp **3 lần** (`bossFailedAttempts === 3`), trạng thái sẽ bị hạ xuống `"learning"`, reset `bossFailedAttempts = 0` và làm rỗng mảng `knownIds = []` (buộc người dùng phải học lại, quẹt phải lại toàn bộ các thẻ từ đầu để mở khóa Boss).
> - **Thuật toán Trộn từ thông minh & Cân bằng độ khó động (Adaptive Pacing)**:
>   - **Số lượng từ đấu Boss động theo quy mô bài học**:
>     - Bài học $\le 10$ từ: Số từ đấu Boss = $\min(\text{Số từ bài học}, 10)$
>     - Bài học từ $11 - 20$ từ: Số từ đấu Boss = $\min(\text{Số từ bài học}, 12)$
>     - Bài học từ $21 - 30$ từ: Số từ đấu Boss = $\min(\text{Số từ bài học}, 15)$
>     - Bài học $> 30$ từ: Số từ đấu Boss = $\min(\text{Số từ bài học}, 20)$
>     *(Trộn từ theo tỉ lệ: 60-70% từ trong bài, 20-30% từ yếu trong `wordStats`, 10% từ cũ ôn lại).*
>   - **Kiến trúc phân tách Logic và UI (Hook-based)**:
>     - Toàn bộ state đấu Boss, logic tính thời gian, xử lý phao bơi/kính lúp, tính sát thương combo, thuật toán bốc từ thích ứng, và các thao tác đồng bộ Firestore đều được thiết kế gói gọn bên trong custom hook `useFlashcardDeck.ts` (hoặc các helper hooks phụ).
>     - File giao diện `FlashcardDeck.tsx` đóng vai trò là "Dumb Component" tinh khiết, chỉ đảm nhận nhận state, render giao diện và kích hoạt các event handler được trả về từ hook.
>   - **Cân bằng động**: Khi Combo hiện tại của người chơi = 0, ưu tiên bốc từ nhóm Dễ/Trung bình để bắt nhịp. Khi Combo $\ge$ 3, bắt buộc rút từ nhóm Khó để cản phá và thách thức người chơi. Nếu gõ sai, game tự động lùi về từ nhóm Dễ/Trung bình để họ hồi sức.
> - **Cơ chế Sát thương động (Dynamic Damage) & HP Boss**:
>   - Mỗi từ vựng có lượng **Sát thương gốc (Base Damage)** khác nhau:
>     $$\text{Base Damage} = 10 + (\text{Độ dài Romaji} \times 1) + (\text{Chứa Kanji} ? 5 : 0)$$
>   - HP của Boss được gán động bằng **Tổng sát thương gốc của các từ được chọn trong danh sách đấu Boss**.
>   - Sát thương thực tế (Actual Damage) gây lên Boss sẽ được nhân thêm theo chuỗi gõ đúng liên tiếp (Combo):
>     - Combo x1 - x2: $100\%$ Base Damage.
>     - Combo x3 - x4: $150\%$ Base Damage (Đòn chém đôi - Double Slash).
>     - Combo x5+: $200\%$ Base Damage + Kích hoạt Siêu kỹ năng của Shiba.
> - **Hệ thống hiệu ứng hình ảnh (Kết hợp GIF trong suốt và Framer Motion)**:
>   - **Sự kết hợp tối ưu**:
>     - **GIF trong suốt (Transparent GIF)** đóng vai trò là "lõi chiêu thức" (sprite animation chứa hiệu ứng ngọn lửa xoáy, quả cầu điện, hoặc vụ nổ tung tóe phức tạp mà CSS không thể vẽ mượt mà).
>     - **Framer Motion** đóng vai trò là "khung xương điều khiển" (control frame) chịu trách nhiệm: dịch chuyển vật lý (projectile Y-axis translation từ Shiba đến Boss), phóng to/thu nhỏ (scale), xoay (rotate), thay đổi độ mờ dần (fade out), rung lắc màn hình (screen shake), và chớp sáng (color flash).
>     - **Tối ưu hiệu năng**: GIF chỉ được mount vào DOM khi chiêu thức được kích hoạt và tự động unmount khi kết thúc animation để tránh việc trình duyệt phải render GIF lặp lại ngầm trong nền gây ngốn CPU.
>   - **Kích hoạt Siêu kỹ năng của Shiba (Combo $\ge$ 5)**:
>     - Khi người chơi đạt Combo $\ge$ 5, Shiba sẽ chuyển sang trạng thái "nộ" (Aura phát sáng quanh Shiba).
>     - Đòn đánh thường (quả cầu lửa nhỏ bay lên) sẽ được thay thế bằng **Siêu chiêu thức của Shiba** (ví dụ: Tia chớp khổng lồ hoặc Rồng lửa quét qua).
>     - Sử dụng một GIF chiêu thức cực lớn, dùng Framer Motion tăng scale lên 1.5 - 2 lần, tạo đường bay uốn lượn hoặc giật sét từ trên trời xuống Boss.
>     - Hiệu ứng va chạm sẽ gây **Rung lắc màn hình mạnh (Heavy Screen Shake)**, **Flash chớp màn hình đỏ/vàng rực rỡ**, và số sát thương bay ra sẽ lớn gấp đôi, đổi màu gradient lửa đỏ/vàng kèm chữ hiệu ứng `CRITICAL!` hoặc `SHIBA SMASH!`.
> - **Hệ thống bổ trợ Shiba Master (Không có nút "Bỏ qua")**:
>   - Loại bỏ hoàn toàn chức năng "Bỏ qua từ". Đấu Boss là trận đấu sinh tử (3 mạng tim), người chơi chỉ có 2 sự trợ giúp tốn xu/vật phẩm:
>     1. **Phao bơi**: Đóng băng thời gian gõ trong 5 giây.
>     2. **Kính lúp**: Gợi ý trước ký tự đầu tiên trong phiên âm Romaji.
> - **Công thức thời gian gõ động**:
>   $$\text{Time} = \text{clamp}(2.5 + 0.35 \times \text{độ dài Romaji}, 3, 9) + \text{Hệ số điều chỉnh}$$
>   - *Hệ số điều chỉnh*:
>     - Từ chứa Kanji: $+1.5$ giây.
>     - Từ có lịch sử sai nhiều (`wrongCount >= 2` trong `wordStats`): $+1.0$ giây.
>     - Từ chỉ chứa chữ thuần Kana: $-0.5$ giây.
>     - Từ đã rất thuộc (đúng nhiều lần liên tiếp): $-1.0$ giây.

## Proposed Changes

---

### [Component 1] Zustand Store & Database Schema

#### [MODIFY] [useAppStore.ts](file:///home/ubuntu/DuAn/nihongo-flashcard/src/store/useAppStore.ts)
- Cập nhật interface `UserStats`:
  - Thêm trường `wordStats: Record<string, { wrongCount: number, correctCount: number }>` (mặc định `{}`).
- Cập nhật interface `AppState` và phần lưu tiến độ `progress`:
  - Mở rộng để lưu trữ: `bossStatus: Record<string, "learning" | "boss_unlocked" | "completed">` và `bossFailedAttempts: Record<string, number>`.
- Cập nhật hàm `loadProgress` và `saveProgress`:
  - Khôi phục và lưu trữ trạng thái `bossStatus` và `bossFailedAttempts` lên Firestore trong document `user_progress`.
- Viết action hỗ trợ đấu Boss:
  - `recordWordStat(wordId: string, isCorrect: boolean)`: Tăng chỉ số đúng/sai của từ vựng tương ứng vào `wordStats` và đồng bộ lên Firestore `user_stats`.
  - `submitBossResult(deckId: string, isWin: boolean)`:
    - Nếu thắng: Set `bossStatus[deckId] = "completed"`, reset `bossFailedAttempts[deckId] = 0`. Tặng thưởng Xu và EXP qua hệ thống `applyRewards`.
    - Nếu thua: Tăng `bossFailedAttempts[deckId] += 1`. Nếu đạt 3 lần, set `bossStatus[deckId] = "learning"`, làm rỗng danh sách đã thuộc của bài học đó trên Firestore/Zustand store.

---

### [Component 2] Flashcard Game Logic (Hook)

#### [MODIFY] [useFlashcardDeck.ts](file:///home/ubuntu/DuAn/nihongo-flashcard/src/hooks/flashcard/useFlashcardDeck.ts)
- Thêm các trạng thái điều khiển Boss:
  - `isBossMode: boolean` (trạng thái đang chiến đấu với Boss).
  - `bossHp: number`, `bossMaxHp: number` (máu hiện tại và máu tối đa của Boss).
  - `shibaHp: number` (mạng sống của Shiba, tối đa 3 tim).
  - `bossWordsList: any[]` (danh sách từ được trộn để đấu Boss).
  - `currentBossWordIndex: number` (chỉ mục từ hiện tại trong trận đấu).
  - `bossTimeLeft: number` (thời gian còn lại cho từ hiện tại).
- Bổ sung hàm helper `buildBossWordsList()`:
  - Phân loại các từ thành 3 nhóm độ khó (Dễ/Trung bình/Khó) dựa trên độ dài, Kanji và `wordStats`.
  - Lấy từ bài học hiện tại + từ yếu trong `wordStats` + từ cũ ngẫu nhiên theo tỷ lệ quy định.
- Bổ sung hàm `handleBossWordSubmit(input: string)`:
  - Kiểm tra xem người dùng gõ có khớp với Romaji/Reading của từ hiện tại không.
  - Áp dụng thuật toán cân bằng độ khó động để rút từ tiếp theo (nếu Combo $\ge$ 3 rút từ Khó, nếu Combo = 0 rút từ Dễ/Trung bình).
  - Nếu đúng: Tính lượng sát thương thực tế dựa trên Base Damage và hệ số nhân Combo. Giảm HP của Boss, kích hoạt hiệu ứng chưởng bắn, chuyển sang từ tiếp theo. Gọi `recordWordStat(wordId, true)`.
  - Nếu sai/hết giờ: Trừ 1 trái tim của Shiba. Gọi `recordWordStat(wordId, false)`. Reset Combo = 0. Nếu hết tim, kết thúc trận đấu và gọi `submitBossResult(deckId, false)`.
  - Nếu diệt sạch Boss: Kích hoạt hiệu ứng confetti chiến thắng lớn, gọi `submitBossResult(deckId, true)`.

---

### [Component 3] Flashcard UI Layout

#### [MODIFY] [FlashcardDeck.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/flashcard/FlashcardDeck.tsx)
- Thêm giao diện **Thách đấu Boss**:
  - Nếu `bossStatus === "boss_unlocked"` hoặc `"completed"`, hiển thị một nút lớn **"THÁCH ĐẤU BOSS 🦊"** lấp lánh ở góc màn hình sảnh chuẩn bị.
- Triển khai giao diện trận chiến **Boss Battle**:
  - **Khu vực trên**: Thanh máu (HP Bar) của Boss và hình ảnh động hoặc Avatar của Boss (sử dụng Gif hoặc hiệu ứng phát sáng).
  - **Khu vực giữa**:
    - Chú Shiba mặc trang phục gacha của người dùng với 3 trái tim sinh lực bay nhảy.
    - Từ tiếng Nhật xuất hiện chính giữa (có hỗ trợ Furigana/Kanji) kèm thanh thời gian đếm ngược (Timer Bar) co ngắn dần theo giây.
    - Một chỉ số Combo lấp lánh (ví dụ `COMBO x3`, `COMBO x5` bốc lửa) khi gõ đúng liên tiếp.
    - Component hoạt cảnh chưởng bắn (Aura tụ lực quanh Shiba $\rightarrow$ Cầu lửa GIF tịnh tiến trục Y bằng Framer Motion $\rightarrow$ GIF vụ nổ đè lên Boss $\rightarrow$ Screen shake).
  - **Khu vực dưới**:
    - Ô nhập dữ liệu (Input) được tự động focus để gõ phiên âm Romaji.
    - Nút Shiba Master: Phao bơi (đóng băng 5s), Kính lúp (điền sẵn ký tự đầu). *Không có nút Bỏ qua*.
- Ẩn màn hình `EndScreen` cũ khi đang trong luồng học/đấu Boss.

---

## Verification Plan

### Automated Tests
- Chạy lệnh `npm run build` để kiểm tra lỗi biên dịch TypeScript toàn bộ dự án.

### Manual Verification
- Chạy local dev server và kiểm tra:
  - Quẹt phải thuộc hết các thẻ xem có tự động chuyển thẳng vào màn hình Boss Fight không.
  - Kiểm tra nút "Thách Đấu Boss" có xuất hiện khi bài học đã quẹt hết từ trước không.
  - Đấu thắng Boss: Nhận thưởng Xu, EXP, cấp độ tăng chính xác.
  - Đấu thua Boss liên tiếp 3 lần: Reset tiến độ học về 0, khóa Boss, bắt học lại từ đầu.
  - Kiểm tra công thức đếm ngược thời gian có dài hơn đối với từ Kanji phức tạp và ngắn hơn với từ Kana thuần không.
  - Kiểm tra lượng sát thương bay ra to hơn khi gõ đúng từ dài/khó và khi tích lũy Combo cao.
  - Hiệu ứng chưởng đặc biệt bùng nổ khi đạt Combo $\ge$ 5.
  - Hệ thống bổ trợ (Phao bơi, Kính lúp) hoạt động chính xác khi bấm nút Shiba Master, không có nút Bỏ qua.
