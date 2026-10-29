import { isArchived } from '../src/lib/archive';
import { EVENTS, RESIDENTS, type ClubEvent, type LineupItem } from '../src/data/club';

interface Env {
  DB: KVNamespace;
  ASSETS: Fetcher;
  /** SHA-256 (hex) des normalisierten Admin-Passworts, siehe scripts/admin-hash.mjs */
  ADMIN_HASH: string;
}

type Dj = { id: string; name: string; resident: boolean };
type LineupEntry = { djId: string; time: string };

/** So liegt ein Event in KV (t:<id>). */
type StoredEvent = Omit<ClubEvent, 'lineup'> & {
  lineup: LineupEntry[];
  status: 'draft' | 'published';
  /** null = kein Flyer; sonst Zeitstempel für Cache-Busting. */
  imageVersion: number | null;
  createdAt: string;
  updatedAt: string;
};

const SESSION_TTL = 7 * 24 * 3600;
const RATE_LIMIT = 10;
const RATE_TTL = 600;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const KINDS = ['club', 'wellness', 'dance'] as const;

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...headers }
  });

const fail = (status: number, error: string) => json({ error }, status);

// ---------- Krypto-Helfer ----------

const hex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

const randomHex = (bytes: number) => hex(crypto.getRandomValues(new Uint8Array(bytes)));
const newId = () => randomHex(8); // 16 Hex-Zeichen
const sha256 = async (text: string) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));

/** Vergleich ohne frühen Abbruch, damit die Laufzeit nichts über die Übereinstimmung verrät. */
function constantTimeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** Muss zu scripts/admin-hash.mjs passen. */
const normalizePassword = (s: string) => s.replace(/[\s-]+/g, '').toLowerCase();

// ---------- Cookies & Sessions ----------

function readCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

