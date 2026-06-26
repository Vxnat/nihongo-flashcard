"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAdmin } from "@/hooks/admin/useAdmin";
import { withAdminAuth } from "@/components/admin/withAdminAuth";

// Subcomponents imports
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DecksTab } from "@/components/admin/DecksTab";
import { GachaShopTab } from "@/components/admin/GachaShopTab";
import { QuestsTab } from "@/components/admin/QuestsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { SettingsTab } from "@/components/admin/SettingsTab";

// Modals imports
import { CardEditorDrawer } from "@/components/admin/CardEditorDrawer";
import { ExcelImportModal } from "@/components/admin/ExcelImportModal";
import { DeckMetadataModal } from "@/components/admin/DeckMetadataModal";
import { GachaItemModal } from "@/components/admin/GachaItemModal";
import { ShopItemModal } from "@/components/admin/ShopItemModal";
import { QuestModal } from "@/components/admin/QuestModal";

function AdminPage() {
  const admin = useAdmin();

  return (
    <div className="h-screen w-full bg-[#FAF6EE] text-zinc-800 flex overflow-hidden" style={{ fontFamily: "var(--font-rounded)" }}>
      {/* Sidebar */}
      <AdminSidebar
        activeTab={admin.activeTab}
        setActiveTab={admin.setActiveTab}
        setSelectedDeck={admin.setSelectedDeck}
        user={admin.user}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b-2 border-zinc-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {admin.selectedDeck && (
              <button
                onClick={() => admin.setSelectedDeck(null)}
                className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-base font-black text-zinc-700 uppercase" style={{ fontFamily: "var(--font-cherry)" }}>
              {admin.selectedDeck ? `Chi tiết bộ thẻ: ${admin.selectedDeck.title}` : `Phân hệ ${admin.activeTab}`}
            </h2>
          </div>
          <div>
            <a
              href="/"
              className="text-xs font-black text-[#8C6D58] bg-[#8C6D58]/10 hover:bg-[#8C6D58]/20 px-4 py-2 rounded-xl border border-[#8C6D58]/20 transition-all"
            >
              VỀ TRANG CHỦ SHIBA TOWN
            </a>
          </div>
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-auto p-6 relative">
          {admin.isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <img src="/images/mascot/mascot-hi.gif" className="w-16 h-16 animate-bounce" />
                <p className="text-xs font-black text-[#8C6D58] animate-pulse">Đang cập nhật đĩa cứng...</p>
              </div>
            </div>
          )}

          {admin.activeTab === "decks" && (
            <DecksTab
              decks={admin.decks}
              filteredDecks={admin.filteredDecks}
              selectedDeck={admin.selectedDeck}
              setSelectedDeck={admin.setSelectedDeck}
              cards={admin.cards}
              cardSearch={admin.cardSearch}
              setCardSearch={admin.setCardSearch}
              selectedCard={admin.selectedCard}
              setSelectedCard={admin.setSelectedCard}
              setIsImportOpen={admin.setIsImportOpen}
              levelFilter={admin.levelFilter}
              setLevelFilter={admin.setLevelFilter}
              typeFilter={admin.typeFilter}
              setTypeFilter={admin.setTypeFilter}
              handleBackupData={admin.handleBackupData}
              handleCreateNewDeck={admin.handleCreateNewDeck}
              handleEditDeckMetadata={admin.handleEditDeckMetadata}
              handleDeleteDeck={admin.handleDeleteDeck}
              loadDeckCards={admin.loadDeckCards}
              handleSaveDeck={admin.handleSaveDeck}
              handleAddCard={admin.handleAddCard}
              handleCardDelete={admin.handleCardDelete}
              loadSystemDecks={admin.loadSystemDecks}
            />
          )}

          {admin.activeTab === "gacha_shop" && (
            <GachaShopTab
              filteredGachaPool={admin.filteredGachaPool}
              gachaRarityFilter={admin.gachaRarityFilter}
              setGachaRarityFilter={admin.setGachaRarityFilter}
              gachaTypeFilter={admin.gachaTypeFilter}
              setGachaTypeFilter={admin.setGachaTypeFilter}
              gachaSearch={admin.gachaSearch}
              setGachaSearch={admin.setGachaSearch}
              handleCreateGachaItem={admin.handleCreateGachaItem}
              handleEditGachaItem={admin.handleEditGachaItem}
              handleDeleteGachaItem={admin.handleDeleteGachaItem}
              filteredShopExclusives={admin.filteredShopExclusives}
              handleCreateShopItem={admin.handleCreateShopItem}
              handleEditShopItem={admin.handleEditShopItem}
              handleDeleteShopItem={admin.handleDeleteShopItem}
              filteredShopConsumables={admin.filteredShopConsumables}
              typeWeights={admin.typeWeights}
              handleSaveTypeWeights={admin.handleSaveTypeWeights}
              handleClearAllItems={admin.handleClearAllItems}
              handleSeedGachaAndShop={admin.handleSeedGachaAndShop}
            />
          )}

          {admin.activeTab === "quests" && (
            <QuestsTab
              filteredQuests={admin.filteredQuests}
              questSearch={admin.questSearch}
              setQuestSearch={admin.setQuestSearch}
              handleCreateQuest={admin.handleCreateQuest}
              handleEditQuest={admin.handleEditQuest}
              handleDeleteQuest={admin.handleDeleteQuest}
            />
          )}

          {admin.activeTab === "users" && (
            <UsersTab
              usersStatsList={admin.usersStatsList}
              selectedUser={admin.selectedUser}
              setSelectedUser={admin.setSelectedUser}
              searchUserQuery={admin.searchUserQuery}
              setSearchUserQuery={admin.setSearchUserQuery}
              handleUpdateUserStat={admin.handleUpdateUserStat}
            />
          )}

          {admin.activeTab === "settings" && (
            <SettingsTab
              systemSettings={admin.systemSettings}
              setSystemSettings={admin.setSystemSettings}
              handleUpdateSystemSetting={admin.handleUpdateSystemSetting}
            />
          )}
        </div>
      </div>

      {/* DRAWER CARD EDITOR */}
      <AnimatePresence>
        {admin.selectedCard && (
          <CardEditorDrawer
            selectedCard={admin.selectedCard}
            setSelectedCard={admin.setSelectedCard}
            cards={admin.cards}
            handleCardSave={admin.handleCardSave}
          />
        )}
      </AnimatePresence>

      {/* MODAL IMPORT EXCEL */}
      <AnimatePresence>
        {admin.isImportOpen && (
          <ExcelImportModal
            setIsImportOpen={admin.setIsImportOpen}
            importText={admin.importText}
            setImportText={admin.setImportText}
            importDelimiter={admin.importDelimiter}
            setImportDelimiter={admin.setImportDelimiter}
            handleImport={admin.handleImport}
          />
        )}
      </AnimatePresence>

      {/* MODAL DECKS METADATA EDITOR */}
      <AnimatePresence>
        {admin.isDeckModalOpen && (
          <DeckMetadataModal
            editingDeck={admin.editingDeck}
            setIsDeckModalOpen={admin.setIsDeckModalOpen}
            deckForm={admin.deckForm}
            setDeckForm={admin.setDeckForm}
            handleSaveDeckMetadata={admin.handleSaveDeckMetadata}
          />
        )}
      </AnimatePresence>

      {/* MODAL GACHA ITEM EDITOR */}
      <AnimatePresence>
        {admin.isGachaModalOpen && admin.selectedGachaItem && (
          <GachaItemModal
            selectedGachaItem={admin.selectedGachaItem}
            setSelectedGachaItem={admin.setSelectedGachaItem}
            gachaPool={admin.gachaPool}
            setIsGachaModalOpen={admin.setIsGachaModalOpen}
            handleSaveGachaItem={admin.handleSaveGachaItem}
          />
        )}
      </AnimatePresence>

      {/* MODAL SHOP ITEM EDITOR */}
      <AnimatePresence>
        {admin.isShopModalOpen && admin.selectedShopItem && (
          <ShopItemModal
            selectedShopItem={admin.selectedShopItem}
            setSelectedShopItem={admin.setSelectedShopItem}
            shopExclusives={admin.shopExclusives}
            shopConsumables={admin.shopConsumables}
            setIsShopModalOpen={admin.setIsShopModalOpen}
            handleSaveShopItem={admin.handleSaveShopItem}
            shopItemType={admin.shopItemType}
          />
        )}
      </AnimatePresence>

      {/* MODAL QUEST EDITOR */}
      <AnimatePresence>
        {admin.isQuestModalOpen && admin.selectedQuest && (
          <QuestModal
            selectedQuest={admin.selectedQuest}
            setSelectedQuest={admin.setSelectedQuest}
            dailyQuests={admin.dailyQuests}
            setIsQuestModalOpen={admin.setIsQuestModalOpen}
            handleSaveQuest={admin.handleSaveQuest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAdminAuth(AdminPage);
