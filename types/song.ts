export interface Song {
    uid: string;
    song: string;
    singer: string;
    type: string[];
    notice: string;
}

export type SongList = Song[];
