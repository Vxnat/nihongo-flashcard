export interface ShopItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  type: "furniture" | "voice" | "outfit" | "consumable";
  lore?: string;
  effects?: string;
}

export const SHARD_PRICES: Record<string, number> = {
  epic: 10,
  legendary: 30,
  mythic: 100,
  divine: 300,
};

export const EXCLUSIVE_GOODS: ShopItem[] = [
  {
    id: "fur_fuji_paint",
    name: "Tranh Cổ Phú Sĩ",
    description: "Nội thất tranh treo tường độc quyền.",
    imageUrl: "/images/decorations/decoration_fuji.png",
    cost: 150,
    type: "furniture",
    lore: "Tương truyền bức tranh này vẽ bởi một đại sư hội họa Nhật Bản cổ xưa, lưu trữ khí chất ngàn năm của ngọn núi thiêng Phú Sĩ.",
    effects: "Tăng hiệu suất: +4 Xương/giờ khi lắp đặt."
  },
  {
    id: "out_samurai_helmet",
    name: "Mũ Samurai",
    description: "Trang phục chiến binh oai dũng cho Shiba.",
    imageUrl: "/images/outfits/out_samurai.png",
    cost: 200,
    type: "outfit",
    lore: "Mũ giáp của một Samurai huyền thoại vùng Edo, mang lại vẻ ngoài dũng mãnh và bảo vệ tuyệt đối.",
    effects: "RPG Stats: +20 Phòng thủ, +5 Sức tấn công khi trang bị."
  },
  {
    id: "voc_tsundere",
    name: "Giọng Seiyuu Kiêu Kỳ",
    description: "Đồng hành giọng nói Tsundere ngọt ngào.",
    imageUrl: "/images/voices/voc_tsundere.png",
    cost: 300,
    type: "voice",
    lore: "Gói lồng tiếng đặc biệt từ một Seiyuu nổi tiếng với chất giọng 'kiêu kỳ' - mắng mỏ nhưng lại vô cùng quan tâm bạn học tập.",
    effects: "Mở khóa gói giọng nói Tsundere phát khi lật thẻ đúng."
  }
];

export const CONSUMABLE_BUFFS: ShopItem[] = [
  {
    id: "buff_double_bones",
    name: "Bùa Thu Hoạch",
    description: "Bùa chú cổ xưa giúp x2 xương thu hoạch.",
    imageUrl: "/images/shop/buff_double_bones.svg",
    cost: 50,
    type: "consumable",
    lore: "Một tấm bùa đỏ chói được viết bằng nét mực linh thiêng, thu hút tinh khí đất trời giúp nhân đôi lượng xương Shiba Room.",
    effects: "Nhân đôi toàn bộ lượng xương thu hoạch được trong vòng 24 giờ."
  },
  {
    id: "buff_lucky_gacha",
    name: "Bùa Gacha May Mắn",
    description: "Bùa cầu may từ đền thờ thần khuyển.",
    imageUrl: "/images/shop/buff_lucky_gacha.svg",
    cost: 80,
    type: "consumable",
    lore: "Bùa may mắn màu vàng kim rực rỡ, giúp gia tăng nhân phẩm rõ rệt khi quay trứng.",
    effects: "Tăng thêm +5% tỷ lệ ra đồ từ Legendary trở lên trong 5 lượt quay tiếp theo."
  }
];
