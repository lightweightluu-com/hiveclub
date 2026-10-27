import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Archive, ArrowLeft, CheckCircle2, ExternalLink, ImagePlus, Loader2, LogOut, Pencil, Plus, Trash2, X } from 'lucide-react';
import { HexMark } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fmtDay, fmtMonth, fmtWeekday } from '@/lib/format';
import { isArchived } from '@/lib/archive';
import { sortByStart, type ApiEvent, type Dj } from '@/lib/events-api';
import { cn } from '@/lib/utils';
import { api, ApiError, fromStart, prepareImage, toStart, type EventInput } from './api';
import { DjsView } from './DjsView';

const KIND_LABEL = { club: 'Club', wellness: 'Wellness', dance: 'Tanzen' } as const;
const SELECT = 'h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-fg focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text/40';
const FORM_HINT = 'Änderungen an veröffentlichten Events erscheinen auf der Website innerhalb von etwa einer Minute.';

const messageOf = (e: unknown) => (e instanceof ApiError ? e.message : 'Keine Verbindung zum Server. Bitte erneut versuchen.');

function ErrorText({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-400">
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && <ErrorText id={`${htmlFor}-err`}>{error}</ErrorText>}
    </div>
  );
}

// ---------- Login ----------

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw.trim()) return setError('Bitte das Passwort eingeben.');
    setBusy(true);
    setError('');
    try {
      await api.login(pw);
      onDone();
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-svh max-w-md content-center gap-8 px-4 py-12">
      <div className="flex items-center gap-3">
        <HexMark className="size-10 text-accent-text" />
        <h1 className="text-display text-4xl">Admin</h1>
      </div>
      <form onSubmit={submit} noValidate className="grid gap-4 rounded-3xl border border-line bg-surface p-6">
        <Field label="Passwort" htmlFor="password" error={error}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'password-err' : undefined}
          />
        </Field>
        <Button type="submit" disabled={busy} aria-busy={busy} className="w-full">
          {busy && <Loader2 className="animate-spin" />} Anmelden
        </Button>
      </form>
      <a href="/" className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-fg">Zur Website</a>
    </main>
  );
}

// ---------- Liste ----------

function StatusBadge({ status }: { status: ApiEvent['status'] }) {
  const live = status === 'published';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider', live ? 'border-accent-text text-accent-text' : 'border-line text-muted')}>
      {live ? <CheckCircle2 aria-hidden className="size-3.5" /> : <Pencil aria-hidden className="size-3.5" />}
      {live ? 'Veröffentlicht' : 'Entwurf'}
    </span>
  );
}

function EventRow({ e, archived, onEdit, onDelete }: { e: ApiEvent; archived: boolean; onEdit: (e: ApiEvent) => void; onDelete: (e: ApiEvent) => void }) {
  return (
    <li className={cn('flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5', archived && 'opacity-80')}>
      <time dateTime={e.start} className="grid size-16 shrink-0 place-items-center rounded-2xl bg-surface-2 text-center leading-none">
        <span>
          <span className="block font-display font-black text-2xl">{fmtDay(e.start)}</span>
          <span className="block text-[11px] font-bold uppercase text-muted">{fmtMonth(e.start)}</span>
        </span>
      </time>
      <div className="min-w-0 flex-1 basis-48">
        <h4 className="truncate text-lg font-extrabold">{e.title}</h4>
        <p className="text-sm text-muted">{fmtWeekday(e.start)} · {e.timeLabel || 'Zeit offen'}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge status={e.status} />
          {archived && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-muted">
              <Archive aria-hidden className="size-3.5" /> Archiviert
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(e)} aria-label={`${e.title} bearbeiten`}><Pencil /> Bearbeiten</Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(e)} aria-label={`${e.title} löschen`}><Trash2 /></Button>
      </div>
    </li>
  );
}

