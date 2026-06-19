# Kế Hoạch Thiết Kế: Cửa Tiệm Đổi Lông Vàng Shiba (Mystic Shiba Shop)

Tài liệu này chi tiết ý tưởng thiết kế, cấu trúc dữ liệu, giao diện UI/UX và các bước kỹ thuật để xây dựng **Cửa Tiệm Đổi Lông Vàng** mang phong cách MMORPG cho ứng dụng học tập.

---

## 🏮 1. Ý Tưởng Chủ Đạo (Lore & Concept)
* **Tên tiệm**: **Tiệm Kỳ Trân Shiba** (Mystic Shiba Bazaar).
* **Mascot thương nhân**: Chú chó Shiba thương nhân đáng yêu mặc yukata Nhật Bản cổ truyền, mang balo gỗ sau lưng đựng đầy bảo vật.
* **Tương tác**: Chú Shiba sẽ hiển thị ở góc trên của cửa tiệm với bong bóng thoại ngẫu nhiên:
  * *"Irasshaimase! Đang có nhiều Lông Vàng lánh lấp chứ? 🪶"*
  * *"Muốn đổi bùa may mắn hay mảnh ghép thần thoại đây nyan?"*
  * *"Học hành chăm chỉ thì mới có lông vàng xịn để đổi nha!"*

---

## 🛍️ 2. Danh Mục Hàng Hóa (Items & Economy)

Tiệm được chia làm 3 tab mua sắm chính:

### Tab 1: 💎 Mảnh Kỳ Trân (Shard Market)
Cho phép người chơi mua lẻ từng mảnh ghép của các vật phẩm hiếm để ghép đồ, giảm sự phụ thuộc vào nhân phẩm gacha:
* **Mảnh Epic**: Giá `10 Lông Vàng / mảnh`
* **Mảnh Legendary**: Giá `30 Lông Vàng / mảnh`
* **Mảnh Mythic**: Giá `100 Lông Vàng / mảnh`
* **Mảnh Divine**: Giá `300 Lông Vàng / mảnh`

### Tab 2: 👑 Đồ Giới Hạn (Exclusive Goods)
Bán các vật phẩm trang trí phòng Shiba hoặc gói giọng nói seiyuu độc quyền không thể quay ra từ Gacha thường:
* **Nội thất: Bức Tranh Cổ Phú Sĩ (Wall)**: Giá `150 Lông Vàng` (Tăng hiệu suất: `+4 Xương/giờ`).
* **Đồng hành: Giọng nói Seiyuu Kiêu Kỳ (Tsundere Voice)**: Giá `300 Lông Vàng`.
* **Trang phục: Mũ Samurai (Outfit)**: Giá `200 Lông Vàng`.

### Tab 3: 🔮 Bùa Bổ Trợ (Consumables)
Vật phẩm tiêu hao giúp gia tăng hiệu suất học tập và thu hoạch:
* **Bùa Thu Hoạch (Double Bones)**: Nhân đôi lượng xương thu hoạch được trong Shiba Room trong 24 giờ. Giá `50 Lông Vàng`.
* **Bùa Gacha May Mắn (Lucky Talisman)**: Tăng thêm `5%` tỷ lệ ra đồ Legendary trở lên trong 5 lượt quay tiếp theo. Giá `80 Lông Vàng`.

---

## 🎨 3. Thiết Kế Giao Diện UI/UX (MMORPG Style)

### A. Tông Màu & Chất Liệu
* **Nền**: Sử dụng tông màu gỗ ấm (`#FAF6EE` kết hợp với viền gỗ đậm `#8C6D58`), tạo cảm giác như các trò chơi nhập vai cổ điển.
* **Đường viền & Góc**: Bo viền gỗ sang trọng, có đinh tán trang trí ở 4 góc bảng.
* **Ví tiền**: Thanh hiển thị số lượng Lông Vàng sở hữu `userStats.goldenFur` được bọc trong một pill bo tròn lấp lánh có viền vàng óng: `🪶 120`.

