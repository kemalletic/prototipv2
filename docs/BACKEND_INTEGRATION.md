# Backend integration: what the prototype fakes, and what must be built

The frontend is production-shaped, but these pieces are **mocked or missing**. Each item lists where the frontend
hooks in.

## 1. Catalogue and inventory (required)
- **Now:** `lib/catalog/data.ts` holds sample products. Stock is a deterministic hash (`sampleStock`).
- **Build:** a product/PIM source (headless commerce, ERP export or custom DB) exposing products, colourways,
  sizes, prices (feninga, VAT-inclusive), compositions, care, fit notes, image URLs and **live stock per SKU**
  (product × colour × size).
- **Hook:** replace the module exports with `'use cache'` data functions (`cacheTag` per product), then call
  `revalidateTag` on product or stock webhooks. Keep the `Product` interface, or map to it.
- Low-stock messaging ("još 2 kom.") is driven by real stock only. Never fake it.

## 2. Orders (required)
- **Now:** `POST /api/narudzbe` validates (`lib/checkout.ts`), re-prices from the catalogue and returns
  `KR-XXXXXX` with `status: 'zaprimljena'`. Nothing is stored. The confirmation page reads the order from
  localStorage (`lib/store/orders.ts`).
- **Build:**
  - Persist orders with a status lifecycle:
    `submitted → confirmed (phone) → shipped → delivered (cash collected)`, plus `cancelled`, `refused` (customer
    refused the COD parcel) and `returned`.
  - **Stock reservation** at submission, released when an order is cancelled or refused.
  - Server-side re-pricing (already implemented in `priceOrder`), idempotency keys against double submits,
    rate limiting, and bot protection (a honeypot or Turnstile).
  - A confirmation page that loads the order from the server by number plus a signed token (not from localStorage).
- **Notifications:** an SMS to the customer (submitted / shipped with tracking), optional e-mail, and an internal
  alert for new orders.

## 3. COD phone confirmation workflow
COD in BiH depends on calling the customer before dispatch to reduce refused parcels. This needs an admin queue
for unconfirmed orders, call outcomes (confirmed / unreachable / cancelled), and automatic cancellation after N
failed attempts.

## 4. Courier integration
Integrate with a courier API (for example EuroExpress, X Express or BH Pošta Express; to be chosen by the business)
for shipment creation, labels, tracking numbers, COD amount, cash remittance reconciliation, and status webhooks
that update `shipped` / `delivered` / `refused`.

## 5. Administration
Order management, stock adjustments, product editing, returns and exchanges processing, customer service notes,
and exports for accounting (fiscalisation requirements in FBiH/RS/BD must be confirmed with an accountant).

## 6. Returns and exchanges
Return or exchange requests (order number + phone), a pickup booking with the courier, and refund to a bank
account (IBAN capture, done securely).

## 7. Contact form
- **Now:** client validation and a prototype success message.
- **Build:** an endpoint to a helpdesk or e-mail, with spam protection.

## 8. Analytics and consent
- **Now:** events go to `window.dataLayer` only after consent (`lib/analytics.ts`), plus an in-memory debug log.
- **Build:** load the tag manager / GA4 (or a privacy-first alternative) only after consent, and send server-side
  events for `order_confirmed`, `order_shipped`, `order_delivered`, `order_refused` and `order_returned` (see
  ANALYTICS.md). Store consent records if required by the BiH Law on Personal Data Protection.

## 9. Content and legal
Real company details (name, ID/VAT number, address), lawyer-reviewed terms, privacy and cookie policies, the
return window under BiH consumer law, and a confirmed shipping price and free-shipping threshold
(`lib/commerce.ts`).

## 10. Deployment
Any Node 22 host that supports Next.js 16 (Vercel, or a container with `next start`). Set
`NEXT_PUBLIC_SITE_URL`. Switch `robots` and the root `metadata.robots` to allow indexing at launch, and keep `/korpa`,
`/naplata`, `/narudzba/*` and `/zelje` disallowed. Add RUM (`web-vitals`) for real Core Web Vitals.

## Open business questions (need owner input)
1. Final brand name and trademark/domain clearance.
2. Courier partner, shipping price, free-shipping threshold, and whether COD fees are absorbed.
3. Return window and who pays return shipping.
4. Real assortment, size charts (tech-pack measurements) and photography schedule.
5. Whether to add card payment later (would require a PSP).
