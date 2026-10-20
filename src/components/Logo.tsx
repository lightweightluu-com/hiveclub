export function HexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M32 3l25 14.5v29L32 61 7 46.500v-29L32 3z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M22 22v20M42 22v20M22 32h20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
