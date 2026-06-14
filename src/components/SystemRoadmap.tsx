"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock, CheckCircle2 } from "lucide-react";
import { useSystemRoadmap } from "@/hooks/useSystemRoadmap";
import { useAppStore } from "@/store/useAppStore";

export function SystemRoadmap() {
  const router = useRouter();
  const { isLoading, decks, selectedLevel, setSelectedLevel, deckStatuses } =
    useSystemRoadmap();
  const user = useAppStore((state: any) => state.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
  const BENTO_ITEMS = ["🍙", "🍱", "🍣", "🍤", "🍡", "🍵", "🍘", "🍢"];

  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

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

  // Tự động mở Chương đang học dang dở
  useEffect(() => {
    if (deckStatuses.length > 0 && expandedChapter === null) {
      let activeChap: string | null = null;
      // 1. Ưu tiên tìm chương có bài học đã mở khóa nhưng CHƯA hoàn thành
      for (const status of deckStatuses) {
        if (status.unlocked && !status.completed) {
          activeChap = (status.deck.chapter || 1).toString();
          break;
        }
      }

      // 2. Nếu đã hoàn thành hết các bài mở khóa, mở chương của bài mở khóa cuối cùng
      if (!activeChap) {
        for (let i = deckStatuses.length - 1; i >= 0; i--) {
          if (deckStatuses[i].unlocked) {
            activeChap = (deckStatuses[i].deck.chapter || 1).toString();
            break;
          }
        }
      }

      // 3. Nếu không có gì, mặc định mở chương 1
      if (!activeChap) activeChap = "1";

      setExpandedChapter(activeChap);
    }
  }, [deckStatuses, expandedChapter]);

  // Reset nắp hộp khi user đổi Level
  useEffect(() => {
    setExpandedChapter(null);
  }, [selectedLevel]);

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
      {/* DROPDOWN CHỌN CẤP ĐỘ */}
      <div className="w-full flex justify-end px-4 mb-4 sm:mb-8 relative z-40">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm sm:max-w-md mt-2 flex flex-col items-center pb-10 px-2 gap-6"
        >
          {Object.entries(chapters).map(([chapterNum, items]) => {
            const isExpanded = expandedChapter === chapterNum;
            const totalCount = items.length;
            const completedCount = items.filter(
              (item) => item.completed,
            ).length;
            const isFullyCompleted = completedCount === totalCount;

            return (
              <div key={chapterNum} className="w-full">
                {/* 🍱 NẮP HỘP (ACCORDION HEADER) - GUMMY BUTTON */}
                <button
                  onClick={() =>
                    setExpandedChapter(isExpanded ? null : chapterNum)
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-4 border-b-[6px] active:border-b-4 active:translate-y-[2px] transition-all z-10 relative shadow-sm overflow-hidden ${
                    isExpanded
                      ? "bg-gradient-to-r from-[#FFB3C6] to-[#FF7096] border-[#FFE4EE] border-b-[#C7486B]"
                      : "bg-white border-zinc-200 border-b-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <span
                    className={`font-bold font-rounded text-lg flex items-center gap-2 ${isExpanded ? "text-white drop-shadow-md" : "text-zinc-600"}`}
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    Chương {chapterNum}{" "}
                    {isFullyCompleted ? "🏆" : isExpanded ? "🍱" : "🍙"}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* MINI PROGRESS BAR */}
                    <div className="flex items-center gap-2">
                      <div className="w-12 sm:w-16 h-2 bg-black/10 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isFullyCompleted ? "bg-[#06D6A0]" : isExpanded ? "bg-white" : "bg-[#FF9F1C]"}`}
                          style={{
                            width: `${(completedCount / totalCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`font-bold font-rounded text-xs ${isExpanded ? "text-white drop-shadow-sm" : "text-zinc-500"}`}
                      >
                        {completedCount}/{totalCount}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180 text-white drop-shadow-md" : "text-zinc-400"}`}
                      strokeWidth={3}
                    />
                  </div>
                </button>

                {/* 🍱 BÊN TRONG HỘP CƠM (BENTO GRID) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="w-full bg-[#A34333] border-[12px] border-[#7A2A1E] rounded-[2rem] p-3 sm:p-4 shadow-[0_15px_0_0_#5C1A10] relative overflow-hidden">
                        {/* Lớp bóng bên trong hộp */}
                        <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none" />

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
                          {items.map((item, idx) => {
                            const foodIcon =
                              BENTO_ITEMS[idx % BENTO_ITEMS.length];
                            const isColSpan2 = idx % 3 === 2; // Cứ món thứ 3 sẽ chiếm 2 cột ngang

                            return (
                              <motion.button
                                key={item.deck.id}
                                onClick={() =>
                                  // item.unlocked &&
                                  router.push(`/deck/${item.deck.id}`)
                                }
                                // disabled={!item.unlocked}
                                whileHover={
                                  item.unlocked ? { scale: 0.97 } : {}
                                }
                                whileTap={item.unlocked ? { scale: 0.93 } : {}}
                                className={`relative flex flex-col items-center justify-center bg-[#FDFBF7] rounded-[1.2rem] shadow-[inset_0_4px_8px_rgba(0,0,0,0.05),0_4px_0_0_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden group outline-none ${
                                  isColSpan2
                                    ? "col-span-2 aspect-[2.1/1]"
                                    : "col-span-1 aspect-square"
                                } ${
                                  !item.unlocked
                                    ? "border-4 border-[#E8D5C4] cursor-not-allowed opacity-90"
                                    : item.completed
                                      ? "border-4 border-[#06D6A0] cursor-pointer"
                                      : "border-4 border-[#FF9F1C] cursor-pointer ring-4 ring-[#FF9F1C]/40 animate-pulse"
                                }`}
                              >
                                {/* TRẠNG THÁI KHÓA */}
                                {!item.unlocked && (
                                  <div className="absolute inset-0 bg-zinc-200/50 z-20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                    <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400 mb-1" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase font-rounded">
                                      Bị khóa
                                    </span>
                                  </div>
                                )}

                                {/* TRẠNG THÁI HOÀN THÀNH */}
                                {item.completed && (
                                  <div className="absolute top-2 right-2 z-20 text-[#06D6A0] bg-white rounded-full shadow-sm">
                                    <CheckCircle2
                                      className="w-5 h-5 sm:w-6 sm:h-6"
                                      fill="currentColor"
                                      stroke="white"
                                    />
                                  </div>
                                )}

                                {/* ICON MÓN ĂN */}
                                <span
                                  className={`text-5xl sm:text-6xl drop-shadow-md transition-transform duration-300 relative z-10 ${
                                    !item.unlocked
                                      ? "grayscale opacity-40"
                                      : "group-hover:scale-110 group-hover:-rotate-3"
                                  }`}
                                >
                                  {foodIcon}
                                </span>

                                {/* THÔNG TIN BÀI HỌC BÊN DƯỚI */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 flex flex-col items-center gap-1 z-10 bg-gradient-to-t from-white/90 to-transparent pt-4">
                                  <h4
                                    className={`text-xs sm:text-sm font-bold text-center leading-tight line-clamp-1 ${
                                      !item.unlocked
                                        ? "text-zinc-400"
                                        : "text-amber-900"
                                    }`}
                                    style={{ fontFamily: "var(--font-cherry)" }}
                                  >
                                    {item.deck.title}
                                  </h4>

                                  {/* THANH TIẾN ĐỘ NẾU ĐANG HỌC */}
                                  {item.unlocked && !item.completed && (
                                    <div className="w-full max-w-[80%] bg-orange-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="h-full bg-[#06D6A0]"
                                        style={{
                                          width: `${item.totalCount === 0 ? 0 : (item.learnedCount / item.totalCount) * 100}%`,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* LỚP SƯƠNG MỜ KHÓA HÀNH TRÌNH NẾU CHƯA ĐĂNG NHẬP */}
                        {!user && (
                          <div className="absolute inset-0 z-30 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg mb-4 border-4 border-[#FFE2D1] animate-bounce">
                              <Lock
                                className="w-10 h-10 text-[#FF7096]"
                                strokeWidth={2.5}
                              />
                            </div>
                            <h3
                              className="text-2xl text-amber-900 mb-2 drop-shadow-sm"
                              style={{ fontFamily: "var(--font-cherry)" }}
                            >
                              Hành Trình Bị Khóa
                            </h3>
                            <p className="font-rounded font-bold text-zinc-600 bg-white/90 px-5 py-2.5 rounded-2xl shadow-sm border-2 border-white max-w-[250px]">
                              Đăng nhập ngay để lưu tiến độ và chinh phục lộ
                              trình nhé! ✨
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
