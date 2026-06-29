# Kế hoạch triển khai: Cải tiến UI/UX KanjiCanvas bằng Mũi tên động chỉ hướng vẽ khi cần (Dynamic Arrow Hint on Demand)

Đề xuất thay đổi cơ chế hiển thị số thứ tự nét bằng một phương án lai (hybrid): Ẩn mặc định các gợi ý số, chỉ hiển thị **Mũi tên chỉ hướng vẽ động (Ý tưởng 4)** khi người dùng vẽ sai hoặc đứng yên quá lâu (Ý tưởng 3).

---

## User Review Required

> [!IMPORTANT]
> **Các thay đổi về logic tương tác:**
> 1. Nút "Bật/Tắt số thứ tự nét" ở góc trên bên phải sẽ chuyển chức năng thành **"Bật/Tắt chế độ tự động gợi ý"** (Auto-Hint Mode). Khi bật, hệ thống sẽ tự động hiện mũi tên khi người dùng idle lâu hoặc vẽ sai. Khi tắt, người dùng sẽ hoàn toàn tự lực vẽ.
> 2. Các tính năng "Hỏi sư phụ Shiba" (Nhìn lén 1 nét / Xem múa cọ) trong [KanjiDojoGame.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/games/kanji-dojo/KanjiDojoGame.tsx) vẫn được giữ nguyên và sẽ kích hoạt hiển thị mũi tên gợi ý tạm thời của Canvas.

---

## Proposed Changes

Chúng ta sẽ thực hiện cải tiến theo 4 phase nhỏ như sau:

### Phase 1: Thu thập tọa độ nét vẽ & Xây dựng SVG Overlay
#### [MODIFY] [KanjiCanvas.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/games/kanji-dojo/KanjiCanvas.tsx)
*   **Trích xuất toàn bộ tọa độ median:** Thay vì chỉ lấy tọa độ điểm bắt đầu (`median[0]`), ta sẽ lưu toàn bộ mảng tọa độ `medians` đã được scale để vẽ thành đường dẫn SVG hoàn chỉnh.
*   **Thiết kế SVG Overlay:**
    *   Tạo một thẻ `<svg>` nằm đè lên khung vẽ (`absolute inset-0 pointer-events-none`).
    *   Định nghĩa `<marker id="arrow">` để làm đầu mũi tên.
    *   Sử dụng thẻ `<path>` để vẽ đường dẫn tương ứng với tọa độ nét hiện tại.
    *   Thêm CSS Animation (stroke-dashoffset) để tạo hiệu ứng dòng chảy chuyển động (flowing animation) dọc theo nét vẽ.

---

### Phase 2: Triển khai Logic Tự động hiển thị (Idle Timer & Mistake Trigger)
#### [MODIFY] [KanjiCanvas.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/games/kanji-dojo/KanjiCanvas.tsx)
*   **Idle Timer (4 giây):**
    *   Tạo một state `isIdle` và sử dụng `setTimeout` lắng nghe hành động vẽ.
    *   Mỗi khi có sự kiện vẽ đúng hoặc khi người dùng bắt đầu chạm vẽ (lắng nghe trên container element), ta sẽ reset lại bộ đếm thời gian.
    *   Nếu sau 4 giây người dùng không tương tác, set `isIdle` thành `true` để hiển thị mũi tên gợi ý.
*   **Mistake Trigger (Vẽ sai):**
    *   Khi trigger callback `onMistake`, ta set state `showMistakeHint` thành `true`.
    *   Sử dụng `setTimeout` để tự động ẩn đi sau 2 giây.

---

### Phase 3: Đồng bộ hóa với tính năng "Hỏi Sư Phụ Shiba"
#### [MODIFY] [KanjiCanvas.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/games/kanji-dojo/KanjiCanvas.tsx)
*   Cập nhật hàm `peekNextStroke` trong `useImperativeHandle` của ref:
    *   Khi người dùng click "Nhìn lén 1 nét" từ Shiba Master, ngoài việc chớp nháy nét của Hanzi Writer, Canvas sẽ kích hoạt hiển thị mũi tên động trong 3 giây.

---

### Phase 4: Đánh giá & Tinh chỉnh thẩm mỹ (Aesthetics Fine-tuning)
*   **Danh sách các bảng màu Pastel hỗ trợ (Được tổ chức thành config object trong code để dễ dàng thay đổi):**
    *   **Tông 1 (Mặc định được chọn - Sakura Pink):** Mũi tên `#FF85A1` | Vòng tròn điểm đầu `#FFB5A7`.
    *   **Tông 2 (Mint & Sky):** Mũi tên `#80FFDB` | Vòng tròn điểm đầu `#A2D2FF`.
    *   **Tông 3 (Lavender Magic):** Mũi tên `#BDB2FF` | Vòng tròn điểm đầu `#D8B4FE`.
    *   **Tông 4 (Peach & Apricot):** Mũi tên `#FFCAD4` | Vòng tròn điểm đầu `#FAD2E1`.
*   Thiết kế mũi tên có độ mờ mềm mại (opacity fade-in/fade-out) bằng CSS transitions/Framer Motion để không xuất hiện đột ngột.

---

## Verification Plan

### Manual Verification
1.  **Kiểm tra Idle Timer:** Vào chơi game, không thao tác trong 4 giây. Xác nhận mũi tên động tự động hiện lên chỉ đường nét tiếp theo.
2.  **Kiểm tra vẽ sai:** Cố tình vẽ sai nét. Xác nhận mũi tên động chớp nháy cảnh báo nét đúng trong 2 giây rồi tự ẩn đi.
3.  **Kiểm tra Hỏi Sư Phụ:** Click nút "Hỏi sư phụ" -> "Nhìn lén 1 nét", xác nhận mũi tên hiện lên trong 3 giây.
4.  **Kiểm tra nút Bật/Tắt:** Bật tắt nút góc trên bên phải để chắc chắn có thể vô hiệu hóa tự động gợi ý nếu người dùng muốn thử thách bản thân.
