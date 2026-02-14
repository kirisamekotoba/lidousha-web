'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import type { Song } from '../types/song';

interface SongModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (song: Song) => void;
    onDelete?: (uid: string) => void;
    initialSong?: Song | null;
}

// Internal component for delete confirmation
function DeleteButton({ onDelete }: { onDelete: () => void }) {
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (confirming) {
            const timer = setTimeout(() => setConfirming(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [confirming]);

    if (confirming) {
        return (
            <button
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 animate-pulse"
            >
                Confirm?
            </button>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
        >
            Delete
        </button>
    );
}

export default function SongModal({ isOpen, onClose, onSave, onDelete, initialSong }: SongModalProps) {
    const [formData, setFormData] = useState<Song>({
        uid: '',
        song: '',
        singer: '',
        type: ['全部'],
        notice: ''
    });

    useEffect(() => {
        if (initialSong) {
            setFormData(initialSong);
        } else {
            setFormData({
                uid: crypto.randomUUID(),
                song: '',
                singer: '',
                type: ['全部'],
                notice: ''
            });
        }
    }, [initialSong, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {initialSong ? 'Edit Song' : 'Add New Song'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Song Name</label>
                        <input
                            type="text"
                            value={formData.song}
                            onChange={e => setFormData({ ...formData, song: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Renai Circulation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Singer</label>
                        <input
                            type="text"
                            value={formData.singer}
                            onChange={e => setFormData({ ...formData, singer: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Kana Hanazawa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.type.join(', ')}
                            onChange={e => setFormData({ ...formData, type: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 日文, 萌歌"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Translation / Notice</label>
                        <input
                            type="text"
                            value={formData.notice || ''}
                            onChange={e => setFormData({ ...formData, notice: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional notes or translation"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between gap-3">
                    {initialSong && onDelete ? (
                        <DeleteButton onDelete={() => onDelete(formData.uid)} />
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save Song
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
