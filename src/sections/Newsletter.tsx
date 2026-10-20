import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Mail } from 'lucide-react';
import { SITE } from '@/data/club';
import { Reveal } from '@/components/magic/text-reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Kein Backend: Endpunkt (z. B. Worker oder Newsletter-Dienst) per Env setzen.
const ENDPOINT = import.meta.env.VITE_NEWSLETTER_URL as string | undefined;
type State = 'idle' | 'loading' | 'done' | 'error';

export function Newsletter() {
  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const next: Record<string, string> = {};
    if (!d.firstName?.trim()) next.firstName = 'Bitte Vornamen eingeben.';
    if (!d.lastName?.trim()) next.lastName = 'Bitte Nachnamen eingeben.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email ?? '')) next.email = 'Bitte gültige E-Mail-Adresse eingeben.';
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!ENDPOINT) return setState('error');
    setState('loading');
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <section id="newsletter" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-6 sm:p-12">
          <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-violet/30 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent-text"><Mail className="size-4" /> Newsletter</p>
              <h2 className="text-display text-[clamp(2.4rem,8vw,5rem)]">Liebesbriefe aus dem Hive</h2>
              <p className="mt-4 max-w-md text-muted">Das Programm direkt in dein Postfach – ohne Spam, jederzeit abbestellbar.</p>
            </div>

            <div aria-live="polite">
              <AnimatePresence mode="wait">
                {state === 'done' ? (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full min-h-48 flex-col items-start justify-center gap-3">
                    <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg"><Check className="size-7" /></span>
                    <p className="text-2xl font-extrabold">Willkommen im Hive!</p>
                    <p className="text-muted">Deine Anmeldung ist eingegangen.</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
                    {([['firstName', 'Vorname', 'given-name', 'text'], ['lastName', 'Nachname', 'family-name', 'text']] as const).map(([n, l, ac, t]) => (
                      <div key={n}>
                        <label htmlFor={n} className="mb-1.5 block text-sm font-bold">{l}</label>
                        <Input id={n} name={n} type={t} autoComplete={ac} aria-invalid={!!errors[n]} aria-describedby={errors[n] ? `${n}-e` : undefined} />
                        {errors[n] && <p id={`${n}-e`} className="mt-1 text-sm text-red-400">{errors[n]}</p>}
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="mb-1.5 block text-sm font-bold">E-Mail</label>
                      <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-e' : undefined} />
                      {errors.email && <p id="email-e" className="mt-1 text-sm text-red-400">{errors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" disabled={state === 'loading'} aria-busy={state === 'loading'} className="w-full sm:w-auto">
                        {state === 'loading' && <Loader2 className="animate-spin" />} Abonnieren
                      </Button>
                      {state === 'error' && (
                        <p role="alert" className="mt-3 text-sm text-red-400">
                          Anmeldung gerade nicht möglich. Bitte melde dich direkt auf{' '}
                          <a href={SITE} target="_blank" rel="noreferrer noopener" className="underline">hiveclub.ch</a> an.
                        </p>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
