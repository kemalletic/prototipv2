import type { SizeSystem } from './catalog/data';

/** Garment measurements in cm (flat, sample spec — replace with the real tech-pack values). */
export const SIZE_CHARTS: Record<string, { title: string; columns: string[]; rows: Array<[string, ...number[]]>; note: string }> = {
  tops: {
    title: 'Majice, džemperi, trenerke i jakne',
    columns: ['Veličina', 'Grudi (obim)', 'Struk (obim)', 'Visina'],
    rows: [['XS', 86, 74, 168], ['S', 92, 80, 174], ['M', 98, 86, 180], ['L', 104, 92, 185], ['XL', 110, 98, 190], ['XXL', 118, 106, 194]],
    note: 'Mjere tijela. Ako ste između dvije veličine, za uži izgled uzmite manju, a za opušteniji veću.',
  },
  bottoms: {
    title: 'Traperice, pantalone i šorcevi',
    columns: ['Veličina (W)', 'Struk (obim)', 'Bokovi (obim)', 'Dužina nogavice'],
    rows: [['29', 74, 92, 81], ['30', 77, 95, 81], ['31', 79, 97, 81], ['32', 82, 100, 81], ['33', 84, 102, 81], ['34', 87, 105, 81], ['36', 92, 110, 81], ['38', 97, 115, 81]],
    note: 'Veličina W odgovara obimu struka u inčima. Dužina nogavice (L32) je 81 cm, osim ako u opisu proizvoda ne piše drugačije.',
  },
  belts: {
    title: 'Kaiševi',
    columns: ['Veličina', 'Obim struka', 'Ukupna dužina'],
    rows: [['85', 75, 100], ['90', 80, 105], ['95', 85, 110], ['100', 90, 115], ['105', 95, 120], ['110', 100, 125]],
    note: 'Uzmite kaiš oko 10 cm duži od obima struka (ili od veličine traperica u cm).',
  },
};

export const chartFor = (s: SizeSystem) => (s === 'alpha' ? 'tops' : s === 'waist' ? 'bottoms' : s === 'belt' ? 'belts' : null);

/**
 * Rough size estimate from height + weight. It is an estimate only, clearly labelled as such in the UI;
 * a production version should use real return/fit data.
 */
export function estimateSize(system: SizeSystem, heightCm: number, weightKg: number, fit: 'uze' | 'normalno' | 'opusteno'): string | null {
  if (!heightCm || !weightKg || heightCm < 150 || heightCm > 210 || weightKg < 45 || weightKg > 150) return null;
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  if (system === 'alpha') {
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    let idx = heightCm < 170 ? 1 : heightCm < 178 ? 2 : heightCm < 186 ? 3 : 4;
    if (bmi < 20) idx -= 1;
    if (bmi > 26) idx += 1;
    if (bmi > 30) idx += 1;
    if (fit === 'uze') idx -= 0.5;
    if (fit === 'opusteno') idx += 0.5;
    return order[Math.max(0, Math.min(order.length - 1, Math.round(idx)))];
  }
  if (system === 'waist') {
    // waist (in) rough regression from weight/height
    let w = 18 + weightKg * 0.19 + (bmi - 23) * 0.55;
    if (fit === 'uze') w -= 0.6;
    if (fit === 'opusteno') w += 0.6;
    const sizes = [29, 30, 31, 32, 33, 34, 36, 38];
    const best = sizes.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
    return String(best);
  }
  return null;
}
