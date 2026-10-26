import { describe, expect } from 'vitest';
import { kabul as it } from './kabul';
import {
  AHTAPOT_SURESI_MS,
  EN_IYI_ANAHTAR,
  HUCRE_SAYISI,
  SURE_SN,
  oyunOlustur,
  type Depo,
  type Oyun,
} from './oyun';
import { tohumOku, tohumluRng } from './rng';

// ---- Yardımcılar -----------------------------------------------------------

const SURE_MS = SURE_SN * 1000;

function yeniDepo(baslangic: Record<string, string> = {}): Depo {
  const veri = new Map(Object.entries(baslangic));
  return {
    getItem: (a) => veri.get(a) ?? null,
    setItem: (a, d) => void veri.set(a, d),
  };
}

/** Sahte saatli oyun: zaman yalnızca `ilerle` ile akar, gerçek zaman beklenmez. */
function kur(rng: () => number = tohumluRng(1), depo: Depo = yeniDepo()) {
  let t = 1_700_000_000_000;
  const oyun = oyunOlustur({ rng, now: () => t, depo });
  const ilerle = (ms: number) => {
    t += ms;
    oyun.guncelle();
  };
  const baslat = () => {
    oyun.basla();
    return oyun;
  };
  return { oyun, ilerle, baslat, depo };
}

/** Görünen ahtapotun hücresi; yoksa testi anlamlı bir hatayla düşürür. */
function ahtapotun(oyun: Oyun): number {
  const h = oyun.ahtapot;
  if (h === null) throw new Error('ahtapot görünür olmalıydı');
  return h;
}

/** Her adımda görünen ahtapota dokunarak tam `n` puan alır, sonra süreyi bitirir. */
function nPuanlaBitir(k: ReturnType<typeof kur>, n: number) {
  k.baslat();
  let elapsed = 0;
  for (let i = 0; i < n; i++) {
    k.oyun.tikla(ahtapotun(k.oyun));
    k.ilerle(AHTAPOT_SURESI_MS);
    elapsed += AHTAPOT_SURESI_MS;
  }
  k.ilerle(SURE_MS - elapsed);
}

const SABIT_RNGLER: [string, () => () => number][] = [
  ['rng=0', () => () => 0],
  ['rng=0.5', () => () => 0.5],
  ['rng=0.999', () => () => 0.999],
  ['tohum 7', () => tohumluRng(7)],
  ['tohum 123', () => tohumluRng(123)],
];

// ---- KK-1 / KK-2: başlangıç ve oyun durumu ---------------------------------

describe('KK-1 başlangıç', () => {
  it('KK-1: oyun "baslangic" evresinde açılır, skor 0, ahtapot yok', () => {
    const { oyun } = kur();
    expect(oyun.evre).toBe('baslangic');
    expect(oyun.skor).toBe(0);
    expect(oyun.ahtapot).toBeNull();
  });

  it('KK-1: başlamadan önce tıklama ve zaman akışı bir şey değiştirmez', () => {
    const { oyun, ilerle } = kur();
    oyun.tikla(0);
    ilerle(5000);
    expect(oyun.evre).toBe('baslangic');
    expect(oyun.skor).toBe(0);
  });
});

describe('KK-2 oyun başlangıcı', () => {
  it('KK-2: basla sonrası evre "oyun", skor 0, kalan süre 30', () => {
    const oyun = kur().baslat();
    expect(oyun.evre).toBe('oyun');
    expect(oyun.skor).toBe(0);
    expect(oyun.kalanSure).toBe(30);
  });

  it('KK-2: ilk ahtapot hemen görünür ve 0–8 arası tam sayı hücrededir', () => {
    const oyun = kur().baslat();
    const h = ahtapotun(oyun);
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(HUCRE_SAYISI);
  });

  it('KK-2: kalan süre yukarı yuvarlanan tam saniyedir', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    ilerle(1);
    expect(oyun.kalanSure).toBe(30);
    ilerle(999); // toplam 1000 ms
    expect(oyun.kalanSure).toBe(29);
    ilerle(9500); // toplam 10500 ms
    expect(oyun.kalanSure).toBe(20);
  });
});

// ---- KK-3 / KK-4: dokunma ---------------------------------------------------

