/**
 * Lấy tọa độ X cho các điểm mốc trên bản đồ.
 * - Circle (Nút số bên trái): x = -70
 * - Card/Chest (Thẻ bên phải): x = 65
 */
export function getMapPointX(isCard: boolean): number {
  return isCard ? 65 : -70;
}

/**
 * Sinh ra chuỗi <path d="..."> vẽ nên đường cong S-Curve đi qua các nút số (trái) và thẻ thông tin (phải).
 * @param nodeCount Tổng số bài học
 * @param rowHeight Chiều cao mỗi hàng (mặc định 180px)
 * @param startYOffset Vị trí bắt đầu Y
 */
export function generateSVGPath(
  nodeCount: number,
  rowHeight: number = 180,
  startYOffset: number = 0
): string {
  if (nodeCount <= 0) return "";

  let d = "";
  // Mỗi node có 2 điểm: Circle (Y = i*rowHeight + 35) và Card (Y = i*rowHeight + 105)
  for (let i = 0; i < nodeCount; i++) {
    const isEven = i % 2 === 0;
    const xCircle = isEven ? -70 : 70;
    const xCard = isEven ? 65 : -65;

    const yCircle = i * rowHeight + 35 + startYOffset;
    const yCard = i * rowHeight + 105 + startYOffset;

    // --- 1. Điểm bắt đầu hoặc nối từ hàng trước sang hàng này ---
    if (i === 0) {
      d += `M ${xCircle} ${yCircle} `; // Điểm bắt đầu
    } else {
      const prevIsEven = (i - 1) % 2 === 0;
      const prevXCard = prevIsEven ? 65 : -65;
      const prevYCard = (i - 1) * rowHeight + 105 + startYOffset;

      // Uốn từ Card hàng trước sang Circle hàng này (độ cao chênh lệch là 110px)
      // Thiết lập điểm kiểm soát dọc để đường cong đi ra/vào theo phương thẳng đứng mượt mà
      const cp1X = prevXCard;
      const cp1Y = prevYCard + 55;
      const cp2X = xCircle;
      const cp2Y = yCircle - 55;
      d += `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${xCircle} ${yCircle} `;
    }

    // --- 2. Nối từ Circle sang Card cùng hàng (độ cao chênh lệch là 70px) ---
    // Thiết lập điểm kiểm soát dọc để tạo đường cong S hoàn hảo đối xứng
    const cp1X = xCircle;
    const cp1Y = yCircle + 35;
    const cp2X = xCard;
    const cp2Y = yCard - 35;
    d += `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${xCard} ${yCard} `;
  }

  return d;
}