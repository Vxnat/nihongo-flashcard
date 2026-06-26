"use client";

import React from "react";
import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import Image from "next/image";

interface QuestsTabProps {
  filteredQuests: any[];
  questSearch: string;
  setQuestSearch: (query: string) => void;
  handleCreateQuest: () => void;
  handleEditQuest: (quest: any) => void;
  handleDeleteQuest: (questId: string) => void;
}

export function QuestsTab({
  filteredQuests,
  questSearch,
  setQuestSearch,
  handleCreateQuest,
  handleEditQuest,
  handleDeleteQuest
}: QuestsTabProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-[#8C6D58] uppercase">Cấu hình Nhiệm vụ hàng ngày (Tĩnh)</h3>
          <p className="text-xs text-zinc-400 font-bold">Các nhiệm vụ này reset vào mỗi ngày mới. Phần thưởng được tính bằng Shiba Coin.</p>
        </div>
        <button
          onClick={handleCreateQuest}
          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={12} /> Thêm nhiệm vụ
        </button>
      </div>

      {/* Quests search filter */}
      <div className="flex items-center gap-3 pt-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm nhiệm vụ theo tên, ID..."
            value={questSearch}
            onChange={(e) => setQuestSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredQuests.map((quest) => (
          <div key={quest.id} className="p-4 border border-zinc-200 rounded-2xl bg-zinc-50/50 flex justify-between items-center gap-4 hover:border-[#8C6D58] hover:border-2 transition-all">
            <div>
              <h4 className="text-xs font-black text-zinc-700">{quest.title}</h4>
              <p className="text-[10px] text-zinc-400 font-bold">Mục tiêu: {quest.target} | ID: {quest.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shrink-0 flex items-center gap-1">
                <Image src="/images/ui/shiba-room/golden_shiba_coin.png" alt="Shiba Coin" className="w-3.5 h-3.5 object-contain" /> +{quest.reward}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditQuest(quest)}
                  className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                  title="Sửa nhiệm vụ"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => handleDeleteQuest(quest.id)}
                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                  title="Xóa nhiệm vụ"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredQuests.length === 0 && (
          <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy nhiệm vụ nào phù hợp.</p>
        )}
      </div>
    </div>
  );
}
