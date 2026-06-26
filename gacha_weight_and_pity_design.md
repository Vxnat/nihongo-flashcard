# Thiết Kế Thuật Toán Gacha: Bảo Hiểm Cân Bằng & Trọng Số Phân Lớp (Hybrid Gacha Weight & Pity Design)

Tài liệu này trình bày chi tiết về ý tưởng thiết kế, công thức toán học và phương án triển khai thuật toán quay Gacha mới cho **Shiba Town**, nhằm giải quyết hai vấn đề:
1. Tỷ lệ rơi đồ hiếm (Legendary/Mythic) khi chạm mốc bảo hiểm (Pity) bị quá cao (gây lạm phát vật phẩm).
2. Sự mất cân bằng giữa các loại vật phẩm cùng độ hiếm (ví dụ: các vật phẩm giá trị cao như Theme/Outfit bị rơi ra quá dễ dàng so với các vật phẩm nhỏ như Sticker).

---

## 1. Cơ Chế Bảo Hiểm Cân Bằng (Balanced Pity Rates)

### Hiện trạng
Khi người chơi thực hiện lượt quay thứ 50 liên tiếp mà chưa trúng đồ có độ hiếm cao (`currentPity >= 49`), hệ thống sẽ kích hoạt chế độ **Bảo hiểm**.
* **Công thức hiện tại**: Sinh số ngẫu nhiên từ `0` đến `16`.
* **Tỷ lệ thực tế**:
  * **Divine**: $0.625\%$
  * **Mythic**: $6.250\%$
  * **Legendary**: $30.625\%$
  * **Epic**: $62.500\%$

> [!WARNING]
> Tỷ lệ Legendary lên tới **30.6%** ở mốc bảo hiểm là quá cao, khiến vật phẩm Legendary mất đi giá trị và làm người chơi nhanh chóng hết mục tiêu để sưu tầm.

### Thiết kế mới (Mốc 100%)
Chúng ta định nghĩa lại phân phối xác suất trên thang điểm **100%** chuẩn. Người chơi vẫn chắc chắn nhận được vật phẩm từ **Epic trở lên**, nhưng tỷ lệ rơi đồ Legendary/Mythic/Divine được kiểm soát hợp lý:

| Độ hiếm (Rarity) | Tỷ lệ cũ (Pity) | Tỷ lệ mới đề xuất (Pity) | Ghi chú |
| :--- | :---: | :---: | :--- |
| **Divine** | $0.625\%$ | **0.5%** | Tăng gấp 5 lần tỷ lệ quay thường ($0.1\%$) để tạo hứng thú. |
| **Mythic** | $6.25\%$ | **2.5%** | Tăng gấp 2.5 lần tỷ lệ quay thường ($1.0\%$). |
| **Legendary** | $30.63\%$ | **12.0%** | Giảm đáng kể để tránh lạm phát đồ Huyền thoại. |
| **Epic** | $62.50\%$ | **85.0%** | Chiếm đa số, đóng vai trò mốc đảm bảo. |

### Logic phân vùng xác suất (Code Draft)
```typescript
if (currentPity >= 49) {
  const pityRoll = Math.random() * 100;
  if (pityRoll < 0.5) rarity = "divine";          // [0.0 - 0.5)  -> 0.5%
  else if (pityRoll < 3.0) rarity = "mythic";     // [0.5 - 3.0)  -> 2.5%
  else if (pityRoll < 15.0) rarity = "legendary"; // [3.0 - 15.0) -> 12%
  else rarity = "epic";                            // [15.0 - 100) -> 85%
}
```

---

## 2. Cơ Chế Trọng Số Phân Lớp (Hybrid Weight System)

Để giải quyết vấn đề các vật phẩm có giá trị cao (`theme`, `outfit`) xuất hiện quá nhiều do tỷ lệ chọn ngẫu nhiên đều trong cùng một độ hiếm, chúng ta kết hợp hai phương án trọng số:

