'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface VUpInfo {
    code: number;
    content: {
        mid: number | null;
        following: number;
        follower: number;
        name: string | null;
        sign: string | null;
        level: number | null;
        face: string | null;
    };
}

export default function UserProfile() {
    const [info, setInfo] = useState<VUpInfo | null>(null);

    useEffect(() => {
        // Check if running on GitHub Pages (repo name in path) or local
        const basePath = window.location.pathname.includes('/lidousha-web') ? '/lidousha-web' : '';
        fetch(`${basePath}/data/vUpInfo.json`)
            .then(res => res.json())
            .then(data => setInfo(data))
            .catch(err => console.error("Failed to load profile", err));
    }, []);

    if (!info || !info.content) return null;

    const { content } = info;
    const name = content.name || "李豆沙";
    // Fallback to UI Avatars if face is missing, but prefer local ldspicture.png if explicitly requested or face is null
    // The user requested: "Avatar directly use ldspicture.png"
    const basePath = window.location.pathname.includes('/lidousha-web') ? '/lidousha-web' : ''; // Re-declare basePath here for use in face
    const face = basePath + "/ldspicture.png";
    const sign = content.sign || "PSPLIVE所属虚拟熊猫! パンダ少女日々進化中！";
    const level = content.level || 6;

    return (
        <div className="flex flex-col items-center mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative w-24 h-24 mb-4">
                <img
                    src={face}
                    alt={name}
                    className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md w-full h-full"
                />
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                    Lv.{level}
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {name}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 text-center max-w-md">
                {sign}
            </p>

            <div className="flex gap-8 text-center">
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">{content.following}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                </div>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">{content.follower}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                </div>
            </div>
        </div>
    );
}
