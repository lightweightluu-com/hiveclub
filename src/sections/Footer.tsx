import { ArrowUp, Music } from 'lucide-react';
import { Facebook, Instagram } from '@/components/BrandIcons';
import { ADDRESS, NAV, SISTER_PROJECTS, SOCIALS } from '@/data/club';
import { HexMark } from '@/components/Logo';

const ICONS = { instagram: Instagram, facebook: Facebook, soundcloud: Music } as const;

export function Footer() {
  return (
    <footer className="border-t border-line pb-32 pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display font-black text-3xl uppercase"><HexMark className="size-10 text-accent-text" /> Hive</div>
          <address className="mt-4 text-sm not-italic text-muted">{ADDRESS.name}<br />{ADDRESS.street}, {ADDRESS.city}<br /><a href={ADDRESS.phoneHref} className="hover:text-fg">{ADDRESS.phone}</a></address>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={n.href} {...('external' in n ? { target: '_blank', rel: 'noreferrer noopener' } : {})} className="inline-flex min-h-9 items-center text-sm font-semibold text-muted hover:text-fg">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <ul className="flex gap-2">
            {SOCIALS.map((s) => {
              const Icon = ICONS[s.id];
              return (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noreferrer noopener" aria-label={`${s.label}: ${s.handle}`} className="grid size-12 place-items-center rounded-full border border-line transition-colors hover:border-accent-text hover:bg-accent hover:text-accent-fg">
                    <Icon className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted">Schwesterprojekte: {SISTER_PROJECTS.join(' · ')}</p>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl items-center justify-between gap-4 px-4 text-xs text-muted sm:px-6">
        <p>© 2025 created by Unwiderstehlich · Hive, Katakombe GmbH</p>
        <a href="#top" aria-label="Nach oben" className="grid size-11 place-items-center rounded-full border border-line hover:border-accent-text"><ArrowUp className="size-4" /></a>
      </div>
    </footer>
  );
}
