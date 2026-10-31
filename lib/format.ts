/**
 * Formats feninga as "1.234,50 KM" (bs-BA convention).
 * Implemented by hand: Intl locale data for bs-BA is missing in some browsers/runtimes,
 * which would produce "BAM 1,234.50" and hydration mismatches.
 */
export function formatKM(feninga: number): string {
  const neg = feninga < 0;
  const abs = Math.abs(Math.round(feninga));
  const whole = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dec = (abs % 100).toString().padStart(2, '0');
  return `${neg ? '−' : ''}${whole},${dec}\u00a0KM`;
}

/** Bosnian plural forms: 1 proizvod, 2–4 proizvoda, 5+ proizvoda (11–14 always "many"). */
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** Diacritic-insensitive normalisation for search: "Džemper" → "dzemper". */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
