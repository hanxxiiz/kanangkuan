"use client";

import Deck from "@/components/dashboard/my-decks/Deck";
import DecksPageLayout from "@/components/dashboard/my-decks/DecksPageLayout";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";
import { ModalContext } from "@/components/modals/providers";
import { useCards } from "@/lib/hooks/useCards";
import { useDecks } from "@/lib/hooks/useDecks";
import { useFolders } from "@/lib/hooks/useFolders";
import { useViewMode } from "@/lib/hooks/useViewMode";
import { use, useContext, useMemo } from "react";

export default function MyFolderPage({
    params,
}: {
    params: Promise<{ folderId: string }>
}) {
    const { folderId } = use(params);
    const { decks, deckLoading, deckError } = useDecks();
    const { cards } = useCards();
    const { folder, folderLoading, folderError } = useFolders(folderId);
    const { setShowModal } = useContext(ModalContext);

    const folderName = folderLoading
        ? "Loading..."
        : folder?.folder_name || "Folder Not Found";

    const folderDecks = useMemo(() => {
        return decks
            .filter((deck) => deck.folder_id === folderId)
            .map((deck) => ({
                type: 'deck' as const,
                data: deck,
                id: deck.id,
                name: deck.deck_name,
                date: new Date(deck.created_at || 0)
            }));
    }, [decks, folderId]);

    const { setViewMode, sortedItems } = useViewMode({
        items: folderDecks,
        getDate: (item) => item.date,
        getName: (item) => item.name,
    });

    if (deckLoading || folderLoading) {
        return <div>Loading...</div>;
    }

    if (deckError || folderError) {
        return <div>Sorry something went wrong... {deckError} {folderError}</div>;
    }

    return (
        <div className="w-full bg-white lg:p-10">
            <DecksPageLayout
                title={folderName}
                onAddClick={() => {
                    setShowModal(true);
                }}
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
                        {sortedItems.map((item) => (
                            <Deck
                                key={`deck-${item.id}`}
                                id={item.id}
                                color={item.data.deck_color}
                                deckName={item.data.deck_name}
                                cardCount={cards.filter((card) => card.deck_id === item.id).length}
                            />
                        ))}
                    </>
                )}
            </DecksPageLayout>

            <NewDeckModal currentFolderId={folderId} />
        </div>
    );
}