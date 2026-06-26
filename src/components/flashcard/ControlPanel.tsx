import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Volume2,
} from "lucide-react";
import { FlashcardData } from "@/types/flashcard";

interface ControlPanelProps {
  onPrev: () => void;
  onNext: () => void;
  onFlip: () => void;
  onShuffle: () => void;
  onPlayAudio: () => void;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  card: FlashcardData;
  isZen?: boolean;
}

export function ControlPanel({
  onPrev,
  onNext,
  onFlip,
  onPlayAudio,
  currentIndex,
  totalCards,
  isFlipped,
  card,
  isZen = false,
}: ControlPanelProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-6 px-4 select-none">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* 1. NÚT BACK (Quay lại) */}
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`flex flex-col items-center justify-center py-3 sm:py-3.5 border-2 rounded-[1.25rem] backdrop-blur-md transition-all duration-300 active:scale-95 active:translate-y-[2px] disabled:opacity-30 disabled:active:scale-100 disabled:active:translate-y-0 cursor-pointer ${
            isZen
              ? "bg-gradient-to-br from-orange-500/20 to-amber-600/10 border-orange-500/30 text-orange-400 hover:from-orange-500/30 hover:to-amber-600/20 hover:text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              : "bg-gradient-to-br from-amber-100/70 via-amber-50/40 to-orange-100/70 border-orange-200 text-orange-600 hover:from-amber-200/70 hover:to-orange-200/70 shadow-[0_4px_10px_rgba(255,160,122,0.12)]"
          }`}
        >
          <ArrowLeft size={20} strokeWidth={3} className="mb-1" />
          <span className="font-rounded font-extrabold text-[10px] sm:text-xs tracking-wider uppercase">
            Back
          </span>
        </button>

        {/* 2. NÚT SOUND (Audio / Romaji) */}
        <button
          onClick={onPlayAudio}
          className={`flex flex-col items-center justify-center py-3 sm:py-3.5 border-2 rounded-[1.25rem] backdrop-blur-md transition-all duration-300 active:scale-95 active:translate-y-[2px] cursor-pointer w-full overflow-hidden ${
            isZen
              ? "bg-gradient-to-br from-pink-500/20 to-rose-600/10 border-pink-500/30 text-pink-400 hover:from-pink-500/30 hover:to-rose-600/20 hover:text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
              : "bg-gradient-to-br from-pink-100/70 via-pink-50/40 to-rose-100/70 border-pink-200 text-pink-500 hover:from-pink-200/70 hover:to-rose-200/70 shadow-[0_4px_10px_rgba(255,112,150,0.12)]"
          }`}
        >
          <Volume2 size={20} strokeWidth={3} className="mb-1" />
          <span className="font-rounded font-extrabold text-[10px] sm:text-xs tracking-wider uppercase truncate px-1 max-w-full">
            {card.romaji || "Sound"}
          </span>
        </button>

        {/* 3. NÚT LẬT THẺ / THỬ LẠI */}
        <button
          onClick={onFlip}
          className={`flex flex-col items-center justify-center py-3 sm:py-3.5 border-2 rounded-[1.25rem] backdrop-blur-md transition-all duration-300 active:scale-95 active:translate-y-[2px] cursor-pointer ${
            isZen
              ? "bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/30 hover:to-amber-600/20 hover:text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
              : "bg-gradient-to-br from-yellow-100/70 via-yellow-50/40 to-amber-100/70 border-amber-200 text-amber-700 hover:from-yellow-200/70 hover:to-amber-200/70 shadow-[0_4px_10px_rgba(255,209,102,0.12)]"
          }`}
        >
          <RotateCw size={20} strokeWidth={3} className="mb-1 text-inherit" />
          <span className="font-rounded font-extrabold text-[10px] sm:text-xs tracking-wider uppercase">
            {isFlipped ? "Again" : "Flip"}
          </span>
        </button>

        {/* 4. NÚT GOT IT! / TIẾP THEO */}
        <button
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          className={`flex flex-col items-center justify-center py-3 sm:py-3.5 border-2 rounded-[1.25rem] backdrop-blur-md transition-all duration-300 active:scale-95 active:translate-y-[2px] disabled:opacity-30 disabled:active:scale-100 disabled:active:translate-y-0 cursor-pointer ${
            isZen
              ? "bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-teal-600/20 hover:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "bg-gradient-to-br from-emerald-100/70 via-emerald-50/40 to-teal-100/70 border-teal-200 text-teal-600 hover:from-emerald-200/70 hover:to-teal-200/70 shadow-[0_4px_10px_rgba(6,214,160,0.12)]"
          }`}
        >
          <ArrowRight size={20} strokeWidth={3} className="mb-1" />
          <span className="font-rounded font-extrabold text-[10px] sm:text-xs tracking-wider uppercase">
            Got it!
          </span>
        </button>
      </div>
    </div>
  );
}
