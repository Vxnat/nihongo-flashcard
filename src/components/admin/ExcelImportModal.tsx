"use client";

import React from "react";
import { X } from "lucide-react";

interface ExcelImportModalProps {
  setIsImportOpen: (open: boolean) => void;
  importText: string;
  setImportText: (text: string) => void;
  importDelimiter: "tab" | "comma";
  setImportDelimiter: (delim: "tab" | "comma") => void;
  handleImport: () => void;
}

export function ExcelImportModal({
  setIsImportOpen,
  importText,
  setImportText,
  importDelimiter,
  setImportDelimiter,
  handleImport
}: ExcelImportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
            NHẬP TỪ VỰNG HÀNG LOẠT (EXCEL/GOOGLE SHEETS)
          </h3>
          <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="text-xs font-bold text-zinc-500 space-y-2">
          <p>1. Định dạng cột copy từ Excel / Sheets phải theo thứ tự:</p>
          <div className="bg-zinc-50 border border-zinc-200 p-2 rounded-xl font-mono text-[10px] flex items-center justify-between text-zinc-650">
            <span>Từ chính (Kanji)</span>
            <span>Cách đọc (Hiragana)</span>
            <span>Ý nghĩa tiếng Việt</span>
            <span>Romaji</span>
          </div>
          <p>2. Chọn kiểu phân tách cột tương ứng:</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={importDelimiter === "tab"}
                onChange={() => setImportDelimiter("tab")}
              />
              Dấu Tab (Sao chép trực tiếp từ ô Excel/Sheets)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={importDelimiter === "comma"}
                onChange={() => setImportDelimiter("comma")}
              />
              Dấu phẩy (CSV)
            </label>
          </div>
        </div>

        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Dán các hàng từ vựng đã copy từ Excel vào đây...&#10;Ví dụ:&#10;私	わたし	Tôi	watashi&#10;学生	がくsei	Học sinh	gakusei"
          className="w-full h-48 px-3.5 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] outline-none rounded-2xl text-xs font-bold font-mono"
        />

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => setIsImportOpen(false)}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
          >
            Đóng
          </button>
          <button
            onClick={handleImport}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
          >
            Bắt đầu Nhập
          </button>
        </div>
      </div>
    </div>
  );
}
