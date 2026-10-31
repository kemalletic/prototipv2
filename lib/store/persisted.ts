'use client';
import { useSyncExternalStore } from 'react';

/**
 * Tiny persisted store on top of localStorage + useSyncExternalStore.
 * Server render and first client render use `initial`, so hydration is stable.
 */
export function createPersisted<T>(key: string, initial: T) {
  let state: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* storage unavailable (private mode) — keep in memory */
    }
  };
  const emit = () => listeners.forEach((l) => l());

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== key) return;
      try { state = e.newValue ? (JSON.parse(e.newValue) as T) : initial; } catch { state = initial; }
      emit();
    });
  }

  return {
    get: () => { load(); return state; },
    set(next: T | ((prev: T) => T)) {
      load();
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      try { window.localStorage.setItem(key, JSON.stringify(state)); } catch { /* ignore */ }
      emit();
    },
    subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
    use(): T {
      return useSyncExternalStore(this.subscribe, () => { load(); return state; }, () => initial);
    },
  };
}

/** True after hydration — use to avoid showing persisted counts in the server HTML. */
const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
