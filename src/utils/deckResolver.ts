/**
 * Phân giải thư mục lưu trữ dựa trên loại bộ bài (type).
 *
 * @param type Loại bộ bài (ví dụ: "flashcard", "minigame_kanji", "minigame_fill")
 * @returns Tên thư mục con tương ứng ("minna", "kanji", "grammar")
 */
export function getDeckFolder(type?: string): string {
  if (type === "minigame_kanji") {
    return "kanji";
  }
  if (type === "minigame_fill") {
    return "grammar";
  }
  return "minna";
}
