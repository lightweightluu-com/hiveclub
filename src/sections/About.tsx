import { ArrowUpRight } from 'lucide-react';
import { SOCIALS } from '@/data/club';
import { Instagram } from '@/components/BrandIcons';
import { GlowCard } from '@/components/magic/glow-card';
import { Reveal } from '@/components/magic/text-reveal';
import { SectionHead } from '@/components/SectionHead';

const insta = SOCIALS.find((s) => s.id === 'instagram')!;

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <SectionHead eyebrow="About us" title="Morphing Clubbing">
        So nennt das Hive sein Konzept: Elektro, Techno, Techhouse und Deep House an der Geroldstrasse in Zürich West. Donnerstags gestalten die Residents die dihive-Nächte.
      </SectionHead>

      <Reveal>
        <GlowCard className="relative">
          <a
            href={insta.href}
            target="_blank"
            rel="noreferrer noopener"
            className="flex min-h-40 items-center justify-between gap-6 p-6 sm:p-10"
          >
            <div className="flex items-center gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-accent-fg"><Instagram className="size-6" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-text">Impressionen</p>
                <p className="mt-1 text-2xl font-extrabold sm:text-3xl">Die Nächte in Bildern: {insta.handle}</p>
              </div>
            </div>
            <ArrowUpRight className="size-7 shrink-0" aria-hidden />
          </a>
        </GlowCard>
      </Reveal>
    </section>
  );
}
