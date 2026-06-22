"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Volume2, Info, Swords, Sofa, Smile, Palette } from "lucide-react";
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
  const { allItems } = useSystemItems();

  const renderRpgSlot = (slotKey: "head" | "armor" | "earring" | "gloves" | "mount" | "aura" | "costume") => {
    const slotInfo = {
      head: { label: "Mũ", placeholder: "/images/placeholders/head_placeholder.png" },
      armor: { label: "Giáp", placeholder: "/images/placeholders/armor_placeholder.png" },
      earring: { label: "Tai", placeholder: "/images/placeholders/earring_placeholder.png" },
      gloves: { label: "Tay", placeholder: "/images/placeholders/gloves_placeholder.png" },
      mount: { label: "Thú", placeholder: "/images/placeholders/mount_placeholder.png" },
      aura: { label: "Aura", placeholder: "/images/placeholders/aura_placeholder.png" },
      costume: { label: "C.Trang", placeholder: "/images/placeholders/armor_placeholder.png" },
    }[slotKey];

    const itemId = userStats.equippedSlots?.[slotKey];
    const item = itemId ? allItems.find((i) => i.id === itemId) : null;
    const color = item ? RARITY_CONFIG[item.rarity as GachaRarity]?.color : "border-zinc-300";

    return (
      <div
        onClick={() => {
          if (item) {
            setSelectedItem(item);
          }
        }}
        className="flex flex-col items-center gap-0.5 cursor-pointer group"
      >
        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-600 transition-colors">
          {slotInfo.label}
        </span>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center relative bg-white border-1 shadow-xs transition-all duration-300 group-hover:scale-105 active:scale-95 ${item ? "" : "border-dashed border-zinc-300"
            }`}
          style={{
            borderColor: item ? color : undefined,
            boxShadow: item ? `0 0 8px ${RARITY_CONFIG[item.rarity as GachaRarity]?.glowColor}` : "",
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
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center border border-white">
              <Check size={6} className="text-white" strokeWidth={5} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          {/* Backdrop click closes modal */}
          <div
            className="absolute inset-0"
            onClick={() => {
              onClose();
              setSelectedItem(null);
              setShowStatsBreakdown(false);
            }}
          />

          {/* Wooden RPG Modal container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-[620px] h-[85vh] max-h-[500px] bg-[#FAF6EE] border-4 border-[#8C6D58] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col p-4 select-none"
          >
            {/* Header Title with Close X */}
            <div className="flex items-center justify-between mb-3 border-b border-[#8C6D58]/20 pb-2">
              <h3
                className="text-sm md:text-base text-[#8C6D58] tracking-wider font-black flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                THÔNG TIN NHÂN VẬT & TRANG BỊ
              </h3>
              <button
                onClick={() => {
                  onClose();
                  setSelectedItem(null);
                  setShowStatsBreakdown(false);
                }}
                className="w-7 h-7 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full transition-colors border border-[#8C6D58]/40 shadow-sm cursor-pointer"
              >
                <X size={14} strokeWidth={3.5} />
              </button>
            </div>

            {/* Mobile Sub-tabs Selector */}
            <div className="flex md:hidden bg-[#8C6D58]/10 p-1 rounded-2xl gap-1 mb-3 border border-[#8C6D58]/20">
              <button
                onClick={() => setModalSubTab("character")}
                className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${modalSubTab === "character"
                  ? "bg-[#8C6D58] text-white shadow-sm"
                  : "text-[#8C6D58]/60 hover:text-[#8C6D58]"
                  }`}
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                NHÂN VẬT
              </button>
              <button
                onClick={() => setModalSubTab("inventory")}
                className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${modalSubTab === "inventory"
                  ? "bg-[#8C6D58] text-white shadow-sm"
                  : "text-[#8C6D58]/60 hover:text-[#8C6D58]"
                  }`}
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                HÒM ĐỒ
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
              {/* Column 1: Character & Slots (Left) */}
              <div
                className={`flex-1 flex flex-col items-center justify-between bg-[#FFF8EE]/60 border border-[#8C6D58]/20 rounded-3xl p-3 relative overflow-hidden min-h-0 ${modalSubTab === "character" ? "flex" : "hidden md:flex"
                  }`}
              >
                {/* Stats Detail Overlay */}
                {showStatsBreakdown && (
                  <div className="absolute inset-0 bg-[#FAF6EE] z-30 flex flex-col p-4 select-none">
                    <div className="flex items-center justify-between border-b border-[#8C6D58]/20 pb-2 mb-3">
                      <span
                        className="text-xs font-black text-[#8C6D58] tracking-wider"
                        style={{ fontFamily: "var(--font-cherry)" }}
                      >
                        Chỉ số chi tiết
                      </span>
                      <button
                        onClick={() => setShowStatsBreakdown(false)}
                        className="w-5 h-5 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full transition-colors border border-[#8C6D58]/40 shadow-sm cursor-pointer"
                      >
                        <X size={10} strokeWidth={4} />
                      </button>
                    </div>

                    <div
                      className="flex-1 flex flex-col gap-2 justify-center text-[11px] font-bold text-zinc-600"
                      style={{
                        fontFamily: "var(--font-cherry)",
                      }}
                    >
                      <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                        <span>Máu (HP)</span>
                        <span className="text-emerald-600">
                          {baseStats.hp}{" "}
                          <span className="text-zinc-400 font-normal">
                            ({statsBonus.hp >= 0 ? `+${statsBonus.hp}` : statsBonus.hp})
                          </span>{" "}
                          = <span className="font-extrabold">{totalHp}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                        <span>Tấn công (ATK)</span>
                        <span className="text-red-600">
                          {baseStats.atk}{" "}
                          <span className="text-zinc-400 font-normal">
                            ({statsBonus.atk >= 0 ? `+${statsBonus.atk}` : statsBonus.atk})
                          </span>{" "}
                          = <span className="font-extrabold">{totalAtk}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                        <span>Phòng thủ (DEF)</span>
                        <span className="text-blue-600">
                          {baseStats.def}{" "}
                          <span className="text-zinc-400 font-normal">
                            ({statsBonus.def >= 0 ? `+${statsBonus.def}` : statsBonus.def})
                          </span>{" "}
                          = <span className="font-extrabold">{totalDef}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                        <span>Chí mạng (CRIT)</span>
                        <span className="text-pink-600">
                          {baseStats.crit}%{" "}
                          <span className="text-zinc-400 font-normal">
                            (+{statsBonus.crit}%)
                          </span>{" "}
                          = <span className="font-extrabold">{totalCrit}%</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                        <span>Sản sinh Xương</span>
                        <span className="text-orange-600">+{totalBonesPerHour} 🦴/h</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Character Title & Level/Class */}
                <div className="text-center">
                  <span className="text-[10px] bg-[#8C6D58] text-white px-2.5 py-0.5 rounded-full font-black tracking-wider font-sans">
                    LV.1 THẦN KHUYỂN
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

                  {/* Center Shiba Mascot Avatar (with Equipment Layers) */}
                  <div className="flex flex-col items-center gap-1 justify-center shrink-0">
                    <div className="relative w-24 h-24 flex items-center justify-center bg-[#FAF3E0] rounded-full border-4 border-[#8C6D58]/40 shadow-inner overflow-hidden">
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
                    <div className="flex justify-between text-[9px] font-bold text-zinc-500 font-sans px-1">
                      <span>HP (Máu)</span>
                      <span>
                        {totalHp}/{totalHp}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300/40 relative shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Stats values row */}
                  <div className="flex items-center justify-between text-[11px] font-black text-zinc-700 bg-white/70 border border-[#FFE2D1] px-2.5 py-1.5 rounded-xl">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-0.5">⚔️ {totalAtk}</span>
                      <span className="flex items-center gap-0.5">🛡️ {totalDef}</span>
                    </div>
                    <button
                      onClick={() => setShowStatsBreakdown(true)}
                      className="text-[9px] text-[#C85A28] hover:text-[#C85A28]/80 flex items-center gap-0.5 cursor-pointer font-bold font-sans uppercase tracking-wider"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: Inventory & Details (Right) */}
              <div
                className={`flex-1 flex flex-col overflow-hidden min-h-0 ${modalSubTab === "inventory" ? "flex" : "hidden md:flex"
                  }`}
              >
                <div className="grid grid-cols-5 bg-[#8C6D58]/10 p-0.5 rounded-2xl gap-0.5 mb-2 border border-[#8C6D58]/20">
                  {(["trangbi", "decor", "meme", "voice", "theme"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSelectedItem(null);
                      }}
                      className={`py-2 flex items-center justify-center rounded-xl transition-all cursor-pointer ${activeTab === tab
                        ? "bg-[#8C6D58] text-white shadow-sm"
                        : "text-[#8C6D58]/60 hover:text-[#8C6D58]"
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
                <div className="grid grid-cols-3 gap-[2px] p-[2px] bg-[#c9a084] rounded-2xl border-4 border-[#8C6D58] flex-1 overflow-y-auto min-h-0 content-start shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
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
                      <div key={item.id} className="relative h-[76px]">
                        {/* Border Chase Glow — Epic+ only */}
                        {hasChase && (
                          <div className="absolute inset-[-2px] rounded-[14px] overflow-hidden pointer-events-none">
                            <div
                              className="absolute left-1/2 top-1/2 w-[150%] h-[150%]"
                              style={{
                                background: `conic-gradient(from 0deg, transparent 0%, ${rarityColor}${rarityIdx >= 4 ? "cc" : "88"
                                  } 12%, transparent 28%, transparent 100%)`,
                                filter: `blur(${rarityIdx >= 4 ? 2.5 : 1.5}px)`,
                                animation: `inventoryBorderChase ${chaseSpeed}s linear infinite`,
                              }}
                            />
                          </div>
                        )}

                        {/* The actual card */}
                        <div
                          onClick={() => setSelectedItem(item)}
                          className={`h-full rounded-lg relative flex flex-col items-center justify-between p-1.5 cursor-pointer border transition-all duration-200 active:scale-95 overflow-hidden ${isEquippedItem
                            ? "border-1 border-emerald-500 bg-emerald-50 shadow-md z-10"
                            : selectedItem?.id === item.id
                              ? "border-1 border-[#8C6D58] bg-[#FAF6EE] shadow-md z-10"
                              : isUnlockedItem
                                ? "border-[#8C6D58]/10 hover:border-[#8C6D58]/30 bg-[#FFFDF9] hover:bg-[#FFFDF3] shadow-[inset_0_1.5px_3px_rgba(140,109,88,0.06)] z-[1]"
                                : "border-[#8C6D58]/10 bg-[#E5D5C3] shadow-[inset_0_3px_6px_rgba(140,109,88,0.18)] z-[1]"
                            }`}
                          style={
                            isUnlockedItem && !isEquippedItem && selectedItem?.id !== item.id
                              ? { borderColor: `${rarityColor}30` }
                              : {}
                          }
                        >
                          {/* Card Background Progress Overlay for Locked items */}
                          {!isUnlockedItem && (
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FBC579]/20 to-[#FF7096]/20 pointer-events-none transition-all duration-300"
                              style={{
                                width: `${Math.min(100, (shardsCount / item.shardTarget) * 100)}%`,
                              }}
                            />
                          )}

                          {/* Rarity Glow Backing for Unlocked items */}
                          {isUnlockedItem && (
                            <div
                              className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none"
                              style={{ backgroundColor: rarityColor }}
                            />
                          )}

                          {/* Holo Sweep — all unlocked items */}
                          {isUnlockedItem && (
                            <div
                              className="absolute inset-0 rounded-xl pointer-events-none z-[5]"
                              style={{
                                background: `linear-gradient(115deg, transparent 30%, ${rarityColor}${rarityIdx >= 3 ? "30" : "18"
                                  } 44%, rgba(255,255,255,${rarityIdx >= 3 ? "0.35" : "0.2"
                                  }) 50%, transparent 65%)`,
                                backgroundSize: "200% 100%",
                                animation: `inventoryHoloSweep ${holoSpeed}s ease-in-out infinite`,
                              }}
                            />
                          )}

                          {/* Top Half: Item Icon/Image */}
                          <div
                            className={`flex-1 flex items-center justify-center relative min-h-0 z-10 ${isUnlockedItem ? "" : "opacity-45 blur-[0.1px]"
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
                                style={{ fontFamily: "var(--font-cherry)" }}
                              >
                                {item.name}
                              </span>
                            ) : (
                              <div className="w-full flex items-center justify-center gap-0.5 bg-white/90 border border-[#8C6D58]/20 py-0.5 rounded-full text-[#8C6D58] shadow-2xs">
                                <Lock size={7} className="stroke-[3]" />
                                <span className="text-[7.5px] font-sans font-black select-none uppercase tracking-wide">
                                  {shardsCount}/{item.shardTarget}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Equipped Check Badge */}
                          {isEquippedItem && (
                            <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center border border-white shadow-xs z-20">
                              <Check size={7} className="text-white" strokeWidth={5} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Detail Panel (Under grid) */}
                <div className="h-[145px] mt-2 bg-[#FFF8EE] border border-[#FBC579]/40 rounded-2xl p-2.5 flex flex-col justify-between font-sans">
                  {selectedItem ? (
                    <div className="flex flex-col h-full justify-between">
                      {/* Upper Section of details */}
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center shadow-xs shrink-0"
                          style={{ borderColor: RARITY_CONFIG[selectedItem.rarity as GachaRarity].color }}
                        >
                          {selectedItem.type === "meme" ? (
                            <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.name}
                              className="w-full h-full object-cover rounded-xl"
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
                              className="text-[8px] px-1.5 py-0.2 rounded-full font-black text-white uppercase tracking-wider"
                              style={{ backgroundColor: RARITY_CONFIG[selectedItem.rarity as GachaRarity].color }}
                            >
                              {selectedItem.rarity}
                            </span>
                            {selectedItem.type === "furniture" && (
                              <span className="text-[8px] text-pink-600 font-bold">
                                +{selectedItem.bonesPerHour} 🦴/h
                              </span>
                            )}
                            {(selectedItem.hpBonus ||
                              selectedItem.atkBonus ||
                              selectedItem.defBonus ||
                              selectedItem.critBonus) && (
                                <span className="text-[8px] text-[#C85A28] font-bold">
                                  {selectedItem.hpBonus ? `+${selectedItem.hpBonus} HP ` : ""}
                                  {selectedItem.atkBonus ? `+${selectedItem.atkBonus} ATK ` : ""}
                                  {selectedItem.defBonus ? `+${selectedItem.defBonus} DEF ` : ""}
                                  {selectedItem.critBonus ? `+${selectedItem.critBonus}% CRT ` : ""}
                                </span>
                              )}
                          </div>
                          <h4
                            className="text-[11px] font-black text-zinc-800 truncate mt-0.5"
                            style={{ fontFamily: "var(--font-cherry)" }}
                          >
                            {selectedItem.name}
                          </h4>
                          <p className="text-[9px] text-zinc-500 leading-tight line-clamp-2 mt-0.5">
                            {selectedItem.description}
                          </p>
                        </div>
                      </div>

                      {/* Extra details for Memes or Voice */}
                      {selectedItem.type === "meme" && (
                        <div className="bg-white/90 border border-[#FFE7C6] rounded-lg p-1 text-[9px] text-zinc-600 leading-snug">
                          <span className="font-black text-[#C85A28]">
                            {(selectedItem as MemeItem).japanesePoint.word}
                          </span>
                          <span className="text-zinc-400 mx-1">|</span>
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
                                className="flex-1 py-1.5 bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] font-black rounded-xl border-b-2 border-[#D99A6C] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                                style={{ fontFamily: "var(--font-cherry)" }}
                              >
                                <Volume2 size={11} /> NGHE
                              </button>
                            )}

                            {selectedItem.type === "meme" && (
                              <button
                                onClick={() =>
                                  handleSpeak((selectedItem as MemeItem).japanesePoint.word)
                                }
                                className="flex-1 py-1.5 bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] font-black rounded-xl border-b-2 border-[#D99A6C] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                                style={{ fontFamily: "var(--font-cherry)" }}
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
                                      ? "Đã tháo trang bị! 📦"
                                      : "Đã lắp đặt trang bị thành công! ⚔️"
                                  );
                                }}
                                className={`flex-[1.5] py-1.5 text-white font-black rounded-xl border-b-2 text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${isItemEquipped(selectedItem)
                                  ? "bg-[#FF7096] border-[#C7486B] active:border-b-0 active:translate-y-0.5"
                                  : "bg-[#06D6A0] border-[#05B284] active:border-b-0 active:translate-y-0.5"
                                  }`}
                                style={{ fontFamily: "var(--font-cherry)" }}
                              >
                                {isItemEquipped(selectedItem) ? "THÁO BỎ" : "TRANG BỊ"}
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="w-full bg-zinc-100 border border-zinc-200/60 rounded-xl py-1.5 text-center text-[10px] text-zinc-400 font-bold flex items-center justify-center gap-1">
                            <Lock size={10} /> THU THẬP THÊM MẢNH ({userStats.shards?.[selectedItem.id] || 0}/{selectedItem.shardTarget})
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-[10px] font-bold">
                      <span
                        className="text-[9px] font-normal mt-0.5"
                        style={{ fontFamily: "var(--font-cherry)" }}
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
    </AnimatePresence>
  );
}
