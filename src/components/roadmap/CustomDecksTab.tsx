"use client";

import { Badge } from "@/components/ui/badge";
import { ImportDeck } from "@/components/roadmap/ImportDeck";
import { DeckWordList } from "@/components/roadmap/DeckWordList";
import { LoadDefaultDecksBtn } from "@/components/roadmap/LoadDefaultDecksBtn";
import {
  Trash2,
  FolderPlus,
  Pencil,
  ChevronDown,
  PlusSquare,
  Search,
  Pin,
  PinOff,
  X,
  Loader2,
  PenTool,
  Download,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHome } from "@/hooks/layout/useHome";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import toast from "react-hot-toast";

// Hiệu ứng búng lần lượt từng thẻ (Stagger)
const gridContainerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

interface CustomDecksTabProps {
  homeState: ReturnType<typeof useHome>;
}

export function CustomDecksTab({ homeState }: CustomDecksTabProps) {
  const router = useRouter();
  const {
    deckToDelete,
    setDeckToDelete,
    folderToDelete,
    setFolderToDelete,
    folderToRename,
    setFolderToRename,
    isCreatingFolder,
    setIsCreatingFolder,
    isDeleting,
    handleDeleteCustomDeck,
    selectedFolderId,
    setSelectedFolderId,
    deckToMove,
    setDeckToMove,
    handleMoveDeck,
    folders,
    handleCreateFolder,
    currentFolderDecks,
    isLoadingDecks,
    handleRenameFolder,
    handleDeleteFolder,
    isFolderDrawerOpen,
    setIsFolderDrawerOpen,
    folderSearchQuery,
    setFolderSearchQuery,
    handleTogglePinFolder,
  } = homeState;

  const [activeSubTab, setActiveSubTab] = useState<"flashcard" | "kanji">("flashcard");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const addCustomDeck = useAppStore((state) => state.addCustomDeck);
  const setActiveKanjiPracticeDeck = useAppStore((state) => state.setActiveKanjiPracticeDeck);
  const user = useAppStore((state) => state.user);

  // Lọc thư mục được ghim và thư mục đang chọn (nếu nó không được ghim)
  const pinnedFolders = folders.filter((f) => f.isPinned);
  const activeUnpinnedFolder =
    selectedFolderId && !pinnedFolders.find((f) => f.id === selectedFolderId)
      ? folders.find((f) => f.id === selectedFolderId)
      : null;

  const filteredDrawerFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(folderSearchQuery.toLowerCase()),
  );

  const selectedFolderName = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)?.name || "Thư mục ẩn"
    : "Kho chính";

  // Lọc bài học theo loại (Flashcard / Kanji)
  const visibleDecks = currentFolderDecks.filter((d: any) => {
    if (activeSubTab === "kanji") return d.type === "kanji";
    return !d.type || d.type === "flashcard" || d.type === "story";
  });

  // Hàm tạo Bộ thủ mặc định
  const handleAddDefaultRadicals = async () => {
    const radicalsDeck: any = {
      id: `radicals_basic_${Date.now()}`,
      title: "214 Bộ Thủ (Phần 1)",
      description: "Nền tảng cấu tạo nên mọi chữ Hán.",
      type: "kanji",
      level: "Cơ bản",
      count: 5,
      cards: [],
      kanjiList: [
        { char: "一", meaning: "Bộ Nhất (Số một)" },
        { char: "丨", meaning: "Bộ Cổn (Nét sổ)" },
        { char: "丶", meaning: "Bộ Chủ (Điểm, chấm)" },
        { char: "丿", meaning: "Bộ Phiệt (Nét phẩy)" },
        { char: "乙", meaning: "Bộ Ất (Can ất)" },
      ],
      createdAt: new Date().toISOString(),
    };
    await addCustomDeck(radicalsDeck);
  };

  // Hàm xuất file JSON
  const handleExportDeck = (deck: any) => {
    let exportData: any[] = [];

    if (deck.type === "kanji" && deck.kanjiList) {
      exportData = deck.kanjiList.map((k: any) => ({
        char: k.char,
        meaning: k.meaning,
      }));
    } else if (deck.cards) {
      exportData = deck.cards.map((c: any) => {
        // const cardData: any = { word: c.word || "", meaning: c.meaning || "" };
        // if (c.reading) cardData.reading = c.reading;
        // if (c.romaji) cardData.romaji = c.romaji;
        // if (c.example_jp) cardData.example_jp = c.example_jp;
        // if (c.example_vi) cardData.example_vi = c.example_vi;
        return c;
      });
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Tạo tên file an toàn (loại bỏ dấu tiếng Việt và ký tự đặc biệt)
    const safeTitle = (deck.title || "deck")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      
    a.download = `${safeTitle}_${deck.level || "custom"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Tải xuống thành công! 🎉", { icon: "⬇️" });
  };

  return (
    <>
      {/* TOGGLE SUB-TABS (Flashcard vs Luyện Viết) */}
      <div className="w-full flex justify-center gap-8 mb-6 mt-6 px-4 max-w-sm mx-auto relative z-10">
        <button
          onClick={() => setActiveSubTab("flashcard")}
          className={`pb-2 text-xl transition-all relative ${
            activeSubTab === "flashcard" ? "text-[#FF7096] font-black" : "text-zinc-300 font-bold hover:text-zinc-400"
          }`}
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Flashcard
          {activeSubTab === "flashcard" && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#FF7096] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("kanji")}
          className={`pb-2 text-xl transition-all relative ${
            activeSubTab === "kanji" ? "text-[#06D6A0] font-black" : "text-zinc-300 font-bold hover:text-zinc-400"
          }`}
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Kanji
          {activeSubTab === "kanji" && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#06D6A0] rounded-full" />
          )}
        </button>
      </div>

      {/* ĐIỀU HƯỚNG THƯ MỤC (NÚT LỚN CHỌN DROPDOWN) */}
      <div className="w-full mb-6 px-4 max-w-2xl mx-auto relative z-10">
        <button
          onClick={() => setIsFolderDrawerOpen(true)}
          className="w-full h-16 bg-white/90 backdrop-blur-md rounded-[1.5rem] border-4 border-[#FFE2D1] shadow-sm hover:bg-orange-50 active:translate-y-1 transition-all flex items-center justify-between px-6 text-zinc-700 outline-none"
        >
          <span className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-sm">{selectedFolderId ? "📂" : "📦"}</span>
            <span className="text-[#FF9F1C] font-black text-xl" style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1px" }}>
              {selectedFolderName}
            </span>
          </span>
          <ChevronDown className="w-6 h-6 text-[#FF9F1C]" strokeWidth={3} />
        </button>
      </div>

      {/* GRID DANH SÁCH DECK */}
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
        ) : visibleDecks.length === 0 ? (
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
                {selectedFolderId ? "🍱" : "🫙"}
              </span>
              <h3
                className="text-3xl text-orange-400 mb-2 drop-shadow-sm"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {selectedFolderId ? "Hộp Bento trống không!" : "Hũ kẹo trống trơn!"}
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm md:text-base max-w-[250px] mx-auto mb-6">
                {selectedFolderId
                  ? "Thư mục này chưa có bộ bài nào. Hãy chuyển bộ bài vào đây nhé! ✨"
                  : activeSubTab === "flashcard"
                    ? "Chưa có thẻ bài nào ở đây cả. Bạn tự nhập hoặc lấy bộ bài mẫu nhé! ✨"
                    : "Bạn chưa có bộ Hán tự nào để luyện viết cả. Hãy thử bộ cơ bản nhé! 🖌️"}
              </p>
              {!selectedFolderId && activeSubTab === "flashcard" && (
                <LoadDefaultDecksBtn onLoaded={() => homeState.loadCustomDecks(user?.uid)} />
              )}
              {!selectedFolderId && activeSubTab === "kanji" && (
                <button
                  onClick={handleAddDefaultRadicals}
                  className="h-12 px-6 rounded-full bg-[#06D6A0] hover:bg-[#05b889] text-white font-rounded font-black text-base border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PenTool className="w-5 h-5" /> <span style={{ fontFamily: "var(--font-cherry)" }}>Tải Bộ Thủ Cơ Bản</span>
                </button>
              )}
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
            {visibleDecks.map((deck: any) => (
              <motion.div
                key={deck.id}
                variants={cardItemVariants}
                layout
                className={`relative group ${openMenuId === deck.id ? "z-30" : "z-0"}`}
              >
                <div className="h-full bg-white rounded-[2.5rem] p-6 relative border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#FFE2D1] active:translate-y-2 active:shadow-[0_0_0_0_#FFE2D1] transition-all duration-200 flex flex-col">
                  <div
                    onClick={() => {
                      if (openMenuId === deck.id) {
                        setOpenMenuId(null);
                        return;
                      }
                      if (deck.type === "kanji") {
                        setActiveKanjiPracticeDeck(deck);
                      } else {
                        router.push(`/deck/${deck.id}`);
                      }
                    }}
                    className="absolute inset-0 z-0 cursor-pointer rounded-[2.5rem]"
                  />
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
                  <div className="relative z-20 mt-4 pt-4 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                    <p
                      className="font-rounded text-xs text-indigo-400 font-bold tracking-wide pointer-events-none"
                      style={{ fontFamily: "var(--font-cherry)" }}
                    >
                      ⭐ {deck.count} thẻ ma thuật
                    </p>
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

                  {/* NÚT THAO TÁC (3 CHẤM) */}
                  {deck.isCustom && (
                    <div className="absolute top-4 right-4 z-30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === deck.id ? null : deck.id);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${openMenuId === deck.id ? "bg-zinc-200 text-zinc-700" : "bg-zinc-100/80 hover:bg-zinc-200 text-zinc-500"}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      <AnimatePresence>
                        {openMenuId === deck.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, originY: 0, originX: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-11 right-0 bg-white rounded-2xl shadow-xl border-2 border-zinc-100 overflow-hidden flex flex-col py-2 z-40"
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleExportDeck(deck); }}
                              className="px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                              <Download className="w-[18px] h-[18px]" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeckToMove(deck.id); }}
                              className="px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <FolderPlus className="w-[18px] h-[18px]" />
                            </button>
                            <div className="w-full h-px bg-zinc-100 my-1" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeckToDelete(deck.id); }}
                              className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-[18px] h-[18px]" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY ĐÓNG MENU THẺ BÀI */}
      {openMenuId && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
      )}

      {/* CÁC POPUP MODALS CỦA TAB KHO THẺ */}
      <AnimatePresence>
        {deckToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeckToDelete(null)}
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
                  className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                >
                  Quay xe
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => handleDeleteCustomDeck(deckToDelete)}
                  className="flex-1 h-12 flex items-center justify-center bg-[#FF7096] hover:bg-[#FF5C8A] text-white font-bold rounded-2xl transition-colors border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 disabled:opacity-70"
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

        {folderToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setFolderToDelete(null)}
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
              className="bg-[#FDFBF7] border-4 border-[#FF7096] rounded-[2.5rem] p-6 max-w-[320px] w-full text-center shadow-[0_12px_0_0_#FF7096]"
            >
              <h3
                className="text-2xl text-[#FF7096] mb-2"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Xóa thư mục?
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm mb-6">
                Các bộ bài bên trong sẽ được chuyển ra ngoài Kho chính an toàn
                nhé!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setFolderToDelete(null)}
                  className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1"
                >
                  Quay xe
                </button>
                <button
                  onClick={() => handleDeleteFolder(folderToDelete)}
                  className="flex-1 h-12 flex items-center justify-center bg-[#FF7096] hover:bg-[#FF5C8A] text-white font-bold rounded-2xl transition-colors border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1"
                >
                  Xóa luôn!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {(isCreatingFolder || folderToRename) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsCreatingFolder(false);
              setFolderToRename(null);
            }}
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
              className="bg-[#FDFBF7] border-4 border-[#06D6A0] rounded-[2.5rem] p-6 max-w-[320px] w-full text-center shadow-[0_12px_0_0_#06D6A0]"
            >
              <h3
                className="text-2xl text-[#06D6A0] mb-4"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {isCreatingFolder ? "Thư mục mới" : "Đổi tên"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = new FormData(e.currentTarget).get(
                    "folderName",
                  ) as string;
                  if (isCreatingFolder) handleCreateFolder(name);
                  else if (folderToRename)
                    handleRenameFolder(folderToRename.id, name);
                }}
                className="flex flex-col gap-4"
              >
                <input
                  name="folderName"
                  defaultValue={folderToRename?.name || ""}
                  autoFocus
                  placeholder="VD: JLPT N5..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 outline-none focus:border-[#06D6A0] font-rounded font-bold text-zinc-700 placeholder:text-zinc-300"
                  autoComplete="off"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setFolderToRename(null);
                    }}
                    className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 flex items-center justify-center bg-[#06D6A0] hover:bg-[#05B586] text-white font-bold rounded-2xl transition-colors border-b-4 border-[#048C68] active:border-b-0 active:translate-y-1"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {deckToMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeckToMove(null)}
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
              className="bg-[#FDFBF7] border-4 border-[#5390D9] rounded-[2.5rem] p-6 max-w-[320px] w-full text-center shadow-[0_12px_0_0_#5390D9] relative"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeckToMove(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-blue-50 text-[#5390D9] rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer z-10"
              >
                <X size={18} strokeWidth={3} />
              </button>
              <div className="mb-4">
                <span className="text-5xl block animate-bounce mb-2">📦</span>
                <h3
                  className="text-2xl text-[#5390D9]"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Chuyển vào...
                </h3>
              </div>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto hide-scrollbar p-1">
                {(() => {
                  const deckObj = currentFolderDecks.find(
                    (d) => d.id === deckToMove,
                  );
                  const currentDeckFolderId = deckObj?.folderId || null;
                  const availableFolders = folders.filter(
                    (folder) => folder.id !== currentDeckFolderId,
                  );

                  return (
                    <>
                      {currentDeckFolderId !== null && (
                        <button
                          onClick={() => handleMoveDeck(null)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:translate-y-1"
                        >
                          <span className="text-2xl drop-shadow-sm">🏠</span>
                          <span className="font-bold text-zinc-600 font-rounded text-sm">
                            Bỏ ra ngoài (Kho chính)
                          </span>
                        </button>
                      )}

                      {availableFolders.length === 0 &&
                        currentDeckFolderId === null && (
                          <div className="py-3 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50 mt-1">
                            <p className="text-xs font-bold text-blue-400 font-rounded">
                              Bạn chưa có thư mục nào! Hãy tạo thêm nhé 📁
                            </p>
                          </div>
                        )}

                      {availableFolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => handleMoveDeck(folder.id)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white border-2 transition-all active:translate-y-1 hover:shadow-sm"
                          style={{ borderColor: folder.color }}
                        >
                          <span className="text-2xl drop-shadow-sm">📁</span>
                          <span className="font-bold font-rounded text-sm truncate text-zinc-700">
                            {folder.name}
                          </span>
                        </button>
                      ))}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NGĂN KÉO DRAWER TẤT CẢ THƯ MỤC */}
      <AnimatePresence>
        {isFolderDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFolderDrawerOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{
                y: 0,
                transition: { type: "spring", damping: 25, stiffness: 200 },
              }}
              exit={{ y: "100%", transition: { duration: 0.2 } }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setIsFolderDrawerOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-[#FDFBF7] rounded-t-[2.5rem] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] h-[80vh] md:h-[70vh] flex flex-col mx-auto max-w-2xl border-t-4 border-zinc-200"
            >
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-6 shrink-0" />
              <div className="flex flex-col gap-4 mb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-2xl text-zinc-700"
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    Tất cả thư mục 📚
                  </h3>
                  <button
                    onClick={() => {
                      setIsFolderDrawerOpen(false);
                      setTimeout(() => setIsCreatingFolder(true), 200); // Đợi drawer trượt xuống một chút rồi mới hiện popup
                    }}
                    className="shrink-0 h-10 px-4 flex items-center justify-center rounded-full bg-white border-2 border-dashed border-zinc-300 text-zinc-400 hover:text-[#06D6A0] hover:border-[#06D6A0] hover:bg-green-50 transition-all active:translate-y-1 outline-none font-bold text-sm font-rounded"
                  >
                    <PlusSquare className="w-5 h-5 mr-1.5" />
                    Mới
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Tìm thư mục..."
                    value={folderSearchQuery}
                    onChange={(e) => setFolderSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-white border-2 border-zinc-200 rounded-2xl outline-none focus:border-[#5390D9] font-rounded font-bold text-zinc-600 transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3 pb-24 px-1">
                {/* Nút Kho chính luôn nằm ở trên cùng */}
                <div 
                  className={`flex items-center gap-3 p-3 border-2 rounded-2xl transition-colors cursor-pointer ${!selectedFolderId ? "bg-blue-50 border-blue-200" : "bg-white border-zinc-100 hover:border-zinc-300"}`} 
                  onClick={() => { setSelectedFolderId(null); setIsFolderDrawerOpen(false); }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-blue-100 text-blue-500">📦</div>
                  <span className="font-bold text-zinc-700 font-rounded text-[17px] truncate">Kho chính</span>
                </div>

                {filteredDrawerFolders.length === 0 ? (
                  <p className="text-center text-zinc-400 font-rounded mt-10 font-bold">
                    Không tìm thấy thư mục nào! 🥺
                  </p>
                ) : (
                  filteredDrawerFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-2 p-2.5 bg-white border-2 border-zinc-100 rounded-2xl hover:border-zinc-300 transition-colors"
                    >
                      <button
                        className="flex-1 flex items-center gap-3 text-left outline-none pl-1"
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setIsFolderDrawerOpen(false);
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{
                            backgroundColor: `${folder.color}20`,
                            color: folder.color,
                          }}
                        >
                          📁
                        </div>
                        <span className="font-bold text-zinc-700 font-rounded text-[17px] truncate">
                          {folder.name}
                        </span>
                      </button>
                      
                      {/* CÁC THAO TÁC SỬA/XÓA CHUYỂN VÀO TRONG DRAWER */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setFolderToRename({ id: folder.id, name: folder.name }); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFolderToDelete(folder.id); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {/* <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePinFolder(folder.id, folder.isPinned); }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${folder.isPinned ? "bg-[#FFD166]/20 text-[#FFD166] hover:bg-[#FFD166]/30" : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"}`}
                        >
                          {folder.isPinned ? (
                            <Pin className="w-4 h-4 fill-current" />
                          ) : (
                            <PinOff className="w-4 h-4" />
                          )}
                        </button> */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NÚT THÊM NỔI Ở GIỮA CẠNH PHẢI MÀN HÌNH */}
      <div className="fixed top-[45%] right-0 z-[60] translate-x-2 hover:translate-x-0 transition-transform duration-300">
        <ImportDeck />
      </div>
    </>
  );
}
