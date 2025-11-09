import { createClient } from "@/utils/supabase/client";
import { Deck, Folder } from "@/utils/supabase/models";

const supabase = createClient();

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