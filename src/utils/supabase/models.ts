export interface Profile {
    id: string;
    username: string;
    profile_url: string;
    xp: number;
    followers_count: number | null;
    following_count: number | null;
    created_at: string;
}

export interface Folder {
    id: string;
    created_by: string;
    folder_name: string;
    folder_color: string;
    created_at: string;
}

export interface Deck {
    id: string;
    folder_id?: string | null;
    created_by: string;
    deck_name: string;
    deck_color: string;
    created_at: string;
    last_opened: string;
}

export interface Card {
    id: string;
    deck_id: string;
    front: string;
    back: string;
    created_at: string;
}