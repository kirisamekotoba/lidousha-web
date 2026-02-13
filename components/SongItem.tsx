import { Edit2 } from 'lucide-react';
import type { Song } from '../types/song';

interface SongItemProps {
    song: Song;
    onSelect: (song: Song) => void;
    onEdit: (song: Song) => void;
}

export default function SongItem({ song, onSelect, onEdit }: SongItemProps) {
    return (
        <div
            className="flex items-center justify-between p-3 mb-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 group relative"
            onClick={() => onSelect(song)}
        >
            <div className="flex flex-col flex-grow pr-10">
                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {song.song} <span className="text-gray-400 mx-1">-</span> <span className="text-gray-600 dark:text-gray-300 text-sm">{song.singer}</span>
                </span>
                {song.notice && (
                    <span className="text-xs text-orange-500 mt-1 italic">{song.notice}</span>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Edit Button - Stop propagation to prevent copying when clicking edit */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(song);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    title="Edit song"
                >
                    <Edit2 size={14} />
                </button>

                <div className="flex gap-1">
                    {song.type.filter(t => t !== '全部').map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
