import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GACHA_POOL, GachaItem } from "@/constants/gachaPool";
import toast from "react-hot-toast";


export function useShibaRoom() {
  const { userStats, equipFurniture, equipVoicePack, harvestBones, equipItem, equipTheme, user } = useAppStore((state: any) => state);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trangbi" | "decor" | "voice" | "meme" | "theme">("trangbi");
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [pendingBones, setPendingBones] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ top: -200, bottom: 200 });
  const [showStatsBreakdown, setShowStatsBreakdown] = useState(false);
  const [modalSubTab, setModalSubTab] = useState<"character" | "inventory">("character");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateConstraints = () => {
        const height = window.innerHeight;
        const halfHeight = height / 2;
        setDragConstraints({
          top: -halfHeight + 100, // Keep 100px gap from top edge
          bottom: halfHeight - 160, // Keep 160px gap from bottom edge to clear BottomNav
        });
      };
      updateConstraints();
      window.addEventListener("resize", updateConstraints);
      return () => window.removeEventListener("resize", updateConstraints);
    }
  }, []);

  // Calculate pending bones
  const calculatePending = () => {
    if (!user) return 0;
    const lastHarvest = userStats.lastHarvestTime
      ? new Date(userStats.lastHarvestTime).getTime()
      : Date.now();
    const elapsedHours = (Date.now() - lastHarvest) / (1000 * 60 * 60);
    const totalBonesPerHour = Object.values(userStats.equippedFurniture || {}).reduce(
      (sum: number, itemId: any) => {
        const item = GACHA_POOL.find((i) => i.id === itemId);
        return sum + (item?.bonesPerHour || 0);
      },
      0
    );
    let pending = Math.floor(elapsedHours * totalBonesPerHour);
    const isDoubleActive = userStats.buffDoubleBonesUntil
      ? new Date(userStats.buffDoubleBonesUntil).getTime() > Date.now()
      : false;
    if (isDoubleActive) {
      pending *= 2;
    }
    return pending;
  };

  useEffect(() => {
    setPendingBones(calculatePending());
    const interval = setInterval(() => {
      setPendingBones(calculatePending());
    }, 5000);
    return () => clearInterval(interval);
  }, [userStats.lastHarvestTime, userStats.equippedFurniture, user]);

  const totalBonesPerHour = Object.values(userStats.equippedFurniture || {}).reduce(
    (sum: number, itemId: any) => {
      const item = GACHA_POOL.find((i) => i.id === itemId);
      return sum + (item?.bonesPerHour || 0);
    },
    0
  );

  const handleHarvest = async () => {
    if (pendingBones <= 0) {
      toast.error("Chưa có xương nào tích lũy, hãy đợi thêm nhé! 🦴");
      return;
    }
    const harvested = await harvestBones();
    if (harvested > 0) {
      toast.success(`Đã thu hoạch thành công +${harvested} Xương! 🦴🎉`);
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.65 },
          zIndex: 100,
        });
      });
    }
  };

  // Determine Shiba companion animation states
  const getShibaMascot = () => {
    const equippedFloor = userStats.equippedFurniture?.floor;
    const floorItem = equippedFloor ? GACHA_POOL.find((i) => i.id === equippedFloor) : null;
    if (floorItem && floorItem.shibaMascotStyle) {
      return {
        gif: "/images/mascot/shiba_master.gif",
        style: floorItem.shibaMascotStyle,
      };
    }
    return {
      gif: "/images/mascot/shiba_master.gif",
      style: { bottom: "32%", left: "47%", width: "28%" },
    };
  };

  const shibaMascot = getShibaMascot();

  const baseStats = {
    hp: 150,
    atk: 25,
    def: 10,
    crit: 5,
  };

  const statsBonus = useMemo(() => {
    let hp = 0;
    let atk = 0;
    let def = 0;
    let crit = 0;

    const equippedSlots = userStats.equippedSlots || {};
    Object.values(equippedSlots).forEach((itemId) => {
      if (itemId) {
        const item = GACHA_POOL.find((i) => i.id === itemId);
        if (item) {
          if (item.hpBonus) hp += item.hpBonus;
          if (item.atkBonus) atk += item.atkBonus;
          if (item.defBonus) def += item.defBonus;
          if (item.critBonus) crit += item.critBonus;
        }
      }
    });

    return { hp, atk, def, crit };
  }, [userStats.equippedSlots]);

  const totalHp = baseStats.hp + statsBonus.hp;
  const totalAtk = baseStats.atk + statsBonus.atk;
  const totalDef = baseStats.def + statsBonus.def;
  const totalCrit = baseStats.crit + statsBonus.crit;

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayVoice = (audioUrl: string) => {
    const audio = new Audio(`${audioUrl}`);
    audio.volume = 0.6;
    audio.play().catch((err) => console.warn("Failed to play preview voice:", err));
  };

  // Select items matching the active tab
  const getItemsForTab = () => {
    switch (activeTab) {
      case "trangbi":
        return GACHA_POOL.filter((item) => item.type === "sticker" || item.type === "outfit");
      case "decor":
        return GACHA_POOL.filter((item) => item.type === "furniture");
      case "voice":
        return GACHA_POOL.filter((item) => item.type === "voice");
      case "meme":
        return GACHA_POOL.filter((item) => item.type === "meme");
      case "theme":
        return GACHA_POOL.filter((item) => item.type === "theme");
      default:
        return [];
    }
  };

  const activeGridItems = getItemsForTab();

  // Helper checking if an item is unlocked
  const isItemUnlocked = (item: GachaItem) => {
    if (item.type === "furniture") return userStats.furniture?.includes(item.id);
    if (item.type === "voice") return userStats.unlockedVoices?.includes(item.id);
    if (item.type === "meme") return userStats.unlockedMemes?.includes(item.id);
    if (item.type === "sticker" || item.type === "outfit" || item.type === "theme") return userStats.inventory?.includes(item.id);
    return false;
  };

  // Helper checking if an item is equipped
  const isItemEquipped = (item: GachaItem) => {
    if (item.type === "furniture") {
      const slot = item.furnitureSlot;
      return slot ? userStats.equippedFurniture?.[slot] === item.id : false;
    }
    if (item.type === "voice") {
      return userStats.equippedVoicePack === item.id;
    }
    if (item.type === "theme") {
      return userStats.equippedTheme === item.id;
    }
    if (item.type === "sticker" || item.type === "outfit") {
      if (item.rpgSlot) {
        return userStats.equippedSlots?.[item.rpgSlot] === item.id;
      }
    }
    return false;
  };

  const sakuraPetals = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    delay: i * 2,
    duration: 6 + i * 1.5,
    x: [100, -20],
    y: [-20, 120],
  }));

  return {
    userStats,
    equipFurniture,
    equipVoicePack,
    harvestBones,
    equipItem,
    equipTheme,
    user,
    isInventoryOpen,
    setIsInventoryOpen,
    activeTab,
    setActiveTab,
    selectedItem,
    setSelectedItem,
    pendingBones,
    dragConstraints,
    showStatsBreakdown,
    setShowStatsBreakdown,
    modalSubTab,
    setModalSubTab,
    totalBonesPerHour,
    handleHarvest,
    shibaMascot,
    baseStats,
    statsBonus,
    totalHp,
    totalAtk,
    totalDef,
    totalCrit,
    handleSpeak,
    handlePlayVoice,
    activeGridItems,
    isItemUnlocked,
    isItemEquipped,
    sakuraPetals,
  };
}
