"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package } from "lucide-react";
import toast from "react-hot-toast";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInventoryItems: any[];
  isMetadataLoaded: boolean;
}

export function InventoryModal({
  isOpen,
  onClose,
  userInventoryItems,
  isMetadataLoaded,
}: InventoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDF9] border-4 border-[#FFE2D1] rounded-[2.5rem] p-6 shadow-2xl text-left max-w-sm sm:max-w-md w-full relative z-10 flex flex-col gap-4 max-h-[85vh] overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8C5E43] hover:text-[#5C3A21] transition-colors p-1.5 bg-[#FAF6EF] border border-[#FFE2D1] rounded-full cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-1 mt-2">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 mx-auto border-2 border-blue-100">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <h3
                className="text-2xl text-zinc-700 font-black"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Hành Trang
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-xs mt-2 px-4 leading-relaxed">
                Túi đồ chứa các sticker nhân vật và quà lưu niệm bạn thu thập được từ máy Gacha!
              </p>
            </div>

            {/* Inventory Grid Container */}
            <div className="flex-1 overflow-y-auto bg-[#FDFBF7] border-2 border-[#FFE2D1]/60 rounded-2xl p-4 shadow-inner min-h-[200px] max-h-[45vh] scrollbar-thin">
              {!isMetadataLoaded ? (
                <div className="grid grid-cols-4 gap-3 animate-pulse">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-zinc-200 rounded-xl" />
                  ))}
                </div>
              ) : userInventoryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2 h-full">
                  <Package size={32} className="text-zinc-400" />
                  <p className="font-rounded font-bold text-xs text-zinc-400">
                    Hành trang trống rỗng!<br />Hãy quay Gacha để tìm kiếm Sticker nhé!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5">
                  {userInventoryItems.map((item, idx) => (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      key={item.id + "-" + idx}
                      className="bg-white border-2 border-[#FFE2D1]/40 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm relative group cursor-pointer"
                      onClick={() => toast(`${item.title}: ${item.desc || ""}`)}
                    >
                      {/* Item Image */}
                      <div className="w-12 h-12 flex items-center justify-center select-none pointer-events-none mb-1.5">
                        <img
                          src={item.imageUrl || "/images/ui/badges/default.png"}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Item Title */}
                      <span className="font-rounded font-black text-[9px] text-zinc-600 line-clamp-1 w-full leading-tight">
                        {item.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full py-3 bg-[#FF9F1C] hover:bg-[#E08A12] text-white font-black font-rounded text-sm rounded-2xl border-b-4 border-[#C77A0F] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
