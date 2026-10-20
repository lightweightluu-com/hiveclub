import { cn } from '@/lib/utils';

export function Marquee({
  children,
  className,
  reverse,
  duration = 40
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div
      className={cn('group flex overflow-hidden [--marquee-gap:0.5rem]', className)}
      style={{ ['--marquee-duration' as string]: `${duration}s` }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            'flex min-w-full shrink-0 animate-marquee items-center justify-around gap-[--marquee-gap] pr-[--marquee-gap] group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]'
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