function List({ events, notice, onEdit, onNew, onDelete }: { events: ApiEvent[]; notice: string; onEdit: (e: ApiEvent) => void; onNew: () => void; onDelete: (e: ApiEvent) => void }) {
  // Vergangene Events wandern automatisch ins Archiv (gleiche Regel wie auf der Website).
  const upcoming = sortByStart(events.filter((e) => !isArchived(e.start)));
  const archive = sortByStart(events.filter((e) => isArchived(e.start))).reverse();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-display text-3xl sm:text-4xl">Events</h2>
        <Button onClick={onNew}><Plus /> Neues Event</Button>
      </div>
      <p role="status" className="mb-4 min-h-6 text-sm font-semibold text-accent-text">{notice}</p>

      <h3 className="mb-3 text-lg font-extrabold">Kommende Events <span className="text-muted">({upcoming.length})</span></h3>
      {upcoming.length === 0 ? (
        <p className="rounded-3xl border border-line bg-surface p-8 text-muted">
          Keine kommenden Events. Die Website zeigt deshalb einen Hinweis statt des Programms. Lege ein neues Event an.
        </p>
      ) : (
        <ul className="grid gap-3">
          {upcoming.map((e) => <EventRow key={e.id} e={e} archived={false} onEdit={onEdit} onDelete={onDelete} />)}
        </ul>
      )}

      {archive.length > 0 && (
        <details className="group mt-10" open={upcoming.length === 0}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-lg font-extrabold [&::-webkit-details-marker]:hidden">
            <Archive aria-hidden className="size-5 text-muted" /> Archiv <span className="text-muted">({archive.length})</span>
            <span aria-hidden className="ml-auto text-sm font-bold uppercase tracking-wider text-muted group-open:hidden">Anzeigen</span>
            <span aria-hidden className="ml-auto hidden text-sm font-bold uppercase tracking-wider text-muted group-open:inline">Ausblenden</span>
          </summary>
          <p className="mb-4 mt-1 text-sm text-muted">Events werden 12 Stunden nach Beginn archiviert. Sie bleiben gespeichert und ihre Seite ist per Link weiter erreichbar, erscheinen aber nicht mehr im Programm.</p>
          <ul className="grid gap-3">
            {archive.map((e) => <EventRow key={e.id} e={e} archived onEdit={onEdit} onDelete={onDelete} />)}
          </ul>
        </details>
      )}
    </>
  );
}

// ---------- Editor ----------

type Errors = Partial<Record<'title' | 'date' | 'time' | 'timeLabel' | 'blurb' | 'link' | 'lineup' | 'image' | 'form', string>>;

type LineupRow = { key: string; djId: string; time: string };
let rowCounter = 0;
const newRow = (djId = '', time = ''): LineupRow => ({ key: `r${++rowCounter}`, djId, time });

