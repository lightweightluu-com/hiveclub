#!/usr/bin/env node
// Erzeugt den SHA-256-Hash (ADMIN_HASH) für das Admin-Passwort.
//   node scripts/admin-hash.mjs              → Passwort wird verdeckt-frei per Eingabe gelesen (stdin)
//   node scripts/admin-hash.mjs --generate   → neues Zufallspasswort + Hash
// Die Normalisierung muss exakt zu worker/index.ts passen (Leerzeichen/Bindestriche weg, Kleinbuchstaben).
import { createHash, randomInt } from 'node:crypto';
import { createInterface } from 'node:readline';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const normalize = (s) => s.replace(/[\s-]+/g, '').toLowerCase();
const hash = (pw) => createHash('sha256').update(normalize(pw)).digest('hex');
const group = (s) => s.match(/.{1,4}/g).join('-');

if (process.argv.includes('--generate')) {
  const pw = Array.from({ length: 24 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  console.log(`Passwort:   ${group(pw)}`);
  console.log(`ADMIN_HASH: ${hash(pw)}`);
} else {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  rl.question('Passwort: ', (pw) => {
    rl.close();
    console.log(hash(pw));
  });
}
