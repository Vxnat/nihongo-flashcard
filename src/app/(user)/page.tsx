"use client";

import { Sparkles } from "lucide-react";
import { SystemRoadmap } from "@/components/roadmap/SystemRoadmap";
import { GachaShop } from "@/components/shiba-room/GachaShop";
import { ShibaRoom } from "@/components/shiba-room/ShibaRoom";
import { motion, AnimatePresence } from "framer-motion";
import { UserStatsPill } from "@/components/layout/UserStatsPill";
import { AuthButton } from "@/components/layout/AuthButton";
import { usePwaInstall } from "@/hooks/common/usePwaInstall";
import { useHome } from "@/hooks/layout/useHome";
import { CustomDecksTab } from "@/components/roadmap/CustomDecksTab";
import { BottomNav } from "@/components/layout/BottomNav";
import { PwaInstallPrompt } from "@/components/common/PwaInstallPrompt";
import { VisualNovelMode } from "@/components/visual-novel/VisualNovelMode";
import { MatchingPairsGame } from "@/components/games/matching-pairs/MatchingPairsGame";
import { KanjiDojoGame } from "@/components/games/kanji-dojo/KanjiDojoGame";
import { KanjiPractice } from "@/components/games/kanji-dojo/KanjiPractice";
import { TypingRushGame } from "@/components/games/typing-rush/TypingRushGame";
import { SakuraEffect, LofiNightEffect, DivineShibaEffect } from "@/components/common/ThemeEffects";
import { ProfileTab } from "@/components/layout/ProfileTab";

export default function Home() {
  const homeState = useHome();
  const pwaState = usePwaInstall();
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

    // 2. Trường hợp đặc biệt: Minigame Kanji không yêu cầu có thẻ học trước
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

    // 3. Trạng thái lỗi: Thiếu thẻ học từ các bài trước
    if (minigameCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <span className="text-6xl mb-4">😭</span>
          <p className="font-rounded font-bold text-zinc-500 text-lg">
            Không tìm thấy thẻ bài nào từ các bài trước!
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
    <div className="w-full flex flex-col items-center pb-32 relative">
      {/* HIỆU ỨNG THEME DYNAMIC */}
      {equippedTheme === "thm_sakura" && <SakuraEffect />}
      {equippedTheme === "thm_night" && <LofiNightEffect />}
      {equippedTheme === "thm_divine_shiba" && <DivineShibaEffect />}
      {/* VIÊN THUỐC TRẠNG THÁI LUÔN LƠ LỬNG */}
      <UserStatsPill onTabChange={handleTabChange} />

      {/* COMPONENT ĐĂNG NHẬP (GÓC TRÊN PHẢI) */}
      <AuthButton />

      {/* TIÊU ĐỀ APP */}
      <div className="text-center mb-6 space-y-4 pt-20 md:pt-12 relative">
        <h1
          className="text-5xl md:text-6xl text-[#FF7096] tracking-wider drop-shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }} // Áp dụng font Cherry Bomb siêu cute
        >
          Shiba Town
          <Sparkles
            className="inline-block w-8 h-8 ml-2 mb-4 text-[#FFD166]"
            fill="#FFD166"
          />
        </h1>
        <p
          className="font-rounded text-zinc-500 font-bold tracking-wide text-sm md:text-base bg-white px-4 py-1.5 rounded-full border-2 border-zinc-200 inline-block shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Khám phá tiếng Nhật cùng bé Shiba! ✨
        </p>
      </div>

      {/* NỘI DUNG TỪNG TAB */}
      <AnimatePresence mode="wait">
        {/* TAB 1: BẢN ĐỒ HÀNH TRÌNH */}
        {activeTab === "journey" && (
          <motion.div
            key="journey-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <SystemRoadmap />
          </motion.div>
        )}

        {/* TAB 2: KHO THẺ CÁ NHÂN */}
        {activeTab === "custom" && (
          <motion.div
            key="custom-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <CustomDecksTab homeState={homeState} />
          </motion.div>
        )}

        {/* TAB 3: CỬA HÀNG GACHA */}
        {activeTab === "shop" && (
          <motion.div
            key="shop-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <GachaShop />
          </motion.div>
        )}

        {/* TAB 4: CĂN PHÒNG SHIBA */}
        {activeTab === "room" && (
          <motion.div
            key="room-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <ShibaRoom />
          </motion.div>
        )}

        {/* TAB 5: HỒ SƠ & THÀNH TÍCH */}
        {activeTab === "profile" && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <ProfileTab />
          </motion.div>
        )}
      </AnimatePresence>

      <PwaInstallPrompt pwaState={pwaState} />
      <BottomNav activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* MÀN HÌNH VISUAL NOVEL OVERLAY (FULL SCREEN) */}
      <AnimatePresence>
        {activeStoryId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-md flex items-center justify-center sm:p-4"
          >
            <VisualNovelMode />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MÀN HÌNH MINIGAME OVERLAY (FULL SCREEN) */}
      <AnimatePresence>
        {activeMinigameId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-md flex items-center justify-center"
          >
            {renderMinigameContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MÀN HÌNH KANJI PRACTICE OVERLAY (Luyện viết tự do) */}
      <AnimatePresence>
        {activeKanjiPracticeDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-md flex items-center justify-center"
          >
            <KanjiPractice deck={activeKanjiPracticeDeck} onClose={() => setActiveKanjiPracticeDeck(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
