// OYUN MANTIĞI ARAYÜZÜ (sözleşme) — kabul testleri (#3) bu arayüze göre yazıldı.
// Bu dosya şimdilik yalnızca ARAYÜZÜ tanımlar; gövde #4'te (frontend) yazılır.
// Davranış kuralları ve ayrıntılar: docs/PRD.md ve src/oyun.test.ts.

export const HUCRE_SAYISI = 9;
export const SURE_SN = 30;
/** Ahtapot bu kadar ms görünür kalır, sonra başka hücreye geçer. */
export const AHTAPOT_SURESI_MS = 1000;
/** En iyi skorun localStorage anahtarı (değer: tam sayı, metin olarak). */
export const EN_IYI_ANAHTAR = 'ahtapot-yakala:en-iyi';

export type Evre = 'baslangic' | 'oyun' | 'bitis';

/** localStorage ile uyumlu en küçük arayüz. */
export interface Depo {
  getItem(anahtar: string): string | null;
  setItem(anahtar: string, deger: string): void;
}

export interface OyunSecenekleri {
  /** [0, 1) aralığında sayı üretir. Dışarıdan verilir (tohumlu PRNG). */
  rng: () => number;
  /** Şu anki zaman (ms). Dışarıdan verilir (sahte saat); `Date.now` olabilir. */
  now: () => number;
  /** Verilmezse en iyi skor kalıcı olmaz. */
  depo?: Depo;
}

export interface Oyun {
  /** Başlangıçta 'baslangic'. */
  readonly evre: Evre;
  readonly skor: number;
  /** Tam saniye, yukarı yuvarlanır: başta 30, oyun bitince 0. */
  readonly kalanSure: number;
  /** Depodaki en iyi skor (yoksa veya bozuksa 0). Bitişte güncellenir. */
  readonly enIyi: number;
  /** Ahtapotun hücresi (0–8); görünmüyorsa (vurulduktan sonra, oyun dışında) null. */
  readonly ahtapot: number | null;
  /** 'baslangic' → 'oyun'. İlk ahtapot hemen görünür. */
  basla(): void;
  /** Hücreye dokunma. Yalnızca evre 'oyun' iken sayılır. */
  tikla(hucre: number): void;
  /** 'bitis' → 'oyun': skor 0, süre 30; en iyi skor korunur. */
  tekrarOyna(): void;
  /** Zamanı `now()` değerine ilerletir (arayüz bunu zamanlayıcıyla çağırır). */
  guncelle(): void;
}

export function oyunOlustur(secenekler: OyunSecenekleri): Oyun {
  throw new Error(`oyunOlustur henüz yazılmadı (#4): ${typeof secenekler}`);
}
