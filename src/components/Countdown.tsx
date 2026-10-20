import { useEffect, useState } from 'react';

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [left, setLeft] = useState(() => target - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (left <= 0) return <p className="text-sm font-bold uppercase tracking-widest text-accent-text">Jetzt im Hive</p>;
  const p = parts(left);
  const cells: [number, string][] = [[p.d, 'Tage'], [p.h, 'Std'], [p.m, 'Min'], [p.s, 'Sek']];
  return (
    <div role="timer" aria-label={`Noch ${p.d} Tage, ${p.h} Stunden, ${p.m} Minuten`} className="flex gap-2">
      {cells.map(([v, l]) => (
        <div key={l} className="min-w-14 rounded-xl border border-line bg-surface/60 px-2 py-2 text-center">
          <div className="font-display font-black text-2xl tabular-nums">{String(v).padStart(2, '0')}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{l}</div>
        </div>
      ))}
    </div>
  );
}
