# Kế Hoạch Thiết Kế: Hệ Thống Thông Tin Nhân Vật & Trang Bị MMORPG Shiba

Tài liệu này chi tiết ý tưởng và phương án kỹ thuật để tái thiết kế hòm đồ của **Shiba Room** thành màn hình **"Thông Tin Nhân Vật & Trang Bị"** chuẩn phong cách game MMORPG, chuẩn bị các chỉ số sức mạnh cho tính năng đánh Boss từ vựng trong tương lai.

---

## 🏠 1. Tinh Gọn Giao Diện Căn Phòng (Room UI Cleanup)
* **Mục tiêu**: Loại bỏ các khối thông số và nút to cồng kềnh phía dưới căn phòng washitsu để làm nổi bật canvas phòng.
* **Thay đổi**:
  * Chuyển chỉ số "Hiệu suất phòng" thành một **Badge nhỏ gọn** (ví dụ: `⚡ 2🦴/giờ` hoặc `🐾 2🦴/h`) đính ở góc trên bên phải của khung căn phòng Shiba.
  * Giữ nguyên nút **THU HOẠCH** nhưng có thể thu nhỏ và đặt tinh tế hơn hoặc chuyển thành tương tác trực tiếp click vào bong bóng xương bay trên đầu Shiba.

---

## 🎒 2. Giao Diện "Thông Tin Nhân Vật" (Character Sheet Model)
Thay thế hoàn toàn cấu trúc ngăn kéo (Drawer) hông hiện tại bằng một **Modal giao diện gỗ lớn kiểu RPG** chia làm 2 cột đối xứng:

```
+-----------------------------------------------------------------------+
|  🎒 THÔNG TIN NHÂN VẬT & TRANG BỊ                                 [X] |
+-----------------------------------+-----------------------------------+
|          CỘT BÊN TRÁI             |           CỘT BÊN PHẢI            |
|       (Nhân Vật & Trang Bị)       |       (Balo & Hòm Đồ RPG)         |
|                                   |                                   |
|   [Slot Mũ]           [Slot Giáp] | [ Tab Trang Bị ] [ Tab Nội Thất ] |
|   (🤠 Trống)          (🛡️ Trống)  | [ Tab Thẻ Bài ]  [ Tab Giọng Nói] |
|                                   |                                   |
|             +-------+             | +-------------------------------+ |
|   [Slot Tai] | Shiba | [Slot Tay] | | [Icon] [Icon] [Icon] [Icon]   | |
|   (💎 Trống) |  GIF  | (🧤 Trống) | | [Icon] [Icon] [Icon] [Icon]   | |
|             +-------+             | | [Icon] [Icon] [Icon] [Icon]   | |
|                                   | | [Icon] [Icon] [Icon] [Icon]   | |
|   [Slot Thú]          [Slot Aura] | +-------------------------------+ |
|   (🦄 Trống)          (💫 Trống)  |                                   |
|                                   |  Chi tiết vật phẩm được chọn:     |
|   HP: [========= 150/150 =====]   |  + Tên: Kiếm Gỗ Shiba             |
|   ATK: 25   DEF: 10   [(i) Info]  |  + Chỉ số: +15 ATK                |
|                                   |  [ TRANG BỊ ]       [ BÁN / RÃ ]  |
+-----------------------------------+-----------------------------------+
```

### A. Cột Bên Trái: Khung Trang Bị Nhân Vật
* **Hình ảnh đại diện**: Chú chó Shiba (file GIF gốc hoạt họa dễ thương) đứng ở vị trí trung tâm. Do Shiba là file GIF tĩnh, các trang phục sẽ không hiển thị đè trực tiếp lên GIF mà khảm vào các ô xung quanh.
* **6 Ô Trang Bị Xung Quanh (Equip Slots)**:
  1. 🤠 **Mũ (Head/Helmet)**: Gắn các loại nón/mũ (ví dụ: Mũ Ếch, Mũ Ninja).
  2. 🛡️ **Giáp (Armor/Body)**: Gắn các loại áo/khăn quàng (ví dụ: Khăn Quàng Đỏ, Giáp Samurai).
  3. 💎 **Khuyên tai (Earrings/Accessory)**: Các phụ kiện nhỏ tăng chỉ số thông thái.
  4. 🧤 **Găng tay/Vũ khí (Gloves/Weapon)**: Các vật phẩm chiến đấu cầm tay.
  5. 🦄 **Thú cưỡi (Mount)**: Các pet phụ trợ.
  6. 💫 **Hào quang (Aura/Effect)**: Hiệu ứng ánh sáng bao quanh chân vật phẩm.
