import React from 'react';

/**
 * Hàm phân tích cú pháp chuỗi có định dạng [Kanji]{furigana} 
 * và chuyển đổi thành React Nodes với thẻ <ruby> chuẩn HTML.
 * 
 * @param text Chuỗi đầu vào (VD: "[明日]{あした}、[彼]{かれ}と...")
 * @returns Mảng các React Nodes để render trực tiếp vào UI
 */
export function parseFurigana(text?: string, showFurigana: boolean = true): React.ReactNode {
  if (!text) return null;

  const regex = /(\[[^\]]+\]\{[^\}]+\})/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const match = part.match(/\[([^\]]+)\]\{([^\}]+)\}/);

    if (match) {
      const kanji = match[1];
      const furigana = match[2];

      return (
        <ruby key={index} className="mx-[2px]">
          {kanji}
          {/* TÀNG HÌNH FURIGANA NHƯNG GIỮ NGUYÊN KHUNG CHỮ */}
          <rt 
            className={`text-[0.6em] text-teal-600/80 select-none transition-opacity duration-300 ${
              showFurigana ? "opacity-100" : "opacity-0"
            }`}
          >
            {furigana}
          </rt>
        </ruby>
      );
    }
    return <span key={index}>{part}</span>;
  });
}