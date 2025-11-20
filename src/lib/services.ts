import { createClient } from "@/utils/supabase/client";
import { Card, Deck, Folder, Profile } from "@/utils/supabase/models";

const supabase = createClient();

export const profileService = {
    async getProfiles(userId: string[]): Promise<Profile[]>{
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userId)

        if (error) throw error;
        return data || [];
    },
}

export const folderService = {
    async getFolders(userId: string): Promise<Folder[]> {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("created_by", userId)
            .order("created_at", {ascending: false});

        if (error) throw error;

        return data || [];
    },

    async getFolder(userId: string, folderId: string): Promise<Folder> {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .match({ created_by: userId, id: folderId })
            .single();

        if (error) throw error;

        return data;
    },
    
    async createFolder(
        folder: Omit<Folder, "id" | "created_at">        
    ): Promise<Folder> {
        const { data, error } = await supabase
            .from("folders")
            .insert(folder)
            .select()
            .single()

        if (error) throw error;

        return data;
    },
}

export const deckService = {
    async getAllDecks(userId: string): Promise<Deck[]> {
        const { data, error } = await supabase
            .from("decks")
            .select("*")
            .eq("created_by", userId)
            .order("created_at", {ascending: false});

        if (error) throw error;

        return data || [];
    },

    async getDecksByFolder(userId: string, folderId: string): Promise<Deck[]> {
        const { data, error } = await supabase
            .from("decks")
            .select("*")
            .match({ created_by: userId, folder_id: folderId })
            .order("created_at", {ascending: false});

        if (error) throw error;

        return data || [];
    },

    async getDeck(userId: string, deckId: string): Promise<Deck> {
        const { data, error } = await supabase
            .from("decks")
            .select("*")
            .match({ created_by: userId, id: deckId })
            .single();

        if (error) throw error;

        return data;
    },
    
    async createDeck(
        deck: Omit<Deck, "id" | "created_at" | "last_opened">        
    ): Promise<Deck> {
        const { data, error } = await supabase
            .from("decks")
            .insert(deck)
            .select()
            .single()

        if (error) throw error;

        return data;
    },
}

export const cardService = {
    async getAllCards(): Promise<Card[]> {
        const { data, error } = await supabase
            .from("cards")
            .select("*")
            .order("created_at", {ascending: false});

        if (error) throw error;

        return data || [];
    },

    async getCards(deckId: string): Promise<Card[]> {
        const { data, error } = await supabase
            .from("cards")
            .select("*")
            .eq("deck_id", deckId)
            .order("created_at", {ascending: false});

        if (error) throw error;

        return data || [];
    },
    
    async createCard(
        card: Omit<Card, "id" | "created_at">        
    ): Promise<Card> {
        const { data, error } = await supabase
            .from("cards")
            .insert(card)
            .select()
            .single()

        if (error) throw error;

        return data;
    },
}