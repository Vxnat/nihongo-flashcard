"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";
import { SystemDeck } from "@/hooks/roadmap/useSystemRoadmap";

interface RoadmapNodeProps {
  deck: SystemDeck;
  unlocked: boolean;
  completed: boolean;
  isActive: boolean; // Trạng thái bài học hiện tại user ĐANG cần học tiếp theo
  index: number;
  offsetX: number;
  onClick: () => void;
}

export function RoadmapNode({
  deck,
  unlocked,
  completed,
  isActive,
  index,
  offsetX,
  onClick,
}: RoadmapNodeProps) {
  // Phân tích biểu tượng Icon dạng đường dẫn ảnh
  const isChest = deck.type === "chest";
  const isStory = deck.type === "story";
  const isBoss = deck.title.toLowerCase().includes("boss") || deck.title.toLowerCase().includes("ôn tập");

  let iconSrc = "/images/ui/node_vocab.png";
  if (isChest) {
    iconSrc = completed ? "/images/ui/chest_opened.png" : "/images/ui/chest_closed.png";
  } else if (isStory) {
    iconSrc = "/images/ui/node_story.png";
  } else if (deck.type === "minigame_matching" || deck.type === "minigame_rush") {
    iconSrc = "/images/ui/node_minigame.png";
  } else if (deck.type === "minigame_kanji") {
    iconSrc = "/images/ui/node_kanji.png";
  } else if (isBoss) {
    iconSrc = "/images/ui/node_boss.png";
  } else {
    // Luân phiên node_vocab và node_kanji dựa trên index
    iconSrc = index % 2 === 0 ? "/images/ui/node_vocab.png" : "/images/ui/node_kanji.png";
  }

  // Phân tích Kích thước (Size Class)
  let sizeClass = "w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]"; // Normal
  if (isChest) {
    sizeClass = "w-[4.5rem] h-[4.5rem] sm:w-[5.5rem] sm:h-[5.5rem] rounded-[1.5rem]";
  } else if (isBoss) {
    sizeClass = "w-20 h-20 sm:w-24 sm:h-24 border-[5px]";
  } else if (isStory) {
    sizeClass = "w-[4.5rem] h-[4.5rem] sm:w-[5.5rem] sm:h-[5.5rem]";
  }

  // Phân tích Màu sắc (Color Class)
  let nodeClass = "";
  if (isChest) {
    if (completed) {
      // Rương đã mở: Vàng
      nodeClass = "bg-[#FFD166] border-[#FF9F1C] text-amber-900 cursor-pointer shadow-[0_6px_0_0_#D97706]";
    } else if (unlocked) {
      // Rương đã mở khóa nhưng chưa nhận: Vàng rực nhấp nháy
      nodeClass = "bg-[#FFD166] border-[#FF9F1C] text-amber-900 cursor-pointer shadow-[0_6px_0_0_#D97706] ring-4 ring-[#FF9F1C]/40 animate-pulse";
    } else {
      // Rương bị khóa: Xám
      nodeClass = "bg-[#E4E4E7] border-[#D4D4D8] text-zinc-400 cursor-not-allowed shadow-[0_6px_0_0_#D4D4D8]";
    }
  } else if (!unlocked) {
    nodeClass = "bg-[#E4E4E7] border-[#D4D4D8] text-zinc-400 opacity-90 cursor-not-allowed shadow-[0_6px_0_0_#D4D4D8]";
  } else if (isActive) {
    // Bài đang học: Vàng rực nổi bật
    nodeClass = "bg-[#FFD166] border-[#FF9F1C] text-amber-900 cursor-pointer shadow-[0_6px_0_0_#D97706]";
  } else if (completed) {
    // Đã qua: Xanh lá mượt
    nodeClass = "bg-[#06D6A0] border-[#05B889] text-white cursor-pointer shadow-[0_6px_0_0_#04966F]";
  } else {
    // Dự phòng
    nodeClass = "bg-white border-[#FFE2D1] text-amber-900 cursor-pointer shadow-[0_6px_0_0_#FFE2D1] hover:bg-orange-50";
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center mb-[6px]"
      style={{ transform: `translateX(${offsetX}px)` }}
    >
      {/* WRAPPER ĐỂ VÒNG XOAY KHÔNG BỊ CHIẾM FULL MÀN HÌNH */}
      <div className="relative flex items-center justify-center">
        {/* Vòng quay nhấp nháy (chỉ hiện khi đang là bài học Active) */}
        {isActive && (
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%+3px)] w-full h-full scale-125 rounded-full border-[3px] border-[#FF9F1C] border-dashed animate-[spin_4s_linear_infinite] opacity-60 pointer-events-none" />
        )}

        {/* Vòng sáng toả ra ngoài (Ping) */}
        {isActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+3px)] w-full h-full rounded-full border-[4px] border-[#FFD166] animate-ping opacity-50 pointer-events-none" />
        )}

        <motion.button
          // Rương có thể click ngay cả khi bị khóa, các node khác thì không
          onClick={onClick}
          whileHover={unlocked ? { scale: 1.05 } : {}}
          whileTap={unlocked ? { scale: 0.95 } : {}}
          className={`relative group flex items-center justify-center border-4 transition-colors duration-300 ${sizeClass} ${nodeClass} outline-none rounded-full ${
            unlocked ? "active:translate-y-[6px] active:shadow-none" : ""
          }`}
        >
          {/* Huy hiệu Hoàn Thành (Check / Crown) */}
          {completed && (
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-zinc-100 z-20">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#06D6A0]" fill="currentColor" stroke="white" />
            </div>
          )}
          
          {/* Ổ Khóa */}
          {!unlocked && (
            <div className="absolute -top-1 -right-1 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-zinc-200 z-20">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" strokeWidth={2.5} />
            </div>
          )}

          <img
            src={iconSrc}
            alt={deck.title}
            className={`object-contain transition-transform select-none pointer-events-none ${
              isChest
                ? "w-11 h-11 sm:w-13 sm:h-13"
                : isBoss
                ? "w-13 h-13 sm:w-15 sm:h-15"
                : "w-9 h-9 sm:w-11 sm:h-11"
            } ${!unlocked ? "grayscale opacity-40" : "group-hover:scale-110 group-hover:-rotate-6"}`}
            draggable={false}
          />
        </motion.button>
      </div>

      {/* Label Tooltip (Tên bài học nổi lên ngay bên dưới) */}
      {!isChest && (
        <div className="absolute top-[105%] w-[180px] left-1/2 -translate-x-1/2 text-center pointer-events-none flex justify-center mt-2 z-50">
          <h4
            className={`text-[13px] sm:text-[14px] font-bold leading-tight px-3 py-1.5 rounded-2xl border-2 backdrop-blur-md shadow-sm transition-opacity duration-300 break-words w-full ${
              unlocked
                ? isActive
                  ? "bg-white/95 text-[#D97706] border-[#FFD166]" // Label vàng rực nếu đang học
                  : "bg-white/95 text-zinc-600 border-[#FFE2D1]"
                : "bg-zinc-100/90 text-zinc-400 border-zinc-200/50"
            }`}
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {deck.title}
          </h4>
        </div>
      )}
    </div>
  );
}