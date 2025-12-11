"use client";

import React, { useMemo } from "react";
import Folder from "@/components/dashboard/my-decks/Folder";
import Deck from "@/components/dashboard/my-decks/Deck";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDecks } from "@/lib/hooks/useDecks";
import { useCards } from "@/lib/hooks/useCards";
import StylishLoader2 from "../ui/StylishLoader2";

type RecentItemsProps = {
  userId: string;
  isOwnProfile?: boolean;
}

export default function ProfileRecentItems({ userId }: RecentItemsProps) {
  // Scope data to the viewed user's content
  const { folders, folderLoading } = useFolders(undefined, userId);
  const { decks, deckLoading } = useDecks(undefined, userId);
  const { cards } = useCards(undefined, userId);

  // Combine folders + top-level decks into ONE list
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

  //Sorts by creation date (newest -> oldest)
  const sorted = useMemo(() => {
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [combined]);

  //Gets only 3 recent decks
  const topThree = sorted.slice(0, 3);

  if (folderLoading || deckLoading) {
    return <StylishLoader2 />
  }

  if (topThree.length === 0) {
    return <p className="text-gray-500 text-xl font-main">No recent decks</p>;
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
            userId={userId}
          />
        ) : (
          <Deck
            key={`deck-${entry.id}`}
            id={entry.id}
            color={entry.color}
            deckName={entry.name}
            cardCount={cards.filter(c => c.deck_id === entry.id).length}
            userId={userId}
          />
        )
      )}
    </div>
  );
}
