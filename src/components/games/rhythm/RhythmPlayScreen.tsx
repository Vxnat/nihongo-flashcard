"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Ham, Shield, Volume2, VolumeX, X, Bone } from "lucide-react";

interface RhythmPlayScreenProps {
  onClose: () => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  targetWord: any;
  score: number;
  isFeverMode: boolean;
  hasShield: boolean;
  hp: number;
  extraHearts: number;
  feverEnergy: number;
  blindActive: boolean;
  activeLanes: boolean[];
  setActiveLanes: React.Dispatch<React.SetStateAction<boolean[]>>;
  handleTapLane: (laneIdx: number) => void;
  hitFeedback: any[];
  activeNotes: any[];
  currentWordIndex: number;
  totalWordsCount: number;
  combo: number;
}

export function RhythmPlayScreen({
  onClose,
  isMuted,
  setIsMuted,
  targetWord,
  score,
  isFeverMode,
  hasShield,
  hp,
  extraHearts,
  feverEnergy,
  blindActive,
  activeLanes,
  setActiveLanes,
  handleTapLane,
  hitFeedback,
  activeNotes,
  currentWordIndex,
  totalWordsCount,
  combo
}: RhythmPlayScreenProps) {
  return (
    <div className="flex-1 flex flex-col relative w-full h-full">
      {/* Header Stats */}
      <div className="flex justify-between items-center w-full mb-3 z-10">
        {/* Close & Mute buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm border border-[#FFE2D1]/40 rounded-xl shadow-sm text-zinc-400 hover:text-zinc-600 active:scale-95 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm border border-[#FFE2D1]/40 rounded-xl shadow-sm text-amber-800 hover:text-amber-950 active:scale-95 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Target Display */}
        <div className="flex-1 mx-3 bg-white/85 backdrop-blur-md border border-[#FFE2D1]/60 py-1.5 px-3 rounded-2xl shadow-sm text-center min-h-[58px] flex flex-col justify-center">
          {isFeverMode ? (
            <div className="animate-pulse">
              <span className="text-[10px] uppercase font-black text-amber-500 block leading-none mb-0.5 tracking-wider">
                Fever Time
              </span>
              <h3
                className="text-xs text-amber-700 font-black leading-tight font-rounded"
              >
                Gõ mọi nốt x2 điểm!
              </h3>
            </div>
          ) : (
            <>
              <span className="text-[10px] uppercase font-bold text-amber-600 block leading-none mb-1">
                Săn từ vựng
              </span>
              <h3
                className="text-xl text-amber-900 font-black leading-tight"
                style={{ fontFamily: "var(--font-cute)" }}
              >
                {targetWord?.word}
              </h3>
            </>
          )}
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
          <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-[#FFE2D1]/40 shadow-sm relative">
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
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-900 uppercase tracking-widest bg-amber-400/20 backdrop-blur-[1px]">
            x2!
          </span>
        )}
      </div>

      {/* PLAYFIELD (4 LANES) */}
      <div
        className={`flex-1 w-full border-4 rounded-[2.5rem] relative overflow-hidden flex shadow-inner transition-colors duration-500 ${isFeverMode
          ? "bg-gradient-to-b from-[#FFF0F3] via-[#FFF5F5] to-[#FFF9E6] border-[#FFE2D1] shadow-inner"
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
              <span className="text-2xl font-black text-purple-200 select-none animate-ping font-rounded">TRAP</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Lanes */}
        {[0, 1, 2, 3].map((laneIdx) => {
          const isActive = activeLanes[laneIdx];
          return (
            <div
              key={laneIdx}
              onClick={() => {
                handleTapLane(laneIdx);
                setActiveLanes((prev) => {
                  const next = [...prev];
                  next[laneIdx] = true;
                  return next;
                });
                setTimeout(() => {
                  setActiveLanes((prev) => {
                    const next = [...prev];
                    next[laneIdx] = false;
                    return next;
                  });
                }, 150);
              }}
              className="flex-1 h-full border-r-2 border-dashed last:border-r-0 relative flex flex-col justify-end items-center cursor-pointer transition-colors border-[#FFE2D1]"
            >
              {/* Light flash effect */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t pointer-events-none z-0 from-[#FF9F1C] via-transparent to-transparent"
                  />
                )}
              </AnimatePresence>

              {/* Lane ID Key Helper */}
              <div
                className={`absolute bottom-4 font-black font-rounded text-xs relative z-10 ${isFeverMode ? "text-[#FF9F1C]/30" : "text-amber-700/30"
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
                      textShadow: "1px 1px 0px #fff",
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
                    className={`absolute w-12 h-12 rounded-full border flex items-center justify-center z-10 transition-transform ${note.hit
                      ? "scale-155 opacity-0 duration-300"
                      : note.missed
                        ? "border-red-300 bg-red-50 text-red-400"
                        : isFeverMode
                          ? "border-[#FF9F1C] bg-white/95 text-amber-800 shadow-[0_4px_12px_rgba(255,159,28,0.15)] scale-110"
                          : note.type === "meat"
                            ? "border-[#FF7096] bg-[#FF7096]/15 text-[#FF7096] shadow-[0_0_8px_rgba(255,112,150,0.3)]"
                            : note.type === "shield"
                              ? "border-[#06D6A0] bg-[#06D6A0]/15 text-[#05B889] shadow-[0_0_8px_rgba(6,214,160,0.3)]"
                              : note.type === "coin"
                                ? "border-[#FFD166] bg-[#FFD166]/15 text-[#FF9F1C] shadow-[0_0_8px_rgba(255,209,102,0.3)]"
                                : note.type === "oni"
                                  ? "border-[#FF9F1C] bg-white/90 backdrop-blur-sm text-amber-900 shadow-sm"
                                  : "border-[#FF9F1C] bg-white/90 backdrop-blur-sm text-amber-900 shadow-sm"
                      }`}
                  >
                    <span className="font-rounded font-black text-base select-none flex items-center justify-center">
                      {note.char}
                    </span>
                  </motion.div>
                ))}
            </div>
          );
        })}

        {/* Hit Line (Marshmallow style) */}
        <div
          className="absolute bottom-[10%] left-0 right-0 h-6 border-y pointer-events-none z-10 flex items-center justify-center transition-colors duration-500 bg-[#FF9F1C]/15 border-[#FF9F1C]/35 backdrop-blur-sm shadow-[0_0_15px_rgba(255,159,28,0.2)]"
        >
          <span
            className="text-[9px] font-black uppercase tracking-wider text-[#FF9F1C]"
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
            Combo x{combo}
          </span>
        )}
      </div>
    </div>
  );
}
