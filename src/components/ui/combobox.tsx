import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComboOption = { value: string; label: string; hint?: string };

const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Dropdown mit Suchfeld (ARIA-Combobox): Klick, Tippen oder Pfeil nach unten öffnet; Tippen filtert, Pfeile wählen, Enter übernimmt, Esc schliesst. Fokus allein öffnet nichts (z. B. bei Validierungsfehlern). */
export function Combobox({
  id,
  label,
  options,
  value,
  onChange,
  onCreate,
  placeholder = 'DJ suchen …',
  invalid,
  describedBy
}: {
  id: string;
  label: string;
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  /** Wenn gesetzt, wird bei unbekanntem Suchtext „Neu anlegen“ angeboten. */
  onCreate?: (name: string) => Promise<string | null>;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  const q = plain(query.trim());
  const filtered = useMemo(() => options.filter((o) => plain(o.label).includes(q)), [options, q]);
  const canCreate = !!onCreate && query.trim() !== '' && !options.some((o) => plain(o.label) === q);
  const count = filtered.length + (canCreate ? 1 : 0);

  useEffect(() => { setActive(0); }, [query, open]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active=true]')?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  async function choose(i: number) {
    if (i < filtered.length) {
      onChange(filtered[i].value);
      close();
    } else if (canCreate && onCreate) {
      setBusy(true);
      try {
        const created = await onCreate(query.trim());
        if (created) onChange(created);
        close();
      } finally {
        setBusy(false);
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(a + 1, count - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault(); // Enter wählt aus, speichert nicht das Formular
      if (count > 0) void choose(active);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }

  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close(); }}>
      <input
        id={id}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && count > 0 ? `${uid}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        value={open ? query : selected?.label ?? ''}
        placeholder={selected ? selected.label : placeholder}
        onClick={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        className="h-12 w-full rounded-xl border border-line bg-surface pl-4 pr-10 text-base text-fg placeholder:text-muted/70 focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text/40 aria-[invalid=true]:border-red-400"
      />
      <ChevronDown aria-hidden className={cn('pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted transition-transform', open && 'rotate-180')} />
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface-2 p-1 shadow-2xl"
        >
          {filtered.map((o, i) => (
            <li
              key={o.value}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              data-active={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void choose(i)}
              onMouseMove={() => setActive(i)}
              className={cn('flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-base', i === active && 'bg-accent/15', o.value === value && 'font-bold text-accent-text')}
            >
              <span className="truncate">{o.label}</span>
              {o.hint && <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted">{o.hint}</span>}
            </li>
          ))}
          {canCreate && (
            <li
              id={`${uid}-opt-${filtered.length}`}
              role="option"
              aria-selected={false}
              data-active={active === filtered.length}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void choose(filtered.length)}
              onMouseMove={() => setActive(filtered.length)}
              className={cn('flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-base font-bold text-accent-text', active === filtered.length && 'bg-accent/15')}
            >
              <Plus aria-hidden className="size-4" /> {busy ? 'Wird angelegt …' : `„${query.trim()}“ als neuen DJ anlegen`}
            </li>
          )}
          {count === 0 && <li role="presentation" className="px-3 py-3 text-sm text-muted">Kein DJ gefunden.</li>}
        </ul>
      )}
    </div>
  );
}
