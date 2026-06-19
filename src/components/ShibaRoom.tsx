"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bone, Lock, Check, X, Volume2, Sparkles, Info } from "lucide-react";
import { GACHA_POOL, MemeItem, RARITY_CONFIG } from "@/constants/gachaPool";
import toast from "react-hot-toast";
import { useShibaRoom } from "@/hooks/useShibaRoom";
import { FurShopModal } from "./FurShopModal";

// GIF assets for furniture items
const FURNITURE_GIFS: Record<string, string> = {
  fur_cushion: "/images/decorations/decoration_1.gif",
  fur_bonsai: "/images/decorations/decoration_2.gif",
  fur_lantern: "/images/decorations/decoration_3.gif",
  fur_kotatsu: "/images/decorations/decoration_4.gif",
  fur_maneki: "/images/decorations/decoration_5.gif",
};

export function ShibaRoom() {
  const {
    userStats,
    equipFurniture,
    equipVoicePack,
    harvestBones,
    equipItem,
    equipTheme,
    isInventoryOpen,
    setIsInventoryOpen,
    activeTab,
    setActiveTab,
    selectedItem,
    setSelectedItem,
    pendingBones,
    dragConstraints,
    showStatsBreakdown,
    setShowStatsBreakdown,
    modalSubTab,
    setModalSubTab,
    totalBonesPerHour,
    handleHarvest,
    shibaMascot,
    baseStats,
    statsBonus,
    totalHp,
    totalAtk,
    totalDef,
    totalCrit,
    handleSpeak,
    handlePlayVoice,
    activeGridItems,
    isItemUnlocked,
    isItemEquipped,
    sakuraPetals,
    FURNITURE_SLOTS,
  } = useShibaRoom();

  const [isShopOpen, setIsShopOpen] = React.useState(false);

  const renderRpgSlot = (slotKey: "head" | "armor" | "earring" | "gloves" | "mount" | "aura") => {
    const slotInfo = {
      head: { label: "Mũ", placeholder: "/images/placeholders/head_placeholder.png" },
      armor: { label: "Giáp", placeholder: "/images/placeholders/armor_placeholder.png" },
      earring: { label: "Tai", placeholder: "/images/placeholders/earring_placeholder.png" },
      gloves: { label: "Tay", placeholder: "/images/placeholders/gloves_placeholder.png" },
      mount: { label: "Thú", placeholder: "/images/placeholders/mount_placeholder.png" },
      aura: { label: "Aura", placeholder: "/images/placeholders/aura_placeholder.png" },
    }[slotKey];

    const itemId = userStats.equippedSlots?.[slotKey];
    const item = itemId ? GACHA_POOL.find((i) => i.id === itemId) : null;
    const color = item ? RARITY_CONFIG[item.rarity].color : "border-zinc-300";

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
          className={`w-11 h-11 rounded-xl flex items-center justify-center relative bg-white border-2 shadow-xs transition-all duration-300 group-hover:scale-105 active:scale-95 ${item ? "" : "border-dashed border-zinc-300"
            }`}
          style={{
            borderColor: item ? color : undefined,
            boxShadow: item ? `0 0 8px ${RARITY_CONFIG[item.rarity].glowColor}` : "",
          }}
        >
          {item ? (
            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain" />
          ) : (
            <img src={slotInfo.placeholder} alt={slotInfo.label} className="w-7 h-7 object-contain opacity-35 select-none grayscale contrast-75 brightness-110" />
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
    <div className="w-full flex flex-col items-center pb-6">
      <div className="w-full max-w-sm h-[460px] rounded-[2.5rem] border-4 border-[#FFE2D1] overflow-hidden relative shadow-lg flex flex-col bg-[#FAF3E0]">

        {/* Global ROOM BONES PRODUCTION BADGE */}
        <div
          className="absolute top-3 right-3 z-40 bg-gradient-to-r from-[#FF7096] to-[#FBC579] border border-white/40 px-3 py-1 rounded-full flex items-center gap-1.5 text-white font-black text-[10px] shadow-md tracking-wide select-none"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          <span>🐾</span>
          <span>{totalBonesPerHour} 🦴/h</span>
        </div>

        {/* Global falling sakura petals (covers both pages by absolute positioning over the scrollable container) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
          {sakuraPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute w-2.5 h-1.5 bg-[#FFA6C9] rounded-full opacity-65"
              style={{ top: "-10%", right: `${10 + petal.id * 20}%` }}
              animate={{
                x: petal.x,
                y: petal.y,
                rotate: [0, 360],
              }}
              transition={{
                duration: petal.duration,
                repeat: Infinity,
                delay: petal.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Global custom styling for hiding scrollbar */}
        <style>{`
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Scrollable Container Wrapper */}
        <div className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none relative">

          {/* ==================== TẦNG 1: PHÒNG WASHITSU (ROOM) ==================== */}
          <div
            className="w-full h-full shrink-0 snap-start relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/images/washitsu_bg.png')" }}
          >
            <div className="absolute inset-0 bg-black/5 pointer-events-none z-10" />

            {/* WALL FURNITURE */}
            {userStats.equippedFurniture?.wall && (
              <div className="absolute top-[28%] left-[15%] w-16 h-16 z-20 flex items-center justify-center">
                <img
                  src={FURNITURE_GIFS[userStats.equippedFurniture.wall]}
                  alt="Wall Furniture"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* CORNER FURNITURE */}
            {userStats.equippedFurniture?.corner && (
              <div className="absolute bottom-[32%] right-[12%] w-18 h-18 z-20 flex items-center justify-center">
                <img
                  src={FURNITURE_GIFS[userStats.equippedFurniture.corner]}
                  alt="Corner Furniture"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* FLOOR FURNITURE */}
            {userStats.equippedFurniture?.floor && (
              <div
                className="absolute z-20 flex items-center justify-center"
                style={
                  userStats.equippedFurniture.floor === "fur_cushion"
                    ? { bottom: "24%", left: "38%", width: "24%", height: "16%" }
                    : { bottom: "16%", left: "28%", width: "36%", height: "24%" }
                }
              >
                <img
                  src={FURNITURE_GIFS[userStats.equippedFurniture.floor]}
                  alt="Floor Furniture"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* MASCOT COMPANION SHIBA */}
            <div className="absolute z-20 pointer-events-none" style={shibaMascot.style}>
              <img
                src={shibaMascot.gif}
                alt="Companion Shiba"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* BONE FLOATING HARVEST DIALOG */}
            {pendingBones > 0 && (
              <motion.button
                onClick={handleHarvest}
                initial={{ y: 0 }}
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[65%] right-[22%] z-20 bg-gradient-to-br from-[#FFF8EE] to-[#FFE7C6] border-4 border-[#FBC579] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg active:scale-95 transition-all text-[#C85A28] font-bold text-sm cursor-pointer"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                <span>🦴</span>
                <span>+{pendingBones}</span>
              </motion.button>
            )}

            {/* SWIPE DOWN HINT BADGE */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 animate-bounce bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#8C6D58]/20 flex items-center gap-1 text-[9px] font-black text-[#8C6D58] shadow-xs select-none">
              <span>👇 Vuốt xuống ngắm Sân Vườn 🌸</span>
            </div>
          </div>

          {/* ==================== TẦNG 2: SÂN VƯỜN ZEN (GARDEN) ==================== */}
          <div
            className="w-full h-full shrink-0 snap-start relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/images/zen_garden_bg.png')" }}
          >

            {/* OUTDOOR FURNITURE HOOKUPS (Maps Room furniture layout outdoors!) */}
            {userStats.equippedFurniture?.corner === "fur_bonsai" && (
              <div className="absolute bottom-[28%] left-[22%] w-14 h-14 z-20 flex flex-col items-center justify-end">
                {/* Stone Pedestal */}
                <div className="w-8 h-2 bg-[#9E9E9E] rounded-md border border-[#757575] shadow-xs" />
                <img
                  src={FURNITURE_GIFS.fur_bonsai}
                  alt="Outdoor Bonsai"
                  className="w-10 h-10 object-contain mb-0.5"
                />
              </div>
            )}

            {userStats.equippedFurniture?.corner === "fur_maneki" && (
              <div className="absolute bottom-[38%] left-[30%] w-14 h-14 z-20 flex flex-col items-center justify-end">
                <div className="w-8 h-2.5 bg-[#8D6E63] rounded-sm border border-[#5D4037] shadow-xs" />
                <img
                  src={FURNITURE_GIFS.fur_maneki}
                  alt="Outdoor Maneki"
                  className="w-9 h-9 object-contain"
                />
              </div>
            )}

            {userStats.equippedFurniture?.wall === "fur_lantern" && (
              <div className="absolute top-[24%] left-[18%] w-10 h-16 z-20 flex flex-col items-center">
                <div className="w-0.5 h-6 bg-[#3E2723]" />
                <img
                  src={FURNITURE_GIFS.fur_lantern}
                  alt="Outdoor Lantern"
                  className="w-8 h-8 object-contain shrink-0"
                />
              </div>
            )}

            {/* Shiba standing in the garden */}
            <div className="absolute z-20 pointer-events-none bottom-[12%] right-[15%] w-[26%]">
              <img
                src="/images/shiba_master.gif"
                alt="Garden Shiba"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* BONE FLOATING HARVEST DIALOG IN GARDEN TOO */}
            {pendingBones > 0 && (
              <motion.button
                onClick={handleHarvest}
                initial={{ y: 0 }}
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[48%] left-[42%] z-20 bg-gradient-to-br from-[#FFF8EE] to-[#FFE7C6] border-4 border-[#FBC579] px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg active:scale-95 transition-all text-[#C85A28] font-bold text-xs cursor-pointer animate-pulse"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                <span>🦴</span>
                <span>+{pendingBones}</span>
              </motion.button>
            )}

            {/* SWIPE UP HINT BADGE */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 animate-bounce bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#8C6D58]/20 flex items-center gap-1 text-[9px] font-black text-[#8C6D58] shadow-xs select-none">
              <span>👆 Vuốt lên về Phòng Khách 🏠</span>
            </div>
          </div>

        </div>
      </div>

      {/* FLOATING SATCHEL TAB ON RIGHT SCREEN EDGE */}
      <motion.button
        drag="y"
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        onClick={() => setIsInventoryOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[45] bg-[#8C6D58] hover:bg-[#735948] text-white flex flex-col items-center justify-center gap-1 w-11 h-24 rounded-l-2xl border-l-2 border-t-2 border-b-2 border-white/20 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.25),-4px_4px_12px_rgba(0,0,0,0.2)] active:translate-x-1 transition-all cursor-pointer group touch-none"
      >
        <span className="text-xl group-hover:scale-110 transition-transform pointer-events-none">🎒</span>
      </motion.button>

      {/* FLOATING SHOP TAB ON RIGHT SCREEN EDGE */}
      <button
        onClick={() => setIsShopOpen(true)}
        className="fixed right-0 top-1/2 translate-y-16 z-[45] bg-[#D4AF37] hover:bg-[#b09028] text-white flex flex-col items-center justify-center gap-1 w-11 h-14 rounded-l-2xl border-l-2 border-t-2 border-b-2 border-white/20 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.25),-4px_4px_12px_rgba(0,0,0,0.2)] active:translate-x-1 transition-all cursor-pointer group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform pointer-events-none">🏮</span>
      </button>

      {/* RPG CHARACTER & INVENTORY MODAL */}
      <AnimatePresence>
        {isInventoryOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            {/* Backdrop click closes modal */}
            <div className="absolute inset-0" onClick={() => {
              setIsInventoryOpen(false);
              setSelectedItem(null);
              setShowStatsBreakdown(false);
            }} />

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
                <h3 className="text-sm md:text-base text-[#8C6D58] tracking-wider font-black flex items-center gap-1.5" style={{ fontFamily: "var(--font-cherry)" }}>
                  THÔNG TIN NHÂN VẬT & TRANG BỊ
                </h3>
                <button
                  onClick={() => {
                    setIsInventoryOpen(false);
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
                <div className={`flex-1 flex flex-col items-center justify-between bg-[#FFF8EE]/60 border border-[#8C6D58]/20 rounded-3xl p-3 relative overflow-hidden min-h-0 ${modalSubTab === "character" ? "flex" : "hidden md:flex"
                  }`}>

                  {/* Stats Detail Overlay */}
                  {showStatsBreakdown && (
                    <div className="absolute inset-0 bg-[#FAF6EE] z-30 flex flex-col p-4 select-none">
                      <div className="flex items-center justify-between border-b border-[#8C6D58]/20 pb-2 mb-3">
                        <span className="text-xs font-black text-[#8C6D58] tracking-wider" style={{ fontFamily: "var(--font-cherry)" }}>
                          📊 Chỉ số chi tiết
                        </span>
                        <button
                          onClick={() => setShowStatsBreakdown(false)}
                          className="w-5 h-5 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full transition-colors border border-[#8C6D58]/40 shadow-sm cursor-pointer"
                        >
                          <X size={10} strokeWidth={4} />
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 justify-center text-[11px] font-bold text-zinc-600">
                        <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                          <span>Máu (HP)</span>
                          <span className="text-emerald-600">{baseStats.hp} <span className="text-zinc-400 font-normal">({statsBonus.hp >= 0 ? `+${statsBonus.hp}` : statsBonus.hp})</span> = <span className="font-extrabold">{totalHp}</span></span>
                        </div>
                        <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                          <span>Tấn công (ATK)</span>
                          <span className="text-red-600">{baseStats.atk} <span className="text-zinc-400 font-normal">({statsBonus.atk >= 0 ? `+${statsBonus.atk}` : statsBonus.atk})</span> = <span className="font-extrabold">{totalAtk}</span></span>
                        </div>
                        <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                          <span>Phòng thủ (DEF)</span>
                          <span className="text-blue-600">{baseStats.def} <span className="text-zinc-400 font-normal">({statsBonus.def >= 0 ? `+${statsBonus.def}` : statsBonus.def})</span> = <span className="font-extrabold">{totalDef}</span></span>
                        </div>
                        <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-[#FFE2D1]">
                          <span>Chí mạng (CRIT)</span>
                          <span className="text-pink-600">{baseStats.crit}% <span className="text-zinc-400 font-normal">(+{statsBonus.crit}%)</span> = <span className="font-extrabold">{totalCrit}%</span></span>
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

                    {/* Center Shiba Mascot Avatar */}
                    <div className="relative w-28 h-28 flex items-center justify-center bg-[#FAF3E0] rounded-full border-4 border-[#8C6D58]/40 shadow-inner">
                      {userStats.equippedSlots?.aura && (
                        <div className="absolute inset-0 rounded-full animate-pulse border-4 border-dashed border-pink-400 opacity-60 scale-110" />
                      )}
                      <img src={shibaMascot.gif} alt="Shiba Mascot" className="w-20 h-20 object-contain z-10" />
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
                        <span>{totalHp}/{totalHp}</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300/40 relative shadow-inner">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: "100%" }} />
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
                <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${modalSubTab === "inventory" ? "flex" : "hidden md:flex"
                  }`}>

                  {/* Tabs selector */}
                  <div className="grid grid-cols-5 bg-[#8C6D58]/10 p-0.5 rounded-2xl gap-0.5 mb-2 border border-[#8C6D58]/20">
                    {(["trangbi", "decor", "meme", "voice", "theme"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setSelectedItem(null);
                        }}
                        className={`py-1.5 text-[9px] font-black rounded-xl transition-all cursor-pointer ${activeTab === tab
                          ? "bg-[#8C6D58] text-white shadow-sm"
                          : "text-[#8C6D58]/60 hover:text-[#8C6D58]"
                          }`}
                        style={{ fontFamily: "var(--font-cherry)" }}
                      >
                        {tab === "trangbi" ? "⚔️ Bị" : tab === "decor" ? "🛋️ Đồ" : tab === "meme" ? "🖼️ Thẻ" : tab === "voice" ? "🎙️ Âm" : "🎨 Đề"}
                      </button>
                    ))}
                  </div>

                  {/* Inventory Grid (scrollable) */}
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/50 rounded-2xl border border-[#8C6D58]/10 flex-1 overflow-y-auto min-h-0 content-start">
                    {activeGridItems.map((item) => {
                      const isUnlocked = isItemUnlocked(item);
                      const isEquipped = isItemEquipped(item);
                      const shardsCount = userStats.shards?.[item.id] || 0;
                      const rarityColor = RARITY_CONFIG[item.rarity].color;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`h-[76px] rounded-xl relative flex flex-col items-center justify-between p-1.5 cursor-pointer border-2 transition-all duration-200 active:scale-95 shadow-xs overflow-hidden ${isEquipped
                            ? "border-emerald-500 bg-emerald-50/10"
                            : selectedItem?.id === item.id
                              ? "border-[#8C6D58] bg-[#FAF6EE]/30"
                              : isUnlocked
                                ? "border-zinc-200/80 hover:border-[#8C6D58]/40 bg-white"
                                : "border-[#8C6D58]/20 bg-[#FAF8F5] hover:border-[#8C6D58]/40"
                            }`}
                          style={isUnlocked && !isEquipped && selectedItem?.id !== item.id ? { borderColor: `${rarityColor}30` } : {}}
                        >
                          {/* Card Background Progress Overlay for Locked items */}
                          {!isUnlocked && (
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FBC579]/20 to-[#FF7096]/20 pointer-events-none transition-all duration-300"
                              style={{ width: `${Math.min(100, (shardsCount / item.shardTarget) * 100)}%` }}
                            />
                          )}

                          {/* Rarity Glow Backing for Unlocked items */}
                          {isUnlocked && (
                            <div
                              className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none"
                              style={{ backgroundColor: rarityColor }}
                            />
                          )}

                          {/* Top Half: Item Icon/Image */}
                          <div className={`flex-1 flex items-center justify-center relative min-h-0 z-10 ${isUnlocked ? "" : "opacity-45 blur-[0.1px]"}`}>
                            {item.type === "meme" ? (
                              <img src={item.imageUrl} alt={item.name} className="w-10 h-7 object-cover rounded-md z-10 border border-zinc-100/50" />
                            ) : (
                              <img src={item.imageUrl} alt={item.name} className="w-7 h-7 object-contain z-10" />
                            )}
                          </div>

                          {/* Bottom Half: Name or Progress */}
                          <div className="w-full mt-0.5 flex flex-col items-center z-10">
                            {isUnlocked ? (
                              <span className="text-[8px] font-black text-zinc-700 truncate w-full text-center" style={{ fontFamily: "var(--font-cherry)" }}>
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
                          {isEquipped && (
                            <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center border border-white shadow-xs z-20">
                              <Check size={7} className="text-white" strokeWidth={5} />
                            </div>
                          )}
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
                          <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center shadow-xs shrink-0" style={{ borderColor: RARITY_CONFIG[selectedItem.rarity].color }}>
                            {selectedItem.type === "meme" ? (
                              <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-8 h-8 object-contain" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] px-1.5 py-0.2 rounded-full font-black text-white uppercase tracking-wider" style={{ backgroundColor: RARITY_CONFIG[selectedItem.rarity].color }}>
                                {selectedItem.rarity}
                              </span>
                              {selectedItem.type === "furniture" && (
                                <span className="text-[8px] text-pink-600 font-bold">+{selectedItem.bonesPerHour} 🦴/h</span>
                              )}
                              {(selectedItem.hpBonus || selectedItem.atkBonus || selectedItem.defBonus || selectedItem.critBonus) && (
                                <span className="text-[8px] text-[#C85A28] font-bold">
                                  {selectedItem.hpBonus ? `+${selectedItem.hpBonus} HP ` : ""}
                                  {selectedItem.atkBonus ? `+${selectedItem.atkBonus} ATK ` : ""}
                                  {selectedItem.defBonus ? `+${selectedItem.defBonus} DEF ` : ""}
                                  {selectedItem.critBonus ? `+${selectedItem.critBonus}% CRT ` : ""}
                                </span>
                              )}
                            </div>
                            <h4 className="text-[11px] font-black text-zinc-800 truncate mt-0.5" style={{ fontFamily: "var(--font-cherry)" }}>
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
                            <span className="font-black text-[#C85A28]">{(selectedItem as MemeItem).japanesePoint.word}</span>
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
                                  onClick={() => handleSpeak((selectedItem as MemeItem).japanesePoint.word)}
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
                                      const slot = FURNITURE_SLOTS[selectedItem.id];
                                      equipFurniture(slot, isCurrentlyEquipped ? null : selectedItem.id);
                                    } else if (selectedItem.type === "voice") {
                                      equipVoicePack(isCurrentlyEquipped ? null : selectedItem.id);
                                    } else if (selectedItem.type === "theme") {
                                      equipTheme(isCurrentlyEquipped ? null : selectedItem.id);
                                    } else if (selectedItem.type === "sticker" || selectedItem.type === "outfit") {
                                      if (selectedItem.rpgSlot) {
                                        equipItem(selectedItem.rpgSlot, isCurrentlyEquipped ? null : selectedItem.id);
                                      }
                                    }
                                    toast.success(isCurrentlyEquipped ? "Đã tháo trang bị! 📦" : "Đã lắp đặt trang bị thành công! ⚔️");
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
                        <span className="text-[9px] font-normal mt-0.5" style={{ fontFamily: "var(--font-cherry)" }}>Chọn một vật phẩm để xem thông tin</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <FurShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
    </div>
  );
}
