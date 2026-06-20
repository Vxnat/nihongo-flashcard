import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAppStore } from "@/store/useAppStore";

interface VNEndScreenProps {
  rewardCoins: number;
  onClose: () => void;
}

export function VNEndScreen({ rewardCoins, onClose }: VNEndScreenProps) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // 1. GỌI HÀM CỘNG XU TỪ ZUSTAND / FIRESTORE (Gamification)
    const addCoins = useAppStore.getState().addCoins;
    if (addCoins && rewardCoins > 0) addCoins(rewardCoins);
    
    // Thông báo tạm thời để dễ hình dung
    if (rewardCoins > 0) {
      toast.success(`Đã nhận ${rewardCoins} Xương!`, { icon: "🦴" });
    }

    // 2. HIỆU ỨNG PHÁO GIẤY
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      // Bắn từ góc trái
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#FF9F1C', '#FFD166', '#06D6A0', '#FF7096', '#5390D9']
      });
      // Bắn từ góc phải
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#FF9F1C', '#FFD166', '#06D6A0', '#FF7096', '#5390D9']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [rewardCoins]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[3px] p-6"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
        className="bg-[#FFFDF5] rounded-[2.5rem] border-4 border-[#FFE2D1] p-8 max-w-[320px] w-full text-center shadow-2xl flex flex-col items-center relative overflow-hidden"
      >
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative mt-2 mb-4"
        >
          <Sparkles className="w-20 h-20 text-[#FFD166] drop-shadow-md" fill="#FFD166" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl mt-[-6px]">🎉</span>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-[#FF7096] mb-2 drop-shadow-sm" style={{ fontFamily: "var(--font-cherry)" }}>
          Hoàn Thành!
        </h2>
        <p className="text-zinc-600 font-bold mb-6 text-base leading-relaxed">
          Bạn đã hoàn thành cốt truyện xuất sắc!
        </p>

        {rewardCoins > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-4 w-full mb-6 relative overflow-hidden flex flex-col items-center justify-center gap-1 shadow-inner">
            <span className="text-xs font-black text-orange-400 uppercase tracking-wider block">Phần thưởng</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold text-[#FF9F1C] drop-shadow-md" style={{ fontFamily: "var(--font-cherry)" }}>+{rewardCoins}</span>
              <span className="text-3xl filter drop-shadow-sm pb-1">🦴</span>
            </div>
          </div>
        )}

        <button onClick={onClose} className="w-full h-14 bg-[#06D6A0] hover:bg-[#05b889] text-white font-bold text-lg rounded-2xl border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-lg">
          {rewardCoins > 0 ? "Nhận Xương & Đóng" : "Đóng"}
        </button>
      </motion.div>
    </motion.div>
  );
}