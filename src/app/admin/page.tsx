"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, Coins, Calendar, Wrench, Search, Plus, Trash2, Edit3,
  Save, X, ArrowLeft, Play, Volume2, Download, Upload, Check, AlertTriangle, ShieldAlert, Settings
} from "lucide-react";
import toast from "react-hot-toast";
import { GACHA_POOL } from "@/constants/gachaPool";
import { EXCLUSIVE_GOODS, CONSUMABLE_BUFFS } from "@/constants/shopItems";

const ADMIN_EMAILS = ["admin@example.com", "admin@shibatown.com"];

interface SystemDeck {
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

interface CardData {
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

export default function AdminPage() {
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

  const router = useRouter();
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
  }, [router]);

  // Load configuration on mount
  useEffect(() => {
    if (isAdmin) {
      loadSystemDecks();
      loadUsersStats();
      loadGachaAndShop();
      loadDailyQuests();
      loadSystemSettings();
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
          } catch (e) {}

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
          title: deckForm.title,
          level: deckForm.level,
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
      // If file doesn't exist, create an empty card list for editing
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

      // Save deck cards
      const saveCardsRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, data: cards })
      });

      if (!saveCardsRes.ok) throw new Error("Ghi tệp danh sách từ vựng thất bại");

      // Update totalCards in system_decks config
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

  // Excel/Google Sheets copy paste importer
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

        // Cần ít nhất Word, Reading, Meaning
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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "var(--font-rounded)" }}>
        <div className="flex flex-col items-center gap-2">
          <img src="/images/mascot/mascot-hi.gif" className="w-16 h-16 animate-bounce" />
          <p className="text-xs font-black text-[#8C6D58] animate-pulse">Đang xác thực quyền Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "var(--font-rounded)" }}>
        <div className="bg-white border-4 border-[#8C6D58] rounded-[2rem] p-8 shadow-xl max-w-md w-full flex flex-col items-center gap-6">
          <ShieldAlert size={64} className="text-red-500 animate-bounce" />
          <h1 className="text-2xl font-black text-[#8C6D58]" style={{ fontFamily: "var(--font-cherry)" }}>
            KHÔNG CÓ QUYỀN TRUY CẬP
          </h1>
          <p className="text-sm text-zinc-550 font-bold">
            Trang web này chỉ dành cho nhà quản lý. Bạn đang được chuyển hướng về trang chủ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6EE] text-zinc-800 flex" style={{ fontFamily: "var(--font-rounded)" }}>
      {/* Sidebar */}
      <div className="w-64 bg-[#8C6D58] text-white flex flex-col p-4 shrink-0 shadow-lg select-none border-r-4 border-[#735642]">
        <div className="flex items-center gap-2 mb-8 mt-2 px-2">
          <span className="text-3xl">🏮</span>
          <div>
            <h1 className="text-base font-black tracking-wider" style={{ fontFamily: "var(--font-cherry)" }}>
              SHIBA ADMIN
            </h1>
            <p className="text-[9px] text-[#FAF6EE]/75 font-bold uppercase tracking-widest">Dashboard v1.0</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab("decks"); setSelectedDeck(null); }}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "decks" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
              }`}
          >
            <Folder size={16} />
            <span>QUẢN LÝ BỘ THẺ DỮ LIỆU</span>
          </button>
          <button
            onClick={() => setActiveTab("gacha_shop")}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "gacha_shop" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
              }`}
          >
            <Coins size={16} />
            <span>GACHA POOL & SHOP</span>
          </button>
          <button
            onClick={() => setActiveTab("quests")}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "quests" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
              }`}
          >
            <Calendar size={16} />
            <span>DAILY QUESTS (TĨNH)</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "users" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
              }`}
          >
            <Wrench size={16} />
            <span>TESTING & CHEAT STATS</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "settings" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
              }`}
          >
            <Settings size={16} />
            <span>CÀI ĐẶT HỆ THỐNG</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-white/20 text-center text-[10px] text-white/50 font-bold">
          {isDev ? (
            <span className="text-emerald-300 font-extrabold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              🛠️ Chế độ Development (Ghi file cục bộ)
            </span>
          ) : (
            <span className="text-amber-300 font-extrabold bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/20">
              🌐 Chế độ Production (Chỉ đọc)
            </span>
          )}
          <p className="mt-4">Đăng nhập: {user?.email}</p>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b-2 border-zinc-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {selectedDeck && (
              <button
                onClick={() => setSelectedDeck(null)}
                className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-base font-black text-zinc-700 uppercase" style={{ fontFamily: "var(--font-cherry)" }}>
              {selectedDeck ? `Chi tiết bộ thẻ: ${selectedDeck.title}` : `Phân hệ ${activeTab}`}
            </h2>
          </div>
          <div>
            <a
              href="/"
              className="text-xs font-black text-[#8C6D58] bg-[#8C6D58]/10 hover:bg-[#8C6D58]/20 px-4 py-2 rounded-xl border border-[#8C6D58]/20 transition-all"
            >
              VỀ TRANG CHỦ SHIBA TOWN
            </a>
          </div>
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <img src="/images/mascot/mascot-hi.gif" className="w-16 h-16 animate-bounce" />
                <p className="text-xs font-black text-[#8C6D58] animate-pulse">Đang cập nhật đĩa cứng...</p>
              </div>
            </div>
          )}

          {/* TAB 1: DECKS MANAGER */}
          {activeTab === "decks" && !selectedDeck && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-zinc-700 text-sm">Danh Sách Các Bộ Bài Học Hệ Thống</h3>
                  <p className="text-xs text-zinc-400 font-bold">Các cấu hình này nằm trong file system_decks.json</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackupData}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={14} /> Sao lưu toàn bộ JSON
                  </button>
                  <button
                    onClick={handleCreateNewDeck}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Tạo bộ bài mới
                  </button>
                  <button
                    onClick={loadSystemDecks}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Tải Lại
                  </button>
                </div>
              </div>

              {/* Bộ lọc bộ bài học hệ thống */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                {/* Bộ lọc Cấp độ */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-black text-zinc-500 min-w-[100px]">Cấp độ:</span>
                  <div className="flex flex-wrap gap-2">
                    {["all", "N5", "N4", "N3", "N2", "N1"].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setLevelFilter(lvl)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                          levelFilter === lvl
                            ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                            : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {lvl === "all" ? "Tất cả" : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bộ lọc Thể loại */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-zinc-100">
                  <span className="text-xs font-black text-zinc-500 min-w-[100px]">Thể loại:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "Tất cả" },
                      { key: "flashcard", label: "Flashcard" },
                      { key: "kanji", label: "Kanji" },
                      { key: "minigame", label: "Minigame" },
                      { key: "other", label: "Cốt truyện & Rương" }
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTypeFilter(t.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                          typeFilter === t.key
                            ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                            : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredDecks.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-zinc-300 p-8 rounded-3xl text-center text-zinc-400 font-bold text-sm">
                  Không tìm thấy bộ thẻ nào phù hợp với bộ lọc! 🐶
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDecks.map(deck => (
                    <div
                      key={deck.id}
                      className="bg-white border-2 border-zinc-200/80 hover:border-[#8C6D58] p-4 rounded-3xl flex flex-col justify-between min-h-[140px] shadow-xs relative transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase bg-[#8C6D58]/10 text-[#8C6D58] px-2 py-0.5 rounded-md">
                            Cấp độ: {deck.level}
                          </span>
                          {deck.type && (
                            <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                              {deck.type}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-zinc-700 mt-2 line-clamp-1">{deck.title}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold mt-1">ID: {deck.id}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                        <span className="text-xs font-black text-zinc-500">
                          {deck.totalCards || 0} thẻ bài
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditDeckMetadata(deck)}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-600 rounded-lg cursor-pointer"
                            title="Sửa thông tin bộ bài"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteDeck(deck)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-lg cursor-pointer"
                            title="Xóa bộ bài"
                          >
                            <Trash2 size={12} />
                          </button>
                          {deck.type && deck.type.startsWith("minigame") ? (
                            <span className="text-[10px] font-bold text-purple-400 italic">Game tự động</span>
                          ) : (
                            <button
                              onClick={() => loadDeckCards(deck)}
                              className="px-3.5 py-1.5 bg-[#8C6D58] hover:bg-[#735642] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer animate-pulse"
                            >
                              Sửa từ vựng
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: CARD LIST DETAILS INSIDE SELECTED DECK */}
          {activeTab === "decks" && selectedDeck && (
            <div className="flex flex-col h-full space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm từ vựng, ý nghĩa..."
                      value={cardSearch}
                      onChange={(e) => setCardSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-400 shrink-0">
                    Hiển thị: {cards.filter(c => c.word.includes(cardSearch) || c.meaning.includes(cardSearch)).length} / {cards.length} thẻ
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={handleAddCard}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Thêm từ mới
                  </button>
                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Nhập từ Excel
                  </button>
                  <button
                    onClick={handleSaveDeck}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={14} /> LƯU BỘ BÀI
                  </button>
                </div>
              </div>

              {/* Cards Table */}
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm flex-1 overflow-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 font-black text-zinc-500 uppercase tracking-wider">
                      <th className="p-4 w-40">Kanji</th>
                      <th className="p-4 w-40">Hiragana</th>
                      <th className="p-4 w-40">Romaji</th>
                      <th className="p-4">Nghĩa tiếng Việt</th>
                      <th className="p-4 w-32 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-bold text-zinc-700">
                    {cards
                      .filter(c =>
                        c.word.toLowerCase().includes(cardSearch.toLowerCase()) ||
                        c.meaning.toLowerCase().includes(cardSearch.toLowerCase()) ||
                        c.reading.toLowerCase().includes(cardSearch.toLowerCase())
                      )
                      .map((card) => (
                        <tr key={card.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-4 font-extrabold text-sm text-zinc-800">{card.word}</td>
                          <td className="p-4 text-zinc-600">{card.reading}</td>
                          <td className="p-4 text-zinc-400 italic">{card.romaji}</td>
                          <td className="p-4 text-zinc-600 truncate max-w-xs">{card.meaning}</td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedCard(card)}
                              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-600 rounded-lg cursor-pointer"
                              title="Sửa từ vựng"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleCardDelete(card.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-lg cursor-pointer"
                              title="Xóa từ vựng"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {cards.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-400 italic">
                          Chưa có thẻ bài nào trong bộ này. Nhấp 'Thêm từ mới' hoặc 'Nhập từ Excel' để bắt đầu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: GACHA & SHOP VIEWER */}
          {activeTab === "gacha_shop" && (
            <div className="space-y-6">
              {/* Bộ lọc Gacha & Cửa hàng */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-zinc-700 text-sm">Tìm kiếm & Bộ lọc Vật phẩm</h3>
                    <p className="text-xs text-zinc-400 font-bold">Tìm và lọc vật phẩm trong Gacha Pool & Cửa hàng</p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, ID..."
                      value={gachaSearch}
                      onChange={(e) => setGachaSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-zinc-400 uppercase">Độ hiếm Gacha:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "all", label: "Tất cả" },
                        { key: "common", label: "Common" },
                        { key: "rare", label: "Rare" },
                        { key: "epic", label: "Epic" },
                        { key: "legendary", label: "Legendary" },
                        { key: "mythic", label: "Mythic" },
                        { key: "divine", label: "Divine" }
                      ].map(r => (
                        <button
                          key={r.key}
                          onClick={() => setGachaRarityFilter(r.key)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                            gachaRarityFilter === r.key
                              ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                              : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-zinc-400 uppercase">Loại Gacha:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "all", label: "Tất cả" },
                        { key: "sticker", label: "Sticker" },
                        { key: "furniture", label: "Furniture" },
                        { key: "outfit", label: "Outfit" },
                        { key: "theme", label: "Theme" },
                        { key: "meme", label: "Meme" },
                        { key: "voice", label: "Voice" }
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={() => setGachaTypeFilter(t.key)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                            gachaTypeFilter === t.key
                              ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                              : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gacha Pool list */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-[#8C6D58] uppercase">Danh Sách Vật Phẩm Gacha Pool ({filteredGachaPool.length})</h3>
                  <button
                    onClick={handleCreateGachaItem}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={12} /> Thêm vật phẩm
                  </button>
                </div>
                {filteredGachaPool.length === 0 ? (
                  <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy vật phẩm Gacha nào phù hợp.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredGachaPool.map((item) => (
                      <div key={item.id} className="p-3 border border-zinc-200 rounded-2xl flex items-center justify-between gap-2 bg-zinc-50/50 hover:border-[#8C6D58] transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-zinc-200 shrink-0 p-1">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-zinc-700 truncate text-[#8C6D58]">{item.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{item.rarity} | {item.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleEditGachaItem(item)}
                            className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                            title="Sửa vật phẩm"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteGachaItem(item.id)}
                            className="p-1 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                            title="Xóa vật phẩm"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop items lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Exclusives */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-[#8C6D58] uppercase">Vật Phẩm Cửa Hàng Độc Quyền ({filteredShopExclusives.length})</h3>
                    <button
                      onClick={() => handleCreateShopItem("exclusive")}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={10} /> Thêm đồ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {filteredShopExclusives.map((item) => (
                      <div key={item.id} className="p-3 border border-zinc-150 rounded-2xl flex items-center justify-between gap-2 hover:border-[#8C6D58] transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={item.imageUrl} className="w-10 h-10 object-contain rounded-lg bg-zinc-50 border p-1" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-zinc-700">{item.name}</h4>
                            <p className="text-[9px] text-zinc-400 font-bold line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">🪶 {item.cost}</span>
                          <button
                            onClick={() => handleEditShopItem(item, "exclusive")}
                            className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteShopItem(item.id, "exclusive")}
                            className="p-1 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredShopExclusives.length === 0 && (
                      <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy vật phẩm cửa hàng độc quyền nào phù hợp.</p>
                    )}
                  </div>
                </div>

                {/* Consumables */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-[#8C6D58] uppercase">Bùa Chú Cửa Hàng ({filteredShopConsumables.length})</h3>
                    <button
                      onClick={() => handleCreateShopItem("consumable")}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={10} /> Thêm bùa
                    </button>
                  </div>
                  <div className="space-y-3">
                    {filteredShopConsumables.map((item) => (
                      <div key={item.id} className="p-3 border border-zinc-150 rounded-2xl flex items-center justify-between gap-2 hover:border-[#8C6D58] transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={item.imageUrl} className="w-10 h-10 object-contain rounded-lg bg-zinc-50 border p-1" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-zinc-700">{item.name}</h4>
                            <p className="text-[9px] text-zinc-400 font-bold line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">🪶 {item.cost}</span>
                          <button
                            onClick={() => handleEditShopItem(item, "consumable")}
                            className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteShopItem(item.id, "consumable")}
                            className="p-1 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredShopConsumables.length === 0 && (
                      <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy bùa chú nào phù hợp.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY QUESTS */}
          {activeTab === "quests" && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-[#8C6D58] uppercase">Cấu hình Nhiệm vụ hàng ngày (Tĩnh)</h3>
                  <p className="text-xs text-zinc-400 font-bold">Các nhiệm vụ này reset vào mỗi ngày mới. Phần thưởng được tính bằng Lông Vàng.</p>
                </div>
                <button
                  onClick={handleCreateQuest}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={12} /> Thêm nhiệm vụ
                </button>
              </div>

              {/* Bộ lọc nhiệm vụ hàng ngày */}
              <div className="flex items-center gap-3 pt-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhiệm vụ theo tên, ID..."
                    value={questSearch}
                    onChange={(e) => setQuestSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredQuests.map((quest) => (
                  <div key={quest.id} className="p-4 border border-zinc-200 rounded-2xl bg-zinc-50/50 flex justify-between items-center gap-4 hover:border-[#8C6D58] hover:border-2 transition-all">
                    <div>
                      <h4 className="text-xs font-black text-zinc-700">{quest.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold">Mục tiêu: {quest.target} | ID: {quest.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shrink-0">🪶 +{quest.reward}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditQuest(quest)}
                          className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                          title="Sửa nhiệm vụ"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuest(quest.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                          title="Xóa nhiệm vụ"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredQuests.length === 0 && (
                  <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy nhiệm vụ nào phù hợp.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USERS / CHEAT TOOLS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="font-black text-zinc-700 text-sm">Testing & Hack/Cheat Stats Người dùng</h3>
                  <p className="text-xs text-zinc-400 font-bold">Lấy dữ liệu người dùng thật từ bộ sưu tập user_stats trên Cloud Firestore.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm theo UID, Email, Tên..."
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users List */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden h-[400px] flex flex-col">
                  <div className="p-4 bg-zinc-50 border-b border-zinc-150 font-black text-zinc-500 text-xs uppercase tracking-wider">
                    Danh Sách Tài Khoản Hệ Thống
                  </div>
                  <div className="flex-1 overflow-auto divide-y divide-zinc-100">
                    {usersStatsList
                      .filter(u =>
                        u.id.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                        (u.email && u.email.toLowerCase().includes(searchUserQuery.toLowerCase())) ||
                        (u.displayName && u.displayName.toLowerCase().includes(searchUserQuery.toLowerCase()))
                      )
                      .map(u => (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className={`p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors ${selectedUser?.id === u.id ? "bg-amber-50/50 border-l-4 border-[#8C6D58]" : ""
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-zinc-700 truncate">{u.displayName || "Học viên ẩn danh"}</h4>
                            <p className="text-[10px] text-zinc-400 font-bold truncate">UID: {u.id} | Email: {u.email || "Không có"}</p>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="text-xs font-black text-[#8C6D58]">🪶 {u.goldenFur || 0}</p>
                              <p className="text-[10px] font-bold text-zinc-400">Coins: {u.coins || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {usersStatsList.length === 0 && (
                      <p className="p-8 text-center text-zinc-400 italic text-xs">Không tìm thấy tài khoản nào trên Cloud Firestore.</p>
                    )}
                  </div>
                </div>

                {/* Cheat Panel */}
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between">
                  {selectedUser ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Đang chọn</span>
                        <h3 className="text-sm font-black text-zinc-800 mt-2">{selectedUser.displayName || "User"}</h3>
                        <p className="text-[10px] text-zinc-400 font-bold truncate">UID: {selectedUser.id}</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 space-y-3">
                        {/* Golden Fur */}
                        <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase">Lông Vàng (Golden Fur)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={selectedUser.goldenFur || 0}
                              onChange={(e) => handleUpdateUserStat(selectedUser.id, "goldenFur", parseInt(e.target.value) || 0)}
                              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                            />
                            <button
                              onClick={() => handleUpdateUserStat(selectedUser.id, "goldenFur", (selectedUser.goldenFur || 0) + 100)}
                              className="px-2.5 py-1.5 bg-amber-500 text-white font-black text-[10px] rounded-lg cursor-pointer"
                            >
                              +100
                            </button>
                            <button
                              onClick={() => handleUpdateUserStat(selectedUser.id, "goldenFur", 0)}
                              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border rounded-lg cursor-pointer text-[10px]"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Coins */}
                        <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase">Xương (Coins)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={selectedUser.coins || 0}
                              onChange={(e) => handleUpdateUserStat(selectedUser.id, "coins", parseInt(e.target.value) || 0)}
                              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                            />
                            <button
                              onClick={() => handleUpdateUserStat(selectedUser.id, "coins", (selectedUser.coins || 0) + 100)}
                              className="px-2.5 py-1.5 bg-orange-500 text-white font-black text-[10px] rounded-lg cursor-pointer"
                            >
                              +100
                            </button>
                          </div>
                        </div>

                        {/* Streak */}
                        <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase">Học liên tục (Streak)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={selectedUser.streak || 0}
                              onChange={(e) => handleUpdateUserStat(selectedUser.id, "streak", parseInt(e.target.value) || 0)}
                              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                            />
                          </div>
                        </div>

                        {/* Pity Counter */}
                        <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase">Pity Counter (Bảo hiểm gacha)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={selectedUser.pityCounter || 0}
                              onChange={(e) => handleUpdateUserStat(selectedUser.id, "pityCounter", parseInt(e.target.value) || 0)}
                              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center py-12 text-zinc-400 italic text-xs">
                      Chọn một tài khoản bên trái để sửa đổi chỉ số cheat.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-black text-[#8C6D58] uppercase">Cấu hình Hệ Thống & Bảo Trì</h3>
                <p className="text-xs text-zinc-400 font-bold">Các cấu hình này lưu trữ trên Cloud Firestore và áp dụng tức thì cho toàn bộ người dùng.</p>
              </div>

              <div className="space-y-6 divide-y divide-zinc-100">
                {/* Maintenance mode toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-zinc-700">Chế độ Bảo Trì (Maintenance Mode)</h4>
                    <p className="text-[10px] text-zinc-400 font-bold">Khi được bật, người dùng thông thường sẽ thấy màn hình thông báo bảo trì và không thể thao tác trên app.</p>
                  </div>
                  <button
                    onClick={() => handleUpdateSystemSetting("maintenanceMode", !systemSettings.maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      systemSettings.maintenanceMode ? "bg-red-500" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        systemSettings.maintenanceMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Announcement Banner text */}
                <div className="pt-6 space-y-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-zinc-700">Dòng chữ Chạy Thông Báo (Announcement Banner)</h4>
                    <p className="text-[10px] text-zinc-405 font-bold">Dòng chữ chạy ngang ở đầu website thông báo tin tức quan trọng.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={systemSettings.announcementBanner}
                      onChange={(e) => setSystemSettings({ ...systemSettings, announcementBanner: e.target.value })}
                      className="flex-1 px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl text-xs font-bold"
                    />
                    <button
                      onClick={() => handleUpdateSystemSetting("announcementBanner", systemSettings.announcementBanner)}
                      className="px-4 py-2 bg-[#8C6D58] hover:bg-[#735642] text-white font-black text-xs rounded-xl cursor-pointer"
                    >
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER CARD EDITOR */}
      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l-4 border-[#8C6D58] z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
                  <h3 className="text-sm font-black text-zinc-800" style={{ fontFamily: "var(--font-cherry)" }}>
                    {cards.some(c => c.id === selectedCard.id) ? "CHỈNH SỬA TỪ VỰNG" : "THÊM TỪ VỰNG MỚI"}
                  </h3>
                  <button onClick={() => setSelectedCard(null)} className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-bold">
                  {/* Word */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Kanji / Từ vựng viết chính</label>
                    <input
                      type="text"
                      value={selectedCard.word}
                      onChange={(e) => setSelectedCard({ ...selectedCard, word: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 font-extrabold text-sm"
                      placeholder="VD: 私 hoặc 勉強します"
                    />
                  </div>

                  {/* Reading */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Hiragana / Cách đọc (Furigana)</label>
                    <input
                      type="text"
                      value={selectedCard.reading}
                      onChange={(e) => setSelectedCard({ ...selectedCard, reading: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-700"
                      placeholder="VD: わたし hoặc べんきょうします"
                    />
                  </div>

                  {/* Romaji */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Romaji</label>
                    <input
                      type="text"
                      value={selectedCard.romaji}
                      onChange={(e) => setSelectedCard({ ...selectedCard, romaji: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-500 italic"
                      placeholder="VD: watashi"
                    />
                  </div>

                  {/* Meaning */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Nghĩa tiếng Việt</label>
                    <input
                      type="text"
                      value={selectedCard.meaning}
                      onChange={(e) => setSelectedCard({ ...selectedCard, meaning: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-700"
                      placeholder="VD: Tôi"
                    />
                  </div>

                  {/* Pos */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Từ loại (POS)</label>
                    <select
                      value={selectedCard.pos || "noun"}
                      onChange={(e) => setSelectedCard({ ...selectedCard, pos: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-600 bg-white"
                    >
                      <option value="noun">Noun (Danh từ)</option>
                      <option value="verb">Verb (Động từ)</option>
                      <option value="adjective">Adjective (Tính từ)</option>
                      <option value="adverb">Adverb (Trạng từ)</option>
                      <option value="phrase">Phrase (Cụm từ)</option>
                      <option value="pronoun">Pronoun (Đại từ)</option>
                      <option value="suffix">Suffix (Hậu tố)</option>
                      <option value="interrogative">Interrogative (Từ để hỏi)</option>
                    </select>
                  </div>

                  {/* Examples */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Ví dụ Kanji (Không Furigana)</label>
                    <input
                      type="text"
                      value={selectedCard.example_jp || ""}
                      onChange={(e) => setSelectedCard({ ...selectedCard, example_jp: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                      placeholder="VD: 私は学生です。"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Ví dụ Formatted (Ghi furigana dạng [Hán tự]phiênâm)</label>
                    <input
                      type="text"
                      value={selectedCard.example_jp_formatted || ""}
                      onChange={(e) => setSelectedCard({ ...selectedCard, example_jp_formatted: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 font-mono"
                      placeholder="VD: [私]{わたし}は[学生]{がくsei}です。"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Dịch nghĩa ví dụ (Tiếng Việt)</label>
                    <input
                      type="text"
                      value={selectedCard.example_vi || ""}
                      onChange={(e) => setSelectedCard({ ...selectedCard, example_vi: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                      placeholder="VD: Tôi là học sinh."
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Ghi chú (Notes)</label>
                    <textarea
                      value={selectedCard.notes || ""}
                      onChange={(e) => setSelectedCard({ ...selectedCard, notes: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[60px]"
                      placeholder="VD: Cách nói lịch sự, dùng cho cả nam lẫn nữ..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex gap-2">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl cursor-pointer border border-zinc-300"
                >
                  HỦY BỎ
                </button>
                <button
                  onClick={() => handleCardSave(selectedCard)}
                  className="flex-1 py-2.5 bg-[#8C6D58] hover:bg-[#735642] text-white font-black rounded-xl cursor-pointer"
                >
                  XÁC NHẬN
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL IMPORT EXCEL */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
                <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                  NHẬP TỪ VỰNG HÀNG LOẠT (EXCEL/GOOGLE SHEETS)
                </h3>
                <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs font-bold text-zinc-500 space-y-2">
                <p>1. Định dạng cột copy từ Excel / Sheets phải theo thứ tự:</p>
                <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl font-mono text-[10px] flex items-center justify-between text-zinc-600">
                  <span>Từ chính (Kanji)</span>
                  <span>Cách đọc (Hiragana)</span>
                  <span>Ý nghĩa tiếng Việt</span>
                  <span>Romaji</span>
                </div>
                <p>2. Chọn kiểu phân tách cột tương ứng:</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={importDelimiter === "tab"}
                      onChange={() => setImportDelimiter("tab")}
                    />
                    Dấu Tab (Sao chép trực tiếp từ ô Excel/Sheets)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={importDelimiter === "comma"}
                      onChange={() => setImportDelimiter("comma")}
                    />
                    Dấu phẩy (CSV)
                  </label>
                </div>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Dán các hàng từ vựng đã copy từ Excel vào đây...&#10;Ví dụ:&#10;私	わたし	Tôi	watashi&#10;学生	がくせい	Học sinh	gakusei"
                className="w-full h-48 px-3.5 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] outline-none rounded-2xl text-xs font-bold font-mono"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
                >
                  Đóng
                </button>
                <button
                  onClick={handleImport}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Bắt đầu Nhập
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DECKS METADATA EDITOR */}
      <AnimatePresence>
        {isDeckModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
                <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                  {editingDeck ? "CHỈNH SỬA THÔNG TIN BỘ BÀI" : "TẠO BỘ BÀI MỚI"}
                </h3>
                <button onClick={() => setIsDeckModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mã bộ bài (ID Slug)</label>
                  <input
                    type="text"
                    disabled={!!editingDeck}
                    value={deckForm.id || ""}
                    onChange={(e) => setDeckForm({ ...deckForm, id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 disabled:bg-zinc-100 font-extrabold text-[#8C6D58]"
                    placeholder="VD: sys_n5_verb"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Tên bộ bài (Tiêu đề)</label>
                  <input
                    type="text"
                    value={deckForm.title || ""}
                    onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: Động từ N5 cơ bản"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Cấp độ (Level)</label>
                    <select
                      value={deckForm.level || "N5"}
                      onChange={(e) => setDeckForm({ ...deckForm, level: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
                    >
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Thể loại (Type)</label>
                    <select
                      value={deckForm.type || "flashcard"}
                      onChange={(e) => setDeckForm({ ...deckForm, type: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
                    >
                      <option value="flashcard">Flashcard</option>
                      <option value="kanji">Kanji</option>
                      <option value="minigame_typing">Game gõ phím</option>
                      <option value="minigame_visual_novel">Game Visual Novel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Chương (Chapter)</label>
                    <input
                      type="number"
                      value={deckForm.chapter || 1}
                      onChange={(e) => setDeckForm({ ...deckForm, chapter: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Thứ tự (Order)</label>
                    <input
                      type="number"
                      value={deckForm.order || 1}
                      onChange={(e) => setDeckForm({ ...deckForm, order: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Thưởng Xương (Coins)</label>
                    <input
                      type="number"
                      value={deckForm.rewardCoins || 10}
                      onChange={(e) => setDeckForm({ ...deckForm, rewardCoins: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Bộ bài điều kiện trước (Prerequisite ID)</label>
                  <input
                    type="text"
                    value={deckForm.prerequisite || ""}
                    onChange={(e) => setDeckForm({ ...deckForm, prerequisite: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="Nhập ID bộ bài bắt buộc học trước (nếu có)"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mô tả ngắn</label>
                  <textarea
                    value={deckForm.description || ""}
                    onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[50px]"
                    placeholder="Bộ từ vựng giúp học sinh làm quen với..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsDeckModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveDeckMetadata}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GACHA ITEM EDITOR */}
      <AnimatePresence>
        {isGachaModalOpen && selectedGachaItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
                <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                  {gachaPool.some(i => i.id === selectedGachaItem.id) ? "SỬA VẬT PHẨM GACHA" : "THÊM VẬT PHẨM GACHA"}
                </h3>
                <button onClick={() => setIsGachaModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mã vật phẩm (ID)</label>
                  <input
                    type="text"
                    value={selectedGachaItem.id || ""}
                    onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-[#8C6D58] font-extrabold"
                    placeholder="VD: out_santa_shiba"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Tên vật phẩm</label>
                  <input
                    type="text"
                    value={selectedGachaItem.name || ""}
                    onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: Shiba Noel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Loại vật phẩm (Type)</label>
                    <select
                      value={selectedGachaItem.type}
                      onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, type: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
                    >
                      <option value="sticker">Sticker (Dán nhãn)</option>
                      <option value="theme">Theme (Hình nền)</option>
                      <option value="outfit">Outfit (Trang phục)</option>
                      <option value="furniture">Furniture (Nội thất sinh xương)</option>
                      <option value="meme">Meme (Kiến thức vui)</option>
                      <option value="voice">Voice (Giọng nói)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Độ hiếm (Rarity)</label>
                    <select
                      value={selectedGachaItem.rarity}
                      onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, rarity: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
                    >
                      <option value="common">Common (Thường)</option>
                      <option value="rare">Rare (Hiếm)</option>
                      <option value="epic">Epic (Sử thi)</option>
                      <option value="legendary">Legendary (Huyền thoại)</option>
                      <option value="mythic">Mythic (Thần thoại)</option>
                      <option value="divine">Divine (Thần thánh)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn hình ảnh (ImageUrl)</label>
                    <input
                      type="text"
                      value={selectedGachaItem.imageUrl || ""}
                      onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                      placeholder="VD: /images/stickers/st_chibi.png"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Mục tiêu mảnh ghép (Shard Target)</label>
                    <input
                      type="number"
                      value={selectedGachaItem.shardTarget || 2}
                      onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, shardTarget: parseInt(e.target.value) || 2 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mô tả vật phẩm</label>
                  <textarea
                    value={selectedGachaItem.description || ""}
                    onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, description: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[40px]"
                    placeholder="Mô tả công dụng hoặc vẻ đẹp của vật phẩm..."
                  />
                </div>

                {/* Specific field for furniture */}
                {selectedGachaItem.type === "furniture" && (
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Sản lượng sinh Xương (+ BONES / HOUR)</label>
                    <input
                      type="number"
                      value={selectedGachaItem.bonesPerHour || 0}
                      onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, bonesPerHour: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                )}

                {/* Specific fields for meme */}
                {selectedGachaItem.type === "meme" && (
                  <div className="p-3 border border-zinc-200 rounded-xl bg-zinc-50 space-y-2 mt-2">
                    <p className="text-[9px] font-black text-zinc-500 uppercase">Chi tiết kiến thức Nhật Bản (Meme Point)</p>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase">Từ / Cụm từ tiếng Nhật</label>
                      <input
                        type="text"
                        value={selectedGachaItem.japanesePoint?.word || ""}
                        onChange={(e) => setSelectedGachaItem({
                          ...selectedGachaItem,
                          japanesePoint: { ...selectedGachaItem.japanesePoint, word: e.target.value }
                        })}
                        className="w-full px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase">Ý nghĩa nghĩa tiếng Việt</label>
                      <input
                        type="text"
                        value={selectedGachaItem.japanesePoint?.meaning || ""}
                        onChange={(e) => setSelectedGachaItem({
                          ...selectedGachaItem,
                          japanesePoint: { ...selectedGachaItem.japanesePoint, meaning: e.target.value }
                        })}
                        className="w-full px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase">Chú thích Ngữ pháp / Cách dùng</label>
                      <textarea
                        value={selectedGachaItem.japanesePoint?.grammarNote || ""}
                        onChange={(e) => setSelectedGachaItem({
                          ...selectedGachaItem,
                          japanesePoint: { ...selectedGachaItem.japanesePoint, grammarNote: e.target.value }
                        })}
                        className="w-full px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white min-h-[40px]"
                      />
                    </div>
                  </div>
                )}

                {/* Specific field for voice */}
                {selectedGachaItem.type === "voice" && (
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn tệp âm thanh (AudioUrl)</label>
                    <input
                      type="text"
                      value={selectedGachaItem.audioUrl || ""}
                      onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, audioUrl: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 font-mono"
                      placeholder="VD: /audio/voices/voice_correct_01.mp3"
                    />
                  </div>
                )}

                {/* RPG Stats option for outfits / furniture */}
                {(selectedGachaItem.type === "outfit" || selectedGachaItem.type === "furniture") && (
                  <div className="p-3 border border-orange-200 rounded-xl bg-orange-50/50 space-y-2 mt-2">
                    <p className="text-[9px] font-black text-amber-800 uppercase">RPG Stats (Chiến đấu hệ Shiba Room)</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-zinc-400">Vị trí slot trang bị</label>
                        <select
                          value={selectedGachaItem.rpgSlot || "head"}
                          onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, rpgSlot: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                        >
                          <option value="head">Mũ/Đầu (Head)</option>
                          <option value="armor">Mũi giáp/Thân (Armor)</option>
                          <option value="earring">Bông tai/Phụ kiện (Earring)</option>
                          <option value="gloves">Bao tay/Vũ khí (Gloves)</option>
                          <option value="mount">Thú cưỡi/Đồng hành (Mount)</option>
                          <option value="aura">Hào quang/Khí tức (Aura)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-zinc-400">Cộng HP</label>
                        <input
                          type="number"
                          value={selectedGachaItem.hpBonus || 0}
                          onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, hpBonus: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400">Cộng ATK</label>
                        <input
                          type="number"
                          value={selectedGachaItem.atkBonus || 0}
                          onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, atkBonus: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400">Cộng DEF</label>
                        <input
                          type="number"
                          value={selectedGachaItem.defBonus || 0}
                          onChange={(e) => setSelectedGachaItem({ ...selectedGachaItem, defBonus: parseInt(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsGachaModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveGachaItem(selectedGachaItem)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SHOP ITEM EDITOR */}
      <AnimatePresence>
        {isShopModalOpen && selectedShopItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
                <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                  {shopExclusives.some(i => i.id === selectedShopItem.id) || shopConsumables.some(i => i.id === selectedShopItem.id)
                    ? "SỬA VẬT PHẨM CỬA HÀNG"
                    : "THÊM VẬT PHẨM CỬA HÀNG MỚI"}
                </h3>
                <button onClick={() => setIsShopModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mã cửa hàng (ID)</label>
                  <input
                    type="text"
                    value={selectedShopItem.id || ""}
                    onChange={(e) => setSelectedShopItem({ ...selectedShopItem, id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-[#8C6D58] font-extrabold"
                    placeholder="VD: fur_tatami_mat"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Tên vật phẩm</label>
                  <input
                    type="text"
                    value={selectedShopItem.name || ""}
                    onChange={(e) => setSelectedShopItem({ ...selectedShopItem, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: Thảm Tatami Nhật Bản"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Loại vật phẩm (Type)</label>
                    <select
                      value={selectedShopItem.type}
                      onChange={(e) => setSelectedShopItem({ ...selectedShopItem, type: e.target.value })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
                    >
                      <option value="furniture">Furniture (Nội thất)</option>
                      <option value="outfit">Outfit (Trang phục)</option>
                      <option value="voice">Voice Pack (Giọng nói)</option>
                      <option value="consumable">Consumable (Bùa tiêu hao)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Giá mua (Lông Vàng)</label>
                    <input
                      type="number"
                      value={selectedShopItem.cost || 50}
                      onChange={(e) => setSelectedShopItem({ ...selectedShopItem, cost: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn hình ảnh (ImageUrl)</label>
                  <input
                    type="text"
                    value={selectedShopItem.imageUrl || ""}
                    onChange={(e) => setSelectedShopItem({ ...selectedShopItem, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: /images/decorations/decoration_tatami.png"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={selectedShopItem.description || ""}
                    onChange={(e) => setSelectedShopItem({ ...selectedShopItem, description: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: Chiếu rơm trải sàn phong cách Nhật Bản truyền thống."
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Truyền thuyết / Lore</label>
                  <textarea
                    value={selectedShopItem.lore || ""}
                    onChange={(e) => setSelectedShopItem({ ...selectedShopItem, lore: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[40px]"
                    placeholder="Ghi cốt truyện cho vật phẩm thêm hấp dẫn..."
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Hiệu ứng / Chỉ số cộng thêm (Effects)</label>
                  <input
                    type="text"
                    value={selectedShopItem.effects || ""}
                    onChange={(e) => setSelectedShopItem({ ...selectedShopItem, effects: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: RPG Stats: +10 Phòng thủ"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsShopModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveShopItem(selectedShopItem)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL QUEST EDITOR */}
      <AnimatePresence>
        {isQuestModalOpen && selectedQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
                <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                  {dailyQuests.some(q => q.id === selectedQuest.id) ? "SỬA NHIỆM VỤ" : "THÊM NHIỆM VỤ MỚI"}
                </h3>
                <button onClick={() => setIsQuestModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Mã nhiệm vụ (ID)</label>
                  <input
                    type="text"
                    disabled={dailyQuests.some(q => q.id === selectedQuest.id)}
                    value={selectedQuest.id || ""}
                    onChange={(e) => setSelectedQuest({ ...selectedQuest, id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl mt-1 disabled:bg-zinc-100 font-extrabold text-[#8C6D58]"
                    placeholder="VD: q_flip_cards"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-450 uppercase">Tiêu đề nhiệm vụ</label>
                  <input
                    type="text"
                    value={selectedQuest.title || ""}
                    onChange={(e) => setSelectedQuest({ ...selectedQuest, title: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    placeholder="VD: Lật 15 thẻ từ vựng"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-450 uppercase">Mục tiêu (Target)</label>
                    <input
                      type="number"
                      value={selectedQuest.target || 10}
                      onChange={(e) => setSelectedQuest({ ...selectedQuest, target: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-450 uppercase">Thưởng Lông Vàng</label>
                    <input
                      type="number"
                      value={selectedQuest.reward || 1}
                      onChange={(e) => setSelectedQuest({ ...selectedQuest, reward: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsQuestModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveQuest(selectedQuest)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
