"use client";

import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";
import NewFolderModal from "@/components/dashboard/my-decks/NewFolderModal";
import { ModalContext } from "@/components/modals/providers";
import { useContext, useState, useMemo } from "react";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDecks } from "@/lib/hooks/useDecks";
import { useCards } from "@/lib/hooks/useCards";
import { useViewMode } from "@/lib/hooks/useViewMode";
import StylishLoader2 from "@/components/ui/StylishLoader2";

type ModalType = "folder" | "deck" | null;

export default function MyDecksPage() {
  const { setShowModal } = useContext(ModalContext);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setShowModal(true);
  };

  const { folders, folderLoading, folderError } = useFolders();
  const { decks, deckLoading, deckError } = useDecks();
  const { cards } = useCards();

  const allItems = useMemo(() => {
    return [
      ...folders.map(folder => ({
        type: 'folder' as const,
        data: folder,
        id: folder.id,
        name: folder.folder_name,
        date: new Date(folder.created_at || 0)
      })),
      ...decks
        .filter(deck => deck.folder_id === null)
        .map(deck => ({
          type: 'deck' as const,
          data: deck,
          id: deck.id,
          name: deck.deck_name,
          date: new Date(deck.created_at || 0)
        }))
    ];
  }, [folders, decks]);

  const { setViewMode, sortedItems } = useViewMode({
    items: allItems,
    getDate: (item) => item.date,
    getName: (item) => item.name,
  });
  
  if (folderLoading || deckLoading) {
    return <StylishLoader2 />
  }

  if (folderError || deckError) {
    return <div>Sorry something went wrong in My Decks Page... {folderError} {deckError} </div>
  }

  return (
    <div className="w-full bg-white lg:p-10">
      <DecksPageLayout
        title="My Decks"
        onAddClick={() => {
          console.log("Add button clicked!");
        }}
        addOptions={[
          { label: "New Folder", onClick: () => openModal("folder") },
          { label: "New Deck", onClick: () => openModal("deck") },
        ]}
        filterOptions={[
          { label: "All", onClick: () => setViewMode("all") },
          { label: "A–Z", onClick: () => setViewMode("a-z") },
          { label: "Newest to Oldest", onClick: () => setViewMode("newest") },
          { label: "Oldest to Newest", onClick: () => setViewMode("oldest") },
        ]}
      >
        {sortedItems.length === 0 ? (
          <div className="text-gray-500 text-7xl font-main">Nothing here yet</div>
        ) : (
          <>
            {sortedItems.map((item) => {
              if (item.type === 'folder') {
                return (
                  <Folder
                    key={`folder-${item.id}`}
                    id={item.id}
                    color={item.data.folder_color}
                    folderName={item.data.folder_name}
                    deckCount={decks.filter((deck) => deck.folder_id === item.id).length}
                  />
                );
              } else {
                return (
                  <Deck
                    key={`deck-${item.id}`}
                    id={item.id}
                    color={item.data.deck_color}
                    deckName={item.data.deck_name}
                    cardCount={cards.filter((card) => card.deck_id === item.id).length}
                  />
                );
              }
            })}
          </>
        )}
      </DecksPageLayout>

      {activeModal === "folder" && (
          <NewFolderModal />
      )}

      {activeModal === "deck" && (
          <NewDeckModal />
      )}
    </div>
  );
}