import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, CalendarDays, MapPin } from 'lucide-react';
import { useRef } from 'react';
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const ev = nextEvent();

  return (
    <section id="top" ref={ref} className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden">
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

      <motion.div style={{ y, opacity: fade }} className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-44 pt-24 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent-text sm:text-sm"
        >
          <MapPin className="size-4" /> Zürich West · Geroldstrasse 5
        </motion.p>

        <h1 className="text-display text-[clamp(5rem,min(28vw,24vh),16rem)] text-fg">
          <TextReveal text="HIVE" delay={0.35} />
          <span className="block bg-gradient-to-r from-accent via-violet to-blue bg-clip-text text-[0.28em] tracking-[-0.02em] text-transparent">
            <TextReveal text="Morphing Clubbing" delay={0.8} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-6 max-w-xl text-lg text-muted sm:text-xl"
        >
          Elektro, Techno, Techhouse und Deep House – in einem Club, der sich jede Nacht neu erfindet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end"
        >
          <a
            href="#programm"
            className="group block w-full max-w-md rounded-3xl border border-line bg-surface/60 p-5 backdrop-blur-xl transition-colors hover:border-accent-text"
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
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 border-y border-line bg-bg/60 py-3 backdrop-blur">
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
