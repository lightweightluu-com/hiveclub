import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';

export type DockItem = { id: string; label: string; href: string; icon: React.ReactNode; external?: boolean; active?: boolean };

function DockIcon({ mouseX, item }: { mouseX: MotionValue<number>; item: DockItem }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const dist = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    return x - (b ? b.x + b.width / 2 : -1000);
  });
  const size = useSpring(useTransform(dist, [-120, 0, 120], [48, 68, 48]), { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <motion.a
      ref={ref}
      href={item.href}
      aria-label={item.label}
      aria-current={item.active ? 'true' : undefined}
      {...(item.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      style={{ width: size, height: size }}
      className={`group/d relative grid aspect-square place-items-center rounded-full border text-fg transition-colors ${
        item.active ? 'border-accent-text bg-accent text-accent-fg' : 'border-line bg-surface-2/80 hover:border-accent-text'
      }`}
    >
      <span className="[&_svg]:size-5">{item.icon}</span>
      <span className="pointer-events-none absolute -top-9 hidden whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold opacity-0 transition-opacity group-hover/d:opacity-100 md:block">
        {item.label}
      </span>
    </motion.a>
  );
}

/** macOS-artiges Dock; auf Touch ohne Vergrösserung, aber mit 48-px-Zielen. */
export function FloatingDock({ items }: { items: DockItem[] }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <nav aria-label="Schnellnavigation" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-safe">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, type: 'spring', stiffness: 200, damping: 22 }}
        className="pointer-events-auto flex h-[72px] items-end gap-3 rounded-full border border-line bg-bg/70 px-3 pb-3 backdrop-blur-xl"
      >
        {items.map((it) => (
          <DockIcon key={it.id} mouseX={mouseX} item={it} />
        ))}
      </motion.div>
    </nav>
  );
}
