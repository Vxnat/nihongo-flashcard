import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GACHA_POOL, RARITY_CONFIG, GachaRarity, GachaItem, DUPLICATE_FUR_VALUES } from "@/constants/gachaPool";
import toast from "react-hot-toast";
import { GachaResultItem } from "@/components/shiba-room/GachaMultiResultModal";

// 20 quả trứng bù nhìn để tạo hiệu ứng lấp đầy máy
const DUMMY_CAPSULES = Array.from({ length: 30 }).map((_, i) => ({
  id: `cap_${i}`,
}));

const FALLBACK_TYPE_WEIGHTS: Record<string, number> = {
  theme: 10,
  outfit: 25,
  furniture: 50,
  voice: 60,
  meme: 80,
  sticker: 100,
};

// Module-level cache: loaded once, shared across all hook instances
let _cachedTypeWeights: Record<string, number> | null = null;
let _fetchPromise: Promise<void> | null = null;

const loadTypeWeights = () => {
  if (_cachedTypeWeights) return;
  if (_fetchPromise) return;
  _fetchPromise = fetch("/data/configs/gacha_type_weights.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load type weights");
      return res.json();
    })
    .then(data => {
      _cachedTypeWeights = data;
    })
    .catch(err => {
      console.warn("Không tải được gacha_type_weights.json, dùng giá trị mặc định:", err);
      _cachedTypeWeights = FALLBACK_TYPE_WEIGHTS;
    });
};

const getTypeWeights = (): Record<string, number> => {
  return _cachedTypeWeights || FALLBACK_TYPE_WEIGHTS;
};

const getItemWeight = (item: any) => {
  if (item.weight !== undefined && item.weight !== null) return item.weight;
  return getTypeWeights()[item.type] ?? 100;
};

