"use client";

import { useEffect, useState, useCallback } from "react";
import { deckService } from "../services";
import { useUser } from "./useUser";
import { Deck } from "@/utils/supabase/models";

export function useDecks(deckId?: string) {
  const { user } = useUser();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckLoading, setDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);

  const loadAllDecks = useCallback(async () => {
    if (!user) return;

    try {
      setDeckLoading(true);
      setDeckError(null);
      const data = await deckService.getAllDecks(user.id);
      setDecks(data);
    } catch (err) {
      setDeckError(err instanceof Error ? err.message : "Failed to load decks.");
    } finally {
      setDeckLoading(false);
    }
  }, [user]);

  const getDeck = useCallback(
    async (deckId: string) => {
      if (!user) return;

      try {
        setDeckLoading(true);
        setDeckError(null);
        const data = await deckService.getDeck(user.id, deckId);
        setDeck(data);
      } catch (err) {
        setDeckError(err instanceof Error ? err.message : "Failed to load deck.");
      } finally {
        setDeckLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user && deckId) {
      getDeck(deckId);
    } else if (user) {
      loadAllDecks();
    }
  }, [user, deckId, getDeck, loadAllDecks]);

  async function createDeck(deckData: {
    deckName: string;
    deckColor: string;
    folderId?: string | null;
  }) {
    if (!user) throw new Error("User not authenticated");

    try {
      const newDeck = await deckService.createDeck({
        created_by: user?.id,
        deck_name: deckData.deckName,
        deck_color: deckData.deckColor,
        folder_id: deckData.folderId || null,
      });
      setDecks((prev) => [newDeck, ...prev]);
    } catch (err) {
      setDeckError(err instanceof Error ? err.message : "Failed to create folder.");
    }
  }

  return { decks, deck, deckLoading, deckError, getDeck, loadAllDecks, createDeck };
}
