// ARAYÜZ: oyun mantığını (oyun.ts) tasarıma (design/2-oyun-ekrani/a.html) bağlar.
// Her evre için DOM bir kez kurulur; oyun sırasında yalnızca metin/sınıf güncellenir
// (hücreler yeniden oluşmaz, böylece dokunuşlar kaybolmaz).
import { BASLIK } from './baslik';
import { HUCRE_SAYISI, type Evre, type Oyun } from './oyun';

const TIK_MS = 100;
const ARTI_MS = 400;

const AHTAPOT_SVG = `<svg width="76" height="76" aria-hidden="true" viewBox="0 0 100 100">
  <g fill="#ff7a59">
    <ellipse cx="50" cy="38" rx="26" ry="24"/>
    <path d="M28 50 q-6 22 -18 26 q10 2 18 -8 q2 14 -6 24 q12 -4 16 -20 q0 14 4 22 q6 -10 4 -22 q4 14 12 20 q2 -12 -4 -22 q8 14 18 16 q-6 -10 -4 -22 q8 10 18 8 q-12 -4 -16 -26 z"/>
  </g>
  <circle cx="41" cy="36" r="5" fill="#fff"/><circle cx="59" cy="36" r="5" fill="#fff"/>
  <circle cx="42" cy="37" r="2.4" fill="#0f2a4a"/><circle cx="60" cy="37" r="2.4" fill="#0f2a4a"/>
</svg>`;

const LOGO_SVG = AHTAPOT_SVG.replace(
  'width="76" height="76"',
  'width="88" height="88"',
);

function sablon(html: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
}

function sor<T extends Element>(kok: ParentNode, secici: string): T {
  const el = kok.querySelector<T>(secici);
  if (!el) throw new Error(`öğe bulunamadı: ${secici}`);
  return el;
}

