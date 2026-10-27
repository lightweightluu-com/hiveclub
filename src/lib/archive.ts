/**
 * Ein Event gilt als vorbei, sobald seit dem Beginn 12 Stunden vergangen sind.
 * Clubnächte laufen über Mitternacht (Samstag 23:00 bis Sonntag morgen), deshalb zählt
 * nicht der Beginn allein. Das Backend und die Seite verwenden dieselbe Regel.
 */
export const ARCHIVE_AFTER_MS = 12 * 60 * 60 * 1000;

export const isArchived = (start: string, now = Date.now()) => Date.parse(start) + ARCHIVE_AFTER_MS <= now;
