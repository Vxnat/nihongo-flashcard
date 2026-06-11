"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { useTypingMode } from "@/hooks/useTypingMode";
import { Brain, LifeBuoy, Send, Sparkles } from "lucide-react";

interface TypingBossFightProps {
  card: FlashcardData;
  onCorrect: () => void;
  onCancel: () => void; // Nút để thoát chế độ Boss Fight quay về quẹt thẻ
  onWrong?: () => void;
}

export function TypingBossFight({
  card,
  onCorrect,
  onCancel,
  onWrong,
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

  // Tự động focus vào ô nhập liệu khi vừa mở lên
  useEffect(() => {
    inputRef.current?.focus();
  }, [card.id]);

  // Cấu hình màu sắc viền dựa trên trạng thái (Đúng / Sai / Đang gõ)
  const statusStyles = {
    typing:
      "border-zinc-200 focus:border-[#5390D9] shadow-[0_4px_0_0_#E4E4E7] focus:shadow-[0_4px_0_0_#5390D9]",
    wrong:
      "border-[#FF7096] bg-[#FFF0F3] text-[#C7486B] shadow-[0_4px_0_0_#FF7096]",
    correct:
      "border-[#06D6A0] bg-[#F0FAF5] text-[#048c68] shadow-[0_4px_0_0_#06D6A0]",
  };

  return (
    <div className="w-full max-w-md h-[450px] bg-[#FDFBF7] rounded-[2.5rem] border-4 border-[#5390D9] shadow-[0_12px_0_0_#5390D9] relative flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Nút Hủy (Thoát ải) */}
      <button
        onClick={onCancel}
        className="absolute top-4 left-4 font-rounded font-bold text-xs text-zinc-400 hover:text-zinc-600 px-3 py-1 bg-white rounded-full border-2 border-zinc-200 active:translate-y-0.5 active:shadow-none shadow-[0_2px_0_0_#e4e4e7] transition-all"
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
      <div className="flex flex-col items-center mt-10">
        <div className="bg-[#E0F7FA] text-[#00ACC1] px-3 py-1 rounded-xl border-2 border-[#80DEEA] font-rounded font-black text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4 shadow-sm">
          <Brain size={14} />{" "}
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
                className="text-6xl text-[#FF9F1C] drop-shadow-sm mb-3"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {card.word}
              </h3>
              <p className="font-rounded font-black text-2xl text-teal-800">
                {card.meaning}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GỢI Ý (Nếu có bấm nút Phao Bơi) */}
        {hintLevel > 0 && status !== "correct" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-2 font-rounded font-black text-lg text-indigo-400 tracking-[0.2em] bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100"
          >
            {getHintString()}
          </motion.div>
        )}
      </div>

      {/* KHU VỰC NHẬP LIỆU (Bubble Input) */}
      <div className="w-full mt-4 flex gap-2">
        {/* Nút Gợi ý (Phao bơi) */}
        <button
          onClick={handleProvideHint}
          disabled={status === "correct"}
          className="w-14 h-14 shrink-0 bg-white border-4 border-[#FFD166] rounded-2xl shadow-[0_4px_0_0_#FFD166] flex items-center justify-center text-[#FF9F1C] hover:bg-[#FFF9E6] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0"
          title="Xin gợi ý"
        >
          <LifeBuoy strokeWidth={2.5} />
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
            className={`w-full h-14 pl-5 pr-14 rounded-2xl border-4 text-center font-rounded font-black text-xl transition-colors focus:outline-none placeholder:font-bold placeholder:text-base placeholder:text-zinc-300 ${statusStyles[status]}`}
            style={
              status === "correct" ? { fontFamily: "var(--font-cherry)" } : {}
            } // Chữ đổi sang style cute khi gõ đúng
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || status === "correct"}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#5390D9] text-white rounded-xl flex items-center justify-center shadow-[0_3px_0_0_#305f94] active:translate-y-0.5 active:shadow-none transition-all disabled:bg-zinc-300 disabled:shadow-[0_3px_0_0_#a1a1aa]"
          >
            <Send size={18} strokeWidth={3} className="ml-0.5" />
          </button>
        </motion.form>
      </div>
    </div>
  );
}
