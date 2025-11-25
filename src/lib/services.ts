import { createClient } from "@/utils/supabase/client";
import { Card, Challenge, Deck, Folder, Profile } from "@/utils/supabase/models";

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

export const challengeService = {
    async createChallenge(
        challenge: Omit<Challenge, "id" | "max_players" | "created_at">        
    ): Promise<Challenge> {
        const { data, error } = await supabase
            .from("challenges")
            .insert(challenge)
            .select()
            .single()

        if (error) throw error;

        return data;
    },
    
    async  incrementMaxPlayers(id: string) {
        const { error } = await supabase.rpc("increment_max_players", {
            challenge_id: id,
        });

        if (error) throw error;

        console.log("Incremented max_players successfully!");
    },


    async getChallenge(challengeId: string): Promise<Challenge> {
        const { data, error } = await supabase
            .from("challenges")
            .select("*")
            .eq("id", challengeId)
            .single();

        if (error) throw error;

        return data;
    },

    async checkJoinCodeExists(joinCode: string): Promise<boolean> {
        const { data, error } = await supabase
            .from("challenges")
            .select("join_code")
            .eq("join_code", joinCode)
            .maybeSingle();

        if (error) throw error;

        return data !== null;
    },

    async generateUniqueJoinCode(): Promise<string> {
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 5; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const code = generateCode();
            const exists = await this.checkJoinCodeExists(code);
            
            if (!exists) {
                return code;
            }
            
            attempts++;
        }

        throw new Error("Failed to generate unique code after multiple attempts");
    },

    async validateJoinCode(joinCode: string): Promise<{ isValid: boolean; challengeId?: string; message?: string }> {
        const { data, error } = await supabase
            .from("challenges")
            .select("id, status, max_players")
            .eq("join_code", joinCode)
            .maybeSingle();

        if (error) {
            return { isValid: false, message: "Error validating code. Please try again." };
        }

        if (!data) {
            return { isValid: false, message: "Invalid join code. Please check and try again." };
        }

        if (data.status !== "waiting") {
            return { isValid: false, message: "This challenge is no longer available." };
        }

        if (data.max_players === 3) {
            return { isValid: false, message: "This challenge already has max players." };
        }

        return { isValid: true, challengeId: data.id };
    },

    async markPlayerReady(challengeId: string, currentReadyPlayers: number): Promise<Challenge> {
        const { data, error } = await supabase
        .from('challenges')
        .update({
            max_players: currentReadyPlayers + 1,
            status: currentReadyPlayers + 1 >= 3 ? 'playing' : 'waiting',
        })
        .eq('id', challengeId)
        .select()
        .single();

        if (error) throw error;

        return data;
    }
}