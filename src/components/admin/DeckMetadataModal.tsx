"use client";

import React from "react";
import { X } from "lucide-react";
import { SystemDeck } from "@/hooks/admin/useAdmin";

interface DeckMetadataModalProps {
  editingDeck: SystemDeck | null;
  setIsDeckModalOpen: (open: boolean) => void;
  deckForm: Partial<SystemDeck>;
  setDeckForm: (form: Partial<SystemDeck>) => void;
  handleSaveDeckMetadata: () => void;
}

export function DeckMetadataModal({
  editingDeck,
  setIsDeckModalOpen,
  deckForm,
  setDeckForm,
  handleSaveDeckMetadata
}: DeckMetadataModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
            {editingDeck ? "CHỈNH SỬA THÔNG TIN BỘ BÀI" : "TẠO BỘ BÀI MỚI"}
          </h3>
          <button onClick={() => setIsDeckModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs font-bold">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mã bộ bài (ID Slug)</label>
            <input
              type="text"
              disabled={!!editingDeck}
              value={deckForm.id || ""}
              onChange={(e) => setDeckForm({ ...deckForm, id: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 disabled:bg-zinc-100 font-extrabold text-[#8C6D58]"
              placeholder="VD: sys_n5_verb"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Tên bộ bài (Tiêu đề)</label>
            <input
              type="text"
              value={deckForm.title || ""}
              onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: Động từ N5 cơ bản"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Cấp độ (Level)</label>
              <select
                value={deckForm.level || "N5"}
                onChange={(e) => setDeckForm({ ...deckForm, level: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
              >
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Thể loại (Type)</label>
              <select
                value={deckForm.type || "flashcard"}
                onChange={(e) => setDeckForm({ ...deckForm, type: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
              >
                <option value="flashcard">Flashcard</option>
                <option value="minigame_matching">Minigame Ghép Cặp</option>
                <option value="minigame_rush">Minigame Typing Rush</option>
                <option value="minigame_kanji">Minigame Kanji Dojo</option>
                <option value="story">Cốt truyện VN</option>
                <option value="chest">Rương phần thưởng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Chương (Chapter)</label>
              <input
                type="number"
                value={deckForm.chapter || 1}
                onChange={(e) => setDeckForm({ ...deckForm, chapter: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Thứ tự (Order)</label>
              <input
                type="number"
                value={deckForm.order || 1}
                onChange={(e) => setDeckForm({ ...deckForm, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Thưởng Xương (Coins)</label>
              <input
                type="number"
                value={deckForm.rewardCoins || 10}
                onChange={(e) => setDeckForm({ ...deckForm, rewardCoins: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Bộ bài điều kiện trước (Prerequisite ID)</label>
            <input
              type="text"
              value={deckForm.prerequisite || ""}
              onChange={(e) => setDeckForm({ ...deckForm, prerequisite: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="Nhập ID bộ bài bắt buộc học trước (nếu có)"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mô tả ngắn</label>
            <textarea
              value={deckForm.description || ""}
              onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[50px]"
              placeholder="Bộ từ vựng giúp học sinh làm quen với..."
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => setIsDeckModalOpen(false)}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveDeckMetadata}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
          >
            Xác nhận lưu
          </button>
        </div>
      </div>
    </div>
  );
}
