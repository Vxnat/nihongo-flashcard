"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { SystemRoadmap } from "@/components/SystemRoadmap";
import { GachaShop } from "@/components/GachaShop";
import { motion, AnimatePresence } from "framer-motion";
import { UserStatsPill } from "@/components/UserStatsPill";
import { AuthButton } from "@/components/AuthButton";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useHome } from "@/hooks/useHome";
import { CustomDecksTab } from "@/components/CustomDecksTab";
import { BottomNav } from "@/components/BottomNav";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { VisualNovelMode } from "../components/VisualNovelMode";
import { MatchingPairsGame } from "@/components/MatchingPairsGame";
import { KanjiDojoGame } from "@/components/KanjiDojoGame";
import { KanjiPractice } from "@/components/KanjiPractice";
import { useAppStore } from "@/store/useAppStore";
import { FlashcardData } from "@/types/flashcard";
import { TypingRushGame } from "@/components/TypingRushGame";

export default function Home() {
  const homeState = useHome();
  const pwaState = usePwaInstall();
  const { activeTab, handleTabChange } = homeState;
  const activeStoryId = useAppStore((state) => state.activeStoryId);
  const activeMinigameId = useAppStore((state: any) => state.activeMinigameId);
  const setActiveMinigameId = useAppStore(
    (state: any) => state.setActiveMinigameId,
  );
  const activeKanjiPracticeDeck = useAppStore((state) => state.activeKanjiPracticeDeck);
  const setActiveKanjiPracticeDeck = useAppStore((state) => state.setActiveKanjiPracticeDeck);
  const [minigameDeckData, setMinigameDeckData] = useState<any>(null); // Store minigame deck data
  const saveProgress = useAppStore((state) => state.saveProgress);

  // State chứa data thẻ ngẫu nhiên cho minigame
  const [minigameCards, setMinigameCards] = useState<FlashcardData[]>([]);
  const [isLoadingMinigame, setIsLoadingMinigame] = useState(false);

  // Tự động fetch data lấy thẻ bài từ các bài trước khi mở Minigame
  useEffect(() => {
    const fetchMinigameCards = async () => {
      if (!activeMinigameId) {
        setMinigameCards([]);
        setIsLoadingMinigame(false);
        return;
      }

      setIsLoadingMinigame(true);
      try {
        const res = await fetch("/data/system_decks.json");
        const decks = await res.json();

        const minigameDeck = decks.find((d: any) => d.id === activeMinigameId);
        if (!minigameDeck) return;
        
        const folder = minigameDeck.level.toLowerCase(); // VD: n5, n4

        // 1. GAME ĐẶC THÙ (KANJI) -> Fetch data từ file json rời
        if (minigameDeck.type === "minigame_kanji") {
          const dataRes = await fetch(`/data/${folder}/${minigameDeck.id}.json`).catch(() => null);
          if (dataRes && dataRes.ok) {
            const data = await dataRes.json();
            // Tiêm mảng kanji vào lại object deck để truyền cho KanjiDojoGame
            setMinigameDeckData({ ...minigameDeck, kanjiList: data });
          } else {
            setMinigameDeckData(minigameDeck);
          }
          setMinigameCards([]);
          setIsLoadingMinigame(false);
          return;
        }

        setMinigameDeckData(minigameDeck);

        // 2. GAME ÔN TẬP (MATCHING, RUSH) -> Lấy data dựa vào targetDeckIds
        let allCards: FlashcardData[] = [];
        
        if (minigameDeck.targetDeckIds && minigameDeck.targetDeckIds.length > 0) {
          // Dùng Promise.all để fetch tất cả các file cần ôn tập cùng lúc
          const fetchPromises = minigameDeck.targetDeckIds.map((targetId: string) =>
            fetch(`/data/${folder}/${targetId}.json`).then((r) => (r.ok ? r.json() : []))
          );
          
          const results = await Promise.all(fetchPromises);
          
          // Gộp tất cả các mảng kết quả thành 1 mảng duy nhất
          results.forEach((cards) => {
            allCards = [...allCards, ...cards];
          });
        } else {
          // Fallback: Lấy tất cả bài flashcard trước đó nếu chưa cấu hình targetDeckIds
          const minigameIndex = decks.findIndex((d: any) => d.id === activeMinigameId);
          const previousDecks = decks.slice(0, minigameIndex).filter((d: any) => d.level === minigameDeck.level && (!d.type || d.type === "flashcard"));
          const fetchPromises = previousDecks.slice(-3).map((deck: any) => fetch(`/data/${folder}/${deck.id}.json`).then((r) => (r.ok ? r.json() : [])));
          const results = await Promise.all(fetchPromises);
          results.forEach((cards) => { allCards = [...allCards, ...cards]; });
        }

        const shuffled = allCards.sort(() => Math.random() - 0.5);
        // Game Băng chuyền cần nhiều từ vựng hơn, Nối từ cần ít hơn
        const limit = minigameDeck.type === "minigame_rush" ? 15 : 7;
        setMinigameCards(shuffled.slice(0, limit));
      } catch (err) {
        console.error("Lỗi tải minigame:", err);
      } finally {
        setIsLoadingMinigame(false);
      }
    };
    fetchMinigameCards();
  }, [activeMinigameId]);

  return (
    <div className="w-full flex flex-col items-center pb-32 relative">
      {/* VIÊN THUỐC TRẠNG THÁI LUÔN LƠ LỬNG */}
      <UserStatsPill />

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
            {minigameDeckData?.type === "minigame_kanji" ? (
              <KanjiDojoGame
                minigameDeck={minigameDeckData}
                onClose={() => setActiveMinigameId(null)}
                onWin={() => {
                  setActiveMinigameId(null);
                  saveProgress(activeMinigameId, ["completed"]);
                }}
              />
            ) : isLoadingMinigame ? (
              <div className="flex flex-col items-center justify-center animate-pulse">
                <span className="mb-4">
                  <img
                    src="/images/mascot-hi.gif"
                    alt="Đang tải..."
                    className="w-24 h-24 object-contain animate-bounce opacity-80"
                  /></span>
                <p className="font-rounded font-bold text-zinc-500 text-lg"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Chờ xíu nè...
                </p>
              </div>
            ) : minigameCards.length === 0 ? (
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
            ) : minigameDeckData?.type === "minigame_rush" ? (
              <TypingRushGame
                cards={minigameCards}
                minigameDeck={minigameDeckData}
                onWin={() => {
                  setActiveMinigameId(null);
                  saveProgress(activeMinigameId, ["completed"]);
                }}
                onLose={() => setActiveMinigameId(null)}
              />
            ) : (
              <MatchingPairsGame
                cards={minigameCards}
                minigameDeck={minigameDeckData} // Pass minigame deck data
                onClose={() => setActiveMinigameId(null)}
                onWin={() => {
                  setActiveMinigameId(null);
                  saveProgress(activeMinigameId, ["completed"]);
                }}
              />
            )}
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
