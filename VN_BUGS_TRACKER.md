# 🐛 VISUAL NOVEL - BUGS TRACKER

## 1. Lỗi không hiện pháo hoa (Confetti) khi chọn đáp án
- **Triệu chứng:** Chọn `node_003_correct` nhưng không hiện màn hình chúc mừng.
- **Nguyên nhân:** File JSON chứa cốt truyện (`vn_chapter_01.json`) bị thiếu cấu trúc của `node_003_correct` và `node_003_wrong`. Khi user bấm chọn đáp án, hệ thống nhảy sang `node_003_correct` (không tồn tại trong mảng `nodes`), dẫn đến việc không thể tìm thấy node tiếp theo là `END_STORY` để kích hoạt `VNEndScreen` chứa hiệu ứng pháo giấy.
- **Cách Fix:** Bổ sung data cho `node_003_correct` (chỉ định `nextNode: "END_STORY"`) và `node_003_wrong` (chỉ định `nextNode: "node_002"` để chơi lại) vào file JSON.

## 2. Lỗi nhảy câu thoại (Next Node) khi click vào từ vựng nổi bật
- **Triệu chứng:** Click vào từ màu vàng để xem nghĩa nhưng khung chat tự động gõ hết chữ hoặc bị skip sang câu của nhân vật tiếp theo.
- **Nguyên nhân:** Sự kiện `onClick` ở thẻ `<span>` chứa từ vựng trong `vnTextParser.tsx` bị tình trạng **Event Bubbling**. Khi click vào chữ, nó mở Tooltip nhưng đồng thời cũng lan truyền sự kiện click ra phần tử cha (khung `VNDialogueBox`), khiến hàm `handleClick` (chuyển câu) của khung chat bị kích hoạt.
- **Cách Fix:** Thêm `e.stopPropagation()` vào sự kiện `onClick` của từ khóa trong hàm `parseVNText` để ngăn chặn sự kiện click lan truyền ra ngoài.

---