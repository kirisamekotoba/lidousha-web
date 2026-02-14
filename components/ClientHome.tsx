'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import SongItem from './SongItem';
import UserProfile from './UserProfile';
import SongModal from './SongModal';
import TinyPinyin from 'tiny-pinyin';
import { useToast } from './Toast';
import type { Song } from '../types/song';
import { supabase } from '../lib/supabaseClient';

interface ClientHomeProps {
    initialSongs: Song[];
}

export default function ClientHome({ initialSongs }: ClientHomeProps) {
    // Initialize from LocalStorage if available, otherwise use initialSongs (as fallback/initial)
    const [songs, setSongs] = useState<Song[]>(initialSongs);
    const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

    // Supabase & Admin State
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch Songs from Supabase
    useEffect(() => {
        const fetchSongs = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching songs:', error);
                showToast('Failed to load songs from cloud.', 3000);
            } else if (data) {
                setSongs(data);
                setHasLoadedFromStorage(true);
            }
            setIsLoading(false);
        };

        fetchSongs();

        // Real-time subscription
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'songs',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSongs((prev) => [payload.new as Song, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        // Type assertion needed because payload.new is Record<string, any>
                        const updatedSong = payload.new as Song;
                        setSongs((prev) => prev.map((song) => song.uid === updatedSong.uid ? updatedSong : song));
                    } else if (payload.eventType === 'DELETE') {
                        // Type assertion needed because payload.old is Record<string, any>
                        const deletedSong = payload.old as { uid: string };
                        setSongs((prev) => prev.filter((song) => song.uid !== deletedSong.uid));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    const [filter, setFilter] = useState('');
    const [selectedTag, setSelectedTag] = useState('全部');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTipsOpen, setIsTipsOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const { showToast } = useToast();

    const filteredSongs = useMemo(() => {
        const lowerFilter = filter.toLowerCase();
        return songs.filter(song => {
            const matchesSearch = song.song.toLowerCase().includes(lowerFilter) ||
                song.singer.toLowerCase().includes(lowerFilter) ||
                (song.notice && song.notice.toLowerCase().includes(lowerFilter));
            const matchesTag = selectedTag === '全部' || song.type.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [songs, filter, selectedTag]);

    // A-Z Navigation Logic
    const groupedSongs = useMemo(() => {
        const groups: Record<string, Song[]> = {};
        const sorted = [...filteredSongs].sort((a, b) => a.song.localeCompare(b.song, 'zh-CN'));

        sorted.forEach(song => {
            // Trim title to avoid leading spaces causing '#' group
            const normalizedTitle = song.song.trim();
            if (!normalizedTitle) return; // Skip empty titles

            let firstChar = normalizedTitle.charAt(0).toUpperCase();
            let groupKey = '#';

            // Check if it's A-Z
            if (/[A-Z]/.test(firstChar)) {
                groupKey = firstChar;
            } else if (!/[0-9]/.test(firstChar)) { // Simple check if it might be Chinese (Removed isSupported check)
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
            // Adjust scroll position for sticky header
            const headerOffset = 180; // Approximate height of sticky header on mobile
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
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

    const checkAdmin = () => {
        if (isAdmin) return true;
        const password = prompt('Please enter Admin Password to perform this action:');
        // Simple client-side check against env variable (for this specific low-security fan app)
        // In a real app, this should be handled by Supabase Auth or RLS with a custom RPC
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        console.log('Debug: checking password. Env var length:', correctPassword?.length, 'Value exists:', !!correctPassword);

        if (password === correctPassword) {
            setIsAdmin(true);
            return true;
        } else {
            const debugLength = correctPassword ? correctPassword.length : '0';
            const debugExists = !!correctPassword;
            alert(`Incorrect password! (Debug: Server Secret Length: ${debugLength}, Exists: ${debugExists})`);
            return false;
        }
    };

    const handleAddSong = () => {
        if (!checkAdmin()) return;
        setEditingSong(null);
        setIsModalOpen(true);
    };

    const handleEditSong = (song: Song) => {
        if (!checkAdmin()) return;
        setEditingSong(song);
        setIsModalOpen(true);
    };

    const handleSaveSong = async (song: Song) => {
        // Optimistic update handled by Subscription if real-time is fast, 
        // but for better UX we can wait or optimistic update local state too.
        // Let's rely on local + subscription sync or just wait.
        // Actually, for "Add", we don't have UID yet if it's new. 
        // The modal returns a Song object which might have a temporary UID or empty.

        const songToSave = {
            song: song.song,
            singer: song.singer,
            type: song.type,
            notice: song.notice || '',
            // created_at is handled by DB default
        };

        if (editingSong) {
            // Update
            const { error } = await supabase
                .from('songs')
                .update(songToSave)
                .eq('uid', song.uid);

            if (error) {
                console.error('Error updating song:', error);
                showToast('Failed to update song.');
            } else {
                showToast('Song updated successfully!');
            }
        } else {
            // Create
            const { error } = await supabase
                .from('songs')
                .insert([songToSave]);

            if (error) {
                console.error('Error creating song:', error);
                showToast('Failed to add song.');
            } else {
                showToast('Song added successfully!');
            }
        }
        setIsModalOpen(false);
    };

    const handleDeleteSong = async (uid: string) => {
        if (!checkAdmin()) return;
        if (!confirm('Are you sure you want to delete this song?')) return;

        const { error } = await supabase
            .from('songs')
            .delete()
            .eq('uid', uid);

        if (error) {
            console.error('Error deleting song:', error);
            showToast('Failed to delete song.');
        } else {
            showToast('Song deleted successfully!');
        }
        setIsModalOpen(false);
    };



    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-10 px-4 pb-32"> {/* Added extra bottom padding */}
            <div className="max-w-4xl mx-auto mb-8 text-center relative">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    豆沙宝贝的歌单
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    A curated collection of {songs.length} songs.
                </p>
                {isLoading && (
                    <div className="flex justify-center mb-4">
                        <Loader2 className="animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-500">Loading from cloud...</span>
                    </div>
                )}

                <UserProfile />

                <div className="flex justify-center gap-4 mb-4 flex-wrap"> {/* Added flex-wrap for mobile */}
                    <button
                        onClick={handleAddSong}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        添加歌曲
                    </button>

                    <button
                        onClick={() => setIsTipsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors shadow-sm font-medium text-sm"
                    >
                        💡 直播间小tips
                    </button>
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto p-4 relative"> {/* Ensure relative for sticky context */}
                {/* Combined Sticky Header to prevent overlap */}
                <div className="sticky top-0 z-50 space-y-2 md:space-y-4 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md pb-2 md:pb-4 pt-2 -mx-4 px-4 shadow-sm transition-all duration-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="搜索歌名、歌手或备注... (A-Z 按拼音排序)"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    {/* Tags Container: Horizontal Scroll on mobile, Wrap on Desktop */}
                    <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 md:pb-0 md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1"> {/* Added negative margin to allow scroll to edge */}
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedTag === tag
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    {/* Rapid Positioning Bar: Horizontal Scroll on mobile, Centered Wrap on Desktop */}
                    <div className="flex flex-nowrap overflow-x-auto gap-1 px-1 border-t border-gray-100 dark:border-gray-800 pt-2 pb-1 md:pb-0 justify-start md:justify-center md:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {sortedKeys.map(key => (
                            <button
                                key={key}
                                onClick={() => scrollToGroup(key)}
                                className="flex-shrink-0 w-8 h-8 md:w-6 md:h-6 text-sm md:text-xs font-bold rounded-full bg-white dark:bg-gray-800 text-blue-600 shadow-sm hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 flex items-center justify-center"
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Song List Grouped */}
                <div className="space-y-6 mt-4">
                    {sortedKeys.length > 0 ? (
                        sortedKeys.map(key => (
                            <div key={key} id={`group-${key}`} className="scroll-mt-48"> {/* Increased scroll margin for larger header */}
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

            {/* Footer */}
            <footer className="mt-16 py-8 text-center text-gray-400 dark:text-gray-600 text-sm border-t border-gray-200 dark:border-gray-800">
                <p>@李豆沙非官方二创组</p>
            </footer>

            <SongModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSong}
                onDelete={handleDeleteSong}
                initialSong={editingSong}
            />

            {/* Tips Modal */}
            {isTipsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsTipsOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-pink-50 dark:bg-pink-900/20">
                            <h3 className="text-lg font-bold text-pink-600 dark:text-pink-300 flex items-center gap-2">
                                💡 直播间小tips
                            </h3>
                            <button onClick={() => setIsTipsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            <p>1. 请不要在直播中发送不礼貌的内容，特别是黄色笑话和反复提及与当前直播话题无关的up或亲友。</p>
                            <p>2. 想要被认知的话就多多聆听多多鼓起勇气和大熊猫说话吧！</p>
                            <p>3. 想要点歌直接古法发弹幕点歌就可以了。</p>
                            <p>4. 歌单只是主播唱过的歌，不担保主播在任何意义上还会唱。</p>
                            <p>5. 本歌单是观众自发制作，一切可能的纠纷与主播无关。</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                            <button
                                onClick={() => setIsTipsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg"
                            >
                                知道了 / Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
