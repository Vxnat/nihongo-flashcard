"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GachaItem } from "@/constants/gachaPool";
import { useSystemItems } from "./useSystemItems";
import toast from "react-hot-toast";
import { playAudio, playAudioUrl } from "@/utils/tts";

/**
 * Hook quản lý toàn bộ logic cho Căn phòng Shiba (Shiba Room).
 * Xử lý việc thu hoạch xương (Harvest), tính toán HP/ATK/DEF/CRIT từ trang bị,
 * quản lý đồ Decor trang trí, trạng thái đăng nhập, tủ đồ và cửa hàng shop.
 */
export function useShibaRoom() {
  const { allItems } = useSystemItems();
  const { userStats, equipFurniture, harvestBones, equipItem, equipTheme, user, deductCoins } = useAppStore((state: any) => state);

  // --- Trạng thái giao diện và cửa sổ Modal ---
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"trangbi" | "decor" | "voice" | "meme" | "theme">("trangbi");
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [dragConstraints, setDragConstraints] = useState({ top: -200, bottom: 200 });
  const [showStatsBreakdown, setShowStatsBreakdown] = useState(false);
  const [modalSubTab, setModalSubTab] = useState<"character" | "inventory">("character");

  // --- Tamagotchi States ---
  const [roomTab, setRoomTab] = useState<"indoor" | "outdoor">("indoor");
  const [petMood, setPetMood] = useState<number>(80);
  const [petHunger, setPetHunger] = useState<number>(60);
  const [petEnergy, setPetEnergy] = useState<number>(75);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  const [speechBubble, setSpeechBubble] = useState<string>("");
  const [heartsEffect, setHeartsEffect] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bonesEffect, setBonesEffect] = useState<{ id: number; x: number; y: number }[]>([]);
  const [shibaActionState, setShibaActionState] = useState<"idle" | "chewing" | "happy">("idle");
  const [speechTimeoutId, setSpeechTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [petCooldown, setPetCooldown] = useState(false);

  // Load stats from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMood = localStorage.getItem("shiba_pet_mood");
      const savedHunger = localStorage.getItem("shiba_pet_hunger");
      const savedEnergy = localStorage.getItem("shiba_pet_energy");
      const savedSleep = localStorage.getItem("shiba_pet_sleep");
      if (savedMood) setPetMood(Number(savedMood));
      if (savedHunger) setPetHunger(Number(savedHunger));
      if (savedEnergy) setPetEnergy(Number(savedEnergy));
      if (savedSleep) setIsSleeping(savedSleep === "true");
    }
  }, []);

  // Slowly decrease stats or restore energy when sleeping (every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      setPetEnergy((prev) => {
        let newEnergy = prev;
        if (isSleeping) {
          newEnergy = Math.min(100, prev + 5);
        } else {
          newEnergy = Math.max(0, prev - 1);
        }
        localStorage.setItem("shiba_pet_energy", String(newEnergy));
        return newEnergy;
      });

      if (!isSleeping) {
        setPetHunger((prev) => {
          const newHunger = Math.max(0, prev - 1);
          localStorage.setItem("shiba_pet_hunger", String(newHunger));
          return newHunger;
        });
        setPetMood((prev) => {
          const newMood = Math.max(0, prev - 1);
          localStorage.setItem("shiba_pet_mood", String(newMood));
          return newMood;
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSleeping]);

  // Autoclear speech bubbles
  useEffect(() => {
    if (speechBubble) {
      if (speechTimeoutId) clearTimeout(speechTimeoutId);
      const id = setTimeout(() => {
        setSpeechBubble("");
      }, 5000);
      setSpeechTimeoutId(id);
    }
  }, [speechBubble]);

  const handleFeed = useCallback(async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isSleeping) {
      toast.error("Shiba đang ngủ say sưa rồi, đừng đánh thức bé nhé! 💤");
      return;
    }
    if (userStats.coins < 2) {
      toast.error("Cậu không đủ Xương rồi 🥺", {
        style: {
          background: "#FF8EAA",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "1rem",
        }
      });
      return;
    }

    const success = await deductCoins(2);
    if (success) {
      const boneId = Date.now();
      setBonesEffect((prev) => [...prev, { id: boneId, x: 0, y: 0 }]);
      setSpeechBubble("Măm măm... 😋");
      playAudioUrl("/sounds/brush.mp3");

      setTimeout(() => {
        setBonesEffect((prev) => prev.filter((b) => b.id !== boneId));
        setShibaActionState("chewing");

        setTimeout(() => {
          setShibaActionState("idle");
          setPetHunger((h) => {
            const newHunger = Math.min(100, h + 15);
            localStorage.setItem("shiba_pet_hunger", String(newHunger));
            return newHunger;
          });
          setPetMood((m) => {
            const newMood = Math.min(100, m + 5);
            localStorage.setItem("shiba_pet_mood", String(newMood));
            return newMood;
          });

          const heartId = Date.now();
          setHeartsEffect((prev) => [
            ...prev,
            { id: heartId + 1, x: -15, y: -20 },
            { id: heartId + 2, x: 0, y: -30 },
            { id: heartId + 3, x: 15, y: -15 },
          ]);

          setTimeout(() => {
            setHeartsEffect((prev) => prev.filter((h) => h.id < heartId || h.id > heartId + 3));
          }, 1200);

          setSpeechBubble("Gâu! Thức ăn ngon quá cậu ơi! ❤️");
          playAudioUrl("/sounds/success.mp3");
        }, 1500);

      }, 800);
    }
  }, [user, userStats.coins, isSleeping, deductCoins]);

  const handlePet = useCallback(() => {
    if (isSleeping) {
      toast.error("Shiba đang ngủ, vuốt ve nhẹ nhàng thôi kẻo bé thức giấc! 💤");
      return;
    }
    if (petCooldown) return;

    setPetCooldown(true);
    setTimeout(() => setPetCooldown(false), 3000);

    setShibaActionState("happy");
    setSpeechBubble("Hì hì, thích quá... Cậu gãi đúng chỗ ngứa rồi! 🥰");
    playAudioUrl("/sounds/bonk.mp3");

    setPetMood((m) => {
      const newMood = Math.min(100, m + 10);
      localStorage.setItem("shiba_pet_mood", String(newMood));
      return newMood;
    });

    const heartId = Date.now();
    setHeartsEffect((prev) => [
      ...prev,
      { id: heartId + 1, x: -20, y: -25 },
      { id: heartId + 2, x: 10, y: -35 },
      { id: heartId + 3, x: 20, y: -15 },
    ]);

    setTimeout(() => {
      setShibaActionState("idle");
      setHeartsEffect((prev) => prev.filter((h) => h.id < heartId || h.id > heartId + 3));
    }, 1200);

  }, [isSleeping, petCooldown]);

  const handleToggleSleep = useCallback(() => {
    setIsSleeping((prev) => {
      const nextSleep = !prev;
      localStorage.setItem("shiba_pet_sleep", String(nextSleep));
      if (nextSleep) {
        setSpeechBubble("Khò khò... Chúc cậu ngủ ngon nhé... 💤");
      } else {
        setSpeechBubble("Gâu! Tớ tỉnh dậy rồi đây! Sẵn sàng học tiếng Nhật cùng cậu! ☀️");
        playAudioUrl("/sounds/success.mp3");
      }
      return nextSleep;
    });
  }, []);

  const handleShibaClick = useCallback(() => {
    if (isSleeping) {
      setIsSleeping(false);
      localStorage.setItem("shiba_pet_sleep", "false");
      setSpeechBubble("Chào buổi sáng! Tớ đã nạp đầy năng lượng rồi! ⚡");
      playAudioUrl("/sounds/success.mp3");
      return;
    }

    const quotes = [
      "Cậu đã học từ vựng mới hôm nay chưa thế? 📚",
      "Tớ rất thích ở cạnh cậu đấy! 🥰",
      "Xoa đầu tớ đi, tớ sẽ tìm thêm xương cho cậu! 🐕",
      "Căn phòng này ấm áp ghê cậu nhỉ? 🏠",
      "Hôm nay là một ngày tuyệt vời để luyện Kanji đó! 🌸",
      "Gâu gâu! Có đồ ăn ngon gì cho tớ không? 🍖"
    ];
    const randQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechBubble(randQuote);
    playAudioUrl("/sounds/bonk.mp3");

    setShibaActionState("happy");
    setTimeout(() => setShibaActionState("idle"), 1000);
  }, [isSleeping]);

  // --- Trạng thái Thu hoạch Xương (Bones Harvest) ---
  const [storePendingBones, setStorePendingBones] = useState(0);
  const [demoPendingBones, setDemoPendingBones] = useState(120); // Xương giả lập khi chưa đăng nhập

  // Tự động tính toán giới hạn kéo thả Shiba dựa trên chiều cao cửa sổ trình duyệt
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateConstraints = () => {
        const height = window.innerHeight;
        const halfHeight = height / 2;
        setDragConstraints({
          top: -halfHeight + 100, // Cách mép trên 100px
          bottom: halfHeight - 160, // Cách mép dưới 160px để không che khuất thanh BottomNav
        });
      };
      updateConstraints();
      window.addEventListener("resize", updateConstraints);
      return () => window.removeEventListener("resize", updateConstraints);
    }
  }, []);

  // Tính số lượng xương tích lũy được dựa trên thời gian trôi qua và hiệu suất trang bị decor
  const calculatePending = useCallback(() => {
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
  }, [user, userStats.lastHarvestTime, userStats.equippedFurniture, userStats.buffDoubleBonesUntil, allItems]);

  // Cập nhật số xương tích lũy mỗi 5 giây (nếu đã đăng nhập)
  useEffect(() => {
    if (!user) return;
    setStorePendingBones(calculatePending());
    const interval = setInterval(() => {
      setStorePendingBones(calculatePending());
    }, 5000);
    return () => clearInterval(interval);
  }, [user, calculatePending]);

  // Tăng 1 xương mỗi 4 giây (khi chưa đăng nhập - chế độ Demo trải nghiệm)
  useEffect(() => {
    if (user) return;
    const interval = setInterval(() => {
      setDemoPendingBones((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Chọn số xương thực tế dựa trên việc đăng nhập
  const pendingBones = user ? storePendingBones : demoPendingBones;

  // Tính năng suất nhận xương mỗi giờ
  const totalBonesPerHour = useMemo(() => {
    if (!user) return 10; // Mặc định 10 xương/giờ đối với chế độ Demo
    return Object.values(userStats.equippedFurniture || {}).reduce(
      (sum: number, itemId: any) => {
        const item = allItems.find((i) => i.id === itemId);
        return sum + (item?.bonesPerHour || 0);
      },
      0
    );
  }, [user, userStats.equippedFurniture, allItems]);

  /**
   * Thu hoạch xương đã tích lũy
   */
  const handleHarvest = useCallback(async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

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
  }, [user, pendingBones, harvestBones]);

  // --- Mascot Animation & Style ---
  const shibaMascot = useMemo(() => {
    if (!user) {
      return {
        gif: "/images/mascot/shiba_room.gif",
        style: { bottom: "20%", left: "60%", width: "22%" },
      };
    }
    // const equippedFloor = userStats.equippedFurniture?.floor;
    // const floorItem = equippedFloor ? allItems.find((i) => i.id === equippedFloor) : null;
    // if (floorItem && floorItem.shibaMascotStyle) {
    //   return {
    //     gif: "/images/mascot/shiba_room.gif",
    //     style: floorItem.shibaMascotStyle,
    //   };
    // }
    if (roomTab === "indoor") {
      return {
        gif: "/images/mascot/shiba_room.gif",
        style: { bottom: "15%", left: "63%", width: "22%" },
      };
    }
    return {
      gif: "/images/mascot/shiba_room.gif",
      style: { bottom: "34%", right: "70%", width: "22%" },
    };
  }, [user, userStats.equippedFurniture, allItems, roomTab]);

  // --- Tính chỉ số và chỉ số cộng thêm (RPG Stats) ---
  const baseStats = userStats.baseStats || {
    hp: 150,
    atk: 25,
    def: 10,
    crit: 5,
  };

  const statsBonus = useMemo(() => {
    if (!user) {
      return { hp: 30, atk: 55, def: 25, crit: 10 }; // Chỉ số cộng thêm mặc định ở chế độ Demo
    }
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
  }, [user, userStats.equippedSlots, allItems]);

  // Chỉ số thực tế của Shiba (Base + Bonus)
  const totalHp = baseStats.hp + statsBonus.hp;
  const totalAtk = baseStats.atk + statsBonus.atk;
  const totalDef = baseStats.def + statsBonus.def;
  const totalCrit = baseStats.crit + statsBonus.crit;

  // Lấy danh sách vật phẩm tương ứng với tab đang chọn trong tủ đồ
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

  // Kiểm tra vật phẩm đã được mở khóa/sở hữu chưa
  const isItemUnlocked = (item: GachaItem) => {
    if (!user) {
      // Chế độ demo: coi như mở khóa các vật phẩm mặc định đang được trang bị
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

  // Kiểm tra vật phẩm có đang được trang bị không
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

  // Lọc danh sách vật phẩm hiển thị trong Grid (bao gồm các mảnh ghép đang có shards)
  const filteredGridItems = useMemo(() => {
    return activeGridItems.filter((item) => {
      const unlocked = isItemUnlocked(item);
      const shardsCount = userStats.shards?.[item.id] || 0;
      return unlocked || shardsCount > 0;
    });
  }, [activeGridItems, isItemUnlocked, userStats.shards]);

  // Hiệu ứng cánh hoa anh đào rơi trong phòng
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

    // Modal điều khiển UI phòng Shiba
    isShopOpen,
    setIsShopOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    filteredGridItems,

    // Tamagotchi UI exports
    roomTab,
    setRoomTab,
    petMood,
    petHunger,
    petEnergy,
    isSleeping,
    setIsSleeping,
    speechBubble,
    setSpeechBubble,
    heartsEffect,
    bonesEffect,
    shibaActionState,
    handleFeed,
    handlePet,
    handleToggleSleep,
    handleShibaClick,
  };
}
