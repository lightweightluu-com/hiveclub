# Projekt-Konventionen für Claude

Dieses Repo stammt aus dem Template `lightweightluu-com/pwa-template`.
Jeder Push auf `main` wird automatisch als PWA auf
**https://<repo-name>.lightweightluu.com** veröffentlicht.

## Deployment – nicht verändern ohne Rückfrage
- `.github/workflows/deploy.yml` baut mit `npm run build` und deployt `dist/`
  als Cloudflare Worker (Static Assets) mit Custom Domain.
- Die Subdomain ist der Repo-Name in Kleinbuchstaben (`_` und `.` werden zu `-`).
- `wrangler.jsonc` wird im CI erzeugt und ist in `.gitignore` – nicht einchecken.
- Secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) kommen aus der Org.
  Niemals Tokens oder Keys in den Code schreiben.

## Stack
- Vite + `vite-plugin-pwa` (Manifest + Service Worker, `autoUpdate`).
- Build-Output muss in `dist/` landen.
- Backend: nur der kleine Worker unter „Backend (Events & Admin)“. Weitere
  Backend-Funktionen (andere Speicher, Dienste, Zahlungsmittel) nur nach Rückfrage.
- SPA-Routing ist aktiv (`not_found_handling: single-page-application`).
- Frameworks (React, Svelte, …) sind erlaubt, wenn das Projekt es braucht –
  `vite-plugin-pwa` und den `dist/`-Output beibehalten.

## Bei jedem neuen Projekt anpassen
1. In `vite.config.js`: `APP_NAME`, `APP_SHORT_NAME`, `THEME_COLOR`, `BACKGROUND_COLOR`.
2. In `index.html`: `<title>`, `meta description`, `theme-color`.
3. Icons in `public/icons/` (192, 512, maskable 512) und `public/apple-touch-icon.png`, `public/favicon.svg` ersetzen.
4. `name` in `package.json` auf den Repo-Namen setzen.
5. Nach dem ersten `npm install` die `package-lock.json` mit committen.

## Qualitätsregeln
- Vor jedem Push auf `main`: `npm run build` muss fehlerfrei durchlaufen.
- Mobile first, funktioniert ab 360 px Breite, respektiert Safe Areas.
- Hell- und Dunkelmodus über `prefers-color-scheme`.
- Barrierearm: semantisches HTML, ausreichende Kontraste, Labels für Formulare.
- Inhalte und UI-Texte auf Deutsch (Schweiz: „ss“ statt „ß“), sofern nicht anders gewünscht.
- Kleine, beschreibende Commits.

## Backend (Events & Admin)
Ein Cloudflare Worker im selben Projekt (`worker/index.ts`) liefert die Events
und die Admin-API. Alles andere (die normale Seite) liefert Cloudflare direkt
als Static Assets aus; der Worker läuft nur für `/api/*` und `/img/*`
(`run_worker_first`).

- **Speicher:** Workers KV, Binding `DB`, Namespace `<repo>-data`. Kein R2, kein
  D1, kein Supabase, keine Zahlungsmittel. `deploy.yml` legt den Namespace bei
  Bedarf per Cloudflare-API an und trägt seine ID in die (im CI erzeugte)
  `wrangler.jsonc` ein.
- **KV-Schlüssel:** `idx` (JSON-Liste der IDs, neueste zuerst), `t:<id>` (Event als
  JSON), `img:<id>:flyer` (Bild, Content-Type in den KV-Metadaten),
  `s:<sessionId>` (Session, TTL 7 Tage), `rl:<ip>` (Fehlversuche, TTL 10 Min).
  IDs sind 16 Hex-Zeichen aus `crypto.getRandomValues`.
- **Erststart:** Ist `idx` leer (nicht vorhanden), legt der Worker beim ersten Aufruf
  die Events aus `src/data/club.ts` (`EVENTS`) an, alle veröffentlicht. Danach
  gilt nur noch KV. `EVENTS` bleibt als Fallback, wenn das Backend nicht
  erreichbar ist (z. B. `npm run dev` ohne Worker oder offline).
