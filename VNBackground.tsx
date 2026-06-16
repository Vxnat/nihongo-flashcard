import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VNBackgroundProps {
  src: string;
}

export function VNBackground({ src }: VNBackgroundProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={src} // Khi src đổi, key đổi -> component cũ unmount, component mới mount tạo hiệu ứng fade
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 z-0 bg-[#FFFDF5]"
      >
        {/* Tạm thời dùng màu Placeholder nếu bạn chưa có hình ảnh thật trong public/images/ */}
        <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
          <span className="text-zinc-300 font-bold opacity-50 absolute">
            {src || "Background"}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}