import type { Song } from '../types/song';

interface SongItemProps {
    song: Song;
    onSelect: (song: Song) => void;
}

export default function SongItem({ song, onSelect }: SongItemProps) {
    return (
        <div
            className="flex items-center justify-between p-3 mb-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 group"
            onClick={() => onSelect(song)}
        >
            <div className="flex flex-col">
                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {song.song} <span className="text-gray-400 mx-1">-</span> <span className="text-gray-600 dark:text-gray-300 text-sm">{song.singer}</span>
                </span>
                {song.notice && (
                    <span className="text-xs text-orange-500 mt-1 italic">{song.notice}</span>
                )}
            </div>
            <div className="flex gap-1">
                {song.type.map((tag, idx) => (
                    <span
                        key={idx}
                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