export function arayuzKur(kok: HTMLElement, oyun: Oyun): void {
  let gosterilen: Evre | null = null;
  let guncelleEkran: () => void = () => {};
  let zamanlayici: number | undefined;
  let oyunBasiEnIyi = oyun.enIyi;

  const durdur = () => {
    if (zamanlayici !== undefined) clearInterval(zamanlayici);
    zamanlayici = undefined;
  };
  const baslatZamanlayici = () => {
    durdur();
    zamanlayici = window.setInterval(() => {
      oyun.guncelle();
      ciz();
    }, TIK_MS);
  };

  function baslangicEkrani(): void {
    const ekran = sablon(`
      <section class="ekran baslangic">
        <div class="hero">
          <div class="logo">${LOGO_SVG}</div>
          <h1></h1>
          <p class="aciklama">30 saniyen var. Ahtapot nerede belirirse oraya dokun!</p>
          <span class="rozet" hidden>🏆 En iyi skorun: <b data-rozet></b></span>
        </div>
        <div class="alt">
          <button class="btn" data-testid="basla">Başla</button>
          <p class="ipucu">Boş kareye dokunmanın cezası yok.</p>
        </div>
      </section>`);
    sor(ekran, 'h1').textContent = BASLIK;
    const rozet = sor<HTMLElement>(ekran, '.rozet');
    sor(ekran, '[data-testid="basla"]').addEventListener('click', () => {
      oyunBasiEnIyi = oyun.enIyi;
      oyun.basla();
      baslatZamanlayici();
      ciz();
    });
    guncelleEkran = () => {
      rozet.hidden = oyun.enIyi === 0;
      sor(rozet, '[data-rozet]').textContent = String(oyun.enIyi);
    };
    kok.replaceChildren(ekran);
  }

  function oyunEkrani(): void {
    const ekran = sablon(`
      <section class="ekran oyun">
        <div class="ust">
          <div class="sayac"><small>SKOR</small><strong data-testid="skor" aria-live="polite"></strong></div>
          <div class="sayac sag"><small>KALAN SÜRE</small><strong data-testid="sure"></strong></div>
        </div>
        <div class="cubuk"><span></span></div>
        <div class="izgara"></div>
        <p class="ipucu">Ahtapota dokun!</p>
      </section>`);
    const izgara = sor(ekran, '.izgara');
    const hucreler: HTMLButtonElement[] = [];
    for (let i = 0; i < HUCRE_SAYISI; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hucre';
      b.dataset.testid = `hucre-${i}`;
      b.addEventListener('click', () => {
        const once = oyun.skor;
        oyun.tikla(i);
        if (oyun.skor > once)
          vurulan = { hucre: i, bitis: performance.now() + ARTI_MS };
        ciz();
      });
      hucreler.push(b);
    }
    izgara.append(...hucreler);

    const skor = sor(ekran, '[data-testid="skor"]');
    const sure = sor(ekran, '[data-testid="sure"]');
    const cubuk = sor<HTMLElement>(ekran, '.cubuk span');
    let vurulan: { hucre: number; bitis: number } | null = null;
    let sonAhtapot: number | null = null;

    guncelleEkran = () => {
      skor.textContent = String(oyun.skor);
      sure.textContent = String(oyun.kalanSure);
      cubuk.style.width = `${(oyun.kalanMs / 30000) * 100}%`;
      if (vurulan && performance.now() >= vurulan.bitis) vurulan = null;
      hucreler.forEach((b, i) => {
        const dolu = oyun.ahtapot === i;
        const vurdu = vurulan?.hucre === i && !dolu;
        if (dolu !== (sonAhtapot === i)) b.innerHTML = dolu ? AHTAPOT_SVG : '';
        b.setAttribute('aria-label', dolu ? 'Ahtapot' : 'Boş kare');
        b.classList.toggle('dolu', dolu);
        b.classList.toggle('vurdu', vurdu);
        const arti = b.querySelector('.arti');
        if (vurdu && !arti)
          b.insertAdjacentHTML('beforeend', '<span class="arti">+1</span>');
        if (!vurdu && arti) arti.remove();
      });
      sonAhtapot = oyun.ahtapot;
    };
    kok.replaceChildren(ekran);
  }

  function bitisEkrani(): void {
    const rekor = oyun.skor > oyunBasiEnIyi;
    const kalan = Math.max(0, oyunBasiEnIyi - oyun.skor);
    const ekran = sablon(`
      <section class="ekran bitis">
        <div class="sonuc">
          <p class="baslik">Süre doldu!</p>
          <div class="buyuk" data-testid="skor"></div>
          <p>ahtapot yakaladın</p>
          <div class="kartlar">
            <div class="kart"><small>En iyi skor</small><strong data-testid="en-iyi"></strong></div>
            ${
              rekor
                ? '<div class="kart rekor"><strong>🎉 Yeni rekor!</strong></div>'
                : `<div class="kart"><small>Rekora kalan</small><strong>${kalan}</strong></div>`
            }
          </div>
        </div>
        <div class="alt">
          <button class="btn" data-testid="tekrar-oyna">Tekrar oyna</button>
        </div>
      </section>`);
    sor(ekran, '[data-testid="skor"]').textContent = String(oyun.skor);
    sor(ekran, '[data-testid="en-iyi"]').textContent = String(oyun.enIyi);
    sor(ekran, '[data-testid="tekrar-oyna"]').addEventListener('click', () => {
      oyunBasiEnIyi = oyun.enIyi;
      oyun.tekrarOyna();
      baslatZamanlayici();
      ciz();
    });
    guncelleEkran = () => {};
    kok.replaceChildren(ekran);
  }

  function ciz(): void {
    if (oyun.evre !== gosterilen) {
      gosterilen = oyun.evre;
      if (gosterilen === 'baslangic') baslangicEkrani();
      else if (gosterilen === 'oyun') oyunEkrani();
      else {
        durdur();
        bitisEkrani();
      }
    }
    guncelleEkran();
  }

  ciz();
}
