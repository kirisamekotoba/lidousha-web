
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSelect() {
    console.log('--- Debugging SELECT ---');
    // Try to select 1 row
    const { data, error, status, statusText } = await supabase.from('songs').select('*').limit(1);

    console.log('Status:', status, statusText);

    if (error) {
        console.error('❌ SELECT Error:', error);
    } else {
        console.log('✅ SELECT Success. Data retrieved:', data);
        if (data.length === 0) console.log('   (Table is empty)');
    }
}

debugSelect();