describe('KK-3 ahtapota dokunma', () => {
  it('KK-3: ahtapotun hücresine tıklamak skoru tam 1 artırır', () => {
    const oyun = kur().baslat();
    oyun.tikla(ahtapotun(oyun));
    expect(oyun.skor).toBe(1);
  });

  it('KK-3: vurulan ahtapot hemen kaybolur (ahtapot = null)', () => {
    const oyun = kur().baslat();
    oyun.tikla(ahtapotun(oyun));
    expect(oyun.ahtapot).toBeNull();
  });

  it('KK-3: aynı ahtapota ikinci (çift) tıklama skoru değiştirmez', () => {
    const oyun = kur().baslat();
    const h = ahtapotun(oyun);
    oyun.tikla(h);
    oyun.tikla(h);
    oyun.tikla(h);
    expect(oyun.skor).toBe(1);
  });

  it('KK-3: her yeni ahtapot ayrı +1 verir', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    for (let i = 1; i <= 5; i++) {
      oyun.tikla(ahtapotun(oyun));
      expect(oyun.skor).toBe(i);
      ilerle(AHTAPOT_SURESI_MS);
    }
  });
});

describe('KK-4 boş hücre', () => {
  it('KK-4: boş hücreye tıklamak skoru ve ahtapotu değiştirmez (her boş hücre için)', () => {
    const oyun = kur().baslat();
    const h = ahtapotun(oyun);
    for (let i = 0; i < HUCRE_SAYISI; i++) {
      if (i === h) continue;
      oyun.tikla(i);
    }
    expect(oyun.skor).toBe(0);
    expect(oyun.ahtapot).toBe(h);
  });

  it('KK-4: boş hücreye tıklamak ceza vermez, sonra doğru tıklama yine +1 olur', () => {
    const oyun = kur().baslat();
    const h = ahtapotun(oyun);
    oyun.tikla((h + 1) % HUCRE_SAYISI);
    oyun.tikla(h);
    expect(oyun.skor).toBe(1);
  });

  it('KK-4: geçersiz hücre numarası skoru değiştirmez ve hata fırlatmaz', () => {
    const oyun = kur().baslat();
    expect(() => {
      oyun.tikla(-1);
      oyun.tikla(9);
      oyun.tikla(Number.NaN);
    }).not.toThrow();
    expect(oyun.skor).toBe(0);
  });
});

// ---- KK-5 / KK-6: ahtapot hareketi -----------------------------------------

describe('KK-5 ahtapot hareketi', () => {
  it('KK-5: 1 sn dolmadan ahtapot yerinde kalır, 1 sn dolunca geçer', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    const ilk = ahtapotun(oyun);
    ilerle(AHTAPOT_SURESI_MS - 1);
    expect(oyun.ahtapot).toBe(ilk);
    ilerle(1);
    expect(ahtapotun(oyun)).not.toBe(ilk);
  });

  for (const [ad, rngUret] of SABIT_RNGLER) {
    it(`KK-5: art arda iki konum asla aynı hücre değildir (${ad}, 29 geçiş)`, () => {
      const { oyun, ilerle, baslat } = kur(rngUret());
      baslat();
      let onceki = ahtapotun(oyun);
      for (let i = 0; i < SURE_SN - 1; i++) {
        ilerle(AHTAPOT_SURESI_MS);
        const simdiki = ahtapotun(oyun);
        expect(simdiki).not.toBe(onceki);
        expect(simdiki).toBeGreaterThanOrEqual(0);
        expect(simdiki).toBeLessThan(HUCRE_SAYISI);
        onceki = simdiki;
      }
    });
  }

  it('KK-5: ahtapota vurulsa bile sıradaki konum son konumdan farklıdır', () => {
    const { oyun, ilerle, baslat } = kur(() => 0);
    baslat();
    for (let i = 0; i < 10; i++) {
      const vurulan = ahtapotun(oyun);
      oyun.tikla(vurulan);
      ilerle(AHTAPOT_SURESI_MS);
      expect(ahtapotun(oyun)).not.toBe(vurulan);
    }
  });

  it('KK-5: 1 sn adımları tek seferde atlansa da (sekme arka planda) oyun tutarlı kalır', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    ilerle(7300);
    expect(oyun.evre).toBe('oyun');
    expect(oyun.kalanSure).toBe(23);
    const h = ahtapotun(oyun);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(HUCRE_SAYISI);
  });
});

describe('KK-6 aynı anda en fazla bir ahtapot', () => {
  it('KK-6: ahtapot tek bir hücre numarası ya da null’dır (hiçbir an iki değer yok)', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    for (let i = 0; i < SURE_SN; i++) {
      const h = oyun.ahtapot;
      expect(h === null || Number.isInteger(h)).toBe(true);
      ilerle(AHTAPOT_SURESI_MS);
    }
  });
});

// ---- KK-7: süre bitişi -------------------------------------------------------

