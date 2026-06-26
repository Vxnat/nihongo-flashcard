# Kế hoạch cải tiến: Hệ thống thay đồ trực quan chuẩn MMORPG 2D cho Shiba (v2 - Cập Nhật Vũ Trụ Anime)

Theo yêu cầu của bạn, chúng ta sẽ **xóa sạch và refactor lại toàn bộ vật phẩm** trong `gacha_pool.json` và `shop_items.json`. Các vật phẩm mới sẽ được lấy cảm hứng từ các bộ truyện anime Nhật Bản huyền thoại (Naruto, One Piece, Dragon Ball, Demon Slayer, Doraemon).

Điều này sẽ biến chú Shiba thành một Cosplayer chuyên nghiệp và mang lại trải nghiệm học tiếng Nhật vô cùng thú vị!

---

## 🎭 Danh sách Vật phẩm Vũ trụ Anime đề xuất

### 1. Gacha Pool (`gacha_pool.json`)

Chúng ta sẽ chia vật phẩm thành các Bộ Sưu Tập Anime để người chơi dễ thu thập:

#### BỘ SƯU TẬP 1: ĐẢO HẢI TẶC (ONE PIECE)
* **Mũ Rơm Luffy** (`out_straw_hat` - Head, `layerOrder: 350`): Chiếc mũ rơm huyền thoại của Luffy.
* **Áo Đỏ Hải Tặc** (`out_luffy_shirt` - Armor, `layerOrder: 250`): Áo gile đỏ cộc tay của Luffy.
* **Kiếm Khí Zoro** (`stk_zoro_swords` - Gloves, `layerOrder: 400`): Cầm 3 thanh kiếm thần sầu của Zoro.
* **Tàu Going Merry** (`stk_merry_ship` - Mount, `layerOrder: 100`): Con tàu gỗ Going Merry đồng hành cùng băng Mũ Rơm.
* **Rương Vàng Hải Tặc** (`fur_pirate_chest` - Furniture): Rương chứa đầy vàng bạc châu báu, tăng `+2 Xương/giờ`.

#### BỘ SƯU TẬP 2: NHẪN GIẢ LÀNG LÁ (NARUTO)
* **Băng Trán Konoha** (`out_konoha_band` - Head, `layerOrder: 330`): Băng trán bảo vệ nhẫn giả Làng Lá.
* **Võ Phục Cam Nhẫn Giả** (`out_naruto_suit` - Armor, `layerOrder: 250`): Bộ võ phục màu cam đặc trưng của Naruto.
* **Phi Tiêu Kunai** (`stk_kunai` - Gloves, `layerOrder: 400`): Cầm phi tiêu Kunai nhẫn giả sắc bén.
* **Hồ Ly Cửu Vĩ** (`stk_kurama` - Mount, `layerOrder: 100`): Cửu vĩ Kurama phiên bản chibi bay lơ lửng bên cạnh.
* **Bát Mỳ Ichiraku** (`fur_ramen_bowl` - Furniture): Bát mỳ ramen siêu to khổng lồ của quán Ichiraku, tăng `+2 Xương/giờ`.

#### BỘ SƯU TẬP 3: NGỌC RỒNG (DRAGON BALL)
* **Tóc Vàng Siêu Saiyan** (`out_goku_hair` - Head, `layerOrder: 340`): Tóc dựng ngược màu vàng rực lửa của Super Saiyan.
* **Võ Phục Rùa Kama** (`out_goku_gi` - Armor, `layerOrder: 250`): Bộ võ phục màu cam thêu chữ "Rùa" (Kame).
* **Ngọc Rồng Bốn Sao** (`stk_dragon_ball` - Gloves, `layerOrder: 400`): Viên ngọc rồng 4 sao kỷ vật của ông nội Goku.
* **Cân Đẩu Vân** (`stk_kinto` - Mount, `layerOrder: 100`): Đám mây vàng siêu tốc bay dưới chân Shiba.

#### BỘ SƯU TẬP 4: THANH GƯƠM DIỆT QUỶ (DEMON SLAYER)
* **Áo Haori Ca-rô** (`out_tanjiro_haori` - Armor, `layerOrder: 250`): Áo khoác Haori xanh đen đặc trưng của Tanjiro.
* **Khuyên Tai Hanafuda** (`stk_tanjiro_earrings` - Earring, `layerOrder: 310`): Khuyên tai Hanafuda gia truyền.
* **Hộp Gỗ Nezuko** (`stk_nezuko_box` - Mount, `layerOrder: 100`): Chiếc hộp gỗ đeo lưng để Nezuko trốn nắng.

