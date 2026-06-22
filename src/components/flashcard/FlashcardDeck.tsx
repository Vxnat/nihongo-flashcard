"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { ControlPanel } from "./ControlPanel";
import { TypingBossFight } from "@/components/flashcard/TypingBossFight";
import { FallingSparkles } from "./FallingSparkles";
import { SwipeCard } from "./SwipeCard";
import { SwipeGuide } from "./SwipeGuide";
import { useFlashcardDeck } from "@/hooks/flashcard/useFlashcardDeck";
import { BossBattleScreen } from "./BossBattleScreen";

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
    startReview,
    handlePodcastNext,
    handleShuffle,
    handlePlayAudio,
    toggleFullscreen,
    appMode,
    comboCount,
    setComboCount,
    handleSwipeAction,
    isBossMode,
    setIsBossMode,
    bossHp,
    bossMaxHp,
    shibaHp,
    bossWordsList,
    currentBossCard,
    bossTimeLeft,
    isHintRevealed,
    activeSkillEffect,
    activeDamageText,
    screenShake,
    bossFlash,
    projectileFlying,
    bossStatus,
    bossFailedAttempts,
    startBossMode,
    handleBossWordSubmit,
    usePhaoBoi,
    useKinhLup,
    handleBossCancel,
    bossCardMaxTime,
  } = useFlashcardDeck({ deckId, initialCards, isCustom });

  const [showSwipeGuide, setShowSwipeGuide] = useState(false);

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
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden px-4 pt-4 pb-20 min-h-[100dvh]">
      {/* ==========================================
          HEADER KẸO DẺO (SQUISHY NAVIGATION)
          ========================================== */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between px-4">
        {/* Nút Về Nhà (Trắng viền Cam) */}
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

        {/* Nhãn dán Tên Bộ Bài (Vàng viền Cam đâm) */}
        <div className="bg-[#FFD166] border-2 border-[#ffe11c] px-4 py-2 rounded-[1.25rem] shadow-[0_4px_0_0_#FF9F1C] font-rounded font-black text-amber-900 text-xs uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[160px]">
          {isCustom ? (
            <>
              <span
                className="truncate"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Thẻ Tự Tạo
              </span>
            </>
          ) : (
            <>
              <span>📚</span>{" "}
              <span
                className="truncate"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
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
          className={`h-full bg-[#06D6A0] transition-all duration-700 ease-out relative shadow-[0_0_12px_2px_rgba(6,214,160,0.8)] rounded-r-full ${progressPercent === 0 ? "w-3 animate-pulse" : ""
            }`}
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

      {/* HIỂN THỊ SỐ LƯỢNG VÀ CÔNG TẮC TOÀN CỤC (Chung 1 dòng để tiết kiệm không gian) */}
      <div className="w-full max-w-md mx-auto mb-4 mt-6 flex justify-between items-center px-4 relative z-20">
        {/* NÚT TAI NGHE BÊN TRÁI (Bật/tắt chế độ Rảnh tay) */}
        <button
          onClick={() => {
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
          className={`relative z-10 w-[42px] h-[42px] flex items-center justify-center rounded-full transition-all duration-300 active:duration-75 active:translate-y-1 active:scale-90 shadow-sm ${globalMode === "podcast"
            ? "bg-[#FF7096] text-white shadow-[0_0_15px_rgba(255,112,150,0.8)] border-2 border-[#FFB3C6] scale-110"
            : "bg-zinc-100/80 text-zinc-500 border border-zinc-200/80 hover:bg-zinc-200 grayscale"
            }`}
          title="Chế độ Rảnh Tay (Podcast)"
        >
          <Headphones className="w-5 h-5" />
        </button>

        {/* CÔNG TẮC TIC-TAC (Micro-Pill Toggle) */}
        <div
          className={`relative flex w-[88px] h-[38px] bg-zinc-100/80 backdrop-blur-sm p-1 rounded-full shadow-inner border border-zinc-200/80 transition-opacity ${globalMode === "podcast" ? "opacity-30 pointer-events-none" : "opacity-100"}`}
        >
          {/* Cục kẹo dẻo chạy qua chạy lại làm nền */}
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.1)] border border-zinc-100"
            animate={{
              left: globalMode === "swipe" ? "4px" : "calc(50% + 0px)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />

          {/* Nút Lật Thẻ */}
          <button
            onClick={() => {
              setGlobalMode("swipe");
              setTempTyping(false);
              setIsFlipped(false);
            }}
            className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 active:duration-75 active:translate-y-[2px] active:scale-90 ${globalMode === "swipe"
              ? "scale-110 text-[#FF7096] drop-shadow-sm"
              : "scale-90 text-zinc-400 hover:text-zinc-600"
              }`}
            title="Chế độ lật thẻ"
          >
            <Layers strokeWidth={2.5} className="w-5 h-5" />
          </button>

          {/* Nút Gõ Phím */}
          <button
            onClick={() => {
              setGlobalMode("typing");
              setTempTyping(false);
              setIsFlipped(false);
            }}
            className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 active:duration-75 active:translate-y-[2px] active:scale-90 ${globalMode === "typing"
              ? "scale-110 text-[#06D6A0] drop-shadow-sm"
              : "scale-90 text-zinc-400 hover:text-zinc-600"
              }`}
            title="Chế độ gõ phím"
          >
            <Keyboard strokeWidth={2.5} className="w-5 h-5" />
          </button>
        </div>

        {/* CỤC ĐẾM SỐ & NÚT BẬT LINH VẬT (Bên phải) */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative">
            {progressPercent === 0 && (
              <span className="absolute -inset-1 rounded-full bg-[#06D6A0]/40 animate-ping duration-1000" />
            )}
            <span
              className="relative font-rounded font-black text-[#06D6A0] text-sm bg-[#F0FAF5] px-3 py-1.5 rounded-full border border-[#A0E8D5]/50 shadow-sm transition-all flex items-center justify-center h-[38px]"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              {learnedCardsCount} / {totalOriginalCards}
            </span>
          </div>
          <button
            onClick={() => setShowMascot(!showMascot)}
            className={`w-[38px] h-[38px] flex items-center justify-center rounded-full transition-all duration-300 active:duration-75 active:scale-90 shadow-sm border ${showMascot ? "bg-[#FFD166] text-amber-950 border-[#FFE2D1]" : "bg-zinc-100 text-zinc-400 border-zinc-200 grayscale"}`}
            title="Bật/Tắt Linh Vật"
          >
            <img
              src="/images/mascot/mascot-hi.gif"
              alt="Pet Toggle"
              className={`w-6 h-6 object-contain ${showMascot ? "animate-pulse" : "opacity-60"}`}
            />
          </button>
        </div>
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
            <div className="flex justify-center gap-1 sm:gap-3 mb-6 bg-[#FDFBF7] p-1.5 sm:p-2.5 rounded-full border-4 border-[#FFE2D1] w-fit mx-auto shadow-[0_8px_0_0_#FFE2D1] max-w-full overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setPodcastSpeed("slow")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base transition-all border-2 flex items-center gap-1 sm:gap-1.5 shrink-0 active:translate-y-1 active:shadow-none ${podcastSpeed === "slow" ? "bg-[#FFD166] border-[#FFD166] text-white shadow-[0_4px_0_0_#E6B74A] -translate-y-1" : "bg-white border-[#FFE2D1] text-zinc-400 hover:text-zinc-500 shadow-[0_4px_0_0_#FFE2D1]"}`}
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
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base transition-all border-2 flex items-center gap-1 sm:gap-1.5 shrink-0 active:translate-y-1 active:shadow-none ${podcastSpeed === "normal" ? "bg-[#06D6A0] border-[#06D6A0] text-white shadow-[0_4px_0_0_#05B889] -translate-y-1" : "bg-white border-[#FFE2D1] text-zinc-400 hover:text-zinc-500 shadow-[0_4px_0_0_#FFE2D1]"}`}
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
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base transition-all border-2 flex items-center gap-1 sm:gap-1.5 shrink-0 active:translate-y-1 active:shadow-none ${podcastSpeed === "fast" ? "bg-[#FF9F1C] border-[#FF9F1C] text-white shadow-[0_4px_0_0_#E68E19] -translate-y-1" : "bg-white border-[#FFE2D1] text-zinc-400 hover:text-zinc-500 shadow-[0_4px_0_0_#FFE2D1]"}`}
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

            <div className="flex items-center justify-center gap-6 bg-[#FDFBF7] p-5 rounded-[2.5rem] border-4 border-[#FFE2D1] shadow-[0_12px_0_0_#FFE2D1]">
              <button
                onClick={() => handlePodcastNext(-1)}
                className="w-14 h-14 flex items-center justify-center bg-white text-[#FF9F1C] border-2 border-[#FFE2D1] rounded-2xl shadow-[0_4px_0_0_#FFE2D1] active:translate-y-1 active:shadow-none transition-all hover:bg-orange-50"
              >
                <SkipBack size={24} strokeWidth={3} fill="currentColor" />
              </button>

              <button
                onClick={() => setPodcastIsPlaying(!podcastIsPlaying)}
                className="w-20 h-20 flex items-center justify-center bg-[#FF7096] text-white border-b-4 border-[#C7486B] rounded-full shadow-md hover:bg-[#FF5C8A] active:border-b-0 active:translate-y-1 transition-all"
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
                className="w-14 h-14 flex items-center justify-center bg-white text-[#FF9F1C] border-2 border-[#FFE2D1] rounded-2xl shadow-[0_4px_0_0_#FFE2D1] active:translate-y-1 active:shadow-none transition-all hover:bg-orange-50"
              >
                <SkipForward size={24} strokeWidth={3} fill="currentColor" />
              </button>
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
            showFurigana={showFurigana}
            onToggleFurigana={() => setShowFurigana(!showFurigana)}
            card={currentCard}
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