describe('KK-7 süre bitişi', () => {
  it('KK-7: 29,999 sn’de oyun sürer, 30. saniyede biter', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    ilerle(SURE_MS - 1);
    expect(oyun.evre).toBe('oyun');
    expect(oyun.kalanSure).toBe(1);
    ilerle(1);
    expect(oyun.evre).toBe('bitis');
    expect(oyun.kalanSure).toBe(0);
  });

  it('KK-7: bitişte ahtapot görünmez', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    ilerle(SURE_MS);
    expect(oyun.ahtapot).toBeNull();
  });

  it('KK-7: süre bitince yapılan tıklamalar sayılmaz (tüm hücreler)', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    oyun.tikla(ahtapotun(oyun));
    expect(oyun.skor).toBe(1);
    ilerle(SURE_MS);
    for (let i = 0; i < HUCRE_SAYISI; i++) oyun.tikla(i);
    expect(oyun.skor).toBe(1);
  });

  it('KK-7: sekme arka planda kalıp zaman tek adımda 30 sn’yi aşsa da oyun biter', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    ilerle(SURE_MS * 3);
    expect(oyun.evre).toBe('bitis');
    expect(oyun.kalanSure).toBe(0);
  });

  it('KK-7: bittikten sonra zaman akmaya devam etse de evre ve skor değişmez', () => {
    const { oyun, ilerle, baslat } = kur();
    baslat();
    ilerle(SURE_MS);
    const skor = oyun.skor;
    ilerle(10_000);
    expect(oyun.evre).toBe('bitis');
    expect(oyun.skor).toBe(skor);
    expect(oyun.kalanSure).toBe(0);
  });
});

describe('KK-7 zamanlayıcı tetiklenmeden gelen tıklama (regresyon)', () => {
  it('KK-7: süre dolduktan sonra guncelle çağrılmadan gelen tıklama sayılmaz', () => {
    let t = 1_700_000_000_000;
    const oyun = oyunOlustur({ rng: tohumluRng(1), now: () => t });
    oyun.basla();
    const h = ahtapotun(oyun);
    t += SURE_MS + 50;
    oyun.tikla(h);
    expect(oyun.skor).toBe(0);
    expect(oyun.evre).toBe('bitis');
  });

  it('KK-5: ahtapot geçtikten sonra guncelle çağrılmadan eski hücreye tıklamak sayılmaz', () => {
    let t = 1_700_000_000_000;
    const oyun = oyunOlustur({ rng: tohumluRng(1), now: () => t });
    oyun.basla();
    const eski = ahtapotun(oyun);
    t += AHTAPOT_SURESI_MS + 50;
    oyun.tikla(eski);
    expect(oyun.skor).toBe(0);
  });
});

// ---- KK-8: skor ve en iyi skor ----------------------------------------------

describe('KK-8 skor ve en iyi skor', () => {
  it('KK-8: bitişte skor oyundaki puana eşittir', () => {
    const k = kur();
    nPuanlaBitir(k, 4);
    expect(k.oyun.evre).toBe('bitis');
    expect(k.oyun.skor).toBe(4);
  });

  it('KK-8: ilk oyunun skoru en iyi skor olur', () => {
    const k = kur();
    nPuanlaBitir(k, 3);
    expect(k.oyun.enIyi).toBe(3);
  });

  it('KK-8: en iyi skor localStorage uyumlu depoda saklanır', () => {
    const k = kur();
    nPuanlaBitir(k, 5);
    expect(k.depo.getItem(EN_IYI_ANAHTAR)).toBe('5');
  });

  it('KK-8: "sayfa yenilense de" — aynı depoyla yeni oyun en iyi skoru görür', () => {
    const depo = yeniDepo();
    nPuanlaBitir(kur(tohumluRng(1), depo), 6);
    const yenilenmis = kur(tohumluRng(2), depo);
    expect(yenilenmis.oyun.enIyi).toBe(6);
    expect(yenilenmis.oyun.evre).toBe('baslangic');
  });

  it('KK-8: daha düşük skor en iyi skorun üzerine yazmaz', () => {
    const depo = yeniDepo({ [EN_IYI_ANAHTAR]: '9' });
    const k = kur(tohumluRng(1), depo);
    nPuanlaBitir(k, 2);
    expect(k.oyun.skor).toBe(2);
    expect(k.oyun.enIyi).toBe(9);
    expect(depo.getItem(EN_IYI_ANAHTAR)).toBe('9');
  });

  it('KK-8: daha yüksek skor en iyi skoru günceller', () => {
    const depo = yeniDepo({ [EN_IYI_ANAHTAR]: '2' });
    const k = kur(tohumluRng(1), depo);
    nPuanlaBitir(k, 7);
    expect(k.oyun.enIyi).toBe(7);
    expect(depo.getItem(EN_IYI_ANAHTAR)).toBe('7');
  });

  it('KK-8: depo boşsa veya bozuksa en iyi skor 0’dır, çökmez', () => {
    expect(kur().oyun.enIyi).toBe(0);
    for (const bozuk of ['abc', '', '-3', 'NaN']) {
      const { oyun } = kur(
        tohumluRng(1),
        yeniDepo({ [EN_IYI_ANAHTAR]: bozuk }),
      );
      expect(oyun.enIyi).toBe(0);
    }
  });
});

