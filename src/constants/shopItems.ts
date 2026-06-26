export interface ShopItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  type: "furniture" | "voice" | "outfit" | "consumable" | "costume";
  avatarUrl?: string;
}

export const SHARD_PRICES: Record<string, number> = {
  epic: 10,
  legendary: 30,
  mythic: 100,
  divine: 300,
};
