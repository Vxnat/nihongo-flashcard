"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Coins, Lock } from "lucide-react";
import { GACHA_POOL } from "@/constants/gachaPool";
import toast from "react-hot-toast";
import { Badge } from "./ui/badge";

const EGG_COLORS = [
  "from-[#FF7096] to-[#FFB3C6]", // Pink
  "from-[#06D6A0] to-[#A0E8D5]", // Mint
  "from-[#5390D9] to-[#90E0EF]", // Blue
  "from-[#B28DFF] to-[#D4C4FB]", // Purple
  "from-[#FF9F1C] to-[#FFD166]", // Orange/Yellow
];

// 20 quả trứng bù nhìn để tạo hiệu ứng lấp đầy máy
const DUMMY_CAPSULES = Array.from({ length: 20 }).map((_, i) => ({
  id: `cap_${i}`,
}));

export function GachaShop() {
  const { userStats, deductCoins, unlockSticker, user } = useAppStore(
    (state: any) => state,
  );
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const capsulesRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [gachaState, setGachaState] = useState<"idle" | "twisting" | "opened">(
    "idle",
  );
  const [reward, setReward] = useState<any>(null);

  // Khởi tạo máy Gacha (Matter.js)
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
      const width = 256;
      const height = 256;

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
      toast.error("Không đủ Xu! Hãy làm Nhiệm vụ nhé 🥺", { icon: "🪙" });
      return;
    }

    setGachaState("twisting");

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
    setTimeout(() => {
      const randomItem =
        GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)];
      setReward(randomItem);
      setGachaState("opened");

      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          zIndex: 2000,
        });
      });
    }, 1500);
  };

  const handleClaimReward = () => {
    if (reward) unlockSticker(reward.id);
    setGachaState("idle");
    setReward(null);
  };

  // Lọc ra các sticker user đã sở hữu
  const ownedStickers = GACHA_POOL.filter((s) =>
    userStats.inventory.includes(s.id),
  );

  return (
    <div className="w-full flex flex-col items-center pb-10">
      {/* Thanh hiển thị tài sản */}
      <div className="bg-white border-2 border-orange-200 px-6 py-2 rounded-full shadow-sm flex items-center gap-2 mb-6">
        <span className="font-bold text-amber-900 text-sm">Số dư:</span>
        <span className="font-black text-[#FF9F1C] text-lg flex items-center gap-1">
          {user ? userStats.coins : "?"}{" "}
          <Coins size={20} className="text-[#FFD166] fill-[#FFD166]" />
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* LỒNG KÍNH GACHA */}
        <div
          ref={sceneRef}
          className="w-64 h-64 bg-gradient-to-b from-blue-100/50 to-white/60 backdrop-blur-md border-[12px] border-b-0 border-[#FFE2D1] rounded-t-full relative overflow-hidden shadow-inner touch-none"
        >
          <div className="absolute top-4 left-6 w-20 h-10 bg-white/70 rounded-full rotate-[-30deg] blur-[2px] pointer-events-none z-10" />
          {DUMMY_CAPSULES.map((item, idx) => {
            const color = EGG_COLORS[idx % EGG_COLORS.length];
            return (
              <div
                key={item.id}
                ref={(el) => {
                  capsulesRef.current[item.id] = el;
                }}
                className={`absolute top-0 left-0 w-11 h-11 rounded-full bg-gradient-to-br ${color} shadow-[inset_-2px_-4px_6px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform`}
              >
                <div className="absolute top-1.5 left-2 w-3 h-1.5 bg-white/50 rounded-full rotate-[-45deg]" />
              </div>
            );
          })}
        </div>

        {/* THÂN MÁY GACHA */}
        <div className="w-full bg-[#FFD166] border-[12px] border-[#FFE2D1] rounded-[3rem] shadow-[0_15px_0_0_#e6bc5c] p-6 relative z-10 flex flex-col items-center">
          <div className="w-full bg-[#FFFDF5] border-4 border-[#FF9F1C] rounded-[1.5rem] p-4 text-center mb-6 shadow-inner">
            <p className="text-[#FF9F1C] font-black text-xs uppercase tracking-widest mb-1">
              Máy Quay Trứng
            </p>
            <h4
              className="text-xl text-amber-900 font-bold"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              10 Xu / Lần
            </h4>
          </div>

          {!user ? (
            <button
              onClick={() =>
                toast("Hãy đăng nhập để kiếm Xu và quay Gacha nhé! 🔒", {
                  icon: "🥺",
                })
              }
              className="w-28 h-28 bg-zinc-200 rounded-full border-4 border-white shadow-[0_10px_0_0_#d4d4d8] hover:shadow-[0_12px_0_0_#d4d4d8] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0_0_0_#d4d4d8] transition-all flex flex-col items-center justify-center outline-none"
            >
              <Lock className="w-8 h-8 text-zinc-400 mb-1" strokeWidth={3} />
              <span
                className="text-zinc-400 font-black text-sm drop-shadow-sm"
                style={{
                  fontFamily: "var(--font-cherry)",
                  letterSpacing: "1px",
                }}
              >
                KHÓA
              </span>
            </button>
          ) : (
            <button
              disabled={gachaState !== "idle" || userStats.coins < 10}
              onClick={handleTwist}
              className="w-28 h-28 bg-[#FF7096] rounded-full border-4 border-white shadow-[0_10px_0_0_#C7486B] hover:shadow-[0_12px_0_0_#C7486B] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0_0_0_#C7486B] transition-all flex items-center justify-center group disabled:opacity-60 disabled:cursor-not-allowed outline-none"
            >
              <div
                className={`w-16 h-16 bg-white/20 rounded-full flex items-center justify-center relative transition-transform ${gachaState === "twisting" ? "rotate-[720deg] duration-1000 ease-in-out" : "group-active:-rotate-45 duration-300"}`}
              >
                <span
                  className="text-white font-black text-lg drop-shadow-md z-10"
                  style={{
                    fontFamily: "var(--font-cherry)",
                    letterSpacing: "1px",
                  }}
                >
                  VẶN
                </span>
              </div>
            </button>
          )}

          {/* KHE RỚT */}
          <div className="mt-6 w-24 h-12 bg-black/10 rounded-t-2xl rounded-b-[2rem] shadow-inner relative flex justify-center items-end pb-1.5 overflow-hidden">
            <div className="absolute top-0 w-full h-4 bg-black/20" />
            <AnimatePresence>
              {(gachaState === "twisting" || gachaState === "opened") && (
                <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: "spring",
                    bounce: 0.5,
                    duration: 0.8,
                    delay: 0.2,
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#FFD166] shadow-sm relative flex items-center justify-center"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* TỦ ĐỒ STICKER */}
      <div className="w-full max-w-md mt-10 px-4">
        <h3
          className={`text-xl mb-4 text-center ${user ? "text-[#5390D9]" : "text-zinc-400"}`}
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          {user ? "Tủ Đồ Của Bạn" : "Tủ Đồ (Đã khóa)"}
        </h3>
        <div className="grid grid-cols-4 gap-3 bg-white/60 p-4 rounded-3xl border-2 border-white relative overflow-hidden">
          {!user && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center rounded-3xl">
              <Lock className="w-8 h-8 text-zinc-400 mb-2" strokeWidth={2.5} />
              <span className="font-rounded font-bold text-zinc-500 text-sm bg-white px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                Đăng nhập để xem
              </span>
            </div>
          )}
          {GACHA_POOL.map((sticker) => {
            const isOwned = userStats.inventory.includes(sticker.id);
            return (
              <div
                key={sticker.id}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all ${isOwned ? "bg-white border-2 border-[#5390D9]/30 shadow-sm hover:scale-105 cursor-pointer" : "bg-zinc-100 border-2 border-dashed border-zinc-200 opacity-60"}`}
                title={sticker.name}
              >
                <span className="text-3xl drop-shadow-sm mb-1">
                  {isOwned ? sticker.emoji : "❓"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP PHẦN THƯỞNG */}
      <AnimatePresence>
        {gachaState === "opened" && reward && (
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
              className="bg-[#FDFBF7] border-4 border-[#FFD166] rounded-[2.5rem] p-6 max-w-[300px] w-full text-center shadow-2xl relative flex flex-col items-center"
            >
              <h3
                className="text-2xl text-[#FF9F1C] mb-4"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Wow! Trúng rồi!
              </h3>
              <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner mb-4 relative">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-7xl drop-shadow-md"
                >
                  {reward.emoji}
                </motion.span>
              </div>
              <Badge className="mb-2 bg-[#FF7096] text-white border-none">
                {reward.rarity.toUpperCase()}
              </Badge>
              <h4 className="text-lg font-bold text-amber-900 mb-6">
                {reward.name}
              </h4>
              <button
                onClick={handleClaimReward}
                className="w-full bg-[#06D6A0] hover:bg-[#05b889] text-white font-bold py-3.5 rounded-2xl border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all"
              >
                Cất vào tủ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
