"use client";

import React from "react";
import { Download, Plus, Search, Edit3, Trash2, Save, Upload } from "lucide-react";
import { SystemDeck, CardData } from "@/types/flashcard";

interface DecksTabProps {
  decks: SystemDeck[];
  filteredDecks: SystemDeck[];
  selectedDeck: SystemDeck | null;
  setSelectedDeck: (deck: SystemDeck | null) => void;
  cards: CardData[];
  cardSearch: string;
  setCardSearch: (query: string) => void;
  selectedCard: CardData | null;
  setSelectedCard: (card: CardData | null) => void;
  setIsImportOpen: (open: boolean) => void;
  levelFilter: string;
  setLevelFilter: (level: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  handleBackupData: () => void;
  handleCreateNewDeck: () => void;
  handleEditDeckMetadata: (deck: SystemDeck) => void;
  handleDeleteDeck: (deck: SystemDeck) => void;
  loadDeckCards: (deck: SystemDeck) => void;
  handleSaveDeck: () => void;
  handleAddCard: () => void;
  handleCardDelete: (cardId: string) => void;
  loadSystemDecks: () => void;
}

export function DecksTab({
  filteredDecks,
  selectedDeck,
  cards,
  cardSearch,
  setCardSearch,
  setSelectedCard,
  setIsImportOpen,
  levelFilter,
  setLevelFilter,
  typeFilter,
  setTypeFilter,
  handleBackupData,
  handleCreateNewDeck,
  handleEditDeckMetadata,
  handleDeleteDeck,
  loadDeckCards,
  handleSaveDeck,
  handleAddCard,
  handleCardDelete,
  loadSystemDecks
}: DecksTabProps) {
  if (!selectedDeck) {
    return (
      <div className="space-y-4" style={{ fontFamily: "var(--font-rounded)" }}>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-zinc-700 text-sm">Danh Sách Các Bộ Bài Học Hệ Thống</h3>
            <p className="text-xs text-zinc-400 font-bold">Các cấu hình này nằm trong system_decks.json</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupData}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Download size={14} /> Sao lưu toàn bộ JSON
            </button>
            <button
              onClick={handleCreateNewDeck}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Tạo bộ bài mới
            </button>
            <button
              onClick={loadSystemDecks}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 font-black text-xs rounded-xl cursor-pointer"
            >
              Tải Lại
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          {/* Level Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-black text-zinc-500 min-w-[100px]">Cấp độ:</span>
            <div className="flex flex-wrap gap-2">
              {["all", "N5", "N4", "N3", "N2", "N1"].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${levelFilter === lvl
                      ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                      : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                >
                  {lvl === "all" ? "Tất cả" : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-zinc-100">
            <span className="text-xs font-black text-zinc-500 min-w-[100px]">Thể loại:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Tất cả" },
                { key: "flashcard", label: "Flashcard" },
                { key: "kanji", label: "Kanji" },
                { key: "minigame", label: "Minigame" },
                { key: "other", label: "Cốt truyện & Rương" }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${typeFilter === t.key
                      ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                      : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredDecks.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-zinc-300 p-8 rounded-3xl text-center text-zinc-400 font-bold text-sm">
            Không tìm thấy bộ thẻ nào phù hợp với bộ lọc! 🐶
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map(deck => (
              <div
                key={deck.id}
                className="bg-white border-2 border-zinc-200/80 hover:border-[#8C6D58] p-4 rounded-3xl flex flex-col justify-between min-h-[140px] shadow-xs relative transition-all"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase bg-[#8C6D58]/10 text-[#8C6D58] px-2 py-0.5 rounded-md">
                      Cấp độ: {deck.level}
                    </span>
                    {deck.type && (
                      <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                        {deck.type}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-zinc-700 mt-2 line-clamp-1">{deck.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-bold mt-1">ID: {deck.id}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                  <span className="text-xs font-black text-zinc-500">
                    {deck.totalCards || 0} thẻ bài
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditDeckMetadata(deck)}
                      className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-600 rounded-lg cursor-pointer"
                      title="Sửa thông tin bộ bài"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-lg cursor-pointer"
                      title="Xóa bộ bài"
                    >
                      <Trash2 size={12} />
                    </button>
                    {deck.type && (deck.type.startsWith("minigame") || deck.type === "chest") ? (
                      <span className="text-[10px] font-bold text-purple-400 italic">Dữ liệu tự động</span>
                    ) : (
                      <button
                        onClick={() => loadDeckCards(deck)}
                        className="px-3.5 py-1.5 bg-[#8C6D58] hover:bg-[#735642] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer animate-pulse"
                      >
                        Sửa từ vựng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Inside selected deck card table editor
  const searchedCards = cards.filter(c =>
    c.word.toLowerCase().includes(cardSearch.toLowerCase()) ||
    c.meaning.toLowerCase().includes(cardSearch.toLowerCase()) ||
    c.reading.toLowerCase().includes(cardSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Tìm từ vựng, ý nghĩa..."
              value={cardSearch}
              onChange={(e) => setCardSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
            />
          </div>
          <span className="text-xs font-bold text-zinc-400 shrink-0">
            Hiển thị: {searchedCards.length} / {cards.length} thẻ
          </span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleAddCard}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} /> Thêm từ mới
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Upload size={14} /> Nhập từ Excel
          </button>
          <button
            onClick={handleSaveDeck}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Save size={14} /> LƯU BỘ BÀI
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 font-black text-zinc-500 uppercase tracking-wider">
              <th className="p-4 w-40">Kanji</th>
              <th className="p-4 w-40">Hiragana</th>
              <th className="p-4 w-40">Romaji</th>
              <th className="p-4">Nghĩa tiếng Việt</th>
              <th className="p-4 w-32 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-bold text-zinc-700">
            {searchedCards.map((card) => (
              <tr key={card.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-4 font-extrabold text-sm text-zinc-800">{card.word}</td>
                <td className="p-4 text-zinc-600">{card.reading}</td>
                <td className="p-4 text-zinc-400 italic">{card.romaji}</td>
                <td className="p-4 text-zinc-600 truncate max-w-xs">{card.meaning}</td>
                <td className="p-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedCard(card)}
                    className="p-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-600 rounded-lg cursor-pointer"
                    title="Sửa từ vựng"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleCardDelete(card.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-lg cursor-pointer"
                    title="Xóa từ vựng"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-400 italic">
                  Chưa có thẻ bài nào trong bộ này. Nhấp 'Thêm từ mới' hoặc 'Nhập từ Excel' để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
