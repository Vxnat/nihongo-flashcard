import { FlashcardData } from "@/types/flashcard";
import { parseFurigana } from "@/utils/textParser";

interface FlashcardBackProps {
  card: FlashcardData;
  showFurigana: boolean;
  isZen?: boolean;
}

export function FlashcardBack({
  card,
  showFurigana = true,
  isZen = false,
}: FlashcardBackProps) {
  if (isZen) {
    return (
      <div className="w-full max-w-md h-[400px] bg-gradient-to-br from-indigo-950/40 via-purple-950/35 to-pink-950/40 backdrop-blur-md rounded-2xl border-2 border-pink-500/20 shadow-[0_8px_32px_0_rgba(236,72,153,0.15)] relative flex flex-col p-6 transition-all duration-500">
        {/* KHỐI 1: HEADER (Cách đọc & Ý nghĩa) */}
        <div className="text-center space-y-3 flex-shrink-0 flex flex-col items-center">
          {/* Chữ Kana siêu bự phát sáng nhẹ */}
          <h3
            className="text-4xl text-pink-300 tracking-wide"
            style={{
              fontFamily: "var(--font-cherry)",
              filter: "drop-shadow(0px 0px 8px rgba(244, 143, 177, 0.8))",
            }}
          >
            {card.reading}
          </h3>

          {/* Romaji trong viên kẹo kính mờ */}
          <span
            className="px-4 py-1.5 bg-white/5 border border-white/10 text-pink-200 rounded-xl font-rounded font-bold text-md tracking-widest uppercase shadow-none"
            style={{
              fontFamily: "var(--font-cute)",
            }}
          >
            {card.romaji}
          </span>

          {/* Ý nghĩa tiếng Việt */}
          <p className="text-2xl font-rounded font-black text-white mt-2 leading-snug">
            {card.meaning}
          </p>
        </div>

        <hr className="border border-dashed border-white/20 my-4 flex-shrink-0" />

        {/* KHỐI 2: CÂU VÍ DỤ (Tích hợp Furigana) */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center flex-1 flex flex-col justify-center [&_rt]:text-pink-300/80">
          <div className="text-lg font-bold text-white mb-2 leading-loose">
            {/* Render Furigana có truyền cờ showFurigana */}
            {card.example_jp_formatted
              ? parseFurigana(card.example_jp_formatted, showFurigana)
              : card.example_jp}
          </div>
          <p className="text-sm font-rounded font-bold text-pink-200/70 pb-3 leading-relaxed">
            {card.example_vi}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md h-[400px] flex flex-row items-center justify-between p-5 bg-gradient-to-br from-[#FFEAF2]/80 via-white/60 to-[#E6FAF7]/80 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-[0_8px_32px_0_rgba(255,112,150,0.08)] relative overflow-hidden group transition-all duration-300">
      {/* Trang trí góc lấp lánh như hình ảnh */}
      <span className="absolute top-8 left-4 text-2xl select-none opacity-80 animate-bounce">🌸</span>
      <span className="absolute top-4 right-1/2 text-lg select-none opacity-40 text-amber-400">⭐</span>
      <span className="absolute bottom-8 left-6 text-xl select-none opacity-60">🍃</span>
      <span className="absolute bottom-4 right-1/2 text-2xl select-none opacity-70">✨</span>
      <span className="absolute top-10 right-4 text-xl select-none opacity-80">🌸</span>

      {/* Left Column: Kanji, Reading, Romaji, Meaning, and mini Example */}
      <div className="w-[53%] flex flex-col justify-center items-start pl-2 h-full overflow-y-auto hide-scrollbar py-2">
        {/* Furigana / Reading */}
        <span className="text-[#06D6A0] font-rounded font-black text-xs tracking-widest uppercase mb-1">
          {card.reading}
        </span>

        {/* Kanji word */}
        <h2
          className="text-4xl sm:text-5xl text-teal-800 tracking-wide text-left mb-1 break-all leading-normal"
          style={{
            fontFamily: "var(--font-cherry)",
            WebkitTextStroke: "1px #FFF",
            filter: "drop-shadow(0px 2px 0px rgba(255, 226, 209, 1))"
          }}
        >
          {card.word}
        </h2>

        {/* Romaji Badge */}
        <span className="px-3 py-0.5 bg-white/60 border border-teal-200 text-teal-700 rounded-lg font-rounded font-bold text-[10px] tracking-wider uppercase mb-2">
          {card.romaji}
        </span>

        {/* Meaning */}
        <p className="text-lg font-rounded font-black text-zinc-700 leading-snug mb-2">
          {card.meaning}
        </p>

        {/* Example inline */}
        {card.example_jp && (
          <div className="bg-white/50 border border-teal-100/50 rounded-xl p-2.5 w-full text-left">
            <p className="text-md font-bold text-teal-900 leading-normal">
              {card.example_jp_formatted
                ? parseFurigana(card.example_jp_formatted, showFurigana)
                : card.example_jp}
            </p>
            <p className="text-sm font-rounded font-bold text-[#FF7096] leading-tight mt-1">
              {card.example_vi}
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Shiba Room illustration */}
      <div className="w-[44%] flex items-center justify-center h-full py-4">
        <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white/80 shadow-md bg-amber-50/10">
          <img
            src="/images/mascot/shiba_study.png"
            alt="Shiba Room"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
