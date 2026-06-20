"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { GACHA_POOL } from "@/constants/gachaPool";
import { EXCLUSIVE_GOODS, CONSUMABLE_BUFFS } from "@/constants/shopItems";

const ADMIN_EMAILS = ["admin@example.com", "admin@shibatown.com"];

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
    sticker: 100,
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const isDev = process.env.NODE_ENV === "development";

  // Authentication check on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast.error("Vui lòng đăng nhập tài khoản Admin!");
        router.push("/");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "user_stats", currentUser.uid));
        const data = snap.data();
        const role = data?.role || "user";

        const isDevEnv = process.env.NODE_ENV === "development";
        const isEmailAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email);
        const isRoleAdmin = role === "admin";

        if (isDevEnv || isEmailAdmin || isRoleAdmin) {
          setIsAdmin(true);
          setAuthChecking(false);
        } else {
          toast.error("Bạn không có quyền truy cập trang quản trị!");
          router.push("/");
        }
      } catch (err) {
        console.error("Lỗi xác thực quyền admin:", err);
        toast.error("Lỗi xác thực quyền hạn!");
        router.push("/");
      }
    });

    return () => unsub();
  }, [router, setUser]);

  // Load configuration on mount
  useEffect(() => {
    if (isAdmin) {
      loadSystemDecks();
      loadUsersStats();
      loadGachaAndShop();
      loadDailyQuests();
      loadSystemSettings();
      loadTypeWeights();
    }
  }, [isAdmin]);

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
      const gachaRes = await fetch("/api/admin/save-json?filePath=public/data/configs/gacha_pool.json");
      if (gachaRes.ok) {
        const data = await gachaRes.json();
        setGachaPool(data);
      } else {
        setGachaPool(GACHA_POOL);
      }

      const shopRes = await fetch("/api/admin/save-json?filePath=public/data/configs/shop_items.json");
      if (shopRes.ok) {
        const data = await shopRes.json();
        setShopExclusives(data.EXCLUSIVE_GOODS || []);
        setShopConsumables(data.CONSUMABLE_BUFFS || []);
      } else {
        setShopExclusives(EXCLUSIVE_GOODS);
        setShopConsumables(CONSUMABLE_BUFFS);
      }
    } catch (e) {
      console.error("Lỗi tải gacha/shop:", e);
      setGachaPool(GACHA_POOL);
      setShopExclusives(EXCLUSIVE_GOODS);
      setShopConsumables(CONSUMABLE_BUFFS);
    }
  };

  const loadDailyQuests = async () => {
    try {
      const res = await fetch("/api/admin/save-json?filePath=public/data/configs/daily_quests.json");
      if (res.ok) {
        const data = await res.json();
        setDailyQuests(data);
      }
    } catch (e) {
      console.error("Lỗi tải nhiệm vụ:", e);
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
      const res = await fetch("/api/admin/save-json?filePath=public/data/configs/gacha_type_weights.json");
      if (res.ok) {
        const data = await res.json();
        setTypeWeights(data);
      }
    } catch (e) {
      console.error("Lỗi tải Type Weights:", e);
    }
  };

  const handleSaveTypeWeights = async (updatedWeights: Record<string, number>) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/gacha_type_weights.json", data: updatedWeights })
      });
      if (!res.ok) throw new Error("Lưu Type Weights thất bại");
      setTypeWeights(updatedWeights);
      toast.success("Đã lưu Type Weights thành công! ⚖️");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu Type Weights");
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
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/gacha_pool.json", data: updatedPool })
      });
      if (!res.ok) throw new Error("Lưu Gacha Pool thất bại");
      toast.success("Đã lưu Gacha Pool thành công! 🎟️");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu Gacha Pool");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGachaItem = () => {
    setSelectedGachaItem({
      id: `gacha_${Date.now()}`,
      type: "outfit",
      name: "",
      description: "",
      rarity: "common",
      imageUrl: "",
      shardTarget: 2,
      japanesePoint: { word: "", meaning: "", grammarNote: "" },
      audioUrl: "",
      bonesPerHour: 0,
      hpBonus: 0,
      atkBonus: 0,
      defBonus: 0,
      critBonus: 0,
      rpgSlot: "head"
    });
    setIsGachaModalOpen(true);
  };

  const handleEditGachaItem = (item: any) => {
    setSelectedGachaItem({
      ...item,
      japanesePoint: item.japanesePoint || { word: "", meaning: "", grammarNote: "" }
    });
    setIsGachaModalOpen(true);
  };

  const handleSaveGachaItem = async (updatedItem: any) => {
    if (!updatedItem.id || !updatedItem.name) {
      toast.error("Vui lòng điền đầy đủ ID và Tên vật phẩm!");
      return;
    }

    const exists = gachaPool.some(i => i.id === updatedItem.id);
    let newPool = [];
    if (exists) {
      newPool = gachaPool.map(i => i.id === updatedItem.id ? updatedItem : i);
    } else {
      newPool = [...gachaPool, updatedItem];
    }
    setGachaPool(newPool);
    setIsGachaModalOpen(false);
    await handleSaveGachaPool(newPool);
  };

  const handleDeleteGachaItem = async (itemId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vật phẩm này khỏi Gacha Pool?")) return;
    const newPool = gachaPool.filter(i => i.id !== itemId);
    setGachaPool(newPool);
    await handleSaveGachaPool(newPool);
  };

  // Shop items functions
  const handleSaveShopItems = async (updatedExclusives = shopExclusives, updatedConsumables = shopConsumables) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: "public/data/configs/shop_items.json",
          data: {
            EXCLUSIVE_GOODS: updatedExclusives,
            CONSUMABLE_BUFFS: updatedConsumables
          }
        })
      });
      if (!res.ok) throw new Error("Lưu Shop Items thất bại");
      toast.success("Đã lưu Cửa hàng thành công! 🛒");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu Cửa hàng");
    } finally {
      setIsLoading(false);
    }
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
      effects: ""
    });
    setIsShopModalOpen(true);
  };

  const handleEditShopItem = (item: any, type: "exclusive" | "consumable") => {
    setShopItemType(type);
    setSelectedShopItem({ ...item });
    setIsShopModalOpen(true);
  };

  const handleSaveShopItem = async (updatedItem: any) => {
    if (!updatedItem.id || !updatedItem.name) {
      toast.error("Vui lòng điền đầy đủ ID và Tên vật phẩm cửa hàng!");
      return;
    }

    let newExclusives = [...shopExclusives];
    let newConsumables = [...shopConsumables];

    if (shopItemType === "exclusive") {
      const exists = shopExclusives.some(i => i.id === updatedItem.id);
      if (exists) {
        newExclusives = shopExclusives.map(i => i.id === updatedItem.id ? updatedItem : i);
      } else {
        newExclusives = [...shopExclusives, updatedItem];
      }
      setShopExclusives(newExclusives);
    } else {
      const exists = shopConsumables.some(i => i.id === updatedItem.id);
      if (exists) {
        newConsumables = shopConsumables.map(i => i.id === updatedItem.id ? updatedItem : i);
      } else {
        newConsumables = [...shopConsumables, updatedItem];
      }
      setShopConsumables(newConsumables);
    }

    setIsShopModalOpen(false);
    await handleSaveShopItems(newExclusives, newConsumables);
  };

  const handleDeleteShopItem = async (itemId: string, type: "exclusive" | "consumable") => {
    if (!confirm("Bạn có chắc chắn muốn xóa vật phẩm này khỏi Cửa hàng?")) return;
    let newExclusives = [...shopExclusives];
    let newConsumables = [...shopConsumables];

    if (type === "exclusive") {
      newExclusives = shopExclusives.filter(i => i.id !== itemId);
      setShopExclusives(newExclusives);
    } else {
      newConsumables = shopConsumables.filter(i => i.id !== itemId);
      setShopConsumables(newConsumables);
    }

    await handleSaveShopItems(newExclusives, newConsumables);
  };

  // Quests functions
  const handleSaveQuests = async (updatedQuests = dailyQuests) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/daily_quests.json", data: updatedQuests })
      });
      if (!res.ok) throw new Error("Lưu Nhiệm vụ thất bại");
      toast.success("Đã lưu Nhiệm vụ hàng ngày thành công! 📅");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu Nhiệm vụ");
    } finally {
      setIsLoading(false);
    }
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

    const exists = dailyQuests.some(q => q.id === updatedQuest.id);
    let newQuests = [];
    if (exists) {
      newQuests = dailyQuests.map(q => q.id === updatedQuest.id ? updatedQuest : q);
    } else {
      newQuests = [...dailyQuests, updatedQuest];
    }
    setDailyQuests(newQuests);
    setIsQuestModalOpen(false);
    await handleSaveQuests(newQuests);
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) return;
    const newQuests = dailyQuests.filter(q => q.id !== questId);
    setDailyQuests(newQuests);
    await handleSaveQuests(newQuests);
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

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      toast.error("Đăng nhập thất bại");
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
    isAdmin, setIsAdmin,
    authChecking, setAuthChecking,
    isDev,
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
    handleLogin
  };
}
