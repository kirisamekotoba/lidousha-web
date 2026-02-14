
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSchema() {
    console.log('--- Debugging Schema Visibility ---');

    // Try to list tables from information_schema
    // Note: Anon key might not have access to information_schema depending on project settings
    // But let's try.

    // Supabase JS client doesn't support raw SQL easily without RPC.
    // We'll try to select from a standard table if we can't do this.
    // Actually, standard practice to debug this is to check the URL.

    console.log('Project URLToCheck:', supabaseUrl);

    // Let's try to just hit the root URL with a fetch to see if it's alive and what it returns (often health check)
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });

        console.log('Root API Status:', response.status);
        const text = await response.text();
        console.log('Root API Response (Swagger/OpenAPI definition often):', text.substring(0, 200) + '...');

        // If we get the OpenAPI definition, we can see if 'songs' is in it!
        if (text.includes('songs')) {
            console.log('✅ "songs" table FOUND in API definition!');
        } else {
            console.error('❌ "songs" table NOT found in API definition.');
            console.log('   This confirms the API schema cache does not know about the table.');
        }

    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

debugSchema();
