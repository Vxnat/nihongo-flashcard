import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GachaItem } from "@/constants/gachaPool";
import { useSystemItems } from "./useSystemItems";
import toast from "react-hot-toast";
import { playAudio, playAudioUrl } from "@/utils/tts";


export function useShibaRoom() {
  const { allItems } = useSystemItems();
  const { userStats, equipFurniture, harvestBones, equipItem, equipTheme, user } = useAppStore((state: any) => state);
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
        const item = allItems.find((i) => i.id === itemId);
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
      const item = allItems.find((i) => i.id === itemId);
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
    const floorItem = equippedFloor ? allItems.find((i) => i.id === equippedFloor) : null;
    if (floorItem && floorItem.shibaMascotStyle) {
      return {
        gif: "/images/mascot/shiba_room.gif",
        style: floorItem.shibaMascotStyle,
      };
    }
    return {
      gif: "/images/mascot/shiba_room.gif",
      style: { bottom: "32%", left: "47%", width: "28%" },
    };
  };

  const shibaMascot = getShibaMascot();

  const baseStats = userStats.baseStats || {
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
        const item = allItems.find((i) => i.id === itemId);
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



  // Select items matching the active tab
  const getItemsForTab = () => {
    switch (activeTab) {
      case "trangbi":
        return allItems.filter((item) => item.type === "accessory" || item.type === "outfit" || item.type === "costume");
      case "decor":
        return allItems.filter((item) => item.type === "furniture");
      case "voice":
        return allItems.filter((item) => item.type === "voice");
      case "meme":
        return allItems.filter((item) => item.type === "meme");
      case "theme":
        return allItems.filter((item) => item.type === "theme");
      default:
        return [];
    }
  };

  const activeGridItems = getItemsForTab();

  // Helper checking if an item is unlocked
  const isItemUnlocked = (item: GachaItem) => {
    if (!user) {
      if (item.type === "furniture") {
        return Object.values(userStats.equippedFurniture || {}).includes(item.id);
      }
      if (item.type === "voice") {
        return userStats.equippedSlots?.voice === item.id;
      }
      if (item.type === "theme") {
        return userStats.equippedTheme === item.id;
      }
      if (item.type === "accessory" || item.type === "outfit") {
        return Object.values(userStats.equippedSlots || {}).includes(item.id);
      }
      return false;
    }
    return userStats.inventory?.includes(item.id) || false;
  };

  // Helper checking if an item is equipped
  const isItemEquipped = (item: GachaItem) => {
    if (item.type === "furniture") {
      const slot = item.furnitureSlot;
      return slot ? userStats.equippedFurniture?.[slot] === item.id : false;
    }
    if (item.type === "voice") {
      return userStats.equippedSlots?.voice === item.id;
    }
    if (item.type === "theme") {
      return userStats.equippedTheme === item.id;
    }
    if (item.type === "accessory" || item.type === "outfit" || item.type === "costume") {
      const slot = item.type === "costume" ? "costume" : item.rpgSlot;
      if (slot) {
        return userStats.equippedSlots?.[slot] === item.id;
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
    handleSpeak: playAudio,
    handlePlayVoice: playAudioUrl,
    activeGridItems,
    isItemUnlocked,
    isItemEquipped,
    sakuraPetals,
  };
}