function Editor({ event, djs, onDjCreated, onCancel, onSaved }: { event: ApiEvent | null; djs: Dj[]; onDjCreated: (dj: Dj) => void; onCancel: () => void; onSaved: (msg: string) => void }) {
  const init = event ? fromStart(event.start) : { date: '', time: '' };
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);
  const [timeLabel, setTimeLabel] = useState(event?.timeLabel ?? '');
  const [kind, setKind] = useState<ApiEvent['kind']>(event?.kind ?? 'club');
  const [tag, setTag] = useState(event?.tag ?? '');
  const [badge, setBadge] = useState(event?.badge ?? '');
  const [tagsText, setTagsText] = useState((event?.tags ?? []).join(', '));
  const [blurb, setBlurb] = useState(event?.blurb ?? '');
  const [details, setDetails] = useState(event?.details ?? '');
  const [link, setLink] = useState(event?.link ?? '');
  const [lineup, setLineup] = useState<LineupRow[]>(() => (event?.lineup ?? []).map((l) => newRow(l.djId, l.time)));
  const [size, setSize] = useState<ApiEvent['size']>(event?.size ?? 'sm');
  const [featured, setFeatured] = useState(event?.featured ?? false);
  const [status, setStatus] = useState<ApiEvent['status']>(event?.status ?? 'draft');
  const [file, setFile] = useState<File | null>(null);
  const [dropImage, setDropImage] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const labelTouched = useRef(!!event?.timeLabel);
  const uid = useId();
  const preview = useRef<string | null>(null);
  if (file && !preview.current) preview.current = URL.createObjectURL(file);
  useEffect(() => () => { if (preview.current) URL.revokeObjectURL(preview.current); }, []);

  const existingImage = event?.imageVersion != null && !dropImage ? `/api/admin/img/${event.id}?v=${event.imageVersion}` : null;
  const shownImage = file ? preview.current : existingImage;

  function onTime(v: string) {
    setTime(v);
    if (!labelTouched.current && v) setTimeLabel(`ab ${v}`);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!title.trim()) e.title = 'Der Titel fehlt.';
    if (!date) e.date = 'Das Datum fehlt.';
    if (!time) e.time = 'Die Uhrzeit fehlt.';
    if (lineup.some((r) => !r.djId && r.time)) e.lineup = 'Im Line-up fehlt bei einer Zeile der DJ. Wähle einen DJ oder entferne die Zeile.';
    if (link.trim() && !/^https:\/\/\S+$/.test(link.trim())) e.link = 'Der Link muss mit https:// beginnen.';
    if (status === 'published') {
      if (!timeLabel.trim()) e.timeLabel = 'Zum Veröffentlichen braucht es eine Zeitangabe.';
      if (!blurb.trim()) e.blurb = 'Zum Veröffentlichen braucht es eine Beschreibung.';
    }
    return e;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid=true]')?.focus());
      return;
    }
    const input: EventInput = {
      title: title.trim(),
      start: toStart(date, time),
      timeLabel: timeLabel.trim(),
      kind,
      tag: tag.trim(),
      badge: badge.trim(),
      blurb: blurb.trim(),
      details: details.trim(),
      link: link.trim(),
      lineup: lineup.filter((r) => r.djId).map((r) => ({ djId: r.djId, time: r.time })),
      size,
      featured,
      status,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean)
    };
    setBusy(true);
    try {
      let saved = event ? await api.update(event.id, input) : await api.create(input);
      try {
        if (file) saved = await api.uploadImage(saved.id, await prepareImage(file));
        else if (dropImage && event?.imageVersion != null) saved = await api.removeImage(saved.id);
      } catch (imgErr) {
        // Event ist gespeichert; nur das Bild ist fehlgeschlagen.
        setBusy(false);
        setErrors({ image: `Das Event ist gespeichert, aber das Bild nicht: ${messageOf(imgErr)}` });
        return;
      }
      onSaved(status === 'published' ? `„${saved.title}“ ist gespeichert und veröffentlicht. ${FORM_HINT}` : `„${saved.title}“ ist als Entwurf gespeichert und auf der Website nicht sichtbar.`);
    } catch (err) {
      setErrors({ form: messageOf(err) });
      setBusy(false);
    }
  }

  const aria = (k: keyof Errors) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${uid}-${k}-err` : undefined });

  return (
    <form onSubmit={save} noValidate className="grid gap-8">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Zurück zur Liste"><ArrowLeft /></Button>
        <h2 className="text-display text-3xl sm:text-4xl">{event ? 'Event bearbeiten' : 'Neues Event'}</h2>
      </div>

      {errors.form && <div role="alert" className="rounded-2xl border border-red-400/60 p-4"><ErrorText>{errors.form}</ErrorText></div>}

      <section aria-labelledby={`${uid}-basics`} className="grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h3 id={`${uid}-basics`} className="text-lg font-extrabold">Grunddaten</h3>
        <Field label="Titel" htmlFor={`${uid}-title`} error={errors.title}>
          <Input id={`${uid}-title`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} {...aria('title')} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Datum" htmlFor={`${uid}-date`} error={errors.date}>
            <Input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} {...aria('date')} />
          </Field>
          <Field label="Beginn" htmlFor={`${uid}-time`} error={errors.time}>
            <Input id={`${uid}-time`} type="time" value={time} onChange={(e) => onTime(e.target.value)} {...aria('time')} />
          </Field>
          <Field label="Zeitangabe auf der Karte" htmlFor={`${uid}-timeLabel`} error={errors.timeLabel} hint="z. B. „ab 23:00“">
            <Input id={`${uid}-timeLabel`} value={timeLabel} onChange={(e) => { labelTouched.current = true; setTimeLabel(e.target.value); }} maxLength={40} {...aria('timeLabel')} />
          </Field>
        </div>
        <Field label="Beschreibung" htmlFor={`${uid}-blurb`} error={errors.blurb} hint={`${blurb.length} von 400 Zeichen`}>
          <textarea
            id={`${uid}-blurb`}
            rows={4}
            maxLength={400}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text/40 aria-[invalid=true]:border-red-400"
            {...aria('blurb')}
          />
        </Field>
        <Field label="Detailtext für die Eventseite (optional)" htmlFor={`${uid}-details`} hint={`Absätze mit einer Leerzeile trennen. ${details.length} von 3000 Zeichen`}>
          <textarea
            id={`${uid}-details`}
            rows={8}
            maxLength={3000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text/40"
          />
        </Field>
        <Field label="Link, z. B. Tickets (optional)" htmlFor={`${uid}-link`} error={errors.link} hint="Erscheint als Button auf der Eventseite. Nur https://">
          <Input id={`${uid}-link`} type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} maxLength={300} placeholder="https://" {...aria('link')} />
        </Field>
      </section>

      <section aria-labelledby={`${uid}-lineup`} className="grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <div>
          <h3 id={`${uid}-lineup`} className="text-lg font-extrabold">Line-up</h3>
          <p className="mt-1 text-sm text-muted">DJ suchen oder neu anlegen und die Auftrittszeit eintragen. Beim Speichern wird nach Zeit sortiert (Zeiten nach Mitternacht folgen auf den Abend).</p>
        </div>
        {lineup.length === 0 && <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">Noch kein Line-up. Das Event zeigt dann keinen Line-up-Block.</p>}
        <ul className="grid gap-3">
          {lineup.map((row, i) => (
            <li key={row.key} className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[1fr_9rem_auto]">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={`${uid}-dj-${row.key}`} className="mb-1.5 block text-sm font-bold">DJ {i + 1}</label>
                <Combobox
                  id={`${uid}-dj-${row.key}`}
                  label={`DJ ${i + 1}`}
                  options={djs.map((d) => ({ value: d.id, label: d.name, hint: d.resident ? 'Resident' : undefined }))}
                  value={row.djId}
                  onChange={(djId) => setLineup((l) => l.map((r) => (r.key === row.key ? { ...r, djId } : r)))}
                  onCreate={async (name) => {
                    try {
                      const dj = await api.createDj(name, false);
                      onDjCreated(dj);
                      return dj.id;
                    } catch (err) {
                      setErrors((x) => ({ ...x, lineup: messageOf(err) }));
                      return null;
                    }
                  }}
                  invalid={!!errors.lineup && !row.djId && !!row.time}
                />
              </div>
              <div>
                <label htmlFor={`${uid}-t-${row.key}`} className="mb-1.5 block text-sm font-bold">Zeit</label>
                <Input id={`${uid}-t-${row.key}`} type="time" value={row.time} onChange={(e) => setLineup((l) => l.map((r) => (r.key === row.key ? { ...r, time: e.target.value } : r)))} />
              </div>
              <Button type="button" variant="outline" size="icon" aria-label={`DJ ${i + 1} entfernen`} onClick={() => setLineup((l) => l.filter((r) => r.key !== row.key))}><X /></Button>
            </li>
          ))}
        </ul>
        {errors.lineup && <ErrorText>{errors.lineup}</ErrorText>}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => setLineup((l) => [...l, newRow()])}><Plus /> DJ zum Line-up</Button>
        </div>
      </section>

      <section aria-labelledby={`${uid}-look`} className="grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h3 id={`${uid}-look`} className="text-lg font-extrabold">Darstellung</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Art" htmlFor={`${uid}-kind`}>
            <select id={`${uid}-kind`} className={SELECT} value={kind} onChange={(e) => setKind(e.target.value as ApiEvent['kind'])}>
              {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Label" htmlFor={`${uid}-tag`} hint="z. B. „Freitag“ oder „Yoga“">
            <Input id={`${uid}-tag`} value={tag} onChange={(e) => setTag(e.target.value)} maxLength={40} />
          </Field>
          <Field label="Badge (optional)" htmlFor={`${uid}-badge`} hint="z. B. „ab 18“">
            <Input id={`${uid}-badge`} value={badge} onChange={(e) => setBadge(e.target.value)} maxLength={20} />
          </Field>
          <Field label="Stichwörter (optional)" htmlFor={`${uid}-tags`} hint="Mit Komma trennen, höchstens 6">
            <Input id={`${uid}-tags`} value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          </Field>
          <Field label="Kartengrösse" htmlFor={`${uid}-size`}>
            <select id={`${uid}-size`} className={SELECT} value={size} onChange={(e) => setSize(e.target.value as ApiEvent['size'])}>
              <option value="sm">Klein (drei pro Zeile)</option>
              <option value="lg">Gross (zwei pro Zeile)</option>
            </select>
          </Field>
          <label className="flex min-h-12 items-center gap-3 self-end rounded-xl border border-line bg-surface px-4 text-base font-bold">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-5 accent-[var(--accent)]" />
            Hervorgehoben
          </label>
        </div>
      </section>

      <section aria-labelledby={`${uid}-img`} className="grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h3 id={`${uid}-img`} className="text-lg font-extrabold">Flyer (optional)</h3>
        {shownImage && <img src={shownImage} alt="Vorschau des Flyers" className="aspect-video w-full max-w-md rounded-2xl border border-line object-cover" />}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-bold uppercase tracking-wider transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-accent-text hover:border-accent-text hover:text-accent-text">
            <ImagePlus aria-hidden className="size-4" /> {shownImage ? 'Anderes Bild wählen' : 'Bild wählen'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (preview.current) URL.revokeObjectURL(preview.current);
                preview.current = null;
                setFile(f);
                setDropImage(false);
              }}
            />
          </label>
          {shownImage && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { setFile(null); preview.current = null; setDropImage(true); }}>
              <Trash2 /> Bild entfernen
            </Button>
          )}
        </div>
        <p className="text-sm text-muted">JPEG, PNG oder WebP. Das Bild wird vor dem Hochladen auf höchstens 1600 px verkleinert und erscheint nur bei veröffentlichten Events.</p>
        {errors.image && <ErrorText>{errors.image}</ErrorText>}
      </section>

      <fieldset className="grid gap-3 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 text-lg font-extrabold">Sichtbarkeit</legend>
        {(['draft', 'published'] as const).map((s) => (
          <label key={s} className={cn('flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border p-4', status === s ? 'border-accent-text bg-accent/10' : 'border-line')}>
            <input type="radio" name={`${uid}-status`} value={s} checked={status === s} onChange={() => setStatus(s)} className="mt-1 size-5 accent-[var(--accent)]" />
            <span>
              <span className="block font-bold">{s === 'draft' ? 'Entwurf' : 'Veröffentlicht'}</span>
              <span className="block text-sm text-muted">{s === 'draft' ? 'Nur im Admin sichtbar, nicht auf der Website.' : `Sichtbar auf der Website. ${FORM_HINT}`}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy} aria-busy={busy}>
          {busy && <Loader2 className="animate-spin" />} Speichern
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Abbrechen</Button>
      </div>
    </form>
  );
}

// ---------- Rahmen ----------

export default function AdminApp() {
  const [auth, setAuth] = useState<'checking' | 'out' | 'in'>('checking');
  const [events, setEvents] = useState<ApiEvent[] | null>(null);
  const [djs, setDjs] = useState<Dj[] | null>(null);
  const [tab, setTab] = useState<'events' | 'djs'>('events');
  const [view, setView] = useState<{ kind: 'list' } | { kind: 'edit'; event: ApiEvent | null }>({ kind: 'list' });
  const [notice, setNotice] = useState('');
  const [toDelete, setToDelete] = useState<ApiEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = 'Admin – Hive Club';
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
    api.me().then(() => setAuth('in'), () => setAuth('out'));
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoadError('');
      const [list, people] = await Promise.all([api.list(), api.listDjs()]);
      setEvents(list);
      setDjs(people);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAuth('out');
      else setLoadError(messageOf(err));
    }
  }, []);

  useEffect(() => { if (auth === 'in') void reload(); }, [auth, reload]);

  async function logout() {
    await api.logout().catch(() => undefined);
    setEvents(null);
    setDjs(null);
    setTab('events');
    setView({ kind: 'list' });
    setNotice('');
    setAuth('out');
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.remove(toDelete.id);
      setToDelete(null);
      await reload();
      setNotice(`„${toDelete.title}“ ist gelöscht. ${FORM_HINT}`);
    } catch (err) {
      setLoadError(messageOf(err));
      setToDelete(null);
    }
    setDeleting(false);
  }

  if (auth === 'checking') return <p role="status" className="grid min-h-svh place-items-center text-muted">Lädt …</p>;
  if (auth === 'out') return <Login onDone={() => setAuth('in')} />;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-8 flex items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2 font-display font-black text-xl uppercase">
          <HexMark className="size-8 text-accent-text" /> Admin
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer noopener" className="hidden items-center gap-1.5 px-2 text-sm font-semibold text-muted hover:text-fg sm:inline-flex">
            Website <ExternalLink aria-hidden className="size-4" />
          </a>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logout}><LogOut /> Abmelden</Button>
        </div>
      </header>

      <main>
        {loadError && <div role="alert" className="mb-4 rounded-2xl border border-red-400/60 p-4"><ErrorText>{loadError}</ErrorText></div>}
        {(events === null || djs === null) && !loadError ? (
          <p role="status" className="text-muted">Wird geladen …</p>
        ) : events && djs && view.kind === 'edit' ? (
          <Editor
            key={view.event?.id ?? 'new'}
            event={view.event}
            djs={djs}
            onDjCreated={(dj) => setDjs((list) => [...(list ?? []), dj])}
            onCancel={() => setView({ kind: 'list' })}
            onSaved={async (msg) => { await reload(); setNotice(msg); setView({ kind: 'list' }); }}
          />
        ) : events && djs ? (
          <>
            <nav aria-label="Bereiche" className="mb-8 flex gap-2 border-b border-line pb-4">
              {([['events', 'Events'], ['djs', 'DJs']] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => { setTab(id); setNotice(''); }}
                  className={cn('min-h-11 rounded-full border px-5 text-sm font-bold uppercase tracking-wider transition-colors', tab === id ? 'border-accent bg-accent text-accent-fg' : 'border-line hover:border-accent-text hover:text-accent-text')}
                >
                  {label}
                </button>
              ))}
            </nav>
            {tab === 'events' ? (
              <List
                events={events}
                notice={notice}
                onNew={() => { setNotice(''); setView({ kind: 'edit', event: null }); }}
                onEdit={(e) => { setNotice(''); setView({ kind: 'edit', event: e }); }}
                onDelete={(e) => { returnFocus.current = document.activeElement as HTMLElement | null; setToDelete(e); }}
              />
            ) : (
              <DjsView djs={djs} events={events} onChange={reload} />
            )}
          </>
        ) : null}
      </main>

      <Dialog open={toDelete !== null} onOpenChange={(o) => { if (!o && !deleting) setToDelete(null); }}>
        <DialogContent
          onCloseAutoFocus={(ev) => {
            // Das Modal wird ohne Trigger geöffnet, deshalb den Fokus selbst zurückgeben.
            ev.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <DialogTitle className="text-xl font-extrabold">Event löschen?</DialogTitle>
          <DialogDescription className="mt-2 text-muted">
            „{toDelete?.title}“ wird samt Flyer endgültig gelöscht. Das lässt sich nicht rückgängig machen. Zum blossen Ausblenden stattdessen auf „Entwurf“ stellen.
          </DialogDescription>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <DialogClose asChild><Button variant="outline" disabled={deleting}>Abbrechen</Button></DialogClose>
            <Button onClick={confirmDelete} disabled={deleting} aria-busy={deleting} className="bg-red-500 text-white hover:shadow-[0_0_24px_-4px_#ef4444]">
              {deleting && <Loader2 className="animate-spin" />} Event löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
