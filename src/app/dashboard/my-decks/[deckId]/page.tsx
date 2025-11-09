"use client";

import Card from "@/components/dashboard/my-decks/Card";
import CardsPageLayout from "@/components/dashboard/my-decks/CardsPageLayout";
import { useCards } from "@/lib/hooks/useCards";
import { useDecks } from "@/lib/hooks/useDecks";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function MyDeckPage({
    params,
}: {
    params: Promise<{ deckId: string }>
}) {
    const { deckId } = use(params);
    const { deck, deckLoading, deckError } = useDecks(deckId); 
    const { cards, cardLoading, cardError } = useCards(deckId)

    const deckName = deckLoading
        ? "Loading..."
        : deck?.deck_name || "Deck Not Found";

    return (
      <div className="w-full bg-white p-10">
        <CardsPageLayout
            currentDeckId={deckId}
            title={deckName}
        >   
            {cards.length === 0 ? (
                <div className="text-gray-500 text-7xl font-main">Nothing here yet</div>
            ) : (
                <>
                    {cards
                        .filter((card) => card.deck_id === deckId)
                        .map((card) => (
                            <Card
                                key={card.id}
                                id={card.id}
                                front={card.front}
                                back={card.back}
                                color={deck?.deck_color}
                            />
                        ))
                    }
                </>
            )}
        </CardsPageLayout>
      </div>
    )
}
