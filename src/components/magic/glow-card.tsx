import { useRef } from 'react';
import { cn } from '@/lib/utils';

/** Karte mit zeigergesteuertem Spotlight-Rand (Magic UI „Magic Card“). */
export function GlowCard({
  className,
  children,
  as: Tag = 'div',
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'article' | 'li' }) {
  const ref = useRef<HTMLElement>(null);
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={ref as any}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty('--gx', `${e.clientX - r.left}px`);
        ref.current!.style.setProperty('--gy', `${e.clientY - r.top}px`);
      }}
      className={cn(
        'group/glow relative isolate overflow-hidden rounded-3xl border border-line bg-surface transition-transform duration-200 ease-out hover:-translate-y-1',
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
        style={{
          background:
            'radial-gradient(360px circle at var(--gx,50%) var(--gy,50%), color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%)'
        }}
      />
      {children}
    </Tag>
  );
}
