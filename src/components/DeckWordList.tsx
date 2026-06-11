"use client";

import React, { useEffect, useState } from "react";
import { FlashcardData } from "@/types/flashcard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Sparkles, Star, GraduationCap } from "lucide-react";
import Link from "next/link";

interface DeckWordListProps {
  deckId: string;
  deckTitle: string;
  cards: FlashcardData[];
  trigger: React.ReactNode;
}

export function DeckWordList({
  deckId,
  deckTitle,
  cards,
  trigger,
}: DeckWordListProps) {
  const [learnedIds, setLearnedIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`flashcard_progress_${deckId}`);
    if (saved) setLearnedIds(JSON.parse(saved));
  }, [deckId]);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] w-[95vw] max-h-[80vh] flex flex-col rounded-[2.5rem] p-0 overflow-hidden border-4 border-[#A0E8D5] shadow-2xl bg-[#FDFBF7]">
        {/* Header: Nắp hộp kẹo Mint */}
        <DialogHeader className="bg-[#06D6A0] p-6 pb-8 border-b-4 border-[#A0E8D5] shrink-0 text-center">
          <DialogTitle
            className="text-2xl text-white tracking-wider flex flex-col items-center gap-2"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm mb-1">
              <Search className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <span>Danh sách Thẻ bài ✨</span>
          </DialogTitle>
          <p className="font-rounded text-white/80 font-bold text-sm mt-1">
            {deckTitle}
          </p>
        </DialogHeader>

        {/* Body: Danh sách thanh bánh xốp */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar bg-[#FDFBF7]">
          {cards.map((card) => {
            const isLearned = learnedIds.includes(card.id);
            return (
              <div
                key={card.id}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isLearned
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
                <div className="flex-1 px-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-rounded font-black text-xs text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase">
                      {card.romaji || card.reading}
                    </span>
                  </div>
                  <p
                    className={`font-rounded font-bold text-sm ${isLearned ? "text-zinc-400" : "text-zinc-600"}`}
                  >
                    {card.meaning}
                  </p>
                </div>

                {/* Badge Đã thuộc (Ngôi sao) */}
                {isLearned ? (
                  <div className="bg-[#FFD166] p-2 rounded-full shadow-[0_3px_0_0_#FF9F1C] animate-in zoom-in duration-500">
                    <Star className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-200" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Nút Bắt đầu học */}
        <div className="p-4 bg-white border-t-2 border-[#A0E8D5] shrink-0">
          <Link href={`/deck/${deckId}`} className="w-full">
            <button className="w-full h-12 bg-[#FF7096] hover:bg-[#FF5C8A] text-white rounded-2xl font-bold text-lg border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Bắt đầu học ngay! ᕙ(`▽´)ᕗ
            </button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
