import { useState } from 'react';
import { AlertCircle, Check, Loader2, Mic2, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ApiEvent, Dj } from '@/lib/events-api';
import { cn } from '@/lib/utils';
import { api, ApiError } from './api';

const messageOf = (e: unknown) => (e instanceof ApiError ? e.message : 'Keine Verbindung zum Server. Bitte erneut versuchen.');
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function ResidentBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-text px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
      <Star aria-hidden className="size-3.5" /> Resident
    </span>
  );
}

export function DjsView({
  djs,
  events,
  onChange
}: {
  djs: Dj[];
  events: ApiEvent[];
  /** Lädt DJs und Events neu (Line-ups können sich ändern). */
  onChange: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [resident, setResident] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editResident, setEditResident] = useState(false);
  const [editError, setEditError] = useState('');
  const [toDelete, setToDelete] = useState<Dj | null>(null);
  const [deleting, setDeleting] = useState(false);

  const usage = (id: string) => events.filter((e) => e.lineup.some((l) => l.djId === id)).length;
  const shown = djs.filter((d) => plain(d.name).includes(plain(search.trim())));
  const residents = djs.filter((d) => d.resident).length;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Bitte einen Namen eingeben.');
    setBusy(true);
    setError('');
    try {
      const dj = await api.createDj(name.trim(), resident);
      await onChange();
      setNotice(dj.resident ? `„${dj.name}“ ist angelegt und erscheint im Resident-Band der Website.` : `„${dj.name}“ ist angelegt.`);
      setName('');
      setResident(false);
    } catch (err) {
      setError(messageOf(err));
    }
    setBusy(false);
  }

  async function saveEdit(d: Dj) {
    if (!editName.trim()) return setEditError('Bitte einen Namen eingeben.');
    setBusy(true);
    setEditError('');
    try {
      await api.updateDj(d.id, editName.trim(), editResident);
      await onChange();
      setNotice(`„${editName.trim()}“ ist gespeichert.`);
      setEditing(null);
    } catch (err) {
      setEditError(messageOf(err));
    }
    setBusy(false);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const r = await api.removeDj(toDelete.id);
      await onChange();
      setNotice(`„${toDelete.name}“ ist gelöscht${r.removedFromLineups ? ` und aus ${r.removedFromLineups} Line-up-Einträgen entfernt` : ''}.`);
    } catch (err) {
      setError(messageOf(err));
    }
    setToDelete(null);
    setDeleting(false);
  }

  const used = toDelete ? usage(toDelete.id) : 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-display text-3xl sm:text-4xl">DJs</h2>
        <p className="text-sm text-muted">{djs.length} DJs, davon {residents} Residents</p>
      </div>

      <form onSubmit={add} noValidate className="mb-6 grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-extrabold"><Plus aria-hidden className="size-5 text-accent-text" /> DJ hinzufügen</h3>
        <div>
          <label htmlFor="dj-name" className="mb-1.5 block text-sm font-bold">Name</label>
          <Input id="dj-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-invalid={!!error} aria-describedby={error ? 'dj-name-err' : undefined} />
          {error && <p id="dj-name-err" role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-red-400"><AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />{error}</p>}
        </div>
        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3">
          <input type="checkbox" checked={resident} onChange={(e) => setResident(e.target.checked)} className="mt-0.5 size-5 accent-[var(--accent)]" />
          <span>
            <span className="block font-bold">Resident</span>
            <span className="block text-sm text-muted">Residents erscheinen automatisch im Band auf der Startseite. Ohne Haken ist es ein DJ für Line-ups.</span>
          </span>
        </label>
        <div>
          <Button type="submit" disabled={busy} aria-busy={busy}>{busy && <Loader2 className="animate-spin" />} Hinzufügen</Button>
        </div>
      </form>

      <p role="status" className="mb-4 min-h-6 text-sm font-semibold text-accent-text">{notice}</p>

      <div className="relative mb-4">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <label htmlFor="dj-search" className="sr-only">DJ suchen</label>
        <Input id="dj-search" type="search" placeholder="DJ suchen …" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12" />
      </div>

      {shown.length === 0 ? (
        <p className="rounded-3xl border border-line bg-surface p-8 text-muted">{djs.length === 0 ? 'Noch keine DJs. Lege oben den ersten an.' : 'Kein DJ gefunden.'}</p>
      ) : (
        <ul className="grid gap-2">
          {shown.map((d) => (
            <li key={d.id} className="rounded-2xl border border-line bg-surface p-4">
              {editing === d.id ? (
                <form onSubmit={(e) => { e.preventDefault(); void saveEdit(d); }} noValidate className="grid gap-3">
                  <div>
                    <label htmlFor={`dj-edit-${d.id}`} className="mb-1.5 block text-sm font-bold">Name</label>
                    <Input id={`dj-edit-${d.id}`} autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={60} aria-invalid={!!editError} />
                    {editError && <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-red-400"><AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />{editError}</p>}
                  </div>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
                    <input type="checkbox" checked={editResident} onChange={(e) => setEditResident(e.target.checked)} className="size-5 accent-[var(--accent)]" /> Resident
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="sm" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Check />} Speichern</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)} disabled={busy}><X /> Abbrechen</Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Mic2 aria-hidden className="size-5 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate text-lg font-extrabold">{d.name}</p>
                    <p className="text-sm text-muted">{usage(d.id) === 0 ? 'In keinem Line-up' : `In ${usage(d.id)} ${usage(d.id) === 1 ? 'Event' : 'Events'}`}</p>
                  </div>
                  <span className={cn(!d.resident && 'hidden sm:inline-flex sm:text-muted')}>{d.resident ? <ResidentBadge /> : <span className="text-xs font-bold uppercase tracking-wider">DJ</span>}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" aria-label={`${d.name} bearbeiten`} onClick={() => { setEditing(d.id); setEditName(d.name); setEditResident(d.resident); setEditError(''); setNotice(''); }}><Pencil /> Bearbeiten</Button>
                    <Button variant="outline" size="icon" aria-label={`${d.name} löschen`} onClick={() => setToDelete(d)}><Trash2 /></Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={toDelete !== null} onOpenChange={(o) => { if (!o && !deleting) setToDelete(null); }}>
        <DialogContent>
          <DialogTitle className="text-xl font-extrabold">DJ löschen?</DialogTitle>
          <DialogDescription className="mt-2 text-muted">
            „{toDelete?.name}“ wird endgültig gelöscht.
            {used > 0 && ` Der DJ wird aus dem Line-up von ${used} ${used === 1 ? 'Event' : 'Events'} entfernt.`}
            {toDelete?.resident && ' Er verschwindet ausserdem aus dem Resident-Band der Website.'}
          </DialogDescription>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <DialogClose asChild><Button variant="outline" disabled={deleting}>Abbrechen</Button></DialogClose>
            <Button onClick={confirmDelete} disabled={deleting} aria-busy={deleting} className="bg-red-500 text-white hover:shadow-[0_0_24px_-4px_#ef4444]">
              {deleting && <Loader2 className="animate-spin" />} DJ löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
