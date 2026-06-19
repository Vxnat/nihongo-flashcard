# 🏡 KẾ HOẠCH TRIỂN KHAI: GACHA MỞ RỘNG (MEMES + SHIBA ROOM + VOICE PACKS)

Tài liệu này ghi lại thiết kế và kiến trúc kỹ thuật để mở rộng hệ thống Gacha với các bộ sưu tầm có giá trị cao hơn: **Thư viện Ảnh/GIF Meme**, **Căn phòng Shiba tương tác** (có bộ sản sinh Xương thụ động), và **Gói âm thanh Anime đồng hành**.

---

## 🎨 PHẦN 1: THƯ VIỆN MEME & GIF HỌC TIẾNG NHẬT (MEME GALLERY)

Thay vì các sticker tĩnh đơn điệu, người dùng sẽ sưu tầm những thẻ bài **Meme/GIF học tiếng Nhật hài hước** thu thập trên mạng. Mỗi meme sẽ đi kèm một từ vựng hoặc điểm ngữ pháp thực tế liên quan đến ngữ cảnh của meme đó.

### 🗄️ 1. Cấu trúc dữ liệu & thư mục
- **Thư mục lưu trữ**: Lưu các file ảnh/GIF meme vào `/public/images/memes/` (VD: `meme_kanji_crying.gif`, `meme_wa_ga.jpg`).
- **Định nghĩa dữ liệu (`src/constants/gachaPool.ts`)**:
  ```typescript
  export interface MemeItem {
    id: string;
    type: "meme";
    name: string;
    description: string;
    imageUrl: string;      // VD: "/images/memes/meme_kanji_crying.gif"
    japanesePoint: {
      word: string;        // Từ vựng/cụm từ tiếng Nhật xuất hiện trong meme
      meaning: string;     // Nghĩa tiếng Việt
      grammarNote: string; // Giải thích ngắn gọn hoặc mẹo nhớ
    };
    rarity: GachaRarity;
  }
  ```

### 🖼️ 2. Giao diện Album Meme
- **Giao diện lưới (Grid)**: Hiển thị danh sách các meme đã và chưa mở khóa dưới dạng album ảnh. Các meme chưa mở khóa sẽ hiển thị màu tối đen kèm biểu tượng khóa 🔒.
- **Modal chi tiết**: Khi click vào một meme đã mở khóa, sẽ hiện ra thẻ bài phóng to với đầy đủ thông tin mẫu câu tiếng Nhật, nút nghe phát âm và phần phân tích từ vựng/ngữ pháp vui nhộn ở phía dưới.

---

## 🏠 PHẦN 2: CĂN PHÒNG SHIBA TƯƠNG TÁC (SHIBA ROOM)

Một tab giao diện mới hiển thị căn phòng của chú chó Shiba. Đồ nội thất người dùng quay được sẽ dùng để trang trí phòng và tự động sản sinh **Xương (Bone)** theo thời gian.

### 📐 1. Triển khai bố cục bằng tọa độ tuyệt đối cố định (CSS Slots)
Để tránh lập trình hệ thống kéo thả phức tạp, căn phòng sẽ sử dụng một ảnh nền phòng trống tĩnh, trên đó định vị sẵn các **Slot (vị trí)** cố định bằng CSS `%` (`absolute`):

```
+---------------------------------------------------+
|                  [Wall Slot]                      |
|               (top: 22%, left: 45%)               |
|                                                   |
|  [Corner Slot]                                    |
| (top: 55%, left: 15%)      [Mascot & Floor Slot]  |
|                            (top: 65%, left: 52%)  |
+---------------------------------------------------+
```

- Khi người dùng chọn trang bị một đồ nội thất vào một slot, ta chỉ cần render hình ảnh của món đồ đó đè lên ảnh nền phòng tại vị trí tọa độ đã định nghĩa sẵn:
  ```tsx
  const ROOM_SLOTS = {
    wall: { top: "22%", left: "45%", zIndex: 10 },
    corner: { top: "55%", left: "15%", zIndex: 20 },
    floor: { top: "65%", left: "52%", zIndex: 30 },
  };
  ```

### 🐕 2. Thay đổi động trạng thái hoạt ảnh của Shiba
Chú Shiba ở giữa phòng sẽ hiển thị bằng ảnh GIF động. Ta sẽ dựa vào món đồ đang được trang bị ở **Floor Slot (vị trí sàn)** để thay đổi GIF tương tác tương ứng:

