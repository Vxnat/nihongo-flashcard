"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { ShibaLoginCard } from "@/components/common/ShibaLoginCard";

interface ShibaLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function ShibaLoginModal({
  isOpen,
  onClose,
  title = "Căn Phòng Shiba",
  description = "Căn phòng Shiba đang đợi cậu trang trí! Đăng nhập ngay để nhận nuôi chú Shiba cưng, quay Gacha nội thất và thu hoạch xương vàng nhé!",
  onSuccess,
}: ShibaLoginModalProps) {
  const handleLoginSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="absolute inset-0" onClick={onClose} />

          <ShibaLoginCard
            title={title}
            description={description}
            variant="wood"
            mascotSrc="/images/mascot/shiba_heart.png"
            onSuccess={handleLoginSuccess}
            onClose={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

