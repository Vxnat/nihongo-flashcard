"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FlashcardData } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileJson, AlertCircle, FileText, Save, Sparkles, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ImportState = "idle" | "error" | "preview";

// Danh sách các cấp độ để render thành dãy nút kẹo dẻo
const LEVELS = ["N5", "N4", "N3", "N2", "N1", "Khác"];

export function ImportDeck() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ImportState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deckData, setDeckData] = useState<FlashcardData[]>([]);
  const [isTextInput, setIsTextInput] = useState(false);
  const [textValue, setTextValue] = useState("");
  
  // States mới cho thông tin bộ bài
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckLevel, setDeckLevel] = useState("N4");
  const [customLevel, setCustomLevel] = useState("");
  const [showAiHint, setShowAiHint] = useState(false);

  const resetState = () => {
    setStatus("idle");
    setErrorMsg("");
    setDeckData([]);
    setTextValue("");
    setDeckTitle("");
    setDeckDescription("");
    setDeckLevel("N4");
    setCustomLevel("");
    setIsTextInput(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(resetState, 300);
    }
  };

  const validateAndSetData = (parsedData: any) => {
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      setErrorMsg("Dữ liệu phải là một mảng (Array) và không rỗng nhé!");
      setStatus("error");
      return;
    }
    const firstCard = parsedData[0];
    if (!firstCard.id || !firstCard.word) {
      setErrorMsg("Thiếu trường 'id' hoặc 'word' mất rồi!");
      setStatus("error");
      return;
    }
    setDeckData(parsedData);
    setStatus("preview");
    setErrorMsg("");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        validateAndSetData(JSON.parse(e.target?.result as string));
      } catch (err) {
        setErrorMsg("File không đúng định dạng JSON.");
        setStatus("error");
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
    maxFiles: 1,
  });

  const handleTextSubmit = () => {
    try {
      validateAndSetData(JSON.parse(textValue));
    } catch (err) {
      setErrorMsg("Văn bản không phải JSON hợp lệ.");
      setStatus("error");
    }
  };

  const handleSaveDeck = () => {
    const newDeck = {
      id: `custom_${Date.now()}`,
      title: deckTitle.trim() || "Bộ bài bí mật ✨",
      description: deckDescription.trim() || "Chưa có ghi chú nào",
      count: deckData.length,
      level: deckLevel === "Khác" ? (customLevel.trim() || "Khác") : deckLevel,
      cards: deckData
    };

    const existingDecks = JSON.parse(localStorage.getItem("custom_decks") || "[]");
    existingDecks.push(newDeck);
    localStorage.setItem("custom_decks", JSON.stringify(existingDecks));

    window.dispatchEvent(new Event("deck_saved"));
    setIsOpen(false);
    setTimeout(resetState, 300);
  };

  // Hàm tải file JSON mẫu từ thư mục public
  const handleDownloadSample = () => {
    const a = document.createElement("a");
    a.href = "/data/mau_flashcard_cute.json"; // Đường dẫn trỏ thẳng vào thư mục public
    a.download = "mau_flashcard_cute.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Bật thông báo AI trong 5 giây rồi tắt
    setShowAiHint(true);
    setTimeout(() => setShowAiHint(false), 5000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* NÚT THÊM BỘ BÀI: KẸO DÂU (STRAWBERRY CANDY PILL) */}
        <Button 
          className="group relative h-12 px-6 rounded-full bg-[#FF7096] hover:bg-[#FF5C8A] text-white border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:shadow-xl overflow-hidden"
        >
          {/* Vệt sáng lướt qua khi di chuột (Shine effect) */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-transform duration-700 ease-in-out pointer-events-none" />
          
          <span className="text-base font-bold drop-shadow-sm tracking-wide font-rounded mt-0.5"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Nhập bài mới!
          </span>
          <Sparkles className="w-4 h-4 ml-2 drop-shadow-sm text-[#FFD166]" fill="currentColor" />
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="sm:max-w-[420px] w-[95vw] max-h-[85vh] flex flex-col rounded-[2rem] p-0 overflow-hidden border-4 border-[#FFE2D1] shadow-2xl bg-[#FFFDF5]">
        
        {/* Header Pastel đáng yêu */}
        <div className="bg-[#FFD166] p-5 pb-6 border-b-4 border-[#FFE2D1] shrink-0 text-center relative">
          <DialogTitle 
            className="text-2xl text-amber-900 tracking-wide drop-shadow-sm"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {status === "preview" ? "Lưu thẻ ma thuật!" : "Triệu hồi thẻ bài"}
            <Sparkles className="inline-block w-5 h-5 ml-2 text-white mb-2" />
          </DialogTitle>
        </div>

        <div className="p-5 overflow-y-auto w-full hide-scrollbar flex-1">
          
          {/* =========================================
              TRẠNG THÁI 1: CHỜ NHẬP DỮ LIỆU 
             ========================================= */}
          {status !== "preview" && (
            <div className="space-y-4">
              <div className="flex bg-white border-2 border-zinc-100 p-1 rounded-2xl w-fit shrink-0 shadow-sm mx-auto">
                <button 
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center ${!isTextInput ? 'bg-[#FFD166] text-amber-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                  onClick={() => setIsTextInput(false)}
                >
                  <UploadCloud className="w-4 h-4 mr-2" /> File JSON
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center ${isTextInput ? 'bg-[#FFD166] text-amber-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                  onClick={() => setIsTextInput(true)}
                >
                  <FileText className="w-4 h-4 mr-2" /> Dán Text
                </button>
              </div>

              {!isTextInput ? (
                <div 
                  {...getRootProps()} 
                  className={`w-full p-8 flex flex-col items-center justify-center rounded-[1.5rem] border-4 border-dashed cursor-pointer transition-colors shrink-0 ${isDragActive ? 'bg-[#06D6A0]/10 border-[#06D6A0]' : 'bg-white border-[#FFE2D1] hover:bg-orange-50'}`}
                >
                  <input {...getInputProps()} />
                  <FileJson className={`w-12 h-12 mb-3 ${isDragActive ? 'text-[#06D6A0]' : 'text-orange-300'}`} />
                  <p className="text-amber-800 text-sm font-bold text-center">
                    {isDragActive ? "Thả kẹo vào đây!" : "Chạm hoặc kéo thả file vào đây nhé"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 shrink-0">
                  <textarea 
                    className="w-full h-32 p-4 border-4 border-[#FFE2D1] rounded-[1.5rem] text-xs font-mono focus:outline-none focus:border-[#FF9F1C] bg-white placeholder:text-zinc-300 resize-none"
                    placeholder='[{ "id": "1", "word": "漢字", "meaning": "Hán tự" }]'
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                  />
                  <Button 
                    onClick={handleTextSubmit} 
                    className="w-full rounded-xl bg-[#06D6A0] hover:bg-[#05b889] text-white font-bold border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all h-12"
                  >
                    Kiểm tra dữ liệu
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center text-red-600 text-sm font-bold bg-red-100 border-2 border-red-200 px-4 py-3 rounded-2xl shrink-0">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* KHU VỰC TẢI FILE MẪU & GỢI Ý AI */}
              <div className="flex flex-col items-center mt-2 pt-4 border-t-2 border-dashed border-[#FFE2D1] shrink-0">
                <button 
                  onClick={handleDownloadSample}
                  className="text-sm font-bold text-[#5390D9] hover:text-[#3a70b0] flex items-center transition-colors px-4 py-2 rounded-xl hover:bg-blue-50"
                >
                  Bạn chưa có file mẫu? Tải tại đây nhé!
                </button>

                {/* Hộp thoại nhắc AI (Nảy lên sau khi bấm tải) */}
                {showAiHint && (
                  <div className="animate-in slide-in-from-bottom-2 fade-in zoom-in mt-2 bg-[#FFD166]/20 border-2 border-[#FFD166] text-amber-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-start w-full shadow-sm">
                    <Bot className="w-5 h-5 mr-2 text-[#FF9F1C] shrink-0" />
                    <p className="leading-relaxed">
                      Đã tải xong! <br/>
                      <span className="text-[#FF9F1C]">Mẹo xịn:</span> Bạn hãy ném file này cho ChatGPT hoặc Claude rồi bảo: <span className="bg-white px-1.5 py-0.5 rounded-md border border-[#FFE2D1]">"Dựa vào cấu trúc này, làm cho tôi 20 từ vựng N4"</span> là có bài học liền nha! 🤖✨
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================
              TRẠNG THÁI 2: PREVIEW & ĐIỀN THÔNG TIN 
             ========================================= */}
          {status === "preview" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 w-full pb-2">
              
              {/* Box Xem trước thẻ (Thiết kế lại thành kẹo dẻo mini) */}
              <div className="bg-white p-4 rounded-[1.5rem] border-2 border-[#FFE2D1] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-amber-700">🔍 Dữ liệu của bạn:</p>
                  <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] border-none font-bold">
                    {deckData.length} thẻ
                  </Badge>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory hide-scrollbar w-full">
                  {deckData.slice(0, 4).map((card, idx) => (
                    <div key={idx} className="min-w-[100px] h-[70px] shrink-0 snap-center flex flex-col items-center justify-center bg-orange-50 border-2 border-orange-100 rounded-2xl">
                      <span className="text-base font-bold text-amber-900 truncate px-2 w-full text-center">{card.word}</span>
                      <span className="text-[10px] text-amber-700/70 line-clamp-1 px-2 text-center mt-0.5 w-full">
                        {card.meaning}
                      </span>
                    </div>
                  ))}
                  {deckData.length > 4 && (
                    <div className="min-w-[60px] h-[70px] shrink-0 flex items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl text-xs font-bold text-zinc-400">
                      +{deckData.length - 4}
                    </div>
                  )}
                </div>
              </div>

              {/* KHU VỰC FORM NHẬP LIỆU CUTE */}
              <div className="space-y-4 pt-2 shrink-0">
                
                {/* 1. Tên bộ bài */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-800 ml-2">Tên bộ bài</label>
                  <input 
                    type="text" 
                    placeholder="VD: Cày đêm thi N5..." 
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold text-amber-900 rounded-[1.25rem] border-2 border-[#FFE2D1] focus:outline-none focus:border-[#FF9F1C] focus:bg-orange-50 bg-white transition-colors placeholder:text-zinc-300"
                    autoFocus
                  />
                </div>

                {/* 2. Mô tả / Ghi chú */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-800 ml-2">Ghi chú (Tùy chọn)</label>
                  <input 
                    type="text" 
                    placeholder="VD: Học từ vựng bài 1-5 ᕙ(`▽´)ᕗ" 
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold text-amber-900 rounded-[1.25rem] border-2 border-[#FFE2D1] focus:outline-none focus:border-[#FF9F1C] focus:bg-orange-50 bg-white transition-colors placeholder:text-zinc-300"
                  />
                </div>

                {/* 3. Thanh trượt Level (Pill Buttons) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-800 ml-2">Cấp độ</label>
                  <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar w-full px-1">
                    {LEVELS.map((level) => {
                      const isActive = deckLevel === level;
                      return (
                        <button
                          key={level}
                          onClick={() => setDeckLevel(level)}
                          className={`shrink-0 px-4 py-2 font-bold text-sm rounded-xl transition-all duration-200 border-2 
                            ${isActive 
                              ? 'bg-[#FFD166] border-[#FF9F1C] text-amber-900 shadow-[0_3px_0_0_#FF9F1C] translate-y-[2px]' 
                              : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 shadow-[0_5px_0_0_#E4E4E7]'}
                          `}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                  {deckLevel === "Khác" && (
                    <div className="px-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      <input 
                        type="text" 
                        placeholder="Nhập cấp độ tùy chỉnh (VD: Giao tiếp...)" 
                        value={customLevel}
                        onChange={(e) => setCustomLevel(e.target.value)}
                        className="w-full mt-1 px-4 py-2.5 text-sm font-bold text-amber-900 rounded-[1.25rem] border-2 border-[#FFE2D1] focus:outline-none focus:border-[#FF9F1C] focus:bg-orange-50 bg-white transition-colors placeholder:text-zinc-300"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* 4. Nút Lưu bóp mềm */}
                <Button 
                  onClick={handleSaveDeck} 
                  className="w-full mt-2 h-12 rounded-[1.25rem] bg-[#FF7096] hover:bg-[#e05e81] text-white font-bold text-base border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 transition-all"
                >
                  <Save className="w-5 h-5 mr-2" /> Lưu bộ bài
                </Button>
              </div>

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}