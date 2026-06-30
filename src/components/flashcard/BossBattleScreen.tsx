"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { Heart, Flame, Swords, Zap, Target, Clock, ArrowLeft, Skull, Sparkles } from "lucide-react";
import { playSFX } from "@/utils/sfx";
import { BossHelpersPanel } from "./BossHelpersPanel";
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
  usePhaoBoi: (currency: "coins" | "goldenFur") => Promise<boolean>;
  useKinhLup: (currency: "coins" | "goldenFur") => Promise<boolean>;
  onCancel: () => void;
  isTimerActive: boolean;
  onStartBattle: () => void;
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
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="relative bg-gradient-to-br from-white/90 via-[#FFFDF0]/95 to-[#FFEAEA]/90 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-[0_16px_40px_rgba(255,159,28,0.15)] w-full max-w-sm p-6 pt-8 z-10"
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
          className="text-amber-950 font-black text-xl mb-4 pr-12"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Shiba Sensei hướng dẫn!
        </h2>

        {/* Tutorial Steps */}
        <div className="flex flex-col gap-2.5">
          {/* Step 1 */}
          <div className="flex items-center gap-3 bg-[#E0F7F0] border border-[#A7E8D0]/60 rounded-[1rem] px-3 py-2.5">
            <Target className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-rounded font-bold text-emerald-800">
              Gõ phiên âm <span className="text-[#FF9F1C]">Romaji</span> của từ hiển thị
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 bg-[#FFE4EC] border border-[#FFB3C6]/60 rounded-[1rem] px-3 py-2.5">
            <Clock className="w-5 h-5 text-pink-600 flex-shrink-0" />
            <p className="text-sm font-rounded font-bold text-pink-800">
              Hết giờ hoặc gõ sai = <span className="text-[#E63946]">mất 1 mạng tim!</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 bg-[#FFF8DC] border border-[#FFE082]/60 rounded-[1rem] px-3 py-2.5">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500 flex-shrink-0" />
            <p className="text-sm font-rounded font-bold text-amber-800">
              Bạn có <span className="text-[#FF7096]">3 tim</span> — hết tim là thua cuộc
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-3 bg-[#FFF3E0] border border-[#FFCC80]/60 rounded-[1rem] px-3 py-2.5">
            <Flame className="w-5 h-5 text-orange-600 fill-orange-600 flex-shrink-0" />
            <p className="text-sm font-rounded font-bold text-orange-800">
              Combo liên tiếp = <span className="text-[#FF9F1C]">sát thương gấp đôi!</span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 h-14 bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] hover:from-[#FF5C8A] hover:to-[#E68E19] text-white font-black text-lg rounded-[1.25rem] border border-white/40 active:scale-95 transition-all shadow-md cursor-pointer"
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
  isTimerActive,
  onStartBattle,
}: BossBattleScreenProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [countdownVal, setCountdownVal] = useState<number | "FIGHT" | null>(null);

  const startCountdownSequence = () => {
    setCountdownVal(3);
  };

  // Check if user has seen the tutorial before
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenBossTutorial");
    if (!hasSeen) {
      setShowTutorial(true);
    } else {
      startCountdownSequence();
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenBossTutorial", "true");
    setShowTutorial(false);
    startCountdownSequence();
  };

  // Countdown runner
  useEffect(() => {
    if (countdownVal === null) return;

    if (countdownVal === "FIGHT") {
      const timer = setTimeout(() => {
        setCountdownVal(null);
        onStartBattle(); // Start the timer
      }, 800);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (countdownVal === 1) {
        setCountdownVal("FIGHT");
      } else {
        setCountdownVal((countdownVal as number) - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownVal, onStartBattle]);

  // Auto focus input when active
  useEffect(() => {
    if (inputRef.current && !showTutorial && isTimerActive && countdownVal === null) {
      inputRef.current.focus();
    }
  }, [currentBossCard, showTutorial, isTimerActive, countdownVal]);

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
        className={`w-full max-w-xl mx-auto min-h-[640px] bg-gradient-to-br from-[#FFF5E6]/85 via-white/60 to-[#FFF0EA]/80 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-[0_20px_50px_rgba(255,159,28,0.15)] relative flex flex-col justify-between p-6 sm:p-8 overflow-hidden transition-all duration-300 ${screenShake ? "animate-[shake_0.3s_ease-in-out_infinite]" : ""
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
            className="font-rounded font-bold text-xs text-zinc-500 hover:text-zinc-700 px-4 py-2 bg-white/40 hover:bg-white/60 border border-white/50 rounded-[1rem] active:scale-95 transition-all shadow-sm backdrop-blur-sm cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Trốn chạy
            </span>
          </button>

          {/* Battle Badge */}
          <div className="bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] text-white border border-white/50 px-3 py-1.5 rounded-[1rem] font-rounded font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-pink-500/10">
            <Swords size={14} className="animate-pulse" />
            <span style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1.5px" }}>VÕ ĐÀI BOSS</span>
          </div>
        </div>

        {/* TOP: Boss Health Bar and Avatar */}
        <div className="flex flex-col items-center w-full z-10 my-2 relative">
          {/* Boss HP Bar */}
          <div className="w-full bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-orange-200/40 shadow-sm">
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
                className="h-full bg-gradient-to-r from-[#FF4D6D] via-[#FF7096] to-[#FF9F1C] rounded-full shadow-[0_0_12px_rgba(255,112,150,0.6)]"
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
            className={`relative w-24 h-24 my-3 flex items-center justify-center rounded-full border transition-all duration-150 ${bossFlash
              ? "border-[#FFD166] bg-amber-500/20 shadow-[0_0_30px_rgba(255,209,102,0.6)]"
              : "border-[#E63946]/30 bg-gradient-to-br from-pink-500/10 to-red-500/10 shadow-[0_8px_24px_rgba(230,57,70,0.15)]"
              }`}
          >
            {/* Daruma Face */}
            <Skull className={`w-16 h-16 text-[#E63946] fill-[#E63946]/10 transition-transform ${bossFlash ? "scale-110 text-[#FFD166] fill-[#FFD166]/10" : ""}`} />

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
                  {activeDamageText.isCritical ? "CRITICAL! " : ""}-{activeDamageText.damage} HP
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
                {activeSkillEffect === "shiba_special" ? (
                  <Sparkles className="w-8 h-8 text-amber-400 fill-amber-400 animate-spin" />
                ) : activeSkillEffect === "double" ? (
                  <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ) : (
                  <Flame className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                )}
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
                className="absolute left-2 top-0 z-10 flex items-center gap-1 bg-gradient-to-r from-[#FF9F1C] to-[#E63946] text-white font-black text-sm px-3 py-1.5 rounded-[1rem] border border-white/50 shadow-md"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" /> COMBO x{comboCount}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shiba Lives Hearts */}
          <div className="absolute right-2 top-0 z-10 flex gap-1.5 bg-white/55 backdrop-blur-sm border border-white/60 px-3 py-1.5 rounded-[1rem] shadow-sm">
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
                className="text-5xl sm:text-6xl text-amber-950 font-black select-none tracking-wide filter drop-shadow-[0_2px_0_#FFF]"
                style={{
                  fontFamily: "var(--font-cherry)",
                  WebkitTextStroke: "1px rgba(255, 255, 255, 0.4)"
                }}
              >
                {currentBossCard.word}
              </h3>
            </div>
          )}

          {/* Timer Bar */}
          <div className="w-4/5 h-3 bg-[#FFE8D6]/60 rounded-full overflow-hidden border border-orange-200/50 relative shadow-inner my-2">
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
                className="text-center font-black font-rounded text-amber-800 text-base bg-amber-100/50 border border-amber-300/40 px-4 py-2 rounded-[1rem] w-fit mx-auto shadow-sm backdrop-blur-sm"
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
              disabled={countdownVal !== null || !isTimerActive}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={countdownVal !== null ? "Chuẩn bị..." : "Gõ phiên âm Romaji..."}
              className="w-full h-14 rounded-[1.25rem] border border-white/60 bg-white/60 text-center font-rounded font-black text-xl text-amber-955 placeholder:text-amber-300/80 focus:outline-none focus:bg-white/80 focus:border-[#FF9F1C] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:shadow-[0_4px_16px_rgba(255,159,28,0.15)] transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--font-cherry)" }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || countdownVal !== null || !isTimerActive}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] hover:from-[#FF5C8A] hover:to-[#E68E19] text-white font-rounded font-black rounded-xl text-sm active:scale-95 transition-all disabled:opacity-40 shadow-sm cursor-pointer"
            >
              <Swords className="w-4 h-4" />
            </button>
          </form>

          {/* Shiba Master Helpers Area */}
          <BossHelpersPanel
            usePhaoBoi={usePhaoBoi}
            useKinhLup={useKinhLup}
            isHintRevealed={isHintRevealed}
          />
        </div>

        {/* 3-2-1 Countdown Overlay */}
        <AnimatePresence>
          {countdownVal !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#FFFDF9]/95 backdrop-blur-xs flex flex-col items-center justify-center z-50 select-none pointer-events-none"
            >
              <motion.div
                key={countdownVal}
                initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="font-black text-center"
                style={{
                  fontFamily: "var(--font-cherry)",
                  fontSize: countdownVal === "FIGHT" ? "4.5rem" : "6rem",
                  color: countdownVal === "FIGHT" ? "#E63946" : "#FF9F1C",
                  textShadow: "0 8px 16px rgba(255, 159, 28, 0.2), 0 0 10px currentColor",
                }}
              >
                {countdownVal}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
