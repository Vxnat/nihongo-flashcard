"use client";

import { useState, useCallback } from "react";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface UseAdminItemsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook quản lý các vật phẩm (Items) trong hệ thống bao gồm Gacha Pool và Cửa hàng (Shop).
 * Hỗ trợ các chức năng tải danh sách, thêm/sửa/xóa vật phẩm và chỉnh sửa tỷ lệ weights rơi Gacha.
 */
export function useAdminItems({ setIsLoading }: UseAdminItemsProps) {
  // Gacha Pool states
  const [gachaPool, setGachaPool] = useState<any[]>([]);
  const [selectedGachaItem, setSelectedGachaItem] = useState<any | null>(null);
  const [isGachaModalOpen, setIsGachaModalOpen] = useState(false);

  // Shop states
  const [shopExclusives, setShopExclusives] = useState<any[]>([]);
  const [shopConsumables, setShopConsumables] = useState<any[]>([]);
  const [selectedShopItem, setSelectedShopItem] = useState<any | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [shopItemType, setShopItemType] = useState<"exclusive" | "consumable">("exclusive");

  // Type Weights state (Trọng số tỉ lệ rơi của từng thể loại vật phẩm)
  const [typeWeights, setTypeWeights] = useState<Record<string, number>>({
    theme: 10,
    outfit: 25,
    furniture: 50,
    voice: 60,
    meme: 80,
    accessory: 100,
    costume: 20,
  });

  const [gachaRarityFilter, setGachaRarityFilter] = useState<string>("all");
  const [gachaTypeFilter, setGachaTypeFilter] = useState<string>("all");
  const [gachaSearch, setGachaSearch] = useState<string>("");

  /**
   * Tải toàn bộ danh sách vật phẩm từ Firestore và phân loại
   */
  const loadGachaAndShop = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "system_items"));
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      setGachaPool(items.filter((i) => i.isGacha));
      setShopExclusives(items.filter((i) => i.isShop && i.type !== "consumable"));
      setShopConsumables(items.filter((i) => i.isShop && i.type === "consumable"));
    } catch (e) {
      console.error("Lỗi tải gacha/shop từ Firestore:", e);
      toast.error("Không thể tải danh sách vật phẩm từ Firestore");
    }
  }, []);

  /**
   * Tải cấu hình trọng số tỉ lệ rơi Gacha từ Firestore
   */
  const loadTypeWeights = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, "system_config", "gacha_type_weights"));
      if (snap.exists()) {
        setTypeWeights(snap.data() as Record<string, number>);
      }
    } catch (e) {
      console.error("Lỗi tải Type Weights từ Firestore:", e);
    }
  }, []);

  /**
   * Lưu cấu hình trọng số tỉ lệ rơi Gacha
   */
  const handleSaveTypeWeights = useCallback(async (updatedWeights: Record<string, number>) => {
    setIsLoading(true);
    try {
      await setDoc(doc(db, "system_config", "gacha_type_weights"), updatedWeights);
      setTypeWeights(updatedWeights);
      toast.success("Đã lưu Type Weights lên Firestore thành công! ⚖️");
    } catch (err: any) {
      toast.error("Lỗi lưu Type Weights: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  // --- Gacha Item CRUD ---

  const handleCreateGachaItem = useCallback(() => {
    setSelectedGachaItem({
      id: `item_${Date.now()}`,
      type: "outfit",
      name: "",
      description: "",
      rarity: "common",
      imageUrl: "",
      avatarUrl: "",
      booster: "",
      animation: "none",
      shardTarget: 2,
      japanesePoint: { word: "", meaning: "", grammarNote: "" },
      audioUrl: "",
      bonesPerHour: 0,
      hpBonus: 0,
      atkBonus: 0,
      defBonus: 0,
      critBonus: 0,
      rpgSlot: "head",
      isGacha: true,
      isShop: false,
      cost: 50
    });
    setIsGachaModalOpen(true);
  }, []);

  const handleEditGachaItem = useCallback((item: any) => {
    setSelectedGachaItem({
      ...item,
      japanesePoint: item.japanesePoint || { word: "", meaning: "", grammarNote: "" },
      avatarUrl: item.avatarUrl || "",
      booster: item.booster || "",
      animation: item.animation || "none",
      rpgSlot: item.rpgSlot || "head",
      isGacha: item.isGacha === undefined ? true : item.isGacha,
      isShop: !!item.isShop,
      cost: item.cost === undefined ? 50 : item.cost
    });
    setIsGachaModalOpen(true);
  }, []);

  const handleSaveGachaItem = useCallback(async (updatedItem: any) => {
    if (!updatedItem.id || !updatedItem.name) {
      toast.error("Vui lòng điền đầy đủ ID và Tên vật phẩm!");
      return;
    }

    const cleanItem = { ...updatedItem };
    if (cleanItem.type === "outfit" || cleanItem.type === "accessory") {
      delete cleanItem.animation;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, "system_items", cleanItem.id), cleanItem);

      setGachaPool(prev => {
        if (!cleanItem.isGacha) return prev.filter(i => i.id !== cleanItem.id);
        const exists = prev.some(i => i.id === cleanItem.id);
        return exists ? prev.map(i => i.id === cleanItem.id ? cleanItem : i) : [...prev, cleanItem];
      });

      setShopExclusives(prev => {
        if (!cleanItem.isShop || cleanItem.type === "consumable") return prev.filter(i => i.id !== cleanItem.id);
        const exists = prev.some(i => i.id === cleanItem.id);
        return exists ? prev.map(i => i.id === cleanItem.id ? cleanItem : i) : [...prev, cleanItem];
      });

      setShopConsumables(prev => {
        if (!cleanItem.isShop || cleanItem.type !== "consumable") return prev.filter(i => i.id !== cleanItem.id);
        const exists = prev.some(i => i.id === cleanItem.id);
        return exists ? prev.map(i => i.id === cleanItem.id ? cleanItem : i) : [...prev, cleanItem];
      });

      setIsGachaModalOpen(false);
      toast.success("Đã lưu vật phẩm lên Firestore! 🎟️");
    } catch (err: any) {
      toast.error("Lỗi khi lưu vật phẩm: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const handleDeleteGachaItem = useCallback(async (itemId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vật phẩm này khỏi Firestore?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "system_items", itemId));
      setGachaPool(prev => prev.filter(i => i.id !== itemId));
      setShopExclusives(prev => prev.filter(i => i.id !== itemId));
      setShopConsumables(prev => prev.filter(i => i.id !== itemId));
      toast.success("Đã xóa vật phẩm khỏi Firestore!");
    } catch (err: any) {
      toast.error("Lỗi khi xóa vật phẩm: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  // --- Shop Item CRUD ---

  const handleCreateShopItem = useCallback((type: "exclusive" | "consumable") => {
    setShopItemType(type);
    setSelectedShopItem({
      id: `${type}_${Date.now()}`,
      name: "",
      description: "",
      imageUrl: "",
      cost: 50,
      type: type === "exclusive" ? "furniture" : "consumable",
      lore: "",
      avatarUrl: "",
      rpgSlot: "head",
      animation: "none",
      audioUrl: "",
      isGacha: false,
      isShop: true
    });
    setIsShopModalOpen(true);
  }, []);

  const handleEditShopItem = useCallback((item: any, type: "exclusive" | "consumable") => {
    setShopItemType(type);
    setSelectedShopItem({
      ...item,
      avatarUrl: item.avatarUrl || "",
      booster: item.booster || "",
      rpgSlot: item.rpgSlot || "head",
      animation: item.animation || "none",
      audioUrl: item.audioUrl || "",
      isGacha: !!item.isGacha,
      isShop: item.isShop === undefined ? true : item.isShop
    });
    setIsShopModalOpen(true);
  }, []);

  const handleSaveShopItem = useCallback(async (updatedItem: any) => {
    if (!updatedItem.id || !updatedItem.name) {
      toast.error("Vui lòng điền đầy đủ ID và Tên vật phẩm cửa hàng!");
      return;
    }

    const cleanItem = { ...updatedItem };
    if (cleanItem.type === "outfit" || cleanItem.type === "accessory") {
      delete cleanItem.animation;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, "system_items", cleanItem.id), cleanItem);

      setGachaPool(prev => {
        if (!cleanItem.isGacha) return prev.filter(i => i.id !== cleanItem.id);
        const exists = prev.some(i => i.id === cleanItem.id);
        return exists ? prev.map(i => i.id === cleanItem.id ? cleanItem : i) : [...prev, cleanItem];
      });

      setShopExclusives(prev => {
        if (!cleanItem.isShop || cleanItem.type === "consumable") return prev.filter(i => i.id !== cleanItem.id);
        const exists = prev.some(i => i.id === cleanItem.id);
        return exists ? prev.map(i => i.id === cleanItem.id ? cleanItem : i) : [...prev, cleanItem];
      });

      setShopConsumables(prev => {
        if (!cleanItem.isShop || cleanItem.type !== "consumable") return prev.filter(i => i.id !== cleanItem.id);
        const exists = prev.some(i => i.id === cleanItem.id);
        return exists ? prev.map(i => i.id === cleanItem.id ? cleanItem : i) : [...prev, cleanItem];
      });

      setIsShopModalOpen(false);
      toast.success("Đã lưu vật phẩm cửa hàng lên Firestore! 🛒");
    } catch (err: any) {
      toast.error("Lỗi khi lưu vật phẩm: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const handleDeleteShopItem = useCallback(async (itemId: string, type: "exclusive" | "consumable") => {
    if (!confirm("Bạn có chắc chắn muốn xóa vật phẩm này khỏi Firestore?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "system_items", itemId));
      setGachaPool(prev => prev.filter(i => i.id !== itemId));
      setShopExclusives(prev => prev.filter(i => i.id !== itemId));
      setShopConsumables(prev => prev.filter(i => i.id !== itemId));
      toast.success("Đã xóa vật phẩm khỏi Firestore!");
    } catch (err: any) {
      toast.error("Lỗi khi xóa vật phẩm: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  // Derived filtered lists
  const filteredGachaPool = gachaPool.filter(item => {
    if (gachaRarityFilter !== "all" && item.rarity !== gachaRarityFilter) return false;
    if (gachaTypeFilter !== "all" && item.type !== gachaTypeFilter) return false;
    if (gachaSearch) {
      const searchLower = gachaSearch.toLowerCase();
      const matchName = item.name && item.name.toLowerCase().includes(searchLower);
      const matchId = item.id && item.id.toLowerCase().includes(searchLower);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  const filteredShopExclusives = shopExclusives.filter(item => {
    if (gachaSearch) {
      const searchLower = gachaSearch.toLowerCase();
      const matchName = item.name && item.name.toLowerCase().includes(searchLower);
      const matchId = item.id && item.id.toLowerCase().includes(searchLower);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  const filteredShopConsumables = shopConsumables.filter(item => {
    if (gachaSearch) {
      const searchLower = gachaSearch.toLowerCase();
      const matchName = item.name && item.name.toLowerCase().includes(searchLower);
      const matchId = item.id && item.id.toLowerCase().includes(searchLower);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  return {
    gachaPool,
    setGachaPool,
    selectedGachaItem,
    setSelectedGachaItem,
    isGachaModalOpen,
    setIsGachaModalOpen,
    shopExclusives,
    setShopExclusives,
    shopConsumables,
    setShopConsumables,
    selectedShopItem,
    setSelectedShopItem,
    isShopModalOpen,
    setIsShopModalOpen,
    shopItemType,
    setShopItemType,
    typeWeights,
    setTypeWeights,
    gachaRarityFilter,
    setGachaRarityFilter,
    gachaTypeFilter,
    setGachaTypeFilter,
    gachaSearch,
    setGachaSearch,
    filteredGachaPool,
    filteredShopExclusives,
    filteredShopConsumables,
    loadGachaAndShop,
    loadTypeWeights,
    handleSaveTypeWeights,
    handleCreateGachaItem,
    handleEditGachaItem,
    handleSaveGachaItem,
    handleDeleteGachaItem,
    handleCreateShopItem,
    handleEditShopItem,
    handleSaveShopItem,
    handleDeleteShopItem
  };
}
