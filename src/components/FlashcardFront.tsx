import React from "react";
import { FlashcardData } from "@/types/flashcard";

interface FlashcardFrontProps {
  card: FlashcardData;
}

export const FlashcardFront: React.FC<FlashcardFrontProps> = ({ card }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#FFFDF5] rounded-2xl border-4 border-[#FFE2D1] shadow-[0_12px_0_0_#FFE2D1] cursor-pointer relative overflow-hidden group transition-transform active:scale-95 duration-200">
      
      {/* Trang trí góc lấp lánh */}
      <div className="absolute top-8 right-8 text-[#FFD166] text-3xl opacity-60 group-hover:rotate-12 transition-transform">
        ✨
      </div>
      <div className="absolute bottom-8 left-8 text-[#FFD166] text-2xl opacity-40 group-hover:-rotate-12 transition-transform">
        ⭐
      </div>
      
      {/* Kanji/Từ vựng khổng lồ (Hiệu ứng Sticker) */}
      <h2 
        className="text-7xl sm:text-8xl text-[#FF9F1C] tracking-wide text-center"
        style={{ 
          fontFamily: "var(--font-cherry)",
          WebkitTextStroke: "2px #FFF", // Viền trắng nổi bật
          filter: "drop-shadow(0px 8px 0px rgba(255, 226, 209, 1))" // Bóng đổ khối cứng
        }}
      >
        {card.word}
      </h2>

      {/* Lời nhắc lật bài cute */}
      <p className="absolute bottom-8 font-rounded text-amber-700/40 font-bold text-sm tracking-widest uppercase animate-pulse">
        Chạm để lật bài
      </p>
    </div>
  );
};