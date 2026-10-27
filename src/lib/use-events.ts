import { useEffect, useState } from 'react';
import { cachedEvents, cachedResidents, loadEvent, loadEvents, loadResidents, upcoming, type PublicEvent } from './events-api';

/** Zählt jede Minute hoch, damit zeitabhängige Anzeigen (Archivierung) ohne Neuladen nachziehen. */
function useMinute() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
}

/** Kommende (nicht archivierte) Events. null = lädt noch. */
export function useEvents(): PublicEvent[] | null {
  const [events, setEvents] = useState<PublicEvent[] | null>(cachedEvents);
  useEffect(() => {
    let alive = true;
    loadEvents().then((e) => alive && setEvents(e));
    return () => { alive = false; };
  }, []);
  useMinute();
  return events && upcoming(events);
}

/** Ein Event per ID, auch archiviert. undefined = lädt, null = nicht vorhanden. */
export function useEvent(id: string): PublicEvent | null | undefined {
  const [state, setState] = useState<{ id: string; event: PublicEvent | null } | undefined>();
  useEffect(() => {
    let alive = true;
    loadEvent(id).then((event) => alive && setState({ id, event }));
    return () => { alive = false; };
  }, [id]);
  return state?.id === id ? state.event : undefined;
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