| Đồ nội thất đang lắp | Trạng thái Shiba | Ảnh GIF hiển thị |
| :--- | :--- | :--- |
| **Không lắp gì (Trống)** | Đứng vẫy đuôi | `shiba_idle.gif` |
| **Nệm ngồi Tatami** | Ngồi thiền / Học bài | `shiba_meditating.gif` |
| **Bàn sưởi Kotatsu** | Chui vào chăn ngủ gật | `shiba_sleeping_kotatsu.gif` |
| **Bonsai Mini** | Ngồi ngắm cây | `shiba_watering_bonsai.gif` |

### 🦴 3. Hệ thống sản sinh Xương thụ động (Passive Bone Generator)
Mỗi món đồ nội thất (từ bậc Rare trở lên) sẽ có chỉ số sản sinh xương mỗi giờ (`bonesPerHour`):
- Common: `0 🦴/giờ` (chỉ để trang trí)
- Rare: `1 🦴/giờ`
- Epic: `3 🦴/giờ`
- Legendary: `8 🦴/giờ`
- Mythic/Divine: `20 🦴/giờ`

#### Lưu trữ dữ liệu trong Store (`useAppStore.ts`):
```typescript
interface UserStats {
  coins: number;
  goldenFur: number;
  pityCounter: number;
  lastHarvestTime: string; // Thời gian thu hoạch cuối (lưu chuỗi ISO)
  equippedFurniture: Record<string, string>; // Bàn giao diện: SlotId -> FurnitureItemId
}
```

#### Công thức tính Xương tích lũy:
Mỗi khi người dùng mở màn hình Căn phòng, tính toán số xương tích lũy được kể từ lần thu hoạch cuối:
```typescript
const calculatePendingBones = () => {
  const lastHarvest = new Date(userStats.lastHarvestTime).getTime();
  const now = Date.now();
  const elapsedHours = (now - lastHarvest) / (1000 * 60 * 60);

  // Tổng số xương mỗi giờ từ tất cả đồ nội thất đang lắp trong phòng
  const totalBonesPerHour = Object.values(userStats.equippedFurniture).reduce((sum, itemId) => {
    const item = GACHA_POOL.find(i => i.id === itemId);
    return sum + (item?.bonesPerHour || 0);
  }, 0);

  return Math.floor(elapsedHours * totalBonesPerHour);
};
```

#### Nút Thu hoạch (Harvest UI):
Hiển thị một biểu tượng khúc xương lơ lửng trên đầu Shiba kèm số lượng xương đang tích lũy (ví dụ: `🦴 +25`). Khi người dùng click vào:
1. Cộng số lượng xương tích lũy được vào `userStats.coins`.
2. Cập nhật `lastHarvestTime` về thời điểm hiện tại `new Date().toISOString()`.
3. Phát âm thanh thu hoạch vui tai và hiệu ứng pháo hoa giấy (confetti).

---

## 🎙️ PHẦN 3: GÓI ÂM THANH ANIME ĐỒNG HÀNH (VOICE PACKS)

Mở khóa các file âm thanh giọng nói ngắn (Voice Lines) của nhân vật hoặc chú Shiba bằng tiếng Nhật (anime seiyuu style) để cổ vũ người học trong suốt quá trình ôn luyện thẻ bài.

### 📁 1. Quản lý tài nguyên & Store
- **Lưu trữ âm thanh**: Lưu các file âm thanh ngắn vào `/public/audio/voices/` (VD: `voice_shiba_sugoi.mp3`, `voice_shiba_ganbatte.mp3`, `voice_shiba_yatta.mp3`).
- **Trang bị giọng nói trong Store**:
  ```typescript
  interface UserStats {
    // ...
    equippedVoicePack: string; // ID của gói giọng nói đang chọn làm bạn đồng hành
  }
  ```

### 🔊 2. Hàm kích hoạt phát âm thanh trong Game
Tạo một hàm helper phát nhạc đơn giản:
```typescript
export const playCompanionVoice = (voiceType: "correct" | "incorrect" | "victory", companionId: string) => {
  const audioPath = `/audio/voices/${companionId}_${voiceType}.mp3`;
  const audio = new Audio(audioPath);
  audio.volume = 0.6; // Đặt âm lượng vừa phải
  audio.play().catch(err => console.warn("Failed to play audio:", err));
};
```

