/**
 * KROJ sample catalogue.
 *
 * ⚠️ SAMPLE DATA — every product, price, stock level and composition below is illustrative and must be
 * replaced by the real merchandise feed (see docs/BACKEND_INTEGRATION.md). Do not publish as-is.
 *
 * This file is plain, type-strippable TypeScript so it can be imported both by Next.js and by the
 * Node asset pipeline (scripts/assets/jobs.mjs). Keep it free of runtime imports.
 */

export type CategorySlug =
  | 'traperice'
  | 'pantalone'
  | 'majice'
  | 'trenerke'
  | 'dzemperi'
  | 'jakne-i-prsluci'
  | 'sorcevi'
  | 'kaisevi-i-dodaci';

export type SizeSystem = 'alpha' | 'waist' | 'belt' | 'one' | 'socks';
export type Fit = 'Slim' | 'Ravni' | 'Opušteni' | 'Široki' | 'Boxy' | 'Regular' | 'Uni';
export type FabricKey =
  | 'denim' | 'chino' | 'jersey' | 'heavyjersey' | 'melange' | 'fleece' | 'rib' | 'knit' | 'fineknit'
  | 'nylon' | 'wool' | 'cord' | 'canvas' | 'leather' | 'webbing' | 'puffer';

export interface Colorway {
  id: string;
  name: string;
  hex: string;
  /** Virtual-studio render parameters. Delete once real photography exists. */
  art?: Record<string, unknown>;
}

export interface Product {
  id: string;
  slug: string;
  /** Collection line, e.g. "Neretva" */
  line: string;
  /** Garment type, e.g. "Ravne traperice" */
  type: string;
  category: CategorySlug;
  /** Price in feninga (1 KM = 100 feninga) */
  price: number;
  fit: Fit;
  fitNote: string;
  composition: string;
  weight?: string;
  fabric: FabricKey;
  description: string;
  details: string[];
  care: string[];
  sizeSystem: SizeSystem;
  colorways: Colorway[];
  tags: Array<'novo' | 'bestseler' | 'osnova'>;
  /** ISO date the product was added (drives "Novo" sorting) */
  addedAt: string;
  /** 0–100 sample popularity signal (drives "Preporučeno" / bestsellers) */
  popularity: number;
  /** Products that complete the look */
  look?: string[];
  /** Virtual-studio garment template + params. Delete once real photography exists. */
  art: { garment: string; params?: Record<string, unknown>; back?: boolean; anchorY: number };
}

export interface Category {
  slug: CategorySlug;
  name: string;
  singular: string;
  lede: string;
  sizeSystem: SizeSystem;
}

export const CATEGORIES: Category[] = [
  { slug: 'traperice', name: 'Traperice', singular: 'Traperice', lede: 'Pet krojeva, od uskog do širokog. Denim koji s vremenom postaje vaš.', sizeSystem: 'waist' },
  { slug: 'pantalone', name: 'Pantalone', singular: 'Pantalone', lede: 'Chino, cargo, samt i vuna: pantalone za svaki radni dan i vikend.', sizeSystem: 'waist' },
  { slug: 'majice', name: 'Majice', singular: 'Majica', lede: 'Gust pamuk, čisti krojevi, šavovi koji traju više sezona.', sizeSystem: 'alpha' },
  { slug: 'trenerke', name: 'Trenerke', singular: 'Trenerka', lede: 'Gornji i donji dijelovi koji se kombinuju u set ili nose odvojeno.', sizeSystem: 'alpha' },
  { slug: 'dzemperi', name: 'Džemperi', singular: 'Džemper', lede: 'Merino, janjeća vuna i krupni pleteni džemperi za hladnije dane.', sizeSystem: 'alpha' },
  { slug: 'jakne-i-prsluci', name: 'Jakne i prsluci', singular: 'Jakna', lede: 'Od traper jakne do prošivene: slojevi za bosanske zime.', sizeSystem: 'alpha' },
  { slug: 'sorcevi', name: 'Šorcevi', singular: 'Šorc', lede: 'Za ljeto i trening. Kraći krojevi iz iste radionice.', sizeSystem: 'waist' },
  { slug: 'kaisevi-i-dodaci', name: 'Kaiševi i dodaci', singular: 'Dodatak', lede: 'Kožni kaiševi, kape, šalovi i čarape: detalji koji zaokružuju look.', sizeSystem: 'one' },
];

export const SIZES: Record<SizeSystem, string[]> = {
  alpha: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  waist: ['29', '30', '31', '32', '33', '34', '36', '38'],
  belt: ['85', '90', '95', '100', '105', '110'],
  one: ['UNI'],
  socks: ['39–42', '43–46'],
};

// Shared colour vocabulary keeps naming consistent across the store.
const C = {
  indigo: { id: 'tamno-indigo', name: 'Tamno indigo', hex: '#1f2c48' },
  washed: { id: 'isprana-plava', name: 'Isprana plava', hex: '#4a6890' },
  midblue: { id: 'srednje-plava', name: 'Srednje plava', hex: '#3d5a82' },
  black: { id: 'crna', name: 'Crna', hex: '#1f1f21' },
  white: { id: 'bijela', name: 'Bijela', hex: '#efece5' },
  ecru: { id: 'ecru', name: 'Ecru', hex: '#e4ddcd' },
  navy: { id: 'tamnoplava', name: 'Tamnoplava', hex: '#25304a' },
  grey: { id: 'siva-melanz', name: 'Siva melanž', hex: '#9b9893' },
  anthracite: { id: 'antracit', name: 'Antracit', hex: '#3a3b3e' },
  olive: { id: 'maslinasta', name: 'Maslinasta', hex: '#5e5f45' },
  beige: { id: 'bez', name: 'Bež', hex: '#b8a888' },
  brown: { id: 'smeda', name: 'Smeđa', hex: '#6b5a44' },
  darkbrown: { id: 'tamno-smeda', name: 'Tamno smeđa', hex: '#4b3b2f' },
  stone: { id: 'kamen', name: 'Kamen', hex: '#a69e8e' },
  cream: { id: 'krem', name: 'Krem', hex: '#ddd3c0' },
  bordo: { id: 'bordo', name: 'Bordo', hex: '#5b2630' },
  khaki: { id: 'kaki', name: 'Kaki', hex: '#6f6a4d' },
  copper: { id: 'bakar', name: 'Bakar', hex: '#8e4a28' },
  forest: { id: 'tamno-zelena', name: 'Tamno zelena', hex: '#2f3a30' },
};
type CKey = keyof typeof C;
const cw = (k: CKey, art?: Record<string, unknown>, override?: Partial<Colorway>): Colorway => ({ ...C[k], ...(override || {}), ...(art ? { art } : {}) });

