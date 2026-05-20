import { createClient } from '@supabase/supabase-js';

// Remplace ces valeurs par tes clés Supabase
// Settings → API dans ton projet supabase.com
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://TON-PROJET.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'TA-CLE-ANON';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
