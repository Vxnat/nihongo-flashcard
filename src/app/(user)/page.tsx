"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Bone } from "lucide-react";
import { SystemRoadmap } from "@/components/roadmap/SystemRoadmap";
import { GachaShop } from "@/components/shiba-room/GachaShop";
import { ShibaRoom } from "@/components/shiba-room/ShibaRoom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthButton } from "@/components/layout/AuthButton";
import { useHome } from "@/hooks/layout/useHome";
import { CustomDecksTab } from "@/components/roadmap/CustomDecksTab";
import { BottomNav } from "@/components/layout/BottomNav";
import { VisualNovelMode } from "@/components/visual-novel/VisualNovelMode";
import { MatchingPairsGame } from "@/components/games/matching-pairs/MatchingPairsGame";
import { KanjiDojoGame } from "@/components/games/kanji-dojo/KanjiDojoGame";
import { KanjiPractice } from "@/components/games/kanji-dojo/KanjiPractice";
import { TypingRushGame } from "@/components/games/typing-rush/TypingRushGame";
import { FillBlanksGame } from "@/components/games/fill-blanks/FillBlanksGame";
import { RhythmGame } from "@/components/games/rhythm/RhythmGame";
import { BossRPGMiniMap } from "@/components/roadmap/BossRPGMiniMap";
import { SakuraEffect, DivineShibaEffect } from "@/components/common/ThemeEffects";
import { ProfileTab } from "@/components/layout/ProfileTab";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const homeState = useHome();
  const {
    activeTab,
    handleTabChange,
    activeStoryId,
    activeMinigameId,
    setActiveMinigameId,
    activeKanjiPracticeDeck,
    setActiveKanjiPracticeDeck,
    minigameDeckData,
    minigameCards,
    isLoadingMinigame,
    saveProgress,
    equippedTheme,
  } = homeState;

  const userStats = useAppStore((state) => state.userStats);
  const maxExp = Math.round(100 * Math.pow(userStats?.level || 1, 1.3));
  const expPercentage = Math.min(100, ((userStats?.exp || 0) / maxExp) * 100);
  const activeBossRPGId = useAppStore((state) => state.activeBossRPGId);
  const setActiveBossRPGId = useAppStore((state) => state.setActiveBossRPGId);

  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsHeaderHidden(true); // Cuộn xuống -> Ẩn
      } else {
        setIsHeaderHidden(false); // Cuộn lên -> Hiện
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Render nội dung minigame theo thể loại tương ứng
  const renderMinigameContent = () => {
    // 1. Trạng thái đang tải dữ liệu
    if (isLoadingMinigame) {
      return (
        <div className="flex flex-col items-center justify-center animate-pulse">
          <span className="mb-4">
            <img
              src="/images/mascot/mascot-hi.gif"
              alt="Đang tải..."
              className="w-24 h-24 object-contain animate-bounce opacity-80"
            />
          </span>
          <p className="font-rounded font-bold text-zinc-500 text-lg" style={{ fontFamily: "var(--font-cherry)" }}>
            Chờ xíu nè...
          </p>
        </div>
      );
    }

    // 2. Trường hợp đặc biệt: Các game không dùng thẻ từ vựng trực tiếp
    if (minigameDeckData?.type === "minigame_kanji") {
      return (
        <KanjiDojoGame
          minigameDeck={minigameDeckData}
          onClose={() => setActiveMinigameId(null)}
          onWin={() => {
            setActiveMinigameId(null);
            saveProgress(activeMinigameId!, ["completed"]);
          }}
        />
      );
    }

    if (minigameDeckData?.type === "minigame_fill") {
      return (
        <FillBlanksGame
          quizList={minigameDeckData?.quizList || []}
          minigameDeck={minigameDeckData}
          onWin={() => {
            setActiveMinigameId(null);
            saveProgress(activeMinigameId!, ["completed"]);
          }}
          onClose={() => setActiveMinigameId(null)}
        />
      );
    }

    // 3. Trạng thái lỗi: Thiếu thẻ học từ các bài trước
    if (minigameCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <p className="font-rounded font-bold text-zinc-500 text-lg">
            Không tìm thấy thẻ bài nào!
          </p>
          <button
            onClick={() => setActiveMinigameId(null)}
            className="mt-6 px-6 py-3 bg-white border-2 border-zinc-200 hover:bg-zinc-50 rounded-2xl font-bold font-rounded text-zinc-600 active:translate-y-1 transition-all shadow-sm"
          >
            Thoát
          </button>
        </div>
      );
    }

    // 4. Định tuyến các loại Minigame khác dựa trên Type
    switch (minigameDeckData?.type) {
      case "minigame_rhythm":
        return (
          <RhythmGame
            cards={minigameCards}
            minigameDeck={minigameDeckData}
            onWin={() => {
              setActiveMinigameId(null);
              saveProgress(activeMinigameId!, ["completed"]);
            }}
            onClose={() => setActiveMinigameId(null)}
          />
        );
      case "minigame_rush":
        return (
          <TypingRushGame
            cards={minigameCards}
            minigameDeck={minigameDeckData}
            onWin={() => {
              setActiveMinigameId(null);
              saveProgress(activeMinigameId!, ["completed"]);
            }}
            onLose={() => setActiveMinigameId(null)}
          />
        );
      case "minigame_matching":
      default:
        return (
          <MatchingPairsGame
            cards={minigameCards}
            minigameDeck={minigameDeckData}
            onClose={() => setActiveMinigameId(null)}
            onWin={() => {
              setActiveMinigameId(null);
              saveProgress(activeMinigameId!, ["completed"]);
            }}
          />
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-20 relative">
      {/* HIỆU ỨNG THEME DYNAMIC */}
      {equippedTheme === "thm_sakura" && <SakuraEffect />}
      {equippedTheme === "thm_divine_shiba" && <DivineShibaEffect />}

      {/* TOP APP BAR */}
      <motion.header
        initial={{ y: 0, x: "-50%" }}
        animate={{ y: isHeaderHidden ? -145 : 0, x: "-50%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-1/2 w-full max-w-2xl z-40 bg-white rounded-b-[2rem] border-b-4 border-[#FFE2D1] px-4 py-3.5 flex gap-3 shadow-md select-none items-center"
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {/* Cột Trái: Thẻ Avatar Shiba & Cấp độ */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div
            onClick={() => handleTabChange("profile")}
            className="w-18 h-18 bg-white border-4 border-[#FFE2D1] rounded-2xl flex items-center justify-center p-1 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Xem Hồ sơ & Thành tích học tập!"
          >
            <img
              src="/images/mascot/shiba_avatar_mini.png"
              alt="Shiba Mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="absolute -bottom-2 bg-[#FFE2D1] border-2 border-white text-[#FF8A5B] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_0_0_#FFE2D1] min-w-[3.5rem] text-center"
          >
            Lv. {userStats?.level || 1}
          </span>
        </div>

        {/* Cột Phải: Tiêu đề, Xu, Streak và Thanh EXP */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Dòng 1: Tiêu đề & Tiền tệ */}
          <div className="flex items-center justify-between gap-1">
            <h2
              className="text-sm font-black text-zinc-700 tracking-wider flex items-center gap-1 select-none"
            >
              SHIBA TOWN
            </h2>

            <div className="flex items-center gap-1.5 shrink-0"
            >
              {/* Coins Pill */}
              <div
                onClick={() => handleTabChange("shop")}
                className="flex items-center gap-1.5 bg-[#FFFDF5] border-2 border-[#FFE2D1] px-2 py-0.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Đến Cửa hàng Gacha!"
              >
                <Bone className="w-3.5 h-3.5 text-amber-700/80 fill-amber-700/80 rotate-45 shrink-0" />
                <span className="text-[11px] font-black text-amber-700/90 font-rounded">
                  {userStats?.coins || 0}
                </span>
              </div>

              {/* Streak Pill */}
              <div
                onClick={() => handleTabChange("profile")}
                className="flex items-center gap-1 bg-[#FFFDF5] border-2 border-[#FFE2D1] px-2 py-0.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Xem chuỗi ngày học tập!"
              >
                <Flame
                  className={`w-3.5 h-3.5 ${userStats?.streak > 0 ? "text-[#FF9F1C] fill-[#FF9F1C]" : "text-zinc-300"}`}
                  style={userStats?.streak > 0 ? { filter: "drop-shadow(0 1px 2px rgba(255, 159, 28, 0.4))" } : {}}
                />
                <span className={`text-[11px] font-black font-rounded ${userStats?.streak > 0 ? "text-[#FF9F1C]" : "text-zinc-400"}`}>
                  {userStats?.streak || 0}
                </span>
              </div>

              {/* Auth Button Dropdown */}
              <AuthButton isInline={true} />
            </div>
          </div>

          {/* Dòng 2: Thanh tiến trình EXP viên thuốc */}
          <div className="w-full relative h-4 bg-zinc-100 rounded-full border border-zinc-200 overflow-hidden shadow-inner flex items-center justify-between"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expPercentage}%` }}
              className="h-full bg-[#06D6A0] rounded-full"
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            />
            <span className="absolute right-2 z-10 text-[9px] font-black text-zinc-500 font-rounded">
              {Math.round(expPercentage)}%
            </span>
          </div>

          {/* Dòng 3: Điểm số EXP chữ */}
          <div className="flex justify-end text-[9px] font-black text-zinc-400 font-rounded mt-0.5"
          >
            <span>{userStats?.exp || 0}/{maxExp} XP</span>
          </div>
        </div>
      </motion.header>

      {/* KHU VỰC NỘI DUNG CUỘN CHÍNH */}
      <main className="w-full pt-[150] pb-7 relative z-10">
        {/* NỘI DUNG TỪNG TAB */}
        <AnimatePresence mode="wait">
          {/* TAB 1: BẢN ĐỒ HÀNH TRÌNH */}
          {activeTab === "journey" && (
            <div
              key="journey-tab"
              className="w-full flex flex-col items-center justify-center"
            >
              <SystemRoadmap />
            </div>
          )}

          {/* TAB 2: KHO THẺ CÁ NHÂN */}
          {activeTab === "custom" && (
            <div
              key="custom-tab"
              className="w-full flex flex-col items-center justify-center px-1"
            >
              <CustomDecksTab homeState={homeState} />
            </div>
          )}

          {/* TAB 3: CỬA HÀNG GACHA */}
          {activeTab === "shop" && (
            <div
              key="shop-tab"
              className="w-full flex flex-col items-center justify-center px-1"
            >
              <GachaShop />
            </div>
          )}

          {/* TAB 4: CĂN PHÒNG SHIBA */}
          {activeTab === "room" && (
            <div
              key="room-tab"
              className="w-full flex flex-col items-center justify-center px-1"
            >
              <ShibaRoom />
            </div>
          )}

          {/* TAB 5: HỒ SƠ & THÀNH TÍCH */}
          {activeTab === "profile" && (
            <div
              key="profile-tab"
              className="w-full flex flex-col items-center justify-center px-1"
            >
              <ProfileTab />
            </div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* MÀN HÌNH VISUAL NOVEL OVERLAY */}
      <AnimatePresence>
        {activeStoryId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-2"
          >
            <VisualNovelMode />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MÀN HÌNH MINIGAME OVERLAY */}
      <AnimatePresence>
        {activeMinigameId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
          >
            {renderMinigameContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MÀN HÌNH KANJI PRACTICE OVERLAY */}
      <AnimatePresence>
        {activeKanjiPracticeDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
          >
            <KanjiPractice deck={activeKanjiPracticeDeck} onClose={() => setActiveKanjiPracticeDeck(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MÀN HÌNH RPG BOSS BATTLE MINI-MAP OVERLAY */}
      <AnimatePresence>
        {activeBossRPGId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm"
          >
            <BossRPGMiniMap deckId={activeBossRPGId} onClose={() => setActiveBossRPGId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
