'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * Accessible modal sheet built on native <dialog>: focus trap, Esc, inert background and
 * top-layer rendering come from the platform. `side` controls placement and entrance motion.
 */
export function Sheet({
  open, onClose, label, side = 'right', children, className = '', hideClose = false,
}: {
  open: boolean; onClose: () => void; label: string; side?: 'right' | 'bottom' | 'top' | 'center' | 'full';
  children: ReactNode; className?: string; hideClose?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const pos = {
    right: 'ml-auto h-dvh w-full max-w-[28rem] sheet-right',
    bottom: 'mt-auto w-full max-h-[88dvh] sheet-bottom',
    top: 'w-full sheet-top',
    center: 'm-auto w-[min(92vw,44rem)] max-h-[88dvh] sheet-fade',
    full: 'h-dvh w-full sheet-fade',
  }[side];

  return (
    <dialog
      ref={ref}
      className="sheet fixed inset-0 h-full w-full"
      aria-label={label}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`relative flex flex-col overflow-hidden bg-paper text-ink shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_30px_60px_-20px_rgb(28_26_23/0.35)] ${pos} ${className}`}>
        {!hideClose && (
          <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-plaster" aria-label="Zatvori">
            <Icon name="close" />
          </button>
        )}
        {open ? children : null}
      </div>
    </dialog>
  );
}
