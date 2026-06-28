"use client";

import React from "react";
import { motion } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { parseFurigana } from "@/utils/textParser";

interface CassetteCardProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
  showFurigana: boolean;
  podcastIsPlaying: boolean;
  exitDir: "left" | "right" | "none";
}

export function CassetteCard({
  card,
  isFlipped,
  onFlip,
  showFurigana,
  podcastIsPlaying,
  exitDir,
}: CassetteCardProps) {
  // Animation cho transition khi chuyển card
  const cardVariants: any = {
    initial: { opacity: 0, scale: 0.8, y: 30 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: (dir: string) => ({
      x: dir === "right" ? 400 : dir === "left" ? -400 : 0,
      y: dir !== "none" ? 80 : 0,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-[450px] cursor-pointer"
      onClick={onFlip}
      variants={cardVariants}
      custom={exitDir}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="w-full h-full relative pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 22 }}
      >
        {/* ==========================================
            MẶT TRƯỚC: CARD TRẮNG SỮA LỚN CHỨA CASSETTE & CHỮ
            ========================================== */}
        <div
          className="absolute inset-0 w-full h-full select-none"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Card trắng sữa lớn bo góc cực rộng */}
          <div className="w-full h-full bg-white/70 backdrop-blur-md border-4 border-white/80 rounded-[2.5rem] shadow-[0_16px_36px_rgba(74,48,109,0.06)] p-6 flex flex-col justify-between relative overflow-visible">

            {/* Mascot Shiba ngủ gật trên đám mây ở phía trên bên phải (lồi ra ngoài card) */}
            <div className="absolute -top-12 right-6 z-40 flex flex-col items-center">
              <div className="relative">
                {/* Đám mây trắng mờ phía sau */}
                <svg
                  className="w-24 h-14 text-white/90 fill-current drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
                  viewBox="0 0 100 60"
                >
                  <path d="M20 35 a18 18 0 0 1 25 -15 a22 22 0 0 1 35 8 a15 15 0 0 1 2 27 l-62 0 a15 15 0 0 1 0 -20 z" />
                </svg>
                {/* Shiba nằm trên mây */}
                <img
                  src="/images/mascot/shiba-sleep-headphone.png"
                  alt="Shiba Sleep"
                  className="absolute bottom-2.5 left-4 w-15 h-15 object-contain animate-bounce"
                  style={{ animationDuration: "4s" }}
                />
              </div>
            </div>

            {/* Chữ trang trí nhỏ ở góc trái */}
            <span className="text-[10px] text-[#7C5B9E]/50 font-bold uppercase tracking-widest mt-1">
              日本語 Flashcard
            </span>

            {/* NỬA TRÊN: BĂNG CASSETTE TRANG TRÍ */}
            <div className="relative w-[300px] sm:w-[400px] aspect-[1.62/1] mx-auto mt-4 drop-shadow-[0_8px_16px_rgba(74,48,109,0.1)]">
              {/* Hai bánh răng SVG quay ở phía sau lỗ trục */}
              <div className="absolute inset-0 z-10 flex justify-between px-[65px] sm:px-[86px] items-center">
                <div
                  className={`w-[38px] h-[38px] sm:w-[50px] sm:h-[50px] transition-all duration-500 animate-spin-slow ${podcastIsPlaying ? "" : "animate-spin-paused"
                    }`}
                >
                  <img
                    src="/images/ui/cassette-reel.svg"
                    alt="reel-left"
                    className="w-full h-full"
                  />
                </div>
                <div
                  className={`w-[38px] h-[38px] sm:w-[50px] sm:h-[50px] transition-all duration-500 animate-spin-slow ${podcastIsPlaying ? "" : "animate-spin-paused"
                    }`}
                >
                  <img
                    src="/images/ui/cassette-reel.svg"
                    alt="reel-right"
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Thân Cassette */}
              <img
                src="/images/mascot/cassette-body.png"
                alt="Cassette"
                className="absolute inset-0 w-full h-full object-contain z-20"
              />
            </div>

            {/* NỬA DƯỚI: NỘI DUNG TỪ VỰNG NHẬT BẢN */}
            <div className="flex flex-col items-center justify-center text-center mt-2 mb-4 space-y-1.5">
              {/* Hán tự siêu to ở giữa */}
              <h2
                className="text-5xl sm:text-6xl font-black text-[#4A306D] tracking-wide break-all leading-normal"
                style={{
                  fontFamily: "var(--font-cherry)",
                  WebkitTextStroke: "1px rgba(255, 255, 255, 0.4)",
                }}
              >
                {card.word}
              </h2>

              {/* Romaji và Ý nghĩa chính */}
              <div className="flex flex-col items-center">
                <span className="text-md sm:text-lg font-black text-[#4A306D]/95">
                  {card.romaji} / {card.meaning}
                </span>
              </div>
            </div>

            {/* Lời nhắc chạm để lật nhỏ xinh */}
            <p className="font-rounded text-[#FF7096]/45 font-bold text-[10px] tracking-widest uppercase text-center animate-pulse mb-1"
              style={{ fontFamily: "var(--font-cute)" }}
            >
              Xem chi tiết ➜
            </p>
          </div>
        </div>

        {/* ==========================================
            MẶT SAU: CHI TIẾT VÀ CÂU VÍ DỤ
            ========================================== */}
        <div
          className="absolute inset-0 w-full h-full select-none"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Card trắng sữa lớn mặt sau */}
          <div className="w-full h-full bg-white/70 backdrop-blur-md border-4 border-white/80 rounded-[2.5rem] shadow-[0_16px_36px_rgba(74,48,109,0.06)] p-6 flex flex-col justify-between relative overflow-visible">

            {/* Mascot Shiba ngủ gật trên đám mây ở phía trên bên phải */}
            <div className="absolute -top-12 right-6 z-40 flex flex-col items-center">
              <div className="relative">
                <svg
                  className="w-24 h-14 text-white/90 fill-current drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
                  viewBox="0 0 100 60"
                >
                  <path d="M20 35 a18 18 0 0 1 25 -15 a22 22 0 0 1 35 8 a15 15 0 0 1 2 27 l-62 0 a15 15 0 0 1 0 -20 z" />
                </svg>
                <img
                  src="/images/mascot/shiba-sleep-headphone.png"
                  alt="Shiba Sleep"
                  className="absolute bottom-2.5 left-4 w-15 h-15 object-contain animate-bounce"
                  style={{ animationDuration: "4s" }}
                />
              </div>
            </div>

            {/* Chữ trang trí góc trái */}
            <span className="text-[10px] text-[#7C5B9E]/50 font-bold uppercase tracking-widest mt-1">
              Giải nghĩa từ vựng
            </span>

            {/* NỬA TRÊN: TỪ VỰNG KANJI BẢN RÚT GỌN */}
            <div className="flex flex-col items-center text-center mt-3 space-y-1">
              <h3
                className="text-3xl font-black text-[#4A306D]"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {card.word}
              </h3>
              <span className="px-3 py-0.5 bg-[#FFF0F3] border border-[#FFD6E0] text-[#FF7096] rounded-full font-rounded font-bold text-[9px] tracking-wider uppercase">
                {card.romaji}
              </span>
            </div>

            {/* Dòng kẻ ngăn cách mờ */}
            <div className="border-t border-dashed border-[#FFD6E0] my-2" />

            {/* NỬA DƯỚI: NGHĨA VÀ VÍ DỤ TRÊN NỀN GHI CHÚ COZY */}
            <div className="flex-1 flex flex-col justify-center space-y-3 px-2">
              {/* Ý nghĩa tiếng Việt */}
              <div className="text-center">
                <p className="text-lg font-rounded font-black text-[#4A306D] leading-snug">
                  {card.meaning}
                </p>
              </div>

              {/* Câu ví dụ có Furigana */}
              {card.example_jp && (
                <div className="bg-[#FFFDF9]/80 border-2 border-white rounded-2xl p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                  <p className="text-sm sm:text-base font-bold text-[#4A306D] leading-relaxed [&_rt]:text-[#FF7096]/95">
                    {card.example_jp_formatted
                      ? parseFurigana(card.example_jp_formatted, showFurigana)
                      : card.example_jp}
                  </p>
                  <p className="text-xs font-rounded font-semibold text-[#7C5B9E]/85 mt-1 leading-snug">
                    {card.example_vi}
                  </p>
                </div>
              )}
            </div>

            {/* Lời nhắc quay lại */}
            <p className="font-rounded text-[#FF7096]/45 font-bold text-[10px] tracking-widest uppercase text-center animate-pulse mt-2"
              style={{ fontFamily: "var(--font-cute)" }}
            >
              Lật lại ➜
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
