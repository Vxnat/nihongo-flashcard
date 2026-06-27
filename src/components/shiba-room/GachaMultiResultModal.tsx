"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Volume2 } from "lucide-react";
import { RARITY_CONFIG, GachaRarity, GachaItem, rarityOrder, PASTEL_RARITY_BG } from "@/constants/gachaPool";
import { playAudioUrl } from "@/utils/tts";
import Image from "next/image";
import { CoinIcon } from "../common/CoinIcon";

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

const INNER_BORDER_COLORS: Record<GachaRarity, string> = {
  common: "#FFCAD4",
  rare: "#A8E6CF",
  epic: "#90CAF9",
  legendary: "#FFE082",
  mythic: "#D1C4E9",
  divine: "#F8BBD0",
};

const STAR_COUNT: Record<GachaRarity, number> = {
  common: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 5,
  divine: 5,
};

function CornerStars({ color }: { color: string }) {
  return (
    <>
      <div className="absolute top-2.5 left-2.5 pointer-events-none opacity-85 z-10" style={{ color }}>
        <svg viewBox="0 0 10 10" className="w-1.5 h-1.5 fill-current">
          <path d="M5,0 L6,3.5 L9.5,4.5 L6,5.5 L5,9 L4,5.5 L0.5,4.5 L4,3.5 Z" />
        </svg>
      </div>
      <div className="absolute top-2.5 right-2.5 pointer-events-none opacity-85 z-10" style={{ color }}>
        <svg viewBox="0 0 10 10" className="w-1.5 h-1.5 fill-current">
          <path d="M5,0 L6,3.5 L9.5,4.5 L6,5.5 L5,9 L4,5.5 L0.5,4.5 L4,3.5 Z" />
        </svg>
      </div>
      <div className="absolute bottom-2.5 left-2.5 pointer-events-none opacity-85 z-10" style={{ color }}>
        <svg viewBox="0 0 10 10" className="w-1.5 h-1.5 fill-current">
          <path d="M5,0 L6,3.5 L9.5,4.5 L6,5.5 L5,9 L4,5.5 L0.5,4.5 L4,3.5 Z" />
        </svg>
      </div>
      <div className="absolute bottom-2.5 right-2.5 pointer-events-none opacity-85 z-10" style={{ color }}>
        <svg viewBox="0 0 10 10" className="w-1.5 h-1.5 fill-current">
          <path d="M5,0 L6,3.5 L9.5,4.5 L6,5.5 L5,9 L4,5.5 L0.5,4.5 L4,3.5 Z" />
        </svg>
      </div>
    </>
  );
}

