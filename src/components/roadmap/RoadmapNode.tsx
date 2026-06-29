"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Bone } from "lucide-react";
import { SystemDeck } from "@/types/flashcard";

interface RoadmapNodeProps {
  deck: SystemDeck;
  unlocked: boolean;
  completed: boolean;
  isActive: boolean; // Trạng thái bài học hiện tại user ĐANG cần học tiếp theo
  index: number;
  onClick: () => void;
}

export function RoadmapNode({
  deck,
  unlocked,
  completed,
  isActive,
  index,
  onClick,
}: RoadmapNodeProps) {
  const isChest = deck.type === "chest";
  const isStory = deck.type === "story";
  const isBoss = deck.type === "boss_rpg";

  // --- TRƯỜNG HỢP 1: NODE LÀ RƯƠNG THƯỞNG ĐỘC LẬP (CHEST NODE) ---
  if (isChest) {
    let chestIcon = "/images/ui/roadmap/chest_closed.png";
    let chestClass = "w-20 h-20 sm:w-24 sm:h-24";

    if (completed) {
      chestIcon = "/images/ui/roadmap/chest_opened.png";
    } else if (unlocked) {
      // Nhấp nháy nếu có thể nhận
      chestClass += " animate-bounce cursor-pointer drop-shadow-[0_0_12px_rgba(255,159,28,0.6)]";
    } else {
      // Khóa
      chestClass += " grayscale opacity-50 cursor-not-allowed";
    }

    const isLeft = index % 2 === 0;

    return (
      <div className={`absolute -translate-x-1/2 top-[105px] -translate-y-1/2 flex flex-col items-center z-20 ${isLeft ? "left-[calc(50%+65px)]" : "left-[calc(50%-65px)]"}`}>
        <motion.div
          whileHover={unlocked ? { scale: 1.1, rotate: 2 } : {}}
          whileTap={unlocked ? { scale: 0.95 } : {}}
          onClick={onClick}
          className="relative flex flex-col items-center"
        >
          {/* Hào quang lấp lánh cho rương sẵn sàng mở */}
          {unlocked && !completed && (
            <div className="absolute inset-0 bg-amber-400/20 rounded-full filter blur-xl animate-pulse scale-150 -z-10" />
          )}

          <img
            src={chestIcon}
            alt={deck.title}
            className={`${chestClass} object-contain transition-all`}
            draggable={false}
          />

          {/* Nhãn rương thưởng */}
          <div className="absolute top-[85%] bg-white border border-amber-200 px-2.5 py-1 rounded-full shadow-sm text-center min-w-[120px] pointer-events-none">
            <p className="text-[10px] sm:text-[11px] font-black text-amber-800 uppercase tracking-wider" style={{ fontFamily: "var(--font-jua)" }}>
              {completed ? "Đã nhận" : unlocked ? "Mở khóa!" : "Phần thưởng"}
            </p>
            {deck.rewardCoins && !completed && (
              <p className="text-[9px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
                {deck.rewardCoins} <Bone className="w-2.5 h-2.5 rotate-45" />
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: BÀI HỌC/MINIGAME/STORY THÔNG THƯỜNG ---
  // Chọn màu sắc chủ đạo cho thẻ
  let themeColor = "bg-gradient-to-br from-[#F4F4F5] to-[#E4E4E7] border border-zinc-200 text-zinc-400 shadow-sm";
  let circleColor = "bg-zinc-200/50 border-zinc-300/30 text-zinc-400 shadow-sm";

  if (completed) {
    themeColor = "bg-gradient-to-br from-[#E2F6F0] to-[#CBEFE3] border border-[#06D6A0]/40 text-emerald-800 shadow-[0_4px_16px_rgba(6,214,160,0.06)] hover:from-[#E2F6F0]/95";
    circleColor = "bg-[#06D6A0] border-white/60 text-white shadow-md shadow-emerald-500/10";
  } else if (unlocked) {
    if (isActive) {
      themeColor = "bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] border-2 border-sky-300/80 text-sky-950 shadow-[0_8px_24px_rgba(56,189,248,0.12)] hover:scale-[1.03]";
      circleColor = "bg-[#38BDF8] border-white text-white shadow-md shadow-sky-500/15";
    } else {
      themeColor = "bg-gradient-to-br from-[#FFF8E7] to-[#FFE0E6] border border-[#FFE2D1]/75 text-amber-800 shadow-[0_4px_12px_rgba(255,159,28,0.05)]";
      circleColor = "bg-orange-100 border-white/60 text-orange-700 shadow-sm";
    }
  }

  // Chọn Icon hiển thị trên Thẻ (sử dụng lại các ảnh PNG chuyên biệt từ mã nguồn cũ)
  let iconSrc = "/images/ui/roadmap/node_vocab.png";
  let typeText = "Từ vựng";

  if (isStory) {
    iconSrc = "/images/ui/roadmap/node_story.png";
    typeText = "Story";
  } else if (deck.type === "minigame_matching") {
    iconSrc = "/images/ui/roadmap/node_minigame.png";
    typeText = "Nối từ";
  } else if (deck.type === "minigame_rush" || deck.type === "minigame_rhythm") {
    iconSrc = "/images/ui/roadmap/node_minigame.png";
    typeText = deck.type === "minigame_rush" ? "Băng chuyền" : "Nhịp điệu";
  } else if (deck.type === "minigame_kanji") {
    iconSrc = "/images/ui/roadmap/node_kanji.png";
    typeText = "Kanji";
  } else if (deck.type === "minigame_fill") {
    iconSrc = "/images/ui/roadmap/node_fill.png";
    typeText = "Điền trợ từ";
  } else if (isBoss) {
    iconSrc = "/images/ui/roadmap/node_boss.png";
    typeText = "Thử thách Boss";
  } else {
    iconSrc = "/images/ui/roadmap/node_vocab.png";
    typeText = "Từ vựng";
  }

  const isLeft = index % 2 === 0;

  return (
    <>
      {/* 1. NÚT TRÒN SỐ (X = -70px hoặc 70px) */}
      <div className={`absolute -translate-x-1/2 top-[35px] -translate-y-1/2 flex items-center justify-center z-20 ${isLeft ? "left-[calc(50%-70px)]" : "left-[calc(50%+70px)]"}`}
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {isActive && (
          <>
            {/* Vòng quay dashed nhấp nháy cho bài active */}
            <div className="absolute w-14 h-14 rounded-full border-2 border-[#38BDF8] border-dashed animate-[spin_6s_linear_infinite] opacity-60 pointer-events-none" />
            <div className="absolute w-14 h-14 rounded-full border-2 border-[#7DD3FC] animate-ping opacity-30 pointer-events-none" />
          </>
        )}
        <motion.button
          onClick={unlocked ? onClick : undefined}
          whileHover={unlocked ? { scale: 1.1 } : {}}
          whileTap={unlocked ? { scale: 0.95 } : {}}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm select-none transition-all
                ${circleColor} ${unlocked ? "cursor-pointer" : "cursor-not-allowed"}
              `}
          draggable={false}
        >
          {completed ? "✓" : index + 1}
        </motion.button>
      </div>

      {/* 2. ĐƯỜNG NỐI NGANG (NỐI TỪ NÚT SỐ SANG THẺ) */}
      <div
        className={`absolute left-[calc(50%-50px)] top-[70px] w-24 h-1 border-t-2 border-dashed pointer-events-none z-10
              ${completed ? "border-emerald-300" : isActive ? "border-amber-300" : "border-zinc-200"}
            `}
      />

      {/* 3. THẺ THÔNG TIN (X = 65px hoặc -65px) */}
      <div className={`absolute -translate-x-1/2 top-[105px] -translate-y-1/2 z-20 w-[210px] sm:w-[230px] ${isLeft ? "left-[calc(50%+65px)]" : "left-[calc(50%-65px)]"}`}>
        <motion.div
          onClick={unlocked ? onClick : undefined}
          whileHover={unlocked ? { y: -2, scale: 1.02 } : {}}
          whileTap={unlocked ? { scale: 0.98 } : {}}
          className={`w-full p-3 rounded-[1.2rem] flex items-center gap-2.5 cursor-pointer relative overflow-hidden transition-all duration-300
            ${themeColor} ${!unlocked ? "opacity-75 cursor-not-allowed" : ""}
          `}
        >
          {/* Lớp khóa mờ nếu bài học chưa mở */}
          {!unlocked && (
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm rounded-full p-1 border border-zinc-200 z-10">
              <Lock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2.5} />
            </div>
          )}

          {/* Badge icon hình ảnh thể loại đã được tách nền */}
          <div className="w-10 h-10 shrink-0 flex items-center justify-center select-none pointer-events-none">
            <img
              src={iconSrc}
              alt={typeText}
              className={`w-full h-full object-contain ${!unlocked ? "grayscale opacity-50" : ""}`}
              draggable={false}
            />
          </div>

          {/* Thông tin chữ */}
          <div className="flex flex-col gap-1 flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-85"
                style={{ fontFamily: "var(--font-jua)" }}
              >
                {typeText}
              </span>
              {deck.rewards?.coins || deck.rewardCoins ? (
                <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-100 shrink-0">
                  {deck.rewards?.coins || deck.rewardCoins} <Bone className="w-2.5 h-2.5 rotate-45" />
                </span>
              ) : null}
            </div>
            <h4
              className="text-xs sm:text-[13px] font-black leading-tight truncate text-zinc-800"
              style={{ fontFamily: "var(--font-jua)" }}
            >
              {deck.title}
            </h4>
          </div>
        </motion.div>
      </div>
    </>
  );
}