"use client";

import DecksPageLayout from "@/components/profile/DecksPageLayout";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";
import { useMemo } from "react";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDecks } from "@/lib/hooks/useDecks";
import { useCards } from "@/lib/hooks/useCards";
import { useViewMode } from "@/lib/hooks/useViewMode";

export default function MyDecksPage() {

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
    return <div>My Decks Page is Loading...</div>
  }

  if (folderError || deckError) {
    return <div>Sorry something went wrong in My Decks Page... {folderError} {deckError} </div>
  }

  return (
    <div className="w-full bg-white p-10">
      <DecksPageLayout
        title="My Decks"
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
    </div>
  );
}