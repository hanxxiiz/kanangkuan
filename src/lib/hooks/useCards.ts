"use client";

import { useEffect, useState } from "react";
import { cardService } from "../services"
import { Card } from "@/utils/supabase/models";

export function useCards(deckId?: string, userId?: string) {
    const [cards, setCards] = useState<Card[]>([])
    const [cardLoading, setCardLoading] = useState(true);
    const [cardError, setCardError] = useState<string | null>(null);

    useEffect(() => {
        if (deckId) {
            loadCards(deckId, userId)
        } else {
            loadAllCards(userId)
        }
    }, [deckId, userId]);

    async function loadAllCards(userId?: string) {
        try {
            setCardLoading(true);
            setCardError(null);
            const data = await cardService.getAllCards(userId); 
            setCards(data);
        } catch (err) {
            setCardError(err instanceof Error ? err.message : "Failed to load cards.");
        } finally {
            setCardLoading(false);
        }
    }

    async function loadCards(deckId: string, userId?: string) {
        if (!deckId) return;

        try{
            setCardLoading(true);
            setCardError(null);
            const data = await cardService.getCards(deckId);
            setCards(data);
        } catch (err){
            setCardError (err instanceof Error ? err.message : "Failed to load cards.");
        } finally{
            setCardLoading(false);
        }
    }

    async function createCard(cardData: {
        front: string,
        back: string,
    }) {
        if (!deckId) throw new Error("Deck not found.");

        try{
            const newCard = await cardService.createCard({
                deck_id: deckId,
                front: cardData.front,
                back: cardData.back,
            });
            setCards((prev) => [newCard, ...prev]);
        } catch (err) {
            setCardError (err instanceof Error ? err.message : "Failed to create card.");
        }
    }
    return {cards, cardLoading, cardError, createCard}
}
