"use client";

import { useState, useEffect } from "react";
import { FlashcardData } from "@/types/flashcard";
import { playSFX } from "@/utils/sfx";

interface UseTypingModeProps {
  currentCard: FlashcardData;
  onCorrect: () => void; // Hàm trigger khi gõ đúng (vd: chuyển sang thẻ tiếp theo)
}

export function useTypingMode({ currentCard, onCorrect }: UseTypingModeProps) {
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"typing" | "wrong" | "correct">("typing");
  const [isShaking, setIsShaking] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // Quản lý số lượng ký tự được gợi ý

  // 1. Reset lại mọi trạng thái mỗi khi chuyển sang thẻ mới
  useEffect(() => {
    setInputValue("");
    setStatus("typing");
    setIsShaking(false);
    setHintLevel(0);
  }, [currentCard.id]);

  // 2. HÀM LÀM SẠCH VĂN BẢN (Chuẩn hóa)
  const normalizeText = (text: string) => {
    if (!text) return "";
    return text
      .toLowerCase() // Đưa về chữ thường hết
      .replace(/[\s\-\!\?\,\.\~]/g, ""); // Tiêu diệt toàn bộ khoảng trắng và dấu câu
  };

  // 3. LOGIC KIỂM TRA ĐÁP ÁN
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Chặn hành vi reload trang của form HTML
    if (!inputValue.trim()) return;

    const normalizedInput = normalizeText(inputValue);
    const expectedRomaji = normalizeText(currentCard.romaji || "");
    const expectedReading = normalizeText(currentCard.reading || ""); 

    // CHỐT CHẶN KIỂM TRA: So khớp với cả Romaji lẫn Kana (Hỗ trợ người dùng xài bàn phím tiếng Nhật)
    if (normalizedInput === expectedRomaji || normalizedInput === expectedReading) {
      setStatus("correct");
      
      // Delay một chút để người dùng kịp chiêm ngưỡng hiệu ứng gõ đúng trước khi bay sang câu khác
      setTimeout(() => {
        onCorrect();
      }, 1000); 
    } else {
      setStatus("wrong");
      setIsShaking(true); // Kích hoạt cờ rung lắc UI
      playSFX("fail"); // Kêu tiếng "Bóp 💦"
      
      // Tự động tắt cờ rung sau 0.5s để chuẩn bị cho lần gõ sai tiếp theo (nếu có)
      setTimeout(() => {
        setIsShaking(false);
        setStatus("typing"); // Đưa viền input về lại màu bình thường
      }, 500);
    }
  };

  // 4. LOGIC GỢI Ý (Phao bơi)
  const handleProvideHint = () => {
    const target = currentCard.romaji || currentCard.reading || "";
    // Chỉ nhá hàng tối đa đến sát ký tự cuối cùng, không cho luôn đáp án
    if (hintLevel < target.length - 1) {
      setHintLevel((prev) => prev + 1);
    }
  };

  // Helper sinh ra chuỗi gợi ý để render ra UI (Vd: k a w _ _ _)
  const getHintString = () => {
    const target = currentCard.romaji || "";
    if (hintLevel === 0) return "";
    
    const revealed = target.substring(0, hintLevel);
    const hidden = "_ ".repeat(target.length - hintLevel).trim();
    return `${revealed} ${hidden}`;
  };

  return {
    inputValue,
    setInputValue,
    status,
    isShaking,
    hintLevel,
    handleSubmit,
    handleProvideHint,
    getHintString
  };
}