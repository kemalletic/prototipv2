'use client';
import { useEffect, useRef } from 'react';

/** Scrolls the `[aria-current]` child of a horizontal scroller into view (mobile chip rows). */
export function ScrollActive({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const cur = el?.querySelector<HTMLElement>('[aria-current]');
    if (el && cur && el.scrollWidth > el.clientWidth) el.scrollLeft = cur.offsetLeft - el.clientWidth / 2 + cur.offsetWidth / 2;
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
