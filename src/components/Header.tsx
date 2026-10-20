import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Menu } from 'lucide-react';
import { NAV, SOCIALS } from '@/data/club';
import { HexMark } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from './ui/sheet';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-40 pt-safe transition-[background-color,border-color] duration-300 ${
        scrolled ? 'border-b border-line bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-tight" aria-label="Hive Club Zürich – nach oben">
          <HexMark className="size-8 text-accent-text" />
          Hive
        </a>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 xl:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={n.href}
              {...('external' in n ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-fg"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger
            aria-label="Menü öffnen"
            className="grid size-11 place-items-center rounded-full border border-line bg-surface/60 backdrop-blur transition-colors hover:border-accent-text xl:hidden"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="font-display font-black text-2xl uppercase">Menü</SheetTitle>
            <SheetDescription className="sr-only">Navigation und Social Links</SheetDescription>
            <ul className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
              {NAV.map((n, i) => (
                <li key={n.id}>
                  <SheetClose asChild>
                    <motion.a
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      href={n.href}
                      {...('external' in n ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                      className="flex min-h-12 items-center justify-between border-b border-line text-xl font-bold hover:text-accent-text"
                    >
                      {n.label}
                      {'external' in n && <ArrowUpRight className="size-5" />}
                    </motion.a>
                  </SheetClose>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-6">
              {SOCIALS.map((s) => (
                <a key={s.id} href={s.href} target="_blank" rel="noreferrer noopener" className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-accent-text hover:text-accent-text">
                  {s.label}
                </a>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
