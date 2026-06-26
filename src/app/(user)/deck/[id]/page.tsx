import { notFound } from "next/navigation";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { PrerequisiteGuard } from "@/components/flashcard/PrerequisiteGuard";
import { FlashcardData } from "@/types/flashcard";
import fs from "fs/promises";
import path from "path";
import { getDeckFolder } from "@/utils/deckResolver";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Thêm delay giả 2 giây để xem màn hình loading (Xóa dòng này khi đưa lên production)
  // await new Promise((resolve) => setTimeout(resolve, 100000));

  let cards: FlashcardData[] = [];
  const isCustomDeck = id.startsWith("custom_");
  let prerequisiteDeck: { id: string; title: string; type: string; totalCards: number } | null = null;

  // Nếu KHÔNG PHẢI deck custom, Server mới tìm đọc file JSON cứng và kiểm tra prerequisite
  if (!isCustomDeck) {
    try {
      // 1. Đọc file config hệ thống để tìm prerequisite của deck
      const configPath = path.join(
        process.cwd(),
        "public",
        "data",
        "configs",
        "system_decks.json",
      );
      const configContents = await fs.readFile(configPath, "utf8");
      const systemDecks = JSON.parse(configContents);
      const currentDeck = systemDecks.find((d: any) => d.id === id);

      if (currentDeck && currentDeck.prerequisite) {
        const prereq = systemDecks.find((d: any) => d.id === currentDeck.prerequisite);
        if (prereq) {
          prerequisiteDeck = {
            id: prereq.id,
            title: prereq.title,
            type: prereq.type || "flashcard",
            totalCards: prereq.totalCards || 0,
          };
        }
      }

      // 2. Đọc file thẻ từ vựng của deck
      const subFolder = getDeckFolder(currentDeck?.type);

      const filePath = path.join(
        process.cwd(),
        "public",
        "data",
        "decks",
        subFolder,
        `${id}.json`,
      );
      const fileContents = await fs.readFile(filePath, "utf8");
      cards = JSON.parse(fileContents);
    } catch (error) {
      notFound();
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* ==========================================
          KHU VỰC THẺ BÀI CHÍNH
          ========================================== */}
      <PrerequisiteGuard prerequisiteDeck={prerequisiteDeck}>
        <FlashcardDeck deckId={id} initialCards={cards} isCustom={isCustomDeck} />
      </PrerequisiteGuard>
    </div>
  );
}
