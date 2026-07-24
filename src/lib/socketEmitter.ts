// File: src/lib/socketEmitter.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yjbwzpnslvimejtrbhsk.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_CWfnCvHjKzj9aehKodIBMA_zz2KOCCh';

const supabase = createClient(supabaseUrl, supabaseKey);
const channel = supabase.channel('pesengo_realtime');
channel.subscribe();

export async function emitSocketEvent(event: string, data: unknown): Promise<void> {
  try {
    await channel.send({
      type: 'broadcast',
      event,
      payload: data,
    });
  } catch (error) {
    console.error('Supabase Realtime emit error:', error);
  }
}
