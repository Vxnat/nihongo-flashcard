"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit3, Trash2, Save, RotateCcw, Palette, Shirt, Sofa, Mic, Smile, Tag, Sparkles, Scale, AlertTriangle } from "lucide-react";
import { CoinIcon } from "../common/CoinIcon";

const TYPE_WEIGHT_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }> = {
  theme: { label: "Theme", icon: Palette, color: "#8B5CF6" },
  outfit: { label: "Outfit", icon: Shirt, color: "#EC4899" },
  furniture: { label: "Furniture", icon: Sofa, color: "#F59E0B" },
  voice: { label: "Voice", icon: Mic, color: "#3B82F6" },
  meme: { label: "Meme", icon: Smile, color: "#10B981" },
  accessory: { label: "Accessory", icon: Tag, color: "#6366F1" },
  costume: { label: "Costume", icon: Sparkles, color: "#F97316" },
};

interface GachaShopTabProps {
  filteredGachaPool: any[];
  gachaRarityFilter: string;
  setGachaRarityFilter: (rarity: string) => void;
  gachaTypeFilter: string;
  setGachaTypeFilter: (type: string) => void;
  gachaSearch: string;
  setGachaSearch: (query: string) => void;
  handleCreateGachaItem: () => void;
  handleEditGachaItem: (item: any) => void;
  handleDeleteGachaItem: (itemId: string) => void;
  filteredShopExclusives: any[];
  handleCreateShopItem: (type: "exclusive" | "consumable") => void;
  handleEditShopItem: (item: any, type: "exclusive" | "consumable") => void;
  handleDeleteShopItem: (itemId: string, type: "exclusive" | "consumable") => void;
  filteredShopConsumables: any[];
  typeWeights: Record<string, number>;
  handleSaveTypeWeights: (weights: Record<string, number>) => void;
  handleClearAllItems: () => Promise<void>;
  handleSeedGachaAndShop?: () => Promise<void>;
}

