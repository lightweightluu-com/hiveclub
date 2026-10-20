// lucide-react enthält keine Markenlogos mehr – schlichte Linien-Icons im Lucide-Stil.
type P = React.SVGProps<SVGSVGElement>;
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const Instagram = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>
);
export const Facebook = (p: P) => (
  <svg {...base} {...p}><path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.500h2.500V21H14v-6.500h2.500L17 11h-3V8.500a.5.5 0 0 1 .5-.5z" /></svg>
);
