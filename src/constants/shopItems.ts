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

import shopItemsJson from "../../public/data/configs/shop_items.json";

export const EXCLUSIVE_GOODS: ShopItem[] = shopItemsJson.EXCLUSIVE_GOODS as ShopItem[];
export const CONSUMABLE_BUFFS: ShopItem[] = shopItemsJson.CONSUMABLE_BUFFS as ShopItem[];
