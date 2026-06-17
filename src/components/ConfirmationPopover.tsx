import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationPopoverProps {
  message: string;
  costLabel: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode; // Nút kích hoạt popover
  popoverId: string; // ID duy nhất cho AnimatePresence
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export function ConfirmationPopover({
  message,
  costLabel,
  onConfirm,
  onCancel,
  open,
  setOpen,
  children,
  popoverId,
  confirmButtonText = "Dùng",
  cancelButtonText = "Hủy",
}: ConfirmationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Logic đóng popover khi click ra ngoài
  // (Sẽ được tích hợp vào HintButton hoặc component cha để quản lý trạng thái `open`)

  return (
    <div className="relative inline-block">
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            key={popoverId}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            ref={popoverRef}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-64 bg-[#FFFDF5] border-4 border-[#FFE2D1] rounded-[1.5rem] shadow-xl p-4 text-center"
            onClick={(e) => e.stopPropagation()} // Ngăn chặn click từ popover lan ra ngoài
          >
            <p className="font-rounded font-bold text-zinc-700 text-sm mb-3 leading-tight">
              {message}
            </p>
            <div className="flex items-start justify-center gap-1.5 mb-4">
              <span className="text-2xl text-[#FF9F1C] drop-shadow-sm"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {costLabel}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onCancel();
                  setOpen(false);
                }}
                className="flex-1 h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-xl transition-colors border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 text-sm"
              >
                {cancelButtonText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                className="flex-1 h-10 bg-[#FF7096] hover:bg-[#FF5C8A] text-white font-bold rounded-xl transition-colors border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 text-sm"
              >
                {confirmButtonText}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}