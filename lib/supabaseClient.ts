
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // We don't throw an error here to prevent build failures in environments without keys
    // But the app will fail at runtime if it tries to use Supabase
    console.warn('Supabase URL or Key is missing!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
