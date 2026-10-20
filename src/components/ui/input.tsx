import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-fg placeholder:text-muted/70 transition-colors focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text/40 aria-[invalid=true]:border-red-400',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
