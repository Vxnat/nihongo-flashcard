"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Volume2 } from "lucide-react";
import { RARITY_CONFIG, GachaRarity, GachaItem } from "@/constants/gachaPool";

// Helper để sort items by rarity
const rarityOrder: Record<GachaRarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
  mythic: 4,
  divine: 5,
};

export interface GachaResultItem {
  item: GachaItem;
  isFullItem: boolean;
  duplicateFur: number;
  rarity: GachaRarity;
  unlocked: boolean;
  shardsNow: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

// Sub-component for a single result card
function ResultCard({
  item,
  isRevealed,
  onCardClick,
}: {
  item: GachaResultItem;
  isRevealed: boolean;
  onCardClick: () => void;
}) {
  const rarityConfig = RARITY_CONFIG[item.rarity];
  const isNew = item.unlocked;
  const isDuplicate = item.duplicateFur > 0;
  const isSpecial = rarityOrder[item.rarity] >= rarityOrder.epic;

  // Tự động phát âm thanh khi lật mở thẻ Voice
  useEffect(() => {
    if (isRevealed && item.item.type === "voice" && item.item.audioUrl) {
      const audio = new Audio(`${item.item.audioUrl}`);
      audio.volume = 0.6;
      audio.play().catch((err) => console.warn("Failed to play preview voice:", err));
    }
  }, [isRevealed, item.item.type, item.item.audioUrl]);

  const handleCardClick = () => {
    if (!isRevealed) {
      onCardClick();
    } else if (item.item.type === "voice" && item.item.audioUrl) {
      const audio = new Audio(`${item.item.audioUrl}`);
      audio.volume = 0.6;
      audio.play().catch((err) => console.warn("Failed to play preview voice:", err));
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`aspect-square relative group ${(isSpecial && !isRevealed) || (isRevealed && item.item.type === "voice") ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -180 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full p-1.5"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div
              className="w-full h-full rounded-2xl flex flex-col items-center justify-center text-center p-2 relative overflow-hidden border-2"
              style={{
                backgroundColor: rarityConfig.bgColor,
                borderColor: rarityConfig.color,
                boxShadow: `0 0 15px ${rarityConfig.glowColor}`,
              }}
            >
              {/* Tia sáng xoay phía sau - hiệu ứng "bùng nổ" kiểu anime cho item hiếm */}
              {isSpecial && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="w-[160%] h-[160%] rounded-full"
                    style={{
                      background: `repeating-conic-gradient(from 0deg, ${rarityConfig.color}33 0deg, transparent 15deg, ${rarityConfig.color}33 30deg)`,
                      maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
                      WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
                    }}
                  />
                </motion.div>
              )}

              {/* Dải sáng holo lướt qua mặt thẻ */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.5) 48%, transparent 60%)",
                  backgroundSize: "250% 250%",
                }}
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />

              {isNew && (
                <div className="absolute top-1.5 right-1.5 z-20 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm font-sans tracking-wider"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  MỚI
                </div>
              )}

              {item.item.type === "voice" ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{
                    delay: 0.3,
                    scale: { type: "spring", stiffness: 300 },
                    rotate: { duration: 0.4, ease: "easeInOut" },
                  }}
                  className="text-3xl sm:text-4xl relative z-10"
                >
                  <img src={item.item.imageUrl} alt="Voice" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                </motion.span>
              ) : (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  src={item.item.imageUrl}
                  alt={item.item.name}
                  className={`z-10 border border-white/20 object-contain ${item.item.type === "meme"
                    ? "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded-full"
                    : "w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12"
                    }`}
                />
              )}

              {/* Inline name & duplicate — visible on mobile, hidden on md+ (hover overlay replaces it) */}
              <p className="font-bold text-[9px] sm:text-xs mt-1 sm:mt-2 line-clamp-2 relative z-10 font-sans leading-tight md:hidden" style={{ color: rarityConfig.textColor }}>
                {item.item.name}
              </p>
              {isDuplicate && (
                <p className="flex items-center text-[8px] sm:text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5 sm:mt-1 relative z-10 font-sans gap-0.5 md:hidden"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  +{item.duplicateFur} <img src="/images/ui/golden_shiba_coin.png" alt="Shiba Coin" className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain" />
                </p>
              )}

              {/* Hover overlay — PC only (md+) */}
              <div
                className="absolute inset-x-0 bottom-0 z-30 hidden md:flex flex-col items-center justify-end pb-2.5 pt-8 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${rarityConfig.bgColor} 40%, transparent 100%)`,
                }}
              >
                <p className="font-bold text-[11px] line-clamp-2 font-sans leading-tight px-2 text-center" style={{ color: rarityConfig.textColor }}>
                  {item.item.name}
                </p>
                {isDuplicate && (
                  <p className="flex items-center text-[9px] font-bold text-amber-600 bg-amber-100/90 px-1.5 py-0.5 rounded-full mt-1 font-sans gap-0.5"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    +{item.duplicateFur} <img src="/images/ui/golden_shiba_coin.png" alt="Shiba Coin" className="w-3 h-3 object-contain" />
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Back */}
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 w-full h-full p-1.5"
        style={{ backfaceVisibility: "hidden" }}
      >
        {/* Khung viền đuổi sáng chạy xung quanh thẻ (Border Chasing Light) */}
        {!isRevealed && (
          <div className="absolute inset-[3px] rounded-[1.1rem] overflow-hidden -z-10 pointer-events-none">
            <motion.div
              className="w-[150%] h-[150%] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                background: `conic-gradient(from 0deg, transparent 0%, ${rarityConfig.color} 15%, transparent 30%, transparent 100%)`,
                filter: "blur(2px)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        <div
          className="w-full h-full rounded-2xl relative overflow-hidden shadow-lg border-2 border-white/70"
          style={{ background: "linear-gradient(135deg, #E8743B 0%, #C85A28 50%, #7A3E18 100%)" }}
        >
          {/* Hoa văn lấp lánh kiểu thẻ bài anime */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1.5px)",
              backgroundSize: "10px 10px",
            }}
          />

          {/* Dải sáng holo chạy chéo */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.15) 50%, transparent 65%)",
              backgroundSize: "250% 250%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />

          {/* Khung góc kiểu thẻ bài */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-white/70 rounded-tr-md" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-white/70 rounded-bl-md" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-white/70 rounded-br-md" />

          {/* Huy hiệu trung tâm */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/15 border-2 border-white/60 flex items-center justify-center backdrop-blur-[1px]">
              <Star className="w-6 h-6 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" fill="white" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Modal Component
interface GachaMultiResultModalProps {
  isOpen: boolean;
  results: GachaResultItem[] | null;
  onClose: () => void;
}

export function GachaMultiResultModal({
  isOpen,
  results,
  onClose,
}: GachaMultiResultModalProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);

  const sortedResults = React.useMemo(() => {
    if (!results) return [];
    return [...results].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  }, [results]);

  const handleManualReveal = (indexToReveal: number) => {
    // Only allow manual reveal for special cards that are not yet revealed
    const item = sortedResults[indexToReveal];
    if (
      item &&
      rarityOrder[item.rarity] >= rarityOrder.epic &&
      !revealedIndices.has(indexToReveal)
    ) {
      setRevealedIndices((prev) => new Set(prev).add(indexToReveal));
    }
  };

  useEffect(() => {
    if (isOpen && sortedResults.length > 0) {
      setIsRevealing(true);
      const revealPromises = sortedResults
        .map((item, index) => {
          const isSpecial = rarityOrder[item.rarity] >= rarityOrder.epic;
          if (isSpecial) {
            return null; // Special items are not auto-revealed
          }
          // Create a promise for auto-revealing non-special items
          return new Promise<void>((resolve) =>
            setTimeout(() => {
              setRevealedIndices((prev) => new Set(prev).add(index));
              resolve();
            }, index * 200 + 500) // Staggered reveal
          );
        })
        .filter((p): p is Promise<void> => p !== null);

      Promise.all(revealPromises).then(() => {
        setIsRevealing(false);
      });
    } else {
      // Reset when modal is closed
      setRevealedIndices(new Set());
      setIsRevealing(false);
    }
  }, [isOpen, sortedResults]);

  const handleSkip = () => {
    const allIndices = new Set(sortedResults.map((_, i) => i));
    setRevealedIndices(allIndices);
    setIsRevealing(false);
  };

  const handleCollect = () => {
    const allRevealed = revealedIndices.size === sortedResults.length;
    if (allRevealed) {
      onClose();
    } else {
      // Reveal all remaining cards
      handleSkip(); // This reveals all and sets isRevealing to false
      setTimeout(() => {
        onClose();
      }, 600); // Wait for flip animation (0.5s) to mostly complete
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md h-full"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#FFFDF5] border-4 border-[#FFD166] rounded-[2.5rem] p-4 sm:p-6 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[90vh]"
          >
            <div className="text-center mb-4 relative">
              <motion.div
                className="absolute -top-1 left-6 text-[#FFD166]"
                animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 15, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <Star className="w-4 h-4" fill="#FFD166" />
              </motion.div>
              <motion.div
                className="absolute top-2 right-8 text-[#FF7096]"
                animate={{ scale: [1.1, 0.7, 1.1], rotate: [0, -15, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
              >
                <Star className="w-3 h-3" fill="#FF7096" />
              </motion.div>
              <h3
                className="text-3xl text-[#FF9F1C] tracking-wide"
                style={{
                  fontFamily: "var(--font-cherry)",
                  textShadow: "0 0 12px rgba(255,159,28,0.5), 0 2px 0 #fff",
                }}
              >
                Kết Quả Gacha
              </h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 md:gap-4 pr-2 -mr-2"
              style={{ perspective: 1000 }}
            >
              {sortedResults.map((item, index) => (
                <ResultCard
                  key={index}
                  item={item}
                  isRevealed={revealedIndices.has(index)}
                  onCardClick={() => handleManualReveal(index)}
                />
              ))}
            </motion.div>

            <div className="flex gap-3 mt-6">
              {isRevealing && (
                <button
                  onClick={handleSkip}
                  className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1"
                >
                  Bỏ qua
                </button>
              )}
              <button
                onClick={handleCollect}
                className="flex-1 h-12 bg-gradient-to-br from-[#E8743B] to-[#7A3E18] hover:from-[#FBC579] hover:to-[#8C471E] text-white font-black rounded-2xl border-b-4 border-[#5C2B10] active:border-b-0 active:translate-y-1 transition-all"
              >
                Thu thập
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}