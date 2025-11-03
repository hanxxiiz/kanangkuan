"use client";

import Deck from "@/components/dashboard/my-decks/Deck";
import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";
import { ModalContext } from "@/components/modals/providers";
import { useRouter } from "next/navigation";
import { use, useContext } from "react";

export default function MyFolderPage({
    params,
}: {
    params: Promise<{ folderId: string }>
}) {
    const { folderId } = use(params);

    const { Modal, setShowModal } = useContext(ModalContext);
    const router = useRouter();

    return (
      <div className="w-full bg-white p-10">
        <DecksPageLayout
            title="[Folder Name]"
            onAddClick={() => {
                setShowModal(true);
            }}
            filterOptions={[
            { label: "A–Z", onClick: () => console.log("Sort A–Z") },
            { label: "Newest to Oldest", onClick: () => console.log("Newest first") },
            { label: "Oldest to Newest", onClick: () => console.log("Oldest first") },
            ]}
        >
            <Deck id="cardniangkol" color="lime" deckName="huh?" cardCount={3} />
        </DecksPageLayout>


        <Modal
            heading="New Deck"
            actionButtonText="Create"
            onAction={() => {
                router.push("/");
                setShowModal(false);
            }}
        >
            <NewDeckModal />
        </Modal>
        
      </div>
    )
}
