/**
 * Thông tin chi tiết về chữ Hán (Kanji) cấu tạo nên từ vựng
 */
export interface KanjiInfo {
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
}

/**
 * Phân loại từ vựng (Part of Speech)
 * Sử dụng Union Types thay vì string để Typescript bắt lỗi nếu gõ sai từ loại
 */
export type PartOfSpeech = 
  | "noun" // Danh từ
  | "verb_transitive" // Tha động từ (他動詞)
  | "verb_intransitive" // Tự động từ (自動詞)
  | "verb_general" // Động từ chung (nếu chưa phân loại)
  | "adjective_i" // Tính từ đuôi -i
  | "adjective_na" // Tính từ đuôi -na
  | "adverb" // Phó từ
  | "particle" // Trợ từ
  | "expression"; // Cụm từ / Quán dụng ngữ

/**
 * Cấp độ JLPT
 */
export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

/**
 * Cấu trúc chuẩn của một thẻ Flashcard
 */
export interface FlashcardData {
  id: string;
  word: string; // Từ vựng gốc (thường chứa Kanji)
  char?: string;
  reading: string; // Cách đọc bằng Hiragana/Katakana
  romaji: string; // Phiên âm Romaji
  meaning: string; // Ý nghĩa tiếng Việt
  
  pos: PartOfSpeech;
  pitch_accent?: string; // (Tùy chọn) Trọng âm, ví dụ: "heiban", "atamadaka", hoặc "0", "1"
  
  example_jp: string; // Câu ví dụ tiếng Nhật (plain text)
  example_jp_formatted?: string; // (Tùy chọn) Câu ví dụ có định dạng để parse Furigana. VD: "[明日]{あした}..."
  example_vi: string; // Câu ví dụ tiếng Việt
  
  level: JLPTLevel;
  tags: string[]; // Mảng các tag để lọc (VD: ["giao-tiếp", "IT"])
  notes?: string; // (Tùy chọn) Ghi chú thêm về cách dùng ngữ cảnh
  
  synonyms: string[]; // Từ đồng nghĩa
  antonyms: string[]; // Từ trái nghĩa
  
  kanji_info: KanjiInfo[]; // Danh sách các chữ Hán trong từ
  audio_url?: string; // (Tùy chọn) Link file âm thanh
}

/**
 * Cấu trúc thông tin của một bộ thẻ từ vựng hệ thống (System Deck)
 */
export interface SystemDeck {
  id: string;
  title: string;
  level: string;
  chapter: number;
  order: number;
  prerequisite: string | null;
  rewardCoins: number;
  totalCards?: number;
  description?: string;
  type?: "flashcard" | "story" | "chest" | "minigame_matching" | "minigame_kanji" | "minigame_rush" | string;
  targetDeckIds?: string[];
  kanjiList?: { char: string; meaning: string }[];
}

/**
 * Dữ liệu thẻ từ rút gọn/đơn giản hóa dùng cho các chức năng Import/Admin
 */
export interface CardData {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  pos?: string;
  notes?: string;
  example_jp?: string;
  example_jp_formatted?: string;
  example_vi?: string;
  tags?: string[];
  synonyms?: string[];
  antonyms?: string[];
}