import React, { useState } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Search, Check } from "lucide-react";
import { CoinIcon } from "@/components/common/CoinIcon";
import { useAppStore } from "@/store/useAppStore";

interface BossHelpersPanelProps {
  usePhaoBoi: (currency: "coins" | "goldenFur") => Promise<boolean>;
  useKinhLup: (currency: "coins" | "goldenFur") => Promise<boolean>;
  isHintRevealed: boolean;
}

export function BossHelpersPanel({
  usePhaoBoi,
  useKinhLup,
  isHintRevealed,
}: BossHelpersPanelProps) {
  const [isPhaoBoiLoading, setIsPhaoBoiLoading] = useState(false);
  const [isKinhLupLoading, setIsKinhLupLoading] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<"coins" | "goldenFur">("coins");

  // Read current balances from the Zustand store
  const coins = useAppStore((state) => state.userStats.coins);
  const goldenFur = useAppStore((state) => state.userStats.goldenFur || 0);

  const handlePhaoBoiClick = async () => {
    if (isPhaoBoiLoading) return;
    setIsPhaoBoiLoading(true);
    try {
      await usePhaoBoi(activeCurrency);
    } finally {
      setIsPhaoBoiLoading(false);
    }
  };

  const handleKinhLupClick = async () => {
    if (isKinhLupLoading || isHintRevealed) return;
    setIsKinhLupLoading(true);
    try {
      await useKinhLup(activeCurrency);
    } finally {
      setIsKinhLupLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/40 backdrop-blur-sm border border-white/50 rounded-[2rem] p-4 flex flex-col gap-3 shadow-sm relative mt-6"
      style={{ fontFamily: "var(--font-cherry)" }}
    >
      {/* Shiba Master Support Tag positioned absolutely in the center of the top border */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FFF3E0]/70 border border-white/60 px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-20 select-none backdrop-blur-xs">
        <span
          className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-rounded leading-none"
        >
          Sư Phụ Shiba
        </span>
      </div>

      {/* Header section with Balance & Switcher */}
      <div className="flex items-center justify-center border-b border-orange-200/30 pb-2 mt-1">
        {/* Currency Balance and Switcher */}
        <div className="flex items-center gap-2 bg-white/55 border border-white/70 rounded-full px-2.5 py-1 shadow-xs">
          {/* Balance icons */}
          <div className="flex items-center gap-2.5 border-r border-orange-200/40 pr-2.5">
            <div className="flex items-center gap-0.5 text-xs font-black text-amber-900 select-none">
              <span>🦴</span>
              <span>{coins}</span>
            </div>
            <div className="flex items-center gap-0.5 text-xs font-black text-amber-900 select-none">
              <CoinIcon size={12} />
              <span>{goldenFur}</span>
            </div>
          </div>

          {/* Switcher */}
          <div className="flex bg-amber-100/35 border border-amber-200/20 rounded-full p-0.5 relative select-none">
            <button
              type="button"
              onClick={() => setActiveCurrency("coins")}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all relative z-10 cursor-pointer ${activeCurrency === "coins"
                ? "bg-white text-orange-600 shadow-xs scale-105"
                : "text-amber-800/40 hover:text-amber-800 opacity-60 hover:opacity-100"
                }`}
              title="Thanh toán bằng Xương"
            >
              🦴
            </button>
            <button
              type="button"
              onClick={() => setActiveCurrency("goldenFur")}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all relative z-10 cursor-pointer ${activeCurrency === "goldenFur"
                ? "bg-white text-amber-600 shadow-xs scale-105"
                : "text-amber-800/40 hover:text-amber-800 opacity-60 hover:opacity-100"
                }`}
              title="Thanh toán bằng Shiba coin"
            >
              <CoinIcon size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Helper Items */}
      <div className="grid grid-cols-2 gap-4 w-full pt-1">
        {/* Phao bơi (Glassmorphism & Neon Glow - Icon Only) */}
        <motion.button
          type="button"
          disabled={isPhaoBoiLoading}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePhaoBoiClick}
          className="h-14 bg-gradient-to-br from-[#E0F7FA]/50 to-[#80DEEA]/25 backdrop-blur-sm border border-[#80DEEA]/60 hover:border-[#00ACC1] rounded-[1.25rem] flex items-center justify-center text-[#00838F] font-rounded font-black transition-all shadow-[0_4px_12px_rgba(0,172,193,0.12)] hover:shadow-[0_4px_16px_rgba(0,172,193,0.25)] disabled:opacity-50 cursor-pointer relative overflow-hidden"
        >
          <LifeBuoy className={`w-6 h-6 text-[#00ACC1] drop-shadow-[0_0_6px_rgba(0,172,193,0.35)] ${isPhaoBoiLoading ? "animate-spin" : ""}`} />

          {/* Price Tag Pill - Absolute top-right */}
          <div className="absolute top-1 right-1 bg-white/75 backdrop-blur-xs border border-[#80DEEA]/40 rounded-full px-1.5 py-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center z-10 select-none">
            <span className="text-sm text-[#00838F] font-black font-sans flex items-center gap-0.5 leading-none">
              {activeCurrency === "coins" ? (
                <>5 🦴</>
              ) : (
                <>1 <CoinIcon size={9} /></>
              )}
            </span>
          </div>
        </motion.button>

        {/* Kính lúp (Glassmorphism & Neon Glow - Icon Only) */}
        <motion.button
          type="button"
          disabled={isKinhLupLoading || isHintRevealed}
          whileHover={isHintRevealed ? {} : { scale: 1.05, y: -2 }}
          whileTap={isHintRevealed ? {} : { scale: 0.95 }}
          onClick={handleKinhLupClick}
          className={`h-14 border rounded-[1.25rem] flex items-center justify-center font-rounded font-black transition-all cursor-pointer relative overflow-hidden ${isHintRevealed
            ? "bg-[#E8F5E9]/50 border-[#A5D6A7]/50 text-[#2E7D32] shadow-sm cursor-not-allowed"
            : "bg-gradient-to-br from-[#FFF3E0]/50 to-[#FFCC80]/25 backdrop-blur-sm border border-[#FFCC80]/60 hover:border-[#FF9F1C] text-[#E65100] shadow-[0_4px_12px_rgba(255,159,28,0.12)] hover:shadow-[0_4px_16px_rgba(255,159,28,0.25)]"
            }`}
        >
          {isHintRevealed ? (
            <Check className="w-6 h-6 text-[#2E7D32] drop-shadow-[0_0_6px_rgba(46,125,50,0.35)]" />
          ) : (
            <>
              <Search className={`w-6 h-6 text-[#FF9F1C] drop-shadow-[0_0_6px_rgba(255,159,28,0.35)] ${isKinhLupLoading ? "animate-pulse" : ""}`} />

              {/* Price Tag Pill - Absolute top-right */}
              <div className="absolute top-1 right-1 bg-white/75 backdrop-blur-xs border border-[#FFCC80]/40 rounded-full px-1.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center z-10 select-none">
                <span className="text-sm text-[#E65100] font-black font-sans flex items-center gap-0.5 leading-none">
                  {activeCurrency === "coins" ? (
                    <>3 🦴</>
                  ) : (
                    <>1 <CoinIcon size={9} /></>
                  )}
                </span>
              </div>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
