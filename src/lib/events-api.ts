import { EVENTS, RESIDENTS, type ClubEvent } from '@/data/club';
import { isArchived } from './archive';

/** Ein Event, wie es die API ausliefert (Admin sieht zusätzlich Status). */
export type Dj = { id: string; name: string; resident: boolean };

/** Im Admin liegt das Line-up als DJ-ID plus Zeit vor. */
export type ApiLineupEntry = { djId: string; time: string };

export type ApiEvent = Omit<ClubEvent, 'lineup'> & {
  lineup: ApiLineupEntry[];
  status: 'draft' | 'published';
  imageVersion: number | null;
  updatedAt: string;
};

/** Öffentlich: Event, optional mit Flyer. */
export type PublicEvent = ClubEvent & { imageVersion?: number | null; archived?: boolean };

export const imageUrl = (e: Pick<ApiEvent, 'id' | 'imageVersion'>) => `/img/${e.id}?v=${e.imageVersion}`;

export const sortByStart = <T extends { start: string }>(list: T[]) =>
  [...list].sort((a, b) => +new Date(a.start) - +new Date(b.start));

let pending: Promise<PublicEvent[]> | null = null;
let cache: PublicEvent[] | null = null;
let cachedAt = 0;
const MAX_AGE = 2 * 60 * 1000;

/** Bereits geladene Events, damit eine zurückgekehrte Seite sofort in voller Höhe rendert (Scroll-Wiederherstellung). */
export const cachedEvents = () => cache;

/** Öffentliche Events. Ohne erreichbares Backend (z. B. lokal oder offline) gelten die eingebauten Ausgangsdaten. */
export function loadEvents(): Promise<PublicEvent[]> {
  // Nach ein paar Minuten neu laden, damit eine lange offene Seite neue und archivierte Events mitbekommt.
  if (pending && cache && Date.now() - cachedAt > MAX_AGE) pending = null;
  pending ??= fetch('/api/events', { headers: { accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<{ events: PublicEvent[] }>;
    })
    .then((d) => sortByStart(d.events))
    .catch(() => sortByStart(EVENTS))
    .then((list) => {
      cachedAt = Date.now();
      return (cache = list);
    });
  return pending;
}

/** Noch nicht archivierte Events, nach Beginn sortiert. Auch die eingebauten Ausgangsdaten laufen durch denselben Filter. */
export const upcoming = <T extends { start: string }>(list: T[], now = Date.now()) => list.filter((e) => !isArchived(e.start, now));

/** Das nächste Event: zuerst das nächste, das noch nicht begonnen hat; sonst eines, das gerade läuft. */
export function pickNext<T extends { start: string }>(list: T[], now = Date.now()): T | null {
  const live = sortByStart(upcoming(list, now));
  return live.find((e) => Date.parse(e.start) > now) ?? live[live.length - 1] ?? null;
}

/** Ein einzelnes Event für die Detailseite, auch wenn es archiviert ist. */
export async function loadEvent(id: string): Promise<PublicEvent | null> {
  try {
    const r = await fetch(`/api/events/${id}`, { headers: { accept: 'application/json' } });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(String(r.status));
    return ((await r.json()) as { event: PublicEvent }).event;
  } catch {
    const e = EVENTS.find((x) => x.id === id);
    return e ? { ...e, archived: isArchived(e.start) } : null;
  }
}

let residentsPending: Promise<string[]> | null = null;
let residentsCache: string[] | null = null;
export const cachedResidents = () => residentsCache;

/** Residents für das Band auf der Startseite. Ohne Backend gelten die eingebauten Namen. */
export function loadResidents(): Promise<string[]> {
  residentsPending ??= fetch('/api/residents', { headers: { accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<{ residents: string[] }>;
    })
    .then((d) => d.residents)
    .catch(() => [...RESIDENTS])
    .then((list) => (residentsCache = list));
  return residentsPending;
}
