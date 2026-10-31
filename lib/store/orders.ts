'use client';
import { createPersisted } from './persisted';
import type { CartLine } from './cart';

/** DEMO ONLY: submitted orders are kept in this browser so the confirmation page can render them. */
export interface DemoOrder {
  number: string;
  createdAt: string;
  status: 'zaprimljena';
  customer: { name: string; phone: string; email?: string };
  address: { street: string; city: string; zip: string; note?: string };
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: 'pouzece';
}
export const ordersStore = createPersisted<DemoOrder[]>('kroj.orders.demo.v1', []);
