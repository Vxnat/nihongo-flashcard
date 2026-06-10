import { FlashcardData } from "@/types/flashcard";
import { parseFurigana } from "@/utils/textParser";

interface FlashcardBackProps {
  card: FlashcardData;
}

export function FlashcardBack({ card }: FlashcardBackProps) {
  return (
    /* 
      CONTAINER KẸO DẺO MẶT SAU:
      - Chiều cao cố định h-[400px] để chống giật UI khi lật.
      - overflow-y-auto: Cho phép cuộn nếu ví dụ/kanji_info quá dài.
      - hide-scrollbar: Ẩn thanh cuộn cho UI sạch sẽ (cần class trong globals.css).
    */
    <div className="w-full max-w-md h-[400px] bg-[#F0FAF5] rounded-xl border-4 border-[#A0E8D5] shadow-[0_10px_0_0_#A0E8D5] overflow-y-auto hide-scrollbar relative flex flex-col p-6">
      
      {/* KHỐI 1: HEADER (Cách đọc & Ý nghĩa) */}
      <div className="text-center space-y-3 flex-shrink-0 flex flex-col items-center">
        {/* Chữ Kana siêu bự */}
        <h3 
          className="text-4xl text-[#06D6A0] tracking-wide"
          style={{ 
            fontFamily: "var(--font-cherry)",
            filter: "drop-shadow(0px 3px 0px rgba(160, 232, 213, 0.8))" 
          }}
        >
          {card.reading}
        </h3>
        
        {/* Romaji trong viên kẹo */}
        <span 
          className="px-4 py-1.5 bg-white border-2 border-[#A0E8D5] text-[#05b889] rounded-xl font-rounded font-bold text-sm tracking-widest uppercase shadow-[0_3px_0_0_#A0E8D5]"
          style={{ 
            fontFamily: "var(--font-hachi-maru-pop)",
            filter: "drop-shadow(0px 3px 0px rgba(160, 232, 213, 0.8))" 
          }}>
          {card.romaji}
        </span>
        
        {/* Ý nghĩa tiếng Việt */}
        <p className="text-2xl font-rounded font-black text-teal-800 mt-2 leading-snug">
          {card.meaning}
        </p>
      </div>

      <hr className="border-2 border-dashed border-[#A0E8D5] my-4 flex-shrink-0 opacity-60" />

      {/* KHỐI 2: KANJI INFO (Âm On / Kun) - Layout Sticker */}
      {card.kanji_info && card.kanji_info.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0 mb-4">
          {card.kanji_info.map((kanjiItem, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-[#A0E8D5] shadow-[0_4px_0_0_#A0E8D5] transition-transform hover:-translate-y-0.5"
            >
              {/* Chữ Hán tự mini */}
              <span 
                className="text-4xl text-[#FF9F1C]"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {kanjiItem.kanji}
              </span>
              
              {/* Âm On/Kun */}
              <div className="flex flex-col font-rounded text-xs font-bold space-y-1 w-full">
                <div className="bg-orange-50 px-2 py-1 rounded-lg text-orange-800 border border-orange-100 flex justify-between">
                  <span>ON:</span> 
                  <span className="text-[#FF9F1C] ml-1 truncate">{kanjiItem.onyomi || "---"}</span>
                </div>
                <div className="bg-pink-50 px-2 py-1 rounded-lg text-pink-800 border border-pink-100 flex justify-between">
                  <span>KUN:</span> 
                  <span className="text-[#FF7096] ml-1 truncate">{kanjiItem.kunyomi || "---"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KHỐI 3: CÂU VÍ DỤ (Tích hợp Furigana) */}
      <div className="mt-auto pt-4 border-t-4 border-[#A0E8D5] bg-white/60 rounded-2xl p-4 border-dashed text-center">
        <div className="text-lg font-bold text-teal-900 mb-2 leading-loose">
          {/* Render Furigana */}
          {card.example_jp_formatted 
            ? parseFurigana(card.example_jp_formatted) 
            : card.example_jp}
        </div>
        <p className="text-sm font-rounded font-bold text-teal-600/80">
          {card.example_vi}
        </p>
      </div>

    </div>
  );
}