"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sparkles } from "lucide-react";
import { ImportDeck } from "@/components/ImportDeck";
import { Button } from "@/components/ui/button";
import { DeckWordList } from "@/components/DeckWordList";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  const [allDecks, setAllDecks] = useState(defaultDecks);
  const router = useRouter();

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

  const handleDeleteCustomDeck = (e: React.MouseEvent, idToDelete: string) => {
    e.preventDefault();
    const customDecks = JSON.parse(
      localStorage.getItem("custom_decks") || "[]",
    );
    const updatedDecks = customDecks.filter((d: any) => d.id !== idToDelete);
    localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    loadDecks();
  };

  const handleLoadDefaultDecks = async () => {
    try {
      // 1. Định nghĩa danh sách các bộ bài mẫu muốn nạp
      // Mỗi item sẽ tương ứng với một file JSON chứa danh sách cards trong thư mục public/data
      const sampleDecksToLoad = [
        {
          id: "custom_default_n5_core",
          title: "N5 Vocabulary Core",
          description: "Bộ từ vựng N5 thiết yếu để bạn bắt đầu hành trình ✨",
          level: "N5",
          dataPath: "/data/default_decks.json",
        },
        // {
        //   id: "default_cute_sample",
        //   title: "Cute Flashcards",
        //   description: "Những từ vựng siêu dễ thương và ví dụ thực tế 🍬",
        //   level: "N5",
        //   dataPath: "/data/mau_flashcard_cute.json",
        // },
      ];

      // 2. Lấy dữ liệu hiện có
      const existingCustomDecks = JSON.parse(
        localStorage.getItem("custom_decks") || "[]",
      );

      const newDecks = [];

      // 3. Duyệt qua từng bộ bài mẫu và tải dữ liệu cards
      for (const sample of sampleDecksToLoad) {
        // Kiểm tra xem ID này đã tồn tại trong máy người dùng chưa
        const isAlreadyImported = existingCustomDecks.some(
          (d: any) => d.id === sample.id,
        );

        if (!isAlreadyImported) {
          const res = await fetch(sample.dataPath);
          if (!res.ok) continue;
          const cards = await res.json();

          // Tạo đối tượng Deck hoàn chỉnh
          newDecks.push({
            id: sample.id,
            title: sample.title,
            description: sample.description,
            level: sample.level,
            count: cards.length,
            cards: cards,
            isCustom: true, // Để người dùng có thể xóa nếu thích
          });
        }
      }

      // 4. Kiểm tra kết quả
      if (newDecks.length === 0) {
        alert("Bạn đã 'triệu hồi' hết các bộ bài mẫu rồi mà! (ﾉ◕ヮ◕)ﾉ*");
        return;
      }

      // 5. Lưu vào localStorage và cập nhật UI
      const updatedDecks = [...existingCustomDecks, ...newDecks];
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));

      // Phát sự kiện để các component khác (nếu có) cùng cập nhật
      window.dispatchEvent(new Event("deck_saved"));

      // Reload dữ liệu tại chỗ
      loadDecks();

      alert(
        `Phù phép thành công! Đã thêm ${newDecks.length} bộ bài mới vào kho của bạn. ✨`,
      );
    } catch (error) {
      console.error("Lỗi triệu hồi bài mẫu:", error);
      alert("Ôi hỏng rồi, phép thuật bị lỗi! Thử lại sau nhé 😭");
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-20">
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
        <p className="font-rounded text-zinc-500 font-bold tracking-wide text-sm md:text-base bg-white px-4 py-1.5 rounded-full border-2 border-zinc-200 inline-block shadow-sm">
          Chọn bộ bài để bắt đầu học nhé! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
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

              {/* NÚT TRIỆU HỒI BÀI MẪU BÉO NGẬY (BLUE CANDY PILL) */}
              <button
                onClick={handleLoadDefaultDecks}
                className="h-12 px-6 rounded-full bg-[#5390D9] hover:bg-[#3a70b0] text-white font-rounded font-black text-base border-b-4 border-[#305f94] active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🪄</span> Triệu hồi bộ bài mẫu!
              </button>
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

                    <p className="font-rounded text-zinc-500 font-bold mt-1 text-sm line-clamp-2">
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
                      onClick={(e) => handleDeleteCustomDeck(e, deck.id)}
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
    </div>
  );
}