// ---- KK-9: tekrar oyna -------------------------------------------------------

describe('KK-9 tekrar oyna', () => {
  it('KK-9: skor 0’a, süre 30’a döner ve oyun yeniden başlar', () => {
    const k = kur();
    nPuanlaBitir(k, 4);
    k.oyun.tekrarOyna();
    expect(k.oyun.evre).toBe('oyun');
    expect(k.oyun.skor).toBe(0);
    expect(k.oyun.kalanSure).toBe(30);
    expect(k.oyun.ahtapot).not.toBeNull();
  });

  it('KK-9: en iyi skor korunur', () => {
    const k = kur();
    nPuanlaBitir(k, 4);
    k.oyun.tekrarOyna();
    expect(k.oyun.enIyi).toBe(4);
    expect(k.depo.getItem(EN_IYI_ANAHTAR)).toBe('4');
  });

  it('KK-9: yeni oyunun süresi tekrar oyna anından sayılır (eski süre devam etmez)', () => {
    const k = kur();
    nPuanlaBitir(k, 1);
    k.ilerle(5000);
    k.oyun.tekrarOyna();
    k.ilerle(SURE_MS - 1);
    expect(k.oyun.evre).toBe('oyun');
    k.ilerle(1);
    expect(k.oyun.evre).toBe('bitis');
  });

  it('KK-9: ikinci oyunda da tıklamalar sayılır, ilk oyunun puanı sızmaz', () => {
    const k = kur();
    nPuanlaBitir(k, 3);
    k.oyun.tekrarOyna();
    k.oyun.tikla(ahtapotun(k.oyun));
    expect(k.oyun.skor).toBe(1);
  });
});

// ---- KK-10: seed -------------------------------------------------------------

/** Her adımdaki ahtapot konumlarını (vurmadan) kaydeder. */
function dizi(rng: () => number): (number | null)[] {
  const { oyun, ilerle, baslat } = kur(rng);
  baslat();
  const konumlar: (number | null)[] = [oyun.ahtapot];
  for (let i = 0; i < SURE_SN - 1; i++) {
    ilerle(AHTAPOT_SURESI_MS);
    konumlar.push(oyun.ahtapot);
  }
  return konumlar;
}

describe('KK-10 seed', () => {
  it('KK-10: aynı seed ile ahtapotun çıkış sırası her seferinde aynıdır', () => {
    const a = dizi(tohumluRng(42));
    const b = dizi(tohumluRng(42));
    expect(a).toHaveLength(SURE_SN);
    expect(a).toEqual(b);
  });

  it('KK-10: farklı seed farklı sıra üretir', () => {
    expect(dizi(tohumluRng(1))).not.toEqual(dizi(tohumluRng(2)));
  });

  it('KK-10: oyuncu davranışı (vurma) sırayı bozmaz — aynı seed + aynı tıklamalar = aynı skor', () => {
    const oyna = () => {
      const k = kur(tohumluRng(99));
      nPuanlaBitir(k, 5);
      return k.oyun.skor;
    };
    expect(oyna()).toBe(5);
    expect(oyna()).toBe(oyna());
  });

  it('KK-10: tohumluRng [0,1) aralığında ve deterministik üretir', () => {
    const a = tohumluRng(5);
    const b = tohumluRng(5);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      expect(x).toBe(b());
    }
  });

  it('KK-10: URL’den seed okunur', () => {
    expect(tohumOku('?seed=42')).toBe(42);
    expect(tohumOku('?x=1&seed=7')).toBe(7);
    expect(tohumOku('')).toBeNull();
    expect(tohumOku('?seed=')).toBeNull();
    expect(tohumOku('?seed=abc')).toBeNull();
    expect(tohumOku('?baska=3')).toBeNull();
  });
});