```
                  ┌──────────────────────────────────────────────┐
                  │          Vật phẩm trong Gacha Pool           │
                  └──────────────────────┬───────────────────────┘
                                         │
                        Có định nghĩa trường "weight"
                           trong file JSON không?
                                         │
                    ┌────────────────────┴────────────────────┐
                   YES                                       NO
                    │                                         │
     ┌──────────────▼──────────────┐           ┌──────────────▼──────────────┐
     │ Dùng trọng số cấu hình từ   │           │ Dùng trọng số mặc định theo  │
     │ JSON (Ghi đè hoàn toàn)     │           │ Loại vật phẩm (Type)        │
     └─────────────────────────────┘           └──────────────┬──────────────┘
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            │ theme: 10                         │
                                            │ outfit: 25                        │
                                            │ furniture: 50                     │
                                            │ voice: 60                         │
                                            │ meme: 80                          │
                                            │ sticker: 100                      │
                                            └───────────────────────────────────┘
```

### Lớp 1: Trọng số mặc định theo Loại vật phẩm (Default Type Weights)
Khi vật phẩm không có cấu hình trọng số riêng biệt trong file JSON, hệ thống sẽ sử dụng bảng trọng số mặc định dựa trên loại (type) của nó:

| Loại vật phẩm (Type) | Trọng số (Weight) | Độ xuất hiện tương đối |
| :--- | :---: | :--- |
| **theme** | **10** | Cực kỳ hiếm trong cùng độ hiếm |
| **outfit** | **25** | Rất hiếm |
| **furniture** | **50** | Hiếm trung bình |
| **voice** | **60** | Trung bình |
| **meme** | **80** | Dễ xuất hiện |
| **sticker** | **100** | Phổ biến nhất |

### Lớp 2: Ghi đè trọng số tùy chọn trong JSON (Explicit Override)
Khi cần điều chỉnh tỷ lệ cho một món cụ thể (ví dụ: tạo sự kiện tăng tỷ lệ rơi - Rate-up, hoặc làm một món sticker cụ thể trở nên siêu hiếm), bạn chỉ cần khai báo trường `"weight"` vào đối tượng trong `gacha_pool.json`:

```json
  {
    "id": "thm_divine_shiba",
    "type": "theme",
    "name": "Thần Khuyển Tôn Cực",
    "rarity": "divine",
    "weight": 200  // Ghi đè từ 10 thành 200 (Biến món theme này thành siêu dễ xuất hiện)
  }
```

---

## 3. Thuật Toán Lựa Chọn Trọng Số (Weighted Selection)

Sau khi hệ thống quay trúng một `rarity` (ví dụ: `legendary`), quá trình chọn vật phẩm diễn ra theo thuật toán sau:

1. Lọc tất cả các vật phẩm thuộc độ hiếm đó:
   $$\mathbf{S} = \{ x \in \text{GACHA\_POOL} \mid x.\text{rarity} == \text{rarity} \}$$
2. Tính trọng số $w_i$ của từng vật phẩm $x_i \in \mathbf{S}$:
   $$w_i = \begin{cases} 
      x_i.\text{weight} & \text{nếu có định nghĩa} \\ 
      \text{DEFAULT\_TYPE\_WEIGHTS}[x_i.\text{type}] & \text{nếu không định nghĩa} 
   \end{cases}$$
3. Tính tổng trọng số:
   $$W_{\text{total}} = \sum_{x_i \in \mathbf{S}} w_i$$
4. Sinh số ngẫu nhiên $R$ trong khoảng $[0, W_{\text{total}})$.
5. Duyệt qua danh sách, cộng tích lũy trọng số. Vật phẩm nào làm cho tổng cộng dồn vượt qua $R$ đầu tiên sẽ được chọn làm phần thưởng.

---

## 4. Ví Dụ Tính Toán Thực Tế

### Kịch bản 1: Quay trúng độ hiếm **Legendary** (Mặc định không ghi đè)
Giả sử hệ thống đang có 3 vật phẩm thuộc độ hiếm **Legendary**:
1. `thm_sakura` (Loại `theme`) $\rightarrow$ Trọng số mặc định $w_1 = 10$.
2. `out_samurai` (Loại `outfit`) $\rightarrow$ Trọng số mặc định $w_2 = 25$.
3. `stk_lucky_shiba` (Loại `sticker`) $\rightarrow$ Trọng số mặc định $w_3 = 100$.