const sessionCookie = (value: string, maxAge: number) =>
  `sid=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;

async function currentSession(request: Request, env: Env): Promise<string | null> {
  const sid = readCookie(request, 'sid');
  if (!sid || !/^[0-9a-f]{64}$/.test(sid)) return null;
  return (await env.DB.get(`s:${sid}`)) ? sid : null;
}

// ---------- Events: Speicher ----------

async function seedIfEmpty(env: Env) {
  if ((await env.DB.get('idx')) !== null) return;
  // Stabile IDs aus dem Slug, damit gleichzeitige Erstaufrufe dasselbe schreiben.
  const now = new Date().toISOString();
  const seeded: StoredEvent[] = await Promise.all(
    EVENTS.map(async (e) => ({
      ...e,
      id: (await sha256(`seed:${e.id}`)).slice(0, 16),
      status: 'published' as const,
      lineup: [],
      imageVersion: null,
      createdAt: now,
      updatedAt: now
    }))
  );
  seeded.sort((a, b) => +new Date(b.start) - +new Date(a.start)); // neueste zuerst
  await Promise.all(seeded.map((e) => env.DB.put(`t:${e.id}`, JSON.stringify(e))));
  await env.DB.put('idx', JSON.stringify(seeded.map((e) => e.id)));
}

async function readIndex(env: Env): Promise<string[]> {
  await seedIfEmpty(env);
  return JSON.parse((await env.DB.get('idx')) ?? '[]') as string[];
}

const withLineup = (e: StoredEvent): StoredEvent => ({ ...e, lineup: e.lineup ?? [] });

async function getEvent(env: Env, id: string): Promise<StoredEvent | null> {
  const e = await env.DB.get<StoredEvent>(`t:${id}`, 'json');
  return e ? withLineup(e) : null;
}

async function allEvents(env: Env): Promise<StoredEvent[]> {
  const ids = await readIndex(env);
  const list = await Promise.all(ids.map((id) => getEvent(env, id)));
  return list.filter((e): e is StoredEvent => e !== null);
}

const saveEvent = (env: Env, e: StoredEvent) => env.DB.put(`t:${e.id}`, JSON.stringify(e));

// ---------- DJs ----------

/** DJs liegen als eine Liste unter `djs`. Beim ersten Zugriff werden die bisherigen Residents angelegt. */
async function readDjs(env: Env): Promise<Dj[]> {
  const stored = await env.DB.get<Dj[]>('djs', 'json');
  if (stored) return stored;
  const seeded: Dj[] = await Promise.all(
    RESIDENTS.map(async (name) => ({ id: (await sha256(`seed-dj:${name}`)).slice(0, 16), name, resident: true }))
  );
  await env.DB.put('djs', JSON.stringify(seeded));
  return seeded;
}

const writeDjs = (env: Env, djs: Dj[]) => env.DB.put('djs', JSON.stringify(djs));
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });

/** Nach Auftrittszeit sortieren; Zeiten vor dem Beginn des Events zählen als nach Mitternacht. */
function sortLineup(start: string, entries: LineupEntry[]): LineupEntry[] {
  const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const startMin = minutes(start.slice(11, 16));
  const key = (t: string) => (t === '' ? Infinity : minutes(t) < startMin ? minutes(t) + 1440 : minutes(t));
  return entries.map((e, i) => ({ e, i })).sort((a, b) => key(a.e.time) - key(b.e.time) || a.i - b.i).map((x) => x.e);
}

function publicShape(e: StoredEvent, djs: Dj[]) {
  const { status: _s, createdAt: _c, updatedAt: _u, lineup, ...rest } = e;
  const names = new Map(djs.map((d) => [d.id, d]));
  const items: LineupItem[] = lineup.flatMap((l) => {
    const dj = names.get(l.djId);
    return dj ? [{ name: dj.name, time: l.time, ...(dj.resident ? { resident: true } : {}) }] : [];
  });
  return { ...rest, lineup: items };
}

// ---------- Eingabe prüfen ----------

const str = (v: unknown, max: number, label: string, required = false): string => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) throw new HttpError(400, `${label} fehlt.`);
  if (s.length > max) throw new HttpError(400, `${label} ist zu lang (maximal ${max} Zeichen).`);
  return s;
};

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;

function parseEvent(body: Record<string, unknown>, base: StoredEvent | null, djs: Dj[]) {
  const title = str(body.title, 120, 'Der Titel', true);
  const start = str(body.start, 40, 'Das Datum', true);
  if (!ISO.test(start) || Number.isNaN(Date.parse(start))) throw new HttpError(400, 'Datum oder Uhrzeit ist ungültig.');
  const kind = body.kind ?? 'club';
  if (!KINDS.includes(kind as (typeof KINDS)[number])) throw new HttpError(400, 'Die Art des Events ist ungültig.');
  const size = body.size ?? 'sm';
  if (size !== 'sm' && size !== 'lg') throw new HttpError(400, 'Die Kartengrösse ist ungültig.');
  const status = body.status ?? base?.status ?? 'draft';
  if (status !== 'draft' && status !== 'published') throw new HttpError(400, 'Der Status ist ungültig.');
  if (body.tags !== undefined && !Array.isArray(body.tags)) throw new HttpError(400, 'Die Stichwörter sind ungültig.');
  const tags = ((body.tags as unknown[] | undefined) ?? []).map((t) => str(t, 30, 'Ein Stichwort')).filter(Boolean);
  if (tags.length > 6) throw new HttpError(400, 'Maximal 6 Stichwörter erlaubt.');

  const details = str(body.details, 3000, 'Der Detailtext');
  const link = str(body.link, 300, 'Der Link');
  if (link) {
    let ok = false;
    try { ok = new URL(link).protocol === 'https:'; } catch { /* ungültig */ }
    if (!ok) throw new HttpError(400, 'Der Link muss mit https:// beginnen.');
  }

  if (body.lineup !== undefined && !Array.isArray(body.lineup)) throw new HttpError(400, 'Das Line-up ist ungültig.');
  const rawLineup = (body.lineup as unknown[] | undefined) ?? [];
  if (rawLineup.length > 50) throw new HttpError(400, 'Maximal 50 Einträge im Line-up erlaubt.');
  const known = new Set(djs.map((d) => d.id));
  const lineup = sortLineup(
    start,
    rawLineup.map((raw) => {
      const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const djId = typeof r.djId === 'string' ? r.djId : '';
      const time = typeof r.time === 'string' ? r.time.trim() : '';
      if (!known.has(djId)) throw new HttpError(400, 'Ein DJ im Line-up gibt es nicht (mehr).');
      if (time !== '' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new HttpError(400, 'Eine Zeit im Line-up ist ungültig (Format HH:MM).');
      return { djId, time };
    })
  );

  const fields = {
    title,
    start,
    timeLabel: str(body.timeLabel, 40, 'Die Zeitangabe', status === 'published'),
    kind: kind as ClubEvent['kind'],
    tag: str(body.tag, 40, 'Das Label'),
    blurb: str(body.blurb, 400, 'Die Beschreibung', status === 'published'),
    size: size as ClubEvent['size'],
    tags,
    lineup,
    ...(str(body.badge, 20, 'Das Badge') ? { badge: str(body.badge, 20, 'Das Badge') } : {}),
    ...(details ? { details } : {}),
    ...(link ? { link } : {}),
    ...(body.featured === true ? { featured: true } : {})
  };
  return { fields, status: status as StoredEvent['status'] };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>;
  } catch {
    /* fällt unten durch */
  }
  throw new HttpError(400, 'Ungültige Anfrage.');
}

// ---------- Bilder ----------

function sniffImage(b: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return null;
}

async function imageResponse(env: Env, id: string, cache: string) {
  const { value, metadata } = await env.DB.getWithMetadata<{ type: string }>(`img:${id}:flyer`, 'arrayBuffer');
  if (!value) return fail(404, 'Bild nicht gefunden.');
  return new Response(value, {
    headers: {
      'content-type': metadata?.type ?? 'application/octet-stream',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'"
    }
  });
}

// ---------- Login ----------

async function login(request: Request, env: Env) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  const rlKey = `rl:${ip}`;
  const failures = Number((await env.DB.get(rlKey)) ?? 0);
  if (failures >= RATE_LIMIT) {
    return fail(429, 'Zu viele Fehlversuche. Bitte in 10 Minuten erneut versuchen.');
  }
  const body = await readJson(request);
  const given = await sha256(normalizePassword(typeof body.password === 'string' ? body.password : ''));
  if (!constantTimeEqual(given, (env.ADMIN_HASH ?? '').toLowerCase())) {
    await env.DB.put(rlKey, String(failures + 1), { expirationTtl: RATE_TTL });
    return fail(401, 'Das Passwort ist nicht korrekt.');
  }
  await env.DB.delete(rlKey);
  const sid = randomHex(32);
  await env.DB.put(`s:${sid}`, JSON.stringify({ created: Date.now() }), { expirationTtl: SESSION_TTL });
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(sid, SESSION_TTL) });
}

// ---------- Routen ----------

const djName = (v: unknown) => {
  const name = str(v, 60, 'Der Name', true);
  return name;
};

async function handleDjs(request: Request, env: Env, path: string[]): Promise<Response> {
  const method = request.method;
  const djs = await readDjs(env);
  const taken = (name: string, except?: string) => djs.some((d) => d.id !== except && d.name.localeCompare(name, 'de', { sensitivity: 'base' }) === 0);

  if (path.length === 1) {
    if (method === 'GET') return json({ djs: [...djs].sort(byName) });
    if (method === 'POST') {
      const body = await readJson(request);
      const name = djName(body.name);
      if (taken(name)) throw new HttpError(409, 'Diesen DJ gibt es schon.');
      const dj: Dj = { id: newId(), name, resident: body.resident === true };
      await writeDjs(env, [...djs, dj]);
      return json({ dj }, 201);
    }
    return fail(405, 'Methode nicht erlaubt.');
  }

  const id = path[1];
  const dj = djs.find((d) => d.id === id);
  if (!dj || path.length > 2) return fail(404, 'DJ nicht gefunden.');

  if (method === 'PUT') {
    const body = await readJson(request);
    const name = djName(body.name);
    if (taken(name, id)) throw new HttpError(409, 'Diesen DJ gibt es schon.');
    const next: Dj = { id, name, resident: body.resident === true };
    await writeDjs(env, djs.map((d) => (d.id === id ? next : d)));
    return json({ dj: next });
  }
  if (method === 'DELETE') {
    // Aus allen Line-ups entfernen, damit keine Verweise ins Leere bleiben.
    let removed = 0;
    for (const e of await allEvents(env)) {
      const rest = e.lineup.filter((l) => l.djId !== id);
      if (rest.length !== e.lineup.length) {
        removed += e.lineup.length - rest.length;
        await saveEvent(env, { ...e, lineup: rest, updatedAt: new Date().toISOString() });
      }
    }
    await writeDjs(env, djs.filter((d) => d.id !== id));
    return json({ ok: true, removedFromLineups: removed });
  }
  return fail(405, 'Methode nicht erlaubt.');
}

async function handleAdmin(request: Request, env: Env, path: string[]): Promise<Response> {
  const method = request.method;
  const mutating = method !== 'GET' && method !== 'HEAD';
  if (mutating && request.headers.get('x-requested-with') !== 'fetch') {
    return fail(403, 'Anfrage abgelehnt (fehlender Schutz-Header).');
  }

  if (path[0] === 'login' && method === 'POST') return login(request, env);

  const sid = await currentSession(request, env);
  if (!sid) return fail(401, 'Bitte zuerst anmelden.');

  if (path[0] === 'logout' && method === 'POST') {
    await env.DB.delete(`s:${sid}`);
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
  }
  if (path[0] === 'me' && method === 'GET') return json({ ok: true });

  if (path[0] === 'img' && path[1] && method === 'GET') {
    return imageResponse(env, path[1], 'private, no-store');
  }

  if (path[0] === 'djs') return handleDjs(request, env, path);

  if (path[0] !== 'events') return fail(404, 'Nicht gefunden.');

  // /api/admin/events
  if (path.length === 1) {
    if (method === 'GET') return json({ events: await allEvents(env) });
    if (method === 'POST') {
      const { fields, status } = parseEvent(await readJson(request), null, await readDjs(env));
      const now = new Date().toISOString();
      const event: StoredEvent = { id: newId(), ...fields, status, imageVersion: null, createdAt: now, updatedAt: now };
      const idx = await readIndex(env);
      await saveEvent(env, event);
      await env.DB.put('idx', JSON.stringify([event.id, ...idx]));
      return json({ event }, 201);
    }
    return fail(405, 'Methode nicht erlaubt.');
  }

  // /api/admin/events/:id[/image]
  const id = path[1];
  if (!/^[0-9a-f]{16}$/.test(id)) return fail(404, 'Event nicht gefunden.');
  const event = await getEvent(env, id);
  if (!event) return fail(404, 'Event nicht gefunden.');

  if (path.length === 2) {
    if (method === 'GET') return json({ event });
    if (method === 'PUT') {
      const { fields, status } = parseEvent(await readJson(request), event, await readDjs(env));
      const next: StoredEvent = { id, ...fields, status, imageVersion: event.imageVersion, createdAt: event.createdAt, updatedAt: new Date().toISOString() };
      await saveEvent(env, next);
      return json({ event: next });
    }
    if (method === 'DELETE') {
      const idx = await readIndex(env);
      await env.DB.put('idx', JSON.stringify(idx.filter((x) => x !== id)));
      await Promise.all([env.DB.delete(`t:${id}`), env.DB.delete(`img:${id}:flyer`)]);
      return json({ ok: true });
    }
    return fail(405, 'Methode nicht erlaubt.');
  }

  if (path[2] === 'image' && path.length === 3) {
    if (method === 'PUT') {
      const declared = (request.headers.get('content-type') ?? '').split(';')[0].trim();
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(declared)) {
        return fail(415, 'Nur JPEG-, PNG- oder WebP-Bilder sind erlaubt.');
      }
      const buf = await request.arrayBuffer();
      if (buf.byteLength === 0) return fail(400, 'Das Bild ist leer.');
      if (buf.byteLength > MAX_IMAGE_BYTES) return fail(413, 'Das Bild ist zu gross (maximal 3 MB).');
      if (sniffImage(new Uint8Array(buf)) !== declared) return fail(415, 'Der Bildinhalt passt nicht zum Dateityp.');
      await env.DB.put(`img:${id}:flyer`, buf, { metadata: { type: declared } });
      const next = { ...event, imageVersion: Date.now(), updatedAt: new Date().toISOString() };
      await saveEvent(env, next);
      return json({ event: next });
    }
    if (method === 'DELETE') {
      await env.DB.delete(`img:${id}:flyer`);
      const next = { ...event, imageVersion: null, updatedAt: new Date().toISOString() };
      await saveEvent(env, next);
      return json({ event: next });
    }
    return fail(405, 'Methode nicht erlaubt.');
  }

  return fail(404, 'Nicht gefunden.');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname.split('/').filter(Boolean);

      if (path[0] === 'api') {
        if (path[1] === 'events' && path.length === 2 && request.method === 'GET') {
          // Vergangene Events sind archiviert und erscheinen hier nicht mehr (automatisch, ohne Zeitplan).
          const now = Date.now();
          const list = (await allEvents(env))
            .filter((e) => e.status === 'published' && !isArchived(e.start, now))
            .sort((x, y) => Date.parse(x.start) - Date.parse(y.start));
          const djs = await readDjs(env);
          return json({ events: list.map((e) => publicShape(e, djs)) }, 200, { 'cache-control': 'no-cache' });
        }
        if (path[1] === 'events' && path.length === 3 && request.method === 'GET') {
          // Einzelnes Event, auch ein archiviertes: alte Links und geteilte Adressen sollen weiter funktionieren.
          const event = /^[0-9a-f]{16}$/.test(path[2]) ? await getEvent(env, path[2]) : null;
          if (!event || event.status !== 'published') return fail(404, 'Event nicht gefunden.');
          return json({ event: { ...publicShape(event, await readDjs(env)), archived: isArchived(event.start) } }, 200, { 'cache-control': 'no-cache' });
        }
        if (path[1] === 'residents' && path.length === 2 && request.method === 'GET') {
          const residents = (await readDjs(env)).filter((d) => d.resident).sort(byName).map((d) => d.name);
          return json({ residents }, 200, { 'cache-control': 'no-cache' });
        }
        if (path[1] === 'admin') return await handleAdmin(request, env, path.slice(2));
        return fail(404, 'Nicht gefunden.');
      }

      if (path[0] === 'img' && path[1] && path.length === 2 && request.method === 'GET') {
        const event = /^[0-9a-f]{16}$/.test(path[1]) ? await getEvent(env, path[1]) : null;
        if (!event || event.status !== 'published' || event.imageVersion === null) return fail(404, 'Bild nicht gefunden.');
        return imageResponse(env, event.id, 'public, max-age=60');
      }

      return env.ASSETS.fetch(request);
    } catch (err) {
      if (err instanceof HttpError) return fail(err.status, err.message);
      console.error('Unerwarteter Fehler', err instanceof Error ? err.stack ?? err.message : String(err));
      return fail(500, 'Es ist ein unerwarteter Fehler aufgetreten. Bitte später erneut versuchen.');
    }
  }
} satisfies ExportedHandler<Env>;
