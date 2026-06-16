# 🗺️ KẾ HOẠCH THIẾT KẾ LẠI ROADMAP (ZIG-ZAG DUOLINGO STYLE)

**Ngữ cảnh:** 
Giao diện dạng Accordion (Hộp Bento) hiện tại không còn phù hợp khi số lượng bài học tăng lên và có nhiều loại bài học khác nhau (Flashcard, Story, Boss).
**Mục tiêu:** 
Chuyển đổi giao diện `SystemRoadmap.tsx` thành dạng danh sách cuộn dọc liền mạch. Các bài học (Node) sẽ được biểu diễn bằng các hình tròn, xếp theo hình Zig-zag, nối với nhau bằng một đường nét đứt ở dưới nền.

---

## 📐 PHẦN 1: CẤU TRÚC GIAO DIỆN (UI LAYOUT)

### 1. Đường nối bằng SVG (The SVG Path / Line)
- Để tạo cảm giác tự nhiên và giống chuẩn Duolingo nhất, chúng ta sẽ sử dụng các đường cong SVG nối giữa các Node thay vì đường dọc đơn điệu.
- Các đường cong sẽ được vẽ bằng thẻ `<svg>` chứa các thẻ `<path>` với thuộc tính `d` tính toán linh hoạt dựa trên tọa độ của các bài học. Các đường vẽ sẽ được uốn lượn mượt mà nhờ các hàm Bezier (VD: Cubic Bezier `C` hoặc Quadratic Bezier `Q`).
- Thuộc tính `stroke` (viền) đi qua các node đã hoàn thành sẽ có màu nổi bật (VD: Vàng `#FFD166`), trong khi đoạn đường phía trước chưa được mở khóa sẽ có màu xám (`#E4E4E7`). Sử dụng `stroke-width` dày dặn (tầm 16-24px) và `stroke-linecap="round"` để bo góc mềm mại.

### 2. Thuật toán Zig-zag và Tọa độ SVG (Positioning)
- Các Node sẽ được render trong một container bao ngoài tương đối (`relative`), xếp chồng theo chiều dọc (`flex-col`) với khoảng cách cố định (ví dụ: `gap-8` hoặc `py-6`).
- Dựa vào `index` của bài học, dùng Tailwind class như `translate-x` hoặc `margin` để tạo độ lệch (Offset). VD: Chu kỳ 4-6 bước: Lệch Trái -> Chính Giữa -> Lệch Phải -> Chính Giữa...
- Chìa khóa: Hệ thống sẽ tính toán tạo ra chuỗi tọa độ (X, Y) của tâm mỗi Node tương ứng với độ lệch này. Dữ liệu mảng tọa độ đó được nạp vào Component SVG vẽ nên một đường cong duy nhất đứt đoạn hoặc liền mạch trải dài đằng sau các Nodes.

---

## 🎨 PHẦN 2: THIẾT KẾ CÁC LOẠI NODE (NODE TYPES)

Mỗi Node sẽ là một nút tròn to (`rounded-full`), có đổ bóng 3D dày (shadow), chứa Icon tương ứng. Sẽ có 3 trạng thái màu sắc:
- **Bị khóa (Locked):** Nền xám nhạt, viền xám, Icon trắng đen.
- **Đang học (Active):** Nổi bật nhất. Có hiệu ứng nhấp nháy/vòng sáng xung quanh (Pulse/Ring). Nền theo màu của chương hoặc vàng/cam.
- **Đã xong (Completed):** Màu Vàng Gold hoặc Xanh lá, có icon Check hoặc vương miện nhỏ ở góc.

**Phân loại theo Dữ liệu (type):**
1. **Node Flashcard (Mặc định):** Hình tròn tiêu chuẩn (w-16 h-16). Icon đồ ăn hoặc quyển vở.
2. **Node Story (Visual Novel):** Hình tròn lớn hơn một chút (w-20 h-20), màu sắc rực rỡ (Hồng/Vàng), có icon 📖. Nằm ngay trên trục giữa.
3. **Node Boss (Cuối chương):** Hình tròn bự nhất (w-24 h-24), viền dày hơn, icon Lâu đài hoặc Quái vật 🏰.

---

## 🗂️ PHẦN 3: VÁCH NGĂN CHƯƠNG (CHAPTER SEPARATORS)

Thay vì phải bấm vào nắp hộp cơm để mở, các Chương sẽ được xếp nối tiếp nhau từ trên xuống dưới (hoặc dưới lên trên).
- Giữa các Chương sẽ có một **Banner chuyển mốc**.
- Banner này là một thẻ ngang bự, màu sắc khác biệt, hiển thị: `Chương X: Tên chủ đề` + Phân tích tiến độ (VD: 5/5 bài).
- Nút "Mở Rương" (Chest): Nếu qua chương, có thể thêm một hình ảnh rương kho báu để user cảm thấy hứng thú.

---

## 🚀 PHẦN 4: LỘ TRÌNH THỰC HIỆN CODE

### Bước 1: Chuẩn bị Helper vẽ đường SVG cong và tính độ lệch
- Viết hàm `getOffsetPosition(index)` để lấy biên độ dịch chuyển sang 2 bên của node.
- Viết component hoặc hàm `generateSVGPath(nodes)` để sinh ra chuỗi command `<path d="..." />` uốn lượn chính xác qua tâm các node.

### Bước 2: Dựng Component `RoadmapNode`
- Tách riêng logic của 1 Node ra thành 1 Component con (để file `SystemRoadmap` không bị quá dài).
- Component này nhận vào thông tin bài học (`deck`), trạng thái (`unlocked`, `completed`, `isActive`) và gọi hàm `getIcon()`.

### Bước 3: Thay thế giao diện hiện tại
- Xóa UI Bento Box.
- Render một mảng phẳng (hoặc map qua từng `chapters`) chứa Banner Chương và danh sách các `RoadmapNode`.
- Thêm thẻ `<svg>` phủ kín khung hiển thị đằng sau các node (`absolute inset-0 z-0 pointer-events-none`) để render đường đi.

### Bước 4: Tự động cuộn (Auto-Scroll)
- Dùng `useRef` và `scrollIntoView` để khi user mở tab "Hành trình", màn hình sẽ tự động trượt tới bài học đang `isActive` (bài chưa hoàn thành đầu tiên).

---

**Lưu ý:**
- Cần xử lý thứ tự sắp xếp. Duolingo thường xếp bài học cũ ở dưới đáy màn hình, bài mới ở trên đỉnh (Reverse), nhưng chúng ta có thể giữ nguyên quy tắc từ trên xuống dưới cho dễ đọc, miễn là Auto-scroll hoạt động tốt.
```

Kế hoạch đã sẵn sàng! Việc tách riêng một component `RoadmapNode` sẽ giúp code rất gọn gàng và dễ dàng bảo trì. Khi bạn đã đọc qua và đồng ý với hướng đi này, hãy báo cho tôi biết để chúng ta bắt đầu **Bước 1 & 2: Dựng Helper và Component Nút bài học (RoadmapNode)** nhé!