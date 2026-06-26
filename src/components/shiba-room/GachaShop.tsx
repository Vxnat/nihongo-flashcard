"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bone, Heart, Star, Info, X, Volume2 } from "lucide-react";
import { RARITY_CONFIG, GachaRarity } from "@/constants/gachaPool";
import { GachaMultiResultModal } from "./GachaMultiResultModal";
import { Badge } from "@/components/ui/badge";
import { useGachaShop } from "@/hooks/shiba-room/useGachaShop";
import { FurShopModal } from "./FurShopModal";
import { ShibaLoginCard } from "@/components/common/ShibaLoginCard";
import { playAudioUrl } from "@/utils/tts";
import Image from "next/image";

// Capsule nhựa 2 màu kiểu gachapon thật: pastel mềm mại ngọt ngào
const EGG_COLORS = [
  { top: "#FFCAD4", bottom: "#FFE5EC" }, // Hồng phấn
  { top: "#A9DEF9", bottom: "#E4F2F7" }, // Xanh pastel
  { top: "#D6C7FF", bottom: "#F1EBFF" }, // Tím nhạt
  { top: "#FFE5D9", bottom: "#FFF2E6" }, // Cam sữa
  { top: "#C1E7E3", bottom: "#E8F8F5" }, // Mint pastel
];

// Định nghĩa màu nắp/đáy cho quả trứng to lúc chờ mở (gachaState = anticipating) theo độ hiếm (pastel)
const CAPSULE_RARITY_COLORS: Record<GachaRarity, { top: string; bottom: string }> = {
  common: { top: "#E2E2E2", bottom: "#F0F0F0" },
  rare: { top: "#C1E7E3", bottom: "#E8F8F5" },
  epic: { top: "#D6C7FF", bottom: "#F1EBFF" },
  legendary: { top: "#FFE5D9", bottom: "#FFF2E6" },
  mythic: { top: "#FFCAD4", bottom: "#FFE5EC" },
  divine: { top: "#F48FB1", bottom: "#FCE4EC" },
};

