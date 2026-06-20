"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { useSystemRoadmap, SystemDeck } from "@/hooks/roadmap/useSystemRoadmap";
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div className="w-12 h-12 border-4 border-[#FFD166] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-rounded font-bold text-zinc-400">
          Đang tải bản đồ... 🗺️
        </p>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white/60 border-4 border-dashed border-[#FF7096] rounded-[3rem] text-center shadow-sm">
        <span className="text-[5rem] mb-4 animate-bounce block select-none">
          🗺️
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
      ) : !user ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm sm:max-w-md mt-4 flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-white/90 to-[#E0F7FA]/40 border-4 border-dashed border-[#ff7096]/60 rounded-[3rem] text-center shadow-sm relative overflow-hidden min-h-[500px]"
        >
          {/* Nền mờ tạo chiều sâu */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/90 backdrop-blur-[2px]" />

          {/* Cụm thông báo trung tâm */}
          <div className="flex flex-col items-center justify-center text-center z-10">
            <div className="relative mb-8 mt-4">
              <div className="absolute inset-0 bg-[#FFD166] blur-xl rounded-full opacity-60 animate-pulse" />
              <div className="relative w-28 h-28 bg-white/95 rounded-full flex items-center justify-center shadow-[0_8px_0_0_#FFE2D1] border-4 border-white animate-pulse">
                <img src="/images/decorations/decoration_14.gif" alt="Decoration" className="w-full h-full object-contain" />
              </div>
            </div>
            
            <h3 className="text-4xl text-[#FF7096] mb-4 drop-shadow-sm leading-tight" style={{ fontFamily: "var(--font-cherry)" }}>
              Vùng Đất<br/>Mây Mù
            </h3>
            <p className="font-rounded font-bold text-zinc-500 bg-white/95 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border-2 border-white max-w-[320px] leading-relaxed text-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Hành trình phía trước đang bị sương mù che khuất! Đăng nhập ngay để vén màn mây và bắt đầu phiêu lưu nhé ☁️✨
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm sm:max-w-md mt-2 flex flex-col items-center relative"
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

                {/* BANNER CHƯƠNG (Chapter Header) */}
                <div className={`w-full border-4 rounded-[2rem] p-4 mb-6 text-center z-20 relative overflow-hidden ${colorStyle.bg} ${colorStyle.border} ${colorStyle.shadow}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-white/10 to-black/0 pointer-events-none" />
                  <h3 
                    className="text-2xl sm:text-3xl text-white drop-shadow-md mb-2"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    Chương {chapterNum} {isFullyCompleted ? "🏆" : "🗺️"}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-32 sm:w-40 h-2.5 bg-black/20 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isFullyCompleted ? "bg-white" : "bg-[#FFD166]"}`}
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold font-rounded text-xs text-white/90">
                      {completedCount}/{totalCount}
                    </span>
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

                    const decorationVariants : any = {
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
                            if (item.deck.type === "chest") {
                              if (item.unlocked &&!item.completed) {
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
      )}
    </div>
  );
}
