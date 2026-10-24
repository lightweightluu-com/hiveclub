import { EVENTS, type ClubEvent } from '@/data/club';

/** Ein Event, wie es die API ausliefert (Admin sieht zusätzlich Status). */
export type ApiEvent = ClubEvent & {
  status: 'draft' | 'published';
  imageVersion: number | null;
  updatedAt: string;
};

/** Öffentlich: Event, optional mit Flyer. */
export type PublicEvent = ClubEvent & { imageVersion?: number | null };

export const imageUrl = (e: Pick<ApiEvent, 'id' | 'imageVersion'>) => `/img/${e.id}?v=${e.imageVersion}`;

export const sortByStart = <T extends { start: string }>(list: T[]) =>
  [...list].sort((a, b) => +new Date(a.start) - +new Date(b.start));

let pending: Promise<PublicEvent[]> | null = null;
let cache: PublicEvent[] | null = null;

/** Bereits geladene Events, damit eine zurückgekehrte Seite sofort in voller Höhe rendert (Scroll-Wiederherstellung). */
export const cachedEvents = () => cache;

/** Öffentliche Events. Ohne erreichbares Backend (z. B. lokal oder offline) gelten die eingebauten Ausgangsdaten. */
export function loadEvents(): Promise<PublicEvent[]> {
  pending ??= fetch('/api/events', { headers: { accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<{ events: PublicEvent[] }>;
    })
    .then((d) => sortByStart(d.events))
    .catch(() => sortByStart(EVENTS))
    .then((list) => (cache = list));
  return pending;
}
