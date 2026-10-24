import { Disc3, Flower2, Heart, Key, UtensilsCrossed } from 'lucide-react';
import { ADDRESS, SERIES, SISTER_PROJECTS, WELLNESS } from '@/data/club';
import { useResidents } from '@/lib/use-events';
import { GlowCard } from '@/components/magic/glow-card';
import { Marquee } from '@/components/magic/marquee';
import { Reveal } from '@/components/magic/text-reveal';
import { SectionHead } from '@/components/SectionHead';
import { Button } from '@/components/ui/button';

export function Community() {
  const loaded = useResidents();
  const residents = loaded ?? [];
  const half = Math.ceil(residents.length / 2);
  // Kurze Listen für das Band auffüllen, damit es nicht leer läuft (nur optisch, die Namen stehen einmal im Text).
  const fill = (list: string[]) => (list.length === 0 ? list : Array.from({ length: Math.max(1, Math.ceil(8 / list.length)) }, () => list).flat());
  return (
    <>
      <section id="community" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="Community" title="Residents & Reihen">
            Die Donnerstage gestalten unsere Residents – monatlich, mit eigener Handschrift. Dazu kommen Labels und Partys, die das Hive zu ihrem Wohnzimmer machen.
          </SectionHead>
        </div>

        {loaded === null && <div aria-hidden className="mx-auto h-[10.5rem] max-w-7xl animate-pulse rounded-3xl bg-surface/60 px-4 sm:px-6" />}
        {residents.length > 0 && (
          <div className="space-y-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            {[residents.slice(0, half), residents.slice(half)].filter((row) => row.length > 0).map((row, r) => (
              <Marquee key={r} reverse={r === 1} duration={55 + r * 10}>
                {fill(row).map((n, k) => (
                  <span key={`${n}-${k}`} className="whitespace-nowrap rounded-full border border-line bg-surface px-5 py-3 font-display font-black text-xl uppercase tracking-tight transition-colors hover:border-accent-text hover:text-accent-text sm:text-3xl">
                    {n}
                  </span>
                ))}
              </Marquee>
            ))}
          </div>
        )}
        <p className="sr-only">Residents: {residents.join(', ')}</p>

        <ul className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {SERIES.map((s, i) => (
            <Reveal key={s.name} delay={(i % 4) * 0.06}>
              <GlowCard as="li" className="h-full list-none p-5">
                <Disc3 className="mb-6 size-6 text-accent-text" aria-hidden />
                <h3 className="text-xl font-extrabold">{s.name}</h3>
                <p className="mt-1 text-sm font-bold uppercase tracking-wider text-accent-text">{s.when}</p>
                <p className="mt-2 text-sm text-muted">{s.note}</p>
              </GlowCard>
            </Reveal>
          ))}
        </ul>
      </section>

      <section id="raumvermietung" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <GlowCard className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent-text"><Key className="size-4" /> Raumvermietung</p>
              <h2 className="text-display text-[clamp(2.2rem,7vw,4.5rem)]">Das Hive gehört dir.</h2>
              <p className="mt-4 max-w-xl text-lg text-muted">
                Das Hive kann privat oder als Firma gemietet werden.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Button asChild size="default"><a href={ADDRESS.phoneHref}>Anfrage per Telefon</a></Button>
              <Button asChild variant="outline"><a href="#info">Kontakt & Adresse</a></Button>
            </div>
          </GlowCard>
        </Reveal>
      </section>

      <section id="wohlfuehlen" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead eyebrow="Wohlfühlen im Hive" title="Mehr als Nacht">
          Bewegung, Essen und Gemeinschaft – bevor und nachdem die Bässe übernehmen.
        </SectionHead>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {WELLNESS.map((w, i) => {
            const Icon = [Flower2, Heart, UtensilsCrossed][i];
            return (
              <Reveal key={w.title} delay={i * 0.08}>
                <GlowCard as="li" className="h-full list-none p-6">
                  <Icon className="mb-8 size-7 text-accent-text" aria-hidden />
                  <h3 className="text-2xl font-extrabold">{w.title}</h3>
                  <p className="mt-2 text-muted">{w.text}</p>
                </GlowCard>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 text-sm text-muted">Schwesterprojekte: {SISTER_PROJECTS.join(' · ')}</p>
      </section>
    </>
  );
}
