import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, Flower2, Music2, Zap } from 'lucide-react';
import { imageUrl, type PublicEvent } from '@/lib/events-api';
import { useEvents } from '@/lib/use-events';
import { eventPath, handleLinkClick } from '@/lib/router';
import { GlowCard } from '@/components/magic/glow-card';
import { Badge } from '@/components/ui/badge';
import { SectionHead } from '@/components/SectionHead';
import { cn } from '@/lib/utils';
import { fmtDay, fmtMonth, fmtWeekday } from '@/lib/format';

const ICON = { club: Music2, wellness: Flower2, dance: Zap } as const;
/** Literale Klassen, damit Tailwind sie findet. */
const COLS: Record<number, string> = {
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6'
};

/** Füllt das 6-Spalten-Raster zeilenweise (sm = 2, lg = 3); die letzte Karte einer unvollständigen Zeile wächst auf die Restbreite. */
function layout(list: PublicEvent[]): number[] {
  const spans = list.map((e) => (e.size === 'lg' ? 3 : 2));
  let sum = 0;
  list.forEach((_, i) => {
    if (sum + spans[i] > 6) {
      spans[i - 1] += 6 - sum;
      sum = 0;
    }
    sum += spans[i];
  });
  if (list.length > 0) spans[list.length - 1] += 6 - sum;
  return spans;
}

function EventCard({ e, i, cols }: { e: PublicEvent; i: number; cols: number }) {
  const Icon = ICON[e.kind];
  const big = cols >= 3;
  return (
    <motion.li
      className={cn('list-none', COLS[cols])}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <GlowCard as="article" className={cn('flex h-full flex-col justify-between p-5 sm:p-6', big && 'min-h-80', e.featured && 'border-accent-text/50')}>
        {e.imageVersion != null && (
          <img
            src={imageUrl({ id: e.id, imageVersion: e.imageVersion })}
            alt=""
            loading="lazy"
            className="-mx-5 -mt-5 mb-5 aspect-video w-[calc(100%+2.5rem)] max-w-none object-cover sm:-mx-6 sm:-mt-6 sm:w-[calc(100%+3rem)]"
          />
        )}
        {e.featured && (
          <div aria-hidden className="absolute -right-10 -top-10 -z-10 size-48 rounded-full bg-violet/40 blur-3xl" />
        )}
        <div className="flex items-start justify-between gap-3">
          <time dateTime={e.start} className="flex items-baseline gap-2">
            <span className="font-display font-black text-5xl leading-none tabular-nums sm:text-6xl">{fmtDay(e.start)}</span>
            <span className="text-sm font-bold uppercase leading-tight text-accent-text">
              {fmtMonth(e.start)}<br /><span className="text-muted">{fmtWeekday(e.start).slice(0, 2)}</span>
            </span>
          </time>
          <div className="flex flex-wrap justify-end gap-1.5">
            {e.badge && <Badge className="border-accent-text/60 text-accent-text">{e.badge}</Badge>}
            <Badge><Icon className="size-3" /> {e.tag}</Badge>
          </div>
        </div>

        <div className="mt-8">
          <h3 className={cn('text-display', big ? 'text-4xl sm:text-5xl' : 'text-3xl')}>
            {/* Der Titel-Link deckt per ::after die ganze Karte ab (grosse Tippfläche, ein einziger Link pro Karte). */}
            <a href={eventPath(e.id)} onClick={handleLinkClick} className="after:absolute after:inset-0 after:z-10 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent-text">
              {e.title}
            </a>
          </h3>
          <p className="mt-3 max-w-md text-muted">{e.blurb}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold"><Clock className="size-4 text-accent-text" /> {e.timeLabel}</span>
            <span aria-hidden className="grid size-11 place-items-center rounded-full border border-line transition-colors group-hover/glow:border-accent-text group-hover/glow:bg-accent group-hover/glow:text-accent-fg">
              <ArrowUpRight className="size-5" />
            </span>
          </div>
        </div>
      </GlowCard>
    </motion.li>
  );
}

export function Events() {
  const events = useEvents();
  const spans = events ? layout(events) : [];
  return (
    <section id="programm" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <SectionHead eyebrow="Programm" title="Diese Woche im Hive">
        Donnerstags wird das Hive zum dihive. Freitag und Samstag gehören den grossen Nächten.
      </SectionHead>
      {events === null ? (
        <ul aria-busy="true" aria-label="Programm wird geladen" className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-72 animate-pulse list-none rounded-3xl border border-line bg-surface md:col-span-2" />
          ))}
        </ul>
      ) : events.length === 0 ? (
        <p className="rounded-3xl border border-line bg-surface p-8 text-lg text-muted">
          Aktuell sind keine Veranstaltungen eingetragen. Neues Programm folgt bald, am schnellsten erfährst du es auf{' '}
          <a href="https://www.instagram.com/hive_club/" target="_blank" rel="noreferrer noopener" className="font-semibold text-accent-text underline underline-offset-4">Instagram</a>.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {events.map((e, i) => <EventCard key={e.id} e={e} i={i} cols={spans[i]} />)}
        </ul>
      )}
      <p className="mt-8 text-sm text-muted">
        Tippe auf ein Event für Details. Neuigkeiten gibt es zuerst auf{' '}
        <a href="https://www.instagram.com/hive_club/" target="_blank" rel="noreferrer noopener" className="font-semibold text-accent-text underline underline-offset-4">Instagram</a>.
      </p>
    </section>
  );
}
