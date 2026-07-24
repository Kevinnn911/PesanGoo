// File: src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yjbwzpnslvimejtrbhsk.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_CWfnCvHjKzj9aehKodIBMA_zz2KOCCh';

export const supabase = createClient(supabaseUrl, supabaseKey);
