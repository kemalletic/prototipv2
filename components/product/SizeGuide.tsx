'use client';
import { useState } from 'react';
import type { SizeSystem } from '@/lib/catalog/data';
import { SIZE_CHARTS, chartFor, estimateSize } from '@/lib/sizes';
import { Sheet } from '@/components/ui/Sheet';
import { btn, field } from '@/components/ui/styles';

export function SizeTable({ chartKey }: { chartKey: string }) {
  const c = SIZE_CHARTS[chartKey];
  return (
    <div>
      <h3 className="text-sm font-medium">{c.title}</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse text-sm">
          <caption className="sr-only">{c.title}: mjere u centimetrima</caption>
          <thead>
            <tr>{c.columns.map((col) => <th key={col} scope="col" className="font-label border-b border-stone py-2 pr-3 text-left font-normal text-ink-3">{col}</th>)}</tr>
          </thead>
          <tbody className="tabular">
            {c.rows.map(([size, ...vals]) => (
              <tr key={size} className="border-b border-stone/70">
                <th scope="row" className="py-2 pr-3 text-left font-medium">{size}</th>
                {vals.map((v, i) => <td key={i} className="py-2 pr-3 text-ink-2">{v} cm</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-3">{c.note}</p>
    </div>
  );
}

export function SizeGuideDialog({ open, onClose, system, sizes, onPick, productName }: {
  open: boolean; onClose: () => void; system: SizeSystem; sizes: string[]; onPick: (s: string) => void; productName: string;
}) {
  const chartKey = chartFor(system);
  const [h, setH] = useState('');
  const [w, setW] = useState('');
  const [fit, setFit] = useState<'uze' | 'normalno' | 'opusteno'>('normalno');
  const est = estimateSize(system, Number(h), Number(w), fit);
  const canEstimate = system === 'alpha' || system === 'waist';
  return (
    <Sheet open={open} onClose={onClose} label="Vodič za veličine" side="right">
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="border-b border-stone px-5 pb-4 pt-5">
          <h2 className="text-lg font-medium">Vodič za veličine</h2>
          <p className="mt-0.5 text-sm text-ink-3">{productName}</p>
        </div>
        <div className="space-y-8 px-5 py-6">
          {canEstimate && (
            <section aria-labelledby="fit-est">
              <h3 id="fit-est" className="text-sm font-medium">Pronađite svoju veličinu</h3>
              <p className="mt-1 text-sm text-ink-3">Procjena na osnovu visine i težine. Nije garancija, ali je dobar početak.</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><label htmlFor="sg-h" className={field.label}>Visina (cm)</label><input id="sg-h" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, ''))} className={field.input} placeholder="180" /></div>
                <div><label htmlFor="sg-w" className={field.label}>Težina (kg)</label><input id="sg-w" inputMode="numeric" value={w} onChange={(e) => setW(e.target.value.replace(/\D/g, ''))} className={field.input} placeholder="80" /></div>
              </div>
              <fieldset className="mt-3">
                <legend className={field.label}>Kako volite da odjeća stoji?</legend>
                <div className="grid grid-cols-3 gap-1.5">
                  {([['uze', 'Uže'], ['normalno', 'Normalno'], ['opusteno', 'Opušteno']] as const).map(([v, l]) => (
                    <label key={v} className={`flex h-10 cursor-pointer items-center justify-center border text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-copper ${fit === v ? 'border-ink bg-ink text-paper' : 'border-stone hover:border-ink'}`}>
                      <input type="radio" name="sg-fit" value={v} checked={fit === v} onChange={() => setFit(v)} className="sr-only" />{l}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-4 min-h-[4.5rem] bg-plaster p-4" aria-live="polite">
                {est && sizes.includes(est) ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">Preporučujemo veličinu <strong className="tabular text-xl font-medium">{est}</strong></p>
                    <button type="button" onClick={() => { onPick(est); onClose(); }} className={`${btn.base} ${btn.primary} h-10 px-4 text-sm`}>Odaberi {est}</button>
                  </div>
                ) : (
                  <p className="text-sm text-ink-3">{h && w ? 'Unesite visinu između 150 i 210 cm i težinu između 45 i 150 kg.' : 'Unesite visinu i težinu za procjenu.'}</p>
                )}
              </div>
            </section>
          )}
          {chartKey ? <SizeTable chartKey={chartKey} /> : <p className="text-sm text-ink-2">Ovaj proizvod dolazi u jednoj veličini.</p>}
          <section>
            <h3 className="text-sm font-medium">Kako mjeriti</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
              <li><strong className="font-medium text-ink">Grudi:</strong> obim preko najšireg dijela grudi, ispod pazuha.</li>
              <li><strong className="font-medium text-ink">Struk:</strong> obim na mjestu gdje inače nosite pantalone.</li>
              <li><strong className="font-medium text-ink">Dužina nogavice:</strong> od međunožja do poda, bez obuće.</li>
            </ul>
            <p className="mt-3 text-sm text-ink-3">Ne odgovara? Zamjena veličine je moguća u roku od 14 dana.</p>
          </section>
        </div>
      </div>
    </Sheet>
  );
}
