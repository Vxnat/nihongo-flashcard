"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import { useShibaRoom } from "@/hooks/shiba-room/useShibaRoom";
import { FurShopModal } from "./FurShopModal";
import { useAppStore } from "@/store/useAppStore";
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
    userStats: storeUserStats,
    equipFurniture,
    equipItem,
    equipTheme,
    isInventoryOpen,
    setIsInventoryOpen,
    activeTab,
    setActiveTab,
    selectedItem,
    setSelectedItem,
    pendingBones: storePendingBones,
    dragConstraints,
    showStatsBreakdown,
    setShowStatsBreakdown,
    modalSubTab,
    setModalSubTab,
    totalBonesPerHour: storeTotalBonesPerHour,
    handleHarvest: storeHandleHarvest,
    shibaMascot: storeShibaMascot,
    baseStats,
    statsBonus: storeStatsBonus,
    handleSpeak,
    handlePlayVoice,
    activeGridItems,
    isItemUnlocked,
    isItemEquipped,
    sakuraPetals,
  } = useShibaRoom();

  const user = useAppStore((state: any) => state.user);
  const [isShopOpen, setIsShopOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  // MOCK dữ liệu phòng mẫu nếu chưa đăng nhập
  const userStats = React.useMemo(() => {
    if (user) return storeUserStats;
    return {
      ...storeUserStats
    };
  }, [user, storeUserStats]);

  const totalBonesPerHour = user ? storeTotalBonesPerHour : 10; // (4 + 3 + 3)

  const [demoPendingBones, setDemoPendingBones] = React.useState(120);
  React.useEffect(() => {
    if (user) return;
    const interval = setInterval(() => {
      setDemoPendingBones((prev) => prev + 1);
    }, 4000); // Tăng 1 xương sau mỗi 4 giây
    return () => clearInterval(interval);
  }, [user]);

  const pendingBones = user ? storePendingBones : demoPendingBones;

  const filteredGridItems = React.useMemo(() => {
    return activeGridItems.filter((item) => {
      const unlocked = isItemUnlocked(item);
      const shardsCount = userStats.shards?.[item.id] || 0;
      return unlocked || shardsCount > 0;
    });
  }, [activeGridItems, isItemUnlocked, userStats.shards]);

  const shibaMascot = React.useMemo(() => {
    if (user) return storeShibaMascot;
    return {
      gif: "/images/mascot/shiba_room.gif",
      style: { bottom: "32%", left: "54%", width: "24%" },
    };
  }, [user, storeShibaMascot]);

  const statsBonus = React.useMemo(() => {
    if (user) return storeStatsBonus;
    return { hp: 30, atk: 55, def: 25, crit: 10 };
  }, [user, storeStatsBonus]);

  const totalHp = baseStats.hp + statsBonus.hp;
  const totalAtk = baseStats.atk + statsBonus.atk;
  const totalDef = baseStats.def + statsBonus.def;
  const totalCrit = baseStats.crit + statsBonus.crit;

  const handleHarvest = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      storeHandleHarvest();
    }
  };

  if (!isMetadataLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/50 p-6 text-center" style={{ fontFamily: "var(--font-rounded)" }}>
        <div className="w-12 h-12 border-4 border-[#8C6D58] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#8C6D58] font-black text-xs uppercase tracking-wider">Đang kết nối Shiba Town...</p>
        <p className="text-zinc-400 text-[10px] mt-1 font-bold">Vui lòng đảm bảo kết nối mạng ổn định.</p>
      </div>
    );
  }

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
            style={{ backgroundImage: "url('/images/backgrounds/washitsu_bg.png')" }}
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

            {/* MASCOT COMPANION SHIBA (with Equipment Layers) */}
            <div className="absolute z-20 pointer-events-none" style={shibaMascot.style}>
              <ShibaAvatar
                equippedSlots={userStats.equippedSlots}
                sizeClassName="w-full aspect-square"
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
            style={{ backgroundImage: "url('/images/backgrounds/zen_garden_bg.png')" }}
          >

            {/* OUTDOOR FURNITURE HOOKUPS (Rendered dynamically based on gardenStyle in GACHA_POOL) */}
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
                  {/* Hanger rope for wall lantern */}
                  {item.pedestalType === "hanger" && (
                    <div className="w-0.5 h-6 bg-[#3E2723]" />
                  )}
                  {/* Stone Pedestal */}
                  {item.pedestalType === "stone" && (
                    <div className="w-8 h-2 bg-[#9E9E9E] rounded-md border border-[#757575] shadow-xs" />
                  )}
                  {/* Wood Pedestal */}
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

            {/* Shiba standing in the garden (with Equipment Layers) */}
            <div className="absolute z-20 pointer-events-none bottom-[12%] right-[15%] w-[26%]">
              <ShibaAvatar
                equippedSlots={userStats.equippedSlots}
                sizeClassName="w-full aspect-square"
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
        onClick={() => {
          if (!user) {
            setIsLoginModalOpen(true);
          } else {
            setIsInventoryOpen(true);
          }
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[45] bg-[#8C6D58] hover:bg-[#735948] text-white flex flex-col items-center justify-center gap-1 w-11 h-24 rounded-l-2xl border-l-2 border-t-2 border-b-2 border-white/20 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.25),-4px_4px_12px_rgba(0,0,0,0.2)] active:translate-x-1 transition-all cursor-pointer group touch-none"
      >
        <img
          src="/images/ui/shiba-room/rpg_backpack.png"
          alt="Túi đồ"
          className="w-7 h-7 object-contain group-hover:scale-110 transition-transform pointer-events-none select-none"
        />
      </motion.button>

      {/* FLOATING SHOP TAB ON RIGHT SCREEN EDGE */}
      <button
        onClick={() => {
          if (!user) {
            setIsLoginModalOpen(true);
          } else {
            setIsShopOpen(true);
          }
        }}
        className="fixed right-0 top-1/2 translate-y-16 z-[45] bg-[#D4AF37] hover:bg-[#b09028] text-white flex flex-col items-center justify-center gap-1 w-11 h-14 rounded-l-2xl border-l-2 border-t-2 border-b-2 border-white/20 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.25),-4px_4px_12px_rgba(0,0,0,0.2)] active:translate-x-1 transition-all cursor-pointer group"
      >
        <img
          src="/images/ui/shiba-room/rpg_shop_lantern.png"
          alt="Cửa tiệm"
          className="w-7 h-7 object-contain group-hover:scale-110 transition-transform pointer-events-none select-none"
        />
      </button>

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
      <FurShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />

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
