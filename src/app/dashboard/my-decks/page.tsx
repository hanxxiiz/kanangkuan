"use client";

import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";
import NewFolderModal from "@/components/dashboard/my-decks/NewFolderModal";
import { ModalContext } from "@/components/modals/providers";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";

type ModalType = "folder" | "deck" | null;

export default function MyDecksPage() {
  const { Modal, setShowModal } = useContext(ModalContext);
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setShowModal(true);
  };

  const handleAction = () => {
    router.push("/");
  };

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
          { label: "Folders", onClick: () => console.log("Folders Only") },
          { label: "Decks", onClick: () => console.log("Decks Only") },
          { label: "A–Z", onClick: () => console.log("Sort A–Z") },
          { label: "Newest to Oldest", onClick: () => console.log("Newest first") },
          { label: "Oldest to Newest", onClick: () => console.log("Oldest first") },
        ]}
      >
        <Folder id="1" color="cyan" folderName="please?" deckCount={2} />
        <Deck color="lime" deckName="huh?" cardCount={3} />
      </DecksPageLayout>

      {activeModal === "folder" && (
        <Modal
          heading="New Folder"
          actionButtonText="Create"
          onAction={handleAction}
        >
          <NewFolderModal />
        </Modal>
      )}

      {activeModal === "deck" && (
        <Modal
          heading="New Deck"
          actionButtonText="Create"
          onAction={handleAction}
        >
          <NewDeckModal />
        </Modal>
      )}
    </div>
  );
}