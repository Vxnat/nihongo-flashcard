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
  X,
  BookMarked,
} from "lucide-react";
import { ControlPanel } from "./ControlPanel";
import { TypingBossFight } from "@/components/flashcard/TypingBossFight";
import { FallingSparkles } from "./FallingSparkles";
import { SwipeCard } from "./SwipeCard";
import { SwipeGuide } from "./SwipeGuide";
import { useFlashcardDeck } from "@/hooks/flashcard/useFlashcardDeck";
import { BossBattleScreen } from "./BossBattleScreen";
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
    <div className={`flex flex-col items-center w-full overflow-x-hidden px-4 pt-4 pb-20 min-h-[100dvh] transition-all duration-700 ${isZen ? "theme-zen bg-[#0A0414]/90 text-white" : "theme-kawaii bg-[#FFFDF5] text-zinc-900"}`}>
      {/* ==========================================
          HEADER KẸO DẺO (SQUISHY NAVIGATION)
          ========================================== */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between px-4 relative z-20">
        {/* Nút Về Nhà (Trắng viền Cam hoặc Kính mờ Zen) */}
        <Link href="/">
          <button 
            className={`flex items-center justify-center h-12 px-4 rounded-[1.25rem] transition-all group cursor-pointer ${
              isZen 
                ? "bg-white/10 text-white/80 border border-white/20 hover:text-white hover:bg-white/20 active:translate-y-1" 
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
          className={`px-4 py-2 rounded-[1.25rem] font-rounded font-black text-xs uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[160px] ${
            isZen 
              ? "bg-white/10 border border-white/20 text-white/90" 
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
        {/* 1. Ảnh nền Lofi (Có thể tải file ảnh/GIF vào thư mục public và đổi src thành "/ten-anh.gif") */}
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1920"
          alt="Lofi Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />

        {/* 2. Lớp phủ màu Đêm Trăng Kẹo Ngọt để giữ độ mộng mơ và làm mờ (blur) bớt ảnh gốc */}
        <div className="absolute inset-0 bg-[#4A306D]/70 backdrop-blur-[3px]" />

        {/* Hiệu ứng sao rơi chỉ bật khi vào mode Podcast */}
        <AnimatePresence>
          {globalMode === "podcast" && <FallingSparkles />}
        </AnimatePresence>
      </div>

      {/* 1. THANH TIẾN TRÌNH VIỀN TRÊN (TOP EDGE GLOW BAR) */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-zinc-200/40 overflow-hidden animate-in slide-in-from-top-2 duration-700">
        <div
          // Nếu 0% thì set cứng w-3 (một chấm sáng) và cho nhấp nháy để gọi mời
          className={`h-full transition-all duration-700 ease-out relative rounded-r-full ${
            isZen 
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
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", bounce: 0.6 },
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-15 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center w-full px-4"
          >
            <span className="text-4xl md:text-5xl animate-bounce drop-shadow-md">
              {comboConfig.icon}
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] mt-1 transition-colors duration-300 leading-tight"
              style={{
                color: comboConfig.color,
                fontFamily: "var(--font-cherry)",
                WebkitTextStroke: "2px white",
              }}
            >
              {comboConfig.text} x{comboCount}!
            </h2>
            {/* Thanh thời gian ngọn lửa tàn (8 giây) */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className={`h-2 w-[120px] bg-gradient-to-r ${comboConfig.gradient} rounded-full mt-2 transition-all duration-300`}
              style={{ boxShadow: `0 0 8px ${comboConfig.glow}` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* HIỂN THỊ SỐ LƯỢNG VÀ CÔNG TẮC TOÀN CỤC DƯỚI DẠNG DYNAMIC ISLAND */}
      <div className="w-full max-w-md mx-auto mb-4 mt-6 flex justify-center items-center relative z-[100] px-4">
        <motion.div
          ref={islandRef}
          layout
          style={{ borderRadius: isIslandExpanded ? "2rem" : "9999px" }}
          className={`relative z-50 border shadow-lg transition-all duration-300 ${
            isIslandExpanded
              ? isZen
                ? "w-[320px] h-[135px] bg-gradient-to-br from-[#1E112C]/80 to-[#0B0612]/90 border-pink-500/20 p-4"
                : "w-[320px] h-[135px] bg-gradient-to-br from-[#FFFDF5]/90 via-white/80 to-[#FFE2D1]/90 border-[#FFE2D1] p-4"
              : isZen
                ? "w-[170px] h-[44px] bg-white/10 border-white/15 px-3 cursor-pointer flex items-center justify-between text-white/90"
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
                <span className="font-rounded font-bold text-xs tracking-wide">
                  🐾 {learnedCardsCount}/{totalOriginalCards}
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
                <div className="flex items-center justify-between w-full border-b border-white/10 pb-1.5">
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
                      className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold font-rounded transition-all cursor-pointer active:scale-90 ${
                        showFurigana
                          ? isZen
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.3)]"
                            : "bg-[#E0F7FA] border-[#80DEEA] text-[#00ACC1]"
                          : isZen
                            ? "bg-white/5 border-white/10 text-white/40"
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
                            className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold font-rounded transition-all cursor-pointer active:scale-90 ${
                              isZen
                                ? "bg-amber-500/20 border-yellow-500/30 text-yellow-400 hover:bg-amber-500/30"
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
                            className={`flex flex-col w-full h-full max-h-[85vh] rounded-xl overflow-hidden border-4 shadow-2xl ${
                              isZen
                                ? "border-pink-500/40 bg-[#1E112C] text-white"
                                : "border-[#A0E8D5] bg-[#FDFBF7] text-zinc-800"
                            }`}
                          >
                            <DialogHeader
                              className={`p-5 pb-6 border-b-4 shrink-0 text-center ${
                                isZen ? "bg-gradient-to-r from-purple-900 to-indigo-950 border-pink-500/30" : "bg-[#06D6A0] border-[#A0E8D5]"
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
                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] ${
                                      isZen
                                        ? "bg-[#0B0612]/60 border-purple-500/20 text-white"
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
                                      <div className={`px-2 py-1 rounded-lg border flex justify-between gap-2 ${
                                        isZen 
                                          ? "bg-purple-950/40 border-purple-500/20 text-purple-200" 
                                          : "bg-orange-50 border-orange-100 text-orange-800"
                                      }`}>
                                        <span>ON:</span>
                                        <span className="text-[#FF9F1C] truncate text-right" title={kanjiItem.onyomi}>
                                          {kanjiItem.onyomi || "---"}
                                        </span>
                                      </div>
                                      <div className={`px-2 py-1 rounded-lg border flex justify-between gap-2 ${
                                        isZen 
                                          ? "bg-pink-950/40 border-pink-500/20 text-pink-200" 
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
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 border cursor-pointer ${
                      globalMode === "podcast"
                        ? "bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] text-white shadow-[0_0_10px_rgba(255,112,150,0.6)] border-[#FFB3C6]"
                        : isZen
                          ? "bg-white/5 text-white/50 border-white/10 hover:text-white"
                          : "bg-white border-2 border-[#FFE2D1] text-[#FF7096] shadow-[0_2px_0_0_#FFE2D1] hover:bg-orange-50"
                    }`}
                    title="Chế độ Rảnh Tay (Podcast)"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>

                  {/* Thanh trượt chọn Lật/Gõ (Tic-Tac Toggle) */}
                  <div
                    className={`relative flex w-[92px] h-[34px] bg-white/10 p-1 rounded-full border border-white/10 transition-opacity ${
                      globalMode === "podcast" ? "opacity-30 pointer-events-none" : "opacity-100"
                    }`}
                  >
                    {/* Cục kẹo chạy */}
                    <motion.div
                      className="absolute top-[3px] bottom-[3px] w-[calc(50%-4px)] rounded-full border"
                      animate={{
                        left: globalMode === "swipe" ? "4px" : "calc(50% + 0px)",
                        backgroundColor: globalMode === "swipe" ? "#FF7096" : "#06D6A0",
                        borderColor: globalMode === "swipe" ? "#FFB3C6" : "#A0E8D5",
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
                      className={`relative z-10 flex-1 flex items-center justify-center transition-colors duration-300 cursor-pointer ${
                        globalMode === "swipe" ? "text-white" : isZen ? "text-white/40" : "text-zinc-500 hover:text-zinc-700"
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
                      className={`relative z-10 flex-1 flex items-center justify-center transition-colors duration-300 cursor-pointer ${
                        globalMode === "typing" ? "text-white" : isZen ? "text-white/40" : "text-zinc-500 hover:text-zinc-700"
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
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 border cursor-pointer ${
                      showMascot
                        ? "bg-[#FFD166] text-amber-950 border-[#ffe11c] shadow-[0_2px_0_0_#FF9F1C]"
                        : isZen
                          ? "bg-white/5 text-white/40 border-white/10 grayscale"
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {globalMode === "podcast" ? (
        // --- CHẾ ĐỘ RẢNH TAY (PODCAST / ZEN MODE) ---
        <>
          <div
            className="w-full max-w-md h-[400px] relative z-10 mt-5"
            style={{ perspective: 1200 }}
          >
            <AnimatePresence custom={exitDir} mode="popLayout">
              <SwipeCard
                key={currentCard.id}
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onSwipe={handleSwipeAction}
                exitDir={exitDir}
                showFurigana={showFurigana}
                isPodcastMode={true}
                podcastIsPlaying={podcastIsPlaying}
              />
            </AnimatePresence>
          </div>

          {/* AUDIO PLAYER UI CHO PODCAST */}
          <div className="w-full max-w-md mx-auto relative z-10 mt-10 px-4 animate-in slide-in-from-bottom-6 fade-in duration-500">
            {/* Speed Selector */}
            <div className="flex justify-center gap-1 sm:gap-3 mb-6 bg-white/5 p-1.5 rounded-full border border-white/10 w-fit mx-auto shadow-lg max-w-full overflow-x-auto hide-scrollbar backdrop-blur-md">
              <button
                onClick={() => setPodcastSpeed("slow")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm transition-all border-none flex items-center gap-1.5 shrink-0 active:translate-y-[2px] ${
                  podcastSpeed === "slow" 
                    ? "bg-[#FF7096] text-white shadow-[0_0_12px_rgba(255,112,150,0.6)]" 
                    : "bg-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <span className="text-xs sm:text-sm">🐢</span>
                <span
                  style={{
                    fontFamily: "var(--font-cherry)",
                    letterSpacing: "1px",
                    paddingTop: "2px",
                  }}
                >
                  Chậm
                </span>
              </button>
              <button
                onClick={() => setPodcastSpeed("normal")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm transition-all border-none flex items-center gap-1.5 shrink-0 active:translate-y-[2px] ${
                  podcastSpeed === "normal" 
                    ? "bg-[#06D6A0] text-white shadow-[0_0_12px_rgba(6,214,160,0.6)]" 
                    : "bg-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <span className="text-xs sm:text-sm">🚶</span>
                <span
                  style={{
                    fontFamily: "var(--font-cherry)",
                    letterSpacing: "1px",
                    paddingTop: "2px",
                  }}
                >
                  Vừa
                </span>
              </button>
              <button
                onClick={() => setPodcastSpeed("fast")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm transition-all border-none flex items-center gap-1.5 shrink-0 active:translate-y-[2px] ${
                  podcastSpeed === "fast" 
                    ? "bg-[#FF9F1C] text-white shadow-[0_0_12px_rgba(255,159,28,0.6)]" 
                    : "bg-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <span className="text-xs sm:text-sm">🐇</span>
                <span
                  style={{
                    fontFamily: "var(--font-cherry)",
                    letterSpacing: "1px",
                    paddingTop: "2px",
                  }}
                >
                  Nhanh
                </span>
              </button>
            </div>

            {/* Main Audio Controls Block */}
            <div className="flex flex-col items-center gap-4 bg-white/10 p-5 rounded-[2.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-md">
              {/* SÓNG ÂM THANH DÀNH CHO PODCAST (Pulsing sound waves) */}
              <div className="flex items-end justify-center gap-1.5 h-8 my-1 w-full">
                {podcastIsPlaying ? (
                  [...Array(11)].map((_, i) => {
                    const delays = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.7, 0.55, 0.4, 0.25, 0.1];
                    const heights = ["40%", "70%", "100%", "70%", "40%", "80%", "40%", "70%", "100%", "70%", "40%"];
                    return (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-[#FF7096] to-[#FFB3C6] rounded-full"
                        animate={{ height: ["20%", heights[i], "20%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: delays[i],
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })
                ) : (
                  [...Array(11)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-white/20 rounded-full"
                    />
                  ))
                )}
              </div>

              <div className="flex items-center justify-center gap-6 w-full">
                <button
                  onClick={() => handlePodcastNext(-1)}
                  className="w-14 h-14 flex items-center justify-center bg-white/5 text-pink-200 border border-white/10 rounded-2xl shadow-none active:translate-y-[2px] transition-all hover:bg-white/10 hover:text-white"
                >
                  <SkipBack size={24} strokeWidth={3} fill="currentColor" />
                </button>

                <button
                  onClick={() => setPodcastIsPlaying(!podcastIsPlaying)}
                  className="w-20 h-20 flex items-center justify-center bg-[#FF7096] text-white rounded-full shadow-[0_0_20px_rgba(255,112,150,0.6)] hover:bg-[#FF5C8A] active:translate-y-1 transition-all"
                >
                  {podcastIsPlaying ? (
                    <Pause size={32} strokeWidth={3} fill="currentColor" />
                  ) : (
                    <Play
                      size={32}
                      strokeWidth={3}
                      fill="currentColor"
                      className="ml-1"
                    />
                  )}
                </button>

                <button
                  onClick={() => handlePodcastNext(1)}
                  className="w-14 h-14 flex items-center justify-center bg-white/5 text-pink-200 border border-white/10 rounded-2xl shadow-none active:translate-y-[2px] transition-all hover:bg-white/10 hover:text-white"
                >
                  <SkipForward size={24} strokeWidth={3} fill="currentColor" />
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


          {/* 4. NÚT VÀO ẢI VÀ THÁCH ĐẤU BOSS */}
          <div className="w-full max-w-md mx-auto mt-5 sm:mt-10 px-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setTempTyping(true); // Bật công tắc tạm thời
                setIsFlipped(false); // Đảm bảo thẻ úp lại trước khi vào ải
              }}
              className="w-full h-12 sm:h-14 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 rounded-2xl font-bold border-2 border-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
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

            {(bossStatus === "boss_unlocked" || bossStatus === "completed") && (
              <button
                onClick={startBossMode}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] hover:from-[#FF5C8A] hover:to-[#E68E19] text-white rounded-2xl font-bold border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-md animate-pulse"
              >
                <span style={{ fontFamily: "var(--font-cherry)" }}>THÁCH ĐẤU BOSS 🦊</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* NÚT FULLSCREEN NỔI (FLOATING ACTION BUTTON) TẠI GÓC DƯỚI PHẢI */}
      {isFullscreenSupported && (
        <button
          onClick={toggleFullscreen}
          className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] w-[50px] h-[50px] flex items-center justify-center rounded-full transition-all duration-300 active:duration-75 active:scale-90 ${globalMode === "podcast"
            ? "bg-white/10 backdrop-blur-md text-white/70 border-2 border-white/20 hover:text-white hover:bg-white/20 shadow-lg"
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
