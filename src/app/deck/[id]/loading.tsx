import React from "react";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full flex flex-col items-center pt-2 pb-10 min-h-[100dvh]">
      {/* ==========================================
          HEADER KẸO DẺO (SKELETON CHỜ TẢI)
          ========================================== */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between px-4">
        <button
          disabled
          className="flex items-center justify-center h-12 px-4 bg-white border-4 border-[#FFE2D1] rounded-[1.25rem] shadow-[0_4px_0_0_#FFE2D1] text-orange-400 opacity-60 cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5 mr-1.5" strokeWidth={3} />
          <span
            className="font-rounded font-bold text-sm tracking-wide"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Về nhà
          </span>
        </button>

        {/* Nhãn tên bộ bài nhấp nháy */}
        <div className="h-9 w-28 bg-[#FFD166]/50 animate-pulse rounded-[1.25rem]" />
      </div>

      {/* ==========================================
          KHU VỰC THẺ BÀI (SKELETON CUTE)
          ========================================== */}
      <div className="h-[400px] w-full max-w-md mx-auto bg-[#FFE2D1]/20 border-4 border-dashed border-[#FFE2D1]/50 rounded-[3rem] flex flex-col items-center justify-center">
        {/* GIF Linh vật */}
        <img
          src="/images/mascot-hi.gif"
          alt="Đang tải..."
          className="w-24 h-24 object-contain animate-bounce opacity-80"
        />
        {/* Chữ Cute */}
        <p
          className="mt-4 font-bold text-[#FF9F1C] tracking-widest text-xl drop-shadow-sm animate-pulse"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Chờ xíu...
        </p>
      </div>
    </div>
  );
}
