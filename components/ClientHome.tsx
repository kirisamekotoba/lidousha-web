'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Download } from 'lucide-react';
import SongItem from './SongItem';
import UserProfile from './UserProfile';
import SongModal from './SongModal';
import TinyPinyin from 'tiny-pinyin';
import { useToast } from './Toast';
import type { Song } from '../types/song';

interface ClientHomeProps {
    initialSongs: Song[];
}

export default function ClientHome({ initialSongs }: ClientHomeProps) {
    // Initialize from LocalStorage if available, otherwise use initialSongs
    const [songs, setSongs] = useState<Song[]>(initialSongs);
    const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

    // Persistence Logic
    useEffect(() => {
        try {
            const storedSongs = localStorage.getItem('lidousha_songs');
            if (storedSongs) {
                const parsed = JSON.parse(storedSongs);
                if (Array.isArray(parsed) && parsed.length >= initialSongs.length) {
                    // Only use stored if it seems to correspond to our data (simple heuristic)
                    setSongs(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load songs from storage", e);
        }
        setHasLoadedFromStorage(true);
    }, [initialSongs]); // Depend on initialSongs to ensure we have a baseline

    useEffect(() => {
        if (hasLoadedFromStorage) {
            localStorage.setItem('lidousha_songs', JSON.stringify(songs));
        }
    }, [songs, hasLoadedFromStorage]);


    const [filter, setFilter] = useState('');
    const [selectedTag, setSelectedTag] = useState('全部');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const { showToast } = useToast();

    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            const matchesSearch = song.song.toLowerCase().includes(filter.toLowerCase()) ||
                song.singer.toLowerCase().includes(filter.toLowerCase());
            const matchesTag = selectedTag === '全部' || song.type.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [songs, filter, selectedTag]);

    // A-Z Navigation Logic
    const groupedSongs = useMemo(() => {
        const groups: Record<string, Song[]> = {};
        const sorted = [...filteredSongs].sort((a, b) => a.song.localeCompare(b.song, 'zh-CN'));

        sorted.forEach(song => {
            let firstChar = song.song.charAt(0).toUpperCase();
            let groupKey = '#';

            // Check if it's A-Z
            if (/[A-Z]/.test(firstChar)) {
                groupKey = firstChar;
            } else if (TinyPinyin.isSupported() && !/[0-9]/.test(firstChar)) { // Simple check if it might be Chinese
                const pinyin = TinyPinyin.convertToPinyin(firstChar); // Returns string like 'ZHONG'
                const pinyinChar = pinyin.charAt(0).toUpperCase();
                if (/[A-Z]/.test(pinyinChar)) {
                    groupKey = pinyinChar;
                }
            }

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(song);
        });
        return groups;
    }, [filteredSongs]);

    const sortedKeys = useMemo(() => {
        return Object.keys(groupedSongs).sort((a, b) => {
            if (a === '#') return 1;
            if (b === '#') return -1;
            return a.localeCompare(b);
        });
    }, [groupedSongs]);

    const scrollToGroup = (key: string) => {
        const element = document.getElementById(`group-${key}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        tags.add('全部');
        songs.forEach(song => song.type.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [songs]);

    const handleSelectSong = (song: Song) => {
        navigator.clipboard.writeText(`点歌 ${song.song}`);
        showToast(`Copied "点歌 ${song.song}" to clipboard!`, 2000);
    };

    const handleAddSong = () => {
        setEditingSong(null);
        setIsModalOpen(true);
    };

    const handleEditSong = (song: Song) => {
        setEditingSong(song);
        setIsModalOpen(true);
    };

    const handleSaveSong = (song: Song) => {
        if (editingSong) {
            // Update existing
            setSongs(prev => prev.map(s => s.uid === song.uid ? song : s));
            showToast('Song updated successfully!');
        } else {
            // Add new
            setSongs(prev => [song, ...prev]);
            showToast('New song added!');
        }
        setIsModalOpen(false);
    };

    const handleDeleteSong = (uid: string) => {
        setSongs(prev => prev.filter(s => s.uid !== uid));
        showToast('Song deleted successfully!');
        setIsModalOpen(false);
    };

    const handleDownloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(songs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "songs.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast('Downloaded songs.json. Commit this to GitHub to save changes permanently.', 5000);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
            <div className="max-w-4xl mx-auto mb-8 text-center relative">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    豆沙宝贝的歌单
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    A curated collection of {songs.length} songs.
                </p>

                <UserProfile />

                <div className="flex justify-center gap-4 mb-4">
                    <button
                        onClick={handleAddSong}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        Add Song
                    </button>
                    <button
                        onClick={handleDownloadJson}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200 dark:border-gray-700 text-sm"
                        title="Download JSON to commit changes"
                    >
                        <Download size={16} />
                        Export JSON (Save Permanent)
                    </button>
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto p-4">
                <div className="mb-6 sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search songs or artists... (A-Z functionality limited for Chinese)"
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

                {/* Rapid Positioning Bar */}
                <div className="sticky top-20 z-10 flex justify-center flex-wrap gap-1 mb-4 px-2">
                    {sortedKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => scrollToGroup(key)}
                            className="w-6 h-6 text-xs font-bold rounded-full bg-white dark:bg-gray-800 text-blue-600 shadow-sm hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {/* Song List Grouped */}
                <div className="space-y-6">
                    {sortedKeys.length > 0 ? (
                        sortedKeys.map(key => (
                            <div key={key} id={`group-${key}`} className="scroll-mt-32">
                                <h2 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2 px-2 border-b border-gray-200 dark:border-gray-700">
                                    {key}
                                </h2>
                                <div className="space-y-2">
                                    {groupedSongs[key].map(song => (
                                        <SongItem
                                            key={song.uid}
                                            song={song}
                                            onSelect={handleSelectSong}
                                            onEdit={handleEditSong}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">No songs found matching your criteria.</div>
                    )}
                </div>
            </div>

            <SongModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSong}
                onDelete={handleDeleteSong}
                initialSong={editingSong}
            />
        </main>
    );
}
