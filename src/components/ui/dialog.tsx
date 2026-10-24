import * as React from 'react';
import * as D from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;

/** Zentriertes Bestätigungs-Modal (shadcn-Dialog): Fokus-Trap, Esc schliesst, Fokus kehrt zum Auslöser zurück. */
export const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof D.Content>>(
  ({ className, children, ...props }, ref) => (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-[fade-in_0.2s_ease-out]" />
      <D.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-surface-2 p-6 shadow-2xl data-[state=open]:animate-[fade-in_0.2s_ease-out]',
          className
        )}
        {...props}
      >
        {children}
      </D.Content>
    </D.Portal>
  )
);
DialogContent.displayName = 'DialogContent';
