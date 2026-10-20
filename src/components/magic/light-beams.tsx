import { cn } from '@/lib/utils';

const BEAMS = [
  { left: '12%', delay: '0s', rot: -14, h: '90%' },
  { left: '30%', delay: '1.4s', rot: -6, h: '80%' },
  { left: '52%', delay: '0.6s', rot: 4, h: '95%' },
  { left: '72%', delay: '2.1s', rot: 10, h: '85%' },
  { left: '88%', delay: '0.9s', rot: 16, h: '75%' }
];

/** Club-Laserstrahlen von oben (Aceternity „Background Beams“-Stil). */
export function LightBeams({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {BEAMS.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 w-px origin-top animate-beam"
          style={{
            left: b.left,
            height: b.h,
            animationDelay: b.delay,
            transform: `rotate(${b.rot}deg)`,
            background: 'linear-gradient(to bottom, var(--accent), transparent)',
            boxShadow: '0 0 18px 2px color-mix(in srgb, var(--accent) 45%, transparent)'
          }}
        />
      ))}
    </div>
  );
}
