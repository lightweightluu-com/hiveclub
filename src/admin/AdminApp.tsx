import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, ImagePlus, Loader2, LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import { HexMark } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fmtDay, fmtMonth, fmtWeekday } from '@/lib/format';
import { sortByStart, type ApiEvent } from '@/lib/events-api';
import { cn } from '@/lib/utils';
import { api, ApiError, fromStart, prepareImage, toStart, type EventInput } from './api';

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

function List({ events, notice, onEdit, onNew, onDelete }: { events: ApiEvent[]; notice: string; onEdit: (e: ApiEvent) => void; onNew: () => void; onDelete: (e: ApiEvent) => void }) {
  const sorted = sortByStart(events).reverse();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-display text-3xl sm:text-4xl">Events</h2>
        <Button onClick={onNew}><Plus /> Neues Event</Button>
      </div>
      <p role="status" className="mb-4 min-h-6 text-sm font-semibold text-accent-text">{notice}</p>
      {sorted.length === 0 ? (
        <p className="rounded-3xl border border-line bg-surface p-8 text-muted">Noch keine Events. Lege das erste Event an. Solange keines veröffentlicht ist, zeigt die Website einen Hinweis statt des Programms.</p>
      ) : (
        <ul className="grid gap-3">
          {sorted.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5">
              <time dateTime={e.start} className="grid size-16 shrink-0 place-items-center rounded-2xl bg-surface-2 text-center leading-none">
                <span>
                  <span className="block font-display font-black text-2xl">{fmtDay(e.start)}</span>
                  <span className="block text-[11px] font-bold uppercase text-muted">{fmtMonth(e.start)}</span>
                </span>
              </time>
              <div className="min-w-0 flex-1 basis-48">
                <h3 className="truncate text-lg font-extrabold">{e.title}</h3>
                <p className="text-sm text-muted">{fmtWeekday(e.start)} · {e.timeLabel || 'Zeit offen'}</p>
                <div className="mt-2"><StatusBadge status={e.status} /></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(e)} aria-label={`${e.title} bearbeiten`}><Pencil /> Bearbeiten</Button>
                <Button variant="outline" size="icon" onClick={() => onDelete(e)} aria-label={`${e.title} löschen`}><Trash2 /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ---------- Editor ----------

type Errors = Partial<Record<'title' | 'date' | 'time' | 'timeLabel' | 'blurb' | 'image' | 'form', string>>;

function Editor({ event, onCancel, onSaved }: { event: ApiEvent | null; onCancel: () => void; onSaved: (msg: string) => void }) {
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
      setEvents(await api.list());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAuth('out');
      else setLoadError(messageOf(err));
    }
  }, []);

  useEffect(() => { if (auth === 'in') void reload(); }, [auth, reload]);

  async function logout() {
    await api.logout().catch(() => undefined);
    setEvents(null);
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
        {events === null && !loadError ? (
          <p role="status" className="text-muted">Events werden geladen …</p>
        ) : view.kind === 'edit' ? (
          <Editor
            key={view.event?.id ?? 'new'}
            event={view.event}
            onCancel={() => setView({ kind: 'list' })}
            onSaved={async (msg) => { await reload(); setNotice(msg); setView({ kind: 'list' }); }}
          />
        ) : events ? (
          <List
            events={events}
            notice={notice}
            onNew={() => { setNotice(''); setView({ kind: 'edit', event: null }); }}
            onEdit={(e) => { setNotice(''); setView({ kind: 'edit', event: e }); }}
            onDelete={(e) => { returnFocus.current = document.activeElement as HTMLElement | null; setToDelete(e); }}
          />
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
