"use client";

import React, { useMemo } from "react";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";

import { useFolders } from "@/lib/hooks/useFolders";
import { useDecks } from "@/lib/hooks/useDecks";
import { useCards } from "@/lib/hooks/useCards";

export default function ProfileRecentItems() {
  const { folders, folderLoading } = useFolders();
  const { decks, deckLoading } = useDecks();
  const { cards } = useCards();

  // 🔥 Combine folders + top-level decks into ONE list
  const combined = useMemo(() => {
    const folderItems = folders.map(folder => ({
      type: "folder" as const,
      id: folder.id,
      color: folder.folder_color,
      name: folder.folder_name,
      date: new Date(folder.created_at || 0),
      item: folder
    }));

    const deckItems = decks
      .filter(deck => deck.folder_id === null)
      .map(deck => ({
        type: "deck" as const,
        id: deck.id,
        color: deck.deck_color,
        name: deck.deck_name,
        date: new Date(deck.created_at || 0),
        item: deck
      }));

    return [...folderItems, ...deckItems];
  }, [folders, decks]);

  // 🔥 Sort by creation date (newest -> oldest)
  const sorted = useMemo(() => {
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [combined]);

  // 🔥 Get only the top 3 items
  const topThree = sorted.slice(0, 3);

  if (folderLoading || deckLoading) {
    return <div>Loading recent items...</div>;
  }

  if (topThree.length === 0) {
    return <p className="text-gray-500 text-xl font-main">No recent items</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[40px] gap-y-[50px] mt-6">
      {topThree.map((entry) =>
        entry.type === "folder" ? (
          <Folder
            key={`folder-${entry.id}`}
            id={entry.id}
            color={entry.color}
            folderName={entry.name}
            deckCount={decks.filter(d => d.folder_id === entry.id).length}
          />
        ) : (
          <Deck
            key={`deck-${entry.id}`}
            id={entry.id}
            color={entry.color}
            deckName={entry.name}
            cardCount={cards.filter(c => c.deck_id === entry.id).length}
          />
        )
      )}
    </div>
  );
}
