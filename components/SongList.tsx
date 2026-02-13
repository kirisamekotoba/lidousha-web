'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Song } from '../types/song';
import SongItem from './SongItem';

interface SongListProps {
    songs: Song[];
}

export default function SongList({ songs }: SongListProps) {
    const [filter, setFilter] = useState('');
    const [selectedTag, setSelectedTag] = useState('全部');

    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            const matchesSearch = song.song.toLowerCase().includes(filter.toLowerCase()) ||
                song.singer.toLowerCase().includes(filter.toLowerCase());
            const matchesTag = selectedTag === '全部' || song.type.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [songs, filter, selectedTag]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        tags.add('全部');
        songs.forEach(song => song.type.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [songs]);

    const handleSelectSong = (song: Song) => {
        // TODO: Implement copy or play logic
        navigator.clipboard.writeText(`点歌 ${song.song}`);
        alert(`Copied "点歌 ${song.song}" to clipboard!`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-6 sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search songs or artists..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === tag
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {filteredSongs.length > 0 ? (
                    filteredSongs.map(song => (
                        <SongItem key={song.uid} song={song} onSelect={handleSelectSong} />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">No songs found matching your criteria.</div>
                )}
            </div>
        </div>
    );
}
