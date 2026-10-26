import { expect, test, type Page } from '@playwright/test';
import { BEKLEYEN } from './kabul';

// Kabul testleri: KK-1, KK-2, KK-3, KK-4, KK-6, KK-7, KK-8, KK-9, KK-11 (E2E kısmı).
// Zaman Playwright'ın sahte saatiyle ilerler; gerçek 30 sn beklenmez.
// Konum kanıtı: ahtapotun bulunduğu hücre `dolu` sınıfını taşır (design/2-oyun-ekrani/a.html).

const DOLU = '[data-testid^="hucre-"].dolu';
const BOS = '[data-testid^="hucre-"]:not(.dolu)';

const id = (n: string) => `[data-testid="${n}"]`;

async function ac(page: Page, seed = 7) {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.goto(`./?seed=${seed}`);
}

async function doluId(page: Page): Promise<string> {
  const h = page.locator(DOLU);
  await expect(h).toHaveCount(1);
  const v = await h.getAttribute('data-testid');
  if (!v) throw new Error('dolu hücrenin data-testid değeri yok');
  return v;
}

test.describe('Kabul testleri — akış', () => {
  test.beforeEach(() => {
    test.fail(BEKLEYEN, 'Oyun henüz yok (#4); beklendiği gibi kırmızı');
  });

  test('KK-1 / KK-2: başlangıç ekranı → Başla → 9 hücre, skor 0, süre 30', async ({
    page,
  }) => {
    await ac(page);
    await expect(page.locator(id('basla'))).toBeVisible(); // KK-1
    await expect(page.locator(id('hucre-0'))).toHaveCount(0);

    await page.locator(id('basla')).click();
    await expect(page.locator('[data-testid^="hucre-"]')).toHaveCount(9); // KK-2
    await expect(page.locator(id('skor'))).toHaveText('0');
    await expect(page.locator(id('sure'))).toHaveText('30');
  });

  test('KK-3 / KK-4 / KK-6: vur +1, ikinci tıklama +0, boş hücre +0, tek ahtapot', async ({
    page,
  }) => {
    await ac(page);
    await page.locator(id('basla')).click();

    const bos = await page.locator(BOS).first().getAttribute('data-testid');
    await page.locator(id(bos!)).click(); // KK-4
    await expect(page.locator(id('skor'))).toHaveText('0');

    const dolu = await doluId(page); // KK-6: tam bir tane
    await page.locator(id(dolu)).click(); // KK-3
    await expect(page.locator(id('skor'))).toHaveText('1');
    await page.locator(id(dolu)).click(); // aynı hücreye ikinci tıklama
    await expect(page.locator(id('skor'))).toHaveText('1');
    await expect(page.locator(DOLU)).toHaveCount(0); // vurulan hemen kayboldu

    // Her saniye en fazla bir ahtapot; art arda aynı hücre değil (KK-5/KK-6).
    let onceki = dolu;
    for (let i = 0; i < 5; i++) {
      await page.clock.runFor(1000);
      const simdiki = await doluId(page);
      expect(simdiki).not.toBe(onceki);
      onceki = simdiki;
    }
  });

  test('KK-7 / KK-8 / KK-9: 30 sn → bitiş, tıklama sayılmaz, en iyi skor yenilemede kalır, tekrar oyna', async ({
    page,
  }) => {
    await ac(page);
    await page.locator(id('basla')).click();
    await page.locator(id(await doluId(page))).click();
    await expect(page.locator(id('skor'))).toHaveText('1');

    await page.clock.runFor(29_000);
    await expect(page.locator(id('sure'))).toHaveText('1');
    await page.clock.runFor(1000); // 30. saniye

    // Bitiş ekranı (KK-7, KK-8)
    await expect(page.locator(id('tekrar-oyna'))).toBeVisible();
    await expect(page.locator(id('skor'))).toHaveText('1');
    await expect(page.locator(id('en-iyi'))).toHaveText('1');
    await expect(page.locator(DOLU)).toHaveCount(0);

    // Süre bitince tıklamalar sayılmaz
    for (let i = 0; i < 9; i++) {
      const hucre = page.locator(id(`hucre-${i}`));
      // Bitiş ekranında hücreler hiç olmayabilir; varsa tıklamak skoru değiştirmemeli.
      if ((await hucre.count()) > 0) await hucre.click({ force: true });
    }
    await expect(page.locator(id('skor'))).toHaveText('1');

    // KK-8: sayfa yenilense de en iyi skor korunur (localStorage)
    await page.reload();
    await page.locator(id('basla')).click();
    await page.clock.runFor(30_000); // hiç vurmadan bitir → skor 0
    await expect(page.locator(id('skor'))).toHaveText('0');
    await expect(page.locator(id('en-iyi'))).toHaveText('1'); // eski en iyi duruyor

    // KK-9: tekrar oyna → skor 0, süre 30, en iyi skor korunur
    await page.locator(id('tekrar-oyna')).click();
    await expect(page.locator(id('skor'))).toHaveText('0');
    await expect(page.locator(id('sure'))).toHaveText('30');
    await page.locator(id(await doluId(page))).click();
    await expect(page.locator(id('skor'))).toHaveText('1');
  });

  test('KK-10: aynı seed (?seed=) aynı ilk ahtapot sırasını verir', async ({
    page,
  }) => {
    const sira = async () => {
      await ac(page, 11);
      await page.locator(id('basla')).click();
      const s = [await doluId(page)];
      for (let i = 0; i < 4; i++) {
        await page.clock.runFor(1000);
        s.push(await doluId(page));
      }
      return s;
    };
    const a = await sira();
    const b = await sira();
    expect(a).toEqual(b);
  });
});

test.describe('KK-11 mobil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test.beforeEach(() => {
    test.fail(BEKLEYEN, 'Oyun henüz yok (#4); beklendiği gibi kırmızı');
  });

  const yatayKaymaYok = async (page: Page) => {
    const tasma = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(tasma).toBeLessThanOrEqual(0);
  };

  test('KK-11: yatay kaydırma yok, hücre ≥96px, çift dokunmada zoom yok', async ({
    page,
  }) => {
    await ac(page);
    await yatayKaymaYok(page); // başlangıç ekranı
    await page.locator(id('basla')).click();
    await yatayKaymaYok(page); // oyun ekranı

    for (let i = 0; i < 9; i++) {
      const kutu = await page.locator(id(`hucre-${i}`)).boundingBox();
      expect(kutu, `hucre-${i} görünür olmalı`).not.toBeNull();
      expect(kutu!.width).toBeGreaterThanOrEqual(96);
      expect(kutu!.height).toBeGreaterThanOrEqual(96);
    }

    const dokunma = await page
      .locator(id('hucre-0'))
      .evaluate((el) => getComputedStyle(el).touchAction);
    expect(['manipulation', 'none']).toContain(dokunma);
  });

  test('KK-11: bitiş ekranında da yatay kaydırma yok', async ({ page }) => {
    await ac(page);
    await page.locator(id('basla')).click();
    await page.clock.runFor(30_000);
    await expect(page.locator(id('tekrar-oyna'))).toBeVisible();
    await yatayKaymaYok(page);
  });
});
