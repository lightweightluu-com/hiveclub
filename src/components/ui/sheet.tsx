import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

/** Vollhohes Drawer-Panel von rechts (shadcn-Sheet). */
export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-[fade-in_0.25s_ease-out] data-[state=closed]:animate-[fade-out_0.15s_ease-in]" />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col border-l border-line bg-bg p-6 pt-safe shadow-2xl data-[state=open]:animate-[slide-in_0.3s_cubic-bezier(.2,.8,.2,1)] data-[state=closed]:animate-[slide-out_0.18s_ease-in]',
        className
      )}
      {...props}
    >
      {children}
      <Dialog.Close
        aria-label="Menü schliessen"
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent-text hover:text-accent-text"
      >
        <X className="size-5" />
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
));
SheetContent.displayName = 'SheetContent';
