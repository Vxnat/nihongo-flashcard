import React, { useState, useEffect, useMemo, ReactNode } from "react";

type Token = { type: "char"; value: string } | { type: "node"; value: ReactNode };

export function useTypewriter(
  nodes: ReactNode[],
  triggerKey: string, // Biến này để nhận biết khi nào đoạn hội thoại thay đổi (VD: currentNodeId)
  speed: number = 30
) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Chuyển mảng Component/String thành mảng Token từng ký tự một
  const tokens = useMemo(() => {
    const result: Token[] = [];
    nodes.forEach((node) => {
      if (typeof node === "string") {
        for (const char of node) {
          result.push({ type: "char", value: char });
        }
      } else if (typeof node === "number") {
        const str = (node as number).toString();
        for (const char of str) {
          result.push({ type: "char", value: char });
        }
      } else {
        // Nếu là ReactNode (VD: Nút bấm từ vựng), giữ nguyên cả khối
        result.push({ type: "node", value: node });
      }
    });
    return result;
  }, [triggerKey, nodes]);

  // 2. Reset hiệu ứng khi nhảy sang câu thoại mới
  useEffect(() => {
    setCurrentIndex(0);
  }, [triggerKey]);

  // 3. Logic tăng tiến độ chữ chạy
  useEffect(() => {
    if (currentIndex < tokens.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, tokens.length, speed]);

  const isTyping = currentIndex < tokens.length;

  const skipTypewriter = () => {
    setCurrentIndex(tokens.length);
  };

  // 4. Xây dựng lại mảng ReactNode từ tiến độ (currentIndex) hiện tại
  const displayedNodes = useMemo(() => {
    const displayedTokens = tokens.slice(0, currentIndex);
    const result: ReactNode[] = [];
    let currentString = "";

    displayedTokens.forEach((token, idx) => {
      if (token.type === "char") {
        currentString += token.value;
      } else {
        if (currentString) {
          result.push(currentString);
          currentString = ""; // Xả chuỗi cũ
        }
        // Bọc thêm key vào ReactNode để tránh warning của React
        if (React.isValidElement(token.value)) {
          result.push(React.cloneElement(token.value, { key: `node-${idx}` } as any));
        } else {
          result.push(token.value);
        }
      }
    });
    if (currentString) {
      result.push(currentString);
    }
    return result;
  }, [tokens, currentIndex]);

  return { displayedNodes, isTyping, skipTypewriter };
}