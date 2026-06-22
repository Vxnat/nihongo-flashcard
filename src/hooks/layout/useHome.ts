import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FlashcardData } from "@/types/flashcard";

const defaultDecks = [] as any[];

export function useHome() {
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"journey" | "custom" | "shop" | "room" | "profile">(
    "journey",
  );
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [deckToMove, setDeckToMove] = useState<string | null>(null);
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");

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

  // Khôi phục tab người dùng đã chọn từ phiên làm việc trước
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

  const handleTabChange = (tab: "journey" | "custom" | "shop" | "room" | "profile") => {
    setActiveTab(tab);
    localStorage.setItem("flashcard_active_tab", tab);
  };

  // Lắng nghe trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Hủy lắng nghe khi unmount
  }, [setUser]);

  // Tải lại bộ bài mỗi khi thay đổi user (đăng nhập / đăng xuất)
  useEffect(() => {
    loadCustomDecks(user?.uid);
    loadFolders(user?.uid);
    loadUserStats(); // Lấy luôn thống kê học của người dùng vừa đăng nhập
  }, [user?.uid, loadCustomDecks, loadFolders, loadUserStats]);

  const customList = customDecks.map((d: any) => ({ ...d, isCustom: true }));
  const allDecks = [...defaultDecks, ...customList];

  // Lọc bộ bài theo thư mục được chọn (Nếu không chọn thì hiện bộ bài tự do)
  const currentFolderDecks = allDecks.filter((d) =>
    selectedFolderId ? d.folderId === selectedFolderId : !d.folderId,
  );

  const handleDeleteCustomDeck = async (idToDelete: string) => {
    setIsDeleting(true);
    try {
      if (user) {
        await deleteDoc(doc(db, "decks", idToDelete));
        toast.success("Đã xóa bộ bài trên mây! ☁️🗑️");
      } else {
        toast.success("Đã xóa bộ bài trong máy! 📱🗑️");
      }
      deleteCustomDeck(idToDelete);
      setDeckToDelete(null); // Đóng popup sau khi xóa
    } catch (error) {
      console.error("Lỗi xóa bộ bài:", error);
      toast.error("Chưa xóa được bộ bài, thử lại nhé! 🥺");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateFolder = (name: string) => {
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
  };

  const handleMoveDeck = async (folderId: string | null) => {
    if (!deckToMove) return;
    await moveDeckToFolder(deckToMove, folderId);
    setDeckToMove(null);
    toast.success(
      folderId ? "Đã chuyển thẻ vào thư mục! 📁" : "Đã chuyển ra ngoài! 📦",
    );
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    if (newName && newName.trim()) {
      if (updateFolder) {
        updateFolder(folderId, { name: newName.trim() });
        toast.success("Đổi tên thành công! ✏️");
      } else {
        toast.error("Hàm updateFolder chưa được định nghĩa trong store!");
      }
      setFolderToRename(null);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    // Kéo tất cả bộ bài trong thư mục này ra ngoài (folderId = null)
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
  };

  const handleTogglePinFolder = (
    folderId: string,
    currentPinStatus: boolean = false,
  ) => {
    if (updateFolder) {
      updateFolder(folderId, { isPinned: !currentPinStatus });
    } else {
      toast.error("Hàm updateFolder chưa được định nghĩa trong store!");
    }
  };

  // States and actions for active stories and minigames moved from Home page
  const activeStoryId = useAppStore((state) => state.activeStoryId);
  const activeMinigameId = useAppStore((state: any) => state.activeMinigameId);
  const setActiveMinigameId = useAppStore(
    (state: any) => state.setActiveMinigameId,
  );
  const activeKanjiPracticeDeck = useAppStore((state) => state.activeKanjiPracticeDeck);
  const setActiveKanjiPracticeDeck = useAppStore((state) => state.setActiveKanjiPracticeDeck);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const equippedTheme = useAppStore((state) => state.userStats.equippedTheme);

  const [minigameDeckData, setMinigameDeckData] = useState<any>(null); // Store minigame deck data
  const [minigameCards, setMinigameCards] = useState<FlashcardData[]>([]);
  const [isLoadingMinigame, setIsLoadingMinigame] = useState(false);

  // Đồng bộ theme với body class
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

  // Tự động fetch data lấy thẻ bài từ các bài trước khi mở Minigame
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

        const folder = minigameDeck.level.toLowerCase(); // VD: n5, n4

        // 1. GAME ĐẶC THÙ (KANJI) -> Fetch data từ file json rời
        if (minigameDeck.type === "minigame_kanji") {
          const dataRes = await fetch(`/data/decks/${folder}/${minigameDeck.id}.json`).catch(() => null);
          if (dataRes && dataRes.ok) {
            const data = await dataRes.json();
            // Tiêm mảng kanji vào lại object deck để truyền cho KanjiDojoGame
            setMinigameDeckData({ ...minigameDeck, kanjiList: data });
          } else {
            setMinigameDeckData(minigameDeck);
          }
          setMinigameCards([]);
          setIsLoadingMinigame(false);
          return;
        }

        setMinigameDeckData(minigameDeck);

        // 2. GAME ÔN TẬP (MATCHING, RUSH) -> Lấy data dựa vào targetDeckIds
        let allCards: FlashcardData[] = [];

        if (minigameDeck.targetDeckIds && minigameDeck.targetDeckIds.length > 0) {
          // Dùng Promise.all để fetch tất cả các file cần ôn tập cùng lúc
          const fetchPromises = minigameDeck.targetDeckIds.map((targetId: string) =>
            fetch(`/data/decks/${folder}/${targetId}.json`).then((r) => (r.ok ? r.json() : []))
          );

          const results = await Promise.all(fetchPromises);

          // Gộp tất cả các mảng kết quả thành 1 mảng duy nhất
          results.forEach((cards) => {
            allCards = [...allCards, ...cards];
          });
        } else {
          // Fallback: Lấy tất cả bài flashcard trước đó nếu chưa cấu hình targetDeckIds
          const minigameIndex = decks.findIndex((d: any) => d.id === activeMinigameId);
          const previousDecks = decks.slice(0, minigameIndex).filter((d: any) => d.level === minigameDeck.level && (!d.type || d.type === "flashcard"));
          const fetchPromises = previousDecks.slice(-3).map((deck: any) => fetch(`/data/decks/${folder}/${deck.id}.json`).then((r) => (r.ok ? r.json() : [])));
          const results = await Promise.all(fetchPromises);
          results.forEach((cards) => { allCards = [...allCards, ...cards]; });
        }

        const shuffled = allCards.sort(() => Math.random() - 0.5);
        // Game Băng chuyền cần nhiều từ vựng hơn, Nối từ cần ít hơn
        const limit = minigameDeck.type === "minigame_rush" ? 15 : 7;
        setMinigameCards(shuffled.slice(0, limit));
      } catch (err) {
        console.error("Lỗi tải minigame:", err);
      } finally {
        setIsLoadingMinigame(false);
      }
    };
    fetchMinigameCards();
  }, [activeMinigameId]);

  return {
    activeTab,
    handleTabChange,
    deckToDelete,
    setDeckToDelete,
    folderToDelete,
    setFolderToDelete,
    folderToRename,
    setFolderToRename,
    isCreatingFolder,
    setIsCreatingFolder,
    isDeleting,
    handleDeleteCustomDeck,
    selectedFolderId,
    setSelectedFolderId,
    deckToMove,
    setDeckToMove,
    handleMoveDeck,
    folders,
    handleCreateFolder,
    currentFolderDecks,
    isLoadingDecks,
    handleRenameFolder,
    handleDeleteFolder,
    isFolderDrawerOpen,
    setIsFolderDrawerOpen,
    folderSearchQuery,
    setFolderSearchQuery,
    handleTogglePinFolder,
    user,
    loadCustomDecks,
    activeStoryId,
    activeMinigameId,
    setActiveMinigameId,
    activeKanjiPracticeDeck,
    setActiveKanjiPracticeDeck,
    minigameDeckData,
    minigameCards,
    isLoadingMinigame,
    saveProgress,
    equippedTheme,
  };
}
