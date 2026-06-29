"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import confetti from "canvas-confetti";

import { KanjiCanvas, KanjiCanvasRef } from "@/components/games/kanji-dojo/KanjiCanvas";
import { CustomDeck } from "@/store/useAppStore";

interface KanjiPracticeProps {
  deck: CustomDeck;
  onClose: () => void;
}

export function KanjiPractice({ deck, onClose }: KanjiPracticeProps) {
  const { kanjiList = [], title } = deck;
  const totalKanji = kanjiList.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const canvasRef = useRef<KanjiCanvasRef>(null);

  const filteredKanji = kanjiList
    .map((item, idx) => {
      const char = typeof item === "string" ? item : item.char;
      const meaning = typeof item === "string" ? "" : item.meaning;
      return { char, meaning, index: idx };
    })
    .filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        item.char.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query)
      );
    });

  const currentItem = kanjiList[currentIndex] || { char: "", meaning: "" };
  const currentCharacter = typeof currentItem === "string" ? currentItem : currentItem.char;
  const currentMeaning = typeof currentItem === "string" ? "" : currentItem.meaning;

  // --- SFX & EFFECTS ---
  const playSound = useCallback((src: string, volume: number = 0.5) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }, []);

  const handleCorrectStroke = useCallback(() => {
    playSound("/sounds/brush.mp3", 0.6);
  }, [playSound]);

  const handleMistake = useCallback(() => {
    playSound("/sounds/wrong.mp3", 0.3); // Tiếng gõ nhẹ nhắc nhở (không trừ máu)
  }, [playSound]);

  const handleComplete = useCallback(() => {
    // playSound("/sounds/gong.mp3", 0.5);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#18181B", "#52525B", "#E4E4E7"], // Tone màu mực xám đen
      zIndex: 2000,
    });
  }, [playSound]);

  const handleAnimate = () => {
    if (canvasRef.current) canvasRef.current.animateCharacter();
  };

  // handlePeek removed to support the simplified two-button control set.

  const handleReset = () => {
    playSound("/sounds/brush.mp3", 0.8); // Tiếng xẹt xẹt dọn bảng
    if (canvasRef.current) canvasRef.current.resetCanvas();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalKanji - 1) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-[#F0FAF5] to-[#E0F7FA] relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[#05B889] text-xl sm:text-2xl font-black drop-shadow-sm truncate" style={{ fontFamily: "var(--font-cherry)" }}>
              {title}
            </h2>
            <button
              onClick={() => setIsSearching(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-50 text-[#06D6A0] hover:bg-teal-100 border border-[#A0E8D5] shadow-sm transition-colors shrink-0"
            >
              <Search className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-teal-600/70 font-bold text-sm font-rounded">Luyện tập tự do không áp lực</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 shadow-sm transition-colors border-2 border-zinc-200 shrink-0">
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 max-w-md mx-auto">
        <div className="text-center mb-6">
          <span className="text-[#06D6A0] font-black tracking-widest text-xs sm:text-sm bg-teal-50 px-5 py-2 rounded-2xl border-4 border-[#A0E8D5] shadow-sm"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {currentIndex + 1} / {totalKanji}
          </span>
        </div>

        <motion.div
          className="relative p-3 sm:p-4 bg-white rounded-[2.5rem] shadow-[0_12px_0_0_#A0E8D5] border-4 border-[#A0E8D5] w-full max-w-[320px] aspect-square flex items-center justify-center"
        >
          {currentCharacter ? (
            <KanjiCanvas
              ref={canvasRef}
              character={currentCharacter}
              onCorrectStroke={handleCorrectStroke}
              onMistake={handleMistake}
              onComplete={handleComplete}
            />
          ) : (
            <p className="font-bold text-zinc-400 font-rounded">Không có dữ liệu</p>
          )}
        </motion.div>

        {/* Target Display */}
        <div className="mt-10 bg-white px-8 py-4 rounded-[2rem] border-4 border-[#5390D9] shadow-[0_8px_0_0_#5390D9] text-center min-w-[220px] flex flex-col items-center">
          <h3 className="text-4xl text-[#5390D9] drop-shadow-sm mb-2" style={{ fontFamily: "var(--font-cherry)" }}>
            {currentCharacter || "?"}
          </h3>
          {currentMeaning && (
            <p className="text-blue-800 text-sm font-bold bg-[#E8F0FE] px-4 py-1.5 rounded-xl border-2 border-[#A0C4FF] shadow-inner" style={{ fontFamily: "var(--font-rounded)" }}>
              {currentMeaning}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col gap-5 mt-6 relative z-10 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={handleReset}
            className="h-10 px-5 bg-white/10 dark:bg-black/20 backdrop-blur-md text-zinc-700 dark:text-zinc-200 rounded-full border border-white/20 dark:border-white/10 shadow-lg flex items-center justify-center gap-1.5 font-bold transition-all text-sm hover:bg-white/20 active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            <span style={{ fontFamily: "var(--font-rounded)" }}>Xóa bảng</span>
          </button>
          <button
            onClick={handleAnimate}
            className="h-10 px-5 bg-white/10 dark:bg-black/20 backdrop-blur-md text-teal-700 dark:text-teal-300 rounded-full border border-white/20 dark:border-white/10 shadow-lg flex items-center justify-center gap-1.5 font-bold transition-all text-sm hover:bg-white/20 active:translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span style={{ fontFamily: "var(--font-rounded)" }}>Toàn bộ</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between gap-4 px-2">
          <button onClick={handlePrev} disabled={currentIndex === 0} className="w-12 h-12 bg-white text-[#5390D9] rounded-2xl border-2 border-[#A0C4FF] shadow-[0_4px_0_0_#A0C4FF] active:translate-y-1 active:shadow-none flex items-center justify-center transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#A0C4FF]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center font-rounded font-bold text-[#5390D9]/80 text-sm">
            Điều hướng
          </div>
          <button onClick={handleNext} disabled={currentIndex === totalKanji - 1} className="w-12 h-12 bg-white text-[#5390D9] rounded-2xl border-2 border-[#A0C4FF] shadow-[0_4px_0_0_#A0C4FF] active:translate-y-1 active:shadow-none flex items-center justify-center transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#A0C4FF]">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-md z-30 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border border-white/30 dark:border-zinc-700/30 rounded-[2.5rem] shadow-2xl p-6 w-full max-w-sm flex flex-col max-h-[80%] relative"
            >
              {/* Close Search */}
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery("");
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-zinc-500 hover:text-zinc-700 border border-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <h4 className="text-zinc-800 dark:text-zinc-100 text-lg font-black mb-4 pr-8" style={{ fontFamily: "var(--font-cherry)" }}>
                Tìm kiếm chữ Hán
              </h4>

              {/* Search input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập chữ hoặc Hán Việt..."
                  className="w-full h-11 pl-4 pr-10 rounded-2xl bg-white/50 border-2 border-teal-200 outline-none focus:border-[#06D6A0] transition-colors text-sm font-semibold text-zinc-700 placeholder-zinc-400"
                  style={{ fontFamily: "var(--font-rounded)" }}
                  autoFocus
                />
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>

              {/* List of Kanji */}
              <div className="flex-1 overflow-y-auto no-scrollbar gap-2 flex flex-col pr-1">
                {filteredKanji.length > 0 ? (
                  filteredKanji.map((item) => (
                    <button
                      key={item.index}
                      onClick={() => {
                        setCurrentIndex(item.index);
                        setIsSearching(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/45 hover:bg-white/80 dark:bg-zinc-800/45 dark:hover:bg-zinc-800/80 border border-white/20 hover:border-teal-200 transition-all text-left group"
                    >
                      <span className="text-2xl text-teal-600 group-hover:scale-110 transition-transform font-cherry font-black">
                        {item.char}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-700 dark:text-zinc-200 font-bold text-xs truncate" style={{ fontFamily: "var(--font-rounded)" }}>
                          {item.meaning}
                        </p>
                        <p className="text-zinc-400 text-[10px] font-medium mt-0.5">
                          Số thứ tự: {item.index + 1}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400 font-bold text-xs font-rounded">
                    Không tìm thấy kết quả phù hợp
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}