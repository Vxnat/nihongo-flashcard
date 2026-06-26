# Kế hoạch Thiết kế và Triển khai Minigame 🎧 Shiba Rhythm Tiles (Rhythm Game)

Minigame **Shiba Rhythm Tiles** là một game âm nhạc (Rhythm Game) dạng Piano Tiles kết hợp luyện nghe (Choukai) và phản xạ mặt chữ Kana/Kanji nhanh. Người chơi sẽ nghe phát âm và bấm vào các nốt nhạc (dấu chân Shiba) trôi xuống theo nhịp nhạc nền để tạo nên một giai điệu vui tai.

---

## 1. Ý TƯỞNG THIẾT KẾ CỐT LÕI (GAMEPLAY & LEARNING)

### 🎯 Cơ chế "Săn chữ theo tiếng hô" (Target Sound Match) & Đợt nốt (Wave Spawn)
* **Chỉ định từ:** Hệ thống bốc ngẫu nhiên một từ mục tiêu từ Deck thông qua hàm thích ứng `selectAdaptiveCards`, phát âm thanh giọng đọc chuẩn từ VOICEVOX API (Giọng nói dễ thương của nhân vật số 8 🔊) và hiển thị từ đó kèm nghĩa ở bảng mục tiêu trên cùng.
* **Cơ chế Spawn theo hàng dọc (Wave Spawn):**
  - Hệ thống cho rơi các nốt theo từng hàng ngang gồm **4 nốt chữ cái** đồng thời ở 4 làn chạy.
  - Trong đó: **Chỉ có 1 nốt** chứa chữ cái đúng của từ mục tiêu (Target Note), **3 nốt còn lại** chứa chữ cái nhiễu (Dummy Notes) hoặc thỉnh thoảng có 1 nốt Mặt Quỷ 👹 cản trở.
  - Người chơi phải chọn làn chính xác chứa chữ cái đúng và bấm đúng làn đó. Gõ đúng nốt mục tiêu lập tức đổi từ mục tiêu khác và sinh ra đợt nốt tiếp theo.
* **Phạt bấm làn trống (Empty Tap):**
  - Gõ phím vào làn không có nốt nào hoặc gõ khi nốt nằm ngoài Hit Window (gõ quá sớm) sẽ bị tính là **Miss** -> **Trừ 1 tim (HP)** và reset combo. Điều này ngăn chặn hành vi gõ bừa bãi.

### 🎵 Đồng bộ Nhịp điệu & Giai điệu tương tác
* **BGM (Nhạc nền):** Sử dụng một đoạn nhạc beat 8-bit hoặc Lo-fi dễ thương (tempo cố định khoảng 120 BPM). Người dùng có thể upload/thay thế file nhạc yêu thích tại `/public/sounds/rhythm_bgm.mp3`.
* **Tạo giai điệu tương tác (Melody Output):**
  - Khi người chơi bấm đúng nốt nhạc mục tiêu: Phát âm thanh nhạc cụ trong trẻo bằng Web Audio API (AudioContext) để tối ưu độ trễ (0ms latency).
  - Cao độ (pitch) của nốt nhạc cụ sẽ thay đổi tùy theo làn chạy (Làn 1: Đồ - C4, Làn 2: Rê - D4, Làn 3: Mi - E4, Làn 4: Son - G4) để người dùng "chơi" được cả bài nhạc khi gõ đúng liên tiếp.

---

## 2. GIAO DIỆN GAME (UI/UX PASTEL CUTE & DISCO FEVER)

* **Chế độ thường:** Tone màu sáng pastel ấm (Cam be `#FFF8F0` và Trắng sữa `#FFFFFF`).
  - Gồm **4 làn chạy dọc** màu kem mềm mại ngăn cách bằng nét đứt cam nhạt.
  - Phía dưới là một **Vạch Nhịp (Hit Line)** được bo tròn kẹo dẻo màu cam `#FF9F1C`, phát sáng rực rỡ khi bấm trúng.
  - Chú Shiba mascot (`shiba_master.gif`) nhún nhảy theo nhịp.
* **Chế độ Fever Mode (Bar Club):**
  - Khi người chơi tích lũy đủ **10 Combo**:
    - **Nền màn hình tối sầm:** Playfield chuyển sang màu đen sâu `#0B0813` huyền ảo.
    - **Đèn Spotlight quét sân khấu:** 2 đèn ở góc trên bên trái (đèn hồng `#FF7096`) và góc trên bên phải (đèn vàng `#FFD166`) quét qua quét lại (CSS rotation keyframes).
    - **Shiba Mascot nhảy sung:** Đổi mascot sang GIF nhảy ăn mừng cực sung **`mascot-success.gif`**.
    - **Nốt nhạc ngôi sao:** Tất cả nốt đổi thành **Ngôi sao vàng 🌟 phát sáng neon**, người chơi gõ tự do bất kỳ làn nào để ăn điểm nhân đôi (x2) trong 5s.

---

## 3. CHI TIẾT LUỒNG TRÒ CHƠI (GAMEPLAY FLOW)

