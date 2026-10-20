// Alle Inhalte stammen von hiveclub.ch (Stand Oktober 2026).

export const SITE = 'https://www.hiveclub.ch/';

export const NAV = [
  { id: 'programm', label: 'Programm', href: '#programm' },
  { id: 'community', label: 'Community', href: '#community' },
  { id: 'raumvermietung', label: 'Raumvermietung', href: '#raumvermietung' },
  { id: 'wohlfuehlen', label: 'Wohlfühlen im Hive', href: '#wohlfuehlen' },
  { id: 'about', label: 'About us', href: '#about' },
  { id: 'shop', label: 'Hive Shop', href: SITE, external: true },
  { id: 'audio', label: 'Hive Audio', href: 'https://soundcloud.com/hive-zurich', external: true },
  { id: 'jobs', label: 'Jobs', href: SITE, external: true }
] as const;

export const SOCIALS = [
  { id: 'instagram', label: 'Instagram', handle: '@hive_club', href: 'https://www.instagram.com/hive_club/' },
  { id: 'facebook', label: 'Facebook', handle: 'hivezurich', href: 'https://www.facebook.com/hivezurich' },
  { id: 'soundcloud', label: 'SoundCloud', handle: 'hive-zurich', href: 'https://soundcloud.com/hive-zurich' }
] as const;

export type ClubEvent = {
  id: string;
  title: string;
  /** ISO mit Zürcher Offset (Sommerzeit endet am 25.10.2026 → +02:00) */
  start: string;
  timeLabel: string;
  kind: 'club' | 'wellness' | 'dance';
  tag: string;
  blurb: string;
  badge?: string;
  /** Nur belegte Fakten aus der Eventbeschreibung. */
  tags: string[];
  featured?: boolean;
};

export const EVENTS: ClubEvent[] = [
  {
    id: 'dihive-staatsparty',
    tags: ['dihive', 'Residents'],
    title: 'dihive × Staatsparty',
    start: '2026-10-22T22:00:00+02:00',
    timeLabel: 'ab 22:00',
    kind: 'club',
    tag: 'Donnerstag',
    badge: 'ab 18',
    blurb: 'Donnerstags wird das Hive zum dihive – monatlich gestaltet von unseren Residents.'
  },
  {
    id: 'sync-hive',
    tags: ['Yoga', 'wildpeakthythm'],
    title: 'Sync@Hive',
    start: '2026-10-22T18:30:00+02:00',
    timeLabel: '18:30',
    kind: 'wellness',
    tag: 'Yoga',
    blurb: 'Yoga in Club-Atmosphäre, donnerstags – diesmal mit wildpeakthythm.'
  },
  {
    id: 'shut-up-and-dance',
    tags: ['Durchgehend tanzen'],
    title: 'Shut Up And Dance',
    start: '2026-10-22T20:00:00+02:00',
    timeLabel: '20:00 pünktlich',
    kind: 'dance',
    tag: 'Nicht quatschen – tanzen!',
    blurb: 'Durchgehend tanzen, pünktlich um 20 Uhr, ohne Herumstehen.'
  },
  {
    id: 'kiki',
    tags: ['2 Dancefloors'],
    title: 'Kiki',
    start: '2026-10-23T23:00:00+02:00',
    timeLabel: 'ab 23:00',
    kind: 'club',
    tag: 'Freitag',
    blurb: 'Zum zweiten Mal im Hive: zwei Dancefloors und ein kuratierter Nachtverlauf mit Überraschungen.'
  },
  {
    id: 'denis-horvat-lazare',
    tags: ['Innervisions', 'Afterlife', 'Diynamic'],
    title: 'Denis Horvat × Lazare',
    start: '2026-10-24T23:00:00+02:00',
    timeLabel: 'ab 23:00',
    kind: 'club',
    tag: 'Samstag',
    featured: true,
    blurb: 'Denis Horvat veröffentlichte unter anderem auf Innervisions, Afterlife und Diynamic.'
  }
];

