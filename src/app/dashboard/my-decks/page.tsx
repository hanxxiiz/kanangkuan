"use client";

import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";
import NewFolderModal from "@/components/dashboard/my-decks/NewFolderModal";
import { ModalContext } from "@/components/modals/providers";
import { useContext, useState } from "react";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDecks } from "@/lib/hooks/useDecks";

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
  
  if (folderLoading || deckLoading) {
    return <div>My Decks Page is Loading...</div>
  }

  if (folderError || deckError) {
    return <div>Sorry something went wrong in My Decks Page... {folderError} {deckError} </div>
  }

  return (
    <div className="w-full bg-white p-10">
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
          { label: "All Folders", onClick: () => console.log("Folders Only") },
          { label: "All Decks", onClick: () => console.log("Decks Only") },
          { label: "A–Z", onClick: () => console.log("Sort A–Z") },
          { label: "Newest to Oldest", onClick: () => console.log("Newest first") },
          { label: "Oldest to Newest", onClick: () => console.log("Oldest first") },
        ]}
      >
        {folders.length === 0 && decks.length === 0 ? (
          <div className="text-gray-500 text-7xl font-main">Nothing here yet</div>
        ) : (
          <>
            {folders.map((folder) => (
              <Folder
                key={folder.id}
                id={folder.id}
                color={folder.folder_color}
                folderName={folder.folder_name}
                deckCount={decks.filter((deck) => deck.folder_id === folder.id).length}
              />
            ))}
            {decks
              .filter((deck) => deck.folder_id === null)
              .map((deck) => (
              <Deck
                key={deck.id}
                id={deck.id}
                color={deck.deck_color}
                deckName={deck.deck_name}
                cardCount={folders.length}
              />
            ))}
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