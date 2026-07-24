// File: src/lib/socketClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yjbwzpnslvimejtrbhsk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_CWfnCvHjKzj9aehKodIBMA_zz2KOCCh';

const supabase = createClient(supabaseUrl, supabaseKey);

type Listener = (data: any) => void;
const listenersMap: Record<string, Set<Listener>> = {};

const channel = supabase.channel('pesengo_realtime');

channel
  .on('broadcast', { event: 'order:created' }, (payload) => {
    listenersMap['order:created']?.forEach((cb) => cb(payload.payload));
  })
  .on('broadcast', { event: 'order:status_updated' }, (payload) => {
    listenersMap['order:status_updated']?.forEach((cb) => cb(payload.payload));
  })
  .subscribe();

export function getSocket() {
  return {
    on: (event: string, callback: Listener) => {
      if (!listenersMap[event]) {
        listenersMap[event] = new Set();
      }
      listenersMap[event].add(callback);
    },
    off: (event: string, callback?: Listener) => {
      if (!callback) {
        delete listenersMap[event];
      } else {
        listenersMap[event]?.delete(callback);
      }
    },
    emit: async (event: string, data: any) => {
      await channel.send({
        type: 'broadcast',
        event,
        payload: data,
      });
    },
  };
}
