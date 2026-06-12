"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sparkles, Download, Share, PlusSquare, X, Loader2 } from "lucide-react";
import { ImportDeck } from "@/components/ImportDeck";
import { Button } from "@/components/ui/button";
import { DeckWordList } from "@/components/DeckWordList";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LoadDefaultDecksBtn } from "@/components/LoadDefaultDecksBtn";
import { UserStatsPill } from "@/components/UserStatsPill";
import { useAppStore } from "@/store/useAppStore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { AuthButton } from "@/components/AuthButton";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { toast } from "react-hot-toast";

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
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"journey" | "custom">("journey");

  const customDecks = useAppStore((state) => state.customDecks);
  const loadCustomDecks = useAppStore((state) => state.loadCustomDecks);
  const isLoadingDecks = useAppStore((state) => state.isLoadingDecks);
  const deleteCustomDeck = useAppStore((state) => state.deleteCustomDeck);
  const setUser = useAppStore((state: any) => state.setUser);
  const loadUserStats = useAppStore((state) => state.loadUserStats);
  const user = useAppStore((state: any) => state.user);
  
  const { 
    isInstallable, 
    isIOSInstallable, 
    showIOSModal, 
    setShowIOSModal, 
    handleInstallClick 
  } = usePwaInstall();

  const customList = customDecks.map((d) => ({ ...d, isCustom: true }));
  const allDecks = [...defaultDecks, ...customList];

  // Tải lại bộ bài mỗi khi thay đổi user (đăng nhập / đăng xuất)
  useEffect(() => {
    loadCustomDecks(user?.uid);
    loadUserStats(); // Lấy luôn thống kê học của người dùng vừa đăng nhập
  }, [user?.uid, loadCustomDecks, loadUserStats]);

  // Lắng nghe trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Hủy lắng nghe khi unmount
  }, [setUser]);

  const handleDeleteCustomDeck = async (idToDelete: string) => {
    setIsDeleting(true);
    try {
      if (user) {
        await deleteDoc(doc(db, "decks", idToDelete));
        toast.success("Đã xóa bộ bài trên mây! ☁️🗑️");
      } else {
        toast.success("Đã xóa bộ bài trong máy! 📱🗑️");
      }
      deleteCustomDeck(idToDelete);
      setDeckToDelete(null); // Đóng popup sau khi xóa
    } catch (error) {
      console.error("Lỗi xóa bộ bài:", error);
      toast.error("Chưa xóa được bộ bài, thử lại nhé! 🥺");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-20 relative">
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
          Flashcard
          <Sparkles
            className="inline-block w-8 h-8 ml-2 mb-4 text-[#FFD166]"
            fill="#FFD166"
          />
        </h1>
        <p
          className="font-rounded text-zinc-500 font-bold tracking-wide text-sm md:text-base bg-white px-4 py-1.5 rounded-full border-2 border-zinc-200 inline-block shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Chọn lộ trình để bắt đầu học nhé! ﾉ*:･ﾟ✧
        </p>
      </div>

      {/* TAB SWITCHER (NÚT CHUYỂN TAB) */}
      <div className="flex bg-white/80 backdrop-blur-sm border-2 border-[#FFE2D1] p-1.5 rounded-full w-full max-w-[320px] mx-auto mb-8 shadow-sm relative z-20">
        <button
          onClick={() => setActiveTab("journey")}
          className={`flex-1 py-2.5 px-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "journey"
              ? "bg-[#FFD166] text-amber-900 shadow-[0_3px_0_0_#e6bc5c] -translate-y-1"
              : "text-zinc-400 hover:text-zinc-600 hover:bg-orange-50/50"
          }`}
        >
          🗺️ Hành trình
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-2.5 px-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "custom"
              ? "bg-[#5390D9] text-white shadow-[0_3px_0_0_#4a81c3] -translate-y-1"
              : "text-zinc-400 hover:text-zinc-600 hover:bg-blue-50/50"
          }`}
        >
          🎒 Kho thẻ
        </button>
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
            className="w-full flex flex-col items-center justify-center max-w-2xl px-2"
          >
            <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white/60 border-4 border-dashed border-[#FFD166] rounded-[3rem] text-center shadow-sm">
              <span className="text-[5rem] mb-4 animate-bounce block select-none">🚧</span>
              <h3 className="text-3xl text-[#FF9F1C] mb-2 drop-shadow-sm" style={{ fontFamily: "var(--font-cherry)" }}>
                Bản đồ đang xây dựng!
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm md:text-base max-w-[280px] mx-auto mb-6">
                Lộ trình học chuẩn JLPT sẽ sớm ra mắt. Trong lúc chờ đợi, hãy qua <button onClick={() => setActiveTab("custom")} className="text-[#5390D9] underline underline-offset-2 hover:text-[#3a70b0] cursor-pointer">Kho thẻ</button> nhé! ✨
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 2: KHO THẺ CÁ NHÂN (CODE CŨ) */}
        {activeTab === "custom" && (
          <motion.div
            key="custom-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center max-w-2xl"
          >
            <ImportDeck />

            <div className="w-full mt-10 mb-4 flex items-center justify-between px-2">
              <h2
                className="text-2xl text-[#5390D9] drop-shadow-sm"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Kho thẻ của bạn
              </h2>
            </div>

            {/* GRID DANH SÁCH DECK HOẶC TRẠNG THÁI RỖNG (ANIMATED EDITION) */}
            <AnimatePresence mode="popLayout">
              {isLoadingDecks ? (
                <motion.div
                  key="skeleton-grid"
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-2"
                >
                  {/* Render 4 Skeleton kẹo dẻo mập mạp */}
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      variants={cardItemVariants}
                      className="bg-white rounded-[2.5rem] p-6 border-4 border-[#FFE2D1]/40 shadow-[0_8px_0_0_rgba(255,226,209,0.4)] h-[190px] flex flex-col relative overflow-hidden"
                    >
                      <div className="w-14 h-7 bg-[#FFD166]/40 rounded-xl animate-pulse mb-3" />
                      <div className="w-3/4 h-8 bg-[#FF9F1C]/20 rounded-full animate-pulse mb-2" />
                      <div className="w-full h-3 bg-zinc-200/50 rounded-full animate-pulse" />
                      <div className="w-2/3 h-3 bg-zinc-200/50 rounded-full animate-pulse mt-1.5" />
                      <div className="mt-auto pt-4 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                        <div className="w-24 h-3 bg-indigo-100 animate-pulse rounded-full" />
                        <div className="w-10 h-7 bg-[#06D6A0]/20 animate-pulse rounded-full" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : allDecks.length === 0 ? (
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
                      Chưa có thẻ bài nào ở đây cả. Bạn tự nhập hoặc lấy bộ bài mẫu
                      nhé! ✨
                    </p>

                    {/* NÚT TRIỆU HỒI BÀI MẪU (COMPONENT) */}
                    <LoadDefaultDecksBtn onLoaded={() => loadCustomDecks(user?.uid)} />
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
                            <Badge
                              className="font-rounded bg-[#FFD166] text-amber-900 font-bold px-3 py-1 rounded-xl border-2 border-[#FFE2D1] shadow-[0_3px_0_0_#FFE2D1]"
                              style={{ fontFamily: "var(--font-cherry)" }}
                            >
                              {deck.level}
                            </Badge>
                          </div>

                          <h3
                            className="text-3xl text-[#FF9F1C] mb-2 truncate pr-16"
                            style={{ fontFamily: "var(--font-cherry)" }}
                          >
                            {deck.title}
                          </h3>

                          <p
                            className="font-rounded text-zinc-500 font-bold mt-1 text-sm line-clamp-2"
                            style={{ fontFamily: "var(--font-cherry)" }}
                          >
                            {deck.description}
                          </p>
                        </div>

                        {/* KHU VỰC NÚT BẤM */}
                        <div className="relative z-20 mt-4 pt-4 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                          <p
                            className="font-rounded text-xs text-indigo-400 font-bold tracking-wide pointer-events-none"
                            style={{ fontFamily: "var(--font-cherry)" }}
                          >
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
              animate={{
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 25 },
              }}
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
                  disabled={isDeleting}
                  onClick={() => setDeckToDelete(null)}
                  className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 disabled:cursor-not-allowed"
                >
                  Quay xe
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => handleDeleteCustomDeck(deckToDelete)}
                  className="flex-1 h-12 flex items-center justify-center bg-[#FF7096] hover:bg-[#FF5C8A] text-white font-bold rounded-2xl transition-colors border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:active:border-b-4 disabled:active:translate-y-0 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Xóa...
                    </>
                  ) : (
                    "Xóa luôn!"
                  )}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 25 },
              }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDFBF7] border-4 border-[#5390D9] rounded-[2.5rem] p-6 max-w-[320px] w-full shadow-[0_12px_0_0_#5390D9] relative"
            >
              <div className="text-center mb-6">
                <span className="text-5xl mb-2 block animate-bounce">🍎</span>
                <h3
                  className="text-2xl text-[#5390D9]"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Cài app trên iPhone
                </h3>
              </div>

              <div className="space-y-4 font-rounded font-bold text-zinc-600 text-sm bg-white p-4 rounded-[1.5rem] border-2 border-[#5390D9]/20">
                <p className="flex items-center gap-3">
                  <span className="bg-[#5390D9] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    1
                  </span>
                  Bấm vào nút{" "}
                  <Share size={18} className="text-[#5390D9] shrink-0" /> (Chia
                  sẻ) ở dưới cùng màn hình.
                </p>
                <div className="w-full h-px bg-zinc-100" />
                <p className="flex items-center gap-3">
                  <span className="bg-[#5390D9] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    2
                  </span>
                  Kéo xuống & chọn <br />
                  <strong className="text-zinc-800">
                    "Thêm vào MH chính"
                  </strong>{" "}
                  <PlusSquare
                    size={18}
                    className="text-[#5390D9] inline shrink-0"
                  />
                </p>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full mt-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 transition-all"
              >
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
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: "spring", stiffness: 300, damping: 25 },
            }}
            exit={{ y: 50, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstallClick}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] px-4 py-2.5 bg-white text-[#06D6A0] rounded-full border-2 border-[#A0E8D5] shadow-[0_4px_0_0_#A0E8D5] hover:bg-[#F0FAF5] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
