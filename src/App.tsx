import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { CalendarDays, House, MapPin, Music2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { FloatingDock, type DockItem } from '@/components/magic/floating-dock';
import { Hero } from '@/sections/Hero';
import { Events } from '@/sections/Events';
import { Community } from '@/sections/Community';
import { About } from '@/sections/About';
import { Info } from '@/sections/Info';
import { Newsletter } from '@/sections/Newsletter';
import { Footer } from '@/sections/Footer';
import { EventDetail } from '@/sections/EventDetail';
import { eventIdFromPath, usePath } from '@/lib/router';

/** Dock-Ziel → Sektionen, die dazugehören (damit der Active-State auch in Unterabschnitten stimmt). */
const GROUPS: Record<string, string[]> = {
  top: ['top'],
  programm: ['programm'],
  community: ['community', 'raumvermietung', 'wohlfuehlen', 'about'],
  info: ['info', 'hausregeln', 'newsletter']
};

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>('top');
  useEffect(() => {
    if (!enabled) return;
    const owner = new Map<string, string>();
    Object.entries(GROUPS).forEach(([g, ids]) => ids.forEach((id) => owner.set(id, g)));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(owner.get(e.target.id) ?? 'top')),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    owner.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

export default function App() {
  const path = usePath();
  const eventId = eventIdFromPath(path);
  const active = useActiveSection(eventId === null);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const dock: DockItem[] = [
    { id: 'top', label: 'Home', href: '/', icon: <House />, active: eventId === null && active === 'top' },
    { id: 'programm', label: 'Programm', href: '/#programm', icon: <CalendarDays />, active: eventId === null && active === 'programm' },
    { id: 'community', label: 'Residents & Musik', href: '/#community', icon: <Music2 />, active: eventId === null && active === 'community' },
    { id: 'info', label: 'Club-Info', href: '/#info', icon: <MapPin />, active: eventId === null && active === 'info' }
  ];

  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-bold text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Zum Inhalt springen
      </a>
      <motion.div aria-hidden style={{ scaleX: bar }} className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent" />
      <Header />
      <main id="main" tabIndex={-1} key={eventId ?? 'home'} className="page-in outline-none">
        {eventId !== null ? (
          <EventDetail id={eventId} />
        ) : (
          <>
            <Hero />
            <Events />
            <Community />
            <About />
            <Info />
            <Newsletter />
          </>
        )}
      </main>
      <Footer />
      <FloatingDock items={dock} />
    </>
  );
}
