"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bone, LifeBuoy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export interface ShibaMasterOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  cost: number;
  allowFreeHint?: boolean;
  colorClass: string;
  onConfirm: () => void | Promise<void>;
}

interface ShibaMasterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  options: ShibaMasterOption[];
  message?: string;
  avatarSrc?: string;
}

export function ShibaMasterDialog({ 
  isOpen, 
  onClose, 
  options, 
  message = "Sao thế đồ đệ? Rơi mất nét nào rồi à? Đưa Xương đây ta làm phép cho!",
  avatarSrc = "/images/shiba_master.gif"
}: ShibaMasterDialogProps) {
  const freeMinigameHints = useAppStore((state) => state.userStats.freeMinigameHints);
  const deductCoins = useAppStore((state) => state.deductCoins);
  const useFreeMinigameHint = useAppStore((state) => state.useFreeMinigameHint);
  const coins = useAppStore((state) => state.userStats.coins);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const playSound = useCallback((src: string, volume: number = 0.5) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }, []);

  const handleOptionClick = async (option: ShibaMasterOption) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (option.allowFreeHint && freeMinigameHints > 0) {
      const used = await useFreeMinigameHint();
      if (used) {
        playSound("/sounds/coin.mp3", 0.1); // Tiếng mua đồ thành công
        toast.success("Dùng trợ giúp miễn phí! 🛟");
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          zIndex: 2000,
        });
        await option.onConfirm();
        onClose();
        setIsProcessing(false);
        return;
      }
    }

    const success = await deductCoins(option.cost);
    if (success) {
      playSound("/sounds/coin.mp3", 0.1); // Tiếng xèng rơi keng keng
      toast.success(`Đã trả ${option.cost} Xương! 🦴`);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        zIndex: 2000,
      });
      await option.onConfirm();
      onClose();
    }
    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop tối mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Container trượt từ dưới lên */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } }}
            exit={{ y: "100%", transition: { duration: 0.2 } }}
            className="fixed bottom-0 left-0 right-0 z-[1001] pointer-events-none flex flex-col items-center justify-end"
          >
            {/* Bong bóng thoại (Speech Bubble) */}
            <div className="relative pointer-events-auto bg-white p-5 rounded-[2rem] border-4 border-[#FFD166] shadow-[0_8px_0_0_#FFD166] max-w-sm w-[90%] mx-auto mb-2">
              {/* Cái đuôi của bong bóng chỉ xuống */}
              <div className="absolute -bottom-3 right-16 w-6 h-6 bg-white border-b-4 border-r-4 border-[#FFD166] rotate-45" />
              
              <div className="flex items-center justify-center mb-4">
                <span className="font-bold text-amber-900 text-sm bg-orange-50 px-4 py-1.5 rounded-xl border-2 border-orange-100 flex items-center gap-1.5 shadow-inner">
                  Số Xương của bạn: <span className="text-[#FF9F1C] text-base">{coins}</span> <Bone className="w-4 h-4 text-[#FF9F1C]" />
                </span>
              </div>

              <p className="text-amber-900 font-bold text-center mb-5 leading-relaxed text-sm sm:text-base" style={{ fontFamily: "var(--font-rounded)" }}>
                {message}
              </p>

              <div className="flex flex-col gap-3">
                {options.map((opt) => {
                  const canUseFree = opt.allowFreeHint && freeMinigameHints > 0;
                  const hasEnoughCoins = coins >= opt.cost;
                  const canAfford = canUseFree || hasEnoughCoins;

                  return (
                    <motion.button
                      key={opt.id}
                      disabled={!canAfford || isProcessing}
                      onClick={() => handleOptionClick(opt)}
                      className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl border-b-4 transition-all ${opt.colorClass} ${
                        !canAfford
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : "active:border-b-0 active:translate-y-1"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                        {opt.icon} {opt.label}
                      </div>
                      <div className="flex items-center gap-1 font-black text-sm bg-black/10 px-2 py-1 rounded-lg">
                        {canUseFree ? (
                          <>Miễn phí <LifeBuoy className="w-4 h-4" /></>
                        ) : (
                          <>{opt.cost} <Bone className="w-4 h-4" /></>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={onClose}
                className="w-full mt-5 text-center text-zinc-400 font-bold text-sm hover:text-zinc-600 transition-colors"
              >
                🏃 Thôi con tự làm (Đóng)
              </button>
            </div>

            {/* Ảnh Avatar Sư Phụ chui từ dưới lên */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 self-end mr-8 sm:mr-16 -mb-2 pointer-events-none origin-bottom relative z-10">
              <img src={avatarSrc} alt="Shiba Master" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}