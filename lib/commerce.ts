/**
 * Commerce rules — SAMPLE VALUES. Confirm with the business before launch
 * (courier contract, free-shipping threshold, COD fee, return window under BiH consumer law).
 */
export const SHIPPING = {
  /** Standard courier delivery, any address in BiH (feninga) */
  standard: 800,
  /** Free delivery threshold (feninga) */
  freeFrom: 15000,
  days: '1–3 radna dana',
  /** Cash-on-delivery fee charged by courier — included in shipping price in this sample policy */
  codFee: 0,
} as const;

export const RETURNS = { days: 14 } as const;

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.standard;
}

export const SUPPORT = {
  phone: '+387 33 000 000',
  phoneHref: 'tel:+38733000000',
  email: 'pomoc@kroj.example',
  hours: 'Pon–Pet 9–17h, Sub 9–13h',
  city: 'Sarajevo, Bosna i Hercegovina',
} as const;
