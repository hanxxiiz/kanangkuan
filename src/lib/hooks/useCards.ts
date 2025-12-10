"use client";

import { useEffect, useState } from "react";
import { cardService } from "../services"
import { Card } from "@/utils/supabase/models";

export function useCards(deckId?: string) {
    const [cards, setCards] = useState<Card[]>([])
    const [cardLoading, setCardLoading] = useState(true);
    const [cardError, setCardError] = useState<string | null>(null);

    useEffect(() => {
        if (deckId) {
            loadCards(deckId)
        } else {
            loadAllCards()
        }
    }, [deckId]);

    async function loadAllCards() {
        try {
            setCardLoading(true);
            setCardError(null);
            const data = await cardService.getAllCards(); 
            setCards(data);
        } catch (err) {
            setCardError(err instanceof Error ? err.message : "Failed to load cards.");
        } finally {
            setCardLoading(false);
        }
    }

    async function loadCards(deckId: string) {
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

    async function updateCard(cardId: string, cardData: {
        front: string,
        back: string,
    }) {
        try {
            const updatedCard = await cardService.updateCard(cardId, {
                front: cardData.front,
                back: cardData.back,
            });
            setCards((prev) => prev.map((card) => card.id === cardId ? updatedCard : card));
        } catch (err) {
            setCardError(err instanceof Error ? err.message : "Failed to update card.");
        }
    }

    async function deleteCard(cardId: string) {
        try {
            await cardService.deleteCard(cardId);
            setCards((prev) => prev.filter((card) => card.id !== cardId));
        } catch (err) {
            setCardError(err instanceof Error ? err.message : "Failed to delete card.");
        }
    }

    return {cards, cardLoading, cardError, createCard, updateCard, deleteCard}
}