export function useGachaShop() {
  const { userStats, deductCoins, processGachaRoll, user } = useAppStore(
    (state: any) => state,
  );
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const capsulesRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [gachaState, setGachaState] = useState<"idle" | "twisting" | "anticipating" | "opened" | "multi_opened">(
    "idle",
  );
  const [twistType, setTwistType] = useState<'single' | 'multi' | null>(null);
  const [rewardData, setRewardData] = useState<GachaResultItem | null>(null);
  const [multiRewardData, setMultiRewardData] = useState<GachaResultItem[] | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const anticipatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Tải type weights từ JSON khi hook được mount
  useEffect(() => {
    loadTypeWeights();
  }, []);

  // Khởi tạo máy Gacha (Matter.js) - Giữ nguyên logic vật lý
  useEffect(() => {
    if (typeof window === "undefined" || !sceneRef.current) return;

    let engine: any;
    let runner: any;
    let handleOrientation: (event: DeviceOrientationEvent) => void;

    const initMatter = async () => {
      const MatterModule = await import("matter-js");
      const Matter = MatterModule.default || MatterModule;

      engine = Matter.Engine.create();
      engineRef.current = engine;
      const world = engine.world;
      const width = 288;
      const height = 288;

      const wallOpts = { isStatic: true, render: { visible: false } };
      Matter.World.add(world, [
        Matter.Bodies.rectangle(width / 2, height + 25, width, 50, wallOpts), // floor
        Matter.Bodies.rectangle(width / 2, -25, width, 50, wallOpts), // ceiling
        Matter.Bodies.rectangle(-25, height / 2, 50, height * 2, wallOpts), // left
        Matter.Bodies.rectangle(
          width + 25,
          height / 2,
          50,
          height * 2,
          wallOpts,
        ), // right
        Matter.Bodies.rectangle(20, height, 150, 20, {
          ...wallOpts,
          angle: Math.PI / 6,
        }), // slopeL
        Matter.Bodies.rectangle(width - 20, height, 150, 20, {
          ...wallOpts,
          angle: -Math.PI / 6,
        }), // slopeR
      ]);

      const bodies = DUMMY_CAPSULES.map((item, idx) => {
        const x = 50 + (idx % 4) * 40 + Math.random() * 20;
        const y = 40 + Math.random() * 40;
        const body = Matter.Bodies.circle(x, y, 22, {
          restitution: 0.8,
          friction: 0.005,
          density: 0.04,
        });
        body.label = item.id;
        return body;
      });
      Matter.World.add(world, bodies);

      const mouse = Matter.Mouse.create(sceneRef.current!);
      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      mouse.element.removeEventListener(
        "mousewheel",
        (mouse as any).mousewheel,
      );
      mouse.element.removeEventListener(
        "DOMMouseScroll",
        (mouse as any).mousewheel,
      );
      Matter.World.add(world, mouseConstraint);

      Matter.Events.on(engine, "afterUpdate", () => {
        bodies.forEach((body) => {
          const el = capsulesRef.current[body.label];
          if (el)
            el.style.transform = `translate(${body.position.x - 22}px, ${body.position.y - 22}px) rotate(${body.angle}rad)`;
        });
      });

      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      // Lắng nghe sự kiện nghiêng điện thoại (Gyroscope)
      handleOrientation = (event: DeviceOrientationEvent) => {
        if (!engineRef.current) return;
        const currentEngine = engineRef.current;
        const gravity = currentEngine.gravity || currentEngine.world.gravity;

        const gamma = event.gamma || 0; // Trục Trái/Phải [-90 đến 90]
        const beta = event.beta || 0; // Trục Trước/Sau [-180 đến 180]

        // Tính toán lại trọng lực theo góc nghiêng (giới hạn an toàn từ -1 đến 1)
        gravity.x = Math.max(-1, Math.min(1, gamma / 45));
        gravity.y = Math.max(-1, Math.min(1, beta / 45));
      };

      if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    initMatter();

    return () => {
      if (handleOrientation && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
      if (runner) {
        const MatterModule = require("matter-js");
        MatterModule.Runner.stop(runner);
      }
      if (engine) {
        const MatterModule = require("matter-js");
        MatterModule.Engine.clear(engine);
      }
    };
  }, []);

  // MỞ NHANH QUẢ TRỨNG (BỎ QUA THỜI GIAN CHỜ)
  const handleOpenGacha = () => {
    if (anticipatingTimeoutRef.current) {
      clearTimeout(anticipatingTimeoutRef.current);
      anticipatingTimeoutRef.current = null;
    }
    setGachaState("opened");
    import("canvas-confetti").then((confetti) => {
      confetti.default({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 2000 });
    });
  };

  // LOGIC THUẬT TOÁN QUAY GACHA
  const rollGacha = (currentPity: number, luckyRollsLeft: number) => {
    let rarity: GachaRarity = "common";
    const randRarity = Math.random() * 100;
    const hasLuckyTalisman = luckyRollsLeft > 0;

    if (currentPity >= 49) {
      const pityRoll = Math.random() * 100;
      if (pityRoll < 0.5) rarity = "divine";
      else if (pityRoll < 3.0) rarity = "mythic";
      else if (pityRoll < 15.0) rarity = "legendary";
      else rarity = "epic";
    } else {
      let acc = 0;
      const rates: Record<GachaRarity, number> = hasLuckyTalisman ? {
        divine: 0.2,
        mythic: 1.4,
        legendary: 9.4,
        epic: 10,
        rare: 24,
        common: 55,
      } : {
        divine: RARITY_CONFIG.divine.dropRate,
        mythic: RARITY_CONFIG.mythic.dropRate,
        legendary: RARITY_CONFIG.legendary.dropRate,
        epic: RARITY_CONFIG.epic.dropRate,
        rare: RARITY_CONFIG.rare.dropRate,
        common: RARITY_CONFIG.common.dropRate,
      };

      for (const r of ["divine", "mythic", "legendary", "epic", "rare", "common"] as GachaRarity[]) {
        acc += rates[r];
        if (randRarity <= acc) {
          rarity = r;
          break;
        }
      }
    }

    const itemsInRarity = GACHA_POOL.filter(i => i.rarity === rarity);
    let selectedItem = itemsInRarity[0];
    
    if (itemsInRarity.length > 0) {
      const totalWeight = itemsInRarity.reduce((sum, item) => sum + getItemWeight(item), 0);
      let rand = Math.random() * totalWeight;
      for (const item of itemsInRarity) {
        const w = getItemWeight(item);
        if (rand < w) {
          selectedItem = item;
          break;
        }
        rand -= w;
      }
    }

    const isFullItem = Math.random() < RARITY_CONFIG[rarity].dropFullRate;

    const hasItem =
      (userStats.inventory || []).includes(selectedItem.id) ||
      (userStats.furniture || []).includes(selectedItem.id) ||
      (userStats.unlockedMemes || []).includes(selectedItem.id) ||
      (userStats.unlockedVoices || []).includes(selectedItem.id);
    let duplicateFur = 0;
    if (hasItem) {
      duplicateFur = isFullItem ? DUPLICATE_FUR_VALUES[rarity] : Math.ceil(DUPLICATE_FUR_VALUES[rarity] / selectedItem.shardTarget);
    }

    return { selectedItem, isFullItem, duplicateFur, rarity };
  };

  const handleTwist = async () => {
    if (gachaState !== "idle") return;

    // Xin quyền truy cập cảm biến gia tốc trên iOS 13+
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        await (DeviceOrientationEvent as any).requestPermission();
      } catch (err) {
        console.warn("Không thể lấy quyền cảm biến nghiêng:", err);
      }
    }

    // Kiểm tra & Trừ tiền
    const success = await deductCoins(10);
    if (!success) {
      toast.error("Không đủ Xương! Hãy làm Nhiệm vụ nhé 🥺", { icon: "🦴" });
      return;
    }

    setTwistType('single');
    setGachaState("twisting");
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); // Rung máy quay 0.5s

    // Lắc lồng kính
    if (engineRef.current) {
      import("matter-js").then((MatterModule) => {
        const Matter = MatterModule.default || MatterModule;
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        bodies.forEach((body: any) => {
          if (!body.isStatic) {
            const force = 0.06 * body.mass;
            Matter.Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * force,
              y: -force * (Math.random() * 0.5 + 0.8),
            });
          }
        });
      });
    }

    // Đợi hiệu ứng rớt trứng rồi chốt kết quả
    setTimeout(async () => {
      const currentPity = userStats.pityCounter || 0;
      const luckyRollsLeft = userStats.buffLuckyGachaRolls || 0;
      const { selectedItem, isFullItem, duplicateFur, rarity } = rollGacha(currentPity, luckyRollsLeft);

      // Đặt lại bảo hiểm nếu ra đồ xịn
      let newPity = currentPity + 1;
      if (["epic", "legendary", "mythic", "divine"].includes(rarity)) {
        newPity = 0;
      }

      // Cập nhật State
      const { unlocked, shardsNow } = await processGachaRoll(selectedItem, isFullItem, duplicateFur, newPity);

      setRewardData({
        item: selectedItem,
        isFullItem,
        duplicateFur,
        unlocked,
        shardsNow,
        rarity
      });

      setGachaState("anticipating"); // Màn hình nhấp nháy phát sáng chờ mở

      anticipatingTimeoutRef.current = setTimeout(() => {
        setGachaState("opened");
        import("canvas-confetti").then((confetti) => {
          confetti.default({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 2000 });
        });
      }, 2000);
    }, 1500);
  };

  const handleMultiRoll = async (count: number) => {
    const cost = 90; // Hardcoded for 10 rolls
    if (gachaState !== "idle" || !user || userStats.coins < cost) {
      return;
    }

    // Request permission for gyroscope, same as handleTwist
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        await (DeviceOrientationEvent as any).requestPermission();
      } catch (err) {
        console.warn("Không thể lấy quyền cảm biến nghiêng:", err);
      }
    }

    // Deduct coins
    const success = await deductCoins(cost);
    if (!success) {
      toast.error("Không đủ Xương! Hãy làm Nhiệm vụ nhé 🥺", { icon: "🦴" });
      return;
    }

    // Trigger animation
    setTwistType('multi');
    setGachaState("twisting");
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // Shake capsules
    if (engineRef.current) {
      import("matter-js").then((MatterModule) => {
        const Matter = MatterModule.default || MatterModule;
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        bodies.forEach((body: any) => {
          if (!body.isStatic) {
            const force = 0.08 * body.mass; // A bit stronger for multi-roll
            Matter.Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * force,
              y: -force * (Math.random() * 0.5 + 1),
            });
          }
        });
      });
    }

    // Wait for animation then process rolls
    setTimeout(async () => {
      let tempPity = userStats.pityCounter || 0;
      let luckyRollsLeft = userStats.buffLuckyGachaRolls || 0;
      const rollResultsForUI: Omit<GachaResultItem, 'unlocked' | 'shardsNow'>[] = [];
      const itemsToProcess: { selectedItem: GachaItem, isFullItem: boolean, duplicateFur: number }[] = [];

      // 1. Calculate all 10 rolls and their results first
      for (let i = 0; i < count; i++) {
        const { selectedItem, isFullItem, duplicateFur, rarity } = rollGacha(tempPity, luckyRollsLeft);
        if (luckyRollsLeft > 0) luckyRollsLeft--;
        rollResultsForUI.push({ item: selectedItem, isFullItem, duplicateFur, rarity });
        itemsToProcess.push({ selectedItem, isFullItem, duplicateFur });

        // Update pity for the next roll in this batch
        tempPity++;
        if (["epic", "legendary", "mythic", "divine"].includes(rarity)) {
          tempPity = 0;
        }
      }

      // 2. Process all items and update state in a batch.
      const finalPity = tempPity;
      const processedResultsForUI: GachaResultItem[] = await Promise.all(itemsToProcess.map(async (item, i) => {
        const pityForThisCall = (i === itemsToProcess.length - 1) ? finalPity : (userStats.pityCounter || 0) + i + 1;
        const { unlocked, shardsNow } = await processGachaRoll(item.selectedItem, item.isFullItem, item.duplicateFur, pityForThisCall);
        return { ...rollResultsForUI[i], unlocked, shardsNow };
      }));

      // 3. Set state to show the results screen
      setMultiRewardData(processedResultsForUI);
      setGachaState("multi_opened");
    }, 1500);
  };

  // Tự động phát âm thanh của Voice Pack khi lật mở
  useEffect(() => {
    if (gachaState === "opened" && rewardData && rewardData.item.type === "voice" && rewardData.item.audioUrl) {
      const audio = new Audio(`${rewardData.item.audioUrl}`);
      audio.volume = 0.6;
      audio.play().catch((err) => console.warn("Failed to play preview voice:", err));
    }
  }, [gachaState, rewardData]);

  return {
    userStats,
    user,
    sceneRef,
    capsulesRef,
    gachaState,
    setGachaState,
    twistType,
    setTwistType,
    rewardData,
    setRewardData,
    multiRewardData,
    setMultiRewardData,
    isShaking,
    isInfoOpen,
    setIsInfoOpen,
    handleOpenGacha,
    handleTwist,
    handleMultiRoll,
    DUMMY_CAPSULES,
  };
}
