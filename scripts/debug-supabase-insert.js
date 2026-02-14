
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugInsert() {
    console.log('Attempting to INSERT a test row into "songs"...');

    const testSong = {
        song: 'Test Song Debug',
        singer: 'Debug Singer',
        type: ['Debug'],
        notice: 'Debug Entry',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('songs').insert([testSong]).select();

    if (error) {
        console.error('❌ INSERT Failed:', error);
        if (error.code === '42501') {
            console.error('   -> Permission Denied. RLS Policy does not allow INSERT.');
        } else if (error.code === 'PGRST205') {
            console.error('   -> Table not found (still?).');
        }
    } else {
        console.log('✅ INSERT Succeeded!', data);
        // Cleanup
        const { error: delError } = await supabase.from('songs').delete().eq('uid', data[0].uid);
        if (!delError) console.log('✅ Cleanup (DELETE) Succeeded!');
    }
}

debugInsert();
