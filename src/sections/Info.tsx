import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, Navigation, Phone } from 'lucide-react';
import { ADDRESS, HOURS, RULES } from '@/data/club';
import { GlowCard } from '@/components/magic/glow-card';
import { Reveal } from '@/components/magic/text-reveal';
import { SectionHead } from '@/components/SectionHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function zurichNow() {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { dow, min: (+get('hour') % 24) * 60 + +get('minute') };
}

/** Öffnungszeiten laufen über Mitternacht: Do 23:00 bis Fr 04:00 etc. */
function openToday(): number | null {
  const { dow, min } = zurichNow();
  const ends = { 4: 4 * 60, 5: 7 * 60, 6: 9 * 60 } as Record<number, number>; // Ende am Folgetag, Minuten nach Mitternacht
  if (ends[dow] !== undefined && min >= 23 * 60) return dow;
  const prev = (dow + 6) % 7;
  if (ends[prev] !== undefined && min < ends[prev]) return prev;
  return null;
}

export function Info() {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    setOpen(openToday());
    const t = setInterval(() => setOpen(openToday()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="info" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <SectionHead eyebrow="Club-Info" title="Hier findest du uns" />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Reveal>
            <GlowCard className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-extrabold">Öffnungszeiten</h3>
                <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest', open !== null ? 'border-accent-text text-accent-text' : 'border-line text-muted')}>
                  <span aria-hidden className={cn('size-2 rounded-full', open !== null ? 'bg-accent' : 'bg-muted')} />
                  {open !== null ? 'Jetzt offen' : 'Geschlossen'}
                </span>
              </div>
              <ul className="divide-y divide-line">
                {HOURS.map((h) => (
                  <li key={h.day} className={cn('flex items-center justify-between py-3', open === h.dow && 'text-accent-text')}>
                    <span className="font-bold">{h.day}</span>
                    <span className="font-display font-black text-lg tabular-nums">{h.time}</span>
                  </li>
                ))}
              </ul>
            </GlowCard>
          </Reveal>

          <Reveal delay={0.08}>
            <GlowCard className="p-6">
              <h3 className="mb-4 text-xl font-extrabold">Adresse & Kontakt</h3>
              <address className="not-italic">
                <p className="font-bold">{ADDRESS.name}</p>
                <p className="text-muted">{ADDRESS.street}<br />{ADDRESS.city}</p>
              </address>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="sm"><a href={ADDRESS.map} target="_blank" rel="noreferrer noopener"><Navigation /> Route</a></Button>
                <Button asChild size="sm" variant="outline"><a href={ADDRESS.phoneHref}><Phone /> {ADDRESS.phone}</a></Button>
              </div>
            </GlowCard>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <GlowCard className="h-full min-h-80 p-0">
            <iframe
              title="Karte: Hive, Geroldstrasse 5, Zürich"
              src={ADDRESS.embed}
              loading="lazy"
              className="absolute inset-0 size-full border-0 dark:[filter:grayscale(1)_invert(0.92)_hue-rotate(180deg)_contrast(0.9)]"
            />
            <a
              href={ADDRESS.map}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-bg/90 px-3 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur"
            >
              <MapPin className="size-4 text-accent-text" /> Grosse Karte <ExternalLink className="size-3" />
            </a>
          </GlowCard>
        </Reveal>
      </div>

      <div id="hausregeln" className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent-text">House Rules</p>
          <h2 className="text-display text-[clamp(2.2rem,7vw,4.5rem)]">Gut zueinander.</h2>
          <p className="mt-4 text-muted">Damit alle die Nacht geniessen können.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible defaultValue="r0">
            {RULES.map((r, i) => (
              <AccordionItem key={r.q} value={`r${i}`}>
                <AccordionTrigger>{r.q}</AccordionTrigger>
                <AccordionContent>{r.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
