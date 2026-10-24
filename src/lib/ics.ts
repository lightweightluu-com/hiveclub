const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Kalendereintrag (.ics) für ein Event. Ein Ende ist nicht bekannt, deshalb nur der Beginn. */
export function buildIcs(e: { id: string; title: string; start: string; blurb: string }, url: string, location: string) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hive Club Zuerich//Events//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.id}@hiveclub.lightweightluu.com`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(new Date(e.start))}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(`${e.blurb}\n${url}`)}`,
    `LOCATION:${esc(location)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
