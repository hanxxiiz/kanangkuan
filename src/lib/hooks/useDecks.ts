"use client";

import { useEffect, useState, useCallback } from "react";
import { deckService } from "../services";
import { useUser } from "./useUser";
import { Deck } from "@/utils/supabase/models";

export function useDecks(deckId?: string, userId?: string) {
  const { user } = useUser();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckLoading, setDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  const loadAllDecks = useCallback(async () => {
    if (!targetUserId) return;

    try {
      setDeckLoading(true);
      setDeckError(null);
      const data = await deckService.getAllDecks(targetUserId);
      setDecks(data);
    } catch (err) {
      setDeckError(err instanceof Error ? err.message : "Failed to load decks.");
    } finally {
      setDeckLoading(false);
    }
  }, [targetUserId]);

  const getDeck = useCallback(
    async (deckId: string) => {
      if (!targetUserId) return;
      try {
        setDeckLoading(true);
        setDeckError(null);
        const data = await deckService.getDeck(targetUserId, deckId);
        setDeck(data);
      } catch (err) {
        setDeckError(err instanceof Error ? err.message : "Failed to load deck.");
      } finally {
        setDeckLoading(false);
      }
    },
    [targetUserId]
  );

  useEffect(() => {
    if (targetUserId && deckId) {
      getDeck(deckId);
    } else if (targetUserId) {
      loadAllDecks();
    }
  }, [targetUserId, deckId, getDeck, loadAllDecks]);

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
