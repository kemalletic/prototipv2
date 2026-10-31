import { formatKM } from '@/lib/format';

export function Price({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`tabular ${className}`}>{formatKM(value)}</span>;
}
