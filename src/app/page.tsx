"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sparkles, Download, Share, PlusSquare, X } from "lucide-react";
import { ImportDeck } from "@/components/ImportDeck";
import { Button } from "@/components/ui/button";
import { DeckWordList } from "@/components/DeckWordList";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LoadDefaultDecksBtn } from "@/components/LoadDefaultDecksBtn";
import { UserStatsPill } from "@/components/UserStatsPill";

const defaultDecks = [] as any[];

// Hiệu ứng búng lần lượt từng thẻ (Stagger)
const gridContainerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }, // Mỗi thẻ xuất hiện cách nhau 0.08 giây
  },
};

// Hiệu ứng của từng tấm thẻ bài
const cardItemVariants: any = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } },
};

// Hiệu ứng của hũ kẹo rỗng
const emptyBoxVariants: any = {
  hidden: { opacity: 0, scale: 0.7, y: 50, rotate: -3 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

export default function Home() {
  const router = useRouter();
  const [allDecks, setAllDecks] = useState(defaultDecks);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  
  // States cho tính năng Tải App (PWA)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOSInstallable, setIsIOSInstallable] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const loadDecks = () => {
    const customDecks = JSON.parse(
      localStorage.getItem("custom_decks") || "[]",
    );

    const customList = customDecks.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      count: d.count,
      level: d.level,
      isCustom: true,
      cards: d.cards,
    }));
    setAllDecks([...defaultDecks, ...customList]);
  };

  useEffect(() => {
    loadDecks();
    window.addEventListener("deck_saved", loadDecks);
    return () => window.removeEventListener("deck_saved", loadDecks);
  }, []);

  // Bắt sự kiện cài đặt PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Ngăn trình duyệt hiện thanh cài đặt mặc định xấu xí
      setDeferredPrompt(e); // Lưu sự kiện lại để dùng cho nút của mình
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Kiểm tra xem có phải iPhone/iPad chưa cài app không
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isIOS && !isStandalone) {
      setIsIOSInstallable(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleDeleteCustomDeck = (idToDelete: string) => {
    const customDecks = JSON.parse(
      localStorage.getItem("custom_decks") || "[]",
    );
    const updatedDecks = customDecks.filter((d: any) => d.id !== idToDelete);
    localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    loadDecks();
    setDeckToDelete(null); // Đóng popup sau khi xóa
  };

  const handleInstallClick = async () => {
    // Nếu là iOS thì hiện hướng dẫn
    if (isIOSInstallable) {
      setShowIOSModal(true);
      return;
    }
    // Nếu là Android/Desktop thì gọi hàm cài đặt
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false); // Cài xong thì giấu nút đi
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="w-full flex flex-col items-center pb-20">

      {/* VIÊN THUỐC TRẠNG THÁI LUÔN LƠ LỬNG */}
      <UserStatsPill />

      {/* TIÊU ĐỀ APP */}
      <div className="text-center mb-10 space-y-4 pt-6 relative">
        <h1
          className="text-5xl md:text-6xl text-[#FF7096] tracking-wider drop-shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }} // Áp dụng font Cherry Bomb siêu cute
        >
          Flashcard
          <Sparkles
            className="inline-block w-8 h-8 ml-2 mb-4 text-[#FFD166]"
            fill="#FFD166"
          />
        </h1>
        <p className="font-rounded text-zinc-500 font-bold tracking-wide text-sm md:text-base bg-white px-4 py-1.5 rounded-full border-2 border-zinc-200 inline-block shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Chọn bộ bài để bắt đầu học nhé! ﾉ*:･ﾟ✧
        </p>
      </div>

      <ImportDeck />

      <div className="w-full max-w-2xl mt-12 mb-4 flex items-center justify-between px-2">
        <h2
          className="text-2xl text-[#5390D9] drop-shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Kho thẻ của bạn
        </h2>
      </div>

      {/* GRID DANH SÁCH DECK HOẶC TRẠNG THÁI RỖNG (ANIMATED EDITION) */}
      <AnimatePresence mode="popLayout">
        {allDecks.length === 0 ? (
          <motion.div
            key="empty-state"
            variants={emptyBoxVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="w-full max-w-2xl px-2 mt-4"
          >
            <div className="w-full flex flex-col items-center justify-center py-12 px-4 bg-white/60 border-4 border-dashed border-[#FFE2D1] rounded-[3rem] text-center">
              <span className="text-[5rem] mb-4 opacity-90 animate-bounce block select-none">
                🫙
              </span>
              <h3
                className="text-3xl text-orange-300 mb-2 drop-shadow-sm"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Hũ kẹo trống trơn!
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm md:text-base max-w-[250px] mx-auto mb-6">
                Chưa có thẻ bài nào ở đây cả. Bạn tự nhập hoặc lấy bài mẫu của
                app nhé! ✨
              </p>

              {/* NÚT TRIỆU HỒI BÀI MẪU (COMPONENT) */}
              <LoadDefaultDecksBtn onLoaded={loadDecks} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="deck-grid"
            variants={gridContainerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-2"
          >
            {allDecks.map((deck: any) => (
              <motion.div
                key={deck.id}
                variants={cardItemVariants}
                layout // Tự động chạy mượt animation sắp xếp lại vị trí khi có 1 deck bị xóa
                className="relative group"
              >
                {/* THẺ BÀI SOFT GUMMY */}
                <div className="h-full bg-white rounded-[2.5rem] p-6 relative border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#FFE2D1] active:translate-y-2 active:shadow-[0_0_0_0_#FFE2D1] transition-all duration-200 flex flex-col">
                  {/* Lớp kính vô hình bao trọn tấm thẻ để nhảy trang */}
                  <div
                    onClick={() => router.push(`/deck/${deck.id}`)}
                    className="absolute inset-0 z-0 cursor-pointer rounded-[2.5rem]"
                  />

                  {/* NỘI DUNG CHỮ */}
                  <div className="relative z-10 pointer-events-none flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="font-rounded bg-[#FFD166] text-amber-900 font-bold px-3 py-1 rounded-xl border-2 border-[#FFE2D1] shadow-[0_3px_0_0_#FFE2D1]">
                        {deck.level}
                      </Badge>
                    </div>

                    <h3
                      className="text-3xl text-[#FF9F1C] mb-2 truncate pr-16"
                      style={{ fontFamily: "var(--font-cherry)" }}
                    >
                      {deck.title}
                    </h3>

                    <p className="font-rounded text-zinc-500 font-bold mt-1 text-sm line-clamp-2"
                      style={{ fontFamily: "var(--font-cherry)" }}
                    >
                      {deck.description}
                    </p>
                  </div>

                  {/* KHU VỰC NÚT BẤM */}
                  <div className="relative z-20 mt-4 pt-4 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                    <p className="font-rounded text-xs text-indigo-400 font-bold tracking-wide pointer-events-none">
                      ⭐ {deck.count} thẻ ma thuật
                    </p>

                    {/* NÚT XEM LÉN */}
                    <DeckWordList
                      deckId={deck.id}
                      deckTitle={deck.title}
                      cards={deck.cards || []}
                      trigger={
                        <button className="font-rounded text-[10px] font-black uppercase tracking-tighter bg-white text-[#06D6A0] px-3 py-1.5 rounded-full border-2 border-[#A0E8D5] shadow-[0_3px_0_0_#A0E8D5] hover:bg-[#F0FAF5] active:translate-y-1 active:shadow-none transition-all cursor-pointer">
                          🔍
                        </button>
                      }
                    />
                  </div>

                  {/* Nút Xóa */}
                  {deck.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-400 rounded-full w-8 h-8 z-20 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Vẫn phải chặn click lan xuống thẻ nhảy trang
                        setDeckToDelete(deck.id); // Gọi popup lên thay vì xóa ngay
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* POPUP XÁC NHẬN XÓA (CUTE EDITION) */}
      <AnimatePresence>
        {deckToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeckToDelete(null)} // Bấm ra ngoài để đóng
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Chặn đóng khi bấm vào box
              className="bg-[#FDFBF7] border-4 border-[#FF7096] rounded-[2.5rem] p-6 max-w-[320px] w-full text-center shadow-[0_12px_0_0_#FF7096]"
            >
              <h3 
                className="text-2xl text-[#FF7096] mb-2" 
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Xóa thật hả?
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm mb-6">
                Bộ bài này sẽ bay màu vĩnh viễn và không thể khôi phục đâu nhé!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeckToDelete(null)}
                  className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1"
                >
                  Quay xe
                </button>
                <button
                  onClick={() => handleDeleteCustomDeck(deckToDelete)}
                  className="flex-1 h-12 bg-[#FF7096] hover:bg-[#FF5C8A] text-white font-bold rounded-2xl transition-colors border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1"
                >
                  Xóa luôn!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP HƯỚNG DẪN CÀI ĐẶT CHO IPHONE (iOS) */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDFBF7] border-4 border-[#5390D9] rounded-[2.5rem] p-6 max-w-[320px] w-full shadow-[0_12px_0_0_#5390D9] relative"
            >
              <div className="text-center mb-6">
                <span className="text-5xl mb-2 block animate-bounce">🍎</span>
                <h3 className="text-2xl text-[#5390D9]" style={{ fontFamily: "var(--font-cherry)" }}>
                  Cài app trên iPhone
                </h3>
              </div>
              
              <div className="space-y-4 font-rounded font-bold text-zinc-600 text-sm bg-white p-4 rounded-[1.5rem] border-2 border-[#5390D9]/20">
                <p className="flex items-center gap-3">
                  <span className="bg-[#5390D9] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                  Bấm vào nút <Share size={18} className="text-[#5390D9] shrink-0" /> (Chia sẻ) ở dưới cùng màn hình Safari.
                </p>
                <div className="w-full h-px bg-zinc-100" />
                <p className="flex items-center gap-3">
                  <span className="bg-[#5390D9] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                  Kéo xuống & chọn <br/><strong className="text-zinc-800">"Thêm vào MH chính"</strong> <PlusSquare size={18} className="text-[#5390D9] inline shrink-0" />
                </p>
              </div>
              
              <button onClick={() => setShowIOSModal(false)} className="w-full mt-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 transition-all">
                Đã hiểu!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NÚT TẢI APP NỔI GÓC DƯỚI PHẢI (FLOATING BUTTON) */}
      <AnimatePresence>
        {(isInstallable || isIOSInstallable) && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            exit={{ y: 50, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstallClick}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] px-4 py-2.5 bg-white text-[#06D6A0] rounded-full border-2 border-[#A0E8D5] shadow-[0_4px_0_0_#A0E8D5] hover:bg-[#F0FAF5] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm tracking-wide" style={{ fontFamily: "var(--font-cherry)", paddingTop: "2px" }}>Tải App</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
