import { notFound } from "next/navigation";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { PrerequisiteGuard } from "@/components/flashcard/PrerequisiteGuard";
import { FlashcardData } from "@/types/flashcard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import fs from "fs/promises";
import path from "path";

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
      const levelMatch = id.match(/n[1-5]/i);
      const subFolder = levelMatch ? levelMatch[0].toLowerCase() : "";

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
    <div className="w-full flex flex-col items-center pt-2 pb-10">
      {/* ==========================================
          HEADER KẸO DẺO (SQUISHY NAVIGATION)
          ========================================== */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between px-4">
        {/* Nút Về Nhà (Trắng viền Cam) */}
        <Link href="/">
          <button className="flex items-center justify-center h-12 px-4 bg-white border-4 border-[#FFE2D1] rounded-[1.25rem] shadow-[0_4px_0_0_#FFE2D1] text-orange-400 hover:text-orange-500 hover:bg-orange-50 active:translate-y-1 active:shadow-[0_0_0_0_#FFE2D1] transition-all group cursor-pointer">
            <ArrowLeft
              className="w-5 h-5 mr-1.5 group-hover:-translate-x-1 transition-transform"
              strokeWidth={3}
            />
            <span
              className="font-rounded font-bold text-sm tracking-wide"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Về nhà
            </span>
          </button>
        </Link>

        {/* Nhãn dán Tên Bộ Bài (Vàng viền Cam đâm) */}
        <div className="bg-[#FFD166] border-2 border-[#ffe11c] px-4 py-2 rounded-[1.25rem] shadow-[0_4px_0_0_#FF9F1C] font-rounded font-black text-amber-900 text-xs uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[160px]">
          {isCustomDeck ? (
            <>
              <span
                className="truncate"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Thẻ Tự Tạo
              </span>
            </>
          ) : (
            <>
              <span>📚</span>{" "}
              <span
                className="truncate"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {id.replace(/_/g, " ")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ==========================================
          KHU VỰC THẺ BÀI CHÍNH
          ========================================== */}
      <PrerequisiteGuard prerequisiteDeck={prerequisiteDeck}>
        <FlashcardDeck deckId={id} initialCards={cards} isCustom={isCustomDeck} />
      </PrerequisiteGuard>
    </div>
  );
}
