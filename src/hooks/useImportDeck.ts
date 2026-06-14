"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FlashcardData } from "@/types/flashcard";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { toast } from "react-hot-toast";

export type ImportState = "idle" | "error" | "preview";

export function useImportDeck() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ImportState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deckData, setDeckData] = useState<FlashcardData[]>([]);
  const [isTextInput, setIsTextInput] = useState(false);
  const [textValue, setTextValue] = useState("");

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckLevel, setDeckLevel] = useState("N4");
  const [customLevel, setCustomLevel] = useState("");
  const [showAiHint, setShowAiHint] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addCustomDeck = useAppStore((state) => state.addCustomDeck);
  const user = useAppStore((state: any) => state.user);

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

  const handleSaveDeck = async () => {
    setIsSaving(true);
    const newDeck = {
      id: `custom_${Date.now()}`,
      title: deckTitle.trim() || "Bộ bài bí mật ✨",
      description: deckDescription.trim() || "Chưa có ghi chú nào",
      count: deckData.length,
      level: deckLevel === "Khác" ? customLevel.trim() || "Khác" : deckLevel,
      cards: deckData,
    };

    try {
      if (user) {
        const deckRef = doc(collection(db, "decks"), newDeck.id);
        await setDoc(deckRef, {
          ...newDeck,
          userId: user.uid,
          creatorName: user.displayName || "Ẩn danh",
          createdAt: new Date().toISOString(),
        });
        toast.success("Đã đẩy bộ bài lên mây! ☁️✨");
      } else {
        toast.success("Đã lưu tạm vào máy! (Nên đăng nhập để đồng bộ nhé) 📱");
      }

      addCustomDeck(newDeck);
      setIsOpen(false);
      setTimeout(resetState, 300);
    } catch (error) {
      console.error("Lỗi khi lưu bộ bài:", error);
      toast.error("Có lỗi xảy ra, chưa lưu được bộ bài! 🥺");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSample = () => {
    const a = document.createElement("a");
    a.href = "/data/mau_flashcard_cute.json";
    a.download = "mau_flashcard_cute.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setShowAiHint(true);
    setTimeout(() => setShowAiHint(false), 5000);
  };

  return {
    isOpen, status, errorMsg, deckData, isTextInput, setIsTextInput,
    textValue, setTextValue, deckTitle, setDeckTitle, deckDescription,
    setDeckDescription, deckLevel, setDeckLevel, customLevel, setCustomLevel,
    showAiHint, isSaving, handleOpenChange, handleTextSubmit, handleSaveDeck,
    handleDownloadSample, getRootProps, getInputProps, isDragActive
  };
}