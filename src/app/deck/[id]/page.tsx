import { notFound } from "next/navigation";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { FlashcardData } from "@/types/flashcard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import fs from "fs/promises";
import path from "path";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let cards: FlashcardData[] = [];
  const isCustomDeck = id.startsWith("custom_");

  // Nếu KHÔNG PHẢI deck custom, Server mới tìm đọc file JSON cứng
  if (!isCustomDeck) {
    try {
      const filePath = path.join(process.cwd(), "public", "data", `${id}.json`);
      const fileContents = await fs.readFile(filePath, "utf8");
      cards = JSON.parse(fileContents);
    } catch (error) {
      notFound();
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 flex items-center text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </Link>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[150px]">
          {isCustomDeck ? "Custom Deck" : id}
        </span>
      </div>

      {/* Truyền cờ isCustom xuống. FlashcardDeck sẽ tự tìm data trong localStorage */}
      <FlashcardDeck deckId={id} initialCards={cards} isCustom={isCustomDeck} />
    </div>
  );
}