* **Cơ chế khảm**: Khi khảm một vật phẩm vào ô trang bị, ô đó sẽ hiển thị icon/emoji của vật phẩm và phát sáng theo tông màu của độ hiếm (Common -> Divine).
* **Thanh máu & Chỉ số**:
  * Hiển thị thanh máu **HP** (màu xanh lá) và thông số **ATK** cơ bản bên dưới chú Shiba.
  * Nút **Info `(i)`**: Click mở ra một popup nhỏ hiển thị bảng phân tách tất cả các chỉ số cộng thêm từ trang bị:
    * *Lực công kích (ATK)*
    * *Lượng máu tối đa (HP)*
    * *Phòng thủ (DEF)*
    * *Tỷ lệ bạo kích (CRIT %)*
    * *Hiệu suất tăng trưởng Xương (Bonus 🦴/h)*

### B. Cột Bên Phải: Balo & Hòm Đồ RPG (Inventory Grid)
* **Hệ thống Tab**: Phân chia balo thành các ngăn chứa đồ:
  * ⚔️ **Trang Bị**: Chứa Stickers, Outfits đóng vai trò là vũ khí, giáp, bùa hộ mệnh.
  * 🛋️ **Nội Thất**: Chứa bàn ghế, cây cảnh để trang trí phòng Washitsu.
  * 🖼️ **Meme**: Chứa các thẻ bài kiến thức tiếng Nhật.
  * 🎙️ **Giọng Nói**: Chứa các gói âm thanh companion cổ vũ.
* **Ô Grid**: Xếp các ô vật phẩm sở hữu sát nhau (sử dụng `content-start`), hiển thị ảnh thật của meme/GIF nội thất, hiển thị ổ khóa và progress thanh tiến trình đối với đồ chưa unlock.
* **Khung Chi Tiết Nhanh (Quick Detail Panel)**: Nằm ở dưới cùng cột bên phải. Khi chọn một item, hiển thị tên, độ hiếm, chỉ số cộng thêm (VD: `+15 ATK`, `+50 HP`) và nút **TRANG BỊ** (hoặc **THÁO BỎ**).

---

## ⚔️ 3. Cơ Chế Thuộc Tính RPG & Chuẩn Bị Đánh Boss

Để chuẩn bị cho tính năng **Đánh Boss Realtime** thu thập từ vựng trong tương lai, các vật phẩm trong hòm đồ sẽ được bổ sung các chỉ số sức mạnh:

* **Sticker (Hình dán)**: Được coi là các "Lá bùa hộ mệnh" hoặc "Vũ khí phụ".
  * *Ví dụ*: Sticker Shiba Lười Biếng (`stk_shiba`) cộng `+30 HP`. Sticker Daruma May Mắn (`stk_daruma`) cộng `+5% Tỷ lệ bạo kích (CRIT)`.
* **Outfit (Trang phục)**: Được coi là Giáp/Mũ chiến đấu.
  * *Ví dụ*: Đồ Ninja (`out_ninja`) cộng `+20 ATK` và `+10 DEF`. Mũ Ếch Xanh (`out_frog_hat`) cộng `+15 DEF`.
* **Nội thất (Furniture)**: Không mang thuộc tính chiến đấu, giữ vai trò sản sinh Xương thụ động kinh tế để quay Gacha.

---

## ⚙️ 4. Cấu Trúc Dữ Liệu Kỹ Thuật (Zustand Store)

Cập nhật `userStats` trong Zustand store để hỗ trợ cơ chế khảm trang bị:
```typescript
interface UserStats {
  // ... các thông số cũ ...
  equippedSlots: {
    head: string | null;      // Mũ
    armor: string | null;     // Giáp
    earring: string | null;   // Khuyên tai
    gloves: string | null;    // Găng tay
    mount: string | null;     // Thú cưỡi
    aura: string | null;      // Hào quang
  };
}
```

Các hàm bổ sung trong store:
* `equipItem(slotKey, itemId)`: Khảm vật phẩm từ hòm đồ vào ô trang bị tương ứng, tính toán lại ATK, HP, DEF tổng.
* `unequipItem(slotKey)`: Tháo trang bị khỏi slot.
