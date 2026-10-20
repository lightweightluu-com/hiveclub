import { Reveal } from './magic/text-reveal';

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 max-w-3xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent-text">{eyebrow}</p>
      <h2 className="text-display text-[clamp(2.5rem,9vw,6rem)]">{title}</h2>
      {children && <p className="mt-5 text-lg text-muted">{children}</p>}
    </Reveal>
  );
}
