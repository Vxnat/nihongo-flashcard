import React from "react";

export interface VNInteractableWord {
  id: string;
  word: string;
  reading?: string;
  meaning?: string;
}

export const parseVNText = (
  text: string,
  interactableWords: VNInteractableWord[],
  onWordClick?: (word: VNInteractableWord) => void
): React.ReactNode[] => {
  if (!text) return [];
  if (!interactableWords || interactableWords.length === 0) {
    return [text];
  }

  // Sắp xếp theo độ dài giảm dần để ưu tiên quét các từ ghép dài trước (VD: "東京" quét trước "京")
  const sortedWords = [...interactableWords].sort((a, b) => b.word.length - a.word.length);

  // Escape các ký tự đặc biệt trong Regex và gom nhóm lại
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexPattern = `(${sortedWords.map((w) => escapeRegExp(w.word)).join("|")})`;
  const regex = new RegExp(regexPattern, "g");

  const parts = text.split(regex);

  return parts
    .map((part, index) => {
      const matchedWord = sortedWords.find((w) => w.word === part);
      if (matchedWord) {
        return (
          <span
            key={`${matchedWord.id}-${index}`}
            onClick={(e) => {
              e.stopPropagation(); // Chặn sự kiện click lan ra khung thoại bên ngoài
              onWordClick && onWordClick(matchedWord);
            }}
            className="text-[#FF9F1C] border-b-2 border-dashed border-[#FF9F1C]/60 hover:bg-[#FFD166]/20 transition-colors cursor-pointer px-0.5 rounded-sm font-bold"
          >
            {part}
          </span>
        );
      }
      return part; // Trả về chuỗi bình thường nếu không khớp
    })
    .filter((part) => part !== ""); // Lọc bỏ các khoảng trắng thừa do .split() tạo ra
};