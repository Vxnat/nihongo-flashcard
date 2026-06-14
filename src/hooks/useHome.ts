import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const defaultDecks = [] as any[];

export function useHome() {
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"journey" | "custom" | "shop">(
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
      savedTab === "shop"
    ) {
      setActiveTab(savedTab as "journey" | "custom" | "shop");
    }
  }, []);

  const handleTabChange = (tab: "journey" | "custom" | "shop") => {
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
  };
}