export function GachaShop() {
  const {
    userStats,
    user,
    sceneRef,
    capsulesRef,
    gachaState,
    setGachaState,
    twistType,
    setTwistType,
    rewardData,
    setRewardData,
    multiRewardData,
    setMultiRewardData,
    isShaking,
    isInfoOpen,
    setIsInfoOpen,
    handleOpenGacha,
    handleTwist,
    handleMultiRoll,
    DUMMY_CAPSULES,
  } = useGachaShop();

  const [isShopOpen, setIsShopOpen] = React.useState(false);
  const [isCardHovered, setIsCardHovered] = React.useState(false);
  const [isHoveringSpin, setIsHoveringSpin] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Hiệu ứng âm thanh tự động tương ứng trạng thái
  React.useEffect(() => {
    if (gachaState === "twisting") {
      playAudioUrl("/sounds/brush.mp3");
    } else if (gachaState === "anticipating") {
      playAudioUrl("/sounds/bonk.mp3");
    } else if (gachaState === "opened") {
      playAudioUrl("/sounds/success.mp3");
    }
  }, [gachaState]);

  return (
    <div className="w-full flex flex-col items-center pb-10 relative">
      {/* Lớp nền mờ ảo của GachaShop */}
      <div
        className={`w-full flex flex-col items-center transition-all duration-700 ${!user
          ? `blur-[7px] opacity-35 scale-[0.98] pointer-events-none select-none ${isCardHovered ? 'blur-[4px] opacity-55 scale-[0.99]' : ''}`
          : ''
          }`}
      >
        {/* THANH HIỂN THỊ TÀI SẢN (XƯƠNG & SHIBA COIN) */}
        <div className="w-full max-w-sm flex items-center gap-4 mb-8 px-4 relative z-10">
          {/* Hộp hiển thị Xương */}
          <div className="flex-1 bg-gradient-to-r from-white to-[#FFF5F7] border border-pink-100/90 pl-2.5 pr-4 py-2 rounded-2xl shadow-[0_4px_16px_rgba(255,112,150,0.06)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shadow-inner shrink-0">
              <Bone size={18} className="text-[#FF7096] fill-[#FF7096] rotate-45 transform scale-110" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-pink-400 text-[9px] uppercase tracking-wider leading-none mb-1"
                style={{ fontFamily: "var(--font-cherry)" }}
              >Xương</span>
              <span className="font-black text-pink-600 text-base leading-none" style={{ fontFamily: "var(--font-cherry)" }}>
                {user ? userStats.coins : "?"}
              </span>
            </div>
          </div>

          {/* Hộp hiển thị Shiba Coin */}
          <div className="flex-1 bg-gradient-to-r from-white to-[#FFFDF5] border border-amber-100/90 pl-2.5 pr-4 py-2 rounded-2xl shadow-[0_4px_16px_rgba(245,158,11,0.06)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shadow-inner shrink-0">
              <Image src="/images/ui/shiba-room/golden_shiba_coin.png" alt="Shiba Coin" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-amber-500 text-[9px] uppercase tracking-wider leading-none mb-1"
                style={{ fontFamily: "var(--font-cherry)" }}
              >Shiba Coin</span>
              <span className="font-black text-amber-700 text-base leading-none" style={{ fontFamily: "var(--font-cherry)" }}>
                {user ? userStats.goldenFur || 0 : "?"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================
          GIANT CUTE SHIBA GACHA MACHINE
         ========================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isShaking ? { opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] } : { opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm flex flex-col items-center relative"
        >
          {/* NÚT CỬA TIỆM SHIBA COIN */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="absolute top-8 right-0 sm:-right-2 z-50 w-10 h-10 bg-gradient-to-br from-[#FFF8EE] to-[#FFE7C6] border-4 border-[#FBC579]/40 rounded-full flex items-center justify-center text-[#C85A28] hover:text-[#7A3E18] hover:from-[#FFE7C6] hover:to-[#FBC579] shadow-sm active:translate-y-1 transition-all outline-none animate-bounce"
            style={{ animationDuration: "3s" }}
            title="Tiệm Kỳ Trân Shiba"
          >
            <img
              src="/images/ui/shiba-room/rpg_shop_lantern.png"
              alt="Cửa tiệm"
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform pointer-events-none select-none"
            />
          </button>

          {/* NÚT THÔNG TIN TỶ LỆ [ i ] */}
          <button
            onClick={() => setIsInfoOpen(true)}
            className="absolute top-20 right-0 sm:-right-2 z-50 w-10 h-10 bg-gradient-to-br from-[#FFF8EE] to-[#FFE7C6] border-4 border-[#FBC579]/40 rounded-full flex items-center justify-center text-[#C85A28] hover:text-[#7A3E18] hover:from-[#FFE7C6] hover:to-[#FBC579] shadow-sm active:translate-y-1 transition-all outline-none"
            title="Thông tin tỷ lệ rớt"
          >
            <Info size={20} strokeWidth={3} />
          </button>


          {/* --- ANIME SHIBA HEAD --- */}
          <div className="relative w-full z-10 flex flex-col items-center">
            {/* Chỏm lông ahoge kiểu anime thay cho nơ (pastel) */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex items-end gap-[3px]">
              <div className="w-2.5 h-8 rounded-full -rotate-[16deg] border-2 border-white" style={{ background: "linear-gradient(to top, #FFAAA6, #FFD5B4)" }} />
              <div className="w-3 h-11 rounded-full -translate-y-1.5 border-2 border-white" style={{ background: "linear-gradient(to top, #FFAAA6, #FFD5B4)" }} />
              <div className="w-2.5 h-8 rounded-full rotate-[16deg] border-2 border-white" style={{ background: "linear-gradient(to top, #FFAAA6, #FFD5B4)" }} />
            </div>

            {/* Tai - chuyển động vẫy tai linh hoạt khi hover hoặc đang quay */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-72 h-28 z-10">
              <motion.div
                animate={
                  gachaState === "twisting"
                    ? { rotate: [-24, -28, -18, -26, -24] }
                    : isHoveringSpin
                      ? { rotate: [-18, -28, -18, -28, -24] }
                      : { rotate: -24 }
                }
                whileHover={{ rotate: -18 }}
                transition={{
                  repeat: gachaState === "twisting" || isHoveringSpin ? Infinity : 0,
                  repeatType: "mirror",
                  duration: 0.5,
                }}
                className="absolute left-5 top-1 w-[5rem] h-24 rounded-t-[3rem] rounded-b-xl border-4 border-white shadow-md overflow-hidden origin-bottom-right"
                style={{ background: "linear-gradient(160deg, #FFD5B4 0%, #FFAAA6 60%, #E8A598 100%)" }}
              >
                <div className="absolute bottom-0 w-full h-[45%] bg-gradient-to-t from-[#FFF9F2] to-[#FFF8EE] border-t-2 border-white/70" />
                <div className="absolute top-1 left-3 w-8 h-5 bg-white/40 rounded-full rotate-[-30deg] blur-[2px]" />
              </motion.div>
              <motion.div
                animate={
                  gachaState === "twisting"
                    ? { rotate: [24, 20, 30, 22, 24] }
                    : isHoveringSpin
                      ? { rotate: [18, 28, 18, 28, 24] }
                      : { rotate: 24 }
                }
                whileHover={{ rotate: 18 }}
                transition={{
                  repeat: gachaState === "twisting" || isHoveringSpin ? Infinity : 0,
                  repeatType: "mirror",
                  duration: 0.5,
                }}
                className="absolute right-5 top-1 w-[5rem] h-24 rounded-t-[3rem] rounded-b-xl rotate-[24deg] border-4 border-white shadow-md overflow-hidden origin-bottom-left"
                style={{ background: "linear-gradient(200deg, #FFD5B4 0%, #FFAAA6 60%, #E8A598 100%)" }}
              >
                <div className="absolute bottom-0 w-full h-[45%] bg-gradient-to-t from-[#FFF9F2] to-[#FFF8EE] border-t-2 border-white/70" />
                <div className="absolute top-1 right-3 w-8 h-5 bg-white/40 rounded-full rotate-[30deg] blur-[2px]" />
              </motion.div>
            </div>

            {/* Mặt - màu pastel đào mềm mại + cằm lông mịn màng */}
            <div
              className="relative w-64 h-40 rounded-t-[4rem] rounded-b-[2rem] border-4 border-white shadow-lg flex flex-col items-center pt-11 overflow-hidden"
              style={{ background: "radial-gradient(circle at 35% 25%, #FFEADB 0%, #FFD5B4 50%, #FFAAA6 100%)" }}
            >
              {/* Lông cằm pastel */}
              <div className="absolute -bottom-3 left-2 right-2 h-6 flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-[#FFAAA6]" />
                ))}
              </div>

              {/* Má hồng hào rõ rệt */}
              <div className="absolute top-[4.3rem] left-6 w-9 h-7 bg-[#FFB7B2]/75 rounded-full blur-[2px]" />
              <div className="absolute top-[4.3rem] right-6 w-9 h-7 bg-[#FFB7B2]/75 rounded-full blur-[2px]" />

              {/* Hàng chân mày tinh nghịch */}
              <div className="flex gap-[3.1rem] -mb-1 relative z-10">
                <div className="w-4 h-[3px] rounded-full bg-[#7A3E18]/60 -rotate-[10deg]" />
                <div className="w-4 h-[3px] rounded-full bg-[#7A3E18]/60 rotate-[10deg]" />
              </div>

              {/* Mắt anime động: nhắm mắt tít cười hạnh phúc khi quay trứng, tròn xoe lung lanh khi rảnh */}
              <div className="flex gap-12 mt-1.5 relative z-10 h-8 items-center">
                {gachaState === "twisting" || gachaState === "anticipating" ? (
                  <>
                    {/* Mắt cười híp trái */}
                    <svg width="32" height="24" viewBox="0 0 32 24" className="drop-shadow-sm">
                      <path d="M 4,16 Q 16,4 28,16" fill="none" stroke="#7A3E18" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                    {/* Mắt cười híp phải */}
                    <svg width="32" height="24" viewBox="0 0 32 24" className="drop-shadow-sm">
                      <path d="M 4,16 Q 16,4 28,16" fill="none" stroke="#7A3E18" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                  </>
                ) : (
                  <>
                    {/* Mắt tròn lung linh trái */}
                    <svg width="32" height="32" viewBox="0 0 34 34" className="drop-shadow-sm">
                      <defs>
                        <linearGradient id="irisL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7A3E18" />
                          <stop offset="100%" stopColor="#3A2614" />
                        </linearGradient>
                      </defs>
                      <path d="M2 18 C2 8 12 2 17 2 C22 2 32 8 32 18 C32 26 22 30 17 30 C12 30 2 26 2 18 Z" fill="url(#irisL)" stroke="#fff" strokeWidth="2" />
                      <circle cx="13" cy="14" r="4.5" fill="#fff" opacity="0.95" />
                      <circle cx="22" cy="22" r="2.2" fill="#fff" opacity="0.8" />
                    </svg>
                    {/* Mắt tròn lung linh phải */}
                    <svg width="32" height="32" viewBox="0 0 34 34" className="drop-shadow-sm">
                      <defs>
                        <linearGradient id="irisR" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7A3E18" />
                          <stop offset="100%" stopColor="#3A2614" />
                        </linearGradient>
                      </defs>
                      <path d="M2 18 C2 8 12 2 17 2 C22 2 32 8 32 18 C32 26 22 30 17 30 C12 30 2 26 2 18 Z" fill="url(#irisR)" stroke="#fff" strokeWidth="2" />
                      <circle cx="13" cy="14" r="4.5" fill="#fff" opacity="0.95" />
                      <circle cx="22" cy="22" r="2.2" fill="#fff" opacity="0.8" />
                    </svg>
                  </>
                )}
              </div>

              {/* Mõm cười nhẹ nhàng */}
              <div
                className="mt-3 w-24 h-13 rounded-t-full rounded-b-2xl border-4 border-white flex justify-center shadow-inner relative"
                style={{ background: "linear-gradient(180deg, #FFFDF9 0%, #FFEADB 100%)" }}
              >
                <div className="w-6 h-3.5 rounded-b-full mt-1 relative" style={{ background: "linear-gradient(135deg, #7A3E18, #3A2614)" }}>
                  <div className="absolute top-0.5 left-1 w-1.5 h-1 bg-white/70 rounded-full" />
                </div>
                <div className="absolute -bottom-1 flex items-center gap-0.5">
                  <div className="w-2 h-2 border-b-2 border-[#FFAAA6]/90 rounded-full rotate-[20deg]" />
                  <div className="w-2 h-2 border-b-2 border-[#FFAAA6]/90 rounded-full -rotate-[20deg]" />
                </div>
              </div>
            </div>
          </div>

          {/* --- VÒNG CỔ DA & MẶT DÂY CHUYỀN CHUÔNG (màu pastel đào đỏ) --- */}
          <div className="relative z-40 flex flex-col items-center -mt-5">
            <div
              className="relative w-72 h-12 rounded-full border-4 border-white shadow-md flex justify-center items-center gap-2 px-4 overflow-hidden"
              style={{ background: "linear-gradient(180deg, #FFAAA6 0%, #E8A598 100%)" }}
            >
              {/* Đường chỉ may vòng cổ */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/40" />
              {/* Đinh tán */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FFE7C6] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]" />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FFE7C6] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]" />

              <Heart size={18} className="text-[#FFEADB] fill-[#FFEADB] animate-pulse relative z-10" />
              <div className="h-[4.5rem] flex-grow" />
              <Heart size={18} className="text-[#FFEADB] fill-[#FFEADB] animate-pulse relative z-10" />
            </div>

            {/* Chuông vàng kêu đung đưa */}
            <motion.div
              className="absolute top-9 w-7 h-7 rounded-full bg-gradient-to-br from-[#FFE5A3] to-[#FFC340] border-2 border-white shadow-md flex items-center justify-center z-30"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "top center" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#7A3E18]" />
            </motion.div>
          </div>

          {/* --- THÂN BỤNG (MÁI KÍNH TRONG SUỐT) --- */}
          <div
            className="relative z-20 p-3.5 rounded-full border-4 border-white shadow-lg -mt-5"
            style={{ background: "linear-gradient(160deg, #FFF0ED 0%, #FFD2CC 100%)" }}
          >
            {/* Đinh vít trang trí kiểu máy thật */}
            <div className="absolute top-2 left-6 w-2.5 h-2.5 rounded-full bg-white/70 shadow-inner" />
            <div className="absolute top-2 right-6 w-2.5 h-2.5 rounded-full bg-white/70 shadow-inner" />
            <div className="absolute bottom-2 left-6 w-2.5 h-2.5 rounded-full bg-white/70 shadow-inner" />
            <div className="absolute bottom-2 right-6 w-2.5 h-2.5 rounded-full bg-white/70 shadow-inner" />

            <div
              ref={sceneRef}
              className="w-72 h-72 rounded-full border-[10px] border-[#FFF8F2] relative overflow-hidden touch-none"
              style={{
                background:
                  "linear-gradient(165deg, rgba(255,255,255,0.6) 0%, rgba(187,222,255,0.2) 55%, rgba(255,255,255,0.35) 100%)",
                boxShadow: "inset 0 0 30px rgba(255,170,166,0.35), inset 0 -10px 25px rgba(0,0,0,0.06)",
                backdropFilter: "blur(6px)",
              }}
            >
              {/* Ánh sáng kính phản chiếu - 2 vệt cho cảm giác kính thật */}
              <div className="absolute top-4 left-8 w-32 h-14 bg-white/70 rounded-full rotate-[-35deg] blur-[4px] pointer-events-none z-10" />
              <div className="absolute top-12 right-10 w-12 h-24 bg-white/40 rounded-full rotate-[20deg] blur-[5px] pointer-events-none z-10" />
              {/* Sắc xanh nhạt hắt từ trên xuống như kính thật */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-100/20 to-transparent pointer-events-none z-10" />

              {/* Hạt lấp lánh (Sparkle Particles) bay lượn bên trong lồng kính */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-300/80"
                    style={{
                      top: `${15 + i * 16}%`,
                      left: `${10 + (i * 23) % 80}%`,
                    }}
                    animate={{
                      scale: [0.6, 1.2, 0.6],
                      opacity: [0.2, 0.8, 0.2],
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  >
                    <Star size={i % 2 === 0 ? 12 : 8} fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              {/* Trứng Gacha Dễ thương bóng bẩy nổi khối 3D */}
              {DUMMY_CAPSULES.map((item, idx) => {
                const { top, bottom } = EGG_COLORS[idx % EGG_COLORS.length];
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      capsulesRef.current[item.id] = el;
                    }}
                    className="absolute top-0 left-0 w-11 h-11 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform border border-white/70 overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom, ${top} 0%, ${top} 48%, ${bottom} 52%, ${bottom} 100%)`,
                      boxShadow: "inset -2px -2px 6px rgba(0,0,0,0.15), inset 3px 3px 6px rgba(255,255,255,0.6), 0 3px 6px rgba(0,0,0,0.12)",
                    }}
                  >
                    {/* Shadow hình cầu tạo độ nổi 3D */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_30%,rgba(0,0,0,0.14)_80%)] pointer-events-none z-10" />
                    {/* Đường rãnh nắp trứng */}
                    <div className="absolute left-0 w-full h-[2px] bg-black/15 top-1/2 -translate-y-1/2" />
                    {/* Điểm bóng sáng */}
                    <div className="absolute top-1.5 left-2 w-4 h-2 bg-white/70 rounded-full rotate-[-35deg] blur-[0.5px]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- BỆ MÁY (CHÂN ĐẾ & KHE RA TRỨNG) --- */}
          <div
            className="w-[19rem] border-4 border-white rounded-t-[4rem] rounded-b-[3rem] shadow-lg p-5 pt-16 -mt-14 relative z-10 flex flex-col items-center"
            style={{ background: "linear-gradient(180deg, #FFCCD5 0%, #FFB3C1 60%, #FF85A1 100%)" }}
          >
            {/* Ánh sáng nhựa bóng phía trên bệ máy */}
            <div className="absolute top-0 left-0 w-full h-20 bg-white/15 blur-md pointer-events-none" />

            {/* =========================================
              KHU VỰC NÚT BẤM QUAY GACHA (x1 và x10)
            ========================================= */}
            <div className="w-full flex items-center justify-center gap-3 mb-6 relative z-10">
              {/* Nút Quay x1 */}
              <motion.button
                disabled={gachaState !== "idle" || !user || userStats.coins < 10}
                onClick={() => {
                  playAudioUrl("/sounds/coin.mp3");
                  handleTwist();
                }}
                onMouseEnter={() => setIsHoveringSpin(true)}
                onMouseLeave={() => setIsHoveringSpin(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex-1 h-14 bg-[#FFFDF9] hover:bg-[#FFF8EE] rounded-2xl border-b-4 border-[#FFAAA6] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0"
              >
                <span className="font-bold text-[#E8A598] text-sm" style={{ fontFamily: "var(--font-cherry)" }}>Quay x1</span>
                <span className="font-bold text-xs text-[#FFAAA6] flex items-center gap-1">10 <Bone size={12} /></span>
              </motion.button>

              {/* Nút Quay x10 */}
              <motion.button
                disabled={gachaState !== "idle" || !user || userStats.coins < 90}
                onClick={() => {
                  playAudioUrl("/sounds/coin.mp3");
                  handleMultiRoll(10);
                }}
                onMouseEnter={() => setIsHoveringSpin(true)}
                onMouseLeave={() => setIsHoveringSpin(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex-1 h-14 bg-gradient-to-br from-[#FFE3E8] to-[#FF85A1] rounded-2xl border-b-4 border-[#FF5C8A] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0"
              >
                <span className="font-bold text-white text-sm drop-shadow-sm" style={{ fontFamily: "var(--font-cherry)" }}>Quay x10</span>
                <span className="font-bold text-xs text-white/90 bg-black/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  90 <Bone size={12} />
                  <span className="ml-1 bg-[#FF5C8A] text-white text-[8px] font-black px-1.5 rounded-full">
                    -10%
                  </span>
                </span>
              </motion.button>
            </div>

            {/* Dải phân cách */}
            <div className="w-full h-px bg-white/30 rounded-full mb-6 relative z-10" />

            {/* Khe rớt trứng - viền sáng kiểu khay nhựa máy thật (pastel) */}
            <div
              className="w-28 h-16 rounded-t-2xl rounded-b-3xl relative flex justify-center items-end pb-2 overflow-hidden border-4 border-[#FFFDF9] z-10"
              style={{
                background: "linear-gradient(180deg, #FFF9F2 0%, #FFEADB 100%)",
                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <div className="absolute top-0 w-full h-4 bg-white/50" />
              <AnimatePresence>
                {(gachaState === "twisting" || gachaState === "opened" || gachaState === "multi_opened") && (
                  <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.2 }}
                    className={`w-12 h-12 rounded-full shadow-md relative flex items-center justify-center border border-white/70 overflow-hidden ${twistType === 'multi' && gachaState === 'twisting' ? 'animate-pulse' : ''
                      }`}
                    style={{
                      background: twistType === 'multi'
                        ? "linear-gradient(to bottom, #FFCAD4 0%, #FFCAD4 48%, #A9DEF9 52%, #A9DEF9 100%)" // Pink-Blue pastel split for multi-roll
                        : "linear-gradient(to bottom, #FFE5D9 0%, #FFE5D9 48%, #FFF2E6 52%, #FFF2E6 100%)", // Peach-Cream pastel split for single-roll
                      boxShadow: "inset -2px -2px 6px rgba(0,0,0,0.15), inset 3px 3px 6px rgba(255,255,255,0.6), 0 3px 6px rgba(0,0,0,0.12)",
                    }}
                  >
                    {/* Shadow hình cầu tạo độ nổi 3D */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_30%,rgba(0,0,0,0.14)_80%)] pointer-events-none z-10" />
                    {/* Đường gờ giữa nắp - đáy */}
                    <div className="absolute left-0 w-full h-[2px] bg-black/15 top-1/2 -translate-y-1/2 z-10" />
                    {/* Ánh nhựa bóng */}
                    <div className="absolute top-1.5 left-2 w-4 h-2 bg-white/70 rounded-full rotate-[-35deg] blur-[0.5px] z-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* THÔNG TIN VÀ THANH BẢO HIỂM (PITY) */}
            <div className="relative z-10 w-full">
              <PityBar pityCounter={userStats?.pityCounter || 0} />
            </div>

            {/* Chân đế nhỏ kiểu đồ chơi thật */}
            <div className="absolute -bottom-3 left-10 w-10 h-6 rounded-b-2xl bg-[#FF8EAA] border-2 border-white shadow-md" />
            <div className="absolute -bottom-3 right-10 w-10 h-6 rounded-b-2xl bg-[#FF8EAA] border-2 border-white shadow-md" />
          </div>
        </motion.div>

        <GachaMultiResultModal
          isOpen={gachaState === "multi_opened"}
          results={multiRewardData}
          onClose={() => {
            setGachaState("idle");
            setMultiRewardData(null);
            setTwistType(null);
          }}
          onReRoll={() => handleMultiRoll(10)}
          userCoins={userStats?.coins || 0}
        />


        {/* POPUP THÔNG TIN TỶ LỆ */}
        {mounted && createPortal(
          <AnimatePresence>
            {isInfoOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
                onClick={() => setIsInfoOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-[#FFFDF5] border-4 border-[#FBC579] rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative cursor-default overflow-hidden"
                  style={{ fontFamily: "var(--font-cherry)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dải sáng holo lướt nhẹ qua khung */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
                      backgroundSize: "250% 250%",
                    }}
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />

                  <button
                    onClick={() => setIsInfoOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full transition-colors border-2 border-white shadow-sm z-20"
                  >
                    <X size={18} strokeWidth={3} className="pointer-events-none" />
                  </button>

                  <div className="text-center mb-6 relative z-10">
                    <motion.div
                      className="absolute -top-1 left-10 text-[#FFD166]"
                      animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 15, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4" fill="#FFD166" />
                    </motion.div>
                    <motion.div
                      className="absolute top-2 right-12 text-[#E8743B]"
                      animate={{ scale: [1.1, 0.7, 1.1], rotate: [0, -15, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                    >
                      <Star className="w-3 h-3" fill="#E8743B" />
                    </motion.div>
                    <h3
                      className="text-2xl text-[#C85A28] tracking-wide"
                      style={{ textShadow: "0 0 10px rgba(200,90,40,0.3), 0 2px 0 #fff" }}
                    >
                      Bảng Tỷ Lệ Rớt
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2 font-bold text-sm relative z-10">
                    <div className="flex justify-between items-center bg-zinc-100 px-4 py-2.5 rounded-2xl text-zinc-600 border border-zinc-200">
                      <span className="flex items-center gap-2"><span className="text-lg">⚪</span> Common</span>
                      <span className="text-base">{RARITY_CONFIG.common.dropRate}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-2xl text-blue-600 border border-blue-100">
                      <span className="flex items-center gap-2"><span className="text-lg">🔵</span> Rare</span>
                      <span className="text-base">{RARITY_CONFIG.rare.dropRate}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-purple-50 px-4 py-2.5 rounded-2xl text-purple-600 border border-purple-100">
                      <span className="flex items-center gap-2"><span className="text-lg">🟣</span> Epic</span>
                      <span className="text-base">{RARITY_CONFIG.epic.dropRate}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-yellow-50 px-4 py-2.5 rounded-2xl text-yellow-600 border border-yellow-200">
                      <span className="flex items-center gap-2"><span className="text-lg">🟡</span> Legendary</span>
                      <span className="text-base">{RARITY_CONFIG.legendary.dropRate}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-red-50 px-4 py-2.5 rounded-2xl text-red-500 border border-red-100">
                      <span className="flex items-center gap-2"><span className="text-lg">🔴</span> Mythic</span>
                      <span className="text-base">{RARITY_CONFIG.mythic.dropRate}%</span>
                    </div>
                    <div className="relative flex justify-between items-center px-4 py-2.5 rounded-2xl text-slate-700 border border-slate-200 shadow-inner overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(90deg, #FFD9DF, #FFF3C4, #D6EFFF, #FFD9DF)", backgroundSize: "300% 100%" }}
                        animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="flex items-center gap-2 relative z-10">🌈 Divine</span>
                      <span className="text-base relative z-10">{RARITY_CONFIG.divine.dropRate}%</span>
                    </div>
                  </div>

                  <div className="mt-5 p-3 bg-orange-50 border-2 border-orange-100 rounded-2xl text-center relative z-10">
                    <p className="text-[11px] font-bold text-orange-600 leading-relaxed">
                      * Vật phẩm bạn đã sở hữu sẽ tự động được phân rã thành <strong className="text-[#FF9F1C]">SHIBA COIN</strong> nhé!
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* POPUP PHẦN THƯỞNG */}
        {mounted && createPortal(
          <AnimatePresence>
            {/* TRẠNG THÁI CHỜ HỒI HỘP */}
            {gachaState === "anticipating" && rewardData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
                onClick={handleOpenGacha}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10, 10, 0] }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="relative flex flex-col items-center justify-center"
                >
                  {/* Tia sáng xoay phía sau theo màu độ hiếm */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full -z-10 pointer-events-none"
                    style={{
                      background: `repeating-conic-gradient(from 0deg, transparent 0deg, ${RARITY_CONFIG[rewardData.rarity].color}26 15deg, transparent 30deg)`,
                      maskImage: "radial-gradient(circle, black 20%, transparent 65%)",
                      WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 65%)",
                      filter: "blur(6px)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  />

                  <div className={`absolute inset-0 scale-150 blur-3xl opacity-60 rounded-full animate-pulse ${rewardData.rarity === "divine" ? "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" :
                    rewardData.rarity === "legendary" ? "bg-yellow-400" :
                      rewardData.rarity === "epic" ? "bg-purple-500" :
                        rewardData.rarity === "rare" ? "bg-blue-400" : "bg-white"
                    }`} />

                  {/* Sao lấp lánh bay quanh */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute text-white"
                      style={{ top: `${20 + i * 15}%`, left: i % 2 === 0 ? "5%" : "85%" }}
                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.1, 0.6] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <Star className="w-3 h-3" fill="white" />
                    </motion.div>
                  ))}

                  <div
                    className="w-28 h-28 rounded-full border-4 border-white relative z-10 flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom, ${CAPSULE_RARITY_COLORS[rewardData.rarity].top} 0%, ${CAPSULE_RARITY_COLORS[rewardData.rarity].top} 48%, ${CAPSULE_RARITY_COLORS[rewardData.rarity].bottom} 52%, ${CAPSULE_RARITY_COLORS[rewardData.rarity].bottom} 100%)`,
                      boxShadow:
                        rewardData.rarity === "divine" ? "inset -6px -8px 16px rgba(0,0,0,0.18), inset 4px 6px 8px rgba(255,255,255,0.5), 0 0 40px rgba(239,68,68,0.8)" :
                          rewardData.rarity === "legendary" ? "inset -6px -8px 16px rgba(0,0,0,0.18), inset 4px 6px 8px rgba(255,255,255,0.5), 0 0 40px rgba(250,204,21,0.8)" :
                            rewardData.rarity === "epic" ? "inset -6px -8px 16px rgba(0,0,0,0.18), inset 4px 6px 8px rgba(255,255,255,0.5), 0 0 40px rgba(168,85,247,0.8)" :
                              rewardData.rarity === "rare" ? "inset -6px -8px 16px rgba(0,0,0,0.18), inset 4px 6px 8px rgba(255,255,255,0.5), 0 0 40px rgba(59,130,246,0.8)" :
                                "inset -6px -8px 16px rgba(0,0,0,0.18), inset 4px 6px 8px rgba(255,255,255,0.5), 0 0 40px rgba(212,212,216,0.8)",
                    }}
                  >
                    {/* Đường gờ giữa nắp - đáy như capsule thật */}
                    <div className="w-full h-[3px] bg-black/15 absolute top-1/2 -translate-y-1/2 z-10" />
                    {/* Ánh nhựa bóng */}
                    <div className="absolute top-3 left-4 w-9 h-4 bg-white/60 rounded-full rotate-[-35deg] blur-[1px] z-10" />
                  </div>

                  <p className="mt-8 text-white/70 font-bold tracking-widest text-sm animate-pulse relative z-10">NHẤN ĐỂ MỞ</p>
                </motion.div>
              </motion.div>
            )}

            {/* TRẠNG THÁI HIỂN THỊ KẾT QUẢ */}
            {gachaState === "opened" && rewardData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{
                    scale: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 260, damping: 20 },
                  }}
                  className="bg-white border-4 rounded-[2.5rem] p-6 max-w-[300px] w-full text-center relative flex flex-col items-center overflow-hidden"
                  style={{
                    borderColor: RARITY_CONFIG[rewardData.rarity].color,
                    boxShadow: `0 0 30px ${RARITY_CONFIG[rewardData.rarity].glowColor}`,
                  }}
                >
                  {/* Dải sáng holo lướt qua thẻ */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.5) 48%, transparent 60%)",
                      backgroundSize: "250% 250%",
                    }}
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Khung góc kiểu thẻ bài */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: RARITY_CONFIG[rewardData.rarity].color }} />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: RARITY_CONFIG[rewardData.rarity].color }} />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: RARITY_CONFIG[rewardData.rarity].color }} />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: RARITY_CONFIG[rewardData.rarity].color }} />

                  <Star size={16} className="text-amber-400 fill-amber-400 absolute top-4 left-9 z-10" />
                  <Star size={16} className="text-pink-400 fill-pink-400 absolute bottom-12 right-10 z-10" />

                  <h3 className="text-2xl text-pink-700 mb-4 font-black tracking-wide relative z-10" style={{ fontFamily: "var(--font-cherry)" }}>
                    {rewardData.duplicateFur > 0 ? "BÙI NGÙI..." : rewardData.unlocked ? "CHÚC MỪNG!" : "TÍCH LŨY!"}
                  </h3>
                  <div className="w-32 h-32 mb-4 relative z-10">
                    <div className="w-full h-full bg-pink-50 rounded-full flex items-center justify-center border-4 border-pink-100 shadow-[inset_0_0_15px_rgba(248,187,208,0.4)] overflow-hidden relative">
                      {/* Tia sáng xoay phía sau cho item hiếm (epic+) */}
                      {rewardData.rarity !== "common" && rewardData.rarity !== "rare" && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                          <div
                            className="w-[180%] h-[180%]"
                            style={{ background: `repeating-conic-gradient(${RARITY_CONFIG[rewardData.rarity].color}33 0deg 10deg, transparent 10deg 20deg)` }}
                          />
                        </motion.div>
                      )}
                      {rewardData.item.type === "voice" ? (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="w-full h-full flex items-center justify-center text-[#C85A28] hover:text-[#7A3E18] active:scale-95 transition-all outline-none z-10 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (rewardData.item.audioUrl) {
                              const audio = new Audio(`${rewardData.item.audioUrl}`);
                              audio.volume = 0.6;
                              audio.play().catch((err) => console.warn("Failed to play preview voice:", err));
                            }
                          }}
                        >
                          <Volume2 size={48} className="animate-bounce" />
                        </motion.button>
                      ) : (
                        <motion.img
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          src={rewardData.item.imageUrl}
                          alt={rewardData.item.name}
                          className={`z-10 ${rewardData.item.type === "meme" ? "w-full h-full object-cover rounded-full" : "w-20 h-20 object-contain"
                            }`}
                        />
                      )}
                    </div>
                    {!rewardData.isFullItem && (
                      <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white font-bold text-xs px-2 py-1 rounded-full border-2 border-white shadow-sm z-10">
                        Mảnh {rewardData.shardsNow}/{rewardData.item.shardTarget}
                      </div>
                    )}
                  </div>
                  <Badge
                    className="mb-2 text-white border-none shadow-[0_0_8px_rgba(0,0,0,0.3)] relative z-10"
                    style={
                      rewardData.rarity === "divine"
                        ? { background: "linear-gradient(90deg, #ef4444, #eab308, #3b82f6)" }
                        : { backgroundColor: RARITY_CONFIG[rewardData.rarity].color }
                    }
                  >
                    {rewardData.rarity.toUpperCase()}
                  </Badge>
                  <h4 className="text-lg font-bold text-pink-900 mb-1 relative z-10">
                    {rewardData.item.name}
                  </h4>
                  <p className="text-sm font-bold text-zinc-500 mb-6 relative z-10">
                    {rewardData.duplicateFur > 0 ? (
                      <>Đã sở hữu! Phân rã thành <span className="text-[#FF9F1C]">{rewardData.duplicateFur} Shiba Coin</span></>
                    ) : rewardData.unlocked ? (
                      <>Đã ghép thành công vật phẩm! 🎉</>
                    ) : (
                      <>Cố lên! Bạn cần thêm mảnh để ghép.</>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setGachaState("idle");
                      setTwistType(null);
                      setRewardData(null);
                    }}
                    className="w-full bg-pink-500 hover:bg-pink-400 text-white font-black py-3.5 rounded-2xl border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 transition-all relative z-10"
                  >
                    THU THẬP
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
        <FurShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      </div>

      {/* Lớp phủ Đăng nhập Gacha Shop khi chưa đăng nhập */}
      {!user && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 min-h-[500px]">
          {/* Card gỗ Đăng nhập siêu đẹp */}
          <ShibaLoginCard
            title="Cửa Hàng Gacha"
            description="Cửa hàng Gacha đang khóa! Đăng nhập cùng Shiba để dùng Xương Vàng quay Gacha nhận trang phục hiếm và trang trí căn phòng của bạn nhé! 🐾🎁"
            variant="wood"
            onHoverChange={setIsCardHovered}
          />
        </div>
      )}
    </div>
  );
}

