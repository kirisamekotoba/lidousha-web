const { createClient } = require('@supabase/supabase-js');

// This script is intended to run via GitHub Actions
// It requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (to bypass RLS restriction on delete if needed, though anon might work if policies are open)
// We'll use ANON key if that's what we have, but for "test data" deletion, service role is safer to ensure it works.
// However, the user provided ANON key in env. I'll rely on the existing open policies.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
    const songName = `KeepAlive_Test_${Date.now()}`;

    console.log(`Inserting test song: ${songName}`);

    const { data, VF, error: insertError } = await supabase
        .from('songs')
        .insert([
            {
                song: songName,
                singer: 'System',
                type: ['Test'],
                notice: 'Automated keep-alive entry'
            }
        ])
        .select();

    if (insertError) {
        console.error('Error inserting test song:', insertError);
        process.exit(1);
    }

    console.log('Insert successful:', data);

    // NOTE: User requested to KEEP the test song ("这样我就知道它确实插入了")
    // So we will NOT delete it.
    // Instead, maybe we limit the number of test songs? 
    // For now, I'll just insert it. The user can manually clean them up if they accumulate too much (52 per year).

    console.log('Keep-alive task completed successfully.');
}

keepAlive();
