"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import Link from "next/link";
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Keyboard,
  Maximize,
  Minimize,
  ArrowLeft,
  Shuffle,
  ListMusic,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ControlPanel } from "./ControlPanel";
import { TypingBossFight } from "@/components/flashcard/TypingBossFight";
import { FallingSparkles } from "./FallingSparkles";
import { SwipeCard } from "./SwipeCard";
import { SwipeGuide } from "./SwipeGuide";
import { useFlashcardDeck } from "@/hooks/flashcard/useFlashcardDeck";
import { BossBattleScreen } from "./BossBattleScreen";
import { CassetteCard } from "./CassetteCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


// ==========================================
// COMPONENT CHA: GIAO DIỆN DECK
// ==========================================
interface FlashcardDeckProps {
  deckId: string;
  initialCards: FlashcardData[];
  isCustom?: boolean;
}

export function FlashcardDeck({
  deckId,
  initialCards,
  isCustom,
}: FlashcardDeckProps) {
  const {
    isMounted,
    activeCards,
    currentCard,
    globalMode,
    setGlobalMode,
    exitDir,
    isFlipped,
    setIsFlipped,
    showFurigana,
    setShowFurigana,
    podcastIsPlaying,
    setPodcastIsPlaying,
    podcastSpeed,
    setPodcastSpeed,
    progressPercent,
    learnedCardsCount,
    totalOriginalCards,
    setTempTyping,
    isTypingActive,
    currentIndex,
    isFullscreen,
    isFullscreenSupported,
    showMascot,
    setShowMascot,
    mascotState,
    playMascotAnim,
    handleFlip,
    handlePodcastNext,
    handleShuffle,
    handlePlayAudio,
    toggleFullscreen,
    appMode,
    comboCount,
    setComboCount,
    handleSwipeAction,
    isBossMode,
    bossHp,
    bossMaxHp,
    shibaHp,
    currentBossCard,
    bossTimeLeft,
    isHintRevealed,
    activeSkillEffect,
    activeDamageText,
    screenShake,
    bossFlash,
    projectileFlying,
    bossStatus,
    startBossMode,
    handleBossWordSubmit,
    usePhaoBoi,
    useKinhLup,
    handleBossCancel,
    bossCardMaxTime,
    isTimerActive,
    startBossBattleTimer,
  } = useFlashcardDeck({ deckId, initialCards, isCustom });

  const [showSwipeGuide, setShowSwipeGuide] = useState(false);
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
        setIsIslandExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenSwipeGuide');
    if (!hasSeenGuide) {
      // Delay một chút để UI chính kịp tải rồi mới hiện hướng dẫn
      const timer = setTimeout(() => setShowSwipeGuide(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseGuide = () => {
    localStorage.setItem('hasSeenSwipeGuide', 'true');
    setShowSwipeGuide(false);
  };
  if (!isMounted || (!currentCard && !isBossMode))
    return (
      <div className="w-full flex flex-col items-center">
        {/* Giao diện header trong khi chờ tải */}
        <div className="w-full max-w-md mb-6 flex items-center justify-between px-4">
          <Link href="/">
            <button className="flex items-center justify-center h-12 px-4 bg-white border-4 border-[#FFE2D1] rounded-[1.25rem] shadow-[0_4px_0_0_#FFE2D1] text-orange-400 hover:text-orange-500 hover:bg-orange-50 active:translate-y-1 active:shadow-[0_0_0_0_#FFE2D1] transition-all group cursor-pointer">
              <ArrowLeft
                className="w-5 h-5 mr-1.5 group-hover:-translate-x-1 transition-transform"
                strokeWidth={3}
              />
              <span
                className="font-rounded font-bold text-sm tracking-wide"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Về nhà
              </span>
            </button>
          </Link>

          <div className="bg-[#FFD166] border-2 border-[#ffe11c] px-4 py-2 rounded-[1.25rem] shadow-[0_4px_0_0_#FF9F1C] font-rounded font-black text-amber-900 text-xs uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[160px]">
            {isCustom ? (
              <span className="truncate" style={{ fontFamily: "var(--font-cherry)" }}>
                Thẻ Tự Tạo
              </span>
            ) : (
              <>
                <span>📚</span>{" "}
                <span className="truncate" style={{ fontFamily: "var(--font-cherry)" }}>
                  {deckId.replace(/_/g, " ")}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="h-[400px] w-full max-w-md mx-auto bg-[#FFE2D1]/30 animate-pulse rounded-[3rem]" />
      </div>
    );

  // ==========================================
  // MÀN HÌNH BOSS BATTLE (Nếu đang bật Boss Mode)
  // ==========================================
  if (isBossMode) {
    return (
      <div className="flex flex-col items-center w-full px-4 pt-10 pb-20 justify-center min-h-[100dvh] relative">
        <BossBattleScreen
          deckId={deckId}
          currentBossCard={currentBossCard}
          bossHp={bossHp}
          bossMaxHp={bossMaxHp}
          shibaHp={shibaHp}
          bossTimeLeft={bossTimeLeft}
          comboCount={comboCount}
          activeSkillEffect={activeSkillEffect}
          activeDamageText={activeDamageText}
          screenShake={screenShake}
          bossFlash={bossFlash}
          projectileFlying={projectileFlying}
          isHintRevealed={isHintRevealed}
          onSubmit={handleBossWordSubmit}
          usePhaoBoi={usePhaoBoi}
          useKinhLup={useKinhLup}
          onCancel={handleBossCancel}
          bossCardMaxTime={bossCardMaxTime}
          isTimerActive={isTimerActive}
          onStartBattle={startBossBattleTimer}
        />
      </div>
    );
  }

  // Hàm lấy giao diện Combo tùy theo mốc điểm
  const getComboConfig = (count: number) => {
    if (count >= 15)
      return {
        icon: "👑",
        text: "GODLIKE",
        color: "#FFD166",
        glow: "rgba(255,209,102,0.8)",
        gradient: "from-[#FF9F1C] to-[#E63946]",
      };
    if (count >= 10)
      return {
        icon: "🌟",
        text: "UNSTOPPABLE",
        color: "#FF7096",
        glow: "rgba(255,112,150,0.8)",
        gradient: "from-[#FFB3C6] to-[#FF7096]",
      };
    if (count >= 5)
      return {
        icon: "⚡",
        text: "AWESOME",
        color: "#06D6A0",
        glow: "rgba(6,214,160,0.8)",
        gradient: "from-[#A0E8D5] to-[#06D6A0]",
      };
    return {
      icon: "🔥",
      text: "COMBO",
      color: "#FF9F1C",
      glow: "rgba(255,159,28,0.8)",
      gradient: "from-[#FFD166] to-[#FF9F1C]",
    };
  };
  const comboConfig = getComboConfig(comboCount);

  // ==========================================
  // MÀN HÌNH HỌC CHÍNH (MAIN PLAY SCREEN)
  // ==========================================
  const isZen = globalMode === "podcast";

  return (
    <div className={`flex flex-col items-center w-full overflow-x-hidden px-4 pt-4 pb-20 min-h-[100dvh] transition-all duration-700 ${isZen ? "theme-zen bg-gradient-to-br from-[#E2D9FC] via-[#FEE2E9] to-[#E6FAF7] text-[#4A306D]" : "theme-kawaii bg-[#FFFDF5] text-zinc-900"}`}>
      {/* ==========================================
          HEADER KẸO DẺO (SQUISHY NAVIGATION)
          ========================================== */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between px-4 relative z-20">
        {/* Nút Về Nhà (Trắng viền Cam hoặc Kính mờ Zen) */}
        <Link href="/">
          <button
            className={`flex items-center justify-center h-12 px-4 rounded-[1.25rem] transition-all group cursor-pointer ${isZen
              ? "bg-white/40 text-[#4A306D] border border-white/60 hover:bg-white/60 active:translate-y-1"
              : "bg-white/40 backdrop-blur-md border border-white/50 shadow-md text-orange-400 hover:bg-white/60 hover:text-orange-500 active:translate-y-1"
              }`}
          >
            <ArrowLeft
              className="w-5 h-5 mr-1.5 group-hover:-translate-x-1 transition-transform"
              strokeWidth={3}
            />
            <span
              className="font-rounded font-bold text-sm tracking-wide"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Về nhà
            </span>
          </button>
        </Link>

        {/* Nhãn dán Tên Bộ Bài */}
        <div
          className={`px-4 py-2 rounded-[1.25rem] font-rounded font-black text-xs uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[160px] ${isZen
            ? "bg-white/40 border border-white/60 text-[#4A306D]"
            : "bg-gradient-to-r from-amber-100/50 to-orange-100/50 border border-amber-200/60 backdrop-blur-md shadow-md text-amber-900"
            }`}
        >
          {isCustom ? (
            <span className="truncate" style={{ fontFamily: "var(--font-cherry)" }}>
              Thẻ Tự Tạo
            </span>
          ) : (
            <>
              <span>📚</span>{" "}
              <span className="truncate" style={{ fontFamily: "var(--font-cherry)" }}>
                {deckId.replace(/_/g, " ")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* POPUP HƯỚNG DẪN VUỐT (Chỉ hiện lần đầu) */}
      <AnimatePresence>
        {showSwipeGuide && <SwipeGuide onClose={handleCloseGuide} />}
      </AnimatePresence>
      {/* ZEN MODE BACKGROUND OVERLAY (Chỉ tối đi khi bật Podcast) */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0 overflow-hidden ${globalMode === "podcast" ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Nền gradient pastel ấm cúng */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E2D9FC] via-[#FEE2E9] to-[#E6FAF7]" />

        {/* Hiệu ứng sao rơi chỉ bật khi vào mode Podcast */}
        <AnimatePresence>
          {globalMode === "podcast" && <FallingSparkles />}
        </AnimatePresence>
      </div>

      {/* 1. THANH TIẾN TRÌNH VIỀN TRÊN (TOP EDGE GLOW BAR) */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-zinc-200/40 overflow-hidden animate-in slide-in-from-top-2 duration-700">
        <div
          // Nếu 0% thì set cứng w-3 (một chấm sáng) và cho nhấp nháy để gọi mời
          className={`h-full transition-all duration-700 ease-out relative rounded-r-full ${isZen
            ? "bg-[#FF7096] shadow-[0_0_12px_2px_rgba(255,112,150,0.8)]"
            : "bg-[#06D6A0] shadow-[0_0_12px_2px_rgba(6,214,160,0.8)]"
            } ${progressPercent === 0 ? "w-3 animate-pulse" : ""}`}
          style={progressPercent > 0 ? { width: `${progressPercent}%` } : {}}
        >
          {/* Điểm nhấn chói sáng ở mũi nhọn */}
          <div className="absolute right-0 top-0 h-full w-4 bg-white/80 blur-[1px] rounded-full" />
        </div>
      </div>

      {/* HIỆU ỨNG COMBO (Chỉ hiện khi fun mode và combo >= 3) */}
      <AnimatePresence>
        {appMode === "fun" && isTypingActive && comboCount >= 3 && (
          <motion.div
            key={comboCount} // Đổi key để force React chạy lại animation nhảy mỗi khi combo tăng
            initial={{ opacity: 0, scale: 0.3, y: -20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", stiffness: 350, damping: 15 },
            }}
            exit={{ opacity: 0, scale: 0.5, y: -10 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[200] pointer-events-none flex flex-col items-center px-6 py-3.5 rounded-3xl bg-gradient-to-br from-white/35 via-white/55 to-white/35 backdrop-blur-md border border-white/60 shadow-[0_12px_32px_rgba(255,112,150,0.12)] min-w-[140px] max-w-xs"
          >
            <span className="text-4xl md:text-5xl animate-bounce drop-shadow-md select-none">
              {comboConfig.icon}
            </span>
            <h2
              className="text-2xl sm:text-3xl text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] mt-1 transition-colors duration-300 leading-tight select-none font-black"
              style={{
                color: comboConfig.color,
                fontFamily: "var(--font-cherry)",
                WebkitTextStroke: "1px white",
              }}
            >
              {comboConfig.text} x{comboCount}!
            </h2>
            {/* Thanh thời gian ngọn lửa tàn (8 giây) */}
            <div className="w-[100px] bg-zinc-200/40 rounded-full h-1.5 mt-2.5 overflow-hidden border border-white/20">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className={`h-full bg-gradient-to-r ${comboConfig.gradient} rounded-full transition-all duration-300`}
                style={{ boxShadow: `0 0 6px ${comboConfig.glow}` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* HIỂN THỊ SỐ LƯỢNG VÀ CÔNG TẮC TOÀN CỤC DƯỚI DẠNG DYNAMIC ISLAND */}
      <div className="w-full max-w-md mx-auto mb-4 mt-6 flex justify-center items-center relative z-[100] px-4">
        <motion.div
          ref={islandRef}
          layout
          style={{ borderRadius: isIslandExpanded ? "2rem" : "9999px" }}
          className={`relative z-50 border shadow-lg transition-all duration-300 ${isIslandExpanded
            ? `${bossStatus === "boss_unlocked" || bossStatus === "completed"
              ? "w-[320px] h-[190px]"
              : "w-[320px] h-[135px]"
            } ${isZen
              ? "bg-gradient-to-br from-white/70 via-[#EAE4FF]/60 to-[#FFEBEF]/60 border-white/80 p-4 text-[#7C5B9E] backdrop-blur-md"
              : "bg-gradient-to-br from-[#FFFDF5]/90 via-white/80 to-[#FFE2D1]/90 border-[#FFE2D1] p-4 text-zinc-800"
            }`
            : isZen
              ? "w-[170px] h-[44px] bg-white/40 border-white/60 px-3 cursor-pointer flex items-center justify-between text-[#7C5B9E] backdrop-blur-md"
              : "w-[170px] h-[44px] bg-gradient-to-r from-amber-50/50 via-white/50 to-pink-50/50 backdrop-blur-md border border-white/60 px-3 cursor-pointer flex items-center justify-between text-teal-800"
            }`}
          onClick={!isIslandExpanded ? () => setIsIslandExpanded(true) : undefined}
        >
          <AnimatePresence mode="wait">
            {!isIslandExpanded ? (
              /* ==========================================
                 TRẠNG THÁI COLLAPSED (THU GỌN)
                 ========================================== */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full h-full select-none"
              >
                {/* Shiba avatar mini */}
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/60 bg-amber-50/20 flex-shrink-0">
                  <img
                    src="/images/mascot/shiba_avatar_mini.png"
                    alt="Shiba Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Progress Count */}
                <span className="font-rounded font-bold text-xs tracking-wide flex items-center gap-1">
                  {bossStatus === "boss_unlocked" || bossStatus === "completed" ? (
                    <span className="animate-bounce inline-block text-sm" title="Boss sẵn sàng!">🦊</span>
                  ) : (
                    <span>🐾</span>
                  )}
                  {learnedCardsCount}/{totalOriginalCards}
                </span>

                {/* Mode Icon */}
                <span className="text-xs">
                  {globalMode === "podcast" ? "🎧" : globalMode === "typing" ? "⌨️" : "🎴"}
                </span>
              </motion.div>
            ) : (
              /* ==========================================
                 TRẠNG THÁI EXPANDED (MỞ RỘNG)
                 ========================================== */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-between w-full h-full select-none"
              >
                {/* Hàng 1: Avatar, Tiến độ, Nút Tiện ích (Furigana & Hán tự) thay cho nút X */}
                <div className={`flex items-center justify-between w-full border-b pb-1.5 ${isZen ? "border-white/40" : "border-white/10"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/80 bg-amber-50/20">
                      <img
                        src="/images/mascot/shiba_avatar_mini.png"
                        alt="Shiba Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-rounded font-black text-xs">
                      🐾 {learnedCardsCount}/{totalOriginalCards}
                    </span>
                  </div>

                  {/* Cụm nút công cụ: Ẩn/Hiện Furigana (あ) và Hán tự (漢) */}
                  <div className="flex items-center gap-1.5">
                    {/* Nút Furigana */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFurigana(!showFurigana);
                      }}
                      className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold font-rounded transition-all cursor-pointer active:scale-90 ${showFurigana
                        ? isZen
                          ? "bg-[#FFB3C6]/60 border-white/80 text-[#FF7096] shadow-[0_2px_8px_rgba(255,112,150,0.15)]"
                          : "bg-[#E0F7FA] border-[#80DEEA] text-[#00ACC1]"
                        : isZen
                          ? "bg-white/30 border-white/40 text-[#7C5B9E]/65"
                          : "bg-white border-zinc-200 text-zinc-400 opacity-60"
                        }`}
                      title="Bật/tắt Furigana"
                    >
                      あ
                    </button>

                    {/* Nút Hán tự Dialog */}
                    {currentCard?.kanji_info && currentCard.kanji_info.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold font-rounded transition-all cursor-pointer active:scale-90 ${isZen
                              ? "bg-[#FFE2D1]/60 border-white/80 text-[#FF9F1C] hover:bg-[#FFE2D1]/80"
                              : "bg-indigo-50 border-indigo-200 text-indigo-500 hover:bg-indigo-100"
                              }`}
                            title="Xem chi tiết Hán tự"
                          >
                            漢
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          aria-describedby={undefined}
                          onClick={(e) => e.stopPropagation()}
                          className="sm:max-w-[420px] w-[95vw] p-0 bg-transparent border-none shadow-none z-[200]"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`flex flex-col w-full h-full max-h-[85vh] rounded-xl overflow-hidden border-4 shadow-2xl ${isZen
                              ? "border-white/80 bg-gradient-to-br from-[#FFFDF5] to-[#FFE2D1] text-zinc-800"
                              : "border-[#A0E8D5] bg-[#FDFBF7] text-zinc-800"
                              }`}
                          >
                            <DialogHeader
                              className={`p-5 pb-6 border-b-4 shrink-0 text-center ${isZen ? "bg-gradient-to-r from-[#A594F4] to-[#BDB2FF] border-white/20" : "bg-[#06D6A0] border-[#A0E8D5]"
                                }`}
                            >
                              <DialogTitle
                                className="text-2xl tracking-wider text-white"
                                style={{ fontFamily: "var(--font-cherry)" }}
                              >
                                Chi tiết Hán tự
                              </DialogTitle>
                            </DialogHeader>
                            <div className="p-5 overflow-y-auto hide-scrollbar">
                              <div className="grid grid-cols-1 gap-3">
                                {currentCard.kanji_info.map((kanjiItem, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] ${isZen
                                      ? "bg-white/60 border-white/80 text-zinc-800"
                                      : "bg-white border-[#A0E8D5] text-zinc-800"
                                      }`}
                                  >
                                    <span
                                      className="text-4xl text-[#FF9F1C]"
                                      style={{ fontFamily: "var(--font-cherry)" }}
                                    >
                                      {kanjiItem.kanji}
                                    </span>
                                    <div className="flex flex-col font-rounded text-xs font-bold space-y-1 w-full overflow-hidden">
                                      <div className={`px-2 py-1 rounded-lg border flex justify-between gap-2 ${isZen
                                        ? "bg-[#FFE2D1]/40 border-orange-100 text-orange-800"
                                        : "bg-orange-50 border-orange-100 text-orange-800"
                                        }`}>
                                        <span>ON:</span>
                                        <span className="text-[#FF9F1C] truncate text-right" title={kanjiItem.onyomi}>
                                          {kanjiItem.onyomi || "---"}
                                        </span>
                                      </div>
                                      <div className={`px-2 py-1 rounded-lg border flex justify-between gap-2 ${isZen
                                        ? "bg-[#FFEBEF]/40 border-pink-100 text-[#FF7096]"
                                        : "bg-pink-50 border-pink-100 text-pink-800"
                                        }`}>
                                        <span>KUN:</span>
                                        <span className="text-[#FF7096] truncate text-right" title={kanjiItem.kunyomi}>
                                          {kanjiItem.kunyomi || "---"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Hàng 2: Các nút điều khiển */}
                <div className="flex items-center justify-between w-full pt-1.5">
                  {/* Nút tai nghe (Podcast Mode) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newMode = globalMode === "podcast" ? "swipe" : "podcast";
                      setGlobalMode(newMode);
                      if (newMode === "podcast") {
                        setPodcastIsPlaying(true);
                        setIsFlipped(false);
                        setTempTyping(false);
                      } else {
                        setPodcastIsPlaying(false);
                      }
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 border cursor-pointer ${globalMode === "podcast"
                      ? "bg-gradient-to-r from-[#FF7096] to-[#A594F4] text-white border-2 border-white/60 shadow-[0_4px_12px_rgba(165,148,244,0.3)]"
                      : isZen
                        ? "bg-white/40 text-[#FF7096] border border-white/60 hover:bg-white/60 backdrop-blur-sm"
                        : "bg-white border-2 border-[#FFE2D1] text-[#FF7096] shadow-[0_2px_0_0_#FFE2D1] hover:bg-orange-50"
                      }`}
                    title="Chế độ Rảnh Tay (Podcast)"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>

                  {/* Thanh trượt chọn Lật/Gõ (Tic-Tac Toggle) */}
                  <div
                    className={`relative flex w-[92px] h-[34px] p-1 rounded-full border transition-all ${isZen
                      ? "bg-white/40 border-white/60 backdrop-blur-sm"
                      : "bg-white/80 border-white/80"
                      } ${globalMode === "podcast" ? "opacity-30 pointer-events-none" : "opacity-100"}`}
                  >
                    {/* Cục kẹo chạy */}
                    <motion.div
                      className="absolute top-[3px] bottom-[3px] w-[calc(50%-4px)] rounded-full border"
                      animate={{
                        left: globalMode === "swipe" ? "4px" : "calc(50% + 0px)",
                        backgroundColor: globalMode === "swipe" ? "#FF7096" : "#06D6A0",
                        borderColor: globalMode === "swipe" ? (isZen ? "#FFF" : "#FFB3C6") : (isZen ? "#FFF" : "#A0E8D5"),
                        boxShadow: globalMode === "swipe"
                          ? "0 0 8px rgba(255,112,150,0.5)"
                          : "0 0 8px rgba(6,214,160,0.5)"
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    />

                    {/* Nút Lật thẻ */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGlobalMode("swipe");
                        setTempTyping(false);
                        setIsFlipped(false);
                      }}
                      className={`relative z-10 flex-1 flex items-center justify-center transition-colors duration-300 cursor-pointer ${globalMode === "swipe" ? "text-white" : isZen ? "text-[#7C5B9E]/65 hover:text-[#4A306D]" : "text-zinc-500 hover:text-zinc-700"
                        }`}
                    >
                      <Layers strokeWidth={2.5} className="w-4 h-4" />
                    </button>

                    {/* Nút Gõ phím */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGlobalMode("typing");
                        setTempTyping(false);
                        setIsFlipped(false);
                      }}
                      className={`relative z-10 flex-1 flex items-center justify-center transition-colors duration-300 cursor-pointer ${globalMode === "typing" ? "text-white" : isZen ? "text-[#7C5B9E]/65 hover:text-[#4A306D]" : "text-zinc-500 hover:text-zinc-700"
                        }`}
                    >
                      <Keyboard strokeWidth={2.5} className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nút Bật/tắt Linh vật */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMascot(!showMascot);
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 border cursor-pointer ${showMascot
                      ? "bg-[#FFD166] text-amber-950 border-2 border-white shadow-[0_2px_0_0_#FF9F1C]"
                      : isZen
                        ? "bg-white/40 text-zinc-400 border border-white/60 hover:bg-white/60 backdrop-blur-sm grayscale"
                        : "bg-white border-2 border-[#FFE2D1] text-zinc-400 grayscale hover:bg-orange-50"
                      }`}
                    title="Bật/Tắt Linh Vật"
                  >
                    <img
                      src="/images/mascot/mascot-hi.gif"
                      alt="Mascot Avatar"
                      className="w-5 h-5 object-contain"
                    />
                  </button>
                </div>

                {/* Hàng 3 (Nếu mở khóa Boss): Nút Thách đấu Boss */}
                {(bossStatus === "boss_unlocked" || bossStatus === "completed") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn click lan lên Island
                      startBossMode();
                    }}
                    className="w-full h-10 mt-2 bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] hover:from-[#FF5C8A] hover:to-[#E68E19] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md active:translate-y-0.5 active:shadow-sm transition-all text-xs tracking-wider cursor-pointer animate-pulse z-20"
                  >
                    <span style={{ fontFamily: "var(--font-cherry)", paddingTop: "1px" }}>
                      THÁCH ĐẤU BOSS
                    </span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {globalMode === "podcast" ? (
        // --- CHẾ ĐỘ RẢNH TAY (PODCAST / ZEN MODE) ---
        <>
          <div
            className="w-full max-w-md h-[460px] relative z-10"
            style={{ perspective: 1200 }}
          >
            <AnimatePresence custom={exitDir} mode="popLayout">
              <CassetteCard
                key={currentCard.id}
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                exitDir={exitDir}
                showFurigana={showFurigana}
                podcastIsPlaying={podcastIsPlaying}
              />
            </AnimatePresence>
          </div>

          {/* AUDIO PLAYER UI CHO PODCAST */}
          <div className="w-full max-w-md mx-auto relative z-10 mt-8 px-4 animate-in slide-in-from-bottom-6 fade-in duration-500">
            {/* Speed Selector (Shiba Mascot Buttons) */}
            <div className="flex justify-center gap-4 mb-6 bg-white/40 p-2 rounded-[2rem] border border-white/60 w-fit mx-auto shadow-sm backdrop-blur-md select-none">
              {/* Nút Chậm */}
              <button
                onClick={() => setPodcastSpeed("slow")}
                className={`w-15 h-16 flex flex-col items-center justify-center rounded-2xl transition-all border-none active:scale-95 cursor-pointer ${podcastSpeed === "slow"
                  ? "bg-[#FFEBEF]/80 border-2 border-white text-[#FF7096] shadow-[0_4px_12px_rgba(255,112,150,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)] scale-105"
                  : "bg-transparent text-[#4A306D]/60 opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                title="Tốc độ chậm"
              >
                <img
                  src="/images/mascot/shiba-slow.png"
                  alt="Slow"
                  className="w-10 h-10 object-contain drop-shadow-sm"
                />
                <span
                  className="text-[9px] font-bold tracking-wider mt-0.5"
                  style={{ fontFamily: "var(--font-cute)" }}
                >
                  Chậm
                </span>
              </button>

              {/* Nút Vừa */}
              <button
                onClick={() => setPodcastSpeed("normal")}
                className={`w-15 h-16 flex flex-col items-center justify-center rounded-2xl transition-all border-none active:scale-95 cursor-pointer ${podcastSpeed === "normal"
                  ? "bg-[#E6FAF7]/80 border-2 border-white text-[#05A077] shadow-[0_4px_12px_rgba(6,214,160,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)] scale-105"
                  : "bg-transparent text-[#4A306D]/60 opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                title="Tốc độ bình thường"
              >
                <img
                  src="/images/mascot/shiba-normal.png"
                  alt="Normal"
                  className="w-10 h-10 object-contain drop-shadow-sm"
                />
                <span
                  className="text-[9px] font-bold tracking-wider mt-0.5"
                  style={{ fontFamily: "var(--font-cute)" }}
                >
                  Vừa
                </span>
              </button>

              {/* Nút Nhanh */}
              <button
                onClick={() => setPodcastSpeed("fast")}
                className={`w-15 h-16 flex flex-col items-center justify-center rounded-2xl transition-all border-none active:scale-95 cursor-pointer ${podcastSpeed === "fast"
                  ? "bg-[#E0F2FE]/80 border-2 border-white text-[#0284C7] shadow-[0_4px_12px_rgba(56,189,248,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)] scale-105"
                  : "bg-transparent text-[#4A306D]/60 opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                title="Tốc độ nhanh"
              >
                <img
                  src="/images/mascot/shiba-fast.png"
                  alt="Fast"
                  className="w-10 h-10 object-contain drop-shadow-sm"
                />
                <span
                  className="text-[9px] font-bold tracking-wider mt-0.5"
                  style={{ fontFamily: "var(--font-cute)" }}
                >
                  Nhanh
                </span>
              </button>
            </div>

            {/* Main Audio Controls Block */}
            <div className="flex flex-col items-center gap-4 bg-white/40 p-5 rounded-[2.5rem] border border-white/60 shadow-[0_12px_24px_rgba(74,48,109,0.04)] backdrop-blur-md">
              {/* SÓNG ÂM THANH DÀNH CHO PODCAST (Pulsing star/flower particles) */}
              <div className="flex items-center justify-center gap-2.5 h-12 my-1 w-full overflow-hidden select-none">
                {podcastIsPlaying ? (
                  [...Array(11)].map((_, i) => {
                    const delays = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.7, 0.55, 0.4, 0.25, 0.1];
                    return (
                      <motion.span
                        key={i}
                        className="text-lg text-pink-300 drop-shadow-[0_0_4px_rgba(255,112,150,0.4)]"
                        animate={{
                          y: [0, -10, 0],
                          scale: [0.9, 1.15, 0.9],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: delays[i % delays.length],
                          ease: "easeInOut",
                        }}
                      >
                        🌸
                      </motion.span>
                    );
                  })
                ) : (
                  [...Array(11)].map((_, i) => (
                    <span
                      key={i}
                      className="text-md opacity-30 text-[#7C5B9E]"
                    >
                      🌸
                    </span>
                  ))
                )}
              </div>

              {/* Progress track (Động: số từ đã học / tổng số từ) */}
              <div className="w-full flex items-center justify-between gap-2 px-1">
                <span className="text-[10px] font-bold text-[#7C5B9E]/85">
                  {currentIndex + 1}
                </span>
                <div className="flex-1 bg-white/60 h-1.5 rounded-full overflow-visible relative border border-white/20">
                  {/* Cục chạy tím pastel chạy động */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#A594F4] rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / activeCards.length) * 100}%` }}
                  >
                    {/* Nút tròn ở đầu thanh chạy */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-[#A594F4] border-2 border-white rounded-full shadow-md" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#7C5B9E]/85">
                  {activeCards.length}
                </span>
              </div>

              {/* Main Controls Row: Shuffle, SkipBack, Play, SkipForward, Queue */}
              <div className="flex items-center justify-between w-full px-2 mt-1">
                {/* Shuffle Button */}
                <button
                  onClick={handleShuffle}
                  className="w-9 h-9 flex items-center justify-center text-[#7C5B9E]/80 hover:text-[#7C5B9E] hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer"
                  title="Xáo trộn thẻ"
                >
                  <Shuffle size={18} strokeWidth={2.5} />
                </button>

                {/* Nút SkipBack */}
                <button
                  onClick={() => handlePodcastNext(-1)}
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-white/70 via-[#FFEBEF]/50 to-[#FFD6E0]/40 backdrop-blur-md text-[#8fd5f9] border-2 border-white/80 rounded-full shadow-[0_6px_16px_rgba(255,112,150,0.12),inset_0_2px_4px_rgba(255,255,255,0.7)] hover:scale-105 active:translate-y-0.5 active:shadow-sm transition-all hover:bg-[#FFF0F3] cursor-pointer"
                >
                  <ChevronsLeft size={16} strokeWidth={4} fill="currentColor" />
                </button>

                {/* Nút Play/Pause (To nhất) */}
                <div className="relative">
                  {/* Ngôi sao nhỏ màu trắng trang trí đè lên nút ở góc trên bên phải */}
                  <svg
                    className="absolute -top-1 -right-1.5 w-5 h-5 text-white fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] z-10 animate-bounce"
                    style={{ animationDuration: "3s" }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                  </svg>
                  <button
                    onClick={() => setPodcastIsPlaying(!podcastIsPlaying)}
                    className="w-18 h-18 flex items-center justify-center bg-gradient-to-b from-white/60 via-[#EAE4FF]/50 to-[#D6C7FF]/40 backdrop-blur-md text-white rounded-full border-2 border-white/85 shadow-[0_8px_20px_rgba(165,148,244,0.2),inset_0_4px_6px_rgba(255,255,255,0.7)] hover:scale-105 active:translate-y-0.5 active:shadow-sm transition-all cursor-pointer relative"
                  >
                    {podcastIsPlaying ? (
                      <Pause size={22} strokeWidth={4} fill="currentColor" />
                    ) : (
                      <Play
                        size={22}
                        strokeWidth={4}
                        fill="currentColor"
                        className="ml-1"
                      />
                    )}
                  </button>
                </div>

                {/* Nút SkipForward */}
                <button
                  onClick={() => handlePodcastNext(1)}
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-white/70 via-[#E0F2FE]/50 to-[#BAE6FD]/40 backdrop-blur-md text-[#FF9BB5] border-2 border-white/80 rounded-full shadow-[0_6px_16px_rgba(56,189,248,0.12),inset_0_2px_4px_rgba(255,255,255,0.7)] hover:scale-105 active:translate-y-0.5 active:shadow-sm transition-all hover:bg-[#F0F9FF] cursor-pointer"
                >
                  <ChevronsRight size={16} strokeWidth={4} fill="currentColor" />
                </button>

                {/* Queue Button */}
                <button
                  onClick={() => setIsIslandExpanded(!isIslandExpanded)}
                  className="w-9 h-9 flex items-center justify-center text-[#7C5B9E]/80 hover:text-[#7C5B9E] hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer"
                  title="Danh sách thẻ"
                >
                  <ListMusic size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Dòng nút phụ dưới cùng: Replay Word & Mark as Mastered */}
              <div className="flex justify-between items-center w-full px-4 mt-2 border-t border-white/30 pt-3 text-[#7C5B9E] text-xs font-bold select-none">
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1.5 hover:text-[#FF7096] active:scale-95 cursor-pointer"
                  style={{ fontFamily: "var(--font-cute)" }}
                >
                  <img
                    src="/images/mascot/shiba-replay.png"
                    alt="Replay"
                    className="w-5.5 h-5.5 object-contain"
                  />
                  Phát lại từ
                </button>
                <button
                  onClick={() => handleSwipeAction("right")}
                  className="flex items-center gap-1.5 hover:text-[#05A077] active:scale-95 cursor-pointer"
                  style={{ fontFamily: "var(--font-cute)" }}
                >
                  <img
                    src="/images/mascot/shiba-mastered.png"
                    alt="Mastered"
                    className="w-5.5 h-5.5 object-contain"
                  />
                  Thuộc từ này
                </button>
              </div>
            </div>
          </div>
        </>
      ) : isTypingActive ? (
        // --- CHẾ ĐỘ BOSS FIGHT ---
        <div className="w-full max-w-md mx-auto relative z-10 px-4 mt-2">
          <TypingBossFight
            key={`typing-${currentCard.id}`} // Quan trọng: Ép React reset BossFight khi thẻ thay đổi
            card={currentCard}
            onCorrect={() => {
              handleSwipeAction("right", true);
              // Gõ đúng xong thì CHỈ tắt chế độ tạm thời.
              // Nếu đang bật globalMode = "typing" thì nó vẫn giữ nguyên màn hình Gõ phím cho thẻ tiếp theo!
              setTempTyping(false);
            }}
            onWrong={() => {
              playMascotAnim("fail");
              if (appMode === "fun") setComboCount(0); // Gõ sai đứt chuỗi
            }}
            onHint={() => playMascotAnim("hint")} // Gọi trạng thái linh vật gợi ý
            onCancel={() => {
              // Bấm nút Thoát ải: Tắt temp. Nếu đang ở global gõ phím thì ép về lại global quẹt thẻ.
              setTempTyping(false);
              setGlobalMode("swipe");
            }}
          />
        </div>
      ) : (
        // --- CHẾ ĐỘ QUẸT THẺ (MẶC ĐỊNH) ---
        <>
          {/* 2. KHU VỰC THẺ BÀI (Giữ nguyên code cũ của bạn) */}
          <div className="w-full max-w-md h-[400px] relative z-10 mt-5" style={{ perspective: 1200 }}>
            <AnimatePresence custom={exitDir} mode="popLayout">
              <SwipeCard
                key={currentCard.id}
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onSwipe={handleSwipeAction}
                exitDir={exitDir}
                showFurigana={showFurigana}
              />
            </AnimatePresence>
          </div>

          {/* 3. BẢNG ĐIỀU KHIỂN (Giữ nguyên code cũ của bạn) */}
          <ControlPanel
            onPrev={() => handleSwipeAction("left")}
            onNext={() => handleSwipeAction("right")}
            onFlip={handleFlip}
            onShuffle={handleShuffle}
            onPlayAudio={handlePlayAudio}
            currentIndex={currentIndex}
            totalCards={activeCards.length}
            isFlipped={isFlipped}
            card={currentCard}
            isZen={isZen}
          />


          {/* 4. NÚT VÀO ẢI */}
          <div className="w-full max-w-md mx-auto mt-5 sm:mt-10 px-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setTempTyping(true); // Bật công tắc tạm thời
                setIsFlipped(false); // Đảm bảo thẻ úp lại trước khi vào ải
              }}
              className="group btn-shine-effect w-full h-12 sm:h-14 bg-gradient-to-r from-[#E6FAF7]/90 via-[#FFF9F2]/95 to-[#FFEAF2]/90 hover:from-[#dcf8f4]/95 hover:via-[#fff6ea]/95 hover:to-[#ffdbe7]/95 text-teal-800 rounded-2xl font-bold border border-white/60 active:scale-95 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(255,112,150,0.25)] cursor-pointer"
            >
              <span
                style={{
                  fontFamily: "var(--font-cherry)",
                  letterSpacing: "1px",
                  paddingTop: "2px",
                }}
              >
                Gõ đáp án
              </span>
            </button>
          </div>
        </>
      )}

      {/* NÚT FULLSCREEN NỔI (FLOATING ACTION BUTTON) TẠI GÓC DƯỚI PHẢI */}
      {isFullscreenSupported && (
        <button
          onClick={toggleFullscreen}
          className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] w-[50px] h-[50px] flex items-center justify-center rounded-full transition-all duration-300 active:duration-75 active:scale-90 ${globalMode === "podcast"
            ? "bg-gradient-to-b from-white/70 via-[#EAE4FF]/60 to-[#D6C7FF]/50 backdrop-blur-md text-[#7C5B9E] border-2 border-white/80 shadow-[0_8px_16px_rgba(165,148,244,0.25),inset_0_2px_4px_rgba(255,255,255,0.7)] hover:text-[#67448A] hover:scale-105 active:translate-y-0.5"
            : "bg-white text-zinc-400 border-2 border-zinc-200 shadow-[0_4px_0_0_#e4e4e7] hover:text-[#5390D9] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#e4e4e7] active:translate-y-1 active:shadow-none"
            }`}
          title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
        >
          {isFullscreen ? (
            <Minimize size={22} strokeWidth={2.5} />
          ) : (
            <Maximize size={22} strokeWidth={2.5} />
          )}
        </button>
      )}

      {/* LINH VẬT THÚ ẢO (MASCOT) GÓC DƯỚI PHẢI */}
      <AnimatePresence>
        {showMascot && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-24 right-4 lg:bottom-28 lg:right-8 z-[90] pointer-events-none drop-shadow-xl"
          >
            <img
              src={`/images/mascot/mascot-${mascotState}.gif`}
              alt="Mascot"
              className="w-24 h-24 lg:w-32 lg:h-32 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
