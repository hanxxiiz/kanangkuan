"use client";

import Deck from "@/components/dashboard/my-decks/Deck";
import DecksPageLayout from "@/components/profile/DecksPageLayout";
import NewDeckModal from "@/components/dashboard/my-decks/NewDeckModal";
import { useCards } from "@/lib/hooks/useCards";
import { useDecks } from "@/lib/hooks/useDecks";
import { useFolders } from "@/lib/hooks/useFolders";
import { useViewMode } from "@/lib/hooks/useViewMode";
import { use, useMemo } from "react";
import StylishLoader2 from "@/components/ui/StylishLoader2";

export default function MyFolderPage({
    params,
}: {
    params: Promise<{ userId: string; folderId: string }>
}) {
    const { userId, folderId } = use(params);
    const { decks, deckLoading, deckError } = useDecks(undefined, userId);
    const { cards } = useCards(undefined, userId);
    const { folder, folderLoading, folderError } = useFolders(folderId, userId);

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
        return <StylishLoader2 />;
    }

    if (deckError || folderError) {
        return <div>Sorry something went wrong... {deckError} {folderError}</div>;
    }

    return (
        <div className="w-full bg-white p-10">
            <DecksPageLayout
                title={folderName}
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