const CARE_COTTON = ['Pranje na 30 °C, naopako', 'Ne sušiti u mašini', 'Peglati na srednjoj temperaturi'];
const CARE_DENIM = ['Prati rijetko, na 30 °C, naopako', 'Sušiti na zraku', 'Boja može pustiti pri prvim pranjima: prati odvojeno'];
const CARE_WOOL = ['Ručno pranje ili program za vunu na 20 °C', 'Sušiti položeno', 'Ne cijediti'];
const CARE_TECH = ['Pranje na 30 °C, zatvoren patent', 'Bez omekšivača', 'Sušiti na zraku'];
const CARE_LEATHER = ['Brisati suhom krpom', 'Povremeno njegovati kremom za kožu', 'Čuvati dalje od izvora toplote'];

export const PRODUCTS: Product[] = [
  // ───────────────────────────── TRAPERICE
  {
    id: 'p01', slug: 'neretva-ravne-traperice', line: 'Neretva', type: 'Ravne traperice', category: 'traperice', price: 11900,
    fit: 'Ravni', fitNote: 'Ravna nogavica od kuka do porubljenog ruba. Standardna visina struka.',
    composition: '100% pamuk', weight: '14 oz', fabric: 'denim',
    description: 'Naš osnovni kroj. Čvrst denim od 14 unci, krut na početku, a nakon nekoliko nošenja poprimi oblik vašeg tijela. Klasičnih pet džepova, bakrene zakovice i kontrastni šavovi.',
    details: ['Pet džepova', 'Patent s metalnim dugmetom', 'Bakrene zakovice', 'Dužina nogavice 81 cm (L32)'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('indigo', { fade: 0.22 }), cw('washed', { fade: 0.55 }), cw('black', { fade: 0.25, color2: '#5a5c60' }, { hex: '#25262a' })],
    tags: ['bestseler', 'osnova'], addedAt: '2026-08-04', popularity: 98, look: ['p12', 'p29', 'p40'],
    art: { garment: 'jeans', params: { fit: 'straight' }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p02', slug: 'una-slim-traperice', line: 'Una', type: 'Slim traperice', category: 'traperice', price: 10900,
    fit: 'Slim', fitNote: 'Uži kroj kroz bedro i nogavicu. Stretch denim za slobodu pokreta.',
    composition: '98% pamuk, 2% elastan', weight: '12 oz', fabric: 'denim',
    description: 'Uži kroj za one koji vole čistu siluetu. Mali udio elastana daje udobnost cijeli dan, bez gubitka oblika.',
    details: ['Pet džepova', 'Stretch denim', 'Dužina nogavice 81 cm (L32)'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('indigo', { fade: 0.3 }, { hex: '#263656' }), cw('anthracite', { fade: 0.3, color2: '#6c6f74' })],
    tags: ['osnova'], addedAt: '2026-07-12', popularity: 81, look: ['p16', 'p24'],
    art: { garment: 'jeans', params: { fit: 'slim' }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p03', slug: 'drina-opustene-traperice', line: 'Drina', type: 'Opuštene traperice', category: 'traperice', price: 12900,
    fit: 'Opušteni', fitNote: 'Više prostora u bedru, blago sužena prema rubu.',
    composition: '100% pamuk', weight: '13 oz', fabric: 'denim',
    description: 'Opušten, ali uredan kroj, prirodan izbor uz krupne džempere i radne jakne.',
    details: ['Pet džepova', 'Dugmad umjesto patenta', 'Dužina nogavice 81 cm (L32)'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('midblue', { fade: 0.48 }), cw('ecru', { fade: 0.1, color2: '#f4f0e6' }, { hex: '#d9d1bf' })],
    tags: ['novo'], addedAt: '2026-10-02', popularity: 74, look: ['p28', 'p30'],
    art: { garment: 'jeans', params: { fit: 'relaxed' }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p04', slug: 'sana-siroke-traperice', line: 'Sana', type: 'Široke traperice', category: 'traperice', price: 13500,
    fit: 'Široki', fitNote: 'Široka, ravna nogavica i viši struk. Nosite sa zavrnutim rubom.',
    composition: '100% pamuk', weight: '14 oz', fabric: 'denim',
    description: 'Široka silueta inspirisana radnom odjećom: dovoljno prostora za kretanje, čvrsto tkanje za godine nošenja.',
    details: ['Pet džepova', 'Viši struk', 'Dužina nogavice 84 cm (L34)'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('indigo', { fade: 0.18 }, { hex: '#22304f', name: 'Indigo rinse', id: 'indigo-rinse' })],
    tags: ['novo'], addedAt: '2026-10-18', popularity: 66, look: ['p13', 'p31'],
    art: { garment: 'jeans', params: { fit: 'wide' }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p05', slug: 'vrbas-slim-traperice-stone', line: 'Vrbas', type: 'Slim traperice', category: 'traperice', price: 9900,
    fit: 'Slim', fitNote: 'Uži kroj sa blago suženom nogavicom.',
    composition: '99% pamuk, 1% elastan', weight: '11 oz', fabric: 'denim',
    description: 'Lakši denim u srednje svijetloj stone-wash boji: proljetne i ljetne traperice koje idu uz sve.',
    details: ['Pet džepova', 'Stone wash', 'Dužina nogavice 81 cm (L32)'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('washed', { fade: 0.65 }, { hex: '#5674a0', name: 'Svijetla stone', id: 'svijetla-stone' })],
    tags: [], addedAt: '2026-05-20', popularity: 58, look: ['p12', 'p32'],
    art: { garment: 'jeans', params: { fit: 'slim' }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p06', slug: 'bosna-selvedge-traperice', line: 'Bosna', type: 'Selvedge traperice', category: 'traperice', price: 15900,
    fit: 'Ravni', fitNote: 'Ravan kroj; sirovi denim se nakon prvog pranja skupi do 3%.',
    composition: '100% pamuk, selvedge', weight: '15 oz', fabric: 'denim',
    description: 'Sirovi selvedge denim, tkan na uskim razbojima. Ivica tkanine vidljiva je kad zavrnete nogavicu. Za one koji traperice nose godinama.',
    details: ['Selvedge ivica', 'Sirovi, neprani denim', 'Dugmad umjesto patenta', 'Dužina nogavice 86 cm (L34)'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('indigo', { fade: 0.08 }, { hex: '#1a2440', name: 'Sirovi indigo', id: 'sirovi-indigo' })],
    tags: [], addedAt: '2026-09-01', popularity: 63, look: ['p24', 'p29', 'p40'],
    art: { garment: 'jeans', params: { fit: 'straight' }, back: true, anchorY: 0.09 },
  },

  // ───────────────────────────── PANTALONE
  {
    id: 'p07', slug: 'igman-chino-pantalone', line: 'Igman', type: 'Chino pantalone', category: 'pantalone', price: 8900,
    fit: 'Ravni', fitNote: 'Ravan kroj, srednji struk, pegla na prednjici.',
    composition: '97% pamuk, 3% elastan', weight: '280 g/m²', fabric: 'chino',
    description: 'Chino pantalone koje rade svugdje: u kancelariji, na večeri i vikendom. Kosi prednji džepovi i diskretna pegla.',
    details: ['Kosi prednji džepovi', 'Dva stražnja džepa s dugmetom', 'Dužina nogavice 81 cm'],
    care: CARE_COTTON, sizeSystem: 'waist',
    colorways: [cw('beige'), cw('olive'), cw('navy', undefined, { hex: '#232a3a' })],
    tags: ['bestseler', 'osnova'], addedAt: '2026-06-10', popularity: 92, look: ['p16', 'p26', 'p40'],
    art: { garment: 'jeans', params: { fabric: 'chino', chinoPockets: true, crease: true }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p08', slug: 'trebevic-cargo-pantalone', line: 'Trebević', type: 'Cargo pantalone', category: 'pantalone', price: 10900,
    fit: 'Opušteni', fitNote: 'Opušten kroj s bočnim džepovima i blago suženim rubom.',
    composition: '100% pamuk, platno', weight: '320 g/m²', fabric: 'canvas',
    description: 'Čvrsto pamučno platno, bočni džepovi s preklopom i dovoljno prostora za kretanje.',
    details: ['Bočni cargo džepovi', 'Pojačana koljena', 'Dužina nogavice 81 cm'],
    care: CARE_COTTON, sizeSystem: 'waist',
    colorways: [cw('khaki'), cw('black', undefined, { hex: '#232425' })],
    tags: ['novo'], addedAt: '2026-10-08', popularity: 77, look: ['p13', 'p34'],
    art: { garment: 'jeans', params: { fabric: 'canvas', cargo: true, fit: 'relaxed' }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p09', slug: 'bjelasnica-pantalone-od-samta', line: 'Bjelašnica', type: 'Pantalone od samta', category: 'pantalone', price: 9900,
    fit: 'Ravni', fitNote: 'Ravan kroj, srednji struk.',
    composition: '100% pamuk, rebrasti samt', weight: '340 g/m²', fabric: 'cord',
    description: 'Mekani rebrasti samt za jesen i zimu. Topao, izdržljiv i s teksturom koja se vidi.',
    details: ['Široka rebra (8 wale)', 'Kosi džepovi', 'Dužina nogavice 81 cm'],
    care: CARE_COTTON, sizeSystem: 'waist',
    colorways: [cw('brown', undefined, { hex: '#6a4a32' }), cw('cream', undefined, { hex: '#d6ccb4' })],
    tags: ['novo'], addedAt: '2026-10-12', popularity: 70, look: ['p24', 'p30'],
    art: { garment: 'jeans', params: { fabric: 'cord', chinoPockets: true }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p10', slug: 'vlasic-vunene-pantalone', line: 'Vlašić', type: 'Vunene pantalone', category: 'pantalone', price: 12900,
    fit: 'Ravni', fitNote: 'Ravan kroj s peglom; udobni elastični umetci u pojasu.',
    composition: '70% vuna, 30% poliester', weight: '300 g/m²', fabric: 'wool',
    description: 'Flanel od mješavine vune koji drži peglu i grije bez težine. Elegantne pantalone za hladne mjesece.',
    details: ['Pegla na prednjici', 'Kosi džepovi', 'Elastični umetci u pojasu'],
    care: CARE_WOOL, sizeSystem: 'waist',
    colorways: [cw('grey', undefined, { hex: '#6e6c69', name: 'Siva flanel', id: 'siva-flanel' }), cw('anthracite', undefined, { hex: '#35363a' })],
    tags: [], addedAt: '2026-09-22', popularity: 61, look: ['p26', 'p33'],
    art: { garment: 'jeans', params: { fabric: 'wool', chinoPockets: true, crease: true }, back: true, anchorY: 0.09 },
  },
  {
    id: 'p11', slug: 'ozren-radne-pantalone', line: 'Ozren', type: 'Radne pantalone', category: 'pantalone', price: 9900,
    fit: 'Opušteni', fitNote: 'Opušten, ravan kroj inspirisan stolarskim pantalonama.',
    composition: '100% pamuk, platno', weight: '340 g/m²', fabric: 'canvas',
    description: 'Neobojeno pamučno platno koje s vremenom omekša i dobije patinu.',
    details: ['Pet džepova', 'Dvostruki šavovi', 'Dužina nogavice 81 cm'],
    care: CARE_COTTON, sizeSystem: 'waist',
    colorways: [cw('ecru', undefined, { hex: '#d9cfba' })],
    tags: [], addedAt: '2026-07-01', popularity: 49, look: ['p12', 'p30'],
    art: { garment: 'jeans', params: { fabric: 'canvas', fit: 'relaxed' }, back: true, anchorY: 0.09 },
  },

  // ───────────────────────────── MAJICE
  {
    id: 'p12', slug: 'osnovna-majica', line: 'Osnova', type: 'Majica', category: 'majice', price: 3500,
    fit: 'Regular', fitNote: 'Klasičan kroj, ni preuzak ni preširok. Ako ste između dvije veličine, uzmite manju.',
    composition: '100% češljani pamuk', weight: '180 g/m²', fabric: 'jersey',
    description: 'Majica od koje sve počinje. Češljani pamuk, rebrasti okrugli izrez koji ne gubi oblik i dvostruki šavovi na rubovima.',
    details: ['Rebrasti okrugli izrez', 'Dvostruki šav na rubovima', 'Bez bočnih šavova'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('white'), cw('black', { dark: true }), cw('grey', { fabric: 'melange', color2: '#c9c5bd' }), cw('navy', { dark: true })],
    tags: ['bestseler', 'osnova'], addedAt: '2026-04-02', popularity: 100, look: ['p01', 'p29'],
    art: { garment: 'tee', params: { print: 'chest' }, back: true, anchorY: 0.19 },
  },
  {
    id: 'p13', slug: 'teska-majica-boxy', line: 'Osnova', type: 'Teška majica, boxy', category: 'majice', price: 4900,
    fit: 'Boxy', fitNote: 'Širi, kraći kroj s oborenim ramenima. Uzmite svoju uobičajenu veličinu.',
    composition: '100% pamuk', weight: '260 g/m²', fabric: 'heavyjersey',
    description: 'Gusti pamuk od 260 g/m² koji drži oblik. Šira silueta i spušteno rame za moderan, opušten izgled.',
    details: ['Gusti pamuk 260 g/m²', 'Spušteno rame', 'Široki rebrasti izrez'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('ecru'), cw('darkbrown', { dark: true }), cw('stone')],
    tags: ['bestseler'], addedAt: '2026-06-18', popularity: 90, look: ['p04', 'p08'],
    art: { garment: 'tee', params: { fit: 'boxy', fabric: 'heavyjersey' }, back: true, anchorY: 0.21 },
  },
  {
    id: 'p14', slug: 'majica-s-dzepom', line: 'Osnova', type: 'Majica s džepom', category: 'majice', price: 4200,
    fit: 'Regular', fitNote: 'Klasičan kroj.',
    composition: '100% pamuk', weight: '200 g/m²', fabric: 'jersey',
    description: 'Osnovna majica s našivenim džepom na prsima. Mali detalj koji pravi razliku.',
    details: ['Našiveni džep', 'Rebrasti izrez'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('olive', { dark: true }, { hex: '#5f6249' }), cw('white')],
    tags: [], addedAt: '2026-05-08', popularity: 64, look: ['p07', 'p37'],
    art: { garment: 'tee', params: { pocket: true }, back: true, anchorY: 0.19 },
  },
  {
    id: 'p15', slug: 'majica-kroj-sarajevo', line: 'Grafika', type: 'Majica s printom', category: 'majice', price: 4500,
    fit: 'Boxy', fitNote: 'Širi, kraći kroj.',
    composition: '100% pamuk', weight: '240 g/m²', fabric: 'heavyjersey',
    description: 'Tipografski print sa imenom grada. Sitotisak koji ne puca nakon pranja.',
    details: ['Sitotisak na prednjici', 'Gusti pamuk'],
    care: ['Pranje na 30 °C, naopako', 'Ne peglati preko printa', 'Ne sušiti u mašini'], sizeSystem: 'alpha',
    colorways: [cw('ecru', { print: 'type' }), cw('black', { print: 'type', dark: true })],
    tags: ['novo'], addedAt: '2026-10-20', popularity: 72, look: ['p03', 'p21'],
    art: { garment: 'tee', params: { fit: 'boxy', fabric: 'heavyjersey', print: 'type' }, back: true, anchorY: 0.21 },
  },
  {
    id: 'p16', slug: 'polo-majica', line: 'Osnova', type: 'Polo majica', category: 'majice', price: 5900,
    fit: 'Regular', fitNote: 'Klasičan kroj, nešto uži kroz struk.',
    composition: '100% pamuk, piqué', weight: '220 g/m²', fabric: 'jersey',
    description: 'Piqué polo s rebrastom kragnom i dva dugmeta. Uredno, a opušteno.',
    details: ['Rebrasta kragna', 'Lajsna s dva dugmeta', 'Duži stražnji rub'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('navy', { dark: true }, { hex: '#24304a' }), cw('white'), cw('bordo', { dark: true })],
    tags: [], addedAt: '2026-05-28', popularity: 69, look: ['p07', 'p02'],
    art: { garment: 'polo', params: {}, back: true, anchorY: 0.19 },
  },
  {
    id: 'p17', slug: 'majica-dugih-rukava', line: 'Osnova', type: 'Majica dugih rukava', category: 'majice', price: 4500,
    fit: 'Regular', fitNote: 'Klasičan kroj, rebrasti rubovi rukava.',
    composition: '100% pamuk', weight: '200 g/m²', fabric: 'jersey',
    description: 'Prvi sloj za hladnije dane. Nosite je samu ili ispod košulje-jakne.',
    details: ['Rebrasti manžeti', 'Okrugli izrez'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('white'), cw('anthracite', { dark: true })],
    tags: [], addedAt: '2026-09-10', popularity: 55, look: ['p30', 'p09'],
    art: { garment: 'crew', params: { fabric: 'jersey', ribFabric: 'rib' }, back: true, anchorY: 0.15 },
  },

  // ───────────────────────────── TRENERKE
  {
    id: 'p18', slug: 'treskavica-gornji-dio-trenerke', line: 'Treskavica', type: 'Gornji dio trenerke', category: 'trenerke', price: 8900,
    fit: 'Regular', fitNote: 'Regular kroj, stojeća kragna, rebrasti rubovi.',
    composition: '100% poliester, triko', weight: '240 g/m²', fabric: 'nylon',
    description: 'Retro trenerka s kontrastnom trakom niz rukave. Kombinujte s donjim dijelom Treskavica za kompletan set.',
    details: ['Patent cijelom dužinom', 'Bočni džepovi s patentom', 'Kontrastne trake'],
    care: CARE_TECH, sizeSystem: 'alpha',
    colorways: [cw('black', { stripe: '#d9d2c5' }, { hex: '#202226', name: 'Crna / ecru', id: 'crna-ecru' }), cw('navy', { stripe: '#efece5' }, { hex: '#1f2a44', name: 'Tamnoplava / bijela', id: 'tamnoplava-bijela' })],
    tags: ['bestseler'], addedAt: '2026-08-20', popularity: 88, look: ['p19', 'p12'],
    art: { garment: 'tracktop', params: { fabric: 'nylon' }, back: true, anchorY: 0.125 },
  },
  {
    id: 'p19', slug: 'treskavica-donji-dio-trenerke', line: 'Treskavica', type: 'Donji dio trenerke', category: 'trenerke', price: 7900,
    fit: 'Regular', fitNote: 'Ravna nogavica s rebrastim rubom, elastični pojas s vezicom.',
    composition: '100% poliester, triko', weight: '240 g/m²', fabric: 'nylon',
    description: 'Donji dio seta Treskavica: elastični pojas, bočni džepovi i kontrastne trake.',
    details: ['Elastični pojas s vezicom', 'Bočni džepovi', 'Kontrastne trake'],
    care: CARE_TECH, sizeSystem: 'alpha',
    colorways: [cw('black', { stripe: '#d9d2c5' }, { hex: '#202226', name: 'Crna / ecru', id: 'crna-ecru' }), cw('navy', { stripe: '#efece5' }, { hex: '#1f2a44', name: 'Tamnoplava / bijela', id: 'tamnoplava-bijela' })],
    tags: ['bestseler'], addedAt: '2026-08-20', popularity: 84, look: ['p18', 'p12'],
    art: { garment: 'joggers', params: { fabric: 'nylon' }, back: true, anchorY: 0.1 },
  },
  {
    id: 'p20', slug: 'zelengora-dukserica-s-kapuljacom', line: 'Zelengora', type: 'Dukserica s kapuljačom', category: 'trenerke', price: 7900,
    fit: 'Regular', fitNote: 'Regular kroj, prostrana kapuljača.',
    composition: '80% pamuk, 20% poliester, flis', weight: '360 g/m²', fabric: 'fleece',
    description: 'Teški flis, četkan iznutra. Klokan džep, dvoslojna kapuljača i rebrasti rubovi.',
    details: ['Dvoslojna kapuljača', 'Klokan džep', 'Četkani flis iznutra'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('grey', { fabric: 'melange', color2: '#c9c4bb' }, { hex: '#9a9389' }), cw('forest', { dark: true })],
    tags: ['bestseler'], addedAt: '2026-09-05', popularity: 91, look: ['p21', 'p13'],
    art: { garment: 'tracktop', params: { hood: true, pullover: true, fabric: 'fleece' }, back: true, anchorY: 0.08 },
  },
  {
    id: 'p21', slug: 'zelengora-donji-dio-trenerke', line: 'Zelengora', type: 'Donji dio trenerke', category: 'trenerke', price: 6900,
    fit: 'Regular', fitNote: 'Blago sužena nogavica s rebrastim rubom.',
    composition: '80% pamuk, 20% poliester, flis', weight: '360 g/m²', fabric: 'fleece',
    description: 'Donji dio seta Zelengora. Teški flis, džepovi sa strane i stražnji džep.',
    details: ['Elastični pojas s vezicom', 'Rebrasti rub nogavice', 'Stražnji džep'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('grey', { fabric: 'melange', color2: '#c9c4bb' }, { hex: '#9a9389' }), cw('forest')],
    tags: [], addedAt: '2026-09-05', popularity: 83, look: ['p20', 'p13'],
    art: { garment: 'joggers', params: { fabric: 'fleece' }, back: true, anchorY: 0.1 },
  },
  {
    id: 'p22', slug: 'duks-okruglog-izreza', line: 'Zelengora', type: 'Duks okruglog izreza', category: 'trenerke', price: 6500,
    fit: 'Regular', fitNote: 'Regular kroj.',
    composition: '80% pamuk, 20% poliester, flis', weight: '340 g/m²', fabric: 'fleece',
    description: 'Klasični duks od teškog flisa. Uz donji dio trenerke čini set, a odlično ide i uz traperice.',
    details: ['Rebrasti rubovi', 'Četkani flis iznutra'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('stone', undefined, { hex: '#a39b8b' }), cw('navy', { dark: true })],
    tags: [], addedAt: '2026-08-28', popularity: 67, look: ['p21', 'p01'],
    art: { garment: 'crew', params: { fabric: 'fleece' }, back: true, anchorY: 0.15 },
  },
  {
    id: 'p23', slug: 'zip-dukserica-s-kapuljacom', line: 'Zelengora', type: 'Zip dukserica', category: 'trenerke', price: 8500,
    fit: 'Regular', fitNote: 'Regular kroj, patent cijelom dužinom.',
    composition: '80% pamuk, 20% poliester, flis', weight: '360 g/m²', fabric: 'melange',
    description: 'Dukserica s patentom i kapuljačom za slojevito oblačenje.',
    details: ['Metalni patent', 'Bočni džepovi', 'Kapuljača s vezicom'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('anthracite', { color2: '#6e6d6b', dark: true }, { hex: '#4a4a4c', name: 'Antracit melanž', id: 'antracit-melanz' })],
    tags: ['novo'], addedAt: '2026-10-15', popularity: 60, look: ['p21', 'p12'],
    art: { garment: 'tracktop', params: { hood: true, fabric: 'melange' }, back: true, anchorY: 0.08 },
  },

  // ───────────────────────────── DŽEMPERI
  {
    id: 'p24', slug: 'prenj-dzemper-okruglog-izreza', line: 'Prenj', type: 'Džemper okruglog izreza', category: 'dzemperi', price: 9900,
    fit: 'Regular', fitNote: 'Regular kroj s blago spuštenim ramenom.',
    composition: '100% janjeća vuna', weight: '7 gauge', fabric: 'knit',
    description: 'Topla janjeća vuna, pletena na srednjoj gustini. Džemper koji se nosi deset zima.',
    details: ['Rebrasti izrez, manžete i rub', 'Spušteno rame', 'Pleteno u jednom komadu'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('brown'), cw('cream'), cw('navy', { dark: true }, { hex: '#26304a' })],
    tags: ['bestseler'], addedAt: '2026-09-15', popularity: 89, look: ['p01', 'p40'],
    art: { garment: 'crew', params: { fabric: 'knit' }, back: true, anchorY: 0.15 },
  },
  {
    id: 'p25', slug: 'cvrsnica-dzemper-s-patentom', line: 'Čvrsnica', type: 'Džemper s patentom', category: 'dzemperi', price: 10900,
    fit: 'Regular', fitNote: 'Regular kroj, visoka kragna s patentom.',
    composition: '60% pamuk, 40% vuna', fabric: 'knit',
    description: 'Džemper s kratkim patentom koji se nosi preko majice ili košulje.',
    details: ['Metalni patent', 'Visoka rebrasta kragna'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('anthracite', { dark: true }, { hex: '#3b3c3f' }), cw('stone', undefined, { hex: '#9a917f' })],
    tags: [], addedAt: '2026-09-28', popularity: 65, look: ['p07', 'p34'],
    art: { garment: 'crew', params: { fabric: 'knit', neck: 'quarterzip' }, back: true, anchorY: 0.15 },
  },
  {
    id: 'p26', slug: 'merino-dzemper', line: 'Merino', type: 'Merino džemper', category: 'dzemperi', price: 11900,
    fit: 'Slim', fitNote: 'Uži kroj; dobar kao sloj ispod sakoa ili jakne.',
    composition: '100% merino vuna', weight: '14 gauge', fabric: 'fineknit',
    description: 'Fini merino, dovoljno tanak za kancelariju i dovoljno topao za vani. Ne grebe i regulira temperaturu.',
    details: ['Fino pletivo', 'Rebrasti rubovi'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('black', { dark: true }), cw('bordo', { dark: true }), cw('grey', { fabric: 'fineknit' }, { hex: '#7c7a76', name: 'Siva', id: 'siva' })],
    tags: ['osnova'], addedAt: '2026-08-30', popularity: 79, look: ['p10', 'p07'],
    art: { garment: 'crew', params: { fabric: 'fineknit', ribFabric: 'rib' }, back: true, anchorY: 0.15 },
  },
  {
    id: 'p27', slug: 'merino-dzemper-v-izreza', line: 'Merino', type: 'Džemper V izreza', category: 'dzemperi', price: 10900,
    fit: 'Slim', fitNote: 'Uži kroj.',
    composition: '100% merino vuna', weight: '14 gauge', fabric: 'fineknit',
    description: 'V izrez koji izgleda uredno preko majice ili košulje.',
    details: ['V izrez', 'Fino pletivo'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('navy', { dark: true }), cw('olive', { dark: true })],
    tags: [], addedAt: '2026-08-30', popularity: 56, look: ['p07', 'p12'],
    art: { garment: 'crew', params: { fabric: 'fineknit', vNeck: true }, back: true, anchorY: 0.15 },
  },
  {
    id: 'p28', slug: 'krupni-pleteni-dzemper', line: 'Prenj', type: 'Krupni pleteni džemper', category: 'dzemperi', price: 13900,
    fit: 'Opušteni', fitNote: 'Opušten kroj; ako želite uži izgled, uzmite broj manje.',
    composition: '70% vuna, 30% alpaka', weight: '3 gauge', fabric: 'knit',
    description: 'Krupno pletivo od vune i alpake. Džemper koji zamjenjuje laganu jaknu u jesen.',
    details: ['Krupno pletivo', 'Spušteno rame', 'Široki rebrasti rubovi'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('ecru', undefined, { hex: '#e3dccb' })],
    tags: ['novo'], addedAt: '2026-10-22', popularity: 71, look: ['p03', 'p42'],
    art: { garment: 'crew', params: { fabric: 'knit', scale: 0.7 }, back: true, anchorY: 0.15 },
  },

  // ───────────────────────────── JAKNE I PRSLUCI
  {
    id: 'p29', slug: 'kozara-traper-jakna', line: 'Kozara', type: 'Traper jakna', category: 'jakne-i-prsluci', price: 13900,
    fit: 'Regular', fitNote: 'Klasičan kraći kroj; ima mjesta za džemper ispod.',
    composition: '100% pamuk', weight: '13 oz', fabric: 'denim',
    description: 'Klasična traper jakna s naprsnim džepovima, metalnom dugmadi i podesivim pojasom.',
    details: ['Dva naprsna džepa s preklopom', 'Metalna dugmad', 'Podesivi pojas'],
    care: CARE_DENIM, sizeSystem: 'alpha',
    colorways: [cw('indigo', undefined, { hex: '#2b3d63' }), cw('black', { color2: '#5a5c60' }, { hex: '#26282c' })],
    tags: ['bestseler'], addedAt: '2026-07-20', popularity: 86, look: ['p12', 'p07'],
    art: { garment: 'trucker', params: {}, back: true, anchorY: 0.165 },
  },
  {
    id: 'p30', slug: 'romanija-radna-jakna', line: 'Romanija', type: 'Radna jakna', category: 'jakne-i-prsluci', price: 14900,
    fit: 'Regular', fitNote: 'Ravan kroj, dovoljno prostora za sloj ispod.',
    composition: '100% pamuk, platno', weight: '360 g/m²', fabric: 'canvas',
    description: 'Radna jakna iz tradicije radne odjeće: tri našivena džepa, kragna i čvrsto platno koje s vremenom omekša.',
    details: ['Tri našivena džepa', 'Rožnata dugmad', 'Dvostruki šavovi'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('olive', undefined, { hex: '#5c5a3c' }), cw('ecru', undefined, { hex: '#d8cfb9' }), cw('navy', undefined, { hex: '#232b3d' })],
    tags: ['novo'], addedAt: '2026-10-05', popularity: 80, look: ['p17', 'p03'],
    art: { garment: 'trucker', params: { fabric: 'canvas', style: 'chore' }, back: true, anchorY: 0.13 },
  },
  {
    id: 'p31', slug: 'jahorina-prosivena-jakna', line: 'Jahorina', type: 'Prošivena jakna', category: 'jakne-i-prsluci', price: 24900,
    fit: 'Regular', fitNote: 'Regular kroj, malo duži stražnji dio.',
    composition: 'Vanjski: 100% poliamid. Punjenje: 100% reciklirani poliester', fabric: 'puffer',
    description: 'Topla prošivena jakna sa sintetičkim punjenjem koje grije i kad je vlažno. Vodoodbojna površina i stojeća kragna.',
    details: ['Sintetičko punjenje', 'Vodoodbojna površina', 'Unutrašnji džep', 'Stojeća kragna'],
    care: CARE_TECH, sizeSystem: 'alpha',
    colorways: [cw('black', { dark: true }, { hex: '#1f2228' }), cw('olive', { dark: true }, { hex: '#4a4c3a', name: 'Tamno maslinasta', id: 'tamno-maslinasta' })],
    tags: ['novo', 'bestseler'], addedAt: '2026-10-25', popularity: 87, look: ['p24', 'p01', 'p42'],
    art: { garment: 'puffer', params: {}, back: true, anchorY: 0.13 },
  },
  {
    id: 'p32', slug: 'vranica-bomber-jakna', line: 'Vranica', type: 'Bomber jakna', category: 'jakne-i-prsluci', price: 17900,
    fit: 'Regular', fitNote: 'Kraći kroj s rebrastim rubom.',
    composition: '100% najlon, lagana podstava', fabric: 'nylon',
    description: 'Lagana bomber jakna s rebrastom kragnom, manžetama i rubom. Džep na rukavu i metalni patent.',
    details: ['Džep na rukavu', 'Rebrasti rubovi', 'Lagana podstava'],
    care: CARE_TECH, sizeSystem: 'alpha',
    colorways: [cw('forest', { rib: '#26241f' }, { hex: '#2f3b2d', name: 'Maslinasta', id: 'maslinasta' }), cw('navy', { rib: '#1c1d22' }, { hex: '#1f2638' })],
    tags: [], addedAt: '2026-09-12', popularity: 73, look: ['p13', 'p02'],
    art: { garment: 'bomber', params: {}, back: true, anchorY: 0.15 },
  },
  {
    id: 'p33', slug: 'vunena-kosulja-jakna', line: 'Romanija', type: 'Vunena košulja-jakna', category: 'jakne-i-prsluci', price: 15900,
    fit: 'Regular', fitNote: 'Ravan kroj, nosi se otkopčana kao jakna ili zakopčana kao košulja.',
    composition: '60% vuna, 40% poliester', weight: '420 g/m²', fabric: 'wool',
    description: 'Debela vunena košulja-jakna. Prijelazni sloj između džempera i kaputa.',
    details: ['Našiveni džepovi', 'Dugmad od roga (imitacija)'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('anthracite', { dark: true }, { hex: '#4d4b48', name: 'Antracit melanž', id: 'antracit-melanz' }), cw('brown', undefined, { hex: '#6a5641' })],
    tags: [], addedAt: '2026-09-18', popularity: 62, look: ['p17', 'p10'],
    art: { garment: 'trucker', params: { fabric: 'wool', style: 'chore' }, back: true, anchorY: 0.13 },
  },
  {
    id: 'p34', slug: 'prosiveni-prsluk', line: 'Jahorina', type: 'Prošiveni prsluk', category: 'jakne-i-prsluci', price: 12900,
    fit: 'Regular', fitNote: 'Regular kroj, ima mjesta za džemper ispod.',
    composition: 'Vanjski: 100% poliamid. Punjenje: 100% reciklirani poliester', fabric: 'puffer',
    description: 'Prošiveni prsluk koji grije trup, a ostavlja ruke slobodnim. Odličan preko džempera.',
    details: ['Sintetičko punjenje', 'Stojeća kragna', 'Bočni džepovi'],
    care: CARE_TECH, sizeSystem: 'alpha',
    colorways: [cw('olive', undefined, { hex: '#6b6e55' }), cw('black', { dark: true }, { hex: '#1f2228' })],
    tags: [], addedAt: '2026-09-25', popularity: 68, look: ['p25', 'p08'],
    art: { garment: 'puffer', params: { vest: true }, back: true, anchorY: 0.15 },
  },
  {
    id: 'p35', slug: 'pleteni-prsluk', line: 'Prenj', type: 'Pleteni prsluk', category: 'jakne-i-prsluci', price: 7900,
    fit: 'Regular', fitNote: 'Regular kroj, nosi se preko košulje ili majice.',
    composition: '100% janjeća vuna', fabric: 'knit',
    description: 'Pleteni prsluk s V izrezom, klasika koja se vratila.',
    details: ['V izrez', 'Rebrasti rubovi'],
    care: CARE_WOOL, sizeSystem: 'alpha',
    colorways: [cw('brown', undefined, { hex: '#7a6a52' }), cw('grey', { fabric: 'knit' }, { hex: '#8b8780', name: 'Siva', id: 'siva' })],
    tags: [], addedAt: '2026-08-15', popularity: 54, look: ['p17', 'p09'],
    art: { garment: 'knitvest', params: {}, back: true, anchorY: 0.19 },
  },

  // ───────────────────────────── ŠORCEVI
  {
    id: 'p36', slug: 'traper-sorc', line: 'Neretva', type: 'Traper šorc', category: 'sorcevi', price: 6900,
    fit: 'Ravni', fitNote: 'Ravan kroj, dužina iznad koljena.',
    composition: '100% pamuk', weight: '12 oz', fabric: 'denim',
    description: 'Traper šorc s pet džepova i porubljenim rubom.',
    details: ['Pet džepova', 'Dužina nogavice 23 cm'],
    care: CARE_DENIM, sizeSystem: 'waist',
    colorways: [cw('washed', { fade: 0.5 })],
    tags: [], addedAt: '2026-05-02', popularity: 52, look: ['p12', 'p16'],
    art: { garment: 'jeans', params: { short: true }, back: true, anchorY: 0.27 },
  },
  {
    id: 'p37', slug: 'chino-sorc', line: 'Igman', type: 'Chino šorc', category: 'sorcevi', price: 5900,
    fit: 'Ravni', fitNote: 'Ravan kroj, dužina iznad koljena.',
    composition: '97% pamuk, 3% elastan', fabric: 'chino',
    description: 'Chino šorc s kosim džepovima za tople dane.',
    details: ['Kosi džepovi', 'Dužina nogavice 20 cm'],
    care: CARE_COTTON, sizeSystem: 'waist',
    colorways: [cw('beige'), cw('navy', undefined, { hex: '#232a3a' })],
    tags: [], addedAt: '2026-05-02', popularity: 57, look: ['p14', 'p16'],
    art: { garment: 'jeans', params: { short: true, fabric: 'chino', chinoPockets: true }, back: true, anchorY: 0.27 },
  },
  {
    id: 'p38', slug: 'sorc-od-flisa', line: 'Zelengora', type: 'Šorc od flisa', category: 'sorcevi', price: 4900,
    fit: 'Regular', fitNote: 'Regular kroj, elastični pojas.',
    composition: '80% pamuk, 20% poliester', weight: '320 g/m²', fabric: 'fleece',
    description: 'Mekani šorc od flisa za trening ili kuću.',
    details: ['Elastični pojas s vezicom', 'Bočni džepovi'],
    care: CARE_COTTON, sizeSystem: 'alpha',
    colorways: [cw('grey', { fabric: 'melange', color2: '#c9c4bb' }, { hex: '#9a9389' }), cw('black')],
    tags: [], addedAt: '2026-05-15', popularity: 50, look: ['p13', 'p20'],
    art: { garment: 'joggers', params: { short: true, fabric: 'fleece' }, back: true, anchorY: 0.27 },
  },

  // ───────────────────────────── KAIŠEVI I DODACI
  {
    id: 'p40', slug: 'kozni-kais-35mm', line: 'Kazandžiluk', type: 'Kožni kaiš 35 mm', category: 'kaisevi-i-dodaci', price: 5900,
    fit: 'Uni', fitNote: 'Veličina kaiša odgovara obimu struka u centimetrima. Pet rupica na razmaku od 2,5 cm.',
    composition: '100% goveđa koža, metalna kopča', fabric: 'leather',
    description: 'Kaiš od pune goveđe kože sa jednostavnom metalnom kopčom. Širina 35 mm, idealna za traperice i chino pantalone.',
    details: ['Širina 35 mm', 'Puna koža', 'Pet rupica'],
    care: CARE_LEATHER, sizeSystem: 'belt',
    colorways: [cw('darkbrown', undefined, { hex: '#4a2f1f' }), cw('black', undefined, { hex: '#1c1b1a' })],
    tags: ['bestseler', 'osnova'], addedAt: '2026-04-20', popularity: 85, look: ['p01', 'p07'],
    art: { garment: 'belt', params: {}, back: false, anchorY: 0.07 },
  },
  {
    id: 'p41', slug: 'kais-od-platna', line: 'Kazandžiluk', type: 'Kaiš od tkanine', category: 'kaisevi-i-dodaci', price: 3500,
    fit: 'Uni', fitNote: 'Podesiva dužina.',
    composition: '100% pamučna traka, metalna kopča', fabric: 'webbing',
    description: 'Lagani kaiš od tkane trake za ljeto i casual kombinacije.',
    details: ['Širina 32 mm', 'Podesiva dužina'],
    care: ['Ručno pranje', 'Sušiti na zraku'], sizeSystem: 'one',
    colorways: [cw('olive', undefined, { hex: '#55573f' }), cw('navy')],
    tags: [], addedAt: '2026-05-10', popularity: 48, look: ['p37', 'p14'],
    art: { garment: 'belt', params: { fabric: 'webbing', metal: '#9b9a96' }, back: false, anchorY: 0.07 },
  },
  {
    id: 'p42', slug: 'pletena-kapa', line: 'Prenj', type: 'Pletena kapa', category: 'kaisevi-i-dodaci', price: 2900,
    fit: 'Uni', fitNote: 'Jedna veličina, rebrasto pletivo se prilagođava.',
    composition: '100% merino vuna', fabric: 'rib',
    description: 'Rebrasta kapa sa širokim zavrnutim rubom.',
    details: ['Široki zavrnuti rub', 'Merino vuna'],
    care: CARE_WOOL, sizeSystem: 'one',
    colorways: [cw('copper'), cw('anthracite'), cw('ecru')],
    tags: ['novo'], addedAt: '2026-10-10', popularity: 76, look: ['p31', 'p28'],
    art: { garment: 'beanie', params: {}, back: false, anchorY: 0.28 },
  },
  {
    id: 'p43', slug: 'carape-3-para', line: 'Osnova', type: 'Čarape, 3 para', category: 'kaisevi-i-dodaci', price: 2500,
    fit: 'Uni', fitNote: 'Dvije veličine: 39–42 i 43–46.',
    composition: '80% pamuk, 18% poliamid, 2% elastan', fabric: 'jersey',
    description: 'Tri para pamučnih čarapa s ojačanom petom i prstima.',
    details: ['3 para u pakovanju', 'Ojačana peta i prsti'],
    care: ['Pranje na 40 °C'], sizeSystem: 'socks',
    colorways: [cw('ecru', { accent: '#1f2633' }, { name: 'Ecru / plava', id: 'ecru-plava' }), cw('black', { accent: '#55524c' })],
    tags: ['osnova'], addedAt: '2026-04-01', popularity: 59,
    art: { garment: 'socks', params: {}, back: false, anchorY: 0.12 },
  },
  {
    id: 'p44', slug: 'vuneni-sal', line: 'Vlašić', type: 'Vuneni šal', category: 'kaisevi-i-dodaci', price: 4900,
    fit: 'Uni', fitNote: 'Dimenzije 180 × 30 cm.',
    composition: '100% vuna', fabric: 'wool',
    description: 'Mekan vuneni šal s resama. Topao, a ne grebe.',
    details: ['180 × 30 cm', 'Rese na krajevima'],
    care: CARE_WOOL, sizeSystem: 'one',
    colorways: [cw('brown', { color2: '#8a7a66' }, { hex: '#5b4a3a' }), cw('grey', { color2: '#a5a29d' }, { hex: '#6e6c69', name: 'Siva', id: 'siva' })],
    tags: [], addedAt: '2026-10-01', popularity: 53, look: ['p31', 'p24'],
    art: { garment: 'scarf', params: {}, back: false, anchorY: 0.12 },
  },
];

// ---------------------------------------------------------------- media paths
export const media = {
  front: (p: Pick<Product, 'slug'>, c: Pick<Colorway, 'id'>) => `/media/p/${p.slug}/${c.id}-front.webp`,
  back: (p: Pick<Product, 'slug'>, c: Pick<Colorway, 'id'>) => `/media/p/${p.slug}/${c.id}-back.webp`,
  detail: (p: Pick<Product, 'slug'>, c: Pick<Colorway, 'id'>) => `/media/p/${p.slug}/${c.id}-detail.webp`,
};

// ---------------------------------------------------------------- deterministic sample stock
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}
/** Sample stock: deterministic, so server and client agree. Replace with live inventory. */
export function sampleStock(productId: string, colorId: string, size: string): number {
  const r = hashStr(`${productId}:${colorId}:${size}`);
  if (r < 0.1) return 0;
  if (r < 0.22) return 1 + Math.floor(r * 10) % 3; // 1–3
  return 4 + Math.floor(r * 40);
}
