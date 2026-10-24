import { useEffect, useState } from 'react';
import { loadEvents, type PublicEvent } from './events-api';

/** null = lädt noch. */
export function useEvents(): PublicEvent[] | null {
  const [events, setEvents] = useState<PublicEvent[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadEvents().then((e) => alive && setEvents(e));
    return () => { alive = false; };
  }, []);
  return events;
}
