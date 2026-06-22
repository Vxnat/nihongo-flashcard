"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export interface SystemDeck {
  id: string;
  title: string;
  level: string;
  chapter: number;
  order: number;
  prerequisite: string | null;
  rewardCoins: number;
  totalCards?: number;
  description?: string;
  type?: string;
  targetDeckIds?: string[];
}

export interface CardData {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  pos?: string;
  notes?: string;
  example_jp?: string;
  example_jp_formatted?: string;
  example_vi?: string;
  tags?: string[];
  synonyms?: string[];
  antonyms?: string[];
}

export function useAdmin() {
  const router = useRouter();
  const user = useAppStore((state: any) => state.user);
  const setUser = useAppStore((state: any) => state.setUser);
  const loginWithGoogle = useAppStore((state: any) => state.loginWithGoogle);

  const [activeTab, setActiveTab] = useState<"decks" | "gacha_shop" | "quests" | "users" | "settings">("decks");
  const [decks, setDecks] = useState<SystemDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<SystemDeck | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [cardSearch, setCardSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Importer states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importDelimiter, setImportDelimiter] = useState<"tab" | "comma">("tab");

  // User manager states
  const [usersStatsList, setUsersStatsList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Gacha Pool states
  const [gachaPool, setGachaPool] = useState<any[]>([]);
  const [selectedGachaItem, setSelectedGachaItem] = useState<any | null>(null);
  const [isGachaModalOpen, setIsGachaModalOpen] = useState(false);

  // Shop state
  const [shopExclusives, setShopExclusives] = useState<any[]>([]);
  const [shopConsumables, setShopConsumables] = useState<any[]>([]);
  const [selectedShopItem, setSelectedShopItem] = useState<any | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [shopItemType, setShopItemType] = useState<"exclusive" | "consumable">("exclusive");

  // Quests state
  const [dailyQuests, setDailyQuests] = useState<any[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);

  // Type Weights state
  const [typeWeights, setTypeWeights] = useState<Record<string, number>>({
    theme: 10,
    outfit: 25,
    furniture: 50,
    voice: 60,
    meme: 80,
    accessory: 100,
    costume: 20,
  });

  // System Settings state
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    announcementBanner: "Chào mừng bạn đến với Shiba Town!"
  });

  // Decks metadata edit state
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<SystemDeck | null>(null);
  const [deckForm, setDeckForm] = useState<Partial<SystemDeck>>({
    id: "",
    title: "",
    level: "N5",
    chapter: 1,
    order: 1,
    prerequisite: "",
    rewardCoins: 10,
    description: "",
    type: "flashcard"
  });

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [gachaRarityFilter, setGachaRarityFilter] = useState<string>("all");
  const [gachaTypeFilter, setGachaTypeFilter] = useState<string>("all");
  const [gachaSearch, setGachaSearch] = useState<string>("");
  const [questSearch, setQuestSearch] = useState<string>("");

  // Load configuration on mount
  useEffect(() => {
    loadSystemDecks();
    loadUsersStats();
    loadGachaAndShop();
    loadDailyQuests();
    loadSystemSettings();
    loadTypeWeights();
  }, []);

  const loadSystemDecks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json?filePath=public/data/configs/system_decks.json");
      if (!res.ok) throw new Error("Không thể tải danh sách bộ thẻ hệ thống");
      const data = await res.json();
      setDecks(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải cấu hình bộ bài");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersStats = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "user_stats"));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsersStatsList(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách user:", err);
    }
  };

  const loadGachaAndShop = async () => {
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
  };

  const loadDailyQuests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "daily_quests"));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDailyQuests(list);
    } catch (e) {
      console.error("Lỗi tải nhiệm vụ từ Firestore:", e);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "system_config", "settings"));
      if (snap.exists()) {
        setSystemSettings(snap.data() as any);
      }
    } catch (err) {
      console.error("Lỗi tải System Settings từ Firestore:", err);
    }
  };

  const loadTypeWeights = async () => {
    try {
      const snap = await getDoc(doc(db, "system_config", "gacha_type_weights"));
      if (snap.exists()) {
        setTypeWeights(snap.data() as Record<string, number>);
      }
    } catch (e) {
      console.error("Lỗi tải Type Weights từ Firestore:", e);
    }
  };

  const handleSaveTypeWeights = async (updatedWeights: Record<string, number>) => {
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
  };

  const handleBackupData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup" })
      });
      if (!res.ok) throw new Error("Sao lưu thất bại");
      const result = await res.json();
      toast.success(result.message || "Đã sao lưu cấu hình thành công! 💾");
    } catch (err: any) {
      toast.error(err.message || "Lỗi sao lưu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewDeck = () => {
    setEditingDeck(null);
    setDeckForm({
      id: `sys_deck_${Date.now()}`,
      title: "",
      level: "N5",
      chapter: 1,
      order: decks.length + 1,
      prerequisite: "",
      rewardCoins: 10,
      description: "",
      type: "flashcard"
    });
    setIsDeckModalOpen(true);
  };

  const handleEditDeckMetadata = (deck: SystemDeck) => {
    setEditingDeck(deck);
    setDeckForm({ ...deck, prerequisite: deck.prerequisite || "" });
    setIsDeckModalOpen(true);
  };

  const handleDeleteDeck = async (deck: SystemDeck) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ bài "${deck.title}" (ID: ${deck.id})?\nHành động này cũng sẽ xóa file dữ liệu từ vựng tương ứng trên đĩa cứng!`)) {
      return;
    }
    setIsLoading(true);
    try {
      const updatedDecks = decks.filter(d => d.id !== deck.id);

      const saveDecksRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/system_decks.json", data: updatedDecks })
      });
      if (!saveDecksRes.ok) throw new Error("Cập nhật file cấu hình tổng thất bại");

      const folder = deck.level.toLowerCase();
      const filePath = `public/data/decks/${folder}/${deck.id}.json`;
      await fetch(`/api/admin/save-json?filePath=${filePath}`, {
        method: "DELETE"
      });

      setDecks(updatedDecks);
      toast.success("Xóa bộ bài thành công! 🗑️");
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa bộ bài");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDeckMetadata = async () => {
    if (!deckForm.id || !deckForm.title || !deckForm.level) {
      toast.error("Vui lòng điền đầy đủ ID, Tiêu đề và Cấp độ!");
      return;
    }

    const cleanId = deckForm.id.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (!cleanId) {
      toast.error("ID không hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      const folder = deckForm.level.toLowerCase();
      const cardsFilePath = `public/data/decks/${folder}/${cleanId}.json`;

      let updatedDecks: SystemDeck[] = [];

      if (editingDeck) {
        if (editingDeck.id !== cleanId || editingDeck.level !== deckForm.level) {
          let oldCards: any[] = [];
          try {
            const oldFolder = editingDeck.level.toLowerCase();
            const oldRes = await fetch(`/api/admin/save-json?filePath=public/data/decks/${oldFolder}/${editingDeck.id}.json`);
            if (oldRes.ok) {
              oldCards = await oldRes.json();
            }
          } catch (e) { }

          await fetch("/api/admin/save-json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: cardsFilePath, data: oldCards })
          });

          const oldFolder = editingDeck.level.toLowerCase();
          await fetch(`/api/admin/save-json?filePath=public/data/decks/${oldFolder}/${editingDeck.id}.json`, {
            method: "DELETE"
          });
        }

        updatedDecks = decks.map(d => d.id === editingDeck.id ? {
          ...d,
          id: cleanId,
          title: deckForm.title!,
          level: deckForm.level!,
          chapter: Number(deckForm.chapter) || 1,
          order: Number(deckForm.order) || 1,
          prerequisite: deckForm.prerequisite || null,
          rewardCoins: Number(deckForm.rewardCoins) || 10,
          description: deckForm.description || "",
          type: deckForm.type || "flashcard"
        } : d);
      } else {
        if (decks.some(d => d.id === cleanId)) {
          throw new Error("ID bộ bài đã tồn tại!");
        }

        await fetch("/api/admin/save-json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: cardsFilePath, data: [] })
        });

        const newDeck: SystemDeck = {
          id: cleanId,
          title: deckForm.title!,
          level: deckForm.level!,
          chapter: Number(deckForm.chapter) || 1,
          order: Number(deckForm.order) || 1,
          prerequisite: deckForm.prerequisite || null,
          rewardCoins: Number(deckForm.rewardCoins) || 10,
          description: deckForm.description || "",
          type: deckForm.type || "flashcard",
          totalCards: 0
        };

        updatedDecks = [...decks, newDeck];
      }

      const saveDecksRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/system_decks.json", data: updatedDecks })
      });
      if (!saveDecksRes.ok) throw new Error("Cập nhật file cấu hình tổng thất bại");

      setDecks(updatedDecks);
      setIsDeckModalOpen(false);
      toast.success(editingDeck ? "Cập nhật bộ bài thành công!" : "Tạo bộ bài mới thành công! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu cấu hình bộ bài");
    } finally {
      setIsLoading(false);
    }
  };

  // Gacha Pool functions
  const handleSaveGachaPool = async (updatedPool = gachaPool) => {
    // Deprecated for per-item Firestore updates
  };

  const handleCreateGachaItem = () => {
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
  };

  const handleEditGachaItem = (item: any) => {
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
  };

  const handleSaveGachaItem = async (updatedItem: any) => {
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
  };

  const handleDeleteGachaItem = async (itemId: string) => {
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
  };

  // Shop items functions
  const handleSaveShopItems = async (updatedExclusives = shopExclusives, updatedConsumables = shopConsumables) => {
    // Deprecated for per-item Firestore updates
  };

  const handleCreateShopItem = (type: "exclusive" | "consumable") => {
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
  };

  const handleEditShopItem = (item: any, type: "exclusive" | "consumable") => {
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
  };

  const handleSaveShopItem = async (updatedItem: any) => {
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
  };

  const handleDeleteShopItem = async (itemId: string, type: "exclusive" | "consumable") => {
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
  };

  // Quests functions
  const handleSaveQuests = async (updatedQuests = dailyQuests) => {
    // Deprecated for per-item Firestore updates
  };

  const handleCreateQuest = () => {
    setSelectedQuest({
      id: `q_new_${Date.now()}`,
      title: "",
      target: 10,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      reward: 1
    });
    setIsQuestModalOpen(true);
  };

  const handleEditQuest = (quest: any) => {
    setSelectedQuest({ ...quest });
    setIsQuestModalOpen(true);
  };

  const handleSaveQuest = async (updatedQuest: any) => {
    if (!updatedQuest.id || !updatedQuest.title) {
      toast.error("Vui lòng điền đầy đủ ID và Tên nhiệm vụ!");
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, "daily_quests", updatedQuest.id), updatedQuest);
      setDailyQuests(prev => {
        const exists = prev.some(q => q.id === updatedQuest.id);
        return exists ? prev.map(q => q.id === updatedQuest.id ? updatedQuest : q) : [...prev, updatedQuest];
      });
      setIsQuestModalOpen(false);
      toast.success("Đã lưu nhiệm vụ lên Firestore! 📅");
    } catch (err: any) {
      toast.error("Lỗi khi lưu nhiệm vụ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "daily_quests", questId));
      setDailyQuests(prev => prev.filter(q => q.id !== questId));
      toast.success("Đã xóa nhiệm vụ khỏi Firestore!");
    } catch (err: any) {
      toast.error("Lỗi khi xóa nhiệm vụ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // System settings function
  const handleUpdateSystemSetting = async (key: string, val: any) => {
    try {
      const newSettings = { ...systemSettings, [key]: val };
      await setDoc(doc(db, "system_config", "settings"), newSettings, { merge: true });
      setSystemSettings(newSettings);
      toast.success(`Đã cập nhật: ${key} = ${val}!`);
    } catch (err) {
      toast.error("Lỗi cập nhật Firestore settings");
    }
  };

  const loadDeckCards = async (deck: SystemDeck) => {
    setIsLoading(true);
    try {
      const folder = deck.level.toLowerCase();
      const res = await fetch(`/api/admin/save-json?filePath=public/data/decks/${folder}/${deck.id}.json`);
      if (!res.ok) throw new Error("Bộ bài này chưa có file dữ liệu riêng hoặc lỗi tải.");
      const data = await res.json();
      setCards(data);
      setSelectedDeck(deck);
      setSelectedCard(null);
    } catch (error: any) {
      toast.error(error.message);
      setCards([]);
      setSelectedDeck(deck);
      setSelectedCard(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDeck = async () => {
    if (!selectedDeck) return;
    setIsLoading(true);
    try {
      const folder = selectedDeck.level.toLowerCase();
      const filePath = `public/data/decks/${folder}/${selectedDeck.id}.json`;

      const saveCardsRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, data: cards })
      });

      if (!saveCardsRes.ok) throw new Error("Ghi tệp danh sách từ vựng thất bại");

      const updatedDecks = decks.map(d =>
        d.id === selectedDeck.id ? { ...d, totalCards: cards.length } : d
      );

      const saveDecksRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/system_decks.json", data: updatedDecks })
      });

      if (!saveDecksRes.ok) throw new Error("Cập nhật file cấu hình tổng thất bại");

      setDecks(updatedDecks);
      toast.success("Đã lưu bộ bài thành công trên đĩa! 💾🎉");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu bộ bài");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardDelete = (cardId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi bộ bài?")) {
      setCards(prev => prev.filter(c => c.id !== cardId));
      if (selectedCard?.id === cardId) {
        setSelectedCard(null);
      }
      toast.success("Đã tạm xóa khỏi danh sách. Hãy nhấn 'LƯU BỘ BÀI' để ghi file!");
    }
  };

  const handleCardSave = (updatedCard: CardData) => {
    setCards(prev => {
      const exists = prev.some(c => c.id === updatedCard.id);
      if (exists) {
        return prev.map(c => c.id === updatedCard.id ? updatedCard : c);
      } else {
        return [...prev, updatedCard];
      }
    });
    setSelectedCard(null);
    toast.success("Đã ghi nhận thay đổi! Hãy nhớ nhấn 'LƯU BỘ BÀI' để lưu vĩnh viễn.");
  };

  const handleAddCard = () => {
    const newId = `${selectedDeck?.id}_${Date.now()}`;
    setSelectedCard({
      id: newId,
      word: "",
      reading: "",
      romaji: "",
      meaning: "",
      pos: "noun",
      notes: "",
      example_jp: "",
      example_jp_formatted: "",
      example_vi: "",
      tags: [],
      synonyms: [],
      antonyms: []
    });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error("Vui lòng dán dữ liệu!");
      return;
    }

    try {
      const lines = importText.split("\n");
      const newCards: CardData[] = [];
      const delimiter = importDelimiter === "tab" ? "\t" : ",";

      lines.forEach((line, index) => {
        if (!line.trim()) return;
        const columns = line.split(delimiter);

        if (columns.length < 3) return;

        const word = columns[0]?.trim();
        const reading = columns[1]?.trim();
        const meaning = columns[2]?.trim();
        const romaji = columns[3]?.trim() || "";
        const pos = columns[4]?.trim() || "noun";
        const notes = columns[5]?.trim() || "";

        if (word && reading && meaning) {
          newCards.push({
            id: `${selectedDeck?.id}_import_${Date.now()}_${index}`,
            word,
            reading,
            romaji,
            meaning,
            pos,
            notes,
            tags: [selectedDeck?.id || "imported"],
            synonyms: [],
            antonyms: []
          });
        }
      });

      if (newCards.length === 0) {
        toast.error("Không tìm thấy dữ liệu hợp lệ! Vui lòng kiểm tra lại định dạng.");
        return;
      }

      setCards(prev => [...prev, ...newCards]);
      setImportText("");
      setIsImportOpen(false);
      toast.success(`Đã thêm tạm thời ${newCards.length} thẻ từ file Excel! Nhớ bấm 'LƯU BỘ BÀI'`);
    } catch (e: any) {
      toast.error("Lỗi phân tích cú pháp dữ liệu: " + e.message);
    }
  };

  const handleUpdateUserStat = async (userId: string, key: string, val: any) => {
    try {
      await setDoc(doc(db, "user_stats", userId), { [key]: val }, { merge: true });
      setUsersStatsList(prev => prev.map(u => u.id === userId ? { ...u, [key]: val } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({ ...prev, [key]: val }));
      }
      toast.success(`Cập nhật thành công ${key} = ${val}!`);
    } catch (err) {
      toast.error("Lỗi cập nhật Firestore");
    }
  };

  const filteredDecks = decks.filter(deck => {
    if (levelFilter !== "all" && deck.level !== levelFilter) {
      return false;
    }
    if (typeFilter !== "all") {
      const isFlashcard = !deck.type || deck.type === "flashcard";
      const isKanji = deck.type === "minigame_kanji";
      const isMinigame = deck.type === "minigame_matching" || deck.type === "minigame_rush";
      const isOther = deck.type === "story" || deck.type === "chest";

      if (typeFilter === "flashcard" && !isFlashcard) return false;
      if (typeFilter === "kanji" && !isKanji) return false;
      if (typeFilter === "minigame" && !isMinigame) return false;
      if (typeFilter === "other" && !isOther) return false;
    }
    return true;
  });

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

  const filteredQuests = dailyQuests.filter(quest => {
    if (questSearch) {
      const searchLower = questSearch.toLowerCase();
      const matchTitle = quest.title && quest.title.toLowerCase().includes(searchLower);
      const matchId = quest.id && quest.id.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchId) return false;
    }
    return true;
  });

  return {
    // States
    activeTab, setActiveTab,
    decks, setDecks,
    selectedDeck, setSelectedDeck,
    cards, setCards,
    cardSearch, setCardSearch,
    selectedCard, setSelectedCard,
    isImportOpen, setIsImportOpen,
    importText, setImportText,
    importDelimiter, setImportDelimiter,
    usersStatsList, setUsersStatsList,
    selectedUser, setSelectedUser,
    searchUserQuery, setSearchUserQuery,
    isLoading, setIsLoading,
    gachaPool, setGachaPool,
    selectedGachaItem, setSelectedGachaItem,
    isGachaModalOpen, setIsGachaModalOpen,
    shopExclusives, setShopExclusives,
    shopConsumables, setShopConsumables,
    selectedShopItem, setSelectedShopItem,
    isShopModalOpen, setIsShopModalOpen,
    shopItemType, setShopItemType,
    dailyQuests, setDailyQuests,
    selectedQuest, setSelectedQuest,
    isQuestModalOpen, setIsQuestModalOpen,
    systemSettings, setSystemSettings,
    typeWeights, setTypeWeights,
    isDeckModalOpen, setIsDeckModalOpen,
    editingDeck, setEditingDeck,
    deckForm, setDeckForm,
    levelFilter, setLevelFilter,
    typeFilter, setTypeFilter,
    gachaRarityFilter, setGachaRarityFilter,
    gachaTypeFilter, setGachaTypeFilter,
    gachaSearch, setGachaSearch,
    questSearch, setQuestSearch,
    user,

    // Derived values
    filteredDecks,
    filteredGachaPool,
    filteredShopExclusives,
    filteredShopConsumables,
    filteredQuests,

    // Methods
    loadSystemDecks,
    loadUsersStats,
    loadGachaAndShop,
    loadDailyQuests,
    loadSystemSettings,
    loadTypeWeights,
    handleSaveTypeWeights,
    handleBackupData,
    handleCreateNewDeck,
    handleEditDeckMetadata,
    handleDeleteDeck,
    handleSaveDeckMetadata,
    handleSaveGachaPool,
    handleCreateGachaItem,
    handleEditGachaItem,
    handleSaveGachaItem,
    handleDeleteGachaItem,
    handleSaveShopItems,
    handleCreateShopItem,
    handleEditShopItem,
    handleSaveShopItem,
    handleDeleteShopItem,
    handleSaveQuests,
    handleCreateQuest,
    handleEditQuest,
    handleSaveQuest,
    handleDeleteQuest,
    handleUpdateSystemSetting,
    loadDeckCards,
    handleSaveDeck,
    handleCardDelete,
    handleCardSave,
    handleAddCard,
    handleImport,
    handleUpdateUserStat,
    loginWithGoogle
  };
}
