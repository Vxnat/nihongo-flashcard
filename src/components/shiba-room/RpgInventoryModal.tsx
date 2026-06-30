"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Volume2, Info, Swords, Sofa, Smile, Palette, Star, Bone, Shield } from "lucide-react";
import { MemeItem, RARITY_CONFIG, GachaRarity } from "@/constants/gachaPool";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import toast from "react-hot-toast";
import { ShibaAvatar } from "./ShibaAvatar";

interface RpgInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: any;
  shibaMascot: { gif: string; style: React.CSSProperties };
  totalBonesPerHour: number;
  baseStats: { hp: number; atk: number; def: number; crit: number };
  statsBonus: { hp: number; atk: number; def: number; crit: number };
  totalHp: number;
  totalAtk: number;
  totalDef: number;
  totalCrit: number;
  activeTab: "trangbi" | "decor" | "meme" | "voice" | "theme";
  setActiveTab: (tab: "trangbi" | "decor" | "meme" | "voice" | "theme") => void;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  showStatsBreakdown: boolean;
  setShowStatsBreakdown: (show: boolean) => void;
  modalSubTab: "character" | "inventory";
  setModalSubTab: (tab: "character" | "inventory") => void;
  filteredGridItems: any[];
  isItemUnlocked: (item: any) => boolean;
  isItemEquipped: (item: any) => boolean;
  handlePlayVoice: (audioUrl: string) => void;
  handleSpeak: (word: string) => void;
  equipFurniture: (slot: string, itemId: string | null) => void;
  equipTheme: (itemId: string | null) => void;
  equipItem: (slot: string, itemId: string | null) => void;
}

