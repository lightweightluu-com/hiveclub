import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { CalendarDays, Info as InfoIcon, Mail, Music2 } from 'lucide-react';
import { Instagram } from '@/components/BrandIcons';
import { Header } from '@/components/Header';
import { FloatingDock, type DockItem } from '@/components/magic/floating-dock';
import { Hero } from '@/sections/Hero';
import { Events } from '@/sections/Events';
import { Community } from '@/sections/Community';
import { About } from '@/sections/About';
import { Info } from '@/sections/Info';
import { Newsletter } from '@/sections/Newsletter';
import { Footer } from '@/sections/Footer';

const IDS = ['top', 'programm', 'community', 'info', 'newsletter'] as const;

function useActiveSection() {
  const [active, setActive] = useState<string>('top');
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    IDS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return active;
}

export default function App() {
  const active = useActiveSection();
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const dock: DockItem[] = [
    { id: 'programm', label: 'Programm', href: '#programm', icon: <CalendarDays />, active: active === 'programm' },
    { id: 'community', label: 'Community', href: '#community', icon: <Music2 />, active: active === 'community' },
    { id: 'info', label: 'Info', href: '#info', icon: <InfoIcon />, active: active === 'info' },
    { id: 'newsletter', label: 'Newsletter', href: '#newsletter', icon: <Mail />, active: active === 'newsletter' },
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/hive_club/', icon: <Instagram />, external: true }
  ];

  return (
    <>
      <a href="#programm" className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-bold text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Zum Inhalt springen
      </a>
      <motion.div aria-hidden style={{ scaleX: bar }} className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent" />
      <Header />
      <main>
        <Hero />
        <Events />
        <Community />
        <About />
        <Info />
        <Newsletter />
      </main>
      <Footer />
      <FloatingDock items={dock} />
    </>
  );
}