* **Tổng trọng số**: $W_{\text{total}} = 10 + 25 + 100 = 135$.
* **Xác suất rơi của từng món**:
  * **Theme Sakura**: $\frac{10}{135} \approx \mathbf{7.4\%}$
  * **Outfit Samurai**: $\frac{25}{135} \approx \mathbf{18.5\%}$
  * **Sticker Shiba**: $\frac{100}{135} \approx \mathbf{74.1\%}$

> [!NOTE]
> Nhờ hệ thống trọng số phân lớp, bộ Theme và Outfit Legendary sẽ không còn bị rơi tràn lan, tạo cảm giác vô cùng quý giá khi người chơi sở hữu được chúng.

---

### Kịch bản 2: Quay trúng độ hiếm **Legendary** (Có sự kiện Rate-Up ghi đè)
Nhà phát triển muốn làm sự kiện tăng mạnh tỷ lệ ra trang phục **Samurai** gấp 8 lần, đồng thời tạo ra một chiếc sticker may mắn siêu giới hạn bằng cách ghi đè trong `gacha_pool.json`:
1. `thm_sakura` (Loại `theme`) $\rightarrow$ Trọng số mặc định $w_1 = 10$.
2. `out_samurai` (Loại `outfit`, ghi đè `"weight": 200`) $\rightarrow w_2 = 200$.
3. `stk_lucky_shiba` (Loại `sticker`, ghi đè `"weight": 10`) $\rightarrow w_3 = 10$.

* **Tổng trọng số mới**: $W_{\text{total}} = 10 + 200 + 10 = 220$.
* **Xác suất rơi mới**:
  * **Theme Sakura**: $\frac{10}{220} \approx \mathbf{4.5\%}$
  * **Outfit Samurai (Rate-Up)**: $\frac{200}{220} \approx \mathbf{90.9\%}$ (Cực kỳ dễ ra trong đợt sự kiện)
  * **Sticker Shiba (Giới hạn)**: $\frac{10}{220} \approx \mathbf{4.5\%}$ (Trở nên siêu hiếm)

---

## 5. Bản Nháp Code Triển Khai (`useGachaShop.ts`)

Dưới đây là phần code logic cốt lõi sẽ được cập nhật vào hàm `rollGacha`:

```typescript
const DEFAULT_TYPE_WEIGHTS: Record<string, number> = {
  theme: 10,
  outfit: 25,
  furniture: 50,
  voice: 60,
  meme: 80,
  sticker: 100,
};

const getItemWeight = (item: any) => {
  if (item.weight !== undefined) return item.weight;
  return DEFAULT_TYPE_WEIGHTS[item.type] ?? 100;
};

// ... Trong hàm rollGacha ...
const rollGacha = (currentPity: number, luckyRollsLeft: number) => {
  let rarity: GachaRarity = "common";
  const randRarity = Math.random() * 100;
  const hasLuckyTalisman = luckyRollsLeft > 0;

  // 1. Áp dụng bảng bảo hiểm cân bằng mới
  if (currentPity >= 49) {
    const pityRoll = Math.random() * 100;
    if (pityRoll < 0.5) rarity = "divine";
    else if (pityRoll < 3.0) rarity = "mythic";
    else if (pityRoll < 15.0) rarity = "legendary";
    else rarity = "epic";
  } else {
    // ... logic chọn rarity thường ...
  }

  // 2. Thuật toán chọn vật phẩm theo trọng số phân lớp
  const itemsInRarity = GACHA_POOL.filter(i => i.rarity === rarity);
  let selectedItem = itemsInRarity[0];
  
  if (itemsInRarity.length > 0) {
    const totalWeight = itemsInRarity.reduce((sum, item) => sum + getItemWeight(item), 0);
    let rand = Math.random() * totalWeight;
    for (const item of itemsInRarity) {
      const w = getItemWeight(item);
      if (rand < w) {
        selectedItem = item;
        break;
      }
      rand -= w;
    }
  }

  // ... logic xác định full item và hoàn trả Shiba Coin ...
  return { selectedItem, isFullItem, duplicateFur, rarity };
};
```
