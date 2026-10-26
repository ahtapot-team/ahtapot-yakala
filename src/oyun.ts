// OYUN MANTIĞI (sözleşme + gövde). Kabul testleri: src/oyun.test.ts. Kurallar: docs/PRD.md.
// Saf mantık: DOM yok; zaman (`now`), rastgelelik (`rng`) ve depo dışarıdan verilir.

export const HUCRE_SAYISI = 9;
export const SURE_SN = 30;
/** Ahtapot bu kadar ms görünür kalır, sonra başka hücreye geçer. */
export const AHTAPOT_SURESI_MS = 1000;
/** En iyi skorun localStorage anahtarı (değer: tam sayı, metin olarak). */
export const EN_IYI_ANAHTAR = 'ahtapot-yakala:en-iyi';

const SURE_MS = SURE_SN * 1000;

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
  /** Kalan süre (ms), son `guncelle` anına göre: başta 30000, bitişte 0. */
  readonly kalanMs: number;
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

function enIyiOku(depo: Depo | undefined): number {
  const ham = depo?.getItem(EN_IYI_ANAHTAR);
  return ham != null && /^\d+$/.test(ham) ? Number(ham) : 0;
}

export function oyunOlustur({ rng, now, depo }: OyunSecenekleri): Oyun {
  let evre: Evre = 'baslangic';
  let skor = 0;
  let enIyi = enIyiOku(depo);
  let ahtapot: number | null = null;
  let son = -1; // son görünen konum (vurulsa bile art arda aynı hücre olmasın)
  let baslangicMs = 0;
  let sonrakiGecisMs = 0;
  let simdi = 0; // son `guncelle` anı

  const ilkKonum = () => Math.floor(rng() * HUCRE_SAYISI);
  const sonrakiKonum = () =>
    (son + 1 + Math.floor(rng() * (HUCRE_SAYISI - 1))) % HUCRE_SAYISI;

  const goster = (hucre: number) => {
    son = hucre;
    ahtapot = hucre;
  };

  const bitir = () => {
    evre = 'bitis';
    ahtapot = null;
    if (skor > enIyi) {
      enIyi = skor;
      depo?.setItem(EN_IYI_ANAHTAR, String(enIyi));
    }
  };

  const baslat = () => {
    evre = 'oyun';
    skor = 0;
    baslangicMs = simdi = now();
    sonrakiGecisMs = baslangicMs + AHTAPOT_SURESI_MS;
    son = -1;
    goster(ilkKonum());
  };

  const kalanMs = () => {
    if (evre === 'baslangic') return SURE_MS;
    if (evre === 'bitis') return 0;
    return Math.max(0, SURE_MS - (simdi - baslangicMs));
  };

  return {
    get evre() {
      return evre;
    },
    get skor() {
      return skor;
    },
    get kalanSure() {
      return Math.ceil(kalanMs() / 1000);
    },
    get kalanMs() {
      return kalanMs();
    },
    get enIyi() {
      return enIyi;
    },
    get ahtapot() {
      return ahtapot;
    },
    basla() {
      if (evre === 'baslangic') baslat();
    },
    tikla(hucre) {
      if (evre !== 'oyun' || ahtapot === null || hucre !== ahtapot) return;
      skor += 1;
      ahtapot = null;
    },
    tekrarOyna() {
      if (evre === 'bitis') baslat();
    },
    guncelle() {
      if (evre !== 'oyun') return;
      simdi = now();
      if (simdi - baslangicMs >= SURE_MS) {
        bitir();
        return;
      }
      // Arka plandaki sekmede kaçan geçişleri sırayla yakala.
      while (simdi >= sonrakiGecisMs) {
        goster(sonrakiKonum());
        sonrakiGecisMs += AHTAPOT_SURESI_MS;
      }
    },
  };
}
