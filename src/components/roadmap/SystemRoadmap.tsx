"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { useSystemRoadmap } from "@/hooks/roadmap/useSystemRoadmap";
import { useAppStore } from "@/store/useAppStore";
import { RoadmapNode } from "./RoadmapNode";
import { ShibaLoginCard } from "@/components/common/ShibaLoginCard";
import { generateSVGPath } from "@/utils/roadmapHelpers";
import { MAP_DECORATIONS } from "@/constants/mapDecorations";
import toast from "react-hot-toast";

const LEVEL_IMAGES: Record<string, string> = {
  N5: "/images/ui/roadmap/level_n5.png",
  N4: "/images/ui/roadmap/level_n4.png",
  N3: "/images/ui/roadmap/level_n3.png",
  N2: "/images/ui/roadmap/level_n2.png",
  N1: "/images/ui/roadmap/level_n1.png",
};

const containerVariants = {
  open: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    }
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const bubbleVariants: any = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  closed: {
    opacity: 0,
    y: 20,
    scale: 0.3,
    transition: {
      duration: 0.2
    }
  }
};

export function SystemRoadmap() {
  const router = useRouter();
  const { isLoading, decks, selectedLevel, setSelectedLevel, deckStatuses } =
    useSystemRoadmap();
  const user = useAppStore((state: any) => state.user);
  const setActiveStoryId = useAppStore((state: any) => state.setActiveStoryId);
  const setActiveMinigameId = useAppStore((state: any) => state.setActiveMinigameId);
  const setActiveBossRPGId = useAppStore((state: any) => state.setActiveBossRPGId);
  const addCoins = useAppStore((state) => state.addCoins);
  const saveProgress = useAppStore((state) => state.saveProgress);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isCardHovered, setIsCardHovered] = useState(false);

  const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
  const ROW_HEIGHT = 180; // Chiều cao hàng mốc roadmap

  const CHAPTER_BG_COLORS: Record<number, string> = {
    1: "bg-[#E2F6F0]",
    2: "bg-[#EAF5E5]",
    3: "bg-[#FAF3EC]",
    4: "bg-[#E8F1F5]",
    5: "bg-[#EDE9F5]"
  };

  const CHAPTER_COLORS = [
    { bg: "bg-[#7BC4AC]", border: "border-[#62AD95]", shadow: "shadow-[0_6px_0_0_#4E947D]", text: "text-[#62AD95]", accentHex: "#15e8a1ff" },
    { bg: "bg-[#92C48D]", border: "border-[#79AB74]", shadow: "shadow-[0_6px_0_0_#60915C]", text: "text-[#79AB74]", accentHex: "#60915C" },
    { bg: "bg-[#E8A584]", border: "border-[#CF8B6C]", shadow: "shadow-[0_6px_0_0_#B57354]", text: "text-[#CF8B6C]", accentHex: "#B57354" },
    { bg: "bg-[#87B2D6]", border: "border-[#6D99BD]", shadow: "shadow-[0_6px_0_0_#5580A4]", text: "text-[#6D99BD]", accentHex: "#5580A4" },
    { bg: "bg-[#A392E3]", border: "border-[#8A79CA]", shadow: "shadow-[0_6px_0_0_#7160B1]", text: "text-[#8A79CA]", accentHex: "#7160B1" },
  ];

  // Tìm bài học đang Active (Bài đầu tiên được mở khóa nhưng chưa hoàn thành)
  const activeDeckId = useMemo(() => {
    const activeStatus = deckStatuses.find((status) => status.unlocked && !status.completed);
    return activeStatus ? activeStatus.deck.id : null;
  }, [deckStatuses]);

  // Nhóm các bài học theo Chương (Chapter)
  const chapters = deckStatuses.reduce(
    (acc, item) => {
      const chapNum = item.deck.chapter || 1; // Mặc định là 1 nếu không có
      if (!acc[chapNum]) acc[chapNum] = [];
      acc[chapNum].push(item);
      return acc;
    },
    {} as Record<number, typeof deckStatuses>,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Tự động cuộn đến bài học Active
  useEffect(() => {
    if (activeDeckId) {
      const el = document.getElementById(`node-${activeDeckId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    }
  }, [activeDeckId, selectedLevel, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16">
        <div className="bg-white/80 border-4 border-[#FFE2D1] rounded-[2rem] shadow-[0_6px_0_0_#FFD6C0] px-8 py-6 flex flex-col items-center gap-3">
          {/* Shiba Mascot */}
          <img
            src="/images/mascot/shiba_master.gif"
            alt="Shiba đang tìm đường"
            className="w-16 h-16 object-contain drop-shadow-md"
          />

          {/* Paw prints animation */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="text-lg animate-bounce select-none"
                style={{
                  animationDelay: `${i * 0.25}s`,
                  animationDuration: "0.8s",
                }}
              >
                🐾
              </span>
            ))}
          </div>

          {/* Text */}
          <p
            className="font-black text-[#FF9F1C] text-base"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Shiba đang tìm đường...
          </p>
        </div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white/60 border-4 border-dashed border-[#FF7096] rounded-[3rem] text-center shadow-sm">
        <span className="mb-4 animate-bounce block select-none">
          <img src="/images/ui/roadmap/treasure_map_icon.png" alt="Map" className="w-20 h-20 object-contain" />
        </span>
        <h3
          className="text-3xl text-[#FF7096] mb-2 drop-shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Bản đồ đang trống!
        </h3>
        <p className="font-rounded text-zinc-500 font-bold text-sm">
          Hãy thêm file{" "}
          <code className="bg-zinc-100 px-2 py-1 rounded-md text-[#FF7096]">
            public/data/system_decks.json
          </code>{" "}
          để bắt đầu hành trình nhé! ✨
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* NÚT FAB CHỌN CẤP ĐỘ (Xổ lên trên, nằm ở góc dưới bên trái) */}
      {user && (
        <div className="fixed bottom-30 right-6 lg:bottom-10 lg:left-10 z-[100]" ref={dropdownRef}>
          <div className="relative flex flex-col items-center">
            {/* Hộp danh sách bong bóng bay lên */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  variants={containerVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="absolute bottom-16 left-0 mb-3 flex flex-col-reverse gap-2.5 items-center z-50"
                >
                  {LEVELS.map((lvl) => {
                    const isActive = selectedLevel === lvl;
                    const imagePath = LEVEL_IMAGES[lvl] || "/images/ui/roadmap/level_n5.png";
                    return (
                      <motion.button
                        key={lvl}
                        variants={bubbleVariants}
                        whileHover={{ scale: isActive ? 1.15 : 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedLevel(lvl);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center shadow-md cursor-pointer transition-all duration-200 relative group ${isActive
                          ? "bg-gradient-to-tr from-[#FFA6C9] to-[#FFD2B4] border-white text-white scale-110 shadow-[0_4px_12px_rgba(255,166,201,0.45)]"
                          : "bg-white/80 backdrop-blur-md border-white/60 text-amber-950 hover:bg-white"
                          }`}
                      >
                        <img
                          src={imagePath}
                          alt={lvl}
                          className="w-7 h-7 object-contain select-none pointer-events-none mb-0.5 animate-pulse"
                        />
                        <span
                          style={{ fontFamily: "var(--font-cherry)", fontSize: "9px" }}
                          className="font-black leading-none uppercase select-none"
                        >
                          {lvl}
                        </span>

                        {/* Tooltip hiển thị tên cấp độ khi hover (dành cho desktop) */}
                        <div className="absolute left-14 bg-zinc-800/90 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                          Trình độ {lvl}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nút FAB chính */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FFA6C9] to-[#FFD2B4] text-white flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(255,166,201,0.4)] cursor-pointer relative z-50 p-1"
            >
              <motion.img
                animate={{ rotate: isDropdownOpen ? 360 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                src={LEVEL_IMAGES[selectedLevel]}
                alt={selectedLevel}
                className="w-8 h-8 object-contain select-none pointer-events-none mb-0.5"
              />
              <span
                style={{ fontFamily: "var(--font-cherry)", fontSize: "10px" }}
                className="font-black leading-none uppercase select-none tracking-wide"
              >
                {selectedLevel}
              </span>
            </motion.button>
          </div>
        </div>
      )}

      {deckStatuses.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white/60 border-4 border-dashed border-[#FFD166] rounded-[3rem] text-center shadow-sm mt-4"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          <span className="mb-4 block select-none">
            <img
              src="/images/ui/roadmap/under_construction.png"
              alt="Đang xây dựng"
              className="w-28 h-28 object-contain drop-shadow-md"
            />
          </span>
          <h3
            className="text-3xl text-[#FF9F1C] mb-2 drop-shadow-sm"
          >
            Đang xây dựng!
          </h3>
          <p className="font-rounded text-zinc-500 font-bold text-sm">
            Lộ trình {selectedLevel} sẽ sớm ra mắt. Cùng chờ đón nhé! ✨
          </p>
        </div>
      ) : (
        <div className="w-full relative flex flex-col items-center min-h-[500px]">
          {/* LỚP PHỦ SƯƠNG MÙ VÀ CARD ĐĂNG NHẬP KHI CHƯA ĐĂNG NHẬP */}
          {!user && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-12 px-4 pointer-events-auto overflow-hidden rounded-[3rem] w-full h-full">
              {/* ☁️ Hiệu ứng các đám mây trôi lửng lơ */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {/* Đám mây 1 */}
                <motion.div
                  initial={{ x: "-100%", y: "15%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
                  className="absolute opacity-30 select-none pointer-events-none"
                >
                  <div className="w-24 h-8 bg-white rounded-full filter blur-[2px] relative before:content-[''] before:absolute before:bg-white before:rounded-full before:w-12 before:h-12 before:-top-6 before:left-4 after:content-[''] after:absolute after:bg-white after:rounded-full after:w-16 after:h-16 after:-top-8 after:left-12" />
                </motion.div>

                {/* Đám mây 2 */}
                <motion.div
                  initial={{ x: "-100%", y: "45%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 48, ease: "linear", delay: 10 }}
                  className="absolute opacity-25 select-none pointer-events-none"
                >
                  <div className="w-36 h-10 bg-white rounded-full filter blur-[3px] relative before:content-[''] before:absolute before:bg-white before:rounded-full before:w-16 before:h-16 before:-top-8 before:left-6 after:content-[''] after:absolute after:bg-white after:rounded-full after:w-20 after:h-20 after:-top-10 after:left-16" />
                </motion.div>

                {/* Đám mây 3 */}
                <motion.div
                  initial={{ x: "100%", y: "75%" }}
                  animate={{ x: "-100%" }}
                  transition={{ repeat: Infinity, duration: 40, ease: "linear", delay: 5 }}
                  className="absolute opacity-20 select-none pointer-events-none"
                >
                  <div className="w-28 h-8 bg-white rounded-full filter blur-[2px] relative before:content-[''] before:absolute before:bg-white before:rounded-full before:w-14 before:h-14 before:-top-6 before:left-4 after:content-[''] after:absolute after:bg-white after:rounded-full after:w-16 after:h-16 after:-top-8 after:left-10" />
                </motion.div>

                {/* Các ngôi sao/lấp lánh bay lên */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: "100%", x: `${20 + i * 12}%`, scale: 0.5, opacity: 0 }}
                    animate={{ y: "-10%", scale: [0.5, 1, 0.5], opacity: [0, 0.8, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 6 + i * 2,
                      ease: "easeInOut",
                      delay: i * 1.5,
                    }}
                    className="absolute text-amber-300 z-0 pointer-events-none"
                  >
                    <Sparkles className="w-4 h-4" fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              {/* CARD ĐĂNG NHẬP THÁM HIỂM SHIBA */}
              <ShibaLoginCard
                title="Vùng Đất Mây Mù"
                description="Hành trình phía trước đang bị sương mù che phủ. Cùng Shiba để thám hiểm con đường chinh phục tiếng Nhật nhé! 🐾"
                variant="roadmap"
                onHoverChange={setIsCardHovered}
              />
            </div>
          )}

          {/* ROADMAP THỰC TẾ (BỊ MỜ KHI CHƯA ĐĂNG NHẬP) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full mt-2 flex flex-col items-center relative transition-all duration-700 ${!user
              ? isCardHovered
                ? "blur-[4px] opacity-60 scale-[0.99] pointer-events-none select-none"
                : "blur-[7px] opacity-40 scale-[0.98] pointer-events-none select-none"
              : ""
              }`}
          >
            {Object.entries(chapters).map(([chapterNum, items], idx) => {
              const totalCount = items.length;
              const completedCount = items.filter(
                (item) => item.completed,
              ).length;
              const isFullyCompleted = completedCount === totalCount;

              // Tính toán đoạn đường SVG cần tô màu vàng (đã học)
              const firstUncompletedIdx = items.findIndex((item) => !item.completed);
              let pathCompletedCount = 0;
              if (firstUncompletedIdx === -1) {
                pathCompletedCount = items.length;
              } else if (firstUncompletedIdx > 0) {
                pathCompletedCount = firstUncompletedIdx + 1;
              }

              // Chọn màu cho chapter dựa vào thứ tự
              const colorStyle = CHAPTER_COLORS[(parseInt(chapterNum) - 1) % CHAPTER_COLORS.length] || CHAPTER_COLORS[0];

              const totalChaptersCount = Object.keys(chapters).length;

              return (
                <div key={chapterNum} className="w-full flex flex-col items-center relative">
                  {/* 🚧 VÁCH NGĂN VẬT LÝ GIỮA CÁC CHƯƠNG (CỬA ẢI GỖ PASTEL) NẰM ĐÈ LÊN ĐƯỜNG BIÊN GIỚI */}
                  {idx > 0 && (
                    <div className="absolute top-0 left-0 right-0 -translate-y-1/2 flex items-center justify-center z-30 pointer-events-none">
                      {/* Hàng rào/Cầu rào ngăn cách */}
                      <div className={`absolute inset-x-0 h-6 rounded-md shadow-md border-y-2 ${CHAPTER_BG_COLORS[parseInt(chapterNum)] || "bg-white"} ${colorStyle.border}`} />

                      {/* Ổ khóa rào chắn */}
                      <div className={`z-10 p-2.5 rounded-full border-4 shadow-md flex items-center justify-center ${CHAPTER_BG_COLORS[parseInt(chapterNum)] || "bg-white"} ${colorStyle.border} ${colorStyle.text}`}>
                        <Lock className="w-5 h-5" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {/* CONTAINER NỘI DUNG CHƯƠNG VỚI ẢNH NỀN VÀ TRANG TRÍ */}
                  <div
                    className={`w-full flex flex-col items-center py-6 px-4 relative overflow-hidden shadow-inner mb-0 mt-2 ${idx === 0 ? "rounded-t-[2.5rem]" : ""
                      } ${idx === totalChaptersCount - 1 ? "rounded-b-[2.5rem]" : ""} ${CHAPTER_BG_COLORS[parseInt(chapterNum)] || "bg-white"
                      }`}
                    style={{
                      backgroundImage: `url('/images/ui/roadmap/bg_chapter_${chapterNum}.png')`,
                      backgroundSize: "240px",
                      backgroundRepeat: "repeat",
                      backgroundPosition: "top left",
                    }}
                  >

                    {/* BANNER CHƯƠNG (Chapter Header) - Huy hiệu tròn 2 cột */}
                    <div className={`w-full border-4 rounded-[2rem] p-4 mb-6 z-20 relative overflow-hidden flex items-center justify-between gap-4 ${colorStyle.bg} ${colorStyle.border} ${colorStyle.shadow}`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-white/10 to-black/0 pointer-events-none" />

                      {/* Cột trái: Tiêu đề chương & Tiến độ chữ */}
                      <div className="flex flex-col text-left z-10 pl-2">
                        <h3
                          className="text-2xl sm:text-3xl text-white drop-shadow-md leading-tight mb-1"
                          style={{ fontFamily: "var(--font-cherry)" }}
                        >
                          Chương {chapterNum}
                        </h3>
                        <p className="font-rounded font-extrabold text-xs sm:text-sm text-white/90"
                          style={{ fontFamily: "var(--font-cherry)" }}
                        >
                          {isFullyCompleted ? (
                            <span className="flex items-center gap-1.5 text-amber-100">
                              Chinh phục thành công! 🎉
                            </span>
                          ) : (
                            <span>Tiến độ: {completedCount}/{totalCount} bài học</span>
                          )}
                        </p>
                      </div>

                      {/* Cột phải: Vòng tròn tiến trình SVG và Huy hiệu Shiba */}
                      <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-white/20 shadow-inner z-10 shrink-0 mr-1 select-none">
                        {(() => {
                          const radius = 24;
                          const strokeWidth = 5;
                          const circumference = 2 * Math.PI * radius;
                          const ratio = totalCount > 0 ? completedCount / totalCount : 0;
                          const strokeDashoffset = circumference - ratio * circumference;

                          return (
                            <>
                              <svg className="w-full h-full transform -rotate-90">
                                {/* Vòng nền */}
                                <circle
                                  cx="32"
                                  cy="32"
                                  r={radius}
                                  stroke="rgba(255, 255, 255, 0.15)"
                                  fill="none"
                                  strokeWidth={strokeWidth}
                                />
                                {/* Vòng tiến trình */}
                                <motion.circle
                                  cx="32"
                                  cy="32"
                                  r={radius}
                                  fill="none"
                                  stroke={isFullyCompleted ? "#FFFFFF" : colorStyle.accentHex}
                                  strokeWidth={strokeWidth}
                                  strokeDasharray={circumference}
                                  initial={{ strokeDashoffset: circumference }}
                                  animate={{ strokeDashoffset }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  strokeLinecap="round"
                                />
                              </svg>
                              {/* Icon ở tâm vòng tròn */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.img
                                  initial={isFullyCompleted ? { scale: 0.8, rotate: -10 } : { scale: 0.9 }}
                                  animate={isFullyCompleted ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { scale: 1 }}
                                  transition={isFullyCompleted ? { repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" } : {}}
                                  src={isFullyCompleted ? "/images/ui/roadmap/shiba_chapter_badge.png" : "/images/ui/roadmap/treasure_map_icon.png"}
                                  alt="Badge"
                                  className={`w-8 h-8 object-contain ${isFullyCompleted ? "drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]" : ""}`}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* DANH SÁCH BÀI HỌC (ZIG-ZAG) */}
                    <div className="relative w-full flex flex-col items-center" style={{ paddingBottom: "20px" }}>
                      {/* ĐƯỜNG NỐI SVG ĐƯỜNG ĐI KÉP (OUTLINE + FILL) */}
                      <svg
                        className="absolute top-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
                        viewBox={`-85 0 170 ${items.length * ROW_HEIGHT}`}
                        width="170"
                      >
                        <defs>
                          <linearGradient id={`future-grad-${chapterNum}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#F1F5F9" />   {/* Slate pastel 100 */}
                            <stop offset="100%" stopColor="#E2E8F0" /> {/* Slate pastel 200 */}
                          </linearGradient>
                          <linearGradient id={`future-outline-grad-${chapterNum}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#E2E8F0" />
                            <stop offset="100%" stopColor="#CBD5E1" />
                          </linearGradient>

                          <linearGradient id={`completed-grad-${chapterNum}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#E6FFFA" />   {/* Teal pastel 100 */}
                            <stop offset="50%" stopColor="#B2F5EA" />  {/* Teal pastel 200 */}
                            <stop offset="100%" stopColor="#81E6D9" /> {/* Teal pastel 300 */}
                          </linearGradient>
                          <linearGradient id={`completed-outline-grad-${chapterNum}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#B2F5EA" />
                            <stop offset="100%" stopColor="#319795" /> {/* Soft teal border */}
                          </linearGradient>
                        </defs>

                        {/* 1. Lộ trình tương lai: Viền xám sẫm pastel */}
                        <path
                          d={generateSVGPath(items.length, ROW_HEIGHT, 0)}
                          fill="none"
                          stroke={`url(#future-outline-grad-${chapterNum})`}
                          strokeWidth="28"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* 2. Lộ trình tương lai: Mặt đường xám sáng pastel */}
                        <path
                          d={generateSVGPath(items.length, ROW_HEIGHT, 0)}
                          fill="none"
                          stroke={`url(#future-grad-${chapterNum})`}
                          strokeWidth="20"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* 3. Lộ trình đã học: Viền xanh ngọc pastel sẫm */}
                        {pathCompletedCount > 0 && (
                          <path
                            d={generateSVGPath(pathCompletedCount, ROW_HEIGHT, 0)}
                            fill="none"
                            stroke={`url(#completed-outline-grad-${chapterNum})`}
                            strokeWidth="28"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        {/* 4. Lộ trình đã học: Mặt đường xanh ngọc pastel sáng */}
                        {pathCompletedCount > 0 && (
                          <path
                            d={generateSVGPath(pathCompletedCount, ROW_HEIGHT, 0)}
                            fill="none"
                            stroke={`url(#completed-grad-${chapterNum})`}
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>

                      {/* CÁC NÚT BÀI HỌC */}
                      {items.map((item, idx) => {
                        const isActive = item.deck.id === activeDeckId;

                        const decorationVariants: any = {
                          hidden: { opacity: 0, scale: 0.5 },
                          visible: {
                            opacity: 1,
                            scale: 1,
                            transition: {
                              type: "spring", stiffness: 200, damping: 15, delay: 0.2,
                            },
                          },
                        };

                        return (
                          <div
                            key={item.deck.id}
                            id={`node-${item.deck.id}`}
                            style={{ height: ROW_HEIGHT }}
                            className="w-full flex items-center justify-center relative"
                          >
                            {/* ======================================= */}
                            {/* ✨ HỌA TIẾT TRANG TRÍ HAI BÊN ĐƯỜNG ✨ */}
                            {/* ======================================= */}
                            {(() => {
                              const decoration = MAP_DECORATIONS[parseInt(chapterNum)]?.[idx];
                              if (!decoration) return null;

                              const isLeft = idx % 2 === 0;

                              return (
                                <motion.div
                                  className={`absolute top-1/2 -translate-y-1/2 ${isLeft
                                    ? "left-[calc(50%-150px)] -translate-x-1/2"
                                    : "left-[calc(50%+150px)] -translate-x-1/2"
                                    } ${decoration.sizeClass} ${decoration.opacity} z-0 select-none pointer-events-none`}
                                  variants={decorationVariants}
                                  initial="hidden"
                                  whileInView="visible"
                                  viewport={{ once: true }}
                                >
                                  <img src={decoration.src} alt="Decoration" className="w-full h-full object-contain" />
                                </motion.div>
                              );
                            })()}

                            <RoadmapNode
                              deck={item.deck}
                              unlocked={true}
                              completed={item.completed}
                              isActive={isActive}
                              index={idx}
                              onClick={() => {
                                if (item.deck.type === "chest") {
                                  if (item.unlocked && !item.completed) {
                                    // MỞ RƯƠNG LẦN ĐẦU TIÊN
                                    import("canvas-confetti").then((confetti) => {
                                      confetti.default({
                                        particleCount: 100,
                                        spread: 70,
                                        origin: { y: 0.6 },
                                      });
                                    });
                                    toast.success(`Bạn nhận được ${item.deck.rewardCoins || 100} Xương!`, { icon: "🎉" });
                                    addCoins(item.deck.rewardCoins || 100);
                                    saveProgress(item.deck.id, ["claimed"]);
                                  } else if (item.completed) {
                                    // RƯƠNG ĐÃ NHẬN RỒI
                                    toast.success("Rương này bạn đã mở rồi nhé!", { icon: "👑" });
                                  }
                                } else if (item.deck.type === "story") {
                                  setActiveStoryId(item.deck.id);
                                } else if (item.deck.type === "boss_rpg") {
                                  setActiveBossRPGId(item.deck.id);
                                } else if (item.deck.type && item.deck.type.startsWith("minigame_")) {
                                  setActiveMinigameId(item.deck.id);
                                } else {
                                  router.push(`/deck/${item.deck.id}`);
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