### Bước 1: Khởi động (Start Screen)
- Đếm ngược `3... 2... 1... GO!` dễ thương. Nhạc nền (BGM) bắt đầu phát. Shiba mascot vào tư thế nhún nhảy theo nhịp.
- Hiển thị **Modal hướng dẫn** có Mascot Shiba đeo tai nghe giảng giải luật chơi cho lần đầu vào (lưu trạng thái `hasSeenRhythmTutorial` vào `localStorage` sau khi nhấn "ĐÃ HIỂU!").

### Bước 2: Chỉ định Mục Tiêu
- Bốc từ ngẫu nhiên trong Deck sử dụng `selectAdaptiveCards`. Phát giọng đọc từ đó (giọng VOICEVOX 🔊). Hiển thị bảng mục tiêu ở trên cùng: **Săn từ: ねこ (Con mèo)**.

### Bước 3: Rơi Nốt & Gõ Phím
- Đợt nốt gồm 4 chữ cái (hoặc bẫy Oni) bắt đầu rơi.
- Người chơi gõ phím tương ứng (A, S, D, F hoặc chạm màn hình) khi nốt mục tiêu vào Hit Window.
- **Xử lý kết quả:**
  * **Gõ đúng làn chữ:** Cộng điểm + tăng combo. Phát tiếng nhạc cụ. Shiba nhảy mừng. **Đổi sang từ mục tiêu khác ngay lập tức**.
  * **Gõ sai / Gõ nhầm làn chữ nhiễu / Empty Tap (gõ làn trống):** Báo đỏ, mất 1 tim (HP), reset combo.
  * **Bỏ lỡ (Miss nốt mục tiêu trôi qua vạch nhịp Y > 95%):** Mất 1 tim (HP), reset combo, tự động đổi sang từ mục tiêu khác.

### Bước 4: Các Trạng thái Đặc biệt & Hiệu ứng Thị giác (Visual Effects)
* **Fever Mode (Bar Club):** Nhạc bốc hơn, đèn quét spotlight xoay tròn, đổi GIF `mascot-success.gif`, nốt sao vàng 🌟 gõ tự do x2 điểm.
* **Nốt đặc biệt (Chỉ rơi khi Combo $\ge$ 5):**
  - *Nốt Đùi Gà 🍖:* HP < 3 hồi 1 tim; HP = 3 hiện badge nổi bong bóng `+1` mạng tích lũy (tối đa 5 tim).
  - *Nốt Khiên 🧼:* Kích hoạt vòng bong bóng bảo vệ Shiba. Chặn 1 lần gõ sai.
  - *Nốt Mặt Quỷ 👹 (Nốt Bẫy):* Bấm trúng bị trừ tim, Shiba chóng mặt và toàn bộ màn hình bị **phủ lớp khói tím mờ trong 2 giây** (`backdrop-blur`).
  - *Nốt Xu Vàng 🪙:* Bấm trúng phát tiếng `coin.mp3` vui tai, hiển thị hiệu ứng đồng xu vàng bay về rương xu và chữ `+1 🪙` bay lên.

### Bước 5: Kết thúc & Nhận thưởng
- Kết thúc khi hết sạch tim (Thua) hoặc hoàn thành danh sách từ (Thắng).
- Hiển thị bảng điểm, combo lớn nhất, số xu vàng nhận được và nút chơi lại.

---

## 4. PROPOSED CHANGES (CÁC THAY ĐỔI CỤ THỂ)

### [Component 1] Cấu hình Bản đồ (Roadmap Data)
#### [MODIFY] [system_decks.json](file:///home/ubuntu/DuAn/nihongo-flashcard/public/data/configs/system_decks.json)
- Khai báo minigame `mg_rhythm_n5_01` trong Progression chain.

### [Component 2] Tích hợp Định tuyến Minigame
#### [MODIFY] [page.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/app/(user)/page.tsx)
- Thêm định tuyến render RhythmGame.

### [Component 3] Logic Hook điều khiển nhịp điệu
#### [MODIFY] [useRhythmGame.ts](file:///home/ubuntu/DuAn/nihongo-flashcard/src/hooks/games/rhythm/useRhythmGame.ts)
- Thay đổi logic spawn sang dạng hàng ngang 4 nốt (Wave Spawn) chứa 1 chữ cái đúng và 3 chữ cái nhiễu/Oni.
- Giao thêm logic gõ làn trống/lệch nhịp (Empty Tap) phạt trừ tim.
- Cho rơi nốt bổ trợ (🍖, 🧼, 🪙) khi Combo $\ge$ 5.
- Cung cấp trạng thái Fever Mode tối ưu hóa cho giao diện Bar Club.

### [Component 4] Giao diện trò chơi Shiba Rhythm Tiles
#### [MODIFY] [RhythmGame.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/games/rhythm/RhythmGame.tsx)
- Thiết lập CSS spotlight xoay vòng nhịp nhàng (pink & yellow).
- Đổi màu nền sang đen sâu `#0B0813` và đổi mascot sang `mascot-success.gif` khi `isFeverMode === true`.

---

## 5. KẾ HOẠCH XÁC MINH (VERIFICATION PLAN)
- Chạy `npm run build` để kiểm tra compile TypeScript.
- Kiểm tra thủ công tính năng phạt gõ làn trống, nốt rơi theo hàng 4 làn, các hiệu ứng đèn quét Bar Club và tim tích lũy.
