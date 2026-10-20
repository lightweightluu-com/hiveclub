import { motion } from 'framer-motion';
import { ArrowDown, CalendarDays, MapPin } from 'lucide-react';
import { EVENTS } from '@/data/club';
import { Aurora } from '@/components/magic/aurora';
import { HexField } from '@/components/magic/hex-field';
import { LightBeams } from '@/components/magic/light-beams';
import { Marquee } from '@/components/magic/marquee';
import { TextReveal } from '@/components/magic/text-reveal';
import { Countdown } from '@/components/Countdown';
import { HexMark } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { fmtDay, fmtMonth, fmtWeekday } from '@/lib/format';

export function nextEvent(now = Date.now()) {
  const sorted = [...EVENTS].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  return sorted.find((e) => +new Date(e.start) > now) ?? sorted[sorted.length - 1];
}

export function Hero() {
  const ev = nextEvent();

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <Aurora />
      <HexField />
      <LightBeams />
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute -right-40 top-1/2 hidden size-[46rem] -translate-y-1/2 text-accent-text/25 lg:block"
      >
        <HexMark className="size-full" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--bg)_85%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-44 pt-24 sm:px-6">
        <p
          style={{ ['--d' as string]: '0.1s' }}
          className="hero-in mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent-text sm:text-sm"
        >
          <MapPin className="size-4" /> Zürich West · Geroldstrasse 5
        </p>

        <h1 className="text-display text-[clamp(5rem,min(28vw,24vh),16rem)] text-fg">
          <TextReveal text="HIVE" delay={0.15} />
          <span className="block text-[clamp(1.05rem,5.6vw,3.75rem)] tracking-[-0.02em] text-accent-text">
            <TextReveal text="Morphing Clubbing" delay={0.4} />
          </span>
        </h1>

        <p
          style={{ ['--d' as string]: '0.7s' }}
          className="hero-in mt-6 max-w-xl text-lg text-muted sm:text-xl"
        >
          Elektro, Techno, Techhouse und Deep House in Zürich West.
        </p>

        <div
          style={{ ['--d' as string]: '0.85s' }}
          className="hero-in mt-8 flex flex-col gap-6 lg:flex-row lg:items-end"
        >
          <a
            href="#programm"
            className="group block w-full max-w-md rounded-3xl border border-line bg-surface/85 p-5 transition-colors hover:border-accent-text"
          >
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-text">
              <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-accent" /></span>
              Als Nächstes
            </p>
            <div className="flex items-center gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent text-accent-fg">
                <div className="text-center leading-none">
                  <div className="font-display font-black text-2xl">{fmtDay(ev.start)}</div>
                  <div className="text-[11px] font-bold uppercase">{fmtMonth(ev.start)}</div>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-extrabold">{ev.title}</h2>
                <p className="text-sm text-muted">{fmtWeekday(ev.start)} · {ev.timeLabel}</p>
              </div>
            </div>
            <div className="mt-4"><Countdown to={ev.start} /></div>
          </a>

          <div className="flex flex-wrap gap-3">
            <Button asChild><a href="#programm"><CalendarDays /> Programm</a></Button>
            <Button asChild variant="outline"><a href="#info"><MapPin /> Anfahrt</a></Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-y border-line bg-bg/80 py-3">
        <Marquee duration={30}>
          {['Techno', 'House', 'Techhouse', 'Deep House', 'Elektro', 'Morphing Clubbing', 'Do · Fr · Sa'].map((w) => (
            <span key={w} className="flex items-center gap-8 pr-8 font-display font-black text-2xl uppercase tracking-tight text-fg/80">
              {w} <span aria-hidden className="text-accent-text">⬡</span>
            </span>
          ))}
        </Marquee>
      </div>
      <a href="#programm" aria-label="Zum Programm scrollen" className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 text-muted md:block">
        <ArrowDown className="size-6 animate-bounce" />
      </a>
    </section>
  );
}
