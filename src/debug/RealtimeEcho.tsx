
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function RealtimeEcho() {
  useEffect(() => {
    const channel = supabase
      .channel('debug-echo')
      .on(
        'broadcast',
        { event: '*' },
        payload => console.log('[ECHO payload]', payload)
      )
      .subscribe(status => console.log('[ECHO status]', status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // invisible component
}
