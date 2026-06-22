"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { Heart, Flame, Swords, Zap } from "lucide-react";
import { playSFX } from "@/utils/sfx";
import Image from "next/image";

interface BossBattleScreenProps {
  deckId: string;
  currentBossCard: FlashcardData | null;
  bossHp: number;
  bossMaxHp: number;
  shibaHp: number;
  bossTimeLeft: number;
  bossCardMaxTime: number;
  comboCount: number;
  activeSkillEffect: "normal" | "double" | "shiba_special" | null;
  activeDamageText: { damage: number; isCritical: boolean } | null;
  screenShake: boolean;
  bossFlash: boolean;
  projectileFlying: boolean;
  isHintRevealed: boolean;
  onSubmit: (input: string) => void;
  usePhaoBoi: () => Promise<boolean>;
  useKinhLup: () => Promise<boolean>;
  onCancel: () => void;
}

// ==========================================
// COIN ICON COMPONENT (Tái sử dụng cho các nút hỗ trợ)
// ==========================================
function CoinIcon({ size = 14 }: { size?: number }) {
  return (
    <Image
      src="/images/ui/shiba-room/golden_shiba_coin.png"
      alt="xu"
      width={size}
      height={size}
      className="inline-block align-middle"
    />
  );
}

// ==========================================
// MODAL HƯỚNG DẪN SHIBA SENSEI
// ==========================================
function BossTutorialModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="relative bg-white rounded-[2rem] border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFD6C0,0_16px_40px_rgba(255,159,28,0.2)] w-full max-w-sm p-6 pt-8 z-10"
      >
        {/* Shiba Mascot thò ra ngoài viền modal */}
        <div className="absolute -top-10 -right-2 w-20 h-20 z-20">
          <img
            src="/images/mascot/shiba_master.gif"
            alt="Shiba Sensei"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h2
          className="text-amber-900 font-black text-xl mb-4 pr-12"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Shiba Sensei hướng dẫn! 🥋
        </h2>

        {/* Tutorial Steps */}
        <div className="flex flex-col gap-2.5">
          {/* Step 1 */}
          <div className="flex items-center gap-3 bg-[#E0F7F0] border-2 border-[#A7E8D0] rounded-[1rem] px-3 py-2.5">
            <span className="text-xl flex-shrink-0">🎯</span>
            <p className="text-sm font-rounded font-bold text-emerald-800">
              Gõ phiên âm <span className="text-[#FF9F1C]">Romaji</span> của từ hiển thị
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 bg-[#FFE4EC] border-2 border-[#FFB3C6] rounded-[1rem] px-3 py-2.5">
            <span className="text-xl flex-shrink-0">⏱️</span>
            <p className="text-sm font-rounded font-bold text-pink-800">
              Hết giờ hoặc gõ sai = <span className="text-[#E63946]">mất 1 mạng tim!</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 bg-[#FFF8DC] border-2 border-[#FFE082] rounded-[1rem] px-3 py-2.5">
            <span className="text-xl flex-shrink-0">❤️</span>
            <p className="text-sm font-rounded font-bold text-amber-800">
              Bạn có <span className="text-[#FF7096]">3 ❤️</span> — hết tim là thua cuộc
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-3 bg-[#FFF3E0] border-2 border-[#FFCC80] rounded-[1rem] px-3 py-2.5">
            <span className="text-xl flex-shrink-0">🔥</span>
            <p className="text-sm font-rounded font-bold text-orange-800">
              Combo liên tiếp = <span className="text-[#FF9F1C]">sát thương gấp đôi!</span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 h-14 bg-[#FF9F1C] hover:bg-[#e68a00] text-white font-black text-lg rounded-[1.25rem] border-b-4 border-[#cc7a00] active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          ĐÃ SẴN SÀNG!
        </button>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export function BossBattleScreen({
  deckId,
  currentBossCard,
  bossHp,
  bossMaxHp,
  shibaHp,
  bossTimeLeft,
  bossCardMaxTime,
  comboCount,
  activeSkillEffect,
  activeDamageText,
  screenShake,
  bossFlash,
  projectileFlying,
  isHintRevealed,
  onSubmit,
  usePhaoBoi,
  useKinhLup,
  onCancel,
}: BossBattleScreenProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has seen the tutorial before
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenBossTutorial");
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenBossTutorial", "true");
    setShowTutorial(false);
  };

  // Auto focus input
  useEffect(() => {
    if (inputRef.current && !showTutorial) {
      inputRef.current.focus();
    }
  }, [currentBossCard, showTutorial]);

  // Handle submit word
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentBossCard) return;
    onSubmit(inputValue);
    setInputValue("");
  };

  // Get hint first character
  const getFirstCharHint = () => {
    if (!currentBossCard) return "";
    const reading = currentBossCard.romaji || currentBossCard.reading || "";
    return reading.charAt(0).toUpperCase() + "...";
  };

  // Compute timer width percentage
  const timePercent = Math.min(100, Math.max(0, (bossTimeLeft / (bossCardMaxTime || 10)) * 100));

  return (
    <>
      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && <BossTutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-xl mx-auto min-h-[550px] bg-white rounded-[3rem] border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFD6C0,0_16px_40px_rgba(255,159,28,0.15)] relative flex flex-col justify-between p-6 sm:p-8 overflow-hidden transition-all duration-300 ${screenShake ? "animate-[shake_0.3s_ease-in-out_infinite]" : ""
          }`}
      >
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full bg-[#FFD166]/20 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-[#FF7096]/15 blur-[60px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#06D6A0]/8 blur-[80px] pointer-events-none" />

        {/* Arena Header */}
        <div className="flex justify-between items-center z-10 w-full mb-2">
          {/* Escape Button - Squishy Style */}
          <button
            onClick={onCancel}
            className="font-rounded font-bold text-xs text-zinc-400 hover:text-zinc-600 px-4 py-2 bg-zinc-50 border-2 border-zinc-200 rounded-[1rem] shadow-[0_3px_0_0_#e4e4e7] active:translate-y-0.5 active:shadow-[0_0_0_0_#e4e4e7] transition-all"
          >
            🏃 Trốn chạy
          </button>

          {/* Battle Badge */}
          <div className="bg-[#FF9F1C] text-white border-2 border-[#e68a00] px-3 py-1.5 rounded-[1rem] font-rounded font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-[0_3px_0_0_#cc7a00]">
            <Swords size={14} className="animate-pulse" />
            <span style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1.5px" }}>VÕ ĐÀI BOSS</span>
          </div>
        </div>

        {/* TOP: Boss Health Bar and Avatar */}
        <div className="flex flex-col items-center w-full z-10 my-2 relative">
          {/* Boss HP Bar */}
          <div className="w-full bg-[#FFF8F0] rounded-2xl p-3 border-2 border-[#FFE2D1] shadow-[0_2px_0_0_#FFD6C0]">
            <div className="flex justify-between items-center text-xs font-bold text-amber-800 mb-1.5 font-rounded">
              <span className="flex items-center gap-1 text-[#E63946]">
                <Flame size={14} fill="currentColor" /> BOSS DARUMA
              </span>
              <span className="text-amber-600">{Math.round(bossHp)} / {bossMaxHp} HP</span>
            </div>
            <div className="h-4 w-full bg-[#FFE8D6] rounded-full overflow-hidden border-2 border-[#FFDAB9] relative">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-[#FF9F1C] to-[#E63946] rounded-full shadow-[0_0_8px_rgba(255,159,28,0.5)]"
              />
            </div>
          </div>

          {/* Boss Visual Entity - Daruma Chibi */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
              scale: bossFlash ? [1.1, 0.9, 1] : [1, 1.03, 1],
            }}
            transition={{
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              scale: { duration: 0.3 }
            }}
            className={`relative w-24 h-24 my-3 flex items-center justify-center rounded-full border-4 transition-all duration-150 ${bossFlash
              ? "border-[#FFD166] bg-[#FFF8DC] shadow-[0_0_30px_rgba(255,209,102,0.6)]"
              : "border-[#E63946]/50 bg-gradient-to-br from-[#FFF0F0] to-[#FFE0E0] shadow-[0_4px_0_0_#FECACA]"
              }`}
          >
            {/* Daruma Face */}
            <span className={`text-5xl select-none transition-transform ${bossFlash ? "scale-110" : ""}`}>
              👹
            </span>

            {/* Hit / Damage Indicator Popup */}
            <AnimatePresence>
              {activeDamageText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, y: 10, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1.4, y: -45, rotate: 10 }}
                  exit={{ opacity: 0, y: -70, scale: 0.8 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="absolute z-20 font-black text-center select-none"
                  style={{
                    fontFamily: "var(--font-cherry)",
                    color: activeDamageText.isCritical ? "#FF9F1C" : "#E63946",
                    textShadow: "0 2px 4px rgba(0,0,0,0.15), 1px 1px 0px #fff",
                  }}
                >
                  {activeDamageText.isCritical ? "💥 CRITICAL! " : "💢 "}-{activeDamageText.damage} HP
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* MIDDLE: Battle Ground (Shiba & Projectiles & Japanese Words) */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full z-10">
          {/* Projectile (Cute star/paw bay lên) */}
          <AnimatePresence>
            {projectileFlying && (
              <motion.div
                initial={{ y: 90, scale: 0.5, opacity: 0.8 }}
                animate={{ y: -70, scale: [0.8, 1.4, 0.8], opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute z-10 w-10 h-10 rounded-full flex items-center justify-center ${activeSkillEffect === "shiba_special"
                  ? "scale-150"
                  : activeSkillEffect === "double"
                    ? ""
                    : ""
                  }`}
              >
                <span className="text-2xl select-none">
                  {activeSkillEffect === "shiba_special" ? "🌟" : activeSkillEffect === "double" ? "⚡" : "🐾"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Combo Count Popup */}
          <AnimatePresence>
            {comboCount >= 3 && (
              <motion.div
                key={comboCount}
                initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: [-10, 5, -3], opacity: 1 }}
                className="absolute left-2 top-0 z-10 flex items-center gap-1 bg-[#FF9F1C] text-white font-black text-sm px-3 py-1.5 rounded-[1rem] border-2 border-[#e68a00] shadow-[0_3px_0_0_#cc7a00]"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                🔥 COMBO x{comboCount}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shiba Lives Hearts */}
          <div className="absolute right-2 top-0 z-10 flex gap-1.5 bg-white/90 border-2 border-[#FFE2D1] px-3 py-1.5 rounded-[1rem] shadow-[0_3px_0_0_#FFD6C0]">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={i < shibaHp ? { scale: [1, 1.15, 1] } : { scale: 0.7 }}
                transition={{ repeat: i < shibaHp ? Infinity : 0, duration: 1.5, repeatType: "reverse" }}
              >
                <Heart
                  size={18}
                  className={i < shibaHp ? "text-[#FF7096]" : "text-zinc-300"}
                  fill={i < shibaHp ? "currentColor" : "none"}
                />
              </motion.div>
            ))}
          </div>

          {/* Current Word Display */}
          {currentBossCard && (
            <div className="text-center w-full px-4 mb-4 mt-6">
              <h3
                className="text-5xl sm:text-6xl text-amber-900 font-black select-none tracking-wide"
                style={{
                  fontFamily: "var(--font-cherry)",
                  filter: "drop-shadow(0 2px 4px rgba(255,159,28,0.2))",
                }}
              >
                {currentBossCard.word}
              </h3>
              {currentBossCard.reading && currentBossCard.reading !== currentBossCard.word && (
                <p className="text-amber-600/70 font-medium text-sm mt-1">({currentBossCard.reading})</p>
              )}
              <p className="text-amber-800 font-rounded font-black text-lg sm:text-xl mt-3 select-none">
                {currentBossCard.meaning}
              </p>
            </div>
          )}

          {/* Timer Bar */}
          <div className="w-4/5 h-3 bg-[#FFE8D6] rounded-full overflow-hidden border-2 border-[#FFDAB9] relative shadow-inner my-2">
            <div
              style={{ width: `${timePercent}%` }}
              className={`h-full rounded-full shadow-sm transition-[width] duration-100 ease-linear ${bossTimeLeft <= 3
                ? "bg-gradient-to-r from-[#E63946] to-[#FF7096]"
                : "bg-gradient-to-r from-[#06D6A0] to-[#5390D9]"
                }`}
            />
          </div>
        </div>

        {/* BOTTOM: Input and Shiba Master Helper Items */}
        <div className="w-full z-10 mt-2 flex flex-col gap-3">
          {/* Hint text if Magnifier glass (kính lúp) is active */}
          <AnimatePresence>
            {isHintRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center font-black font-rounded text-amber-700 text-base bg-[#FFF8DC] border-2 border-[#FFD166] px-4 py-2 rounded-[1rem] w-fit mx-auto shadow-[0_2px_0_0_#FFC933]"
              >
                Chữ cái đầu: <span className="text-[#FF9F1C] font-black text-lg">{getFirstCharHint()}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input box */}
          <form onSubmit={handleSubmit} className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Gõ phiên âm Romaji..."
              className="w-full h-14 rounded-[1.25rem] border-4 border-[#FFE2D1] bg-[#FFF8F0] text-center font-rounded font-black text-xl text-amber-900 placeholder:text-amber-300 focus:outline-none focus:border-[#FF9F1C] shadow-[0_4px_0_0_#FFD6C0] focus:shadow-[0_4px_0_0_#FF9F1C] transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-[60%] px-4 py-2 bg-[#FF9F1C] hover:bg-[#e68a00] text-white font-rounded font-black rounded-xl text-sm border-b-4 border-[#cc7a00] active:border-b-0 active:translate-y-[-40%] transition-all disabled:opacity-40 disabled:active:translate-y-[-60%] shadow-md cursor-pointer"
            >
              ĐÁNH 💥
            </button>
          </form>

          {/* Shiba Master Helpers Area */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Phao bơi */}
            <button
              type="button"
              onClick={usePhaoBoi}
              className="h-14 bg-[#E0F7FA] hover:bg-[#B2EBF2] border-2 border-[#80DEEA] rounded-[1.25rem] flex items-center justify-center gap-2 text-[#00838F] font-rounded font-black text-sm active:scale-95 shadow-[0_3px_0_0_#4DD0E1] active:shadow-[0_0_0_0_#4DD0E1] active:translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="flex flex-col items-start leading-tight">
                <span>Phao Bơi (+5s)</span>
                <span className="text-[10px] text-[#00838F]/60 font-semibold font-sans flex items-center gap-1">5 xu <CoinIcon size={12} /></span>
              </div>
            </button>

            {/* Kính lúp */}
            <button
              type="button"
              onClick={useKinhLup}
              className="h-14 bg-[#FFF3E0] hover:bg-[#FFE0B2] border-2 border-[#FFCC80] rounded-[1.25rem] flex items-center justify-center gap-2 text-[#E65100] font-rounded font-black text-sm active:scale-95 shadow-[0_3px_0_0_#FFB74D] active:shadow-[0_0_0_0_#FFB74D] active:translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="flex flex-col items-start leading-tight">
                <span>Kính Lúp (Gợi ý)</span>
                <span className="text-[10px] text-[#E65100]/60 font-semibold font-sans flex items-center gap-1">3 xu <CoinIcon size={12} /></span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