export function RpgInventoryModal({
  isOpen,
  onClose,
  userStats,
  totalBonesPerHour,
  baseStats,
  statsBonus,
  totalHp,
  totalAtk,
  totalDef,
  totalCrit,
  activeTab,
  setActiveTab,
  selectedItem,
  setSelectedItem,
  showStatsBreakdown,
  setShowStatsBreakdown,
  modalSubTab,
  setModalSubTab,
  filteredGridItems,
  isItemUnlocked,
  isItemEquipped,
  handlePlayVoice,
  handleSpeak,
  equipFurniture,
  equipTheme,
  equipItem,
}: RpgInventoryModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { allItems } = useSystemItems();

  const renderRpgSlot = (slotKey: "head" | "armor" | "earring" | "gloves" | "mount" | "aura" | "costume") => {
    const slotInfo = {
      head: { label: "Mũ", placeholder: "/images/placeholders/head_placeholder.png", border: "border-[#A9DEF9]", bg: "bg-[#E4F2F7]", shape: "rounded-[1.2rem_1.2rem_0.8rem_0.8rem]" },
      armor: { label: "Giáp", placeholder: "/images/placeholders/armor_placeholder.png", border: "border-[#D6C7FF]", bg: "bg-[#F1EBFF]", shape: "rounded-[0.8rem_0.8rem_1.2rem_1.2rem]" },
      earring: { label: "Tai", placeholder: "/images/placeholders/earring_placeholder.png", border: "border-[#FFE082]", bg: "bg-[#FFF8E1]", shape: "rounded-[1.2rem_0.8rem_1.2rem_0.8rem]" },
      gloves: { label: "Tay", placeholder: "/images/placeholders/gloves_placeholder.png", border: "border-[#FFCAD4]", bg: "bg-[#FFE5EC]", shape: "rounded-[0.8rem_1.2rem_0.8rem_1.2rem]" },
      mount: { label: "Thú", placeholder: "/images/placeholders/mount_placeholder.png", border: "border-[#C1E7E3]", bg: "bg-[#E8F8F5]", shape: "rounded-[1rem_1.5rem_1rem_1.5rem]" },
      aura: { label: "Aura", placeholder: "/images/placeholders/aura_placeholder.png", border: "border-[#FFE5D9]", bg: "bg-[#FFF2E6]", shape: "rounded-full" },
      costume: { label: "C.Trang", placeholder: "/images/placeholders/armor_placeholder.png", border: "border-[#F8BBD0]", bg: "bg-[#FCE4EC]", shape: "rounded-[1.1rem_1.1rem_1.1rem_1.1rem]" },
    }[slotKey];

    const itemId = userStats.equippedSlots?.[slotKey];
    const item = itemId ? allItems.find((i) => i.id === itemId) : null;
    const color = item ? RARITY_CONFIG[item.rarity as GachaRarity]?.color : undefined;

    return (
      <div
        onClick={() => {
          if (item) {
            setSelectedItem(item);
          }
        }}
        className="flex flex-col items-center gap-0.5 cursor-pointer group"
      >
        <span className="text-[8px] font-black text-pink-400 uppercase tracking-wider group-hover:text-pink-600 transition-colors">
          {slotInfo.label}
        </span>
        <div
          className={`w-11 h-11 flex items-center justify-center relative bg-white border-2 shadow-xs transition-all duration-300 group-hover:scale-105 active:scale-95 ${slotInfo.shape} ${item ? "" : `border-dashed ${slotInfo.border} ${slotInfo.bg}`
            }`}
          style={{
            borderColor: item ? color : undefined,
            boxShadow: item ? `0 0 10px ${RARITY_CONFIG[item.rarity as GachaRarity]?.glowColor}` : "",
          }}
        >
          {item ? (
            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain" />
          ) : (
            <img
              src={slotInfo.placeholder}
              alt={slotInfo.label}
              className="w-7 h-7 object-contain opacity-35 select-none grayscale contrast-75 brightness-110"
            />
          )}
          {item && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
              <Check size={8} className="text-white" strokeWidth={5} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          {/* Backdrop click closes modal */}
          <div
            className="absolute inset-0"
            onClick={() => {
              onClose();
              setSelectedItem(null);
              setShowStatsBreakdown(false);
            }}
          />

          {/* Cloud Frame Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-[640px] h-[90vh] max-h-[520px] bg-[#FFFDF6] border-[6px] border-[#FFD2CC] rounded-[3.5rem] shadow-2xl relative z-10 flex flex-col p-5 select-none overflow-visible"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {/* Cute Peeking Shiba */}
            <motion.div
              className="absolute -top-10 -left-4 z-21 pointer-events-none"
              animate={{
                y: [0, -5, 0],
                rotate: [-3, 3, -3],
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

            {/* Header Title with Close X */}
            <div className="flex items-center justify-between mb-3 border-b border-[#FFD2CC]/60 pb-2 relative z-10">
              <h3 className="text-sm md:text-base text-pink-500 tracking-wider font-black flex items-center gap-1.5">
                <Swords size={16} strokeWidth={2.5} /> THÔNG TIN & HÒM ĐỒ SHIBA
              </h3>
              <button
                onClick={() => {
                  onClose();
                  setSelectedItem(null);
                  setShowStatsBreakdown(false);
                }}
                className="w-8 h-8 flex items-center justify-center bg-[#FFD2CC] hover:bg-[#FFB3C1] text-white rounded-full transition-colors border-2 border-white shadow-sm cursor-pointer relative z-30"
              >
                <X size={16} strokeWidth={3.5} />
              </button>
            </div>

            {/* Mobile Sub-tabs Selector */}
            <div className="flex md:hidden bg-[#FFD2CC]/20 p-1 rounded-2xl gap-1 mb-3 border border-[#FFD2CC]/40 relative z-10">
              <button
                onClick={() => setModalSubTab("character")}
                className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${modalSubTab === "character"
                  ? "bg-[#FF85A1] text-white shadow-sm"
                  : "text-pink-400 hover:text-pink-600"
                  }`}
              >
                NHÂN VẬT
              </button>
              <button
                onClick={() => setModalSubTab("inventory")}
                className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${modalSubTab === "inventory"
                  ? "bg-[#FF85A1] text-white shadow-sm"
                  : "text-pink-400 hover:text-pink-600"
                  }`}
              >
                HÒM ĐỒ
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0 relative z-10">
              {/* Column 1: Character & Slots (Left) */}
              <div
                className={`flex-1 flex flex-col items-center justify-between bg-[#FFFDF9] border-2 border-[#FFD2CC] rounded-3xl p-3.5 relative overflow-hidden min-h-0 ${modalSubTab === "character" ? "flex" : "hidden md:flex"
                  }`}
              >
                {/* Stats Detail Overlay */}
                <AnimatePresence>
                  {showStatsBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 bg-[#FFFDF6] border-4 border-dashed border-[#FFD2CC] rounded-2xl z-30 flex flex-col p-4 select-none"
                    >
                      <div className="flex items-center justify-between border-b border-[#FFD2CC]/60 pb-2 mb-3">
                        <span className="text-xs font-black text-pink-500 tracking-wider flex items-center gap-1">
                          <Info size={12} /> CHỈ SỐ CHI TIẾT
                        </span>
                        <button
                          onClick={() => setShowStatsBreakdown(false)}
                          className="w-6 h-6 flex items-center justify-center bg-[#FFD2CC] hover:bg-[#FFB3C1] text-white rounded-full transition-colors border border-white shadow-sm cursor-pointer"
                        >
                          <X size={12} strokeWidth={3.5} />
                        </button>
                      </div>

                      <div className="flex-grow flex flex-col gap-2 justify-center text-[11px] font-bold text-zinc-600">
                        <div className="flex justify-between items-center bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                          <span>Máu (HP)</span>
                          <span className="text-emerald-600 font-black">
                            {baseStats.hp}{" "}
                            <span className="text-zinc-400 font-normal">
                              ({statsBonus.hp >= 0 ? `+${statsBonus.hp}` : statsBonus.hp})
                            </span>{" "}
                            = <span className="font-extrabold">{totalHp}</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                          <span>Tấn công (ATK)</span>
                          <span className="text-amber-600 font-black">
                            {baseStats.atk}{" "}
                            <span className="text-zinc-400 font-normal">
                              ({statsBonus.atk >= 0 ? `+${statsBonus.atk}` : statsBonus.atk})
                            </span>{" "}
                            = <span className="font-extrabold">{totalAtk}</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                          <span>Phòng thủ (DEF)</span>
                          <span className="text-blue-600 font-black">
                            {baseStats.def}{" "}
                            <span className="text-zinc-400 font-normal">
                              ({statsBonus.def >= 0 ? `+${statsBonus.def}` : statsBonus.def})
                            </span>{" "}
                            = <span className="font-extrabold">{totalDef}</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                          <span>Chí mạng (CRIT)</span>
                          <span className="text-purple-600 font-black">
                            {baseStats.crit}%{" "}
                            <span className="text-zinc-400 font-normal">
                              (+{statsBonus.crit}%)
                            </span>{" "}
                            = <span className="font-extrabold">{totalCrit}%</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                          <span>Sản sinh Xương</span>
                          <span className="text-emerald-600 font-black flex items-center gap-0.5">
                            +{totalBonesPerHour} <Bone size={11} className="rotate-45" />/h
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Character Title Sticker */}
                <div className="text-center">
                  <span className="text-[10px] bg-pink-400 text-white px-3 py-1 rounded-full font-black tracking-wider shadow-sm">
                    LV.{userStats.level || 1} THẦN KHUYỂN
                  </span>
                </div>

                {/* Symmetrical Character Equipment Layout */}
                <div className="flex items-center justify-between w-full max-w-[280px] h-[190px] px-1 relative my-2">
                  {/* Left Column of Slots */}
                  <div className="flex flex-col justify-between h-full py-1">
                    {renderRpgSlot("head")}
                    {renderRpgSlot("earring")}
                    {renderRpgSlot("mount")}
                  </div>

                  {/* Center Shiba Mascot Avatar */}
                  <div className="flex flex-col items-center gap-1 justify-center shrink-0">
                    <div className="relative w-24 h-24 flex items-center justify-center bg-pink-50/40 rounded-full border-4 border-[#FFD2CC] shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#fff_20%,transparent_60%)] opacity-80" />
                      <ShibaAvatar
                        equippedSlots={userStats.equippedSlots}
                        sizeClassName="w-20 h-20"
                        animate={true}
                      />
                    </div>
                    {renderRpgSlot("costume")}
                  </div>

                  {/* Right Column of Slots */}
                  <div className="flex flex-col justify-between h-full py-1">
                    {renderRpgSlot("armor")}
                    {renderRpgSlot("gloves")}
                    {renderRpgSlot("aura")}
                  </div>
                </div>

                {/* HP Bar and Combat Stats Summary */}
                <div className="w-full flex flex-col gap-1.5 px-1 mt-auto">
                  {/* Health Bar */}
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] font-black text-pink-400 px-1">
                      <span>HP (Sinh lực)</span>
                      <span>
                        {totalHp}/{totalHp}
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-pink-100/50 rounded-full overflow-hidden border-2 border-[#FFD2CC] p-0.5 relative shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-[#FF85A1] rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Stats values row sticker style */}
                  <div className="flex items-center justify-between text-[11px] font-black text-pink-500 bg-white border-2 border-[#FFD2CC] px-3 py-1.5 rounded-2xl shadow-xs">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><Swords size={13} className="text-pink-500" /> <span className="text-zinc-600">{totalAtk}</span></span>
                      <span className="flex items-center gap-1"><Shield size={13} className="text-pink-500" fill="currentColor" fillOpacity={0.2} /> <span className="text-zinc-600">{totalDef}</span></span>
                      <span className="flex items-center gap-1"><Star size={13} className="text-pink-500" fill="currentColor" /> <span className="text-zinc-600">{totalCrit}%</span></span>
                    </div>
                    <button
                      onClick={() => setShowStatsBreakdown(true)}
                      className="w-5 h-5 rounded-full bg-pink-50 border border-[#FFD2CC] text-pink-500 hover:bg-pink-100 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Info size={11} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: Inventory & Details (Right) */}
              <div
                className={`flex-1 flex flex-col overflow-hidden min-h-0 ${modalSubTab === "inventory" ? "flex" : "hidden md:flex"
                  }`}
              >
                {/* Custom Tab Bar */}
                <div className="grid grid-cols-5 bg-[#FFD2CC]/25 p-1 rounded-2xl gap-1 mb-2 border border-[#FFD2CC]/55">
                  {(["trangbi", "decor", "meme", "voice", "theme"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSelectedItem(null);
                      }}
                      className={`py-2 flex items-center justify-center rounded-xl transition-all cursor-pointer ${activeTab === tab
                        ? "bg-[#FF85A1] text-white shadow-sm scale-102 border-b-2 border-[#FF5C8A]"
                        : "text-pink-400 hover:text-pink-500 bg-white/60 hover:bg-white/80"
                        }`}
                      title={
                        tab === "trangbi"
                          ? "Trang bị"
                          : tab === "decor"
                            ? "Đồ trang trí"
                            : tab === "meme"
                              ? "Thẻ Meme"
                              : tab === "voice"
                                ? "Giọng nói"
                                : "Chủ đề"
                      }
                    >
                      {tab === "trangbi" && <Swords size={15} />}
                      {tab === "decor" && <Sofa size={15} />}
                      {tab === "meme" && <Smile size={15} />}
                      {tab === "voice" && <Volume2 size={15} />}
                      {tab === "theme" && <Palette size={15} />}
                    </button>
                  ))}
                </div>

                {/* Inventory Grid (scrollable) */}
                <style>{`
                  @keyframes inventoryBorderChase {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                  }
                  @keyframes inventoryHoloSweep {
                    0%, 100% { background-position: -200% 0; }
                    50% { background-position: 200% 0; }
                  }
                `}</style>
                <div className="grid grid-cols-3 gap-2.5 p-2 bg-[#FFF0F2] rounded-3xl border-2 border-[#FFD2CC] flex-1 overflow-y-auto min-h-0 content-start shadow-inner">
                  {filteredGridItems.map((item) => {
                    const isUnlockedItem = isItemUnlocked(item);
                    const isEquippedItem = isItemEquipped(item);
                    const shardsCount = userStats.shards?.[item.id] || 0;
                    const rarityColor = RARITY_CONFIG[item.rarity as GachaRarity].color;
                    const rarityIdx = [
                      "common",
                      "rare",
                      "epic",
                      "legendary",
                      "mythic",
                      "divine",
                    ].indexOf(item.rarity);
                    const hasChase = isUnlockedItem && rarityIdx >= 2; // Epic+
                    const chaseSpeed =
                      rarityIdx >= 5 ? 1.8 : rarityIdx >= 4 ? 2.2 : rarityIdx >= 3 ? 2.8 : 3.5;
                    const holoSpeed =
                      rarityIdx >= 5 ? 2 : rarityIdx >= 4 ? 2.5 : rarityIdx >= 3 ? 3 : rarityIdx >= 2 ? 3.5 : 4.5;

                    return (
                      <div key={item.id} className="relative h-[76px] rounded-2xl overflow-hidden shadow-xs border border-white bg-white">
                        {/* Border Chase Glow — Epic+ only */}
                        {hasChase && (
                          <div className="absolute inset-[-2px] rounded-2xl overflow-hidden pointer-events-none">
                            <div
                              className="absolute left-1/2 top-1/2 w-[150%] h-[150%]"
                              style={{
                                background: item.rarity === "divine"
                                  ? "conic-gradient(from 0deg, #ff7096, #ff9f1c, #4ade80, #60a5fa, #c084fc, #ff7096)"
                                  : `conic-gradient(from 0deg, transparent 0%, ${rarityColor}${rarityIdx >= 4 ? "cc" : "88"
                                  } 12%, transparent 28%, transparent 100%)`,
                                filter: `blur(${rarityIdx >= 4 ? 2.5 : 1.5}px)`,
                                animation: `inventoryBorderChase ${chaseSpeed}s linear infinite`,
                                transform: "translate(-50%, -50%)",
                              }}
                            />
                          </div>
                        )}

                        {/* Polaroid-like Card */}
                        <div
                          onClick={() => setSelectedItem(item)}
                          className={`absolute inset-[1.5px] rounded-[13px] flex flex-col items-center justify-between p-1.5 cursor-pointer border transition-all duration-200 active:scale-95 overflow-hidden bg-white ${isEquippedItem
                            ? "border-2 border-emerald-400 bg-emerald-50/30 z-10"
                            : selectedItem?.id === item.id
                              ? "border-2 border-pink-400 z-10 shadow-sm"
                              : isUnlockedItem
                                ? "border-pink-100 hover:border-pink-200"
                                : "border-zinc-200 bg-zinc-50"
                            }`}
                          style={
                            isUnlockedItem && !isEquippedItem && selectedItem?.id !== item.id
                              ? { borderColor: `${rarityColor}35` }
                              : {}
                          }
                        >
                          {/* Card Background Progress Overlay for Locked items */}
                          {!isUnlockedItem && (
                            <div
                              className="absolute inset-y-0 left-0 bg-pink-200/15 pointer-events-none transition-all duration-300"
                              style={{
                                width: `${Math.min(100, (shardsCount / item.shardTarget) * 100)}%`,
                              }}
                            />
                          )}

                          {/* Holo Sweep — all unlocked items */}
                          {isUnlockedItem && (
                            <div
                              className="absolute inset-0 rounded-xl pointer-events-none z-[5]"
                              style={{
                                background: `linear-gradient(115deg, transparent 30%, ${rarityColor}${rarityIdx >= 3 ? "25" : "12"
                                  } 44%, rgba(255,255,255,${rarityIdx >= 3 ? "0.3" : "0.15"
                                  }) 50%, transparent 65%)`,
                                backgroundSize: "200% 100%",
                                animation: `inventoryHoloSweep ${holoSpeed}s ease-in-out infinite`,
                              }}
                            />
                          )}

                          {/* Top Half: Item Icon/Image */}
                          <div
                            className={`flex-1 flex items-center justify-center relative min-h-0 z-10 ${isUnlockedItem ? "" : "opacity-45 blur-[0.2px] grayscale"
                              }`}
                          >
                            {item.type === "meme" ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-7 object-cover rounded-md z-10 border border-zinc-100/50"
                              />
                            ) : (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-7 h-7 object-contain z-10"
                              />
                            )}
                          </div>

                          {/* Bottom Half: Name or Progress */}
                          <div className="w-full mt-0.5 flex flex-col items-center z-10">
                            {isUnlockedItem ? (
                              <span
                                className="text-[8px] font-black text-zinc-700 truncate w-full text-center"
                              >
                                {item.name}
                              </span>
                            ) : (
                              <div className="w-full flex items-center justify-center gap-0.5 bg-white/95 border border-pink-100 py-0.5 rounded-full text-pink-400 shadow-2xs">
                                <Lock size={7} className="stroke-[3]" />
                                <span className="text-[7.5px] font-sans font-black select-none uppercase tracking-wide">
                                  {shardsCount}/{item.shardTarget}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Equipped Check Badge */}
                          {isEquippedItem && (
                            <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
                              <Check size={7} className="text-white" strokeWidth={5} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Detail Panel (Under grid) */}
                <div className="h-[145px] mt-2.5 bg-[#FFF9F2] border-2 border-[#FFD2CC] rounded-3xl p-3 flex flex-col justify-between shadow-xs">
                  {selectedItem ? (
                    <div className="flex flex-col h-full justify-between">
                      {/* Upper Section of details */}
                      <div className="flex gap-2.5">
                        <div
                          className="w-13 h-13 rounded-2xl bg-white border-2 flex items-center justify-center shadow-xs shrink-0 overflow-hidden"
                          style={{ borderColor: RARITY_CONFIG[selectedItem.rarity as GachaRarity].color }}
                        >
                          {selectedItem.type === "meme" ? (
                            <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.name}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[8px] px-2 py-0.5 rounded-full font-black text-white uppercase tracking-wider"
                              style={{ backgroundColor: RARITY_CONFIG[selectedItem.rarity as GachaRarity].color }}
                            >
                              {selectedItem.rarity}
                            </span>
                            {selectedItem.type === "furniture" && (
                              <span className="text-[8px] text-pink-500 font-black flex items-center gap-0.5">
                                +{selectedItem.bonesPerHour} <Bone size={10} className="rotate-45" />/h
                              </span>
                            )}
                            {(selectedItem.hpBonus ||
                              selectedItem.atkBonus ||
                              selectedItem.defBonus ||
                              selectedItem.critBonus) && (
                                <span className="text-[8px] text-pink-500 font-black">
                                  {selectedItem.hpBonus ? `+${selectedItem.hpBonus} HP ` : ""}
                                  {selectedItem.atkBonus ? `+${selectedItem.atkBonus} ATK ` : ""}
                                  {selectedItem.defBonus ? `+${selectedItem.defBonus} DEF ` : ""}
                                  {selectedItem.critBonus ? `+${selectedItem.critBonus}% CRT ` : ""}
                                </span>
                              )}
                          </div>
                          <h4
                            className="text-[11px] font-black text-zinc-800 truncate mt-0.5"
                          >
                            {selectedItem.name}
                          </h4>
                          <p className="text-[9.5px] text-zinc-500 leading-snug line-clamp-2 mt-0.5">
                            {selectedItem.description}
                          </p>
                        </div>
                      </div>

                      {/* Extra details for Memes or Voice */}
                      {selectedItem.type === "meme" && (
                        <div className="bg-white border border-pink-100 rounded-xl px-2 py-1 text-[9.5px] text-zinc-600 leading-snug shadow-2xs mt-1">
                          <span className="font-black text-pink-500">
                            {(selectedItem as MemeItem).japanesePoint.word}
                          </span>
                          <span className="text-zinc-300 mx-1.5">|</span>
                          <span>{(selectedItem as MemeItem).japanesePoint.meaning}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-1.5 mt-1">
                        {isItemUnlocked(selectedItem) ? (
                          <>
                            {selectedItem.type === "voice" && selectedItem.audioUrl && (
                              <button
                                onClick={() => handlePlayVoice(selectedItem.audioUrl!)}
                                className="flex-1 py-1.5 bg-[#FFD2CC]/30 hover:bg-[#FFD2CC]/50 text-pink-500 font-black rounded-2xl border-b-4 border-[#FFAAA6] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                              >
                                <Volume2 size={11} /> NGHE
                              </button>
                            )}

                            {selectedItem.type === "meme" && (
                              <button
                                onClick={() =>
                                  handleSpeak((selectedItem as MemeItem).japanesePoint.word)
                                }
                                className="flex-1 py-1.5 bg-[#FFD2CC]/30 hover:bg-[#FFD2CC]/50 text-pink-500 font-black rounded-2xl border-b-4 border-[#FFAAA6] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                              >
                                <Volume2 size={11} /> ĐỌC
                              </button>
                            )}

                            {selectedItem.type !== "meme" && (
                              <button
                                onClick={() => {
                                  const isCurrentlyEquipped = isItemEquipped(selectedItem);
                                  if (selectedItem.type === "furniture") {
                                    const slot = selectedItem.furnitureSlot;
                                    if (slot) {
                                      equipFurniture(slot, isCurrentlyEquipped ? null : selectedItem.id);
                                    }
                                  } else if (selectedItem.type === "voice") {
                                    equipItem("voice", isCurrentlyEquipped ? null : selectedItem.id);
                                  } else if (selectedItem.type === "theme") {
                                    equipTheme(isCurrentlyEquipped ? null : selectedItem.id);
                                  } else if (
                                    selectedItem.type === "accessory" ||
                                    selectedItem.type === "outfit" ||
                                    selectedItem.type === "costume"
                                  ) {
                                    const slot = selectedItem.type === "costume" ? "costume" : selectedItem.rpgSlot;
                                    if (slot) {
                                      equipItem(
                                        slot,
                                        isCurrentlyEquipped ? null : selectedItem.id
                                      );
                                    }
                                  }
                                  toast.success(
                                    isCurrentlyEquipped
                                      ? "Đã tháo trang bị!"
                                      : "Đã lắp đặt trang bị thành công!"
                                  );
                                }}
                                className={`flex-[1.5] py-1.5 text-white font-black rounded-2xl border-b-4 text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${isItemEquipped(selectedItem)
                                  ? "bg-[#FF7096] border-[#C7486B] active:border-b-0 active:translate-y-1 hover:bg-[#FF5C8A]"
                                  : "bg-[#06D6A0] border-[#05B284] active:border-b-0 active:translate-y-1 hover:bg-[#05C190]"
                                  }`}
                              >
                                {isItemEquipped(selectedItem) ? "THÁO BỎ" : "TRANG BỊ"}
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="w-full bg-zinc-100 border border-zinc-200/60 rounded-2xl py-1.5 text-center text-[10px] text-zinc-400 font-bold flex items-center justify-center gap-1 shadow-inner">
                            <Lock size={10} /> THU THẬP THÊM MẢNH ({userStats.shards?.[selectedItem.id] || 0}/{selectedItem.shardTarget})
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-[10px] font-bold">
                      <span
                        className="text-[9px] font-black text-pink-400"
                      >
                        Chọn một vật phẩm để xem thông tin
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
