"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Bone, Lock, Heart, Star, Info, X } from "lucide-react";
import { GACHA_POOL, RARITY_CONFIG, GachaRarity } from "@/constants/gachaPool";
import toast from "react-hot-toast";
import { Badge } from "./ui/badge";

const EGG_COLORS = [
  "from-[#FFB3C6] to-[#FFD1DC]", // Soft Pink
  "from-[#A0E8D5] to-[#C1F0E5]", // Soft Mint
  "from-[#90E0EF] to-[#B6F0F8]", // Soft Blue
  "from-[#D4C4FB] to-[#E2D6FC]", // Soft Lavender
  "from-[#FFD166] to-[#FFE099]", // Soft Orange/Yellow
];

// 20 quả trứng bù nhìn để tạo hiệu ứng lấp đầy máy
const DUMMY_CAPSULES = Array.from({ length: 20 }).map((_, i) => ({
  id: `cap_${i}`,
}));

export function GachaShop() {
  const { userStats, deductCoins, processGachaRoll, user } = useAppStore(
    (state: any) => state,
  );
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const capsulesRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [gachaState, setGachaState] = useState<"idle" | "twisting" | "anticipating" | "opened">(
    "idle",
  );
  const [rewardData, setRewardData] = useState<any>(null);
  const [isShaking, setIsShaking] = useState(false);
  const anticipatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
  const rollGacha = (currentPity: number) => {
    let rarity: GachaRarity = "common";
    const randRarity = Math.random() * 100;
    
    if (currentPity >= 49) {
      const pityRoll = Math.random() * 16;
      if (pityRoll < 0.1) rarity = "divine";
      else if (pityRoll < 1.1) rarity = "mythic";
      else if (pityRoll < 6.0) rarity = "legendary";
      else rarity = "epic";
    } else {
      let acc = 0;
      for (const r of ["divine", "mythic", "legendary", "epic", "rare", "common"] as GachaRarity[]) {
        acc += RARITY_CONFIG[r].dropRate;
        if (randRarity <= acc) {
          rarity = r;
          break;
        }
      }
    }

    const itemsInRarity = GACHA_POOL.filter(i => i.rarity === rarity);
    const selectedItem = itemsInRarity[Math.floor(Math.random() * itemsInRarity.length)];
    const isFullItem = Math.random() < RARITY_CONFIG[rarity].dropFullRate;

    const hasItem = (userStats.inventory || []).includes(selectedItem.id) || (userStats.furniture || []).includes(selectedItem.id);
    let duplicateFur = 0;
    if (hasItem) {
      const furValues = { common: 1, rare: 5, epic: 20, legendary: 100, mythic: 500, divine: 2000 };
      duplicateFur = isFullItem ? furValues[rarity] : Math.ceil(furValues[rarity] / selectedItem.shardTarget);
    }

    return { selectedItem, isFullItem, duplicateFur, rarity };
  };

  const handleTwist = async () => {
    if (gachaState !== "idle") return;

    // Xin quyền truy cập cảm biến gia tốc trên iOS 13+ (Apple bắt buộc phải có thao tác của người dùng)
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
      const { selectedItem, isFullItem, duplicateFur, rarity } = rollGacha(currentPity);

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

  return (
    <div className="w-full flex flex-col items-center pb-10">
      {/* THANH HIỂN THỊ TÀI SẢN (XƯƠNG & LÔNG VÀNG) */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-8 px-4 relative z-10">
        <div className="flex-1 bg-white border-2 border-pink-200 px-4 py-2 rounded-2xl shadow-sm flex flex-col items-center justify-center">
          <span className="font-bold text-pink-400 text-[10px] uppercase tracking-wider">Xương</span>
          <span className="font-black text-pink-600 text-lg flex items-center gap-1">
            {user ? userStats.coins : "?"} <Bone size={18} className="text-[#FFD166] fill-[#FFD166]" />
          </span>
        </div>
        <div className="flex-1 bg-white border-2 border-amber-200 px-4 py-2 rounded-2xl shadow-sm flex flex-col items-center justify-center">
          <span className="font-bold text-amber-400 text-[10px] uppercase tracking-wider">Lông Vàng</span>
          <span className="font-black text-amber-600 text-lg flex items-center gap-1">
            {user ? userStats.goldenFur || 0 : "?"} <span className="text-lg pb-0.5">🐕</span>
          </span>
        </div>
      </div>

      {/* =========================================
          POSTER BANNER (QUẢNG CÁO GACHA)
         ========================================= */}
      <div className="w-full max-w-[340px] bg-[#5390D9] rounded-3xl p-1.5 mb-[-4.5rem] relative z-0 shadow-[0_8px_0_0_#3A70B0] -rotate-2 hover:rotate-0 transition-transform duration-300">
        <div className="w-full h-full bg-gradient-to-br from-[#5390D9] to-[#3A70B0] rounded-[1.2rem] border-2 border-dashed border-white/40 p-4 pb-20 text-center relative overflow-hidden flex flex-col items-center">
          {/* Trang trí lấp lánh */}
          <Star size={16} className="text-[#FFD166] fill-[#FFD166] absolute top-4 left-4 animate-pulse" />
          <Star size={24} className="text-[#FFD166] fill-[#FFD166] absolute top-8 right-4 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />

          <Badge className="bg-[#FF9F1C] hover:bg-[#FF9F1C] text-white border-none mb-2 font-black px-3 py-1 shadow-sm">
            SỰ KIỆN HOT 🔥
          </Badge>
          <h3 className="text-white text-2xl font-black drop-shadow-md tracking-wider leading-tight mt-1" style={{ fontFamily: "var(--font-cherry)" }}>
            NINJA MÈO<br />XUẤT CHIÊU!
          </h3>
          <p className="text-blue-100 text-[11px] font-bold mt-2 uppercase tracking-wider bg-black/10 px-3 py-1.5 rounded-full">
            Tăng tỷ lệ x3 cho Set Đồ Ninja
          </p>
        </div>
      </div>

      {/* =========================================
          GIANT CUTE SHIBA GACHA MACHINE
         ========================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isShaking ? { opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] } : { opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center relative"
      >
        {/* NÚT THÔNG TIN TỶ LỆ [ i ] */}
        <button
          onClick={() => setIsInfoOpen(true)}
          className="absolute top-20 right-0 sm:-right-2 z-50 w-10 h-10 bg-white border-4 border-pink-200 rounded-full flex items-center justify-center text-pink-400 hover:text-pink-600 hover:bg-pink-50 shadow-sm active:translate-y-1 transition-all outline-none"
          title="Thông tin tỷ lệ rớt"
        >
          <Info size={20} strokeWidth={3} />
        </button>

        {/* --- CUTE SHIBA HEAD --- */}
        <div className="relative w-full z-10 flex flex-col items-center">
          {/* Nơ nhỏ dễ thương thay cho Ăng-ten */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-7 flex justify-center items-center gap-1 z-20">
            <div className="w-6 h-7 bg-pink-400 rounded-l-full border-2 border-white shadow-sm" />
            <div className="w-3.5 h-3.5 bg-white rounded-full z-10" />
            <div className="w-6 h-7 bg-pink-400 rounded-r-full border-2 border-white shadow-sm" />
          </div>

          {/* Ears */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-28">
            <div className="absolute left-6 top-2 w-[4.5rem] h-24 bg-[#FFD166] rounded-t-[3rem] rounded-b-xl -rotate-[25deg] border-4 border-white shadow-md overflow-hidden">
              <div className="absolute bottom-0 w-full h-1/2 bg-pink-100 border-t-4 border-white" />
            </div>
            <div className="absolute right-6 top-2 w-[4.5rem] h-24 bg-[#FFD166] rounded-t-[3rem] rounded-b-xl rotate-[25deg] border-4 border-white shadow-md overflow-hidden">
              <div className="absolute bottom-0 w-full h-1/2 bg-pink-100 border-t-4 border-white" />
            </div>
          </div>

          {/* Face Panel */}
          <div className="relative w-64 h-40 bg-[#FFD166] rounded-t-[4rem] rounded-b-[2rem] border-4 border-white shadow-lg flex flex-col items-center pt-12 overflow-hidden">
            {/* Má hồng dễ thương */}
            <div className="absolute top-16 left-7 w-9 h-9 bg-pink-200 rounded-full blur-[2px]" />
            <div className="absolute top-16 right-7 w-9 h-9 bg-pink-200 rounded-full blur-[2px]" />
            
            {/* Mắt tròn dễ thương */}
            <div className="flex gap-14 mt-1">
              <div className="w-6 h-6 bg-amber-950 rounded-full flex items-center justify-center border-2 border-white shadow-inner">
                <div className="w-2 h-2 bg-white rounded-full mt-[-6px] ml-[-6px]" />
              </div>
              <div className="w-6 h-6 bg-amber-950 rounded-full flex items-center justify-center border-2 border-white shadow-inner">
                <div className="w-2 h-2 bg-white rounded-full mt-[-6px] ml-[-6px]" />
              </div>
            </div>

            {/* Muzzle / Nose */}
            <div className="mt-5 w-24 h-14 bg-white rounded-t-full rounded-b-2xl border-4 border-white flex justify-center shadow-inner">
              <div className="w-6 h-3.5 bg-amber-950 rounded-b-full mt-1.5" />
            </div>
          </div>
        </div>

        {/* --- CUTE COLLAR & HEART BELL (TWIST BUTTON) --- */}
        <div className="relative z-40 w-72 h-12 bg-pink-400 rounded-full border-4 border-white shadow-md -mt-5 flex justify-center items-center gap-2 px-4">
          <Heart size={20} className="text-white fill-white animate-pulse" />
          <div className="relative group flex-grow">
            {!user ? (
              <button
                onClick={() => toast("Cần khởi động máy (Đăng nhập) để vặn chuông! 🔒", { icon: "🤖" })}
                className="w-full h-[4.5rem] bg-pink-200 rounded-full border-4 border-white shadow-[0_6px_0_0_#F8BBD0] active:translate-y-1 active:shadow-[0_0_0_0_#F8BBD0] transition-all flex items-center justify-center relative"
              >
                <Lock className="w-6 h-6 text-pink-500" strokeWidth={3} />
              </button>
            ) : (
              <button
                disabled={gachaState !== "idle" || userStats.coins < 10}
                onClick={handleTwist}
                className="w-full h-[4.5rem] bg-[#FBBF24] rounded-full border-4 border-white shadow-[0_6px_0_0_#B45309] hover:shadow-[0_8px_0_0_#B45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_0_0_0_#B45309] transition-all flex flex-col items-center justify-center group disabled:opacity-60 disabled:cursor-not-allowed outline-none relative overflow-hidden"
              >
                {/* Chi tiết hoa văn dễ thương trên chiếc chuông */}
                <motion.div 
                  animate={gachaState === "twisting" ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.8, ease: "linear", repeat: gachaState === "twisting" ? Infinity : 0 }}
                  className="w-full h-full relative flex items-center justify-center"
                >
                  <Star size={12} className="text-white fill-white absolute top-2 left-1/2 -translate-x-1/2" />
                  <div className="w-full h-1.5 bg-white absolute top-1/2 -translate-y-1/2" />
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1/2 translate-y-1 shadow-inner" />
                </motion.div>
              </button>
            )}
          </div>
          <Heart size={20} className="text-white fill-white animate-pulse" />
        </div>

        {/* --- BELLY (SOFT GLASS DOME) --- */}
        <div className="relative z-20 bg-pink-100 p-3.5 rounded-full border-4 border-white shadow-lg -mt-5">
          <div
            ref={sceneRef}
            className="w-72 h-72 bg-gradient-to-br from-pink-50/50 to-white/40 backdrop-blur-md rounded-full border-[10px] border-pink-50 shadow-[inset_0_0_30px_rgba(248,187,208,0.4)] relative overflow-hidden touch-none"
          >
            {/* Hiệu ứng kính chói sáng mềm mại */}
            <div className="absolute top-4 left-8 w-28 h-14 bg-white/70 rounded-full rotate-[-35deg] blur-[3px] pointer-events-none z-10" />
            
            {/* Trứng Gacha Dễ thương */}
            {DUMMY_CAPSULES.map((item, idx) => {
              const color = EGG_COLORS[idx % EGG_COLORS.length];
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    capsulesRef.current[item.id] = el;
                  }}
                  className={`absolute top-0 left-0 w-11 h-11 rounded-full bg-gradient-to-br ${color} shadow-[inset_-3px_-4px_8px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform border border-white/60`}
                >
                  <div className="absolute top-1.5 left-2 w-3.5 h-1.5 bg-white/60 rounded-full rotate-[-45deg]" />
                  <div className="w-full h-[1px] bg-white/30 absolute top-1/2 -translate-y-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* --- BASE (SOFT LEGS & DISPENSER) --- */}
        <div className="w-[19rem] bg-[#FFD166] border-4 border-white rounded-b-[3rem] shadow-lg p-5 pt-16 -mt-12 relative z-10 flex flex-col items-center">
          
          {/* Khe rớt trứng mềm mại */}
          <div className="w-28 h-16 bg-pink-50 rounded-t-2xl rounded-b-3xl shadow-[inset_0_4px_10px_rgba(248,187,208,0.5)] relative flex justify-center items-end pb-2 overflow-hidden border-2 border-white">
            <div className="absolute top-0 w-full h-4 bg-pink-100" />
            <AnimatePresence>
              {(gachaState === "twisting" || gachaState === "opened") && (
                <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.2 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#FFD166] shadow-md relative flex items-center justify-center border border-white/50"
                />
              )}
            </AnimatePresence>
          </div>

          {/* THÔNG TIN VÀ THANH BẢO HIỂM (PITY) */}
          <div className="w-full bg-white rounded-2xl p-4 text-center mt-6 shadow-inner border-2 border-pink-100 flex flex-col gap-3">
            <div>
              <p className="text-yellow-600 font-black text-xs uppercase tracking-widest mb-1"
                style={{fontFamily: "var(--font-cherry)"}}
              >
                Giá 1 Lần Vặn
              </p>
              <h4 className="text-lg text-yellow-600 font-bold tracking-wider flex justify-center items-center gap-1.5"
                style={{fontFamily: "var(--font-cherry)"}}
              >
                10 <Bone size={20} className="fill-yellow-500 text-yellow-500" />
              </h4>
            </div>

            {/* THANH PITY */}
            {(() => {
              const pityCounter = userStats?.pityCounter || 0;
              const pityRemaining = Math.max(50 - pityCounter, 0);
              const pityPercent = Math.min((pityCounter / 50) * 100, 100);

              return (
                <div className="w-full bg-orange-50 rounded-2xl p-3 border-2 border-orange-100 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-1.5 relative z-10">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider"
                      style={{fontFamily: "var(--font-cherry)"}}
                    >
                      Bảo hiểm
                    </span>
                    <span className="text-sm font-black text-[#FF9F1C]"
                      style={{fontFamily: "var(--font-cherry)"}}
                    >
                      {pityCounter}/50
                    </span>
                  </div>
                  <div className="w-full h-4 bg-orange-200/50 rounded-full overflow-hidden relative z-10 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${pityPercent}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 1 }}
                    >
                      <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, #fff 8px, #fff 16px)" }} />
                    </motion.div>
                  </div>
                  <p className="text-xs font-bold text-orange-500 mt-2 relative z-10"
                    style={{fontFamily: "var(--font-cherry)"}}
                  >
                    Còn {pityRemaining} lần chắc chắn nhận EPIC!
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* POPUP THÔNG TIN TỶ LỆ */}
      <AnimatePresence>
        {isInfoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsInfoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#FFFDF5] border-4 border-[#FF7096] rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsInfoOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors"
              >
                <X size={18} strokeWidth={3} className="pointer-events-none" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl text-[#FF7096] drop-shadow-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                  Bảng Tỷ Lệ Rớt
                </h3>
              </div>

              <div className="flex flex-col gap-2 font-rounded font-bold text-sm">
                <div className="flex justify-between items-center bg-zinc-100 px-4 py-2.5 rounded-2xl text-zinc-600 border border-zinc-200">
                  <span className="flex items-center gap-2"><span className="text-lg">⚪</span> Common</span>
                  <span className="text-base">{RARITY_CONFIG.common.dropRate}%</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-2xl text-blue-600 border border-blue-100">
                  <span className="flex items-center gap-2"><span className="text-lg">🔵</span> Rare</span>
                  <span className="text-base">{RARITY_CONFIG.rare.dropRate}%</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50 px-4 py-2.5 rounded-2xl text-purple-600 border border-purple-100">
                  <span className="flex items-center gap-2"><span className="text-lg">🟣</span> Epic</span>
                  <span className="text-base">{RARITY_CONFIG.epic.dropRate}%</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 px-4 py-2.5 rounded-2xl text-yellow-600 border border-yellow-200">
                  <span className="flex items-center gap-2"><span className="text-lg">🟡</span> Legendary</span>
                  <span className="text-base">{RARITY_CONFIG.legendary.dropRate}%</span>
                </div>
                <div className="flex justify-between items-center bg-red-50 px-4 py-2.5 rounded-2xl text-red-500 border border-red-100">
                  <span className="flex items-center gap-2"><span className="text-lg">🔴</span> Mythic</span>
                  <span className="text-base">{RARITY_CONFIG.mythic.dropRate}%</span>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50 px-4 py-2.5 rounded-2xl text-slate-700 border border-slate-200 shadow-inner">
                  <span className="flex items-center gap-2"><span className="text-lg">🌈</span> Divine</span>
                  <span className="text-base">{RARITY_CONFIG.divine.dropRate}%</span>
                </div>
              </div>

              <div className="mt-5 p-3 bg-orange-50 border-2 border-orange-100 rounded-2xl text-center">
                <p className="text-[11px] font-bold text-orange-600 leading-relaxed">
                  * Vật phẩm bạn đã sở hữu sẽ tự động được phân rã thành <strong className="text-[#FF9F1C]">Lông Shiba Vàng</strong> nhé! 🐕
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP PHẦN THƯỞNG */}
      <AnimatePresence>
        {/* TRẠNG THÁI CHỜ HỒI HỘP */}
        {gachaState === "anticipating" && rewardData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={handleOpenGacha}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="relative flex flex-col items-center justify-center"
            >
               <div className={`absolute inset-0 scale-150 blur-3xl opacity-60 rounded-full animate-pulse ${
                 rewardData.rarity === "divine" ? "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" :
                 rewardData.rarity === "legendary" ? "bg-yellow-400" :
                 rewardData.rarity === "epic" ? "bg-purple-500" :
                 rewardData.rarity === "rare" ? "bg-blue-400" : "bg-white"
               }`} />
               <div className={`w-28 h-28 bg-gradient-to-br rounded-full border-4 border-white relative z-10 flex items-center justify-center overflow-hidden ${
                 rewardData.rarity === "divine" ? "from-red-500 via-yellow-500 to-blue-500 shadow-[0_0_40px_rgba(239,68,68,0.8)]" :
                 rewardData.rarity === "legendary" ? "from-yellow-300 to-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.8)]" :
                 rewardData.rarity === "epic" ? "from-purple-400 to-purple-600 shadow-[0_0_40px_rgba(168,85,247,0.8)]" :
                 rewardData.rarity === "rare" ? "from-blue-300 to-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.8)]" : 
                 "from-zinc-200 to-zinc-400 shadow-[0_0_40px_rgba(212,212,216,0.8)]"
               }`}>
                  <div className="w-full h-[2px] bg-white/50 absolute top-1/2 -translate-y-1/2" />
                  <div className="w-6 h-6 bg-white/50 rounded-full absolute top-1/2 -translate-y-1/2 shadow-inner" />
               </div>
               
               <p className="mt-8 text-white/70 font-bold tracking-widest text-sm animate-pulse relative z-10">NHẤN ĐỂ MỞ</p>
            </motion.div>
          </motion.div>
        )}

        {/* TRẠNG THÁI HIỂN THỊ KẾT QUẢ */}
        {gachaState === "opened" && rewardData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 260, damping: 20 },
              }}
              className="bg-white border-4 border-pink-200 rounded-[2.5rem] p-6 max-w-[300px] w-full text-center shadow-[0_0_30px_rgba(248,187,208,0.3)] relative flex flex-col items-center"
            >
              {/* Trang trí lấp lấp xung quanh phần thưởng */}
              <Star size={16} className="text-amber-400 fill-amber-400 absolute top-4 left-4" />
              <Star size={16} className="text-pink-400 fill-pink-400 absolute bottom-12 right-6" />

              <h3 className="text-2xl text-pink-700 mb-4 font-black tracking-wide" style={{ fontFamily: "var(--font-cherry)" }}>
                {rewardData.duplicateFur > 0 ? "BÙI NGÙI..." : rewardData.unlocked ? "CHÚC MỪNG!" : "TÍCH LŨY!"}
              </h3>
              <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center border-4 border-pink-100 shadow-[inset_0_0_15px_rgba(248,187,208,0.4)] mb-4 relative">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-7xl drop-shadow-[0_0_10px_rgba(255,112,150,0.2)]"
                >
                  {rewardData.item.emoji}
                </motion.span>
                {!rewardData.isFullItem && (
                   <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white font-bold text-xs px-2 py-1 rounded-full border-2 border-white shadow-sm">
                      Mảnh {rewardData.shardsNow}/{rewardData.item.shardTarget}
                   </div>
                )}
              </div>
              <Badge className={`mb-2 text-white border-none shadow-[0_0_8px_rgba(0,0,0,0.3)] ${
                  rewardData.rarity === "divine" ? "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" :
                  rewardData.rarity === "legendary" ? "bg-yellow-400" :
                  rewardData.rarity === "epic" ? "bg-purple-500" :
                  rewardData.rarity === "rare" ? "bg-blue-400" : "bg-zinc-400"
              }`}>
                {rewardData.rarity.toUpperCase()}
              </Badge>
              <h4 className="text-lg font-bold text-pink-900 mb-1">
                {rewardData.item.name}
              </h4>
              <p className="text-sm font-bold text-zinc-500 mb-6">
                {rewardData.duplicateFur > 0 ? (
                  <>Đã sở hữu! Phân rã thành <span className="text-[#FF9F1C]">{rewardData.duplicateFur} Lông Vàng</span> 🐕</>
                ) : rewardData.unlocked ? (
                  <>Đã ghép thành công vật phẩm! 🎉</>
                ) : (
                  <>Cố lên! Bạn cần thêm mảnh để ghép.</>
                )}
              </p>
              <button
                onClick={() => {
                  setGachaState("idle");
                  setRewardData(null);
                }}
                className="w-full bg-pink-500 hover:bg-pink-400 text-white font-black py-3.5 rounded-2xl border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 transition-all"
              >
                THU THẬP
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}