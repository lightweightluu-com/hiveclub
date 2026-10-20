import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, Flower2, Music2, Zap } from 'lucide-react';
import { EVENTS, SITE, type ClubEvent } from '@/data/club';
import { GlowCard } from '@/components/magic/glow-card';
import { Badge } from '@/components/ui/badge';
import { SectionHead } from '@/components/SectionHead';
import { cn } from '@/lib/utils';
import { fmtDay, fmtMonth, fmtWeekday } from '@/lib/format';

const ICON = { club: Music2, wellness: Flower2, dance: Zap } as const;
const SPAN: Record<string, string> = {
  'sync-hive': 'md:col-span-2',
  'shut-up-and-dance': 'md:col-span-2',
  'dihive-staatsparty': 'md:col-span-2',
  kiki: 'md:col-span-3',
  'denis-horvat-lazare': 'md:col-span-3'
};

function EventCard({ e, i }: { e: ClubEvent; i: number }) {
  const Icon = ICON[e.kind];
  const big = SPAN[e.id] === 'md:col-span-3';
  return (
    <motion.li
      className={cn('list-none', SPAN[e.id])}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <GlowCard as="article" className={cn('flex h-full flex-col justify-between p-5 sm:p-6', big && 'min-h-80', e.featured && 'border-accent-text/50')}>
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
          <h3 className={cn('text-display', big ? 'text-4xl sm:text-5xl' : 'text-3xl')}>{e.title}</h3>
          <p className="mt-3 max-w-md text-muted">{e.blurb}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold"><Clock className="size-4 text-accent-text" /> {e.timeLabel}</span>
            <a
              href={SITE}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Infos zu ${e.title} auf hiveclub.ch`}
              className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-accent-text hover:bg-accent hover:text-accent-fg"
            >
              <ArrowUpRight className="size-5" />
            </a>
          </div>
        </div>
      </GlowCard>
    </motion.li>
  );
}

export function Events() {
  const sorted = [...EVENTS].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  return (
    <section id="programm" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <SectionHead eyebrow="Programm" title="Diese Woche im Hive">
        Donnerstags wird das Hive zum dihive. Freitag und Samstag gehören den grossen Nächten.
      </SectionHead>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {sorted.map((e, i) => <EventCard key={e.id} e={e} i={i} />)}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Das vollständige Programm mit Line-ups findest du auf{' '}
        <a href={SITE} target="_blank" rel="noreferrer noopener" className="font-semibold text-accent-text underline underline-offset-4">hiveclub.ch</a>.
      </p>
    </section>
  );
}
