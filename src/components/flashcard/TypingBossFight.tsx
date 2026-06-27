"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { useTypingMode } from "@/hooks/flashcard/useTypingMode";
import { Brain, LifeBuoy, Send, Sparkles } from "lucide-react";

interface TypingBossFightProps {
  card: FlashcardData;
  onCorrect: () => void;
  onCancel: () => void; // Nút để thoát chế độ Boss Fight quay về quẹt thẻ
  onWrong?: () => void;
  onHint?: () => void;
}

export function TypingBossFight({
  card,
  onCorrect,
  onCancel,
  onWrong,
  onHint,
}: TypingBossFightProps) {
  const {
    inputValue,
    setInputValue,
    status,
    isShaking,
    hintLevel,
    handleSubmit,
    handleProvideHint,
    getHintString,
  } = useTypingMode({ currentCard: card, onCorrect, onWrong });

  const inputRef = useRef<HTMLInputElement>(null);

  // Cấu hình màu sắc viền dựa trên trạng thái (Đúng / Sai / Đang gõ)
  const statusStyles = {
    typing:
      "bg-white/65 border-white/80 focus:bg-white/90 focus:border-[#5390D9] text-teal-950 placeholder:text-zinc-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:shadow-[0_4px_12px_rgba(83,144,217,0.15)]",
    wrong:
      "border-pink-300 bg-pink-100/60 text-pink-700 placeholder:text-pink-400/50 shadow-inner",
    correct:
      "border-teal-300 bg-teal-100/60 text-teal-800 placeholder:text-teal-400/50 shadow-inner",
  };

  return (
    <div className="w-full max-w-md h-[400px] sm:h-[450px] bg-gradient-to-br from-[#FFEAF2]/75 via-white/55 to-[#E6FAF7]/75 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-[0_16px_40px_rgba(83,144,217,0.12)] relative flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Họa tiết trang trí lấp lánh */}
      <span className="absolute top-8 left-4 text-xl select-none opacity-50 animate-bounce">🌸</span>
      <span className="absolute top-4 right-1/3 text-md select-none opacity-30 text-amber-400">⭐</span>
      <span className="absolute bottom-8 left-6 text-lg select-none opacity-40">🍃</span>
      <span className="absolute bottom-16 right-4 text-xl select-none opacity-40 animate-pulse">✨</span>

      {/* Nút Hủy (Thoát ải) */}
      <button
        onClick={onCancel}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 font-rounded font-bold text-xs text-zinc-500 hover:text-zinc-700 px-3 py-1 bg-white/40 hover:bg-white/60 rounded-full border border-white/50 active:scale-95 transition-all shadow-sm backdrop-blur-sm z-10 cursor-pointer"
      >
        🏃{" "}
        <span
          style={{
            fontFamily: "var(--font-cherry)",
            letterSpacing: "1px",
            paddingTop: "2px",
          }}
        >
          Kó qá
        </span>
      </button>

      {/* HEADER: Chế độ Vượt Ải */}
      <div className="flex flex-col items-center mt-8 sm:mt-9">
        <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 text-teal-800 px-3 py-1 rounded-xl border border-teal-200/50 font-rounded font-black text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4 shadow-sm backdrop-blur-sm">
          <Brain size={14} className="text-teal-600" />{" "}
          <span style={{ fontFamily: "var(--font-cherry)" }}>Nhớ đi nào !</span>
        </div>
      </div>

      {/* KHU VỰC TỪ VỰNG (Ẩn phiên âm) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center w-full relative">
        <AnimatePresence mode="wait">
          {status === "correct" ? (
            // HIỆU ỨNG KHI GÕ ĐÚNG (Confetti & Chữ hiện to)
            <motion.div
              key="correct-view"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { type: "spring", bounce: 0.6 },
              }}
              className="flex flex-col items-center text-[#06D6A0]"
            >
              <Sparkles className="w-12 h-12 mb-2 animate-spin-slow" />
              <h3
                className="text-5xl"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {card.word}
              </h3>
              <p className="font-rounded font-black text-xl mt-2">
                {card.romaji || card.reading}
              </p>
            </motion.div>
          ) : (
            // TRẠNG THÁI BÌNH THƯỜNG (Câu đố)
            <motion.div
              key="question-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <h3
                className="text-5xl sm:text-6xl text-teal-800 tracking-wide mb-2 sm:mb-3 filter drop-shadow-[0_2px_0_rgba(255,226,209,1)]"
                style={{
                  fontFamily: "var(--font-cherry)",
                  WebkitTextStroke: "1px #FFF"
                }}
              >
                {card.word}
              </h3>
              {/* <p className="font-rounded font-black text-xl sm:text-2xl text-zinc-700 px-2">
                {card.meaning}
              </p> */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GỢI Ý (Nếu có bấm nút Phao Bơi) */}
        {hintLevel > 0 && status !== "correct" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-2 font-rounded font-black text-lg text-indigo-600 tracking-[0.2em] bg-indigo-100/40 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-indigo-200/30 shadow-sm"
          >
            {getHintString()}
          </motion.div>
        )}
      </div>

      {/* KHU VỰC NHẬP LIỆU (Bubble Input) */}
      <div className="w-full mt-2 sm:mt-4 flex gap-1.5 sm:gap-2 z-10">
        {/* Nút Gợi ý (Phao bơi) */}
        <button
          onClick={() => {
            handleProvideHint();
            onHint?.();
          }}
          disabled={status === "correct"}
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-gradient-to-br from-amber-100/80 to-amber-200/90 text-amber-700 hover:from-amber-200 hover:to-amber-300 border border-amber-300/40 rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="Xin gợi ý"
        >
          <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </button>

        {/* Form nhập liệu có hiệu ứng Rung lắc (Wiggle) */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex-1 relative"
          animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={(e) => {
              // Delay 300ms chờ bàn phím điện thoại bật lên hoàn toàn rồi mới đẩy UI lên trung tâm
              setTimeout(() => {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 300);
            }}
            disabled={status === "correct"}
            placeholder="Gõ Romaji hoặc Kana..."
            className={`w-full h-12 sm:h-14 pl-4 sm:pl-5 pr-12 sm:pr-14 rounded-xl sm:rounded-2xl border-2 text-center font-rounded font-black text-lg sm:text-xl transition-all focus:outline-none placeholder:font-bold placeholder:text-sm sm:placeholder:text-base placeholder:text-zinc-300/70 ${statusStyles[status]}`}
            style={
              status === "correct" ? { fontFamily: "var(--font-cherry)" } : {}
            } // Chữ đổi sang style cute khi gõ đúng
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || status === "correct"}
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-[#5390D9] hover:from-teal-600 hover:to-[#417ac0] text-white rounded-lg sm:rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer"
          >
            <Send
              className="w-4 h-4 sm:w-[18px] sm:h-[18px] ml-0.5"
              strokeWidth={3}
            />
          </button>
        </motion.form>
      </div>
    </div>
  );
}
