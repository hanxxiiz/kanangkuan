"use client";

import Card from "@/components/dashboard/my-decks/Card";
import CardsPageLayout from "@/components/profile/CardsPageLayout";
import { useCards } from "@/lib/hooks/useCards";
import { useDecks } from "@/lib/hooks/useDecks";
import { useViewMode } from "@/lib/hooks/useViewMode";
import { use, useMemo } from "react";

export default function MyDeckPage({
    params,
}: {
    params: Promise<{ userId: string; deckId: string }>
}) {
    const { userId, deckId } = use(params);
    const { deck, deckLoading, deckError } = useDecks(deckId, userId); 
    const { cards, cardLoading, cardError } = useCards(deckId, userId);

    const deckName = deckLoading
        ? "Loading..."
        : deck?.deck_name || "Deck Not Found";

    const deckCards = useMemo(() => {
        return cards
            .filter((card) => card.deck_id === deckId)
            .map((card) => ({
                type: 'card' as const,
                data: card,
                id: card.id,
                name: card.front,
                date: new Date(card.created_at || 0)
            }));
    }, [cards, deckId]);

    const {  setViewMode, sortedItems } = useViewMode({
        items: deckCards,
        getDate: (item) => item.date,
        getName: (item) => item.name,
    });

    if (cardLoading || deckLoading) {
        return <div>Loading...</div>;
    }

    if (cardError || deckError) {
        return <div>Sorry something went wrong... {cardError} {deckError}</div>;
    }

    return (
      <div className="w-full bg-white p-10">
        <CardsPageLayout
            currentDeckId={deckId}
            title={deckName}
            filterOptions={[
                { label: "All", onClick: () => setViewMode("all") },
                { label: "Newest to Oldest", onClick: () => setViewMode("newest") },
                { label: "Oldest to Newest", onClick: () => setViewMode("oldest") },
            ]}
        >   
            {sortedItems.length === 0 ? (
                <div className="text-gray-500 text-7xl font-main">Nothing here yet</div>
            ) : (
                <>
                    {sortedItems.map((item) => (
                        <Card
                            key={`card-${item.id}`}
                            id={item.id}
                            front={item.data.front}
                            back={item.data.back}
                            color={deck?.deck_color}
                        />
                    ))}
                </>
            )}
        </CardsPageLayout>
      </div>
    );
}