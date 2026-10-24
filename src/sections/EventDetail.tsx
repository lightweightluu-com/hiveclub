import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CalendarPlus, Check, Clock, Flower2, MapPin, Music2, Navigation, Share2, Star, Ticket, Zap } from 'lucide-react';
import { ADDRESS } from '@/data/club';
import { HexMark } from '@/components/Logo';
import { GlowCard } from '@/components/magic/glow-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildIcs } from '@/lib/ics';
import { imageUrl, type PublicEvent } from '@/lib/events-api';
import { fmtDay, fmtLongDate, fmtMonth } from '@/lib/format';
import { eventPath, handleLinkClick } from '@/lib/router';
import { useEvents } from '@/lib/use-events';

const ICON = { club: Music2, wellness: Flower2, dance: Zap } as const;
const KIND = { club: 'Club', wellness: 'Wellness', dance: 'Tanzen' } as const;
const TITLE = 'Hive Club Zürich';
const PLACE = `${ADDRESS.name}, ${ADDRESS.street}, ${ADDRESS.city}`;

function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const before = { title: document.title, desc: desc?.content };
    document.title = title;
    if (desc && description) desc.content = description;
    return () => {
      document.title = before.title;
      if (desc && before.desc !== undefined) desc.content = before.desc;
    };
  }, [title, description]);
}

function BackLink() {
  return (
    <a href="/#programm" onClick={handleLinkClick} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted transition-colors hover:text-accent-text">
      <ArrowLeft aria-hidden className="size-4" /> Zum Programm
    </a>
  );
}

function NotFound() {
  usePageMeta(`Event nicht gefunden – ${TITLE}`);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
      <BackLink />
      <h1 className="text-display mt-6 text-[clamp(2.5rem,9vw,5rem)]">Dieses Event gibt es nicht mehr.</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">Der Link ist veraltet, oder das Event wurde vom Programm genommen. Alle aktuellen Events findest du im Programm.</p>
      <Button asChild className="mt-8"><a href="/#programm" onClick={handleLinkClick}>Zum Programm</a></Button>
    </div>
  );
}

