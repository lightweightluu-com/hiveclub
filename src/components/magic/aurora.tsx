import { cn } from '@/lib/utils';

const blob = (c: string) => `radial-gradient(closest-side, color-mix(in srgb, ${c} 38%, transparent), transparent)`;

/** Gradient-Mesh aus drei Farbblobs. Radial-Gradients statt blur()-Filter: auf iOS ein Vielfaches günstiger. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -left-1/4 -top-1/4 size-[80vmax] animate-aurora will-change-transform" style={{ background: blob('var(--violet)') }} />
      <div
        className="absolute -right-1/3 top-1/4 size-[70vmax] animate-aurora will-change-transform"
        style={{ background: blob('var(--blue)'), animationDirection: 'alternate-reverse', animationDuration: '23s' }}
      />
      <div
        className="absolute bottom-[-35%] left-1/4 size-[60vmax] animate-aurora will-change-transform"
        style={{ background: blob('var(--accent)'), animationDuration: '27s' }}
      />
    </div>
  );
}
