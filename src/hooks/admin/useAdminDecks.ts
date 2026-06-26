"use client";

import { useState, useCallback } from "react";
import { SystemDeck, CardData } from "@/types/flashcard";
import toast from "react-hot-toast";
import { getDeckFolder } from "@/utils/deckResolver";

interface UseAdminDecksProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook quản lý các bộ thẻ hệ thống (Decks) và từ vựng (Cards).
 * Bao gồm các tác vụ: tải dữ liệu bộ bài, CRUD metadata bộ bài, CRUD từ vựng và import từ Excel.
 */
export function useAdminDecks({ setIsLoading }: UseAdminDecksProps) {
  const [decks, setDecks] = useState<SystemDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<SystemDeck | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [cardSearch, setCardSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Importer states (Import dữ liệu từ file Excel/CSV dạng text)
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importDelimiter, setImportDelimiter] = useState<"tab" | "comma">("tab");

  // Decks metadata edit state
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<SystemDeck | null>(null);
  const [deckForm, setDeckForm] = useState<Partial<SystemDeck>>({
    id: "",
    title: "",
    level: "N5",
    chapter: 1,
    order: 1,
    prerequisite: "",
    rewardCoins: 10,
    description: "",
    type: "flashcard"
  });

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  /**
   * Tải danh sách bộ bài hệ thống từ file cấu hình JSON trên server
   */
  const loadSystemDecks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/save-json?filePath=public/data/configs/system_decks.json");
      if (!res.ok) throw new Error("Không thể tải danh sách bộ thẻ hệ thống");
      const data = await res.json();
      setDecks(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải cấu hình bộ bài");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  /**
   * Mở modal chuẩn bị tạo bộ bài mới
   */
  const handleCreateNewDeck = useCallback(() => {
    setEditingDeck(null);
    setDeckForm({
      id: `sys_deck_${Date.now()}`,
      title: "",
      level: "N5",
      chapter: 1,
      order: decks.length + 1,
      prerequisite: "",
      rewardCoins: 10,
      description: "",
      type: "flashcard"
    });
    setIsDeckModalOpen(true);
  }, [decks.length]);

  /**
   * Mở modal sửa thông tin metadata của bộ bài hiện có
   */
  const handleEditDeckMetadata = useCallback((deck: SystemDeck) => {
    setEditingDeck(deck);
    setDeckForm({ ...deck, prerequisite: deck.prerequisite || "" });
    setIsDeckModalOpen(true);
  }, []);

  /**
   * Xóa bộ bài hệ thống và file từ vựng JSON tương ứng trên server
   */
  const handleDeleteDeck = useCallback(async (deck: SystemDeck) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ bài "${deck.title}" (ID: ${deck.id})?\nHành động này cũng sẽ xóa file dữ liệu từ vựng tương ứng trên đĩa cứng!`)) {
      return;
    }
    setIsLoading(true);
    try {
      const updatedDecks = decks.filter(d => d.id !== deck.id);

      const saveDecksRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/system_decks.json", data: updatedDecks })
      });
      if (!saveDecksRes.ok) throw new Error("Cập nhật file cấu hình tổng thất bại");

      const folder = getDeckFolder(deck.type);
      const filePath = `public/data/decks/${folder}/${deck.id}.json`;
      await fetch(`/api/admin/save-json?filePath=${filePath}`, {
        method: "DELETE"
      });

      setDecks(updatedDecks);
      toast.success("Xóa bộ bài thành công! 🗑️");
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa bộ bài");
    } finally {
      setIsLoading(false);
    }
  }, [decks, setIsLoading]);

  /**
   * Lưu thông tin metadata bộ bài (Tạo mới hoặc cập nhật thông tin cũ)
   */
  const handleSaveDeckMetadata = useCallback(async () => {
    if (!deckForm.id || !deckForm.title || !deckForm.level) {
      toast.error("Vui lòng điền đầy đủ ID, Tiêu đề và Cấp độ!");
      return;
    }

    const cleanId = deckForm.id.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (!cleanId) {
      toast.error("ID không hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      const folder = getDeckFolder(deckForm.type);
      const cardsFilePath = `public/data/decks/${folder}/${cleanId}.json`;

      let updatedDecks: SystemDeck[] = [];

      if (editingDeck) {
        // Nếu thay đổi ID hoặc thay đổi Cấp độ (Level) -> Phải di chuyển file JSON từ vựng
        if (editingDeck.id !== cleanId || editingDeck.level !== deckForm.level) {
          let oldCards: any[] = [];
          try {
            const oldFolder = getDeckFolder(editingDeck.type);
            const oldRes = await fetch(`/api/admin/save-json?filePath=public/data/decks/${oldFolder}/${editingDeck.id}.json`);
            if (oldRes.ok) {
              oldCards = await oldRes.json();
            }
          } catch (e) { }

          await fetch("/api/admin/save-json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: cardsFilePath, data: oldCards })
          });

          const oldFolder = getDeckFolder(editingDeck.type);
          await fetch(`/api/admin/save-json?filePath=public/data/decks/${oldFolder}/${editingDeck.id}.json`, {
            method: "DELETE"
          });
        }

        updatedDecks = decks.map(d => d.id === editingDeck.id ? {
          ...d,
          id: cleanId,
          title: deckForm.title!,
          level: deckForm.level!,
          chapter: Number(deckForm.chapter) || 1,
          order: Number(deckForm.order) || 1,
          prerequisite: deckForm.prerequisite || null,
          rewardCoins: Number(deckForm.rewardCoins) || 10,
          description: deckForm.description || "",
          type: deckForm.type || "flashcard"
        } : d);
      } else {
        if (decks.some(d => d.id === cleanId)) {
          throw new Error("ID bộ bài đã tồn tại!");
        }

        // Tạo file từ vựng trống cho bộ bài mới
        await fetch("/api/admin/save-json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: cardsFilePath, data: [] })
        });

        const newDeck: SystemDeck = {
          id: cleanId,
          title: deckForm.title!,
          level: deckForm.level!,
          chapter: Number(deckForm.chapter) || 1,
          order: Number(deckForm.order) || 1,
          prerequisite: deckForm.prerequisite || null,
          rewardCoins: Number(deckForm.rewardCoins) || 10,
          description: deckForm.description || "",
          type: deckForm.type || "flashcard",
          totalCards: 0
        };

        updatedDecks = [...decks, newDeck];
      }

      const saveDecksRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/system_decks.json", data: updatedDecks })
      });
      if (!saveDecksRes.ok) throw new Error("Cập nhật file cấu hình tổng thất bại");

      setDecks(updatedDecks);
      setIsDeckModalOpen(false);
      toast.success(editingDeck ? "Cập nhật bộ bài thành công!" : "Tạo bộ bài mới thành công! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu cấu hình bộ bài");
    } finally {
      setIsLoading(false);
    }
  }, [decks, editingDeck, deckForm, setIsLoading]);

  /**
   * Tải danh sách từ vựng chi tiết của một bộ bài
   */
  const loadDeckCards = useCallback(async (deck: SystemDeck) => {
    setIsLoading(true);
    try {
      const folder = getDeckFolder(deck.type);
      const res = await fetch(`/api/admin/save-json?filePath=public/data/decks/${folder}/${deck.id}.json`);
      if (!res.ok) throw new Error("Bộ bài này chưa có file dữ liệu riêng hoặc lỗi tải.");
      const data = await res.json();
      setCards(data);
      setSelectedDeck(deck);
      setSelectedCard(null);
    } catch (error: any) {
      toast.error(error.message);
      setCards([]);
      setSelectedDeck(deck);
      setSelectedCard(null);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  /**
   * Lưu lại toàn bộ danh sách từ vựng của bộ bài hiện tại lên server
   */
  const handleSaveDeck = useCallback(async () => {
    if (!selectedDeck) return;
    setIsLoading(true);
    try {
      const folder = getDeckFolder(selectedDeck.type);
      const filePath = `public/data/decks/${folder}/${selectedDeck.id}.json`;

      const saveCardsRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, data: cards })
      });

      if (!saveCardsRes.ok) throw new Error("Ghi tệp danh sách từ vựng thất bại");

      const updatedDecks = decks.map(d =>
        d.id === selectedDeck.id ? { ...d, totalCards: cards.length } : d
      );

      const saveDecksRes = await fetch("/api/admin/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "public/data/configs/system_decks.json", data: updatedDecks })
      });

      if (!saveDecksRes.ok) throw new Error("Cập nhật file cấu hình tổng thất bại");

      setDecks(updatedDecks);
      toast.success("Đã lưu bộ bài thành công trên đĩa! 💾🎉");
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu bộ bài");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeck, cards, decks, setIsLoading]);

  /**
   * Xóa tạm thời một từ vựng khỏi danh sách thẻ đang hiển thị (cần ấn Lưu bộ bài để ghi file)
   */
  const handleCardDelete = useCallback((cardId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi bộ bài?")) {
      setCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCard(prev => (prev?.id === cardId ? null : prev));
      toast.success("Đã tạm xóa khỏi danh sách. Hãy nhấn 'LƯU BỘ BÀI' để ghi file!");
    }
  }, []);

  /**
   * Lưu tạm thời một từ vựng (thêm mới hoặc chỉnh sửa) vào danh sách thẻ hiện tại
   */
  const handleCardSave = useCallback((updatedCard: CardData) => {
    setCards(prev => {
      const exists = prev.some(c => c.id === updatedCard.id);
      if (exists) {
        return prev.map(c => c.id === updatedCard.id ? updatedCard : c);
      } else {
        return [...prev, updatedCard];
      }
    });
    setSelectedCard(null);
    toast.success("Đã ghi nhận thay đổi! Hãy nhớ nhấn 'LƯU BỘ BÀI' để lưu vĩnh viễn.");
  }, []);

  /**
   * Khởi tạo form thêm từ vựng mới
   */
  const handleAddCard = useCallback(() => {
    const newId = `${selectedDeck?.id}_${Date.now()}`;
    setSelectedCard({
      id: newId,
      word: "",
      reading: "",
      romaji: "",
      meaning: "",
      pos: "noun",
      notes: "",
      example_jp: "",
      example_jp_formatted: "",
      example_vi: "",
      tags: [],
      synonyms: [],
      antonyms: []
    });
  }, [selectedDeck]);

  /**
   * Import từ vựng hàng loạt từ văn bản dán Excel/CSV
   */
  const handleImport = useCallback(() => {
    if (!importText.trim()) {
      toast.error("Vui lòng dán dữ liệu!");
      return;
    }

    try {
      const lines = importText.split("\n");
      const newCards: CardData[] = [];
      const delimiter = importDelimiter === "tab" ? "\t" : ",";

      lines.forEach((line, index) => {
        if (!line.trim()) return;
        const columns = line.split(delimiter);

        if (columns.length < 3) return;

        const word = columns[0]?.trim();
        const reading = columns[1]?.trim();
        const meaning = columns[2]?.trim();
        const romaji = columns[3]?.trim() || "";
        const pos = columns[4]?.trim() || "noun";
        const notes = columns[5]?.trim() || "";

        if (word && reading && meaning) {
          newCards.push({
            id: `${selectedDeck?.id}_import_${Date.now()}_${index}`,
            word,
            reading,
            romaji,
            meaning,
            pos,
            notes,
            tags: [selectedDeck?.id || "imported"],
            synonyms: [],
            antonyms: []
          });
        }
      });

      if (newCards.length === 0) {
        toast.error("Không tìm thấy dữ liệu hợp lệ! Vui lòng kiểm tra lại định dạng.");
        return;
      }

      setCards(prev => [...prev, ...newCards]);
      setImportText("");
      setIsImportOpen(false);
      toast.success(`Đã thêm tạm thời ${newCards.length} thẻ từ file Excel! Nhớ bấm 'LƯU BỘ BÀI'`);
    } catch (e: any) {
      toast.error("Lỗi phân tích cú pháp dữ liệu: " + e.message);
    }
  }, [importText, importDelimiter, selectedDeck]);

  // Derived filtered decks list
  const filteredDecks = decks.filter(deck => {
    if (levelFilter !== "all" && deck.level !== levelFilter) {
      return false;
    }
    if (typeFilter !== "all") {
      const isFlashcard = !deck.type || deck.type === "flashcard";
      const isKanji = deck.type === "minigame_kanji";
      const isMinigame = deck.type === "minigame_matching" || deck.type === "minigame_rush" || deck.type === "minigame_fill";
      const isOther = deck.type === "story" || deck.type === "chest";

      if (typeFilter === "flashcard" && !isFlashcard) return false;
      if (typeFilter === "kanji" && !isKanji) return false;
      if (typeFilter === "minigame" && !isMinigame) return false;
      if (typeFilter === "other" && !isOther) return false;
    }
    return true;
  });

  return {
    decks,
    setDecks,
    selectedDeck,
    setSelectedDeck,
    cards,
    setCards,
    cardSearch,
    setCardSearch,
    selectedCard,
    setSelectedCard,
    isImportOpen,
    setIsImportOpen,
    importText,
    setImportText,
    importDelimiter,
    setImportDelimiter,
    isDeckModalOpen,
    setIsDeckModalOpen,
    editingDeck,
    setEditingDeck,
    deckForm,
    setDeckForm,
    levelFilter,
    setLevelFilter,
    typeFilter,
    setTypeFilter,
    filteredDecks,
    loadSystemDecks,
    handleCreateNewDeck,
    handleEditDeckMetadata,
    handleDeleteDeck,
    handleSaveDeckMetadata,
    loadDeckCards,
    handleSaveDeck,
    handleCardDelete,
    handleCardSave,
    handleAddCard,
    handleImport
  };
}
