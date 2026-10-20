import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';
const COLORS: Record<Theme, string> = { light: '#f5f2ec', dark: '#0b0a09' };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLORS[theme]);
    try { localStorage.setItem('theme', theme); } catch { /* Speicher blockiert – Theme gilt nur für diese Sitzung */ }
  }, [theme]);

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'}
      className="grid size-11 place-items-center rounded-full border border-line bg-surface/60 transition-colors hover:border-accent-text hover:text-accent-text"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
