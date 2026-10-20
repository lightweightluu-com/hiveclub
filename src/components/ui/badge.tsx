import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-line bg-surface/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-fg',
        className
      )}
      {...props}
    />
  );
}