- **Öffentlich:** `GET /api/events` (nur veröffentlichte), `GET /img/<id>` (Flyer,
  nur bei veröffentlichten Events, sonst 404; Browser-Cache 60 s).
- **Admin:** `/admin` (noindex per Meta und `Disallow: /admin` in `robots.txt`),
  API unter `/api/admin/*`. Events anlegen, bearbeiten, löschen, als Entwurf
  ausblenden oder veröffentlichen, Flyer hochladen.
- **Konsistenz:** KV ist eventuell konsistent. Änderungen (auch das Zurückziehen
  eines Events oder Flyers) können bis zu etwa 60 Sekunden brauchen. Nicht nur den
  Browser-Cache leeren, sondern kurz warten.

### Sicherheit
- Passwort: 24 Zeichen aus `abcdefghjkmnpqrstuvwxyz23456789` (ca. 117 Bit), in
  4er-Gruppen. Im Repo/CI steht **nur der SHA-256-Hash** (`ADMIN_HASH` in
  `.github/workflows/deploy.yml`), nie das Passwort. Der Login normalisiert die
  Eingabe (Leerzeichen und Bindestriche entfernen, Kleinschreibung) und
  vergleicht den Hash in konstanter Zeit.
- Sessions: zufällige 32-Byte-ID in KV (7 Tage), Cookie `sid` mit
  `HttpOnly; Secure; SameSite=Strict; Path=/`.
- Rate-Limit: 10 Fehlversuche pro IP (`cf-connecting-ip`) in 10 Minuten, danach 429.
- CSRF: alle ändernden Admin-Requests brauchen den Header `x-requested-with: fetch`,
  sonst 403.
- Fehler kommen als JSON `{ "error": "deutsche Meldung" }`; unerwartete Fehler
  werden geloggt und als 500 beantwortet.
- Das Passwort nie in Code, Logs, Commits oder PR-Texte schreiben.

### Passwort wechseln
1. `node scripts/admin-hash.mjs --generate` erzeugt ein neues Passwort und seinen
   Hash. (Ein eigenes Passwort: `node scripts/admin-hash.mjs`, die Eingabe erfolgt
   über stdin und landet nicht in der Shell-History.)
2. Den Hash in `.github/workflows/deploy.yml` bei `ADMIN_HASH` eintragen, committen,
   nach `main` mergen. Nach dem Deploy gilt sofort das neue Passwort.
3. Das neue Passwort einmal sicher weitergeben, nicht im Repo ablegen. Bestehende
   Sessions bleiben bis zu 7 Tage gültig; zum sofortigen Beenden den Namespace-
   Eintrag `s:*` löschen (Cloudflare-Dashboard → KV) oder den Namespace leeren.

### Lokal testen
`wrangler` ist bewusst keine Abhängigkeit des Projekts. Ausserhalb installieren:
```bash
mkdir -p ~/wr && cd ~/wr && npm init -y && npm i wrangler
cd <projekt> && npm run build
cat > wrangler.jsonc <<'JSON'   # steht in .gitignore, nicht einchecken
{ "name": "local", "main": "worker/index.ts", "compatibility_date": "2026-09-01",
  "assets": { "directory": "./dist", "binding": "ASSETS",
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*", "/img/*"] },
  "kv_namespaces": [{ "binding": "DB", "id": "local" }] }
JSON
~/wr/node_modules/.bin/wrangler dev --local --var ADMIN_HASH:$(node scripts/admin-hash.mjs)
```
Fallen: Lokal ohne `cf-connecting-ip` teilen sich alle Anfragen einen Rate-Limit-Zähler;
nach Fehlversuchen den Ordner `.wrangler` (oder `--persist-to`) löschen. Wrangler-Prozesse
nicht mit `pkill -f` beenden, wenn das Muster in der eigenen Befehlszeile steckt.
Neue Abhängigkeiten immer in `package.json`/`package-lock.json` eintragen, sonst scheitert
der Deploy auf `main`, obwohl der Build lokal läuft.
