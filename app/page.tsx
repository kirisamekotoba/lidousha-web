import { promises as fs } from 'fs';
import path from 'path';
import ClientHome from '../components/ClientHome';
import type { Song } from '../types/song';

async function getSongs(): Promise<Song[]> {
  const filePath = path.join(process.cwd(), 'data', 'songs.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function Home() {
  const songs = await getSongs();
  return <ClientHome initialSongs={songs} />;
}
