"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FlashcardData } from "@/types/flashcard";
import { selectAdaptiveCards } from "@/utils/wordSelector";
import { getDeckFolder } from "@/utils/deckResolver";

const defaultDecks = [] as any[];

/**
 * Hook quản lý trạng thái của trang chủ (Home Page).
 * Điều khiển việc đổi Tab, quản lý Thư mục (Folders), di chuyển/xóa Bộ bài tự tạo (Custom Decks),
 * đồng bộ trạng thái đăng nhập người dùng, áp dụng theme hệ thống, và tải tài nguyên cho Minigame.
 */
export function useHome() {
  // ============================================================================
  // ZUSTAND STORE INTEGRATION (Kết nối trạng thái từ Zustand Store)
  // ============================================================================
  const customDecks = useAppStore((state) => state.customDecks);
  const loadCustomDecks = useAppStore((state) => state.loadCustomDecks);
  const isLoadingDecks = useAppStore((state) => state.isLoadingDecks);
  const deleteCustomDeck = useAppStore((state) => state.deleteCustomDeck);
  const setUser = useAppStore((state: any) => state.setUser);
  const loadUserStats = useAppStore((state) => state.loadUserStats);
  const user = useAppStore((state: any) => state.user);
  const folders = useAppStore((state) => state.folders);
  const loadFolders = useAppStore((state) => state.loadFolders);
  const addFolder = useAppStore((state) => state.addFolder);
  const moveDeckToFolder = useAppStore((state) => state.moveDeckToFolder);
  const updateFolder = useAppStore((state: any) => state.updateFolder);
  const deleteFolder = useAppStore((state: any) => state.deleteFolder);

  // Thao tác cốt truyện & Minigame
  const activeStoryId = useAppStore((state) => state.activeStoryId);
  const activeMinigameId = useAppStore((state: any) => state.activeMinigameId);
  const setActiveMinigameId = useAppStore((state: any) => state.setActiveMinigameId);
  const activeKanjiPracticeDeck = useAppStore((state) => state.activeKanjiPracticeDeck);
  const setActiveKanjiPracticeDeck = useAppStore((state) => state.setActiveKanjiPracticeDeck);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const equippedTheme = useAppStore((state) => state.userStats.equippedTheme);
  const wordStats = useAppStore((state) => state.userStats.wordStats || {});

  // ============================================================================
  // LOCAL STATE DECLARATIONS (Khai báo các trạng thái cục bộ)
  // ============================================================================
  
  // --- Điều hướng Tab ---
  const [activeTab, setActiveTab] = useState<"journey" | "custom" | "shop" | "room" | "profile">("journey");

  // --- Quản lý Thư mục (Folders) ---
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");

  // --- Quản lý Bộ bài tự tạo (Custom Decks) ---
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [deckToMove, setDeckToMove] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Trạng thái Minigame Overlay ---
  const [minigameDeckData, setMinigameDeckData] = useState<any>(null);
  const [minigameCards, setMinigameCards] = useState<FlashcardData[]>([]);
  const [isLoadingMinigame, setIsLoadingMinigame] = useState(false);

  // ============================================================================
  // DERIVED VALUES (Các giá trị tính toán từ State)
  // ============================================================================
  const customList = customDecks.map((d: any) => ({ ...d, isCustom: true }));
  const allDecks = [...defaultDecks, ...customList];

  // Lọc bộ bài theo thư mục được chọn (Nếu không chọn thì hiển thị các bộ bài tự do ngoài thư mục)
  const currentFolderDecks = allDecks.filter((d) =>
    selectedFolderId ? d.folderId === selectedFolderId : !d.folderId,
  );

  // ============================================================================
  // SYSTEM EFFECTS & SYNC (Đồng bộ hệ thống & Lắng nghe sự kiện)
  // ============================================================================

  // 1. Khôi phục tab người dùng đã chọn từ localStorage của phiên làm việc trước
  useEffect(() => {
    const savedTab = localStorage.getItem("flashcard_active_tab");
    if (
      savedTab === "journey" ||
      savedTab === "custom" ||
      savedTab === "shop" ||
      savedTab === "room" ||
      savedTab === "profile"
    ) {
      setActiveTab(savedTab as "journey" | "custom" | "shop" | "room" | "profile");
    }
  }, []);

  // 2. Lắng nghe trạng thái đăng nhập Google/Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  // 3. Tải lại bộ bài, thư mục và chỉ số học tập mỗi khi thay đổi user (đăng nhập / đăng xuất)
  useEffect(() => {
    loadCustomDecks(user?.uid);
    loadFolders(user?.uid);
    loadUserStats();
  }, [user?.uid, loadCustomDecks, loadFolders, loadUserStats]);

  // 4. Đồng bộ Theme đã trang bị lên class của thẻ body HTML
  useEffect(() => {
    let themeClass = "";
    if (equippedTheme === "thm_sakura") themeClass = "theme-sakura";
    else if (equippedTheme === "thm_night") themeClass = "theme-night";
    else if (equippedTheme === "thm_divine_shiba") themeClass = "theme-divine";

    document.body.classList.remove("theme-sakura", "theme-night", "theme-divine");
    if (themeClass) {
      document.body.classList.add(themeClass);
    }
    return () => {
      document.body.classList.remove("theme-sakura", "theme-night", "theme-divine");
    };
  }, [equippedTheme]);

  // 5. Tự động fetch dữ liệu từ vựng ôn tập khi người dùng kích hoạt Minigame
  useEffect(() => {
    const fetchMinigameCards = async () => {
      if (!activeMinigameId) {
        setMinigameCards([]);
        setIsLoadingMinigame(false);
        return;
      }

      setIsLoadingMinigame(true);
      try {
        const res = await fetch("/data/configs/system_decks.json");
        const decks = await res.json();

        const minigameDeck = decks.find((d: any) => d.id === activeMinigameId);
        if (!minigameDeck) return;

        const folder = minigameDeck.level.toLowerCase(); // n5, n4, ...

        // Nhánh 1: GAME ĐẶC THÙ (KANJI DOJO hoặc ĐIỀN CHỖ TRỐNG) -> Fetch danh sách câu hỏi/chữ rời
        if (minigameDeck.type === "minigame_kanji" || minigameDeck.type === "minigame_fill") {
          const folder = getDeckFolder(minigameDeck.type);
          const dataRes = await fetch(`/data/decks/${folder}/${minigameDeck.id}.json`).catch(() => null);
          if (dataRes && dataRes.ok) {
            const data = await dataRes.json();
            setMinigameDeckData({
              ...minigameDeck,
              [minigameDeck.type === "minigame_kanji" ? "kanjiList" : "quizList"]: data
            });
          } else {
            setMinigameDeckData(minigameDeck);
          }
          setMinigameCards([]);
          setIsLoadingMinigame(false);
          return;
        }

        setMinigameDeckData(minigameDeck);

        // Nhánh 2: GAME ÔN TẬP (MATCHING, TYPING RUSH) -> Lấy thẻ dựa vào các bài đã học trước đó
        let allCards: FlashcardData[] = [];
        const vocFolder = "minna"; // Thẻ từ vựng học tập luôn nằm trong folder "minna"

        if (minigameDeck.targetDeckIds && minigameDeck.targetDeckIds.length > 0) {
          // Lấy từ vựng chính xác từ các deck chỉ định trong targetDeckIds
          const fetchPromises = minigameDeck.targetDeckIds.map((targetId: string) =>
            fetch(`/data/decks/${vocFolder}/${targetId}.json`).then((r) => (r.ok ? r.json() : []))
          );
          const results = await Promise.all(fetchPromises);
          results.forEach((cards) => {
            allCards = [...allCards, ...cards];
          });
        } else {
          // Fallback: Tự động lấy thẻ của 3 bài học flashcard ngay trước bài minigame này
          const minigameIndex = decks.findIndex((d: any) => d.id === activeMinigameId);
          const previousDecks = decks
            .slice(0, minigameIndex)
            .filter((d: any) => d.level === minigameDeck.level && (!d.type || d.type === "flashcard"));
            
          const fetchPromises = previousDecks
            .slice(-3)
            .map((deck: any) => fetch(`/data/decks/${vocFolder}/${deck.id}.json`).then((r) => (r.ok ? r.json() : [])));
            
          const results = await Promise.all(fetchPromises);
          results.forEach((cards) => {
            allCards = [...allCards, ...cards];
          });
        }

        // Lọc và phân bổ từ vựng thông minh dựa trên lịch sử học tập (wordStats) của người học
        const limit = (minigameDeck.type === "minigame_rush" || minigameDeck.type === "minigame_rhythm") ? 15 : 7;
        const adaptiveCards = selectAdaptiveCards(allCards, wordStats, limit);
        setMinigameCards(adaptiveCards);
      } catch (err) {
        console.error("Lỗi tải minigame:", err);
      } finally {
        setIsLoadingMinigame(false);
      }
    };
    
    fetchMinigameCards();
  }, [activeMinigameId]);

  // ============================================================================
  // NAVIGATION & CORE ACTIONS (Hành động điều khiển cốt lõi)
  // ============================================================================

  /**
   * Thay đổi tab hiển thị chính và lưu lại lựa chọn vào localStorage
   */
  const handleTabChange = useCallback((tab: "journey" | "custom" | "shop" | "room" | "profile") => {
    setActiveTab(tab);
    localStorage.setItem("flashcard_active_tab", tab);
  }, []);

  /**
   * Xóa một bộ bài tự tạo (Custom Deck).
   * Hỗ trợ xóa online trên Firestore hoặc xóa local store.
   */
  const handleDeleteCustomDeck = useCallback(async (idToDelete: string) => {
    setIsDeleting(true);
    try {
      if (user) {
        await deleteDoc(doc(db, "decks", idToDelete));
        toast.success("Đã xóa bộ bài trên mây! ☁️🗑️");
      } else {
        toast.success("Đã xóa bộ bài trong máy! 📱🗑️");
      }
      deleteCustomDeck(idToDelete);
      setDeckToDelete(null);
    } catch (error) {
      console.error("Lỗi xóa bộ bài:", error);
      toast.error("Chưa xóa được bộ bài, thử lại nhé! 🥺");
    } finally {
      setIsDeleting(false);
    }
  }, [user, deleteCustomDeck]);

  /**
   * Tạo thư mục mới để gom nhóm các bộ bài học tập
   */
  const handleCreateFolder = useCallback((name: string) => {
    if (name && name.trim()) {
      const colors = ["#FFD166", "#06D6A0", "#FF7096", "#5390D9", "#B28DFF"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addFolder({
        id: "fld_" + Date.now().toString(),
        name: name.trim(),
        color: randomColor,
        createdAt: new Date().toISOString(),
      });
      toast.success("Tạo thư mục thành công! 📁");
      setIsCreatingFolder(false);
    }
  }, [addFolder]);

  /**
   * Chuyển bộ bài vào trong thư mục hoặc đưa ra ngoài thư mục tự do
   */
  const handleMoveDeck = useCallback(async (folderId: string | null) => {
    if (!deckToMove) return;
    await moveDeckToFolder(deckToMove, folderId);
    setDeckToMove(null);
    toast.success(
      folderId ? "Đã chuyển thẻ vào thư mục! 📁" : "Đã chuyển ra ngoài! 📦",
    );
  }, [deckToMove, moveDeckToFolder]);

  /**
   * Đổi tên thư mục học tập
   */
  const handleRenameFolder = useCallback((folderId: string, newName: string) => {
    if (newName && newName.trim()) {
      if (updateFolder) {
        updateFolder(folderId, { name: newName.trim() });
        toast.success("Đổi tên thành công! ✏️");
      } else {
        toast.error("Hành động đổi tên chưa được hỗ trợ!");
      }
      setFolderToRename(null);
    }
  }, [updateFolder]);

  /**
   * Xóa thư mục học tập.
   * Đồng thời kéo tất cả các bộ bài bên trong thư mục đó ra ngoài tự do (không xóa bài).
   */
  const handleDeleteFolder = useCallback(async (folderId: string) => {
    const decksInFolder = customDecks.filter(
      (d: any) => d.folderId === folderId,
    );
    for (const d of decksInFolder) {
      await moveDeckToFolder(d.id, null);
    }
    if (deleteFolder) {
      deleteFolder(folderId);
    }
    setSelectedFolderId(null);
    setFolderToDelete(null);
    toast.success("Đã xóa thư mục! 🗑️");
  }, [customDecks, moveDeckToFolder, deleteFolder]);

  /**
   * Ghim (Pin) hoặc bỏ ghim thư mục lên vị trí đầu tiên
   */
  const handleTogglePinFolder = useCallback((
    folderId: string,
    currentPinStatus: boolean = false,
  ) => {
    if (updateFolder) {
      updateFolder(folderId, { isPinned: !currentPinStatus });
    } else {
      toast.error("Hành động ghim thư mục chưa được hỗ trợ!");
    }
  }, [updateFolder]);

  return {
    // --- Điều hướng & Cấu hình ---
    activeTab,
    handleTabChange,
    user,
    equippedTheme,

    // --- Quản lý Custom Decks ---
    deckToDelete,
    setDeckToDelete,
    isDeleting,
    handleDeleteCustomDeck,
    currentFolderDecks,
    isLoadingDecks,
    loadCustomDecks,
    deckToMove,
    setDeckToMove,
    handleMoveDeck,

    // --- Quản lý Folders ---
    folders,
    isCreatingFolder,
    setIsCreatingFolder,
    selectedFolderId,
    setSelectedFolderId,
    folderToDelete,
    setFolderToDelete,
    folderToRename,
    setFolderToRename,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    isFolderDrawerOpen,
    setIsFolderDrawerOpen,
    folderSearchQuery,
    setFolderSearchQuery,
    handleTogglePinFolder,

    // --- Cốt truyện & Minigames ---
    activeStoryId,
    activeMinigameId,
    setActiveMinigameId,
    activeKanjiPracticeDeck,
    setActiveKanjiPracticeDeck,
    minigameDeckData,
    minigameCards,
    isLoadingMinigame,
    saveProgress,
  };
}
