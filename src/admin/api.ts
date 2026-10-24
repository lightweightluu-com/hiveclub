import type { ApiEvent } from '@/lib/events-api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: BodyInit | null, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    // Schutz gegen CSRF: der Worker lehnt ändernde Anfragen ohne diesen Header ab.
    headers: { 'x-requested-with': 'fetch', ...headers },
    body
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Etwas ist schiefgelaufen. Bitte erneut versuchen.');
  return data;
}

const jsonBody = (data: unknown) => ({ body: JSON.stringify(data), headers: { 'content-type': 'application/json' } });

export type EventInput = Pick<ApiEvent, 'title' | 'start' | 'timeLabel' | 'kind' | 'tag' | 'blurb' | 'size' | 'tags'> & {
  badge: string;
  featured: boolean;
  status: ApiEvent['status'];
};

export const api = {
  me: () => request<{ ok: true }>('GET', '/api/admin/me'),
  login: (password: string) => {
    const j = jsonBody({ password });
    return request<{ ok: true }>('POST', '/api/admin/login', j.body, j.headers);
  },
  logout: () => request<{ ok: true }>('POST', '/api/admin/logout'),
  list: () => request<{ events: ApiEvent[] }>('GET', '/api/admin/events').then((d) => d.events),
  create: (input: EventInput) => {
    const j = jsonBody(input);
    return request<{ event: ApiEvent }>('POST', '/api/admin/events', j.body, j.headers).then((d) => d.event);
  },
  update: (id: string, input: EventInput) => {
    const j = jsonBody(input);
    return request<{ event: ApiEvent }>('PUT', `/api/admin/events/${id}`, j.body, j.headers).then((d) => d.event);
  },
  remove: (id: string) => request<{ ok: true }>('DELETE', `/api/admin/events/${id}`),
  uploadImage: (id: string, blob: Blob) =>
    request<{ event: ApiEvent }>('PUT', `/api/admin/events/${id}/image`, blob, { 'content-type': blob.type }).then((d) => d.event),
  removeImage: (id: string) => request<{ event: ApiEvent }>('DELETE', `/api/admin/events/${id}/image`).then((d) => d.event)
};

/** Verkleinert Fotos im Browser (max. 1600 px, WebP), damit Uploads klein bleiben. */
export async function prepareImage(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new ApiError(415, 'Nur JPEG-, PNG- oder WebP-Bilder sind erlaubt.');
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  if (!blob) throw new ApiError(415, 'Das Bild konnte nicht verarbeitet werden.');
  return blob;
}

// ---------- Datum/Uhrzeit in Zürcher Zeit ----------

const ZONE = 'Europe/Zurich';

function offsetMinutes(at: Date): number {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, timeZoneName: 'longOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')!.value; // z. B. "GMT+02:00"
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(part);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

/** "2026-10-24" + "23:00" (Zürcher Wandzeit) → ISO mit korrektem Sommer-/Winterzeit-Offset. */
export function toStart(date: string, time: string): string {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let off = offsetMinutes(new Date(wall));
  off = offsetMinutes(new Date(wall - off * 60000)); // zweiter Durchgang an der Zeitumstellung
  const sign = off < 0 ? '-' : '+';
  const abs = Math.abs(off);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date}T${time}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

export function fromStart(iso: string): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
