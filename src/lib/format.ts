const TZ = 'Europe/Zurich';
export const fmtDay = (iso: string) => new Intl.DateTimeFormat('de-CH', { day: '2-digit', timeZone: TZ }).format(new Date(iso));
export const fmtMonth = (iso: string) => new Intl.DateTimeFormat('de-CH', { month: 'short', timeZone: TZ }).format(new Date(iso)).replace('.', '');
export const fmtWeekday = (iso: string) => new Intl.DateTimeFormat('de-CH', { weekday: 'long', timeZone: TZ }).format(new Date(iso));
export const fmtLongDate = (iso: string) =>
  new Intl.DateTimeFormat('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date(iso));