export function GachaShopTab({
  filteredGachaPool,
  gachaRarityFilter,
  setGachaRarityFilter,
  gachaTypeFilter,
  setGachaTypeFilter,
  gachaSearch,
  setGachaSearch,
  handleCreateGachaItem,
  handleEditGachaItem,
  handleDeleteGachaItem,
  filteredShopExclusives,
  handleCreateShopItem,
  handleEditShopItem,
  handleDeleteShopItem,
  filteredShopConsumables,
  typeWeights,
  handleSaveTypeWeights,
  handleClearAllItems,
  handleSeedGachaAndShop,
}: GachaShopTabProps) {
  const [localWeights, setLocalWeights] = useState<Record<string, number>>(typeWeights);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalWeights(typeWeights);
    setHasChanges(false);
  }, [typeWeights]);

  const handleWeightChange = (type: string, value: number) => {
    const updated = { ...localWeights, [type]: value };
    setLocalWeights(updated);
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(typeWeights));
  };

  const handleReset = () => {
    setLocalWeights(typeWeights);
    setHasChanges(false);
  };

  const handleSave = () => {
    handleSaveTypeWeights(localWeights);
    setHasChanges(false);
  };

  // Calculate total weight for percentage display
  const totalWeight = Object.values(localWeights).reduce((sum, w) => sum + w, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-rounded)" }}>
      {/* Type Weights Editor */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-black text-zinc-700 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#8C6D58]" /> Trọng Số Loại Vật Phẩm (Type Weights)
            </h3>
            <p className="text-xs text-zinc-400 font-bold mt-0.5">
              Trọng số càng thấp → loại đó càng hiếm khi được chọn trong cùng một rarity
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border transition-all ${hasChanges
                ? "bg-zinc-100 border-zinc-300 text-zinc-600 hover:bg-zinc-200"
                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                }`}
            >
              <RotateCcw size={12} /> Hoàn tác
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border transition-all ${hasChanges
                ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                }`}
            >
              <Save size={12} /> Lưu Weights
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.keys(TYPE_WEIGHT_LABELS).map((type) => {
            const info = TYPE_WEIGHT_LABELS[type];
            const weight = localWeights[type] ?? 100;
            const percent = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : "0";
            return (
              <div
                key={type}
                className="p-3 rounded-xl border-2 transition-all hover:shadow-md"
                style={{ borderColor: `${info.color}30`, background: `${info.color}08` }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <info.icon className="w-4 h-4" style={{ color: info.color }} />
                  <span className="text-[11px] font-black uppercase" style={{ color: info.color }}>
                    {info.label}
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={weight}
                  onChange={(e) => handleWeightChange(type, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 border-2 rounded-lg text-sm font-black text-center outline-none transition-colors"
                  style={{
                    borderColor: `${info.color}40`,
                    color: info.color,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = info.color)}
                  onBlur={(e) => (e.target.style.borderColor = `${info.color}40`)}
                />
                <p className="text-[10px] font-bold text-zinc-400 text-center mt-1.5">
                  ≈ {percent}%
                </p>
              </div>
            );
          })}
        </div>

        {hasChanges && (
          <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[11px] font-bold text-amber-700">
              Bạn có thay đổi chưa lưu. Nhấn &quot;Lưu Weights&quot; để áp dụng vào hệ thống Gacha.
            </p>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-zinc-700 text-sm">Tìm kiếm & Bộ lọc Vật phẩm</h3>
            <p className="text-xs text-zinc-400 font-bold">Tìm và lọc vật phẩm trong Gacha Pool & Cửa hàng</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, ID..."
              value={gachaSearch}
              onChange={(e) => setGachaSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-zinc-400 uppercase">Độ hiếm Gacha:</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "Tất cả" },
                { key: "common", label: "Common" },
                { key: "rare", label: "Rare" },
                { key: "epic", label: "Epic" },
                { key: "legendary", label: "Legendary" },
                { key: "mythic", label: "Mythic" },
                { key: "divine", label: "Divine" }
              ].map(r => (
                <button
                  key={r.key}
                  onClick={() => setGachaRarityFilter(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${gachaRarityFilter === r.key
                    ? "bg-[#8C6D58] border-[#8C6D58] text-white shadow-xs"
                    : "bg-[#FAF6EE] border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-zinc-400 uppercase">Loại Gacha:</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "Tất cả" },
                { key: "accessory", label: "Accessory" },
                { key: "furniture", label: "Furniture" },
                { key: "outfit", label: "Outfit" },
                { key: "theme", label: "Theme" },
                { key: "meme", label: "Meme" },
                { key: "voice", label: "Voice" },
                { key: "costume", label: "Costume" }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setGachaTypeFilter(t.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${gachaTypeFilter === t.key
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
      </div>

      {/* Gacha Pool List */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-[#8C6D58] uppercase">Danh Sách Vật Phẩm Gacha Pool ({filteredGachaPool.length})</h3>
          <div className="flex gap-2">
            {/* {handleSeedGachaAndShop && (
              <button
                onClick={handleSeedGachaAndShop}
                className="px-3.5 py-1.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
              >
                Seed Mẫu Vật Phẩm
              </button>
            )} */}
            <button
              onClick={handleClearAllItems}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
            >
              <Trash2 size={12} /> Xóa sạch vật phẩm
            </button>
            <button
              onClick={handleCreateGachaItem}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <Plus size={12} /> Thêm vật phẩm
            </button>
          </div>
        </div>
        {filteredGachaPool.length === 0 ? (
          <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy vật phẩm Gacha nào phù hợp.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredGachaPool.map((item) => (
              <div key={item.id} className="p-3 border border-zinc-200 rounded-2xl flex items-center justify-between gap-2 bg-zinc-50/50 hover:border-[#8C6D58] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-zinc-200 shrink-0 p-1">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-zinc-700 truncate text-[#8C6D58]">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                      {item.rarity} | {item.type} {item.weight !== undefined && item.weight !== null && `| w: ${item.weight}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEditGachaItem(item)}
                    className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                    title="Sửa vật phẩm"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteGachaItem(item.id)}
                    className="p-1 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                    title="Xóa vật phẩm"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exclusives */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-[#8C6D58] uppercase">Vật Phẩm Cửa Hàng Độc Quyền ({filteredShopExclusives.length})</h3>
            <button
              onClick={() => handleCreateShopItem("exclusive")}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus size={10} /> Thêm đồ
            </button>
          </div>
          <div className="space-y-3">
            {filteredShopExclusives.map((item) => (
              <div key={item.id} className="p-3 border border-zinc-150 rounded-2xl flex items-center justify-between gap-2 hover:border-[#8C6D58] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.imageUrl} className="w-10 h-10 object-contain rounded-lg bg-zinc-50 border p-1" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-zinc-700">{item.name}</h4>
                    <p className="text-[9px] text-zinc-400 font-bold line-clamp-1">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CoinIcon /> {item.cost}
                  </span>
                  <button
                    onClick={() => handleEditShopItem(item, "exclusive")}
                    className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteShopItem(item.id, "exclusive")}
                    className="p-1 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {filteredShopExclusives.length === 0 && (
              <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy vật phẩm cửa hàng độc quyền nào phù hợp.</p>
            )}
          </div>
        </div>

        {/* Consumables */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-[#8C6D58] uppercase">Bùa Chú Cửa Hàng ({filteredShopConsumables.length})</h3>
            <button
              onClick={() => handleCreateShopItem("consumable")}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus size={10} /> Thêm bùa
            </button>
          </div>
          <div className="space-y-3">
            {filteredShopConsumables.map((item) => (
              <div key={item.id} className="p-3 border border-zinc-150 rounded-2xl flex items-center justify-between gap-2 hover:border-[#8C6D58] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.imageUrl} className="w-10 h-10 object-contain rounded-lg bg-zinc-50 border p-1" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-zinc-700">{item.name}</h4>
                    <p className="text-[9px] text-zinc-400 font-bold line-clamp-1">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CoinIcon /> {item.cost}
                  </span>
                  <button
                    onClick={() => handleEditShopItem(item, "consumable")}
                    className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 border border-zinc-200 cursor-pointer"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteShopItem(item.id, "consumable")}
                    className="p-1 hover:bg-red-100 rounded-lg text-red-500 border border-red-100 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {filteredShopConsumables.length === 0 && (
              <p className="p-8 text-center text-zinc-400 italic text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">Không tìm thấy bùa chú nào phù hợp.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
