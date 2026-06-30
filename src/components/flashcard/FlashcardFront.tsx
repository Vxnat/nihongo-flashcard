import React from "react";
import { FlashcardData } from "@/types/flashcard";
import { Sparkles, Star } from "lucide-react";

interface FlashcardFrontProps {
  card: FlashcardData;
  isZen?: boolean;
}

export const FlashcardFront: React.FC<FlashcardFrontProps> = ({ card, isZen = false }) => {
  if (isZen) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group transition-all duration-500">
        {/* Trang trí góc lấp lánh (phát sáng neon) */}
        <div className="absolute top-8 right-8 text-pink-300 opacity-80 animate-pulse" style={{ filter: "drop-shadow(0 0 6px rgba(244,143,177,0.8))" }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-8 left-8 text-indigo-300 opacity-60 animate-pulse" style={{ filter: "drop-shadow(0 0 6px rgba(159,168,218,0.8))" }}>
          <Star className="w-5 h-5" />
        </div>

        {/* Kanji/Từ vựng khổng lồ phát sáng neon */}
        <h2
          className="text-7xl sm:text-8xl text-white tracking-wide text-center selection:bg-pink-500/30"
          style={{
            fontFamily: "var(--font-cherry)",
            filter: "drop-shadow(0px 0px 12px rgba(255, 112, 150, 0.8)) drop-shadow(0px 0px 24px rgba(255, 112, 150, 0.4))",
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.6)"
          }}
        >
          {card.word}
        </h2>

        {/* Lời nhắc lật bài cute */}
        <p className="absolute bottom-8 font-rounded text-pink-200/50 font-bold text-xs tracking-widest uppercase animate-pulse">
          Chế độ rảnh tay
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-row items-center justify-between p-6 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] cursor-pointer relative overflow-hidden group transition-all duration-300">

      {/* Trang trí góc lấp lánh như hình ảnh */}
      <span className="absolute top-8 left-4 select-none opacity-80 animate-bounce text-pink-200"><Sparkles className="w-6 h-6" /></span>
      <span className="absolute top-4 right-1/2 select-none opacity-40 text-amber-400"><Star className="w-5 h-5" /></span>
      <span className="absolute bottom-8 left-6 select-none opacity-60 text-emerald-300"><Sparkles className="w-4 h-4" /></span>
      <span className="absolute bottom-4 right-1/2 select-none opacity-70 text-orange-200"><Sparkles className="w-6 h-6" /></span>
      <span className="absolute top-10 right-4 select-none opacity-80 text-pink-300"><Sparkles className="w-5 h-5" /></span>

      {/* Left Column: Kanji / Reading hint */}
      <div className="w-[53%] flex flex-col justify-center items-start pl-2 select-none h-full">
        {/* Kanji/Từ vựng khổng lồ (Hiệu ứng Sticker) */}
        <h2
          className="text-5xl sm:text-6xl text-teal-800 tracking-wide text-left mb-4 break-all leading-normal"
          style={{
            fontFamily: "var(--font-cherry)",
            WebkitTextStroke: "1.5px #FFF", // Viền trắng nổi bật
            filter: "drop-shadow(0px 4px 0px rgba(255, 226, 209, 1))" // Bóng đổ khối cứng
          }}
        >
          {card.word}
        </h2>

        {/* Lời nhắc lật bài cute */}
        <p className="font-rounded text-teal-800/40 font-bold text-xs tracking-widest uppercase animate-pulse mt-2">
          Chạm để xem nghĩa ➜
        </p>
      </div>

      {/* Right Column: Shiba Room illustration */}
      <div className="w-[44%] flex items-center justify-center h-full py-4">
        <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white/80 shadow-md bg-amber-50/10">
          <img
            src="/images/mascot/shiba_quiet.png"
            alt="Shiba Room"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};