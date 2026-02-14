export interface Song {
    uid: string;
    song: string;
    singer: string;
    type: string[];
    notice?: string | null; // Can be null in DB
    created_at?: string; // Optional for local use, present from DB
}

export type NewSong = Omit<Song, 'uid' | 'created_at'>;

export type SongList = Song[];
