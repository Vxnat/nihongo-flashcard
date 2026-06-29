"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FlashcardData } from "@/types/flashcard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Star, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

interface DeckWordListProps {
  deckId: string;
  deckTitle: string;
  cards: FlashcardData[];
  trigger: React.ReactNode;
  isKanji?: boolean;
  onStartPractice?: () => void;
}

const EMPTY_LEARNED_IDS: string[] = [];

export function DeckWordList({
  deckId,
  deckTitle,
  cards,
  trigger,
  isKanji = false,
  onStartPractice,
}: DeckWordListProps) {
  // 1. STATE MỚI: Quản lý Tìm kiếm & Tàng hình
  const [searchQuery, setSearchQuery] = useState("");
  const [hideReading, setHideReading] = useState(false);

  const learnedIds = useAppStore(
    (state) => state.progress[deckId] || EMPTY_LEARNED_IDS,
  );
  const loadProgress = useAppStore((state) => state.loadProgress);

  useEffect(() => {
    loadProgress(deckId);
  }, [deckId, loadProgress]);

  // 2. LOGIC TÌM KIẾM: Tự động lọc thẻ bài dựa trên chữ Kanji, Romaji hoặc Nghĩa
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const lowerQuery = searchQuery.toLowerCase();
    return cards.filter(
      (card) =>
        card.word.toLowerCase().includes(lowerQuery) ||
        card.meaning.toLowerCase().includes(lowerQuery) ||
        (card.romaji && card.romaji.toLowerCase().includes(lowerQuery)) ||
        (card.reading && card.reading.toLowerCase().includes(lowerQuery)),
    );
  }, [cards, searchQuery]);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[450px] w-[95vw] max-h-[85vh] p-0 bg-transparent border-none shadow-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col w-full h-full max-h-[85vh] rounded-xl overflow-hidden border-4 border-[#A0E8D5] shadow-2xl bg-[#FDFBF7]"
        >
          {/* ================= HEADER ================= */}
          <DialogHeader className="bg-[#06D6A0] p-6 pb-6 border-b-4 border-[#A0E8D5] shrink-0 text-center">
            <DialogTitle
              className="text-2xl text-white tracking-wider flex flex-col items-center gap-2"
              style={{ fontFamily: "var(--font-jupa)" }}
            >
              <span>{isKanji ? "Hộp Chữ Hán" : "Hộp Từ Vựng"}</span>
            </DialogTitle>
            <p className="font-rounded text-white/90 font-bold text-sm mt-1">
              {deckTitle}
            </p>
          </DialogHeader>

          {/* ================= THANH CÔNG CỤ (STICKY) ================= */}
          <div className="bg-[#FDFBF7] p-4 border-b-2 border-dashed border-zinc-200 shrink-0 flex gap-2 z-10 shadow-sm">
            {/* Thanh Search Kẹo Mút */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={isKanji ? "Tìm kiếm chữ Hán hoặc ý nghĩa..." : "Tìm kiếm từ vựng..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 bg-white border-2 border-zinc-200 rounded-full font-rounded font-bold text-sm text-zinc-700 focus:outline-none focus:border-[#A0E8D5] focus:bg-[#F0FAF5] transition-colors placeholder:font-medium placeholder:text-zinc-400 shadow-sm"
              />
            </div>

            {/* Công tắc Giấu bài */}
            {!isKanji && (
              <button
                onClick={() => setHideReading(!hideReading)}
                className={`w-11 h-11 flex items-center justify-center rounded-full border-2 transition-all shadow-sm ${hideReading
                  ? "bg-[#FF9F1C] border-[#FF9F1C] text-white"
                  : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
                  }`}
                title="Bật/Tắt chế độ kiểm tra trí nhớ"
              >
                {hideReading ? (
                  <EyeOff size={18} strokeWidth={2.5} />
                ) : (
                  <Eye size={18} strokeWidth={2.5} />
                )}
              </button>
            )}
          </div>

          {/* ================= DANH SÁCH TỪ VỰNG ================= */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar bg-[#FDFBF7] relative">
            {/* Trạng thái trống khi Search không ra kết quả */}
            {filteredCards.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2 py-10">
                <p className="font-rounded font-bold text-sm">
                  {isKanji ? "Không tìm thấy kết quả phù hợp" : "Danh sách trống, không tìm thấy từ vựng!"}
                </p>
              </div>
            )}

            {filteredCards.map((card) => {
              const isLearned = learnedIds.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-300 group/card ${isLearned
                    ? "bg-orange-50/50 border-orange-200 opacity-80"
                    : "bg-white border-zinc-100 shadow-sm hover:border-[#FFE2D1]"
                    }`}
                >
                  {/* Kanji mập mạp */}
                  <div
                    className={`text-2xl w-16 shrink-0 ${isLearned ? "text-orange-300" : "text-[#FF9F1C]"}`}
                    style={{ fontFamily: "var(--font-cherry)" }}
                  >
                    {card.word}
                  </div>

                  {/* Info ở giữa */}
                  <div className="flex-1 px-2">
                    {(card.romaji || card.reading) ? (
                      <div className="flex items-center gap-2 mb-0.5 w-fit">
                        {/* HIỆU ỨNG THẺ CÀO (SCRATCH CARD) */}
                        <span
                          className={`font-rounded font-black text-[11px] px-2.5 py-0.5 rounded-lg border uppercase transition-all duration-300 cursor-help ${hideReading
                            ? "bg-zinc-200 text-transparent border-zinc-200 blur-[3px] hover:blur-none hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-100" // Khi che: mờ đi, di chuột vào sẽ rõ lại
                            : "bg-indigo-50 text-indigo-400 border-indigo-100" // Khi bình thường
                            }`}
                        >
                          {card.romaji || card.reading}
                        </span>
                      </div>
                    ) : null}
                    <p
                      className={`font-rounded font-bold text-sm mt-1 ${isLearned ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {card.meaning}
                    </p>
                  </div>

                  {/* Badge Đã thuộc (Ngôi sao) */}
                  {isLearned ? (
                    <div className="bg-[#FFD166] p-2 rounded-full shadow-[0_3px_0_0_#FF9F1C] animate-in zoom-in duration-500 shrink-0 ml-2">
                      <Star
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-200 shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>

          {/* ================= FOOTER ================= */}
          <div className="p-4 bg-white border-t-2 border-[#A0E8D5] shrink-0 z-10 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
            {isKanji ? (
              <DialogTrigger asChild>
                <button
                  onClick={() => {
                    if (onStartPractice) onStartPractice();
                  }}
                  className="w-full h-12 bg-[#06D6A0] hover:bg-[#05B889] text-white rounded-2xl font-bold text-lg border-b-4 border-[#049E75] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  Bắt đầu luyện viết!
                </button>
              </DialogTrigger>
            ) : (
              <Link href={`/deck/${deckId}`} className="w-full block">
                <button className="w-full h-12 bg-[#FF7096] hover:bg-[#FF5C8A] text-white rounded-2xl font-bold text-lg border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                  Bắt đầu học ngay!
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
