
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    const songsPath = path.join(__dirname, '../data/songs.json');
    if (!fs.existsSync(songsPath)) {
        console.error('Error: data/songs.json not found');
        process.exit(1);
    }

    const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
    console.log(`Found ${songs.length} songs to migrate...`);

    let successCount = 0;
    let batchSize = 50;

    for (let i = 0; i < songs.length; i += batchSize) {
        const batch = songs.slice(i, i + batchSize).map(s => ({
            // Map fields. Supabase will generate uid if we don't provide it, 
            // but let's see if we want to keep existing UIDs. 
            // If existing UIDs are UUIDs, we can keep them. If they are random strings, 
            // Supabase might complain if the column is UUID.
            // Let's check the song.ts type. It says uid: string.
            // The SQL schema says uid uuid default gen_random_uuid().
            // If our current UIDs are NOT UUIDs, insertion will fail.
            // SAFE BET: Omit UID and let Supabase generate new ones. 
            // OR: Try to keep them.
            // Let's assume we let Supabase generate new UUIDs for consistency unless we really need the old IDs (which we probably don't for checking uniqueness since we don't have user accounts yet).
            song: s.song,
            singer: s.singer,
            type: s.type,
            notice: s.notice || '',
            created_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('songs').insert(batch);

        if (error) {
            console.error('Error inserting batch:', error);
        } else {
            successCount += batch.length;
            console.log(`Migrated ${Math.min(i + batchSize, songs.length)}/${songs.length}`);
        }
    }

    console.log(`Migration complete! ${successCount}/${songs.length} songs migrated.`);
}

migrate();