#### BỘ SƯU TẬP 5: CHÚ MÈO MÁY (DORAEMON)
* **Chong Chóng Tre** (`out_take_copter` - Head, `layerOrder: 360`): Chong chóng tre bay lơ lửng trên đầu Shiba.
* **Bánh Rán Dorayaki** (`stk_dorayaki` - Gloves, `layerOrder: 400`): Bánh rán nhân đậu đỏ ngon lành.

#### CÁC MEME TIẾNG NHẬT ANIME (`meme` type)
* `mem_omae_wa`: "Omae wa mou shindeiru" (Bắc Đẩu Thần Quyền) - Học câu ngữ pháp kinh điển.
* `mem_dattebayo`: "Dattebayo!" (Naruto) - Câu kết thúc câu của Naruto, học cách dùng trợ từ nhấn mạnh.
* `mem_nani`: "Nani?!" - Học các câu hỏi ngạc nhiên.

#### GIỌNG NÓI ANIME (`voice` type)
* `voc_luffy`: Giọng nói "Kaizoku ou ni ore wa naru!" (Tôi sẽ trở thành Vua Hải Tặc!).
* `voc_naruto`: Giọng nói "Dattebayo!" tràn đầy năng lượng.
* `voc_goku`: Giọng nói "Ora Goku! Kamehameha!" oai hùng.

#### CHỦ ĐỀ ANIME (`theme` type)
* `thm_shinobi`: Giao diện phong cách cuộn giấy cổ và sắc cam của nhẫn giả.
* `thm_grand_line`: Giao diện màu xanh đại dương tươi mát.

---

### 2. Cửa tiệm độc quyền (`shop_items.json`)

Chúng ta sẽ có 3 sản phẩm Anime Độc Quyền cao cấp:
* **Áo Choàng Hokage** (`out_hokage_cloak` - Armor, `layerOrder: 260`, Giá: 300 xương): Áo choàng màu trắng thêu lửa đỏ của Hokage đệ Tứ.
* **Thần Kiếm Enma** (`stk_enma_sword` - Gloves, `layerOrder: 410`, Giá: 250 xương): Thanh kiếm huyền thoại của Zoro cắt đôi sừng rồng.
* **Giọng Seiyuu Shonen** (`voc_seiyuu_shonen` - Voice, Giá: 350 xương): Gói giọng nói hào hùng cổ vũ tinh thần học tập đậm chất Shonen anime.

---

## 🛠️ Triển khai mã nguồn & SVG Components

Chúng ta sẽ vẽ các SVG Canvas Layer (viewBox `0 0 100 100`) cho từng trang bị này:

1. **[BaseBody.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/BaseBody.tsx)**: Chú Shiba cơ bản (viewBox `0 0 100 100` từ `demo_shiba_base.svg`).
2. **[StrawHatLayer.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/StrawHatLayer.tsx)**: Mũ rơm.
3. **[LuffyShirtLayer.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/LuffyShirtLayer.tsx)**: Áo gile đỏ của Luffy.
4. **[ZoroSwordsLayer.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/ZoroSwordsLayer.tsx)**: Kiếm Zoro.
5. **[KonohaBandLayer.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/KonohaBandLayer.tsx)**: Băng trán Làng Lá.
6. **[NarutoSuitLayer.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/NarutoSuitLayer.tsx)**: Bộ đồ ninja cam.
7. **[TakeCopterLayer.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/layers/TakeCopterLayer.tsx)**: Chong chóng tre.
8. ... *(và các layer tương ứng khác)*.

Các component này được import và đăng ký vào `SVG_REGISTRY` trong [ShibaAvatar.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/shiba-room/ShibaAvatar.tsx) để hệ thống tự động render đè lên nhau theo `layerOrder` lấy từ JSON.

---

## ❓ Câu hỏi dành cho bạn

> [!IMPORTANT]
> Ý tưởng "Vũ trụ Shiba Anime" này cực kỳ tuyệt vời! 
> Bạn có đồng ý với việc reset hoàn toàn `gacha_pool.json` và `shop_items.json` theo danh sách trên không? Nếu đồng ý, tôi sẽ tiến hành tạo file JSON mới, viết các layer SVG và cập nhật component `ShibaAvatar`!
