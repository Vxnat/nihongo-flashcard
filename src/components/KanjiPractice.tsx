"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Eye } from "lucide-react";
import confetti from "canvas-confetti";

import { KanjiCanvas, KanjiCanvasRef } from "@/components/KanjiCanvas";
import { CustomDeck } from "@/store/useAppStore";

interface KanjiPracticeProps {
  deck: CustomDeck;
  onClose: () => void;
}

export function KanjiPractice({ deck, onClose }: KanjiPracticeProps) {
  const { kanjiList = [], title } = deck;
  const totalKanji = kanjiList.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const canvasRef = useRef<KanjiCanvasRef>(null);

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

  const handlePeek = () => {
    if (canvasRef.current) canvasRef.current.peekNextStroke();
  };

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
        <div className="flex-1">
          <h2 className="text-[#05B889] text-xl sm:text-2xl font-black drop-shadow-sm truncate" style={{ fontFamily: "var(--font-cherry)" }}>
            {title}
          </h2>
          <p className="text-teal-600/70 font-bold text-sm font-rounded">Luyện tập tự do không áp lực ✨</p>
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
            {currentCharacter || "❓"}
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
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button onClick={handleReset} className="h-10 px-4 bg-white text-zinc-500 rounded-full border-2 border-zinc-200 shadow-[0_3px_0_0_#e4e4e7] active:translate-y-1 active:shadow-none flex items-center justify-center gap-1.5 font-bold transition-all text-sm hover:bg-zinc-50">
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} /> <span style={{ fontFamily: "var(--font-rounded)" }}>Xóa bảng</span>
          </button>
          <button onClick={handlePeek} className="h-10 px-4 bg-[#E0F7FA] text-[#00ACC1] rounded-full border-2 border-[#80DEEA] shadow-[0_3px_0_0_#80DEEA] active:translate-y-1 active:shadow-none flex items-center justify-center gap-1.5 font-bold transition-all text-sm hover:bg-[#B2EBF2]">
            <Eye className="w-4 h-4" strokeWidth={2.5} /> <span style={{ fontFamily: "var(--font-rounded)" }}>1 Nét</span>
          </button>
          <button onClick={handleAnimate} className="h-10 px-4 bg-[#FFD166] text-amber-900 rounded-full border-2 border-[#FF9F1C] shadow-[0_3px_0_0_#FF9F1C] active:translate-y-1 active:shadow-none flex items-center justify-center gap-1.5 font-bold transition-all text-sm hover:bg-[#ffc640]">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} /> <span style={{ fontFamily: "var(--font-rounded)" }}>Toàn bộ</span>
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
    </div>
  );
}