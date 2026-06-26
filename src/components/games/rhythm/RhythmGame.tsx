"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Volume2, VolumeX, Sparkles, Trophy, X, Shield, RefreshCw } from "lucide-react";
import { FlashcardData } from "@/types/flashcard";
import { SystemDeck } from "@/types/flashcard";
import { useRhythmGame, RhythmNote } from "@/hooks/games/rhythm/useRhythmGame";
import Image from "next/image";
import { CoinIcon } from "@/components/common/CoinIcon";

interface RhythmGameProps {
  cards: FlashcardData[];
  minigameDeck: SystemDeck;
  onWin: () => void;
  onClose: () => void;
}

export function RhythmGame({
  cards,
  minigameDeck,
  onWin,
  onClose,
}: RhythmGameProps) {
  const rewards = minigameDeck.rewards || { coins: 20, exp: 50 };
  const {
    score,
    combo,
    maxCombo,
    hp,
    extraHearts,
    hasShield,
    isFeverMode,
    feverEnergy,
    gameStatus,
    targetWord,
    activeNotes,
    hitFeedback,
    isMuted,
    earnedCoins,
    blindActive,
    totalWordsCount,
    currentWordIndex,
    setIsMuted,
    initGame,
    handleTapLane,
    setGameStatus,
  } = useRhythmGame({
    cards,
    rewards,
    onWin,
    onClose,
  });

  const [showTutorial, setShowTutorial] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Check tutorial on mount
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenRhythmTutorial");
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenRhythmTutorial", "true");
    setShowTutorial(false);
    if (gameStatus === "idle") {
      initGame();
    }
  };

  // Keyboard controls listener (A, S, D, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;
      const key = e.key.toLowerCase();
      if (key === "a") handleTapLane(0);
      else if (key === "s") handleTapLane(1);
      else if (key === "d") handleTapLane(2);
      else if (key === "f") handleTapLane(3);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStatus, handleTapLane]);

  // Audio BGM loop management
  useEffect(() => {
    if (gameStatus === "playing") {
      bgmRef.current = new Audio("/sounds/rhythm_bgm.mp3");
      bgmRef.current.loop = true;
      bgmRef.current.volume = isMuted ? 0 : 0.25;
      bgmRef.current.play().catch((err) => {
        if (bgmRef.current) {
          bgmRef.current.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"; // backup BGM
          bgmRef.current.play().catch(e => console.warn("Failed to play backup BGM:", e));
        }
      });
    } else {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, [gameStatus]);

  // Sync mute state to audio element
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : 0.25;
    }
  }, [isMuted]);

  return (
    <div className="w-full max-w-lg mx-auto h-[95vh] min-h-[600px] bg-gradient-to-b from-[#FFF8F0] via-[#FFE8D6] to-[#FFDAB9] rounded-[3rem] border-4 border-[#FFE2D1] shadow-[0_12px_40px_rgba(255,159,28,0.15)] overflow-hidden relative flex flex-col justify-between p-4 select-none">

      {/* CSS Styles injection for Spotlights & Club visual effects */}
      <style jsx global>{`
        @keyframes sweep-left {
          0% { transform: rotate(-35deg); }
          50% { transform: rotate(15deg); }
          100% { transform: rotate(-35deg); }
        }
        @keyframes sweep-right {
          0% { transform: rotate(35deg); }
          50% { transform: rotate(-15deg); }
          100% { transform: rotate(35deg); }
        }
        .spotlight-left {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 150px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,112,150,0.4) 0%, rgba(255,112,150,0) 80%);
          clip-path: polygon(0 0, 100% 0, 60% 100%, 40% 100%);
          transform-origin: top left;
          animation: sweep-left 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }
        .spotlight-right {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 150px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,209,102,0.45) 0%, rgba(255,209,102,0) 80%);
          clip-path: polygon(0 0, 100% 0, 60% 100%, 40% 100%);
          transform-origin: top right;
          animation: sweep-right 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }
      `}</style>

      {/* 1. MÀN HÌNH CHỜ (IDLE SCREEN) */}
      {gameStatus === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-32 h-32 relative mb-6"
          >
            <img
              src="/images/mascot/shiba_master.gif"
              alt="Shiba DJ"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </motion.div>

          <h2
            className="text-4xl text-amber-900 font-black mb-3"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Shiba Rhythm Tiles
          </h2>
          <p className="font-rounded font-bold text-amber-800/70 text-sm max-w-sm mb-8">
            Luyện thính giác nhạy bén, gõ phím bắt đúng phách nhạc để cùng Shiba vượt ải!
          </p>

          <button
            onClick={() => {
              if (showTutorial) return;
              initGame();
            }}
            className="px-8 py-4 bg-[#FF9F1C] hover:bg-[#e68a00] text-white font-black text-xl rounded-2xl border-b-4 border-[#cc7a00] active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            VÀO CHƠI 🚀
          </button>
        </div>
      )}

      {/* 2. MÀN HÌNH ĐANG CHƠI (PLAYING MODE) */}
      {gameStatus === "playing" && (
        <div className="flex-1 flex flex-col relative w-full h-full">
          {/* Header Stats */}
          <div className="flex justify-between items-center w-full mb-3 z-10">
            {/* Close & Mute buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#FFE2D1] rounded-xl shadow-sm text-zinc-400 hover:text-zinc-600 active:scale-95 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#FFE2D1] rounded-xl shadow-sm text-amber-800 hover:text-amber-950 active:scale-95 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* Target Display */}
            <div className="flex-1 mx-3 bg-white/90 border-2 border-[#FFE2D1] py-1.5 px-3 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 block leading-none mb-1">
                🎧 Săn từ vựng
              </span>
              <h3
                className="text-xl text-amber-900 font-black leading-tight"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {targetWord?.word}
              </h3>
              <span className="text-xs text-amber-700/80 font-bold font-rounded">
                ({targetWord?.meaning})
              </span>
            </div>

            {/* Score Display */}
            <div className="text-right flex flex-col items-end">
              <span className="text-xs font-bold text-amber-700/70 leading-none">Score</span>
              <span
                className="text-2xl text-amber-900 font-black"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {score}
              </span>
            </div>
          </div>

          {/* Sub header: Mascot, HP & Energy */}
          <div className="flex justify-between items-end w-full px-2 mb-3 z-10">
            {/* Mascot Container with Shield protection circle */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <img
                src={isFeverMode ? "/images/mascot/mascot-success.gif" : "/images/mascot/shiba_master.gif"}
                alt="Shiba dancing"
                className={`w-full h-full object-contain ${isFeverMode ? "animate-bounce" : ""}`}
              />
              {/* Bubble Shield */}
              <AnimatePresence>
                {hasShield && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0.8 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="absolute inset-0 rounded-full border-4 border-cyan-400 bg-cyan-200/25 blur-[1px]"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* HP Hearts with Extra Life Accumulation badge */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border-2 border-[#FFE2D1] shadow-sm relative">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    size={18}
                    className={i < hp ? "text-[#FF7096] animate-pulse" : "text-zinc-300"}
                    fill={i < hp ? "currentColor" : "none"}
                  />
                ))}

                {/* Shield mini badge */}
                {hasShield && (
                  <Shield size={16} className="text-cyan-500 fill-cyan-400 ml-1" />
                )}

                {/* Extra Hearts Stockpile Badge */}
                <AnimatePresence>
                  {extraHearts > 0 && (
                    <motion.div
                      initial={{ scale: 0.5, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.5, y: -10, opacity: 0 }}
                      className="absolute -top-3 -right-3 bg-[#FF7096] text-white border-2 border-white rounded-full text-[10px] font-black w-6 h-6 flex items-center justify-center shadow-md"
                      style={{ fontFamily: "var(--font-cherry)" }}
                    >
                      +{extraHearts}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* FEVER PROGRESS BAR */}
          <div className="w-full bg-[#FFF8F0] h-2.5 rounded-full border-2 border-[#FFE2D1] overflow-hidden mb-4 z-10 relative">
            <div
              style={{ width: `${feverEnergy}%` }}
              className={`h-full transition-all duration-300 ${isFeverMode
                ? "bg-gradient-to-r from-yellow-300 to-amber-500 animate-pulse"
                : "bg-gradient-to-r from-[#06D6A0] to-[#5390D9]"
                }`}
            />
            {isFeverMode && (
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-amber-900 uppercase tracking-widest">
                🔥 FEVER ACTIVE x2! 🔥
              </span>
            )}
          </div>

          {/* PLAYFIELD (4 LANES) */}
          <div
            className={`flex-1 w-full border-4 rounded-[2.5rem] relative overflow-hidden flex shadow-inner transition-colors duration-500 ${isFeverMode
                ? "bg-[#0B0813] border-yellow-400 shadow-[0_0_20px_rgba(255,209,102,0.2)]"
                : "bg-white/70 border-[#FFE2D1]"
              }`}
          >
            {/* Spotlights (Only visible in Fever Mode) */}
            {isFeverMode && (
              <>
                <div className="spotlight-left" />
                <div className="spotlight-right" />
              </>
            )}

            {/* Blindness Overlay (Oni bomb hit) */}
            <AnimatePresence>
              {blindActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-purple-950/40 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-4xl select-none animate-ping">👹</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4 Lanes */}
            {[0, 1, 2, 3].map((laneIdx) => (
              <div
                key={laneIdx}
                onClick={() => handleTapLane(laneIdx)}
                className={`flex-1 h-full border-r-2 border-dashed last:border-r-0 relative flex flex-col justify-end items-center cursor-pointer active:bg-[#FFE2D1]/20 transition-colors ${isFeverMode ? "border-[#FFCC80]/15" : "border-[#FFE2D1]"
                  }`}
              >
                {/* Lane ID Key Helper */}
                <div
                  className={`absolute bottom-4 font-black font-rounded text-xs ${isFeverMode ? "text-yellow-400/20" : "text-amber-700/30"
                    }`}
                >
                  {["A", "S", "D", "F"][laneIdx]}
                </div>

                {/* Hit Feedback floating text */}
                <AnimatePresence>
                  {hitFeedback[laneIdx]?.rating && (
                    <motion.div
                      key={Date.now() + laneIdx}
                      initial={{ y: -60, scale: 0.6, opacity: 0 }}
                      animate={{ y: -100, scale: 1.2, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-20 font-black font-rounded text-sm pointer-events-none text-center"
                      style={{
                        fontFamily: "var(--font-cherry)",
                        color:
                          hitFeedback[laneIdx].rating === "Perfect"
                            ? "#FF9F1C"
                            : hitFeedback[laneIdx].rating === "Great"
                              ? "#06D6A0"
                              : "#E63946",
                        textShadow: isFeverMode ? "1px 1px 0px #000" : "1px 1px 0px #fff",
                      }}
                    >
                      {hitFeedback[laneIdx].rating.toUpperCase()}!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Render Notes falling in this lane */}
                {activeNotes
                  .filter((note) => note.lane === laneIdx)
                  .map((note) => (
                    <motion.div
                      key={note.id}
                      style={{ top: `${note.y}%` }}
                      className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-transform ${note.hit
                          ? "scale-155 opacity-0 duration-300"
                          : note.missed
                            ? "border-red-300 bg-red-50 text-red-400"
                            : isFeverMode
                              ? "border-yellow-400 bg-yellow-100 shadow-[0_0_15px_#f59e0b] text-yellow-600 scale-110"
                              : note.type === "meat"
                                ? "border-red-400 bg-red-100 text-red-700 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                : note.type === "shield"
                                  ? "border-cyan-400 bg-cyan-100 text-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                  : note.type === "coin"
                                    ? "border-amber-400 bg-amber-100 text-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                    : note.type === "oni"
                                      ? "border-purple-400 bg-purple-100 text-purple-700"
                                      : "border-[#FF9F1C] bg-[#FFF8F0] text-amber-900 shadow-sm"
                        }`}
                    >
                      <span className="font-rounded font-black text-base select-none">
                        {isFeverMode && note.type === "normal" ? "🌟" : note.char}
                      </span>
                    </motion.div>
                  ))}
              </div>
            ))}

            {/* Hit Line (Marshmallow style) */}
            <div
              className={`absolute bottom-[10%] left-0 right-0 h-6 border-y-2 pointer-events-none z-10 flex items-center justify-center transition-colors duration-500 ${isFeverMode
                  ? "bg-yellow-400/20 border-yellow-400 shadow-[0_0_12px_#f59e0b]"
                  : "bg-[#FF9F1C]/25 border-[#FF9F1C]"
                }`}
            >
              <span
                className={`text-[9px] font-black uppercase tracking-wider ${isFeverMode ? "text-yellow-400" : "text-[#FF9F1C]"
                  }`}
              >
                Vạch Nhịp
              </span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="w-full flex justify-between items-center mt-3 px-2 z-10">
            <span className="text-xs font-bold text-amber-700/60 font-rounded">
              Bài học: {currentWordIndex} / {totalWordsCount} từ
            </span>
            {combo >= 3 && (
              <span
                className="text-lg text-[#FF9F1C] font-black animate-bounce"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                🔥 Combo x{combo}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. MÀN HÌNH THẮNG/THUA (GAME OVER & WIN SCREEN) */}
      {(gameStatus === "gameover" || gameStatus === "win") && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10">
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`w-28 h-28 flex items-center justify-center rounded-[2rem] border-4 mb-6 shadow-md ${gameStatus === "win"
              ? "border-yellow-400 bg-yellow-50 text-yellow-500"
              : "border-red-400 bg-red-50 text-red-500"
              }`}
          >
            {gameStatus === "win" ? <Trophy size={60} /> : <X size={60} />}
          </motion.div>

          <h2
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: "var(--font-cherry)",
              color: gameStatus === "win" ? "#FF9F1C" : "#E63946",
            }}
          >
            {gameStatus === "win" ? "CHIẾN THẮNG!" : "THUA CUỘC!"}
          </h2>
          <p className="font-rounded font-bold text-zinc-500 text-sm mb-8">
            {gameStatus === "win"
              ? "Bạn đã xuất sắc chinh phục bản nhạc cùng Shiba!"
              : "Đừng buồn, hãy thử lại để cải thiện điểm số nhé!"}
          </p>

          {/* Results Summary Box */}
          <div className="w-full bg-white border-4 border-[#FFE2D1] rounded-[2rem] p-5 shadow-sm flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center font-rounded font-bold text-amber-900 text-sm">
              <span>Điểm số:</span>
              <span className="text-lg font-black text-amber-900">{score}</span>
            </div>
            <div className="flex justify-between items-center font-rounded font-bold text-amber-900 text-sm">
              <span>Combo lớn nhất:</span>
              <span className="text-lg font-black text-amber-900">x{maxCombo}</span>
            </div>
            <div className="flex justify-between items-center font-rounded font-bold text-amber-900 text-sm border-t border-[#FFE2D1] pt-3">
              <span>Xu kiếm được:</span>
              <span className="text-lg font-black text-[#FF9F1C] flex items-center gap-1">
                +{rewards.coins + earnedCoins}
                <CoinIcon />
              </span>
            </div>
          </div>

          {/* Buttons Area */}
          <div className="flex gap-4 w-full">
            <button
              onClick={initGame}
              className="flex-1 h-14 bg-[#FF9F1C] hover:bg-[#e68a00] text-white font-black text-lg rounded-[1.25rem] border-b-4 border-[#cc7a00] active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              <RefreshCw size={20} /> CHƠI LẠI
            </button>
            <button
              onClick={() => {
                if (gameStatus === "win") {
                  onWin();
                } else {
                  onClose();
                }
              }}
              className="flex-1 h-14 bg-white hover:bg-zinc-50 border-2 border-zinc-200 text-zinc-600 font-rounded font-bold text-lg rounded-[1.25rem] shadow-[0_3px_0_0_#e4e4e7] active:translate-y-1 active:shadow-[0_0_0_0_#e4e4e7] transition-all cursor-pointer"
            >
              VỀ BẢN ĐỒ
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL HƯỚNG DẪN CHƠI LẦN ĐẦU (TUTORIAL MODAL) */}
      <AnimatePresence>
        {showTutorial && (
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
              className="relative bg-white rounded-[2.5rem] border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFD6C0,0_16px_40px_rgba(255,159,28,0.2)] w-full max-w-sm p-6 pt-8 z-10"
            >
              {/* Shiba Mascot thò đầu */}
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
                Học nhạc cùng Shiba! 🎧
              </h2>

              {/* Tutorial Steps */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 bg-[#E0F7F0] border-2 border-[#A7E8D0] rounded-[1rem] px-3 py-2.5">
                  <span className="text-xl flex-shrink-0">🔊</span>
                  <p className="text-xs font-rounded font-bold text-emerald-800">
                    Lắng nghe **âm thanh phát âm** của từ vựng mục tiêu ở phía trên.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#FFE4EC] border-2 border-[#FFB3C6] rounded-[1rem] px-3 py-2.5">
                  <span className="text-xl flex-shrink-0">🐾</span>
                  <p className="text-xs font-rounded font-bold text-pink-800">
                    **Chỉ bấm** vào nốt mang chữ cái đúng của từ đó. Tránh bấm làn trống kẻo mất mạng!
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#FFF8DC] border-2 border-[#FFE082] rounded-[1rem] px-3 py-2.5">
                  <span className="text-xl flex-shrink-0">⌨️</span>
                  <p className="text-xs font-rounded font-bold text-amber-800">
                    Gõ phím **A - S - D - F** (tương ứng 4 làn chạy) hoặc chạm trực tiếp màn hình.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#FFF3E0] border-2 border-[#FFCC80] rounded-[1rem] px-3 py-2.5">
                  <span className="text-xl flex-shrink-0">🍖</span>
                  <p className="text-xs font-rounded font-bold text-orange-800">
                    Ăn nốt đặc biệt: **🍖 Hồi Tim, 🧼 Khiên, 🪙 Xu**. Tránh xa nốt bẫy **👹 Mặt Quỷ!**
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleCloseTutorial}
                className="w-full mt-5 h-14 bg-[#FF9F1C] hover:bg-[#e68a00] text-white font-black text-lg rounded-[1.25rem] border-b-4 border-[#cc7a00] active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                ĐÃ HIỂU! 💪
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