function Detail({ e, others }: { e: PublicEvent; others: PublicEvent[] }) {
  const Icon = ICON[e.kind];
  const url = `${location.origin}${eventPath(e.id)}`;
  const [copied, setCopied] = useState(false);
  usePageMeta(`${e.title} – ${TITLE}`, e.blurb);

  function downloadIcs() {
    const blob = new Blob([buildIcs(e, url, PLACE)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: e.title, text: e.blurb, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* Teilen abgebrochen oder Zwischenablage gesperrt: nichts Weiteres nötig */
    }
  }

  const paragraphs = (e.details ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6">
      <BackLink />

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
        {e.imageVersion != null ? (
          <img src={imageUrl({ id: e.id, imageVersion: e.imageVersion })} alt={`Flyer: ${e.title}`} className="aspect-video w-full object-cover" />
        ) : (
          <div aria-hidden className="relative grid aspect-[21/9] place-items-center overflow-hidden bg-surface-2">
            <HexMark className="absolute -right-10 -top-10 size-72 text-accent-text/20" />
            <HexMark className="absolute -bottom-16 left-10 size-56 text-accent-text/10" />
            <div className="relative grid size-24 place-items-center rounded-3xl bg-accent text-accent-fg">
              <div className="text-center leading-none">
                <div className="font-display font-black text-4xl">{fmtDay(e.start)}</div>
                <div className="mt-1 text-xs font-bold uppercase">{fmtMonth(e.start)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          {e.badge && <Badge className="border-accent-text/60 text-accent-text">{e.badge}</Badge>}
          <Badge><Icon className="size-3" /> {KIND[e.kind]}</Badge>
          {e.tag && <Badge>{e.tag}</Badge>}
        </div>
        <h1 className="text-display mt-4 text-[clamp(2.5rem,9vw,5.5rem)]">{e.title}</h1>
        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-lg font-bold">
          <time dateTime={e.start}>{fmtLongDate(e.start)}</time>
          <span className="inline-flex items-center gap-1.5"><Clock aria-hidden className="size-5 text-accent-text" /> {e.timeLabel}</span>
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        {e.link && (
          <Button asChild>
            <a href={e.link} target="_blank" rel="noreferrer noopener"><Ticket /> Tickets &amp; Infos</a>
          </Button>
        )}
        <Button variant="outline" onClick={downloadIcs}><CalendarPlus /> Zum Kalender</Button>
        <Button variant="outline" onClick={share}>{copied ? <Check /> : <Share2 />} {copied ? 'Link kopiert' : 'Teilen'}</Button>
      </div>
      <p role="status" className="sr-only">{copied ? 'Link in die Zwischenablage kopiert.' : ''}</p>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr]">
        <div className="max-w-prose">
          <p className="text-xl leading-relaxed">{e.blurb}</p>
          {paragraphs.map((p, i) => <p key={i} className="mt-5 leading-relaxed text-muted">{p}</p>)}
          {e.lineup && e.lineup.length > 0 && (
            <section aria-labelledby="lineup" className="mt-10">
              <h2 id="lineup" className="text-display text-3xl">Line-up</h2>
              <ol className="mt-5 divide-y divide-line border-y border-line">
                {e.lineup.map((l, i) => (
                  <li key={`${l.name}-${l.time}-${i}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5">
                    <span className="w-16 shrink-0 font-display font-black text-lg tabular-nums text-accent-text">{l.time || '–'}</span>
                    <span className="min-w-0 text-xl font-extrabold">{l.name}</span>
                    {l.resident && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent-text px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-text">
                        <Star aria-hidden className="size-3" /> Resident
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {e.tags.length > 0 && (
            <ul aria-label="Stichwörter" className="mt-8 flex flex-wrap gap-2">
              {e.tags.map((t) => (
                <li key={t} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{t}</li>
              ))}
            </ul>
          )}
        </div>

        <GlowCard className="h-fit p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold"><MapPin aria-hidden className="size-5 text-accent-text" /> Ort</h2>
          <address className="mt-3 not-italic text-muted">
            <span className="font-bold text-fg">{ADDRESS.name}</span><br />{ADDRESS.street}<br />{ADDRESS.city}
          </address>
          <Button asChild size="sm" className="mt-5 w-full justify-center">
            <a href={ADDRESS.map} target="_blank" rel="noreferrer noopener"><Navigation /> Route</a>
          </Button>
        </GlowCard>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="more-events" className="mt-16 border-t border-line pt-10">
          <h2 id="more-events" className="text-display text-3xl">Weitere Events</h2>
          <ul className="mt-6 grid grid-cols-1 gap-3">
            {others.map((o) => (
              <li key={o.id}>
                <a href={eventPath(o.id)} onClick={handleLinkClick} className="group flex min-h-16 items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent-text">
                  <time dateTime={o.start} className="grid size-14 shrink-0 place-items-center rounded-xl bg-surface-2 text-center leading-none">
                    <span>
                      <span className="block font-display font-black text-xl">{fmtDay(o.start)}</span>
                      <span className="block text-[10px] font-bold uppercase text-muted">{fmtMonth(o.start)}</span>
                    </span>
                  </time>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{o.title}</span>
                    <span className="block text-sm text-muted">{o.timeLabel}</span>
                  </span>
                  <ArrowUpRight aria-hidden className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export function EventDetail({ id }: { id: string }) {
  const events = useEvents();
  if (events === null) {
    return (
      <div aria-busy="true" aria-label="Event wird geladen" className="mx-auto max-w-4xl px-4 pt-28 sm:px-6">
        <div className="aspect-video animate-pulse rounded-3xl border border-line bg-surface" />
        <div className="mt-8 h-16 w-2/3 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }
  const event = events.find((e) => e.id === id);
  if (!event) return <NotFound />;
  const now = Date.now();
  const rest = events.filter((e) => e.id !== id);
  const upcoming = rest.filter((e) => +new Date(e.start) >= now);
  return <Detail key={event.id} e={event} others={(upcoming.length ? upcoming : rest).slice(0, 3)} />;
}
