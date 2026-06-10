import React from 'react';

/**
 * Hàm phân tích cú pháp chuỗi có định dạng [Kanji]{furigana} 
 * và chuyển đổi thành React Nodes với thẻ <ruby> chuẩn HTML.
 * 
 * @param text Chuỗi đầu vào (VD: "[明日]{あした}、[彼]{かれ}と...")
 * @returns Mảng các React Nodes để render trực tiếp vào UI
 */
export function parseFurigana(text?: string): React.ReactNode {
  if (!text) return null;

  // Cụm Regex này chia chuỗi thành các phần dựa trên format [Bất_kỳ_chữ_gì]{Bất_kỳ_chữ_gì}
  // Ví dụ: "[明日]{あした}、行く" -> Mảng 3 phần: "", "[明日]{あした}", "、行く"
  const regex = /(\[[^\]]+\]\{[^\}]+\})/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Kiểm tra xem phần tử hiện tại có khớp với format [Kanji]{furigana} không
    const match = part.match(/\[([^\]]+)\]\{([^\}]+)\}/);

    if (match) {
      const kanji = match[1]; // Lấy phần trong dấu ngoặc vuông []
      const furigana = match[2]; // Lấy phần trong dấu ngoặc nhọn {}

      return (
        <ruby key={index} className="mx-[2px]">
          {kanji}
          {/* Thẻ <rt> chứa furigana, dùng Tailwind để chỉnh kích thước chữ nhỏ lại */}
          <rt className="text-[0.6em] text-muted-foreground select-none">
            {furigana}
          </rt>
        </ruby>
      );
    }

    // Nếu là text bình thường (như dấu câu, chữ hiragana/katakana không có ngoặc), thì in ra bình thường
    return <span key={index}>{part}</span>;
  });
}