- **Tích hợp vào màn hình Flashcards**:
  - Khi người dùng click lật thẻ học từ vựng:
    - **Nếu trả lời đúng**: Kích hoạt `playCompanionVoice("correct", userStats.equippedVoicePack)` (Phát tiếng: *Sugoi! / Yatta!*).
    - **Nếu trả lời sai**: Kích hoạt `playCompanionVoice("incorrect", userStats.equippedVoicePack)` (Phát tiếng: *Ganbatte! / Don't mind!*).
    - **Khi hoàn thành cả buổi học (Session Victory)**: Kích hoạt `playCompanionVoice("victory", userStats.equippedVoicePack)`.

---

## 🛠️ PHẦN 4: THAY ĐỔI DỮ LIỆU & CHUẨN BỊ (DATA SCHEMA PREPARATION)

Trước khi đi vào xây dựng giao diện, ta cần chuẩn bị và cập nhật các file dữ liệu lõi của hệ thống:

### 1. File định nghĩa Gacha Pool (`src/constants/gachaPool.ts`)
- **Cập nhật `GachaItemType`**: Bổ sung hai kiểu dữ liệu mới: `"meme" | "voice"`.
- **Cập nhật interface `GachaItem`**:
  - Thêm `imageUrl?: string` và `japanesePoint?: { word: string; meaning: string; grammarNote: string }` phục vụ cho vật phẩm loại `meme`.
  - Thêm `audioUrl?: string` phục vụ cho vật phẩm loại `voice`.
  - Thêm `bonesPerHour?: number` phục vụ cho vật phẩm loại `furniture` để tính toán sản lượng xương tự động.
- **Cập nhật `GACHA_POOL`**:
  - Thêm các Meme mẫu (Common/Rare/Epic) và Gói âm thanh mẫu vào danh sách.
  - Bổ sung thuộc tính `bonesPerHour` cho toàn bộ các vật phẩm thuộc loại `furniture` hiện có dựa vào độ hiếm tương ứng.

### 2. File quản lý State (`src/stores/useAppStore.ts`)
- **Cập nhật `UserStats`**:
  - Thêm `goldenFur: number` và `pityCounter: number`.
  - Thêm `lastHarvestTime: string` (lưu mốc thời gian thu hoạch cuối).
  - Thêm danh sách trang bị: `equippedFurniture: Record<string, string>` và `equippedVoicePack: string | null`.
  - Thêm danh sách sở hữu: `unlockedFurniture: string[]`, `unlockedMemes: string[]`, `unlockedVoices: string[]`, và bảng mảnh ghép `shards: Record<string, number>`.
- **Viết các Action xử lý**:
  - `processGachaRoll`: Nhận vào kết quả quay, kiểm tra nếu là mảnh thì cộng vào bảng mảnh ghép, nếu đủ mảnh tự động ghép thành đồ thật. Nếu đã có đồ thật (trùng lặp) thì tự động phân rã thành Lông Vàng.
  - `equipFurniture`: Cập nhật đồ nội thất vào các Slot phòng.
  - `equipVoicePack`: Trang bị giọng nói đồng hành.
  - `harvestBones`: Thực hiện cộng xương tích lũy vào ví tiền và reset `lastHarvestTime` về thời gian hiện tại.

### 3. Hiển thị Gacha (`src/components/GachaShop.tsx` & `src/components/GachaMultiResultModal.tsx`)
- Điều chỉnh card lật kết quả: Nếu là vật phẩm loại `meme`, ta hiển thị hình ảnh thu nhỏ của meme thay vì emoji chữ. Nếu là `voice`, hiển thị icon loa phát nhạc và tự động phát file `.mp3` giới thiệu giọng nói đó ngay khi lật thẻ.

---

## 📅 LỘ TRÌNH TRIỂN KHAI DỰ KIẾN

1. **Bước 1**: Cập nhật lại các TypeScript type và Store State (`useAppStore.ts` và `src/constants/gachaPool.ts`) theo đúng thiết kế PHẦN 4.
2. **Bước 2**: Sưu tầm tài nguyên (Tìm các hình ảnh meme học tiếng Nhật vui nhộn và các file voice anime ngắn chất lượng tốt).
3. **Bước 3**: Xây dựng Tab/Trang **Thư viện Meme** để hiển thị album các ảnh/GIF đã thu thập được.
4. **Bước 4**: Tạo Tab **Căn phòng Shiba (Shiba Room)**, code layout căn phòng dạng Absolute Slots và viết logic sản sinh/thu hoạch Xương tự động trong Store.
5. **Bước 5**: Viết phần cài đặt Balo để trang bị **Gói giọng nói đồng hành** và kết nối vào sự kiện chọn đáp án của màn hình Flashcard.
