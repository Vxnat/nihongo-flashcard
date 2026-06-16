# 🗺️ KẾ HOẠCH TÍCH HỢP VISUAL NOVEL VÀO ROADMAP (HƯỚNG 1 - DUOLINGO STYLE)

**Mục tiêu:** 
Biến Visual Novel (VN) thành một "Trạm dừng chân" (Node) trên Bản đồ hành trình (Roadmap). Khi người dùng kích hoạt, VN sẽ hiển thị dưới dạng Full-screen Overlay (phủ kín toàn bộ màn hình, che đi Header và Bottom Nav). Khi chơi xong, tự động đóng lại và trả về bản đồ.

---

## 🧠 BƯỚC 1: QUẢN LÝ TRẠNG THÁI GLOBAL (ZUSTAND)

Cần thêm một state vào `useAppStore` để toàn bộ ứng dụng biết khi nào thì chế độ Đọc truyện đang được bật.

- **State:** `activeStoryId: string | null` (Mặc định là `null`).
- **Action:** `setActiveStoryId: (id: string | null) => void`.
- *Lý do:* Nếu dùng local state trong `page.tsx` thì các component nằm sâu bên trong (như Roadmap Node) sẽ khó gọi. Dùng Zustand giúp ta dễ dàng mở Truyện từ bất kỳ đâu.

---

## 🖼️ BƯỚC 2: RENDER OVERLAY FULL-SCREEN (TẠI `page.tsx`)

Xóa component `<VisualNovelMode />` đang bị đặt cứng ở giữa trang.
Sử dụng `AnimatePresence` của Framer Motion để bọc `<VisualNovelMode />` và chỉ render khi `activeStoryId !== null`.

- **CSS Classes bắt buộc:** `fixed inset-0 z-[999] bg-black/90 flex items-center justify-center`
- **Lợi ích:** 
  - `fixed inset-0` giúp nó phủ kín toàn màn hình điện thoại/PC.
  - `z-[999]` đảm bảo nó nằm trên tất cả mọi thứ (bao gồm cả `BottomNav` và `UserStatsPill`).
  - Hiệu ứng Fade-in / Fade-out mượt mà khi mở/đóng truyện.

---

## 🚀 BƯỚC 3: CẬP NHẬT `VisualNovelMode.tsx`

Thay vì hardcode fetch file `vn_chapter_01.json`, component này cần nhận `storyId` từ Zustand.

- **Props / State nội bộ:** Lấy `activeStoryId` từ store để fetch đúng file JSON (VD: `/data/vn/${activeStoryId}.json`).
- **Logic Nút Đóng (Exit):** 
  - Ở màn hình `VNEndScreen` (khi kết thúc truyện), thay vì reset về `node_001`, hàm `onClose` sẽ gọi `setActiveStoryId(null)` để tắt hoàn toàn Overlay.
  - Cần thêm một nút "X" nhỏ ở góc trên màn hình trong lúc đọc truyện để user có thể thoát ra giữa chừng nếu muốn.

---

## 🗺️ BƯỚC 4: THÊM NODE CỐT TRUYỆN VÀO ROADMAP (`SystemRoadmap.tsx`)

Cập nhật giao diện bản đồ để xen kẽ các bài học Flashcard là các bài học Visual Novel.

- **UI Node Đặc biệt:** Thay vì Icon hình ngôi sao/thẻ bài, Node truyện sẽ có Icon hình Quyển sách 📖 hoặc Nhân vật Mascot. Có màu sắc khác biệt (VD: Vàng chanh, viền lấp lánh).
- **On Click:** Kích hoạt hàm `setActiveStoryId("vn_chapter_01")`.

---

**Tóm tắt Luồng User:**
Trang chủ (Roadmap) -> Click Node Truyện -> Màn hình tối lại, VN bung ra Full-screen (mất BottomNav) -> Đọc truyện -> Tung pháo hoa, Nhận xu -> Bấm Đóng -> Màn hình VN mờ dần, trả lại Roadmap -> Xong!

---

## 🔄 BƯỚC 5: ĐỘNG HÓA LỘ TRÌNH (DYNAMIC ROADMAP - CHUẨN DUOLINGO)

**Mục tiêu:** 
Loại bỏ việc hardcode (gắn cứng) Visual Novel vào cuối Chương 1. Tích hợp trực tiếp dữ liệu Truyện vào chung file `system_decks.json` để tận dụng logic Khóa/Mở khóa (Lock/Unlock) và chia chương tự động.

### 5.1. Cập nhật dữ liệu (`public/data/system_decks.json`)
- Thêm trường `"type": "flashcard"` vào các bài học thông thường (có thể bỏ qua nếu xem mặc định là flashcard).
- Thêm object truyện vào vị trí mong muốn với `"type": "story"`.
  - `id`: Tên file JSON của truyện (VD: `vn_chapter_01`).
  - `prerequisite`: Trỏ tới ID của bài học trước đó (để khóa truyện nếu chưa học xong bài trước).

### 5.2. Cập nhật Interface Type
- Mở rộng Interface đại diện cho Deck (`CustomDeck` hoặc System Deck) thêm thuộc tính `type?: "flashcard" | "story"`.

### 5.3. Xử lý Logic Hoàn thành Truyện (Progress)
- Các bài Flashcard dùng `knownIds.length === totalCards` để xác định đã hoàn thành (`completed`). Truyện thì không có số lượng thẻ.
- **Giải pháp:** Khi người dùng xem đến màn hình `VNEndScreen`, hệ thống sẽ gọi hàm `saveProgress(storyId, ["completed"])`. Hook `useSystemRoadmap` sẽ tự hiểu là Truyện này đã học xong (vì `learnedCount > 0`), từ đó mở khóa bài học kế tiếp.

### 5.4. Cập nhật Giao diện Bản đồ (`SystemRoadmap.tsx`)
- Trong vòng lặp map các `item` của mỗi chương, kiểm tra `item.deck.type`.
- Nếu `type === "story"`: Render ra khối UI Quyển sách lấp lánh. Sự kiện `onClick` là mở Overlay Story. Trạng thái xám/khóa vẫn áp dụng tự động nhờ biến `item.unlocked`.
- Nếu `type === "flashcard"` (mặc định): Render ra khối UI đồ ăn Bento bình thường. Sự kiện `onClick` là chuyển hướng sang trang `/deck/...`.