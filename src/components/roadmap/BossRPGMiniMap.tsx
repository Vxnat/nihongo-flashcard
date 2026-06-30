"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, LogOut, Shield, Zap, Sparkles, Bone, ShoppingCart, DoorOpen, Lock, Coins } from "lucide-react";
import toast from "react-hot-toast";

// Import real minigame components
import { MatchingPairsGame } from "@/components/games/matching-pairs/MatchingPairsGame";
import { FillBlanksGame } from "@/components/games/fill-blanks/FillBlanksGame";

// Import real Boss Battle component
import { BossBattleScreen } from "@/components/flashcard/BossBattleScreen";

import { useBossRPGMiniMap } from "@/hooks/useBossRPGMiniMap";

interface BossRPGMiniMapProps {
  deckId: string;
  onClose: () => void;
}

export function BossRPGMiniMap({ deckId, onClose }: BossRPGMiniMapProps) {
  const {
    coins,
    goldenFur,
    shibaSessionHP,
    shibaSessionShield,
    shibaSessionBuffs,
    stages,
    mapConfig,
    shopOpen,
    setShopOpen,
    flippedStageId,
    setFlippedStageId,
    activeChallengeType,
    isLoadingChallenge,
    challengeCards,
    challengeQuizList,
    handleStartChallenge,
    handleChallengeWin,
    handleChallengeClose,
    handleBuyItem,
    isShopUnlocked,
    shibaCurrentNodeId,
    isNodeCompleted,
    isNodeUnlocked,
    bossBattleActive,
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
    handleBossWordSubmit,
    handleUsePhaoBoi,
    handleUseKinhLup,
    handleBossBattleLose,
    isTimerActive,
    setIsTimerActive,
    currentBossCard,
    handleStartBossBattle,
    mockMinigameDeck,
    selectedNodeId,
    setSelectedNodeId,
    shopPurchasedCounts
  } = useBossRPGMiniMap({ deckId, onClose });

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FFFDF9] via-[#FFF3E8] to-[#FFE4D5] z-[300] flex flex-col font-rounded select-none overflow-hidden text-zinc-800 relative rounded-2xl animate-fade-in h-full"
      style={{ fontFamily: "var(--font-jupa)" }}
    >

      {/* Embedded CSS animations for JRPG Card Flipping & Shimmer */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes holographicShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .holographic-card {
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(244,63,94,0.15), rgba(59,130,246,0.15), rgba(251,191,36,0.15));
          background-size: 400% 400%;
          animation: holographicShimmer 6s ease infinite;
        }
        
        @keyframes floatingAnimation {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-shiba {
          animation: floatingAnimation 2.2s ease-in-out infinite;
        }

        /* Ukiyo-e wave pattern overlay */
        .seigaiha-pattern {
          background-color: rgba(16, 185, 129, 0.02);
          background-image: radial-gradient(circle at 100% 150%, transparent 24%, rgba(16, 185, 129, 0.08) 24%, rgba(16, 185, 129, 0.08) 28%, transparent 28%, transparent),
                            radial-gradient(circle at 0% 150%, transparent 24%, rgba(16, 185, 129, 0.08) 24%, rgba(16, 185, 129, 0.08) 28%, transparent 28%, transparent),
                            radial-gradient(circle at 50% 100%, transparent 9%, rgba(16, 185, 129, 0.08) 9%, rgba(16, 185, 129, 0.08) 13%, transparent 13%, transparent);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Cosmic Nebula Pastel Clouds (Concept 4 style) */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#ffa6c9]/20 blur-[130px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#bdb2ff]/20 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#a0c4ff]/15 blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* 2D STAR SPARKLES EFFECT (Pastel Pink) */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffa6c944_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      {/* ═══════════════════════════════════════════ */}
      {/* 1. STATUS HEADER BAR (JRPG Hero Dashboard)   */}
      {/* ═══════════════════════════════════════════ */}
      <div className="w-full bg-white/40 border-b border-white/40 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between z-20 shrink-0 shadow-sm relative gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#ffa6c9]/10 border border-[#ffa6c9]/30 flex items-center justify-center text-[#FF7096] hover:text-white hover:bg-[#FF7096] hover:border-[#FF7096] transition-all cursor-pointer active:scale-90 shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="text-left">
            <h1
              className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#8C5E43] to-[#5C3E21] leading-tight filter drop-shadow-[0_1px_2px_rgba(140,94,67,0.15)] select-none uppercase tracking-wide"
            >
              {mapConfig.mapTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 2. 2D BRANCHING ROADMAP CANVAS              */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex-1 w-full relative overflow-y-auto px-4 py-8 flex justify-center items-start min-h-0 bg-transparent z-10">

        {/* Winding/Branching Map Container with paper scroll styling */}
        <div
          className="relative w-full max-w-lg h-[620px] bg-gradient-to-br from-[#FCFAF2] to-[#F7F2E8] border-4 border-[#8C5E43]/40 backdrop-blur-lg rounded-[2.5rem] shadow-[0_24px_48px_rgba(139,92,26,0.18)] p-4 overflow-hidden flex flex-col"
          style={{ backgroundImage: "radial-gradient(rgba(140, 94, 67, 0.04) 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }}
        >

          {/* Decorative Corner Stars (Concept 4 style) */}
          <div className="absolute top-3 left-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>
          <div className="absolute top-3 right-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>
          <div className="absolute bottom-3 left-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>
          <div className="absolute bottom-3 right-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>

          {/* Background Ambient Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-200/20 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-60 h-60 rounded-full bg-orange-200/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-rose-200/10 blur-[70px] pointer-events-none" />

          {/* Shiba JRPG Stats Capsule (Static block layout to avoid overlapping and whitespace issues) */}
          <div className="w-full z-20 bg-white/70 backdrop-blur-md border border-white/60 p-3 rounded-3xl shadow-sm text-[#5C3E21] flex flex-col gap-2 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              {/* Avatar frame */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD2B4] to-[#FFA6C9] border border-white/60 flex items-center justify-center relative shadow-sm shrink-0">
                <img
                  src="/images/ui/roadmap/shiba_marker.png"
                  alt="Dog"
                  className="w-10 h-10 object-contain"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                {/* Status bars container */}
                <div className="flex items-center gap-3 w-full">
                  {/* HP Bar */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0" title={`Sinh lực: ${shibaSessionHP}/100`}>
                    <Heart className={`w-3.5 h-3.5 text-rose-500 shrink-0 ${shibaSessionHP > 0 ? "animate-pulse" : ""}`} fill="currentColor" />
                    <div className="flex-1 bg-zinc-100/50 h-2 rounded-full overflow-hidden border border-zinc-200/40 p-0.5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#FF6B8B] to-[#FFA6C9] rounded-full"
                        animate={{ width: `${shibaSessionHP}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-[#FF6B8B] font-sans leading-none shrink-0">{shibaSessionHP}</span>
                  </div>

                  {/* Shield Bar */}
                  {shibaSessionShield > 0 && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0" title={`Giáp ảo: ${shibaSessionShield}`}>
                      <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" fill="currentColor" />
                      <div className="flex-1 bg-zinc-100/50 h-2 rounded-full overflow-hidden border border-zinc-200/40 p-0.5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full"
                          animate={{ width: `${Math.min(100, shibaSessionShield * 2)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-[#0284C7] font-sans leading-none shrink-0">{shibaSessionShield}</span>
                    </div>
                  )}
                </div>

                {/* Buffs and Currency row */}
                <div className="flex items-center justify-between mt-0.5 w-full">
                  {/* Buff indicators */}
                  <div className="flex gap-1">
                    {shibaSessionBuffs.length > 0 ? (
                      <span className="flex items-center gap-0.5 bg-[#FEF08A]/40 text-[#854D0E] border border-[#FEF08A]/80 px-1 py-0.2 rounded-sm text-[8px] font-bold animate-pulse leading-none">
                        <Zap className="w-2 h-2" />
                        <span>ATK x1.2</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Coins bone badge (Lucide Bone) */}
                  <div className="flex items-center gap-1.5 text-[#8C5E43] font-black text-[10px] bg-[#FAF0D7]/80 px-2.5 py-1 rounded-full border border-amber-200/40 leading-none shadow-sm animate-pulse-slow">
                    <span>{coins}</span>
                    <Bone className="w-3 h-3 rotate-45 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable map content - 3D Card Flipping Grid */}
          <div className="flex-1 w-full relative overflow-y-auto hide-scrollbar flex items-center justify-center py-4">
            <div className="grid grid-cols-3 gap-3 w-full px-1.5 max-w-md mx-auto">
              {stages.map((stage: any, index: number) => {
                const completed = isNodeCompleted(stage.id);
                const unlocked = isNodeUnlocked(stage.id);
                const isActive = stage.id === shibaCurrentNodeId;
                const isFlipped = flippedStageId === stage.id;

                const handleCardClick = () => {
                  if (!unlocked) {
                    toast.error("Ải này hiện đang bị khóa!");
                    return;
                  }
                  setFlippedStageId(isFlipped ? null : stage.id);
                };

                return (
                  <div
                    key={stage.id}
                    onClick={handleCardClick}
                    className="perspective-1000 w-full h-[260px] cursor-pointer select-none relative"
                  >
                    {/* Shiba marker indicator hovering above the active card */}
                    {isActive && (
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] flex flex-col items-center animate-float-shiba">
                        <img
                          src="/images/ui/roadmap/shiba_marker.png"
                          alt="Shiba"
                          className="w-10 h-10 object-contain animate-wiggle"
                        />
                        <div className="bg-[#FFD2B4] text-[#8C5E43] border border-[#FFA6C9] font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90 shadow-sm leading-none mt-0.5 whitespace-nowrap">
                          Shiba
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""
                        }`}
                    >
                      {/* CARD FRONT */}
                      <div
                        className={`absolute inset-0 backface-hidden rounded-3xl border-2 flex flex-col items-center justify-between p-3.5 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg
                          ${completed
                            ? "seigaiha-pattern bg-gradient-to-b from-[#E6F4EA] to-[#CEEAD6] border-[#81C784]/60 text-[#137333] shadow-[0_4px_12px_rgba(76,175,80,0.12)]"
                            : isActive
                              ? "holographic-card border-[#F59E0B]/70 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-950 font-black"
                              : "bg-gradient-to-b from-[#1F1F1F]/20 to-[#121212]/30 border-zinc-700/40 opacity-70 text-zinc-500"
                          }
                        `}
                      >
                        {/* Authentic Japanese Completion Stamp */}
                        {completed && (
                          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full border-2 border-red-500/40 flex items-center justify-center -rotate-12 select-none pointer-events-none">
                            <span className="text-[9px] font-black text-red-500/50 tracking-widest leading-none">済</span>
                          </div>
                        )}

                        {/* Top: badge */}
                        <span className="text-[8px] font-black tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full">
                          Ải {index + 1}
                        </span>

                        {/* Middle: Icon / Image */}
                        <div className="flex flex-col items-center justify-center flex-1 py-3">
                          {completed ? (
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-500 shadow-sm">
                              <Sparkles className="w-6 h-6 animate-pulse" />
                            </div>
                          ) : unlocked ? (
                            <div className="relative group">
                              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <img
                                src={stage.img}
                                alt={stage.title}
                                className="w-14 h-14 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] relative z-10"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-zinc-900/30 border border-zinc-700/50 flex items-center justify-center text-zinc-600 shadow-inner">
                              <Lock className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Bottom: Title & Label */}
                        <div className="text-center w-full">
                          <h4 className="text-[10px] font-black tracking-wide truncate max-w-full uppercase mb-1" style={{ fontFamily: "var(--font-cherry)" }}>
                            {stage.title}
                          </h4>
                          <span className={`text-[7px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${completed ? "bg-emerald-500/20 text-[#137333]" : isActive ? "bg-[#F59E0B]/20 text-[#B45309]" : "bg-zinc-800 text-zinc-500"
                            }`}>
                            {completed ? "Đã Qua" : isActive ? "Lật bài" : "Bị Khóa"}
                          </span>
                        </div>
                      </div>

                      {/* CARD BACK */}
                      <div
                        className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 flex flex-col justify-between p-3.5 shadow-md bg-gradient-to-br from-[#FCFAF2] to-[#F7F2E8] border-amber-600/30 text-[#8C5E43]"
                        style={{ backgroundImage: "radial-gradient(rgba(140, 94, 67, 0.03) 1px, transparent 1px)", backgroundSize: "12px 12px" }}
                      >
                        {/* Back Top: Title & Badge */}
                        <div className="flex items-center justify-between border-b border-dashed border-amber-200/40 pb-1.5">
                          <span className="text-[9px] font-black uppercase truncate pr-1" style={{ fontFamily: "var(--font-cherry)" }}>
                            {stage.title}
                          </span>
                          <span className="text-[7px] font-bold px-1.5 py-0.2 bg-[#FEF08A] text-[#854D0E] rounded-sm tracking-wide uppercase leading-none shrink-0">
                            {stage.type === "boss" ? "Boss" : "Vệ Binh"}
                          </span>
                        </div>

                        {/* Back Middle: Description */}
                        <p className="text-[8.5px] leading-relaxed font-rounded font-bold text-zinc-500 text-left my-2 flex-1 overflow-y-auto pr-0.5 select-text">
                          {stage.description}
                        </p>

                        {/* Back Bottom: Challenge Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (shibaSessionHP <= 0) {
                              toast.error("Shiba đã kiệt sức! Hãy ghé mua máu trước.");
                              return;
                            }
                            setSelectedNodeId(stage.id);
                            if (stage.type === "boss") {
                              handleStartBossBattle(stage);
                            } else {
                              handleStartChallenge(stage);
                            }
                          }}
                          disabled={isLoadingChallenge}
                          className="w-full py-2 bg-gradient-to-r from-[#FF7096] to-rose-400 hover:brightness-110 text-white font-black rounded-xl text-[9px] tracking-wide cursor-pointer transition-all active:translate-y-[2px] shadow-sm uppercase flex items-center justify-center gap-1 disabled:opacity-50 border-b-2 border-rose-600"
                        >
                          Bắt Đầu
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Corner Shop Button (Phase 5) */}
          {isShopUnlocked && (
            <>
              {/* Shiba speech bubble */}
              <div className="absolute bottom-[88px] right-4 bg-[#FCFAF2] text-[#8C5E43] border-2 border-[#8C5E43]/30 px-2.5 py-1 rounded-2xl rounded-br-none shadow-md text-[8.5px] font-black tracking-wide z-30 select-none animate-pulse leading-normal">
                Thảo dược đây nà!
              </div>

              {/* Cute Shiba shopkeeper button */}
              <button
                onClick={() => setShopOpen(true)}
                className="absolute bottom-6 right-6 w-15 h-15 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 text-white rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 cursor-pointer z-30 border-4 border-white animate-float-shiba group"
                title="Cửa hàng vật phẩm"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src="/images/ui/roadmap/shiba_marker.png"
                    alt="Shopkeeper"
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-all duration-300"
                  />
                  {/* Shop banner tag */}
                  <div className="absolute -top-1.5 bg-red-500 text-white font-black text-[6px] px-1 py-0.2 rounded-sm border border-white leading-none scale-90 uppercase tracking-wide">
                    SHOP
                  </div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>



      {/* ═══════════════════════════════════════════ */}
      {/* 4. MULTI-ITEM SHOP MODAL (Trạm dừng)        */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {shopOpen && mapConfig.shopConfig && (
          <div className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-gradient-to-br from-[#FAF5EF] to-[#FDFBF9] rounded-[2.5rem] border-4 border-[#FFA6C9]/40 shadow-2xl p-6 sm:p-8 text-zinc-700"
            >
              {/* Shop Header */}
              <div className="text-center pb-5 border-b-2 border-dashed border-[#FFA6C9]/20">
                <div className="w-16 h-16 bg-amber-500/10 border border-[#FFA6C9]/30 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                  <ShoppingCart className="w-9 h-9 text-amber-600 animate-bounce-slow" />
                </div>
                <h3 className="text-xl font-black text-amber-600" style={{ fontFamily: "var(--font-cherry)" }}>
                  Cửa Hàng Thảo Dược
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 font-rounded font-bold leading-snug">
                  Chào mừng nhà lữ hành! Mua sắm vật phẩm hỗ trợ đắc lực trước trận chiến Boss.
                </p>
              </div>

              {/* Shop Items List */}
              <div className="py-5 flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {(mapConfig.shopConfig.items || []).map((item: any) => {
                  const purchasedCount = shopPurchasedCounts[item.id] || 0;
                  const limitRemaining = item.limit - purchasedCount;
                  const isLimitReached = purchasedCount >= item.limit;
                  const alreadyHasBuff = item.effect.type === "buff_atk" && shibaSessionBuffs.includes(item.id);
                  const isHPMax = item.effect.type === "heal" && shibaSessionHP >= 100;

                  const canBuyWithBones = coins >= item.costBones && !isLimitReached && !alreadyHasBuff && !isHPMax;
                  const canBuyWithGold = goldenFur >= item.costGoldenFur && !isLimitReached && !alreadyHasBuff && !isHPMax;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-white/60 rounded-2xl border border-zinc-100 hover:border-amber-300 transition-all shadow-sm animate-fade-in"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 text-left min-w-0 flex-1 pr-2">
                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-zinc-100 overflow-hidden shrink-0 shadow-sm">
                          <img src={item.img} alt={item.name} className="w-8 h-8 object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wide truncate" style={{ fontFamily: "var(--font-cherry)" }}>
                              {item.name}
                            </h4>
                            <span className="text-[8px] font-black text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                              Còn: {limitRemaining}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-rounded font-bold leading-normal truncate mt-0.5">{item.description}</p>
                        </div>
                      </div>

                      {/* Right: Buy Buttons (Dual Price) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Bones Buy Button */}
                        <button
                          onClick={() => handleBuyItem(item, "bones")}
                          disabled={!canBuyWithBones}
                          className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8C5E43] border border-amber-200/50 rounded-xl font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                          title="Mua bằng Xương"
                        >
                          {alreadyHasBuff ? (
                            "Đã Có"
                          ) : isHPMax ? (
                            "Đầy Máu"
                          ) : isLimitReached ? (
                            "Hết Hàng"
                          ) : (
                            <>
                              <span>{item.costBones}</span>
                              <Bone className="w-3 h-3 rotate-45 text-amber-600 animate-pulse-slow" />
                            </>
                          )}
                        </button>

                        {/* Gold Coins Buy Button */}
                        <button
                          onClick={() => handleBuyItem(item, "gold")}
                          disabled={!canBuyWithGold}
                          className="px-2.5 py-2 bg-yellow-50 hover:bg-yellow-100 text-[#B45309] border border-yellow-200/50 rounded-xl font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                          title="Mua bằng Xu Vàng"
                        >
                          {alreadyHasBuff ? (
                            "Đã Có"
                          ) : isHPMax ? (
                            "Đầy Máu"
                          ) : isLimitReached ? (
                            "Hết Hàng"
                          ) : (
                            <>
                              <span>{item.costGoldenFur}</span>
                              <Coins className="w-3.5 h-3.5 text-amber-500 animate-pulse-slow" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shop Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-dashed border-[#FFA6C9]/20">
                <div className="flex-1 flex items-center justify-around bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-2.5 text-[10px] font-black text-zinc-500 gap-2">
                  <span className="flex items-center gap-1">
                    Xương: <span className="text-[#8C5E43] font-black text-xs flex items-center gap-0.5">{coins} <Bone className="w-3 h-3 rotate-45" /></span>
                  </span>
                  <span className="h-4 w-px bg-zinc-200" />
                  <span className="flex items-center gap-1">
                    Xu Vàng: <span className="text-yellow-600 font-black text-xs flex items-center gap-0.5">{goldenFur || 0} <Coins className="w-3.5 h-3.5" /></span>
                  </span>
                </div>
                <button
                  onClick={() => setShopOpen(false)}
                  className="w-full sm:w-32 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-xs flex items-center justify-center gap-1"
                >
                  <DoorOpen className="w-4 h-4" />
                  Đóng Shop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════════ */}
      {/* 5. MINIGAME OVERLAYS (Phase 4)              */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {activeChallengeType === "matching" && mockMinigameDeck && (
          <div className="fixed inset-0 z-[400] bg-black">
            <MatchingPairsGame
              cards={challengeCards}
              minigameDeck={mockMinigameDeck as any}
              onClose={handleChallengeClose}
              onWin={handleChallengeWin}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChallengeType === "fill" && mockMinigameDeck && (
          <div className="fixed inset-0 z-[400] bg-black flex items-center justify-center">
            <FillBlanksGame
              quizList={challengeQuizList}
              minigameDeck={mockMinigameDeck}
              onClose={handleChallengeClose}
              onWin={handleChallengeWin}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* 6. TURN-BASED BOSS BATTLE ARENA OVERLAY (Phase 5) */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {bossBattleActive && (
          <div className="fixed inset-0 z-[450] bg-black overflow-y-auto">
            <BossBattleScreen
              deckId={deckId}
              currentBossCard={currentBossCard}
              bossHp={bossHp}
              bossMaxHp={bossMaxHp}
              shibaHp={shibaHp}
              bossTimeLeft={bossTimeLeft}
              bossCardMaxTime={bossCardMaxTime}
              comboCount={comboCount}
              activeSkillEffect={activeSkillEffect}
              activeDamageText={activeDamageText}
              screenShake={screenShake}
              bossFlash={bossFlash}
              projectileFlying={projectileFlying}
              isHintRevealed={isHintRevealed}
              onSubmit={handleBossWordSubmit}
              usePhaoBoi={handleUsePhaoBoi}
              useKinhLup={handleUseKinhLup}
              onCancel={handleBossBattleLose}
              isTimerActive={isTimerActive}
              onStartBattle={() => setIsTimerActive(true)}
            />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
