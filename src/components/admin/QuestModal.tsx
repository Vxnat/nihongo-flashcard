"use client";

import React from "react";
import { X } from "lucide-react";

interface QuestModalProps {
  selectedQuest: any;
  setSelectedQuest: (quest: any) => void;
  dailyQuests: any[];
  setIsQuestModalOpen: (open: boolean) => void;
  handleSaveQuest: (quest: any) => void;
}

export function QuestModal({
  selectedQuest,
  setSelectedQuest,
  dailyQuests,
  setIsQuestModalOpen,
  handleSaveQuest
}: QuestModalProps) {
  const [form, setForm] = React.useState<any>({ ...selectedQuest });

  React.useEffect(() => {
    setForm({ ...selectedQuest });
  }, [selectedQuest]);

  const isEdit = dailyQuests.some(q => q.id === selectedQuest.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-sm p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
            {isEdit ? "SỬA NHIỆM VỤ" : "THÊM NHIỆM VỤ MỚI"}
          </h3>
          <button onClick={() => setIsQuestModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs font-bold">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mã nhiệm vụ (ID)</label>
            <input
              type="text"
              disabled={isEdit}
              value={form.id || ""}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl mt-1 disabled:bg-zinc-100 font-extrabold text-[#8C6D58]"
              placeholder="VD: q_flip_cards"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-450 uppercase">Tiêu đề nhiệm vụ</label>
            <input
              type="text"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: Lật 15 thẻ từ vựng"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-450 uppercase">Mục tiêu (Target)</label>
              <input
                type="number"
                value={form.target || 10}
                onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-450 uppercase">Thưởng Shiba Coin</label>
              <input
                type="number"
                value={form.reward || 1}
                onChange={(e) => setForm({ ...form, reward: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => setIsQuestModalOpen(false)}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
          >
            Hủy
          </button>
          <button
            onClick={() => handleSaveQuest(form)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
          >
            Xác nhận lưu
          </button>
        </div>
      </div>
    </div>
  );
}
