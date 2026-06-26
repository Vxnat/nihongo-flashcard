import { FlashcardData } from "@/types/flashcard";

interface WordStat {
  correctCount: number;
  wrongCount: number;
}

/**
 * Lựa chọn và phân bổ từ vựng thông minh dựa trên lịch sử ghi nhớ (wordStats) của người học.
 * Ưu tiên các từ yếu (làm sai nhiều), tiếp theo là các từ ôn tập (làm đúng nhiều), và bù đắp bằng từ mới/khác.
 * 
 * @param allCards Danh sách tất cả các thẻ từ vựng có sẵn
 * @param wordStats Bản đồ thống kê ghi nhớ từ vựng của người dùng
 * @param limit Số lượng từ vựng tối đa cần lấy ra
 * @param weakRatio Tỷ lệ mục tiêu của nhóm từ yếu (mặc định 0.35 - 35%)
 * @param reviewRatio Tỷ lệ mục tiêu của nhóm từ ôn tập (mặc định 0.25 - 25%)
 */
export function selectAdaptiveCards(
  allCards: FlashcardData[],
  wordStats: Record<string, WordStat>,
  limit: number,
  weakRatio = 0.35,
  reviewRatio = 0.25
): FlashcardData[] {
  if (allCards.length === 0) return [];
  const actualLimit = Math.min(allCards.length, limit);

  // 1. Phân loại và sắp xếp từ yếu (làm sai nhiều nhất lên trước)
  const weakCards = allCards
    .filter((card) => {
      const stat = wordStats[card.id];
      return stat && stat.wrongCount > 0;
    })
    .sort((a, b) => {
      const statA = wordStats[a.id];
      const statB = wordStats[b.id];
      return (statB?.wrongCount || 0) - (statA?.wrongCount || 0);
    });

  // 2. Phân loại và sắp xếp từ đã thuộc cần ôn tập (làm đúng nhiều nhất lên trước)
  const reviewCards = allCards
    .filter((card) => {
      const stat = wordStats[card.id];
      return stat && stat.correctCount > (stat.wrongCount || 0);
    })
    .sort((a, b) => {
      const statA = wordStats[a.id];
      const statB = wordStats[b.id];
      return (statB?.correctCount || 0) - (statA?.correctCount || 0);
    });

  // 3. Nhóm từ khác (từ mới hoặc chưa có chỉ số)
  const otherCards = allCards.filter(
    (card) => !weakCards.some((c) => c.id === card.id) && !reviewCards.some((c) => c.id === card.id)
  );

  // Tính số lượng mục tiêu cho từng nhóm
  const weakCountTarget = Math.max(1, Math.round(actualLimit * weakRatio));
  const reviewCountTarget = Math.max(1, Math.round(actualLimit * reviewRatio));

  const selectedMap = new Map<string, FlashcardData>();

  // Thêm từ yếu vào danh sách
  weakCards.slice(0, weakCountTarget).forEach((card) => {
    selectedMap.set(card.id, card);
  });

  // Thêm từ ôn tập vào danh sách
  for (const card of reviewCards) {
    if (selectedMap.size >= weakCountTarget + reviewCountTarget) break;
    selectedMap.set(card.id, card);
  }

  // Điền đầy bằng các từ mới/khác
  const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
  for (const card of shuffledOthers) {
    if (selectedMap.size >= actualLimit) break;
    selectedMap.set(card.id, card);
  }

  // Dự phòng nếu chưa đủ số lượng limit (ví dụ do trùng lặp hoặc mảng rỗng)
  const shuffledAll = [...allCards].sort(() => Math.random() - 0.5);
  for (const card of shuffledAll) {
    if (selectedMap.size >= actualLimit) break;
    selectedMap.set(card.id, card);
  }

  // Xáo trộn ngẫu nhiên danh sách đã chọn trước khi trả về
  return Array.from(selectedMap.values()).sort(() => Math.random() - 0.5);
}
