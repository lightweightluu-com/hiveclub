import { cn } from '@/lib/utils';

/** Animiertes Gradient-Mesh aus drei verschobenen Farbblobs. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -left-1/4 -top-1/4 size-[70vmax] animate-aurora rounded-full bg-violet/40 blur-[110px] will-change-transform" />
      <div
        className="absolute -right-1/4 top-1/4 size-[60vmax] animate-aurora rounded-full bg-blue/25 blur-[120px] will-change-transform"
        style={{ animationDirection: 'alternate-reverse', animationDuration: '23s' }}
      />
      <div
        className="absolute bottom-[-30%] left-1/4 size-[50vmax] animate-aurora rounded-full bg-accent/15 blur-[130px] will-change-transform"
        style={{ animationDuration: '27s' }}
      />
    </div>
  );
}
