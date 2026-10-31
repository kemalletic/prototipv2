/** Shared class recipes (kept as strings so server and client components can use them). */
export const btn = {
  base: 'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap transition-[background-color,color,border-color,opacity,transform] duration-200 ease-[var(--ease-tailor)] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.985]',
  primary: 'h-12 px-6 bg-ink text-paper hover:bg-[#33302b] text-[0.9375rem] font-medium',
  secondary: 'h-12 px-6 border border-ink text-ink hover:bg-ink hover:text-paper text-[0.9375rem] font-medium',
  ghost: 'h-10 px-3 text-ink hover:bg-plaster-2 text-sm',
  link: 'text-ink underline underline-offset-4 decoration-stone-2 hover:decoration-copper text-sm',
  icon: 'h-10 w-10 text-ink hover:bg-plaster-2 rounded-full',
};
export const field = {
  label: 'block text-sm font-medium text-ink mb-1.5',
  input: 'block w-full h-12 px-3.5 bg-paper border border-stone text-ink placeholder:text-ink-3/70 transition-colors focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-copper aria-[invalid=true]:border-alert',
  error: 'mt-1.5 text-[0.8125rem] text-alert',
  hint: 'mt-1.5 text-[0.8125rem] text-ink-3',
};
