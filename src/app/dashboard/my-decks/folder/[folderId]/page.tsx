"use client";

import Deck from "@/components/dashboard/my-decks/Deck";
import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";
import { ModalContext } from "@/components/modals/providers";
import { useDecks } from "@/lib/hooks/useDecks";
import { useFolders } from "@/lib/hooks/useFolders";
import { useRouter } from "next/navigation";
import { use, useContext } from "react";

export default function MyFolderPage({
    params,
}: {
    params: Promise<{ folderId: string }>
}) {
    const { folderId } = use(params);
    const {decks, deckLoading, deckError} = useDecks();
    const { folder, folderLoading, folderError } = useFolders(folderId);
    const { setShowModal } = useContext(ModalContext);

    const folderName = folderLoading
        ? "Loading..."
        : folder?.folder_name || "Folder Not Found";


    return (
      <div className="w-full bg-white p-10">
        <DecksPageLayout
            title={folderName}
            onAddClick={() => {
                setShowModal(true);
            }}
            filterOptions={[
            { label: "A–Z", onClick: () => console.log("Sort A–Z") },
            { label: "Newest to Oldest", onClick: () => console.log("Newest first") },
            { label: "Oldest to Newest", onClick: () => console.log("Oldest first") },
            ]}
        >
            {decks.length === 0 ? (
                <div className="text-gray-500 text-7xl font-main">Nothing here yet</div>
            ) : (
                <>
                    {decks
                        .filter((deck) => deck.folder_id === folderId)
                        .map((deck) => (
                          <Deck
                            key={deck.id}
                            id={deck.id}
                            color={deck.deck_color}
                            deckName={deck.deck_name}
                            cardCount={decks.length}
                          />
                        ))
                    }
                </>
            )}
        </DecksPageLayout>

        <NewDeckModal currentFolderId={folderId}/>
        
      </div>
    )
}