function RarityPattern({ rarity }: { rarity: GachaRarity }) {
  switch (rarity) {
    case "common":
      return (
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(#C85A28 15%, transparent 15%)",
            backgroundSize: "14px 14px",
          }}
        />
      );
    case "rare":
      return (
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(#1B5E20 18%, transparent 18%)",
            backgroundSize: "12px 12px",
          }}
        />
      );
    case "epic":
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
          <svg viewBox="0 0 100 60" className="w-16 h-10 text-white fill-current absolute bottom-8 -left-3">
            <path d="M 20,40 A 10,10 0 0,1 22,22 A 15,15 0 0,1 60,18 A 12,12 0 0,1 78,30 A 10,10 0 0,1 74,46 Z" />
          </svg>
          <svg viewBox="0 0 100 60" className="w-18 h-11 text-white fill-current absolute bottom-4 -right-2">
            <path d="M 20,40 A 10,10 0 0,1 22,22 A 15,15 0 0,1 60,18 A 12,12 0 0,1 78,30 A 10,10 0 0,1 74,46 Z" />
          </svg>
        </div>
      );
    case "legendary":
      return (
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
          style={{
            background: "repeating-linear-gradient(45deg, #7A3E18, #7A3E18 8px, transparent 8px, transparent 16px)",
          }}
        />
      );
    case "mythic":
    case "divine":
    default:
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
          <motion.div
            className="absolute top-8 left-4 text-white"
            animate={{ scale: [0.6, 1, 0.6], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-current">
              <path d="M5,0 L6,3.5 L9.5,4.5 L6,5.5 L5,9 L4,5.5 L0.5,4.5 L4,3.5 Z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute bottom-12 right-4 text-white"
            animate={{ scale: [1, 0.6, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
          >
            <svg viewBox="0 0 10 10" className="w-2 h-2 fill-current">
              <path d="M5,0 L6,3.5 L9.5,4.5 L6,5.5 L5,9 L4,5.5 L0.5,4.5 L4,3.5 Z" />
            </svg>
          </motion.div>
        </div>
      );
  }
}

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

  // Tự động phát âm thanh khi lật mở thẻ (flip + success + voice preview)
  useEffect(() => {
    if (isRevealed) {
      playAudioUrl("/sounds/flip.mp3");
      if (isSpecial) {
        playAudioUrl("/sounds/success.mp3");
      }

      if (item.item.type === "voice" && item.item.audioUrl) {
        playAudioUrl(`${item.item.audioUrl}`);
      }
    }
  }, [isRevealed, item.item.type, item.item.audioUrl, isSpecial]);

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
      whileHover={{ scale: 1.06, y: -4, rotate: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      className={`aspect-[2/3] w-full relative group ${(isSpecial && !isRevealed) || (isRevealed && item.item.type === "voice") ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -180 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full p-1"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Viền sáng neon đuổi quanh thẻ đã lật mở cho Epic+ (Divine chạy màu cầu vồng) */}
            {isSpecial && (
              <div className="absolute inset-[2px] rounded-[2.2rem] overflow-hidden -z-10 pointer-events-none">
                <motion.div
                  className="w-[150%] h-[150%] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: item.rarity === "divine"
                      ? "conic-gradient(from 0deg, #ff7096, #ff9f1c, #4ade80, #60a5fa, #c084fc, #ff7096)"
                      : `conic-gradient(from 0deg, transparent 0%, ${rarityConfig.color} 20%, transparent 40%, transparent 100%)`,
                    filter: "blur(2.5px)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
            <div
              className="w-full h-full rounded-[2rem] flex flex-col items-center justify-between p-2 relative overflow-hidden border-4 border-white shadow-md animate-fade-in"
              style={{
                background: PASTEL_RARITY_BG[item.rarity],
                boxShadow: `0 0 15px ${rarityConfig.glowColor}`,
              }}
            >
              {/* Type Badge Tag (Top Corner) */}
              <div className="absolute top-2.5 left-2.5 z-20 bg-white/80 backdrop-blur-xs border border-white/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <img
                  src={item.isFullItem ? "/images/ui/gacha/gacha_full_icon.png" : "/images/ui/gacha/gacha_shard_icon.png"}
                  alt={item.isFullItem ? "Vật phẩm" : "Mảnh"}
                  className="w-3 h-3 object-contain"
                />
                <span className="text-[7px] font-black text-slate-700 leading-none uppercase tracking-wide">
                  {item.isFullItem ? "Vật phẩm" : "Mảnh"}
                </span>
              </div>

              {/* Inner Border */}
              <div
                className="absolute inset-1.5 rounded-[1.5rem] border-2 border-solid pointer-events-none z-0"
                style={{ borderColor: INNER_BORDER_COLORS[item.rarity], opacity: 0.65 }}
              />
              <CornerStars color={INNER_BORDER_COLORS[item.rarity]} />

              {/* Background Pattern */}
              <RarityPattern rarity={item.rarity} />

              {/* Tia sáng xoay phía sau - hiệu ứng "bùng nổ" kiểu anime cho item hiếm */}
              {isSpecial && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    className="w-[160%] h-[160%] rounded-full"
                    style={{
                      background: `repeating-conic-gradient(from 0deg, ${rarityConfig.color}22 0deg, transparent 15deg, ${rarityConfig.color}22 30deg)`,
                      maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
                      WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
                    }}
                  />
                </motion.div>
              )}

              {/* Dải sáng holo lướt qua mặt thẻ */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.4) 48%, transparent 60%)",
                  backgroundSize: "250% 250%",
                }}
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />

              {/* Khu vực hiển thị Shiba/Vật phẩm trực tiếp (không có khung tròn) */}
              <div className="flex-1 flex items-center justify-center relative z-10 w-full px-2 min-h-0 pt-4 pb-1">
                {item.item.type === "voice" ? (
                  <div className="relative">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                      transition={{
                        delay: 0.3,
                        scale: { type: "spring", stiffness: 300 },
                        rotate: { duration: 0.4, ease: "easeInOut" },
                      }}
                      className="text-3xl relative z-10 block"
                    >
                      <img src={item.item.imageUrl} alt="Voice" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]" />
                    </motion.span>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-100 border border-white shadow-sm flex items-center justify-center text-pink-500 z-20 animate-pulse">
                      <Volume2 size={12} className="stroke-[2.5]" />
                    </div>
                  </div>
                ) : (
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    src={item.item.imageUrl}
                    alt={item.item.name}
                    className={`z-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)] ${item.item.type === "meme"
                      ? "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white"
                      : "w-16 h-16 sm:w-20 sm:h-20"
                      }`}
                  />
                )}
              </div>

              {/* Phần thông tin chân card: Hàng sao & Tên */}
              <div className="w-full flex flex-col items-center shrink-0 relative z-10">
                {/* Hàng sao đánh giá độ hiếm dưới chân nhân vật */}
                <div className="flex gap-0.5 mb-1.5 relative z-10 justify-center">
                  {Array.from({ length: STAR_COUNT[item.rarity] }).map((_, i) => (
                    <Star key={i} size={11} className="text-[#FFC340] fill-[#FFC340]" />
                  ))}
                </div>

                {/* Tên vật phẩm */}
                <p
                  className="font-bold text-[10px] sm:text-[11px] mb-1 px-1.5 line-clamp-1 text-center font-sans leading-tight w-full"
                  style={{ color: "#5C3E21" }}
                >
                  {item.item.name}
                </p>

                {/* Mảnh ghép progress bar */}
                {!item.isFullItem && (
                  <div className="w-[85%] mx-auto mt-0.5 mb-1.5 flex flex-col items-center gap-1 font-sans">
                    {item.unlocked ? (
                      <div className="flex items-center gap-1 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full shadow-xs">
                        <img src="/images/ui/gacha/gacha_full_icon.png" alt="Success" className="w-3.5 h-3.5 object-contain" />
                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wide" style={{ fontSize: "7px" }}>Ghép thành công!</span>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-0.5">
                        {/* Thin progress bar */}
                        <div className="w-full bg-zinc-200/50 h-1.5 rounded-full overflow-hidden border border-zinc-300/20">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (item.shardsNow / item.item.shardTarget) * 100)}%`,
                              backgroundColor: rarityConfig.color,
                            }}
                          />
                        </div>
                        {/* Shard count indicator */}
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <img src="/images/ui/gacha/gacha_shard_icon.png" alt="Shard" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[7.5px] font-bold text-zinc-500 font-sans">
                            {item.shardsNow} / {item.item.shardTarget}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vật phẩm trùng (duplicate) */}
                {isDuplicate && (
                  <p
                    className="flex items-center text-[7px] sm:text-[9px] font-bold text-pink-600 bg-white/70 border border-pink-100 px-1.5 py-0.5 rounded-full mb-1.5 font-sans gap-0.5"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    +{item.duplicateFur}{" "}
                    <CoinIcon />
                  </p>
                )}
              </div>
            </div>

            {/* Nhãn "NEW!" 3D thạch hồng bóng bẩy bay lơ lửng ở chính giữa viền trên */}
            {isNew && (
              <motion.img
                src="/images/ui/gacha/new_badge.png"
                alt="NEW!"
                className="absolute -top-4 left-1/2 -translate-x-1/2 z-35 w-20 h-17 object-contain pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                animate={{ rotate: [-6, 6, -6], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Back */}
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 w-full h-full p-1"
        style={{ backfaceVisibility: "hidden" }}
      >
        {/* Khung viền đuổi sáng chạy xung quanh thẻ (Border Chasing Light) */}
        {!isRevealed && (
          <div className="absolute inset-[2px] rounded-[2.2rem] overflow-hidden -z-10 pointer-events-none">
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
          className="w-full h-full rounded-[2rem] relative overflow-hidden shadow-lg border-4 border-white"
          style={{ background: "linear-gradient(135deg, #FFE3E8 0%, #D6C7FF 100%)" }}
        >
          {/* Đường viền phụ mặt sau */}
          <div className="absolute inset-1.5 rounded-[1.5rem] border-2 border-solid border-white/40 pointer-events-none" />

          {/* Hoa văn lấp lánh kiểu thẻ bài anime */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "12px 12px",
            }}
          />

          {/* Dải sáng holo chạy chéo */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.2) 50%, transparent 65%)",
              backgroundSize: "250% 250%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />

          {/* Khung góc kiểu thẻ bài */}
          <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-white/80 rounded-tl-md" />
          <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-white/80 rounded-tr-md" />
          <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-white/80 rounded-bl-md" />
          <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-white/80 rounded-tr-md" />

          {/* Huy hiệu trung tâm (Logo đám mây chân chó PNG) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src="/images/ui/gacha/card_back_logo.png"
              alt="Card Back Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)]"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
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
  onReRoll?: () => void;
  userCoins?: number;
}

export function GachaMultiResultModal({
  isOpen,
  results,
  onClose,
  onReRoll,
  userCoins = 0,
}: GachaMultiResultModalProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedResults = React.useMemo(() => {
    if (!results) return [];
    return [...results].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  }, [results]);

  const handleManualReveal = (indexToReveal: number) => {
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
          return new Promise<void>((resolve) =>
            setTimeout(() => {
              setRevealedIndices((prev) => new Set(prev).add(index));
              resolve();
            }, index * 200 + 500)
          );
        })
        .filter((p): p is Promise<void> => p !== null);

      Promise.all(revealPromises).then(() => {
        setIsRevealing(false);
      });
    } else {
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
      handleSkip();
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const handleReRollClick = () => {
    if (onReRoll && userCoins >= 90) {
      playAudioUrl("/sounds/coin.mp3");
      onReRoll();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-md h-full"
        >
          {/* Cloud Frame Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 25 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -25, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="bg-[#FFFDF6] border-[6px] border-[#FFD2CC] rounded-[3.5rem] p-5 sm:p-7 max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-visible"
          >
            {/* Cute fluffy decorative clouds overlapping borders */}
            {/* Top Left Cloud */}
            <div className="absolute -top-10 -left-10 w-24 h-16 pointer-events-none drop-shadow-md z-20">
              <svg viewBox="0 0 100 60" className="w-full h-full text-white fill-current">
                <path d="M 20,40 A 12,12 0 0,1 22,20 A 18,18 0 0,1 64,15 A 14,14 0 0,1 82,30 A 12,12 0 0,1 78,48 A 12,12 0 0,1 20,40 Z" />
              </svg>
            </div>

            {/* Top Right Cloud */}
            <div className="absolute -top-12 -right-8 w-28 h-18 pointer-events-none drop-shadow-md z-20">
              <svg viewBox="0 0 100 60" className="w-full h-full text-white fill-current">
                <path d="M 20,40 A 12,12 0 0,1 22,20 A 18,18 0 0,1 64,15 A 14,14 0 0,1 82,30 A 12,12 0 0,1 78,48 A 12,12 0 0,1 20,40 Z" />
              </svg>
            </div>

            {/* Bottom Left Cloud */}
            <div className="absolute -bottom-8 -left-8 w-24 h-16 pointer-events-none drop-shadow-md z-20">
              <svg viewBox="0 0 100 60" className="w-full h-full text-white fill-current opacity-95">
                <path d="M 20,40 A 12,12 0 0,1 22,20 A 18,18 0 0,1 64,15 A 14,14 0 0,1 82,30 A 12,12 0 0,1 78,48 A 12,12 0 0,1 20,40 Z" />
              </svg>
            </div>

            {/* Bottom Right Cloud */}
            <div className="absolute -bottom-10 -right-10 w-28 h-18 pointer-events-none drop-shadow-md z-20">
              <svg viewBox="0 0 100 60" className="w-full h-full text-white fill-current opacity-95">
                <path d="M 20,40 A 12,12 0 0,1 22,20 A 18,18 0 0,1 64,15 A 14,14 0 0,1 82,30 A 12,12 0 0,1 78,48 A 12,12 0 0,1 20,40 Z" />
              </svg>
            </div>

            {/* Peeking Shiba Dog behind the top-left cloud */}
            <motion.div
              className="absolute -top-10 -left-6 z-21 pointer-events-none"
              animate={{
                y: [0, -6, 0],
                rotate: [-4, 4, -4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg viewBox="0 0 60 50" className="w-14 h-12">
                {/* Left Ear */}
                <path d="M 12,25 L 8,10 Q 14,12 18,20 Z" fill="#FFAAA6" stroke="#5C3E21" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M 11,23 L 9,13 Q 13,14 16,20 Z" fill="#FFFDF6" />
                {/* Right Ear */}
                <path d="M 40,20 Q 44,12 50,10 L 46,25 Z" fill="#FFAAA6" stroke="#5C3E21" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M 42,20 Q 45,14 49,13 L 47,23 Z" fill="#FFFDF6" />
                {/* Face/Head Circle */}
                <circle cx="28" cy="30" r="16" fill="#FFAAA6" stroke="#5C3E21" strokeWidth="2.5" />
                {/* Cheeks/Muzzle */}
                <ellipse cx="28" cy="34" rx="9" ry="6" fill="#FFFDF6" />
                {/* Blushing cheeks */}
                <circle cx="18" cy="32" r="2" fill="#FFB7B2" />
                <circle cx="38" cy="32" r="2" fill="#FFB7B2" />
                {/* Eyes (happy curved lines) */}
                <path d="M 19,26 Q 22,23 24,26" fill="none" stroke="#5C3E21" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 32,26 Q 34,23 37,26" fill="none" stroke="#5C3E21" strokeWidth="2.5" strokeLinecap="round" />
                {/* Nose */}
                <polygon points="27,31 29,31 28,32.5" fill="#5C3E21" />
                {/* Mouth */}
                <path d="M 25,33 Q 27,34.5 28,33 Q 29,34.5 31,33" fill="none" stroke="#5C3E21" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </motion.div>

            <div className="text-center mb-5 relative">
              <motion.div
                className="absolute -top-2 left-6 text-[#FFE082]"
                animate={{ scale: [0.8, 1.25, 0.8], rotate: [0, 15, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <Star className="w-5 h-5 fill-[#FFE082]" />
              </motion.div>
              <motion.div
                className="absolute top-1 right-8 text-[#FFD2CC]"
                animate={{ scale: [1.1, 0.7, 1.1], rotate: [0, -15, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
              >
                <Star className="w-4 h-4 fill-[#FFD2CC]" />
              </motion.div>
              <h3
                className="text-3xl text-pink-500 tracking-wider"
                style={{
                  fontFamily: "var(--font-cherry)",
                  textShadow: "0 2px 0 #fff, 0 0 10px rgba(255,112,150,0.15)",
                }}
              >
                Gacha
              </h3>
            </div>

            {/* Frosted Glass Tray for Cards grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 pr-1 bg-[#4A2E80]/10 border border-white/20 rounded-[2rem] p-3 sm:p-5 mb-4 shadow-inner"
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

            {/* Bottom Actions section */}
            <div className="flex gap-3 mt-2 relative z-10">
              {/* Nút Thu Thập */}
              <motion.button
                onClick={handleCollect}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-12 bg-gradient-to-r from-[#FFAAA6] to-[#E8A598] hover:from-[#FFD2CC] hover:to-[#E8A598] text-white font-black rounded-2xl border-b-4 border-[#C7877A] active:border-b-0 active:translate-y-1 transition-all"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Thu thập
              </motion.button>

              {/* Nút Quay Tiếp x10 */}
              {onReRoll && (
                <motion.button
                  disabled={userCoins < 90}
                  onClick={handleReRollClick}
                  whileHover={userCoins >= 90 ? { scale: 1.03 } : {}}
                  whileTap={userCoins >= 90 ? { scale: 0.97 } : {}}
                  className="flex-1 h-12 bg-gradient-to-r from-[#D6C7FF] to-[#A294F9] hover:from-[#E1D7FF] hover:to-[#A294F9] text-white font-black rounded-2xl border-b-4 border-[#8172DC] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Quay tiếp x10
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}