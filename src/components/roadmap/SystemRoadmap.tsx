"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock, Sparkles } from "lucide-react";
import { useSystemRoadmap } from "@/hooks/roadmap/useSystemRoadmap";
import { useAppStore } from "@/store/useAppStore";
import { RoadmapNode } from "./RoadmapNode";
import { generateSVGPath, getZigZagOffset } from "@/utils/roadmapHelpers";
import { MAP_DECORATIONS } from "@/constants/mapDecorations";
import toast from "react-hot-toast";


export function SystemRoadmap() {
  const router = useRouter();
  const { isLoading, decks, selectedLevel, setSelectedLevel, deckStatuses } =
    useSystemRoadmap();
  const user = useAppStore((state: any) => state.user);
  const setActiveStoryId = useAppStore((state: any) => state.setActiveStoryId);
  const setActiveMinigameId = useAppStore((state: any) => state.setActiveMinigameId);
  const addCoins = useAppStore((state) => state.addCoins);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const loginWithGoogle = useAppStore((state: any) => state.loginWithGoogle);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isCardHovered, setIsCardHovered] = useState(false);



  const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
  const ROW_HEIGHT = 170; // Đã tăng khoảng cách chiều dọc từ 130 lên 170 để nhường khoảng trống cho Tooltip

  const CHAPTER_COLORS = [
    { bg: "bg-[#06D6A0]", border: "border-[#05B889]", shadow: "shadow-[0_6px_0_0_#04966F]" },
    { bg: "bg-[#FF7096]", border: "border-[#C7486B]", shadow: "shadow-[0_6px_0_0_#C7486B]" },
    { bg: "bg-[#5390D9]", border: "border-[#305f94]", shadow: "shadow-[0_6px_0_0_#305f94]" },
    { bg: "bg-[#FF9F1C]", border: "border-[#D97706]", shadow: "shadow-[0_6px_0_0_#D97706]" },
    { bg: "bg-[#B28DFF]", border: "border-[#8A56D6]", shadow: "shadow-[0_6px_0_0_#8A56D6]" },
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
      {/* DROPDOWN CHỌN CẤP ĐỘ (Chỉ hiển thị khi đã đăng nhập) */}
      {user && (
        <div className="w-full flex justify-end mb-4 sm:mb-8 relative z-40">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-2 border-[#FFE2D1] shadow-sm px-4 py-2.5 rounded-full font-bold text-amber-900 transition-all hover:bg-orange-50 active:translate-y-1"
            >
              <span style={{ fontFamily: "var(--font-cherry)" }}>
                Trình độ {selectedLevel}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                strokeWidth={3}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-36 bg-white border-4 border-[#FFE2D1] rounded-[1.5rem] shadow-xl overflow-hidden flex flex-col z-50"
                >
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedLevel(lvl);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 font-bold text-base text-left transition-colors hover:bg-orange-50 ${selectedLevel === lvl ? "text-[#FF9F1C] bg-orange-50/50" : "text-zinc-500"}`}
                      style={{ fontFamily: "var(--font-cherry)" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {deckStatuses.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white/60 border-4 border-dashed border-[#FFD166] rounded-[3rem] text-center shadow-sm mt-4">
          <span className="text-[5rem] mb-4 animate-bounce block select-none">
            🚧
          </span>
          <h3
            className="text-3xl text-[#FF9F1C] mb-2 drop-shadow-sm"
            style={{ fontFamily: "var(--font-cherry)" }}
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
              <motion.div
                onMouseEnter={() => setIsCardHovered(true)}
                onMouseLeave={() => setIsCardHovered(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-white/80 backdrop-blur-md border-4 border-[#FFE2D1] rounded-[2.5rem] shadow-xl p-6 sm:p-8 flex flex-col items-center text-center max-w-sm w-full relative z-20 mt-10 hover:shadow-2xl transition-shadow duration-300 pointer-events-auto"
              >
                {/* Style keyframe cho hiệu ứng shimmer */}
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .shimmer-effect {
                    animation: shimmer 2s infinite;
                  }
                `}</style>

                {/* Ảnh Shiba thám hiểm dễ thương mới tạo */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#FFD166]/40 blur-xl rounded-full opacity-60 animate-pulse" />
                  <div className="relative w-28 h-28 bg-white/95 rounded-full flex items-center justify-center shadow-[0_8px_0_0_#FFE2D1] border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-105">
                    <img
                      src="/images/mascot/shiba_explorer_hi.png"
                      alt="Shiba Explorer"
                      className="w-24 h-24 object-contain mt-1"
                    />
                  </div>
                </div>

                <h3
                  className="text-3xl text-[#FF7096] mb-3 drop-shadow-sm leading-tight"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Vùng Đất Mây Mù
                </h3>
                <p className="font-rounded font-bold text-zinc-500 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-[1.5rem] shadow-inner border border-dashed border-[#FFE2D1] leading-relaxed text-sm mb-6 max-w-[280px]"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Hành trình phía trước đang bị sương mù che phủ. Cùng Shiba để thám hiểm con đường chinh phục tiếng Nhật nhé! 🐾
                </p>

                {/* NÚT ĐĂNG NHẬP GOOGLE 3D PREMIUM */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loginWithGoogle}
                  className="relative group w-full py-4 px-6 bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] hover:from-[#ff5882] hover:to-[#f08b00] rounded-2xl font-bold font-rounded text-white flex items-center justify-center gap-3 transition-colors shadow-[0_6px_0_0_#C7486B] hover:shadow-[0_4px_0_0_#C7486B] active:shadow-none active:translate-y-[6px] transition-transform duration-100 overflow-hidden border-2 border-white/20 cursor-pointer"
                >
                  {/* Sheen effect (Ánh sáng trượt qua nút) */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer-effect" />

                  <span style={{ fontFamily: "var(--font-cherry)" }} className="tracking-wide">
                    Khám phá ngay
                  </span>
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* ROADMAP THỰC TẾ (BỊ MỜ KHI CHƯA ĐĂNG NHẬP) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-sm sm:max-w-md mt-2 flex flex-col items-center relative transition-all duration-700 ${!user
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

              return (
                <div key={chapterNum} className="w-full flex flex-col items-center">
                  {/* 🚧 VÁCH NGĂN VẬT LÝ GIỮA CÁC CHƯƠNG */}
                  {idx > 0 && (
                    <div className="w-full flex items-center justify-center mb-10 relative z-10 pointer-events-none">
                      {/* Dải phân cách trải dài hết chiều ngang màn hình */}
                      <div className="absolute w-screen max-w-2xl h-4 bg-[#E4E4E7]/60 rounded-full shadow-inner border-y-2 border-[#D4D4D8]/30 left-1/2 -translate-x-1/2" />
                      <div className="z-10 bg-[#FFFDF5] p-3 rounded-full border-4 border-[#D4D4D8] shadow-sm text-zinc-400">
                        <Lock className="w-6 h-6" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {/* BANNER CHƯƠNG (Chapter Header) - Concept 1: Huy hiệu tròn 2 cột */}
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
                                stroke={isFullyCompleted ? "#FFFFFF" : "#FFD166"}
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
                    {/* ĐƯỜNG NỐI SVG (Xám - Hành trình phía trước) */}
                    <svg
                      className="absolute top-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
                      // The viewBox needs to be wide enough to contain the entire zig-zag path.
                      // The path goes from -75px to +75px, so a width of 150 is needed. We add padding.
                      viewBox={`-85 0 170 ${(items.length) * ROW_HEIGHT}`}
                      width="170"
                    >
                      <path
                        d={generateSVGPath(items.length, ROW_HEIGHT, ROW_HEIGHT / 2)}
                        fill="none"
                        stroke="#E4E4E7"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* ĐƯỜNG NỐI SVG (Vàng - Hành trình đã qua) */}
                      {pathCompletedCount > 0 && (
                        <path
                          d={generateSVGPath(pathCompletedCount, ROW_HEIGHT, ROW_HEIGHT / 2)}
                          fill="none"
                          stroke="#FFD166"
                          strokeWidth="20"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>

                    {/* CÁC NÚT BÀI HỌC */}
                    {items.map((item, idx) => {
                      const isActive = item.deck.id === activeDeckId;
                      const offsetX = getZigZagOffset(idx);

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

                            return (
                              <motion.div
                                className={`absolute top-1/2 ${decoration.yOffset} ${decoration.isLeft ? "left-2 sm:-left-12" : "right-2 sm:-right-12"} ${decoration.sizeClass} ${decoration.opacity} -z-10 select-none pointer-events-none`}
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
                            unlocked={item.unlocked}
                            completed={item.completed}
                            isActive={isActive}
                            index={idx}
                            offsetX={offsetX}
                            onClick={() => {
                              // HƯỚNG DẪN: Nếu muốn chặn click vào bài học đang bị khóa (ví dụ khi đưa lên production),
                              // bạn chỉ cần bỏ comment đoạn code check điều kiện dưới đây:
                              /*
                              if (!item.unlocked && item.deck.type !== "chest") {
                                toast.error(`Bài học "${item.deck.title}" đang bị khóa!`);
                                return;
                              }
                              */

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
                              } else if (item.deck.type === "minigame_matching" || item.deck.type === "minigame_kanji" || item.deck.type === "minigame_rush") {
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
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
