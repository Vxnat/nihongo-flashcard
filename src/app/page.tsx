"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sparkles } from "lucide-react";
import { ImportDeck } from "@/components/ImportDeck";
import { Button } from "@/components/ui/button";

const defaultDecks = [
  { id: "n5_deck_01", title: "N5 Vocabulary", description: "Từ vựng cơ bản - Phần 1", count: 5, level: "N5" },
  { id: "n4_kanji_01", title: "N4 Kanji Core", description: "Hán tự thiết yếu N4", count: 20, level: "N4" },
];

export default function Home() {
  const [allDecks, setAllDecks] = useState(defaultDecks);

  const loadDecks = () => {
    const customDecks = JSON.parse(localStorage.getItem("custom_decks") || "[]");
    const customList = customDecks.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      count: d.count,
      level: d.level,
      isCustom: true 
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
    const customDecks = JSON.parse(localStorage.getItem("custom_decks") || "[]");
    const updatedDecks = customDecks.filter((d: any) => d.id !== idToDelete);
    localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    loadDecks(); 
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
          <Sparkles className="inline-block w-8 h-8 ml-2 mb-4 text-[#FFD166]" fill="#FFD166" />
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

      {/* GRID DANH SÁCH DECK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-2">
        {allDecks.map((deck: any) => (
          <Link href={`/deck/${deck.id}`} key={deck.id}>
            
            {/* 
              SOFT GUMMY CARD STYLING:
              - Bo góc siêu tròn: rounded-[2rem]
              - Viền pastel dày: border-4 border-[#FFE2D1]
              - Bóng khối đặc: shadow-[0_8px_0_0_#FFE2D1]
              - SQUISHY EFFECT (Hover & Active): Nảy lên khi di chuột và lún mượt mà khi click
            */}
            <div className="h-full bg-white rounded-[2rem] p-6 relative group border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#FFE2D1] active:translate-y-2 active:shadow-[0_0_0_0_#FFE2D1] transition-all duration-200 cursor-pointer flex flex-col">
              
              <div className="flex justify-between items-start mb-3">
                <Badge 
                  className="font-rounded bg-[#FFD166] hover:bg-[#FFD166] text-amber-900 font-bold tracking-wider px-3 py-1 rounded-xl border-2 border-[#FFE2D1] shadow-[0_3px_0_0_#FFE2D1]"
                >
                  {deck.level}
                </Badge>
              </div>
              
              <h3 
                className="text-3xl text-[#FF9F1C] leading-snug mb-2 truncate pr-8 drop-shadow-sm group-hover:scale-[1.02] transition-transform origin-left"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {deck.title}
              </h3>
              
              <p className="font-rounded text-zinc-500 font-bold mt-1 text-sm flex-1">
                {deck.description}
              </p>
              
              <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-200">
                <p className="font-rounded text-sm text-[#06D6A0] font-bold tracking-wide">
                  ⭐ {deck.count} thẻ ma thuật
                </p>
              </div>
              
              {deck.isCustom && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute bottom-4 right-4 bg-red-100 hover:bg-red-200 text-red-500 rounded-full w-10 h-10 transition-colors"
                  onClick={(e) => handleDeleteCustomDeck(e, deck.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
            
          </Link>
        ))}
      </div>
    </div>
  );
}