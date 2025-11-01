"use client";

import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";
import NewFolderModal from "@/components/dashboard/my-decks/NewFolderModal";
import { ModalContext } from "@/components/modals/providers";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";

export default function MyDecks() {
  const { Modal , setShowModal} = useContext(ModalContext);
  const router = useRouter(); 

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);

  const openNewFolderModal = () => {
    setShowModal(true);
    setShowNewFolderModal(true);
  };

  const openNewDeckModal = () => {
    setShowModal(true);
    setShowNewDeckModal(true);
  };

  return (
    <div className="w-full bg-white p-10">
      <DecksPageLayout
        title="My Decks"
        onAddClick={() => {
          console.log("Add button clicked!");
        }}
        addOptions={[
          { label: "New Folder", onClick: openNewFolderModal },
          { label: "New Deck", onClick: openNewDeckModal },
        ]}
        filterOptions={[
          { label: "Folders", onClick: () => console.log("Folders Only") },
          { label: "Decks", onClick: () => console.log("Decks Only") },
          { label: "A–Z", onClick: () => console.log("Sort A–Z") },
          { label: "Newest to Oldest", onClick: () => console.log("Newest first") },
          { label: "Oldest to Newest", onClick: () => console.log("Oldest first") },
        ]}
      >
        <Folder color="cyan" folderName="please?" deckCount={2} />
        <Deck color="lime" deckName="huh?" cardCount={3} />
      </DecksPageLayout>

      {showNewFolderModal && (
        <Modal
          heading="New Folder"
          actionButtonText="Create"
          onAction={() => {
            router.push("/");
            setShowModal(false);
            setShowNewFolderModal(false);
          }}
        >
          <NewFolderModal />
        </Modal>
      )}

      {showNewDeckModal && (
        <Modal
          heading="New Deck"
          actionButtonText="Create"
          onAction={() => {
            router.push("/");
            setShowModal(false);
            setShowNewDeckModal(false);
          }}
        >
          <NewDeckModal />
        </Modal>
      )}
    </div>
  );
}