### B. Cấu Trúc Bố Cục Cửa Hàng (Shop Layout)
* **Khu vực Header**: Chứa tiêu đề tiệm kèm nút đóng `X` và Mascot Shiba vẫy tay chào.
* **Kênh Tab Selector**: Thanh chuyển đổi 3 tab bằng các nút gỗ mộc mạc.
* **Danh sách sản phẩm (Product Grid)**:
  * Lưới grid 3 cột (trên mobile) hoặc 4 cột (trên desktop).
  * Mỗi vật phẩm nằm trong một ô vuông có viền màu sắc tương ứng với độ hiếm (Epic - Tím, Legendary - Vàng, v.v.).
  * Phía dưới mỗi ô hiển thị giá bán bằng số kèm icon lông vũ vàng `🪶`.
  * Nếu đã sở hữu hoặc hết lượt mua, ô sẽ có lớp phủ mờ kèm nhãn `ĐÃ SỞ HỮU` hoặc `HẾT HÀNG`.

### C. Hộp Thoại Chi Tiết Vật Phẩm (Item Tooltip Overlay)
Khi bấm vào một vật phẩm, một khung thông tin chi tiết trượt lên từ dưới (hoặc pop-up ở giữa):
* **Hình ảnh lớn** của vật phẩm hoặc mảnh ghép nằm trong khung nền phát sáng hào quang độ hiếm.
* **Mô tả cốt truyện (Lore)**: Các câu chuyện ngắn thú vị về nguồn gốc vật phẩm.
* **Thuộc tính active**: VD: `Lắp đặt để nhận +4 Xương/giờ`.
* **Nút Xác Nhận Trao Đổi**:
  * Đủ tiền: Nút vàng kim rực rỡ có hoạt họa lấp lánh.
  * Thiếu tiền: Nút xám mờ ghi rõ: *"Không đủ Lông Vàng"*.

---

## ⚙️ 4. Luồng Xử Lý Logic (Zustand & Firestore)

1. **Zustand Action (`buyShopItem`)**:
   * Kiểm tra số lượng Lông Vàng của người dùng: `userStats.goldenFur >= item.cost`.
   * Thực hiện trừ Lông Vàng: `goldenFur = goldenFur - item.cost`.
   * Cấp phát vật phẩm:
     * Nếu là **Mảnh ghép**: Cộng thêm 1 vào `shards[itemId]`.
     * Nếu là **Vật phẩm giới hạn**: Thêm `itemId` vào danh sách tương ứng (`furniture`, `unlockedVoices`, v.v.).
     * Nếu là **Bùa bổ trợ**: Cập nhật trạng thái bùa active (ví dụ: `activeDoubleBonesUntil: Date.now() + 24 * 60 * 60 * 1000`).
   * Đồng bộ hóa ngay lập tức lên Firestore tại tài liệu `user_stats/{uid}`.
2. **Hiệu ứng mua thành công**:
   * Kích hoạt âm thanh rủng rẻng của đồng xu vàng rơi.
   * Tạo hiệu ứng pháo hoa giấy bay quanh màn hình.

---

## 🛠️ 5. Kế Hoạch Triển Khai Tiếp Theo

1. **Cập nhật database & cấu hình**: Định nghĩa danh sách các mặt hàng bán trong Shop tại `src/constants/shopItems.ts`.
2. **Cập nhật Zustand Store**: Bổ sung hàm `buyShopItem` trong `src/store/useAppStore.ts` để xử lý logic trừ tiền và nhận đồ.
3. **Xây dựng Giao diện**: Tạo component `src/components/FurShopModal.tsx` để render cửa tiệm đổi lông.
4. **Tích hợp lối vào**: Thêm nút gỗ mở cửa tiệm bên cạnh máy gacha ở `GachaShop.tsx` hoặc trong khay Balo ở `ShibaRoom.tsx`.
