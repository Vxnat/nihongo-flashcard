"use client";

import React, { useState } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Flame, Star, Layers, Clock, X, Sparkles, Target } from "lucide-react";

const DAILY_GOAL = 15; // Mục tiêu lật 15 thẻ mỗi ngày để giữ lửa

export function UserStatsPill() {
  const { stats } = useUserStats();
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Theo dõi thao tác cuộn để ẩn/hiện Smart Header
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 50) {
      setIsHidden(true); // Cuộn xuống -> Ẩn
    } else {
      setIsHidden(false); // Cuộn lên hoặc ở trên cùng -> Hiện
    }
  });

  // Tính toán tiến độ
  const cardsLeft = Math.max(0, DAILY_GOAL - stats.cardsFlippedToday);
  const progressPercent = Math.min(100, (stats.cardsFlippedToday / DAILY_GOAL) * 100);
  
  // Thời gian học thực tế từ hệ thống (giây -> phút)
  const learningMinutes = Math.floor((stats.learningTimeToday || 0) / 60);

  return (
    <>
      {/* 1. VIÊN THUỐC TRẠNG THÁI (Lơ lửng ở ngoài) */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: isHidden ? -100 : 0, opacity: isHidden ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-2.5 border-2 border-zinc-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] cursor-pointer hover:bg-white hover:scale-105 transition-all"
        title="Mở hộp năng lượng! ✨"
      >
        <div className="flex items-center gap-1.5 relative">
          {stats.streak === 0 && <span className="absolute -inset-1 rounded-full bg-zinc-200 animate-ping opacity-50" />}
          <Flame className={`w-5 h-5 transition-colors ${stats.streak > 0 ? "text-[#FF9F1C] fill-[#FF9F1C]" : "text-zinc-300"}`} />
          <span className={`font-rounded font-black text-lg ${stats.streak > 0 ? "text-[#FF9F1C]" : "text-zinc-400"}`}>
            {stats.streak}
          </span>
        </div>
        <div className="w-px h-5 bg-zinc-200 rounded-full" />
        <div className="flex items-center gap-1.5">
          <Layers className="w-5 h-5 text-[#FF7096] fill-[#FF7096]/20" />
          <span className="font-rounded font-black text-lg text-[#FF7096]">{stats.cardsFlippedToday}</span>
        </div>
        <div className="w-px h-5 bg-zinc-200 rounded-full" />
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 text-[#06D6A0] fill-[#06D6A0]" />
          <span className="font-rounded font-black text-lg text-[#06D6A0]">{stats.totalLearned}</span>
        </div>
      </motion.div>

      {/* 2. BẢNG BENTO BOX CHI TIẾT (Phình to ra khi click) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
              exit={{ scale: 0.9, y: -20, opacity: 0, transition: { duration: 0.2 } }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDFBF7] w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border-4 border-white relative flex flex-col gap-4 overflow-hidden"
            >
              {/* Nút tắt */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-full transition-colors z-10"
              >
                <X size={18} strokeWidth={3} />
              </button>

              {/* KHU VỰC 1: LỬA STREAK (Hero Section) */}
              <div className="bg-gradient-to-b from-orange-50 to-[#FDFBF7] -mx-6 -mt-6 p-6 pt-10 pb-4 text-center border-b-2 border-dashed border-orange-100 relative">
                <div className="absolute top-4 left-4">
                  <Sparkles className="w-6 h-6 text-orange-200" fill="currentColor" />
                </div>
                <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-[0_8px_0_0_#FFE2D1] border-4 border-orange-50 mb-4 relative">
                  <Flame 
                    className={`w-12 h-12 ${stats.streak > 0 ? "text-[#FF9F1C] fill-[#FF9F1C] animate-bounce" : "text-zinc-300"}`} 
                  />
                  {stats.streak > 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-[#FF9F1C] text-white text-xs font-black font-rounded px-2 py-1 rounded-full border-2 border-white shadow-sm transform rotate-12">
                      Ngày {stats.streak}
                    </div>
                  )}
                </div>
                <h3 className="text-2xl text-orange-500" style={{ fontFamily: "var(--font-cherry)" }}>
                  {stats.streak > 0 ? "Ngọn lửa đang cháy!" : "Lửa tắt mất rồi..."}
                </h3>
                <p className="font-rounded font-bold text-orange-400/80 text-sm mt-1">
                  {stats.streak > 0 ? `Bạn đã giữ chuỗi được ${stats.streak} ngày liên tiếp 🔥` : "Hôm nay lật thẻ để thắp lại lửa nhé!"}
                </p>
              </div>

              {/* KHU VỰC 2: MỤC TIÊU TRONG NGÀY (Daily Target) */}
              <div className="bg-white p-4 rounded-[1.5rem] border-2 border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-end mb-3 relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-4 h-4 text-[#FF7096]" />
                      <span className="font-rounded font-black text-xs text-[#FF7096] uppercase tracking-wider">Mục tiêu ngày</span>
                    </div>
                    <p className="font-rounded font-bold text-zinc-600 text-sm">
                      {cardsLeft > 0 ? (
                        <>Còn <span className="text-[#FF7096] text-base">{cardsLeft}</span> thẻ nữa để giữ lửa!</>
                      ) : (
                        <span className="text-[#06D6A0]">Đã hoàn thành xuất sắc! 🎉</span>
                      )}
                    </p>
                  </div>
                  <span className="font-rounded font-black text-2xl text-zinc-800">
                    {stats.cardsFlippedToday}<span className="text-sm text-zinc-400">/{DAILY_GOAL}</span>
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, type: "spring" }}
                    className={`h-full rounded-full ${cardsLeft === 0 ? "bg-[#06D6A0]" : "bg-[#FF7096]"}`}
                  />
                </div>
              </div>

              {/* KHU VỰC 3: BENTO GRID (Thống kê phụ) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Box: Thời gian ước tính */}
                <div className="bg-[#F0FAF5] p-4 rounded-[1.5rem] border-2 border-[#A0E8D5] flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="bg-white p-2 rounded-full shadow-[0_3px_0_0_#A0E8D5] mb-2">
                    <Clock className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                  <span className="font-rounded font-black text-xl text-teal-800">{learningMinutes} <span className="text-xs" style={{ fontFamily: "var(--font-cherry)" }}>phút</span></span>
                  <span className="font-rounded font-bold text-teal-600/70 text-[10px] uppercase tracking-wider mt-0.5"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >Hôm nay</span>
                </div>

                {/* Box: Tổng thẻ đã thuộc */}
                <div className="bg-[#FFF4E6] p-4 rounded-[1.5rem] border-2 border-[#FFD166] flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="bg-white p-2 rounded-full shadow-[0_3px_0_0_#FFD166] mb-2">
                    <Star className="w-5 h-5 text-[#FF9F1C] fill-[#FF9F1C]" />
                  </div>
                  <span className="font-rounded font-black text-xl text-amber-900">{stats.totalLearned} <span className="text-xs" style={{ fontFamily: "var(--font-cherry)" }}>từ</span></span>
                  <span className="font-rounded font-bold text-amber-700/60 text-[10px] uppercase tracking-wider mt-0.5"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >Đã thuộc</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}