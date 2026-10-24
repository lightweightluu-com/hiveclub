import { useEffect, useState } from 'react';
import { cachedEvents, cachedResidents, loadEvents, loadResidents, type PublicEvent } from './events-api';

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

/** null = lädt noch. */
export function useResidents(): string[] | null {
  const [residents, setResidents] = useState<string[] | null>(cachedResidents);
  useEffect(() => {
    let alive = true;
    loadResidents().then((r) => alive && setResidents(r));
    return () => { alive = false; };
  }, []);
  return residents;
}
