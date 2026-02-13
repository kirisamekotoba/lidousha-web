import { promises as fs } from 'fs';
import path from 'path';
import SongList from '../components/SongList';
import type { Song } from '../types/song';

async function getSongs(): Promise<Song[]> {
  const filePath = path.join(process.cwd(), 'data', 'songs.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function Home() {
  const songs = await getSongs();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          豆沙宝贝的歌单
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          A curated collection of {songs.length} songs.
        </p>
      </div>
      <SongList songs={songs} />
    </main>
  );
}
