"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { CardData } from "@/types/flashcard";

interface CardEditorDrawerProps {
  selectedCard: CardData;
  setSelectedCard: (card: CardData | null) => void;
  cards: CardData[];
  handleCardSave: (updatedCard: CardData) => void;
}

export function CardEditorDrawer({
  selectedCard,
  setSelectedCard,
  cards,
  handleCardSave
}: CardEditorDrawerProps) {
  // Use local state for the form so edits don't immediately affect the parent state until confirmed
  const [form, setForm] = React.useState<CardData>({ ...selectedCard });

  React.useEffect(() => {
    setForm({ ...selectedCard });
  }, [selectedCard]);

  const isEdit = cards.some(c => c.id === selectedCard.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedCard(null)}
        className="fixed inset-0 bg-black z-40"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l-4 border-[#8C6D58] z-50 p-6 flex flex-col justify-between overflow-y-auto"
        style={{ fontFamily: "var(--font-rounded)" }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
            <h3 className="text-sm font-black text-zinc-800" style={{ fontFamily: "var(--font-cherry)" }}>
              {isEdit ? "CHỈNH SỬA TỪ VỰNG" : "THÊM TỪ VỰNG MỚI"}
            </h3>
            <button onClick={() => setSelectedCard(null)} className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 text-xs font-bold">
            {/* Word */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Kanji / Từ vựng viết chính</label>
              <input
                type="text"
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 font-extrabold text-sm"
                placeholder="VD: 私 hoặc 勉強します"
              />
            </div>

            {/* Reading */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Hiragana / Cách đọc (Furigana)</label>
              <input
                type="text"
                value={form.reading}
                onChange={(e) => setForm({ ...form, reading: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-700"
                placeholder="VD: わたし hoặc べんきょうします"
              />
            </div>

            {/* Romaji */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Romaji</label>
              <input
                type="text"
                value={form.romaji}
                onChange={(e) => setForm({ ...form, romaji: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-500 italic"
                placeholder="VD: watashi"
              />
            </div>

            {/* Meaning */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Nghĩa tiếng Việt</label>
              <input
                type="text"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-700"
                placeholder="VD: Tôi"
              />
            </div>

            {/* Pos */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Từ loại (POS)</label>
              <select
                value={form.pos || "noun"}
                onChange={(e) => setForm({ ...form, pos: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-zinc-600 bg-white"
              >
                <option value="noun">Noun (Danh từ)</option>
                <option value="verb">Verb (Động từ)</option>
                <option value="adjective">Adjective (Tính từ)</option>
                <option value="adverb">Adverb (Trạng từ)</option>
                <option value="phrase">Phrase (Cụm từ)</option>
                <option value="pronoun">Pronoun (Đại từ)</option>
                <option value="suffix">Suffix (Hậu tố)</option>
                <option value="interrogative">Interrogative (Từ để hỏi)</option>
              </select>
            </div>

            {/* Examples */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Ví dụ Kanji (Không Furigana)</label>
              <input
                type="text"
                value={form.example_jp || ""}
                onChange={(e) => setForm({ ...form, example_jp: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                placeholder="VD: <b>私は学生です。</b>"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Ví dụ Formatted (Ghi furigana dạng [Hán tự]phiênâm)</label>
              <input
                type="text"
                value={form.example_jp_formatted || ""}
                onChange={(e) => setForm({ ...form, example_jp_formatted: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 font-mono"
                placeholder="VD: [私]{わたし}は[学生]{がくせい}です。"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Dịch nghĩa ví dụ (Tiếng Việt)</label>
              <input
                type="text"
                value={form.example_vi || ""}
                onChange={(e) => setForm({ ...form, example_vi: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
                placeholder="VD: Tôi là học sinh."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Ghi chú (Notes)</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[60px]"
                placeholder="VD: Cách nói lịch sự, dùng cho cả nam lẫn nữ..."
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 flex gap-2">
          <button
            onClick={() => setSelectedCard(null)}
            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl cursor-pointer border border-zinc-300"
          >
            HỦY BỎ
          </button>
          <button
            onClick={() => handleCardSave(form)}
            className="flex-1 py-2.5 bg-[#8C6D58] hover:bg-[#735642] text-white font-black rounded-xl cursor-pointer"
          >
            XÁC NHẬN
          </button>
        </div>
      </motion.div>
    </>
  );
}
