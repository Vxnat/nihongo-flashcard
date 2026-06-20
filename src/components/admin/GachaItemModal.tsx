"use client";

import React from "react";
import { X } from "lucide-react";

interface GachaItemModalProps {
  selectedGachaItem: any;
  setSelectedGachaItem: (item: any) => void;
  gachaPool: any[];
  setIsGachaModalOpen: (open: boolean) => void;
  handleSaveGachaItem: (item: any) => void;
}

export function GachaItemModal({
  selectedGachaItem,
  setSelectedGachaItem,
  gachaPool,
  setIsGachaModalOpen,
  handleSaveGachaItem
}: GachaItemModalProps) {
  const [form, setForm] = React.useState<any>({ ...selectedGachaItem });

  React.useEffect(() => {
    setForm({
      ...selectedGachaItem,
      japanesePoint: selectedGachaItem.japanesePoint || { word: "", meaning: "", grammarNote: "" }
    });
  }, [selectedGachaItem]);

  const isEdit = gachaPool.some(i => i.id === selectedGachaItem.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
            {isEdit ? "SỬA VẬT PHẨM GACHA" : "THÊM VẬT PHẨM GACHA"}
          </h3>
          <button onClick={() => setIsGachaModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs font-bold">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mã vật phẩm (ID)</label>
            <input
              type="text"
              value={form.id || ""}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-[#8C6D58] font-extrabold"
              placeholder="VD: out_santa_shiba"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Tên vật phẩm</label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: Shiba Noel"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Loại vật phẩm (Type)</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
              >
                <option value="sticker">Sticker (Dán nhãn)</option>
                <option value="theme">Theme (Hình nền)</option>
                <option value="outfit">Outfit (Trang phục)</option>
                <option value="furniture">Furniture (Nội thất sinh xương)</option>
                <option value="meme">Meme (Kiến thức vui)</option>
                <option value="voice">Voice (Giọng nói)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Độ hiếm (Rarity)</label>
              <select
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
              >
                <option value="common">Common (Thường)</option>
                <option value="rare">Rare (Hiếm)</option>
                <option value="epic">Epic (Sử thi)</option>
                <option value="legendary">Legendary (Huyền thoại)</option>
                <option value="mythic">Mythic (Thần thoại)</option>
                <option value="divine">Divine (Thần thánh)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn hình ảnh (ImageUrl)</label>
            <input
              type="text"
              value={form.imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: /images/stickers/st_chibi.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Mục tiêu mảnh ghép (Shard Target)</label>
              <input
                type="number"
                value={form.shardTarget || 2}
                onChange={(e) => setForm({ ...form, shardTarget: parseInt(e.target.value) || 2 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Trọng số tỷ lệ (Weight - Trống = Mặc định)</label>
              <input
                type="number"
                placeholder="VD: 10, 50, 100..."
                value={form.weight === undefined || form.weight === null ? "" : form.weight}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setForm({ ...form, weight: val === "" ? undefined : parseInt(val) || undefined });
                }}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mô tả vật phẩm</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[40px]"
              placeholder="Mô tả công dụng hoặc vẻ đẹp của vật phẩm..."
            />
          </div>

          {/* Specific fields for furniture layout coordinates */}
          {form.type === "furniture" && (
            <div className="p-3 border border-[#8C6D58]/20 rounded-xl bg-zinc-55/30 space-y-3">
              <p className="text-[9px] font-black text-zinc-500 uppercase">Sinh xương & Cấu hình vị trí Shiba Room</p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-zinc-450">Sản lượng sinh Xương (+ BONES / HOUR)</label>
                  <input
                    type="number"
                    value={form.bonesPerHour || 0}
                    onChange={(e) => setForm({ ...form, bonesPerHour: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-zinc-450">Vị trí Shiba Room (Slot)</label>
                  <select
                    value={form.furnitureSlot || "floor"}
                    onChange={(e) => setForm({ ...form, furnitureSlot: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  >
                    <option value="floor">Sàn (floor)</option>
                    <option value="wall">Tường (wall)</option>
                    <option value="corner">Góc phòng (corner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-zinc-450 uppercase">RoomStyle / Vị trí phòng (JSON)</label>
                <input
                  type="text"
                  value={form.roomStyle ? JSON.stringify(form.roomStyle) : ""}
                  onChange={(e) => {
                    try {
                      setForm({ ...form, roomStyle: e.target.value ? JSON.parse(e.target.value) : undefined });
                    } catch (err) {}
                  }}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5 font-mono text-[10px]"
                  placeholder='VD: {"bottom":"16%", "left":"28%", "width":"36%", "height":"24%"}'
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-450 uppercase">GardenStyle / Vị trí vườn (JSON)</label>
                <input
                  type="text"
                  value={form.gardenStyle ? JSON.stringify(form.gardenStyle) : ""}
                  onChange={(e) => {
                    try {
                      setForm({ ...form, gardenStyle: e.target.value ? JSON.parse(e.target.value) : undefined });
                    } catch (err) {}
                  }}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5 font-mono text-[10px]"
                  placeholder='VD: {"bottom":"28%", "left":"22%", "width":"3.5rem"}'
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-zinc-450">Bệ đỡ Zen Garden (pedestalType)</label>
                  <select
                    value={form.pedestalType || ""}
                    onChange={(e) => setForm({ ...form, pedestalType: e.target.value || undefined })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  >
                    <option value="">Không bệ đỡ</option>
                    <option value="stone">Bệ đá (stone)</option>
                    <option value="wood">Bệ gỗ (wood)</option>
                    <option value="hanger">Móc treo dây (hanger)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-450">GardenImgStyle (JSON)</label>
                  <input
                    type="text"
                    value={form.gardenImgStyle ? JSON.stringify(form.gardenImgStyle) : ""}
                    onChange={(e) => {
                      try {
                        setForm({ ...form, gardenImgStyle: e.target.value ? JSON.parse(e.target.value) : undefined });
                      } catch (err) {}
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5 font-mono text-[10px]"
                    placeholder='{"width":"2.5rem"}'
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-zinc-450 uppercase">ShibaMascotStyle / Tọa độ Shiba lân cận (JSON)</label>
                <input
                  type="text"
                  value={form.shibaMascotStyle ? JSON.stringify(form.shibaMascotStyle) : ""}
                  onChange={(e) => {
                    try {
                      setForm({ ...form, shibaMascotStyle: e.target.value ? JSON.parse(e.target.value) : undefined });
                    } catch (err) {}
                  }}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5 font-mono text-[10px]"
                  placeholder='VD: {"bottom":"32%", "left":"54%", "width":"24%"}'
                />
              </div>
            </div>
          )}

          {/* Specific fields for meme */}
          {form.type === "meme" && (
            <div className="p-3 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-2 mt-2">
              <p className="text-[9px] font-black text-zinc-500 uppercase">Chi tiết kiến thức Nhật Bản (Meme Point)</p>
              <div>
                <label className="text-[9px] text-zinc-400 uppercase">Từ / Cụm từ tiếng Nhật</label>
                <input
                  type="text"
                  value={form.japanesePoint?.word || ""}
                  onChange={(e) => setForm({
                    ...form,
                    japanesePoint: { ...form.japanesePoint, word: e.target.value }
                  })}
                  className="w-full px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white font-extrabold"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-400 uppercase">Ý nghĩa nghĩa tiếng Việt</label>
                <input
                  type="text"
                  value={form.japanesePoint?.meaning || ""}
                  onChange={(e) => setForm({
                    ...form,
                    japanesePoint: { ...form.japanesePoint, meaning: e.target.value }
                  })}
                  className="w-full px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-400 uppercase">Chú thích Ngữ pháp / Cách dùng</label>
                <textarea
                  value={form.japanesePoint?.grammarNote || ""}
                  onChange={(e) => setForm({
                    ...form,
                    japanesePoint: { ...form.japanesePoint, grammarNote: e.target.value }
                  })}
                  className="w-full px-3.5 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white min-h-[40px]"
                />
              </div>
            </div>
          )}

          {/* Specific field for voice */}
          {form.type === "voice" && (
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn tệp âm thanh (AudioUrl)</label>
              <input
                type="text"
                value={form.audioUrl || ""}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 font-mono"
                placeholder="VD: /audio/voices/voice_correct_01.mp3"
              />
            </div>
          )}

          {/* RPG Stats option for outfits / stickers */}
          {(form.type === "outfit" || form.type === "sticker") && (
            <div className="p-3 border border-orange-200 rounded-xl bg-orange-50/50 space-y-2 mt-2">
              <p className="text-[9px] font-black text-amber-800 uppercase">RPG Stats (Chiến đấu hệ Shiba Room)</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="text-zinc-400">Vị trí slot trang bị</label>
                  <select
                    value={form.rpgSlot || "head"}
                    onChange={(e) => setForm({ ...form, rpgSlot: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  >
                    <option value="head">Mũ/Đầu (Head)</option>
                    <option value="armor">Mũi giáp/Thân (Armor)</option>
                    <option value="earring">Bông tai/Phụ kiện (Earring)</option>
                    <option value="gloves">Bao tay/Vũ khí (Gloves)</option>
                    <option value="mount">Thú cưỡi/Đồng hành (Mount)</option>
                    <option value="aura">Hào quang/Khí tức (Aura)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400">Cộng HP</label>
                  <input
                    type="number"
                    value={form.hpBonus || 0}
                    onChange={(e) => setForm({ ...form, hpBonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">Cộng ATK</label>
                  <input
                    type="number"
                    value={form.atkBonus || 0}
                    onChange={(e) => setForm({ ...form, atkBonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">Cộng DEF</label>
                  <input
                    type="number"
                    value={form.defBonus || 0}
                    onChange={(e) => setForm({ ...form, defBonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-zinc-400">Cộng Chí mạng (%)</label>
                  <input
                    type="number"
                    value={form.critBonus || 0}
                    onChange={(e) => setForm({ ...form, critBonus: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => setIsGachaModalOpen(false)}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
          >
            Hủy
          </button>
          <button
            onClick={() => handleSaveGachaItem(form)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
          >
            Xác nhận lưu
          </button>
        </div>
      </div>
    </div>
  );
}
