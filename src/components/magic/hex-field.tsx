import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/** Wabenmuster (Hive!) als Maske – so lässt sich die Linienfarbe per CSS-Token steuern. */
const HEX = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='97'><g fill='none' stroke='black' stroke-width='1.2'><path d='M28 66L0 50V16L28 0l28 16v34L28 66z'/><path d='M28 66v31M0 50v32M56 50v32'/></g></svg>`
)}")`;

export function HexField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const spot = 'radial-gradient(280px circle at var(--mx, 50%) var(--my, 40%), #000, transparent 70%)';
  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      <div className="hex-breathe absolute inset-0 bg-[var(--hex)]" style={{ WebkitMaskImage: HEX, maskImage: HEX }} />
      {/* Ambient-Glow: wandert langsam über das Raster, auch ohne Zeiger (Touch). */}
      <div
        className="hex-drift absolute -inset-[15%] bg-accent will-change-transform"
        style={{
          WebkitMaskImage: `${HEX}, radial-gradient(closest-side at 50% 45%, #000, transparent 75%)`,
          maskImage: `${HEX}, radial-gradient(closest-side at 50% 45%, #000, transparent 75%)`,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect'
        }}
      />
      <div
        className="absolute inset-0 bg-accent"
        style={{
          WebkitMaskImage: `${HEX}, ${spot}`,
          maskImage: `${HEX}, ${spot}`,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect'
        }}
      />
    </div>
  );
}
