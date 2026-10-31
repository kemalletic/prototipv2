# Analytics instrumentation

Implemented in `lib/analytics.ts`. **No data leaves the browser in the prototype.** With analytics consent,
events are pushed to `window.dataLayer` (GA4/GTM-compatible `ecommerce` payloads). Every event is also logged to
`window.__krojEvents`, with a `sent` flag for QA. Without consent nothing is pushed.

## Consent
- Banner with equal-weight choices ("Samo neophodni" / "Prihvati sve") plus granular settings. It can be reopened
  from the footer ("Postavke kolačića").
- Stored in `localStorage['kroj.consent.v1']`: `{ decided, analytics, marketing }`.
- Production: load the tag manager only when `analytics === true`, and keep consent logs where legally required.

## Client events (implemented)
| Event | When | Key params |
|---|---|---|
| `view_item_list` | Product cards are ≥ 50% visible (batched per list, 600 ms) | `item_list_id`, `items[]{item_id, index, price}` |
| `select_item` | Click on a card or rail garment | `item_list_id`, `items[]` |
| `view_item` | PDP mount | `value`, `items[]` |
| `add_to_cart` / `remove_from_cart` | Cart changes (PDP, quick add, look) | `value`, `items[]{item_variant: colour/size}` |
| `add_to_wishlist` | Heart toggled on | `items[]` |
| `view_cart` | Drawer opened | `value`, `items[]` |
| `begin_checkout` | Checkout page with items | `value`, `items[]` |
| `add_shipping_info` | Address fields first become valid | `shipping_tier` |
| `add_payment_info` | Submit with a valid form | `payment_type: 'pouzece'` |
| `order_submitted` | API accepted the order | `transaction_id`, `value`, `shipping`, `status: 'submitted'` |
| `order_submit_failed` | API or network error | `value` |
| `search` | Debounced query | `search_term`, `results` |
| `size_guide_open`, `fabric_view`, `look_add` | Feature engagement | — |

`order_submitted` deliberately **does not use GA4's `purchase`**. A COD submission is not revenue: it may be
cancelled during phone confirmation or refused at the door.

## Server events (to build, from the order system)
| Event | Source |
|---|---|
| `order_confirmed` | Operator confirms by phone |
| `order_shipped` | Courier label created |
| `order_delivered` | Courier webhook: delivered + cash collected. **This is the revenue event** (send as GA4 `purchase` via Measurement Protocol, with the same `transaction_id`) |
| `order_refused` | Courier webhook: customer refused the parcel |
| `order_cancelled` / `order_returned` | Admin / returns flow |

## KPI definitions
- **Product impressions**: count of items in `view_item_list`.
- **Product view rate** = sessions with `view_item` ÷ sessions.
- **Add-to-cart rate** = sessions with `add_to_cart` ÷ sessions with `view_item`.
- **Cart abandonment** = 1 − (sessions with `begin_checkout` ÷ sessions with `add_to_cart`).
- **Checkout abandonment** = 1 − (`order_submitted` ÷ `begin_checkout`).
- **Submission conversion rate** = sessions with `order_submitted` ÷ sessions.
- **Confirmed conversion rate** = `order_confirmed` ÷ sessions (joined by `transaction_id`).
- **Delivered conversion rate** = `order_delivered` ÷ sessions. This is the true commercial rate.
- **Confirmation rate** = confirmed ÷ submitted. **Refusal rate** = refused ÷ shipped. Both are critical for COD.
- **AOV** = delivered revenue ÷ delivered orders. Report submitted AOV separately, never mixed.
