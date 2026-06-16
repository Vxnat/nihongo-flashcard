import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VNInteractableWord } from "@/utils/vnTextParser";
import { X, Plus, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface VNWordTooltipProps {
  word: VNInteractableWord | null;
  onClose: () => void;
}

export function VNWordTooltip({ word, onClose }: VNWordTooltipProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Reset trạng thái lưu khi mở từ mới
  useEffect(() => {
    setIsSaved(false);
  }, [word]);

  const handleSave = () => {
    if (!word) return;
    try {
      const savedDecksStr = localStorage.getItem("customDecks");
      const savedDecks = savedDecksStr ? JSON.parse(savedDecksStr) : [];
      
      // Tìm hoặc tạo bộ bài "Sưu tầm từ Truyện"
      let vnDeck = savedDecks.find((d: any) => d.id === "vn_collection");
      if (!vnDeck) {
        vnDeck = {
          id: "vn_collection",
          title: "Sưu tầm từ Truyện 📖",
          description: "Các từ vựng lượm nhặt từ chế độ Visual Novel",
          level: "Khác",
          cards: []
        };
        savedDecks.push(vnDeck);
      }
      
      // Kiểm tra xem từ đã tồn tại chưa
      const exists = vnDeck.cards.find((c: any) => c.word === word.word);
      if (!exists) {
        vnDeck.cards.push({
          id: `vn_card_${Date.now()}`,
          word: word.word,
          meaning: word.meaning,
          reading: word.reading,
          // Format cho TextParser hiển thị Furigana (nếu có thẻ mẫu)
          example_jp_formatted: word.reading ? `[${word.word}]{${word.reading}}` : word.word,
          example_vi: `(Từ vựng sưu tầm qua đoạn hội thoại)`
        });
        localStorage.setItem("customDecks", JSON.stringify(savedDecks));
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative w-[85%] max-w-[320px] bg-[#FFFDF5] rounded-[2.5rem] border-4 border-[#FFE2D1] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Chặn click xuyên xuống nền làm đóng pop-up
          >
            {/* Nút Đóng */}
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 bg-white border-2 border-[#FFE2D1] rounded-full p-1.5 transition-colors active:scale-90">
              <X size={18} strokeWidth={3} />
            </button>

            {/* Nội dung Từ vựng */}
            <div className="text-center mt-2 space-y-3">
              <h3 className="text-5xl font-bold text-zinc-800 drop-shadow-sm mb-4" style={{ fontFamily: "var(--font-cherry)" }}>
                {word.word}
              </h3>
              {word.reading && (
                <div className="inline-flex">
                  <span className="text-lg font-bold text-[#FF9F1C] tracking-wider bg-orange-50 px-4 py-1.5 rounded-2xl border-2 border-orange-100 shadow-inner">{word.reading}</span>
                </div>
              )}
              {word.meaning && (
                <div className="mt-4"><p className="text-zinc-600 font-bold text-lg bg-white p-4 rounded-2xl border-2 border-dashed border-[#FFE2D1]">{word.meaning}</p></div>
              )}
            </div>

            {/* Nút Hành động */}
            <button onClick={handleSave} disabled={isSaved} className={`w-full mt-6 h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 transition-all ${isSaved ? "bg-[#06D6A0] border-[#048c68] text-white" : "bg-[#FF7096] hover:bg-[#FF5C8A] border-[#C7486B] text-white"}`}>
              {isSaved ? <><Check size={24} strokeWidth={3} /> Đã lưu thẻ</> : <><Plus size={24} strokeWidth={3} /> Thêm vào thẻ</>}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}