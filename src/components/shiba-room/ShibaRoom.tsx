"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import { useShibaRoom } from "@/hooks/shiba-room/useShibaRoom";
import { ShibaLoginModal } from "./ShibaLoginModal";
import { RpgInventoryModal } from "./RpgInventoryModal";
import { ShibaAvatar } from "./ShibaAvatar";

const getFurnitureImg = (id: string, allItems: any[]) => {
  const item = allItems.find((i) => i.id === id);
  return item?.imageUrl || "";
};

export function ShibaRoom() {
  const { allItems, isMetadataLoaded } = useSystemItems();
  const {
    user,
    userStats,
    equipFurniture,
    equipItem,
    equipTheme,
    isInventoryOpen,
    setIsInventoryOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    activeTab,
    setActiveTab,
    selectedItem,
    setSelectedItem,
    pendingBones,
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
    isItemUnlocked,
    isItemEquipped,
    sakuraPetals,
    filteredGridItems,
    roomTab,
    setRoomTab,
    petMood,
    petHunger,
    petEnergy,
    isSleeping,
    speechBubble,
    heartsEffect,
    bonesEffect,
    shibaActionState,
    handleFeed,
    handleShibaClick,
    handlePet,
    handleToggleSleep
  } = useShibaRoom();

  const targetBonePos = React.useMemo(() => {
    const style = shibaMascot.style || {};
    const widthVal = parseFloat(style.width || "22");
    const bottomVal = parseFloat(style.bottom || "15");

    if (roomTab === "indoor") {
      return {
        left: "70%",
        bottom: ["8%", "62%", "34%"]
      };
    }

    let leftTarget = "39%";
    if (style.left) {
      const leftVal = parseFloat(style.left);
      leftTarget = `${leftVal + widthVal * 0.3}%`;
    } else if (style.right) {
      const rightVal = parseFloat(style.right);
      leftTarget = `${100 - rightVal - widthVal * 0.6}%`;
    }

    const peak = Math.round(bottomVal + widthVal * 1.8);
    const land = Math.round(bottomVal + widthVal * 0.75);

    return {
      left: leftTarget,
      bottom: ["8%", `${peak}%`, `${land}%`]
    };
  }, [roomTab, shibaMascot.style]);

  if (!isMetadataLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/50 p-6 text-center" style={{ fontFamily: "var(--font-rounded)" }}>
        <div className="w-12 h-12 border-4 border-[#8C6D58] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#8C6D58] font-black text-xs uppercase tracking-wider">Đang kết nối Shiba Town...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center pb-6">
      <div className="w-full max-w-xl h-[600px] rounded-[2.5rem] border-4 border-[#FFCCD5] overflow-hidden relative shadow-lg flex flex-col bg-[#FAF3E0]">

        {/* Global ROOM BONES PRODUCTION BADGE */}
        <div
          className="absolute top-3 right-3 z-40 bg-[#FFF0F2] border-2 border-[#FFCCD5] shadow-[0_3px_0_0_#FFA8B6] px-3.5 py-1 rounded-full flex items-center gap-1.5 text-[#E05375] font-black text-[10px] tracking-wide select-none hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          <span>{totalBonesPerHour} 🦴 / h</span>
        </div>

        {/* TAMAGOTCHI PET STATUS BARS */}
        <div className="absolute top-3 left-3 z-40 flex flex-col gap-0.5 bg-white/70 backdrop-blur-xs p-1.5 rounded-2xl border border-white/40 shadow-xs pointer-events-none select-none">
          {/* Hunger Bar */}
          <div className="flex items-center gap-1 w-[4.5rem]">
            <span className="text-[9px]" title="No nê">🍖</span>
            <div className="flex-1 h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-400 transition-all duration-500"
                style={{ width: `${petHunger}%` }}
              />
            </div>
          </div>
          {/* Happy Bar */}
          <div className="flex items-center gap-1 w-[4.5rem]">
            <span className="text-[9px]" title="Vui vẻ">💖</span>
            <div className="flex-1 h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${petMood}%` }}
              />
            </div>
          </div>
          {/* Energy Bar */}
          <div className="flex items-center gap-1 w-[4.5rem]">
            <span className="text-[9px]" title="Năng lượng">⚡</span>
            <div className="flex-1 h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-500"
                style={{ width: `${petEnergy}%` }}
              />
            </div>
          </div>
        </div>

        {/* WOODEN TAB SWITCHER */}
        <div className="absolute top-15 left-1/2 -translate-x-1/2 z-40 bg-[#D7C0AD]/90 border-2 border-white/60 px-1.5 py-1 rounded-[1.1rem] flex gap-1.5 shadow-md animate-fade-in"
        >
          <button
            onClick={() => setRoomTab("indoor")}
            className={`px-3 py-1 rounded-[0.75rem] text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${roomTab === "indoor"
              ? "bg-[#FFFDF6] text-[#8C6D58] border-b border-[#D7C0AD]/50 shadow-xs scale-102 font-black"
              : "text-white hover:text-white/90"
              }`}
          >
            Trong Nhà
          </button>
          <button
            onClick={() => setRoomTab("outdoor")}
            className={`px-3 py-1 rounded-[0.75rem] text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${roomTab === "outdoor"
              ? "bg-[#FFFDF6] text-[#8C6D58] border-b border-[#D7C0AD]/50 shadow-xs scale-102 font-black"
              : "text-white hover:text-white/90"
              }`}
          >
            Sân Vườn
          </button>
        </div>

        {/* Global falling sakura petals */}
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

        {/* ROOM VIEWER CONTAINER */}
        <div className="flex-1 w-full relative overflow-hidden bg-[#FAF3E0]">
          <AnimatePresence mode="wait">
            {roomTab === "indoor" ? (
              <motion.div
                key="indoor"
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full h-full absolute inset-0 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('/images/backgrounds/washitsu_bg_pastel.png')" }}
              >
                <div className="absolute inset-0 bg-black/5 pointer-events-none z-10" />

                {/* WALL FURNITURE */}
                {userStats.equippedFurniture?.wall && (() => {
                  const item = allItems.find((i) => i.id === userStats.equippedFurniture.wall);
                  const customStyle = item?.roomStyle;
                  return (
                    <div
                      className={`absolute flex items-center justify-center ${customStyle ? "" : "top-[28%] left-[15%] w-16 h-16"} z-20`}
                      style={customStyle as React.CSSProperties}
                    >
                      <img
                        src={item?.imageUrl || ""}
                        alt="Wall Furniture"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  );
                })()}

                {/* CORNER FURNITURE */}
                {userStats.equippedFurniture?.corner && (() => {
                  const item = allItems.find((i) => i.id === userStats.equippedFurniture.corner);
                  const customStyle = item?.roomStyle;
                  return (
                    <div
                      className={`absolute flex items-center justify-center ${customStyle ? "" : "bottom-[32%] right-[12%] w-18 h-18"} z-20`}
                      style={customStyle as React.CSSProperties}
                    >
                      <img
                        src={item?.imageUrl || ""}
                        alt="Corner Furniture"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  );
                })()}

                {/* FLOOR FURNITURE */}
                {userStats.equippedFurniture?.floor && (() => {
                  const item = allItems.find((i) => i.id === userStats.equippedFurniture.floor);
                  const defaultStyle = { bottom: "16%", left: "28%", width: "36%", height: "24%" };
                  const customStyle = item?.roomStyle || defaultStyle;
                  return (
                    <div
                      className="absolute z-20 flex items-center justify-center"
                      style={customStyle as React.CSSProperties}
                    >
                      <img
                        src={getFurnitureImg(userStats.equippedFurniture.floor, allItems)}
                        alt="Floor Furniture"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  );
                })()}

                {/* MASCOT COMPANION SHIBA (with Equipment Layers & Click/Chew/Pet Interaction) */}
                <motion.div
                  onClick={handleShibaClick}
                  animate={
                    shibaActionState === "chewing"
                      ? { scaleY: [1, 0.86, 1.05, 0.9, 1], scaleX: [1, 1.14, 0.95, 1.1, 1] }
                      : shibaActionState === "happy"
                        ? { y: [0, -16, 0, -8, 0], rotate: [0, -6, 6, -3, 0] }
                        : isSleeping
                          ? { rotate: 90, y: 15, scale: 0.92 }
                          : { y: 0, rotate: 0 }
                  }
                  transition={
                    shibaActionState === "chewing"
                      ? { repeat: Infinity, duration: 0.55 }
                      : shibaActionState === "happy"
                        ? { duration: 0.75, ease: "easeInOut" }
                        : { type: "spring", stiffness: 200 }
                  }
                  className={`absolute z-25 cursor-pointer pointer-events-auto select-none ${isSleeping ? "brightness-75" : ""}`}
                  style={shibaMascot.style}
                >
                  <ShibaAvatar
                    equippedSlots={userStats.equippedSlots}
                    sizeClassName="w-full aspect-square"
                  />
                  {shibaActionState === "happy" && (
                    <>
                      <div className="absolute top-[52%] left-[28%] w-4 h-2 bg-[#FF7096]/60 rounded-full blur-[1px] animate-pulse" />
                      <div className="absolute top-[52%] right-[28%] w-4 h-2 bg-[#FF7096]/60 rounded-full blur-[1px] animate-pulse" />
                    </>
                  )}
                </motion.div>

                {/* SPEECH BUBBLE */}
                <AnimatePresence>
                  {speechBubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute z-30 bg-white/95 border-2 border-[#8C6D58] px-2.5 py-1 rounded-2xl shadow-md text-[9px] font-black text-[#5C3E21] max-w-[110px] text-center"
                      style={{
                        bottom: `calc(${shibaMascot.style?.bottom || "32%"} + ${shibaMascot.style?.width || "28%"} - 3%)`,
                        left: `calc(${shibaMascot.style?.left || "47%"} - 4%)`,
                      }}
                    >
                      {speechBubble}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-[#8C6D58] rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* floating hearts */}
                {heartsEffect.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.8 }}
                    animate={{
                      opacity: 0,
                      x: heart.x + (Math.random() * 12 - 6),
                      y: heart.y - 60,
                      scale: 1.3,
                    }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="absolute z-30 pointer-events-none text-red-400 text-sm select-none"
                    style={{
                      bottom: `calc(${shibaMascot.style?.bottom || "32%"} + 12%)`,
                      left: `calc(${shibaMascot.style?.left || "47%"} + 10%)`,
                    }}
                  >
                    ❤️
                  </motion.div>
                ))}

                {/* sleeping zzz */}
                {isSleeping && (
                  <div
                    className="absolute z-30 pointer-events-none select-none text-[#A9DEF9] font-black text-[10px]"
                    style={{
                      bottom: `calc(${shibaMascot.style?.bottom || "32%"} + 15%)`,
                      left: `calc(${shibaMascot.style?.left || "47%"} + 14%)`,
                    }}
                  >
                    <motion.span
                      animate={{ y: [0, -32], x: [0, -8, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: 0 }}
                      className="absolute"
                    >
                      Zzz...
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -42], x: [0, 8, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.7, repeat: Infinity, delay: 0.9 }}
                      className="absolute text-[8px] ml-4 mt-1"
                    >
                      zZz
                    </motion.span>
                  </div>
                )}

                {/* Night overlay */}
                {isSleeping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    className="absolute inset-0 bg-indigo-950/60 pointer-events-none z-22"
                  />
                )}

                {/* BONE FLOATING HARVEST DIALOG */}
                {pendingBones > 0 && (
                  <motion.button
                    onClick={handleHarvest}
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[65%] right-[22%] z-20 bg-gradient-to-br from-[#FFF8EE] to-[#FFE7C6] border-4 border-[#FBC579] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg active:scale-95 transition-all text-[#C85A28] font-bold text-sm cursor-pointer"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    <span>🦴</span>
                    <span>+{pendingBones}</span>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="outdoor"
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full h-full absolute inset-0 overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('/images/backgrounds/zen_garden_bg_pastel.png')" }}
              >
                {/* OUTDOOR FURNITURE HOOKUPS */}
                {Object.values(userStats.equippedFurniture || {}).map((itemId: any) => {
                  if (!itemId) return null;
                  const item = allItems.find((i) => i.id === itemId);
                  if (!item || !item.gardenStyle) return null;

                  return (
                    <div
                      key={`garden-${item.id}`}
                      className="absolute z-20 flex flex-col items-center justify-end"
                      style={item.gardenStyle as React.CSSProperties}
                    >
                      {item.pedestalType === "hanger" && (
                        <div className="w-0.5 h-6 bg-[#3E2723]" />
                      )}
                      {item.pedestalType === "stone" && (
                        <div className="w-8 h-2 bg-[#9E9E9E] rounded-md border border-[#757575] shadow-xs" />
                      )}
                      {item.pedestalType === "wood" && (
                        <div className="w-8 h-2.5 bg-[#8D6E63] rounded-sm border border-[#5D4037] shadow-xs" />
                      )}
                      <img
                        src={item.imageUrl}
                        alt={`Outdoor ${item.name}`}
                        className="object-contain"
                        style={item.gardenImgStyle as React.CSSProperties}
                      />
                    </div>
                  );
                })}

                {/* Shiba standing in the garden (with Equipment Layers & Click/Chew/Pet Interaction) */}
                <motion.div
                  onClick={handleShibaClick}
                  animate={
                    shibaActionState === "chewing"
                      ? { scaleY: [1, 0.86, 1.05, 0.9, 1], scaleX: [1, 1.14, 0.95, 1.1, 1] }
                      : shibaActionState === "happy"
                        ? { y: [0, -16, 0, -8, 0], rotate: [0, -6, 6, -3, 0] }
                        : isSleeping
                          ? { rotate: 90, y: 15, scale: 0.92 }
                          : { y: 0, rotate: 0 }
                  }
                  transition={
                    shibaActionState === "chewing"
                      ? { repeat: Infinity, duration: 0.55 }
                      : shibaActionState === "happy"
                        ? { duration: 0.75, ease: "easeInOut" }
                        : { type: "spring", stiffness: 200 }
                  }
                  className={`absolute z-25 cursor-pointer pointer-events-auto select-none ${isSleeping ? "brightness-75" : ""}`}
                  style={shibaMascot.style}
                >
                  <ShibaAvatar
                    equippedSlots={userStats.equippedSlots}
                    sizeClassName="w-full aspect-square"
                  />
                  {shibaActionState === "happy" && (
                    <>
                      <div className="absolute top-[52%] left-[28%] w-4 h-2 bg-[#FF7096]/60 rounded-full blur-[1px] animate-pulse" />
                      <div className="absolute top-[52%] right-[28%] w-4 h-2 bg-[#FF7096]/60 rounded-full blur-[1px] animate-pulse" />
                    </>
                  )}
                </motion.div>

                {/* SPEECH BUBBLE IN GARDEN */}
                <AnimatePresence>
                  {speechBubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute z-30 bg-white/95 border-2 border-[#8C6D58] px-2.5 py-1 rounded-2xl shadow-md text-[9px] font-black text-[#5C3E21] max-w-[110px] text-center"
                      style={{
                        bottom: `calc(${shibaMascot.style?.bottom || "15%"} + ${shibaMascot.style?.width || "22%"} - 3%)`,
                        ...(shibaMascot.style?.left
                          ? { left: `calc(${shibaMascot.style.left} - 4%)` }
                          : { right: `calc(${shibaMascot.style.right} + 4%)` }),
                      }}
                    >
                      {speechBubble}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-[#8C6D58] rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* floating hearts in garden */}
                {heartsEffect.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.8 }}
                    animate={{
                      opacity: 0,
                      x: heart.x + (Math.random() * 12 - 6),
                      y: heart.y - 60,
                      scale: 1.3,
                    }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="absolute z-30 pointer-events-none text-red-400 text-sm select-none"
                    style={{
                      bottom: `calc(${shibaMascot.style?.bottom || "15%"} + 12%)`,
                      ...(shibaMascot.style?.left
                        ? { left: `calc(${shibaMascot.style.left} + 10%)` }
                        : { right: `calc(${shibaMascot.style.right} + 10%)` }),
                    }}
                  >
                    ❤️
                  </motion.div>
                ))}

                {/* sleeping zzz in garden */}
                {isSleeping && (
                  <div
                    className="absolute z-30 pointer-events-none select-none text-[#A9DEF9] font-black text-[10px]"
                    style={{
                      bottom: `calc(${shibaMascot.style?.bottom || "15%"} + 15%)`,
                      ...(shibaMascot.style?.left
                        ? { left: `calc(${shibaMascot.style.left} + 14%)` }
                        : { right: `calc(${shibaMascot.style.right} + 14%)` }),
                    }}
                  >
                    <motion.span
                      animate={{ y: [0, -32], x: [0, -8, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: 0 }}
                      className="absolute"
                    >
                      Zzz...
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -42], x: [0, 8, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.7, repeat: Infinity, delay: 0.9 }}
                      className="absolute text-[8px] ml-4 mt-1"
                    >
                      zZz
                    </motion.span>
                  </div>
                )}

                {/* Night overlay in garden */}
                {isSleeping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    className="absolute inset-0 bg-indigo-950/60 pointer-events-none z-22"
                  />
                )}

                {/* BONE FLOATING HARVEST DIALOG IN GARDEN */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global floating bone particles animation */}
        {bonesEffect.map((bone) => (
          <motion.div
            key={bone.id}
            initial={{
              opacity: 1,
              left: "14%",
              bottom: "8%",
              scale: 1.3,
              rotate: 0,
            }}
            animate={{
              left: targetBonePos.left,
              bottom: targetBonePos.bottom,
              scale: 0.6,
              rotate: 360,
            }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            className="absolute z-50 pointer-events-none text-lg select-none"
          >
            🦴
          </motion.div>
        ))}

        {/* BOTTOM SHELF ACTION DOCK (COZY TOY RACK SHELF) */}
        <div
          className="w-full bg-[#E5C29B] border-t-4 border-[#C89C7E] px-4 pt-2.5 pb-3 flex justify-around items-center gap-2 relative z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] shrink-0"
          style={{
            backgroundImage: "linear-gradient(180deg, #E5C29B 0%, #D4AF8B 100%)",
          }}
        >
          {/* Action 1: Cho Ăn */}
          <button
            onClick={handleFeed}
            className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-white border-2 border-[#D4AF8B] flex items-center justify-center p-1 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <img src="/images/ui/shiba-room/actions/shiba_action_feed.png" alt="Cho Ăn" className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] font-black text-[#5C3E21]" style={{ fontFamily: "var(--font-cherry)" }}>Cho ăn</span>
          </button>

          {/* Action 2: Vuốt Ve */}
          <button
            onClick={handlePet}
            className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-white border-2 border-[#D4AF8B] flex items-center justify-center p-1 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <img src="/images/ui/shiba-room/actions/shiba_action_pet.png" alt="Vuốt Ve" className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] font-black text-[#5C3E21]" style={{ fontFamily: "var(--font-cherry)" }}>Vuốt ve</span>
          </button>

          {/* Action 3: Đi Ngủ */}
          <button
            onClick={handleToggleSleep}
            className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center p-1 shadow-inner group-hover:scale-105 transition-transform duration-200 ${isSleeping ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-[#D4AF8B]'}`}>
              <img src="/images/ui/shiba-room/actions/shiba_action_sleep.png" alt="Đi Ngủ" className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] font-black text-[#5C3E21]" style={{ fontFamily: "var(--font-cherry)" }}>{isSleeping ? 'Thức dậy' : 'Đi ngủ'}</span>
          </button>

          {/* Action 4: Túi Đồ */}
          <button
            onClick={() => {
              if (!user) {
                setIsLoginModalOpen(true);
              } else {
                setIsInventoryOpen(true);
              }
            }}
            className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-white border-2 border-[#D4AF8B] flex items-center justify-center p-1.5 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <img src="/images/ui/shiba-room/actions/shiba_action_bag.png" alt="Túi Đồ" className="w-full h-full object-contain" />
            </div>
            <span className="text-[9px] font-black text-[#5C3E21]" style={{ fontFamily: "var(--font-cherry)" }}>Túi đồ</span>
          </button>
        </div>

      </div>

      {/* RPG CHARACTER & INVENTORY MODAL */}
      <RpgInventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        userStats={userStats}
        shibaMascot={shibaMascot}
        totalBonesPerHour={totalBonesPerHour}
        baseStats={baseStats}
        statsBonus={statsBonus}
        totalHp={totalHp}
        totalAtk={totalAtk}
        totalDef={totalDef}
        totalCrit={totalCrit}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        showStatsBreakdown={showStatsBreakdown}
        setShowStatsBreakdown={setShowStatsBreakdown}
        modalSubTab={modalSubTab}
        setModalSubTab={setModalSubTab}
        filteredGridItems={filteredGridItems}
        isItemUnlocked={isItemUnlocked}
        isItemEquipped={isItemEquipped}
        handlePlayVoice={handlePlayVoice}
        handleSpeak={handleSpeak}
        equipFurniture={equipFurniture}
        equipTheme={equipTheme}
        equipItem={equipItem}
      />

      {/* POPUP ĐĂNG NHẬP GỖ CỰC CUTE (KHI CHƯA ĐĂNG NHẬP) */}
      <ShibaLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Căn Phòng Shiba"
        description="Căn phòng Shiba đang đợi cậu trang trí! Đăng nhập ngay để nhận nuôi chú Shiba cưng, quay Gacha nội thất và thu hoạch xương vàng nhé! 🐾🏠"
      />
    </div>
  );
}
