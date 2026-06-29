import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VNInteractableWord } from "@/utils/vnTextParser";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppStore, CustomDeck } from "@/store/useAppStore";

interface VNWordTooltipProps {
  word: VNInteractableWord | null;
  onClose: () => void;
}

export function VNWordTooltip({ word, onClose }: VNWordTooltipProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const customDecks = useAppStore((state) => state.customDecks);
  const addCustomDeck = useAppStore((state) => state.addCustomDeck);
  const updateCustomDeck = useAppStore((state) => state.updateCustomDeck);

  // Reset trạng thái lưu khi mở từ mới
  useEffect(() => {
    setIsSaved(false);
    setIsSaving(false);
  }, [word]);

  const handleSave = async () => {
    if (!word || isSaving) return;
    setIsSaving(true);
    try {
      let vnDeck = customDecks.find((d) => d.id === "custom_vn_collection");
      const isNewDeck = !vnDeck;

      let deckToUpdate: CustomDeck;

      if (isNewDeck) {
        deckToUpdate = {
          id: "custom_vn_collection",
          title: "Sưu tầm từ Truyện",
          description: "Các từ vựng lượm nhặt từ chế độ Visual Novel",
          level: "Sưu tầm",
          cards: [],
          count: 0,
          createdAt: new Date().toISOString(),
        };
      } else {
        // Create a copy to avoid direct state mutation
        deckToUpdate = { ...vnDeck };
      }

      // Kiểm tra xem từ đã tồn tại chưa
      const exists = deckToUpdate.cards.find((c: any) => c.word === word.word);
      if (exists) {
        toast("Từ này đã có trong bộ bài rồi!");
        setIsSaved(true);
        setTimeout(() => {
          onClose();
          setIsSaved(false);
        }, 1500);
        return;
      }

      const newCard = {
        id: `vn_card_${Date.now()}`,
        word: word.word,
        meaning: word.meaning,
        reading: word.reading,
        example_jp_formatted: word.reading
          ? `[${word.word}]{${word.reading}}`
          : word.word,
        example_vi: `(Từ vựng sưu tầm qua đoạn hội thoại)`,
      };

      // Create a new array for cards to ensure immutability
      deckToUpdate.cards = [...deckToUpdate.cards, newCard];
      deckToUpdate.count = deckToUpdate.cards.length;

      if (isNewDeck) {
        await addCustomDeck(deckToUpdate);
      } else {
        await updateCustomDeck(deckToUpdate);
      }

      setIsSaved(true);
      toast.success("Đã thêm vào bộ bài Sưu tầm!");

      // Tự động đóng pop-up sau 1.5s
      setTimeout(() => {
        onClose();
        setIsSaved(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi lưu từ vựng!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {word && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            className="relative w-[85%] max-w-[320px] bg-white/95 backdrop-blur-md rounded-[2rem] border border-white/60 p-7 shadow-[0_16px_48px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()} // Chặn click xuyên xuống nền làm đóng pop-up
          >
            {/* Nút Đóng */}
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 bg-white border border-zinc-200 rounded-full p-1.5 transition-colors active:scale-90 shadow-sm">
              <X size={16} strokeWidth={3} />
            </button>

            {/* Nội dung Từ vựng */}
            <div className="text-center mt-2 space-y-4">
              <div className="flex flex-col items-center justify-center min-h-[80px]">
                {/* Sử dụng ruby để hiển thị Furigana trực quan trên đầu Kanji */}
                <ruby className="text-5xl font-black text-zinc-800 tracking-wide select-all" style={{ fontFamily: "var(--font-cherry)" }}>
                  {word.word}
                  {word.reading && (
                    <rt className="text-sm font-extrabold text-[#5390D9] tracking-wider select-none mb-1 block">
                      {word.reading}
                    </rt>
                  )}
                </ruby>
              </div>

              {word.meaning && (
                <div className="mt-2">
                  <p className="text-zinc-700 font-bold text-base bg-zinc-50/80 p-4 rounded-2xl border border-dashed border-zinc-200/80 leading-relaxed">
                    {word.meaning}
                  </p>
                </div>
              )}
            </div>

            {/* Nút Hành động */}
            <button
              onClick={handleSave}
              disabled={isSaved || isSaving}
              className={`w-full mt-6 h-14 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 border transition-all active:scale-[0.98]
                ${isSaved
                  ? "bg-[#06D6A0]/15 backdrop-blur-sm border-[#06D6A0]/30 text-[#05B889]"
                  : isSaving
                    ? "bg-zinc-500/10 backdrop-blur-sm border-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-[#FF7096]/15 backdrop-blur-sm border-[#FF7096]/30 text-[#E25C80] hover:bg-[#FF7096]/25 hover:text-[#C7486B] shadow-sm"
                }
              `}
            >
              {isSaved ? (
                <><Check size={20} strokeWidth={3} /></>
              ) : isSaving ? (
                <><Loader2 size={20} strokeWidth={3} className="animate-spin" /></>
              ) : (
                <>Thêm vào thẻ </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}