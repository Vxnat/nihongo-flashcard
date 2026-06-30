"use client";

import { Badge } from "@/components/ui/badge";
import { ImportDeck } from "@/components/roadmap/ImportDeck";
import { DeckWordList } from "@/components/roadmap/DeckWordList";
import {
  Trash2,
  FolderPlus,
  X,
  Loader2,
  Download,
  MoreVertical,
  Layers,
  BookOpen,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHome } from "@/hooks/layout/useHome";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Thư mục cố định (Preset Folders) theo đúng phong cách Kawaii & Gamified 3D
const PRESET_FOLDERS = [
  { id: "vocab", name: "Từ vựng", iconPath: "/images/ui/custom_decks/folder-vocab.png", deckIllustrationPath: "/images/ui/custom_decks/deck-vocab.png", color: "#FF7096", bgLight: "#FFF0F4", borderLight: "#FFB3C6", shadowColor: "#FFD6E0" },
  { id: "kanji", name: "Hán tự", iconPath: "/images/ui/custom_decks/folder-kanji.png", deckIllustrationPath: "/images/ui/custom_decks/deck-kanji.png", color: "#FF9F1C", bgLight: "#FFF7ED", borderLight: "#FED7AA", shadowColor: "#FFE3D1" },
  { id: "grammar", name: "Ngữ pháp", iconPath: "/images/ui/custom_decks/folder-grammar.png", deckIllustrationPath: "/images/ui/custom_decks/deck-grammar.png", color: "#06D6A0", bgLight: "#F0FDF4", borderLight: "#BBF7D0", shadowColor: "#D1FAE5" },
  { id: "other", name: "Khác", iconPath: "/images/ui/custom_decks/folder-other.png", deckIllustrationPath: "/images/ui/custom_decks/deck-other.png", color: "#5390D9", bgLight: "#EFF6FF", borderLight: "#BFDBFE", shadowColor: "#DBEAFE" },
];

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
    isDeleting,
    handleDeleteCustomDeck,
    selectedFolderId,
    setSelectedFolderId,
    deckToMove,
    setDeckToMove,
    handleMoveDeck,
    isLoadingDecks,
  } = homeState;

  const [activeSubTab, setActiveSubTab] = useState<"flashcard" | "kanji">("flashcard");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const customDecks = useAppStore((state) => state.customDecks);
  const setActiveKanjiPracticeDeck = useAppStore((state) => state.setActiveKanjiPracticeDeck);

  // Tải tiến trình từ store
  const progress = useAppStore((state) => state.progress);
  const loadProgress = useAppStore((state) => state.loadProgress);

  // Lọc bộ bài theo tab phụ (Flashcard / Kanji) và Thư mục chọn
  const typeFiltered = customDecks.filter((d: any) => {
    if (activeSubTab === "kanji") return d.type === "kanji";
    return !d.type || d.type === "flashcard" || d.type === "story";
  });

  const visibleDecks = typeFiltered.filter((d: any) => {
    if (!selectedFolderId) return true; // Tab "Tất cả" hiển thị tất cả
    if (selectedFolderId === "other") {
      // Các bài học cũ chưa phân loại hoặc có folderId là other/không thuộc các folder cố định khác
      return !d.folderId || d.folderId === "other" || !["vocab", "kanji", "grammar"].includes(d.folderId);
    }
    return d.folderId === selectedFolderId;
  });

  // Tự động load tiến độ học tập cho các bài học đang hiển thị
  useEffect(() => {
    visibleDecks.forEach((deck: any) => {
      if (deck.id) {
        loadProgress(deck.id);
      }
    });
  }, [visibleDecks, loadProgress]);


  // Hàm xuất file JSON
  const handleExportDeck = (deck: any) => {
    let exportData: any[] = [];

    if (deck.type === "kanji" && deck.kanjiList) {
      exportData = deck.kanjiList.map((k: any) => ({
        char: k.char,
        meaning: k.meaning,
      }));
    } else if (deck.cards) {
      exportData = deck.cards.map((c: any) => c);
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const safeTitle = (deck.title || "deck")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

    a.download = `${safeTitle}_${deck.level || "custom"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Tải xuống thành công!");
  };

  return (
    <>
      {/* TOGGLE SUB-TABS (Flashcard vs Luyện Viết) */}
      <div className="w-full flex justify-center mb-6 mt-6 px-4 relative z-10">
        <div className="flex p-1.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg gap-2 max-w-sm w-full relative">
          {/* Tab Flashcard */}
          <button
            onClick={() => setActiveSubTab("flashcard")}
            className={`flex-1 py-2.5 text-sm font-black rounded-full transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
              activeSubTab === "flashcard" ? "text-[#FF7096]" : "text-zinc-400 hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Flashcard
            </span>
            {activeSubTab === "flashcard" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#FF7096]/20 border border-[#FF7096]/30 shadow-[0_0_15px_rgba(255,112,150,0.25)] rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Tab Kanji */}
          <button
            onClick={() => setActiveSubTab("kanji")}
            className={`flex-1 py-2.5 text-sm font-black rounded-full transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
              activeSubTab === "kanji" ? "text-[#06D6A0]" : "text-zinc-400 hover:text-white"
            }`}
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Kanji
            </span>
            {activeSubTab === "kanji" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#06D6A0]/20 border border-[#06D6A0]/30 shadow-[0_0_15px_rgba(6,214,160,0.25)] rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* THANH TRƯỢT NGANG FOLDER CHIPS 3D */}
      <div className="w-full flex gap-3 overflow-x-auto no-scrollbar py-3 px-4 max-w-2xl mx-auto relative z-10 select-none">
        {/* Nút Tất cả */}
        <button
          onClick={() => setSelectedFolderId(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-b-4 font-rounded font-black text-sm transition-all shrink-0 active:translate-y-1 active:border-b-0
            ${selectedFolderId === null
              ? "bg-[#FFE2D1] border-[#FF9F1C] text-[#FF9F1C] shadow-[0_3px_0_0_#FF9F1C] translate-y-[2px]"
              : "bg-white border-zinc-200 text-zinc-500 hover:bg-orange-50 shadow-[0_4px_0_0_#E4E4E7]"
            }
          `}
        >
          <img
            src="/images/ui/custom_decks/folder-all.png"
            className="w-8 h-8 object-contain mix-blend-multiply"
            alt="Tất cả"
          />
          <span>Tất cả</span>
        </button>

        {/* Các thư mục cố định */}
        {PRESET_FOLDERS.map((folder) => {
          const isActive = selectedFolderId === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-b-4 font-rounded font-black text-sm transition-all shrink-0 active:translate-y-1 active:border-b-0
                ${isActive
                  ? "bg-white text-zinc-700 translate-y-[2px]"
                  : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 shadow-[0_4px_0_0_#E4E4E7]"
                }
              `}
              style={{
                borderColor: isActive ? folder.color : undefined,
                color: isActive ? folder.color : undefined,
              }}
            >
              <img
                src={folder.iconPath}
                className="w-8 h-8 object-contain mix-blend-multiply"
                alt={folder.name}
              />
              <span>{folder.name}</span>
            </button>
          );
        })}
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
              <div className="w-24 h-24 mb-4 opacity-90 animate-bounce flex items-center justify-center select-none">
                {(() => {
                  const matched = PRESET_FOLDERS.find(f => f.id === selectedFolderId);
                  const iconSrc = matched ? matched.iconPath : "/images/ui/custom_decks/folder-all.png";
                  return (
                    <img
                      src={iconSrc}
                      className="w-full h-full object-contain mix-blend-multiply"
                      alt="Empty folder"
                    />
                  );
                })()}
              </div>
              <h3
                className="text-3xl text-orange-400 mb-2 drop-shadow-sm"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Thư mục trống trơn!
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm md:text-base max-w-[280px] mx-auto mb-6">
                Chưa có thẻ bài nào ở đây cả. Bạn có thể nhấn linh vật góc phải để triệu hồi thẻ nhé!
              </p>

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
            {visibleDecks.map((deck: any) => {
              // Tìm Folder config để lấy màu và icon tương ứng
              const matchedFolder = PRESET_FOLDERS.find(f => f.id === deck.folderId) || PRESET_FOLDERS[3]; // mặc định là other
              const folderColor = matchedFolder.color;

              // Tính toán phần trạng thái tiến độ
              const deckProgress = progress[deck.id] || [];
              const totalCards = deck.type === "kanji" ? (deck.kanjiList?.length || 0) : (deck.cards?.length || 0);
              const progressPercent = totalCards > 0 ? Math.round((deckProgress.length / totalCards) * 100) : 0;

              return (
                <motion.div
                  key={deck.id}
                  variants={cardItemVariants}
                  layout
                  className={`relative group ${openMenuId === deck.id ? "z-[60]" : "z-0"}`}
                >
                  <div
                    className="h-full bg-white rounded-[2.5rem] p-6 relative border-4 transition-all duration-200 flex flex-col shadow-[0_8px_0_0_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_var(--shadow-color)] active:translate-y-1 active:shadow-[0_4px_0_0_var(--shadow-color)]"
                    style={{
                      borderColor: matchedFolder.borderLight,
                      '--shadow-color': matchedFolder.shadowColor,
                    } as React.CSSProperties}
                  >
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

                    <div className="relative z-10 pointer-events-none flex gap-4 flex-1">
                      {/* Cột trái: Icon 3D */}
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] overflow-hidden"
                        style={{
                          backgroundColor: matchedFolder.bgLight,
                          borderColor: matchedFolder.borderLight,
                        }}
                      >
                        <img
                          src={matchedFolder.deckIllustrationPath}
                          className="w-14 h-14 object-contain mix-blend-multiply"
                          alt={matchedFolder.name}
                        />
                      </div>

                      {/* Cột phải: Thông tin */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <Badge
                            className="font-rounded bg-[#FFD166] text-amber-900 font-bold px-2 py-0.5 rounded-lg border-2 border-[#FFE2D1] text-[10px]"
                            style={{ fontFamily: "var(--font-cherry)" }}
                          >
                            {deck.level}
                          </Badge>
                        </div>
                        <h3
                          className="text-2xl mb-1 truncate pr-8 font-black"
                          style={{ fontFamily: "var(--font-cherry)", color: folderColor }}
                        >
                          {deck.title}
                        </h3>
                        <p
                          className="font-rounded text-zinc-500 font-bold text-xs line-clamp-2"
                          style={{ fontFamily: "var(--font-cherry)" }}
                        >
                          {deck.description || "Không có mô tả."}
                        </p>
                      </div>
                    </div>

                    {/* Tiến độ và Tác vụ */}
                    <div className="relative z-10 mt-3 pt-3 border-t-2 border-dashed border-zinc-100 flex flex-col gap-2">
                      {/* Thanh Tiến độ */}
                      <div className="w-full">
                        <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 mb-1">
                          <span style={{ fontFamily: "var(--font-cherry)" }}>Đã học {deckProgress.length}/{totalCards} thẻ</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: folderColor }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div
                          className="flex items-center gap-1 font-rounded text-[10px] font-bold tracking-wide pointer-events-none"
                          style={{ fontFamily: "var(--font-cherry)", color: folderColor }}
                        >
                          {deck.type === "kanji" ? (
                            <>
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{totalCards} chữ Hán</span>
                            </>
                          ) : (
                            <>
                              <Layers className="w-3.5 h-3.5" />
                              <span>{totalCards} thẻ bài</span>
                            </>
                          )}
                        </div>
                        <DeckWordList
                          deckId={deck.id}
                          deckTitle={deck.title}
                          cards={
                            deck.type === "kanji"
                              ? (deck.kanjiList || []).map((item: any, index: number) => ({
                                  id: `${deck.id}_kanji_${index}`,
                                  word: typeof item === "string" ? item : item.char,
                                  meaning: typeof item === "string" ? "" : item.meaning,
                                  reading: "",
                                  romaji: "",
                                }))
                              : (deck.cards || [])
                          }
                          isKanji={deck.type === "kanji"}
                          onStartPractice={() => {
                            if (deck.type === "kanji") {
                              setActiveKanjiPracticeDeck(deck);
                            }
                          }}
                          trigger={
                            <button
                              className="font-rounded text-xs bg-white p-2 rounded-full border-2 transition-all cursor-pointer shadow-[0_3px_0_0_var(--btn-shadow)] hover:bg-zinc-50 active:translate-y-[2px] active:shadow-none flex items-center justify-center w-8 h-8"
                              style={{
                                borderColor: matchedFolder.borderLight,
                                '--btn-shadow': matchedFolder.borderLight,
                              } as React.CSSProperties}
                            >
                              <Search className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2.5} />
                            </button>
                          }
                        />
                      </div>
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
                              className="absolute top-11 right-0 bg-white rounded-2xl shadow-xl border-2 border-zinc-100 overflow-hidden flex flex-col py-2 z-[20]"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleExportDeck(deck); }}
                                className="px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download className="w-[18px] h-[18px]" /> Xuất JSON
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeckToMove(deck.id); }}
                                className="px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                              >
                                <FolderPlus className="w-[18px] h-[18px]" /> Phân loại
                              </button>
                              <div className="w-full h-px bg-zinc-100 my-1" />
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeckToDelete(deck.id); }}
                                className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-[18px] h-[18px]" /> Xóa bài
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY ĐÓNG MENU THẺ BÀI */}
      {openMenuId && (
        <div className="fixed inset-0 z-[55]" onClick={() => setOpenMenuId(null)} />
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
                <div className="w-16 h-16 mx-auto mb-2 opacity-95 animate-bounce flex items-center justify-center select-none">
                  <img
                    src="/images/ui/custom_decks/folder-all.png"
                    className="w-full h-full object-contain mix-blend-multiply"
                    alt="Phân loại"
                  />
                </div>
                <h3
                  className="text-2xl text-[#5390D9]"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Phân loại vào...
                </h3>
              </div>
              <div className="flex flex-col gap-3 p-1">
                {PRESET_FOLDERS.map((folder) => {
                  const deckObj = customDecks.find((d) => d.id === deckToMove);
                  if (deckObj?.folderId === folder.id) return null;

                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleMoveDeck(folder.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border-2 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:translate-y-1 shadow-sm"
                      style={{ borderColor: folder.color }}
                    >
                      <img
                        src={folder.iconPath}
                        className="w-8 h-8 object-contain mix-blend-multiply"
                        alt={folder.name}
                      />
                      <span className="font-bold font-rounded text-sm text-zinc-700">
                        {folder.name}
                      </span>
                    </button>
                  );
                })}

                {(() => {
                  const deckObj = customDecks.find((d) => d.id === deckToMove);
                  if (deckObj?.folderId) {
                    return (
                      <button
                        onClick={() => handleMoveDeck(null)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all active:translate-y-1"
                      >
                        <img
                          src="/images/ui/custom_decks/folder-all.png"
                          className="w-8 h-8 object-contain mix-blend-multiply"
                          alt="Bỏ ra ngoài"
                        />
                        <span className="font-bold font-rounded text-sm text-zinc-600">
                          Bỏ ra ngoài (Kho chính)
                        </span>
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MASCOT FAB VỚI HỘP THOẠI TRỰC TIẾP */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 select-none">
        {/* Linh vật Mascot */}
        <div className="relative group cursor-pointer">
          {/* Bong bóng thoại mini */}
          <div className="absolute bottom-22 right-0 bg-white/95 border-2 border-[#FFE2D1] rounded-2xl py-1.5 px-3 shadow-md w-max pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] font-black text-amber-900 font-rounded">Tạo bài mới nhé?</p>
          </div>

          <motion.div
            onClick={() => window.dispatchEvent(new Event("open_import_deck"))}
            className="relative w-18 h-18 rounded-full bg-[#FFAE64] shadow-[0_6px_0_0_#D9863B] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >

            {/* Mascot Image */}
            <div className="w-[85%] h-[85%] rounded-full overflow-hidden flex items-center justify-center relative z-0">
              <img
                src="/images/mascot/mascot-hi.png"
                alt="Mascot Assistant"
                className="w-full h-full object-cover scale-110 translate-y-0.5"
              />
            </div>

            {/* Pink Plus Button at the bottom-right corner with solid 3D shadow */}
            <div
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FF7096] shadow-[0_3px_0_0_#C7486B] flex items-center justify-center text-white font-black text-lg select-none z-20"
            >
              +
            </div>
          </motion.div>
        </div>
      </div>

      {/* Import dialog được đặt ở ngoài cùng để tránh bị unmount khi FAB menu đóng */}
      <ImportDeck hideDefaultTrigger />
    </>
  );
}
