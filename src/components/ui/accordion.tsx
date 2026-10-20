import * as React from 'react';
import * as A from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = A.Root;

export const AccordionItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof A.Item>>(
  ({ className, ...props }, ref) => <A.Item ref={ref} className={cn('border-b border-line', className)} {...props} />
);
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof A.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <A.Header className="flex">
      <A.Trigger
        ref={ref}
        className={cn(
          'group flex min-h-14 flex-1 items-center justify-between gap-4 py-4 text-left text-lg font-bold transition-colors hover:text-accent-text',
          className
        )}
        {...props}
      >
        {children}
        <Plus className="size-5 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-45" />
      </A.Trigger>
    </A.Header>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof A.Content>>(
  ({ className, children, ...props }, ref) => (
    <A.Content
      ref={ref}
      className="overflow-hidden text-muted data-[state=closed]:animate-[acc-up_0.2s_ease-in] data-[state=open]:animate-[acc-down_0.25s_ease-out]"
      {...props}
    >
      <div className={cn('pb-5 leading-relaxed', className)}>{children}</div>
    </A.Content>
  )
);
AccordionContent.displayName = 'AccordionContent';
