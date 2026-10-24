import { useEffect, useState } from 'react';
import { cachedEvents, loadEvents, type PublicEvent } from './events-api';

/** null = lädt noch. */
export function useEvents(): PublicEvent[] | null {
  const [events, setEvents] = useState<PublicEvent[] | null>(cachedEvents);
  useEffect(() => {
    let alive = true;
    loadEvents().then((e) => alive && setEvents(e));
    return () => { alive = false; };
  }, []);
  return events;
}
