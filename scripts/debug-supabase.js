
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key (first 10 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    console.log('Attempting to query "songs" table...');
    const { count, error } = await supabase.from('songs').select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error querying songs table:', error);
        if (error.code === 'PGRST205') {
            console.error('   -> This means the API cannot find the table "songs".');
            console.error('   -> Please check: 1. Table exists in "public" schema. 2. RLS policies allow SELECT.');
        }
    } else {
        console.log('✅ Successfully connected to "songs" table!');
        console.log('   Row count:', count);
    }
}

debug();