function PityBar({ pityCounter }: { pityCounter: number }) {
  const pityRemaining = Math.max(50 - pityCounter, 0);
  const pityPercent = Math.min((pityCounter / 50) * 100, 100);

  return (
    <div className="w-full bg-[#FFF9F2] rounded-3xl p-4 border-2 border-[#FFCCD5] relative overflow-visible mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-2 relative z-10">
        <span
          className="text-xs font-black text-pink-500 uppercase tracking-wider"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Bảo hiểm Epic
        </span>
        <span
          className="text-sm font-black text-[#FF9F1C]"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          {pityCounter}/50
        </span>
      </div>

      {/* Đường chạy Pity */}
      <div className="w-full h-5 bg-[#E8F7F3] rounded-full overflow-visible relative z-10 border border-[#C1E7E3] flex items-center">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FFCAD4] to-[#FF85A1] relative rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pityPercent}%` }}
          transition={{ type: "spring", bounce: 0.1, duration: 1.2 }}
        >
          {/* Chú chó Shiba mini chạy bộ ở đầu thanh tiến trình */}
          {pityPercent > 0 && (
            <motion.div
              className="absolute -right-3 -top-2 z-20 w-8 h-8 flex items-center justify-center text-lg drop-shadow-sm pointer-events-none select-none"
              animate={{
                y: [-1.5, 1.5, -1.5],
                rotate: [-8, 8, -8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🐕
            </motion.div>
          )}

          {/* Sọc chéo động */}
          <div
            className="absolute inset-0 w-full h-full opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 8px, #fff 8px, #fff 16px)",
            }}
          />
        </motion.div>

        {/* Khúc xương vàng ở đích đến cuối thanh */}
        <motion.div
          className="absolute -right-1 -top-2.5 z-20 text-xl"
          animate={pityPercent >= 100 ? { scale: [1, 1.25, 1], rotate: [-15, 15, -15, 15, 0] } : { rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🍖
        </motion.div>
      </div>

      <p
        className="text-xs font-bold text-[#E8A598] mt-2.5 relative z-10"
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {pityRemaining > 0
          ? `Còn ${pityRemaining} lần chắc chắn nhận EPIC!`
          : "Đã kích hoạt bảo hiểm! Lần quay tiếp theo sẽ ra EPIC!"}
      </p>
    </div>
  );
}