export const RESIDENTS = [
  'AANN', 'AC ID FLORA', 'Animal Trainer', 'Anthik', 'Ardour', 'Carla Durisch', 'Dani Dorá',
  'Juli Lee', 'Kellerkind', 'Manuel Moreno', 'Mar Dean', 'Matija', 'Miguel Lautaro & LUMME',
  'Nadara&Baerg', 'R.EK', 'Rostdiamant', 'samarsi', 'Soma Soul', 'Sous Sol', 'Table for Two', 'Vanita'
];

export const SERIES = [
  { name: 'Grundton', when: 'Anfang des Monats', note: 'Mit Neuton an ausgewählten Abenden.' },
  { name: 'Mad Katz', when: 'Monatsende', note: 'Danach geht’s weiter mit Rakete.' },
  { name: '7 Vibes Journey', when: 'Einmal monatlich, mittwochs', note: 'Connect deeper – Party higher!' },
  { name: 'Labil mit Stil', when: 'Freitagabende', note: 'Mit dekorativen Details.' },
  { name: 'Langstrass97', when: 'Freitagabende', note: 'Das Quartier zu Gast im Hive.' },
  { name: 'Aera', when: 'Mehrmals im Jahr', note: 'Nacht der Blume und Auf der Jagd.' },
  { name: 'Boyahkasha', when: 'Mehrmals im Jahr', note: 'Hiveakasha.' },
  { name: 'Shut Up and Dance', when: 'Einmal monatlich', note: 'Nicht Quatschen – Tanzen!' }
];

export const HOURS = [
  { day: 'Donnerstag', time: '23:00 – 04:00', dow: 4 },
  { day: 'Freitag', time: '23:00 – 07:00', dow: 5 },
  { day: 'Samstag', time: '23:00 – 09:00', dow: 6 }
];

export const ADDRESS = {
  name: 'Hive, Katakombe GmbH',
  street: 'Geroldstrasse 5',
  city: 'CH-8005 Zürich',
  phone: '+41 44 271 12 10',
  phoneHref: 'tel:+41442711210',
  map: 'https://www.google.com/maps/search/?api=1&query=47.384797,8.520164',
  embed: 'https://www.openstreetmap.org/export/embed.html?bbox=8.5162%2C47.3829%2C8.5242%2C47.3867&layer=mapnik&marker=47.384797%2C8.520164'
};

export const SISTER_PROJECTS = ['Frigo', 'Hiveair', 'Geroldchuchi'];

// Hinweis: Auf hiveclub.ch sind keine Hausregeln veröffentlicht – diese Texte sind
// allgemeine Club-Standards und vor dem Livegang vom Hive zu bestätigen.
export const RULES = [
  { q: 'Einlass & Alter', a: 'Zutritt ab 18 Jahren (dihive-Nächte ausdrücklich ab 18). Bitte einen gültigen Ausweis mitbringen.' },
  { q: 'Respekt & Safer Space', a: 'Alle sollen sich im Hive wohlfühlen. Diskriminierung, Belästigung und Übergriffe haben keinen Platz. Bei Problemen wendet euch an das Team.' },
  { q: 'Zustimmung zuerst', a: 'Nur mit klarem Einverständnis berühren, ansprechen oder fotografieren. Ein Nein ist ein Nein.' },
  { q: 'Gut aufeinander schauen', a: 'Wasser trinken, Pausen machen, Freund:innen nicht aus den Augen verlieren. Hilfe gibt es jederzeit an der Bar und bei der Security.' },
  { q: 'Handy & Kamera', a: 'Der Dancefloor gehört der Musik: Fotos und Videos nur mit Einverständnis der Abgebildeten.' }
];

export const WELLNESS = [
  { title: 'Sync@Hive', text: 'Yoga in Club-Atmosphäre, donnerstags um 18:30 Uhr.' },
  { title: 'Shut Up And Dance', text: 'Durchgehend tanzen statt herumstehen – pünktlich um 20 Uhr.' },
  { title: 'Geroldchuchi', text: 'Schwesterprojekt des Hive – Küche und Bar an der Geroldstrasse.' }
];
