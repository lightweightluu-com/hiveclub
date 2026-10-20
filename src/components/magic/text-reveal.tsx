import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Buchstaben fahren gestaffelt aus einer Maske hoch. */
export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = 'span'
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: 'span' | 'h1' | 'h2';
}) {
  return (
    <Tag className={cn('inline-flex flex-wrap', className)} aria-label={text}>
      {text.split(' ').map((word, w, words) => {
        const offset = words.slice(0, w).join(' ').length + (w ? 1 : 0);
        return (
          <span key={w} aria-hidden className="inline-flex whitespace-nowrap">
            {Array.from(word).map((ch, i) => (
              <span
                key={i}
                className="letter-in"
                style={{ ['--d' as string]: `${delay}s`, ['--i' as string]: offset + i }}
              >
                {ch}
              </span>
            ))}
            {w < words.length - 1 && <span className="inline-block w-[0.3em]" />}
          </span>
        );
      })}
    </Tag>
  );
}

/** Scroll-Reveal für beliebige Blöcke. */
export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
