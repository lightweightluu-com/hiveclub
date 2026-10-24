import { useSyncExternalStore } from 'react';

/** Minimaler Client-Router (History API). Die Seite hat nur Startseite und /events/<id>. */
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  // Die Scrollposition stellen wir selbst wieder her: Der Browser täte es, bevor die Seite gerendert ist.
  history.scrollRestoration = 'manual';
  window.addEventListener('popstate', () => {
    notify();
    settle((history.state as { y?: number } | null)?.y);
  });
}

/** Nach dem Rendern scrollen: zum Anker, zur gemerkten Position oder nach oben. */
function settle(y: number | undefined, smooth = false) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (target && y === undefined) target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      else window.scrollTo({ top: y ?? 0, behavior: 'instant' }); // html hat scroll-behavior: smooth, hier soll nichts gleiten
    })
  );
}

export function navigate(to: string) {
  const url = new URL(to, location.href);
  if (url.origin !== location.origin) {
    location.href = to;
    return;
  }
  const samePage = url.pathname === location.pathname;
  history.replaceState({ y: window.scrollY }, ''); // Position der Seite merken, die wir verlassen
  history.pushState({}, '', url.pathname + url.search + url.hash);
  notify();
  settle(undefined, samePage);
}

export const usePath = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => location.pathname,
    () => '/'
  );

/** onClick für interne Links: normale Klicks laufen über den Router, Modifier-Klicks und externe Ziele bleiben beim Browser. */
export function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const a = e.currentTarget;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target && a.target !== '_self') return;
  if (a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  navigate(url.pathname + url.search + url.hash);
}

export const eventPath = (id: string) => `/events/${id}`;
export const eventIdFromPath = (path: string) => /^\/events\/([0-9a-z-]+)\/?$/.exec(path)?.[1] ?? null;
