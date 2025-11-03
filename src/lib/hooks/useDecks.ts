"use client";

import { useEffect, useState } from "react";
import { deckService, folderService } from "../services"
import { useUser } from "./useUser";
import { Deck, Folder } from "@/utils/supabase/models";

export function useDecks(folderId?: string) {
    const { user } = useUser(); 
    const [decks, setDecks] = useState<Deck[]>([]);
    const [deckLoading, setDeckLoading] = useState(true);
    const [deckError, setDeckError] = useState<string | null>(null);

    useEffect(() => {
        if (user && folderId) {
            loadDecksByFolder(folderId)
        }else if (user){
            loadAllDecks();
        }
    }, [user]);

    async function loadAllDecks() {
        if (!user) return;

        try{
            setDeckLoading(true);
            setDeckError(null);
            const data = await deckService.getAllDecks(user?.id);
            setDecks(data);
        } catch (err){
            setDeckError (err instanceof Error ? err.message : "Failed to load decks.");
        } finally{
            setDeckLoading(false);
        }
    }

    async function loadDecksByFolder(folderId: string) {
        if (!user) return;

        try{
            setDeckLoading(true);
            setDeckError(null);
            const data = await deckService.getDecksByFolder(user?.id, folderId);
            setDecks(data);
        } catch (err){
            setDeckError (err instanceof Error ? err.message : "Failed to load decks.");
        } finally{
            setDeckLoading(false);
        }
    }

    async function createDeck(deckData: {
        deckName: string,
        deckColor: string,
        folderId?: string | null,
    }) {
        if (!user) throw new Error("User not authenticated");

        try{
            const newDeck = await deckService.createDeck({
                created_by: user?.id,
                deck_name: deckData.deckName,
                deck_color: deckData.deckColor,
                folder_id: deckData.folderId || null,
            });
            setDecks((prev) => [newDeck, ...prev]);
        } catch (err) {
            setDeckError (err instanceof Error ? err.message : "Failed to create folder.");
        }
    }
    return {decks, deckLoading, deckError, createDeck}
}