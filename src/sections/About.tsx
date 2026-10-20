import { motion } from 'framer-motion';
import { SectionHead } from '@/components/SectionHead';

// Platzhalter-Kacheln, bis echte Fotos vorliegen.
const TILES = [
  { cap: 'Main Floor', from: 'var(--violet)', to: 'var(--blue)', span: 'sm:col-span-2 sm:row-span-2' },
  { cap: 'Zwei Dancefloors', from: 'var(--accent)', to: 'var(--violet)', span: '' },
  { cap: 'Dancefloor 2', from: 'var(--blue)', to: 'var(--accent)', span: '' },
  { cap: 'Lichtshow', from: 'var(--violet)', to: 'var(--accent)', span: 'sm:col-span-2' },
  { cap: 'Bar', from: 'var(--accent)', to: 'var(--blue)', span: '' },
  { cap: 'Sunrise', from: 'var(--blue)', to: 'var(--violet)', span: '' }
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <SectionHead eyebrow="About us · Impressionen" title="Morphing Clubbing">
        Das Hive liegt an der Geroldstrasse in Zürich West. Mit Elektro, Techno, Techhouse und Deep House verwandelt sich der Raum von Nacht zu Nacht – mal Yoga-Studio, mal Tanzmarathon, mal Dancefloor bis in den Morgen.
      </SectionHead>

      <ul className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:grid-cols-4">
        {TILES.map((t, i) => (
          <motion.li
            key={t.cap}
            className={`group relative list-none overflow-hidden rounded-3xl border border-line ${t.span}`}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-70 transition-transform duration-500 ease-out group-hover:scale-110"
              style={{ background: `radial-gradient(circle at 30% 20%, ${t.from}, transparent 60%), radial-gradient(circle at 80% 90%, ${t.to}, transparent 55%), var(--surface)` }}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-4 text-sm font-bold uppercase tracking-widest text-white">{t.cap}</span>
          </motion.li>
        ))}
      </ul>

    </section>
  );
}
