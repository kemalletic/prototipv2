import { NextResponse } from 'next/server';
import { priceOrder, validate, normalizePhone, type CheckoutInput, type LineInput } from '@/lib/checkout';

/**
 * MOCK order endpoint (prototype). Validates and re-prices the order, then returns a demo order number.
 * Nothing is stored, no stock is reserved and nobody is notified. Replace with the real order service —
 * see docs/BACKEND_INTEGRATION.md.
 *
 * QA hook: a name containing "#greska" returns 503 so the client error state can be tested.
 */
export async function POST(req: Request) {
  let body: { customer?: CheckoutInput; lines?: LineInput[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const c = body.customer;
  if (!c) return NextResponse.json({ error: 'missing_customer' }, { status: 400 });
  if (c.name?.includes('#greska')) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
  const errors = validate(c);
  if (Object.keys(errors).length) return NextResponse.json({ error: 'validation', errors }, { status: 422 });
  const priced = priceOrder(body.lines ?? []);
  if (!priced) return NextResponse.json({ error: 'invalid_lines' }, { status: 409 });

  await new Promise((r) => setTimeout(r, 900)); // simulate network/processing latency
  const n = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return NextResponse.json({
    order: {
      number: `KR-${n}`,
      status: 'zaprimljena', // submitted — NOT confirmed. Confirmation happens by phone (backend phase).
      phone: normalizePhone(c.phone),
      ...priced,
      demo: true,
    },
  }, { status: 201 });
}
