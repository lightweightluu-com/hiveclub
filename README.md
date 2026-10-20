# Hive Club Zürich

Relaunch von hiveclub.ch als PWA: React + Vite + TypeScript, Tailwind CSS v4, shadcn/ui-Komponenten (Radix),
Lucide, Framer Motion sowie Magic-/Aceternity-UI-Effekte (Spotlight-Hex-Grid, Aurora, Beams, Glow-Cards, Floating Dock, Marquee).

```bash
npm install
npm run dev
npm run build   # tsc + vite build → dist/
```

- Inhalte (Events, Residents, Öffnungszeiten, Links): `src/data/club.ts`
- Newsletter: Endpunkt per `VITE_NEWSLETTER_URL` setzen (kein Backend im Projekt).
- Hausregeln und Galerie sind Platzhalter – bitte vom Hive bestätigen bzw. durch echte Fotos ersetzen.
