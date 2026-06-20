import { FlashcardData } from "@/types/flashcard";
import { parseFurigana } from "@/utils/textParser";

interface FlashcardBackProps {
  card: FlashcardData;
  showFurigana: boolean; // Dòng mới: Cho phép hiển thị Furigana hay không
}

export function FlashcardBack({
  card,
  showFurigana = true,
}: FlashcardBackProps) {
  return (
    /* 
      CONTAINER KẸO DẺO MẶT SAU:
      - Chiều cao cố định h-[400px] để chống giật UI khi lật.
      - overflow-y-auto: Cho phép cuộn nếu ví dụ/kanji_info quá dài.
      - hide-scrollbar: Ẩn thanh cuộn cho UI sạch sẽ (cần class trong globals.css).
    */
    <div className="w-full max-w-md h-[400px] bg-[#F0FAF5] rounded-xl border-4 border-[#A0E8D5] shadow-[0_10px_0_0_#A0E8D5] relative flex flex-col p-6">
      {/* KHỐI 1: HEADER (Cách đọc & Ý nghĩa) */}
      <div className="text-center space-y-3 flex-shrink-0 flex flex-col items-center">
        {/* Chữ Kana siêu bự */}
        <h3
          className="text-4xl text-[#06D6A0] tracking-wide"
          style={{
            fontFamily: "var(--font-cherry)",
            filter: "drop-shadow(0px 3px 0px rgba(160, 232, 213, 0.8))",
          }}
        >
          {card.reading}
        </h3>

        {/* Romaji trong viên kẹo */}
        <span
          className="px-4 py-1.5 bg-white border-2 border-[#A0E8D5] text-[#05b889] rounded-xl font-rounded font-bold text-md tracking-widest uppercase shadow-[0_3px_0_0_#A0E8D5]"
          style={{
            fontFamily: "var(--font-cute)",
            filter: "drop-shadow(0px 3px 0px rgba(160, 232, 213, 0.8))",
          }}
        >
          {card.romaji}
        </span>

        {/* Ý nghĩa tiếng Việt */}
        <p
          className="text-2xl font-rounded font-black text-teal-800 mt-2 leading-snug"
          style={{
            filter: "drop-shadow(0px 3px 0px rgba(160, 232, 213, 0.8))",
          }}
        >
          {card.meaning}
        </p>
      </div>

      <hr className="border-2 border-dashed border-[#A0E8D5] my-4 flex-shrink-0 opacity-60" />

      {/* KHỐI 2: CÂU VÍ DỤ (Tích hợp Furigana) */}
      <div className="bg-white/60 rounded-2xl p-4 border-2 border-dashed border-[#A0E8D5] text-center flex-1 flex flex-col justify-center">
        <div className="text-lg font-bold text-teal-900 mb-2 leading-loose">
          {/* Render Furigana có truyền cờ showFurigana */}
          {card.example_jp_formatted
            ? parseFurigana(card.example_jp_formatted, showFurigana)
            : card.example_jp}
        </div>
        <p
          className="text-sm font-rounded font-bold text-teal-600/80 pb-3 leading-relaxed"
          style={{
            filter: "drop-shadow(0px 3px 0px rgba(160, 232, 213, 0.8))",
          }}
        >
          {card.example_vi}
        </p>
      </div>
    </div>
  );
}
