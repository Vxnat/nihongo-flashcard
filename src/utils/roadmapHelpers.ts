/**
 * Tính toán biên độ dịch chuyển (offset X) cho Node hiện tại dựa vào index.
 * Tạo hiệu ứng uốn lượn Zig-zag sang 2 bên trục giữa.
 */
export function getZigZagOffset(index: number): number {
  // Chu kỳ 8 bước uốn lượn (tương tự đồ thị hình sin)
  // Biên độ dao động tối đa 75px
  const cycle = [0, -45, -75, -45, 0, 45, 75, 45];
  return cycle[index % cycle.length];
}

/**
 * Sinh ra chuỗi <path d="..."> vẽ nên đường cong SVG đi qua tâm tất cả các nodes.
 * @param nodeCount Tổng số bài học
 * @param rowHeight Chiều cao ước tính giữa tâm node này đến tâm node kia (VD: 120px)
 * @param startYOffset Vị trí bắt đầu Y
 */
export function generateSVGPath(
  nodeCount: number,
  rowHeight: number = 130, 
  startYOffset: number = 0
): string {
  if (nodeCount <= 0) return "";
  if (nodeCount === 1) return `M 0 ${startYOffset} L 0 ${startYOffset + rowHeight}`;

  let d = "";
  for (let i = 0; i < nodeCount; i++) {
    const x = getZigZagOffset(i);
    const y = i * rowHeight + startYOffset;

    if (i === 0) {
      d += `M ${x} ${y} `; // Điểm bắt đầu
    } else {
      const prevX = getZigZagOffset(i - 1);
      const prevY = (i - 1) * rowHeight + startYOffset;
      
      // Sử dụng Cubic Bezier (C) để uốn cong mượt mà giữa điểm trước và điểm sau.
      // Kéo Control Point (cp1, cp2) thẳng đứng dọc theo trục Y để tạo bụng cong.
      const cp1X = prevX;
      const cp1Y = prevY + rowHeight / 2;
      const cp2X = x;
      const cp2Y = y - rowHeight / 2;

      d += `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y} `;
    }
  }
  return d;
}