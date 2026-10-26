# Ahtapot Yakala — Tasarım sistemi

Seçilen yön: **A · Derin Deniz** (#2, Metehan 26.10.2026). Referans: `design/2-oyun-ekrani/a.html` ve `a.png`.
Bu dosya arayüzün tek görsel kaynağıdır; yeni ekranlar buna uyar, değişiklik önce buraya yazılır.

## Renkler (CSS değişkenleri)
| Token | Değer | Kullanım |
|---|---|---|
| `--lacivert-900` | `#0b1f38` | Arka plan alt ucu |
| `--lacivert-800` | `#0f2a4a` | Ana arka plan |
| `--lacivert-600` | `#1b4d7a` | Arka plan üst ışığı |
| `--turuncu` | `#ff7a59` | Ahtapot, birincil düğme, süre çubuğu, "+1" |
| `--turuncu-koyu` | `#e8603f` | Düğme basılı hâli |
| `--beyaz` | `#ffffff` | Ana metin, sayılar |
| `--soluk` | `rgba(255,255,255,.72)` | İkincil metin, etiketler |
| `--hucre` | `rgba(255,255,255,.07)` | Boş hücre zemini |
| `--hucre-kenar` | `rgba(255,255,255,.12)` | Hücre / kart kenarı |

Arka plan: `radial-gradient(120% 70% at 50% 0%, #1b4d7a 0%, #0f2a4a 60%, #0b1f38 100%)`.
Kontrast: beyaz/lacivert ≈ 14:1, turuncu düğmede beyaz metin kalın ve ≥18px (büyük metin kuralı).

## Tipografi
- Yazı tipi: sistem yığını `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (dış font yok).
- Sayılar: `font-variant-numeric: tabular-nums` (skor/süre değişirken titremesin).

| Rol | Boyut / ağırlık |
|---|---|
| Başlık (h1) | 40px / 800, `letter-spacing: -0.02em` |
| Bitiş skoru | 112px / 800 |
| Oyun sayaçları (skor, süre) | 40px / 800 |
| Sayaç etiketi | 13px, büyük harf, `letter-spacing: .04em`, `--soluk` |
| Gövde | 17px / 400, satır yüksekliği 1.5 |
| İpucu | 14px, `--soluk` |
| Düğme | 18px / 700 |

## Boşluk ve şekil
- Kenar boşluğu: yatay 24px; üst 56px, alt 36px (güvenli alan için `env(safe-area-inset-*)` eklenebilir).
- Boşluk ölçeği: 4 · 8 · 12 · 16 · 24 · 32 px.
- Köşe yarıçapı: hücre 22px, kart/düğme 16px, rozet 999px (hap).
- Gölge: düğme `0 10px 28px rgba(255,122,89,.35)`.

## Bileşenler
- **Birincil düğme**: tam genişlik, 18px dolgu, turuncu zemin, beyaz metin. Basılınca `--turuncu-koyu` ve `transform: scale(.98)`.
- **Rozet**: `rgba(255,255,255,.08)` zemin, 8×14px dolgu (başlangıçtaki "En iyi skorun").
- **Sayaç**: üstte küçük etiket, altta büyük sayı; skor solda, kalan süre sağda.
- **Süre çubuğu**: 8px yükseklik, zemin `rgba(255,255,255,.1)`, dolgu turuncu, genişlik = kalan süre / 30. Doğrusal azalır.
- **Hücre**: kare (`aspect-ratio: 1`), 3 kolon, 12px aralık. 390px ekranda ≈106px (≥96px şartı).
  - Boş: `--hucre` zemin, `--hucre-kenar` kenar.
  - Ahtapotlu: zemin `rgba(255,122,89,.14)`, kenar `rgba(255,122,89,.55)`, dış halka `0 0 0 4px rgba(255,122,89,.12)`; içinde 76px ahtapot.
  - Vuruldu: kısa süre `rgba(255,255,255,.12)` zemin + sağ üstte turuncu "+1".
- **Bilgi kartı** (bitiş): `rgba(255,255,255,.07)` zemin, 16px yarıçap; "En iyi skor" ve "Rekora kalan".
- **Ahtapot**: tek SVG (`a.html` içindeki `<symbol id="ahtapot">`), turuncu gövde, beyaz göz, lacivert göz bebeği.

## Ekranlar
1. **Başlangıç**: logo kutusu (132px), "Ahtapot Yakala", açıklama, en iyi skor rozeti (hiç skor yoksa rozet gizlenir), altta "Başla" + "Boş kareye dokunmanın cezası yok."
2. **Oyun**: skor + kalan süre, süre çubuğu, 3x3 ızgara, altta "Ahtapota dokun!".
3. **Bitiş**: "Süre doldu!", büyük skor, "ahtapot yakaladın", en iyi skor ve rekora kalan kartları, "Tekrar oyna".
   - Yeni rekorda "Rekora kalan" kartı yerine turuncu "🎉 Yeni rekor!" kartı gösterilir.

## Hareket
- Ahtapot belirme: 150ms `scale(.6→1)` + opaklık; kaybolma 100ms.
- "+1": 400ms yukarı kayıp kaybolur.
- `prefers-reduced-motion: reduce` ise animasyonlar kapalı, yalnızca anlık değişim.

## Erişilebilirlik ve dokunma
- `touch-action: manipulation`, `user-select: none` (çift dokunma zoom'u yok, KK-11).
- Hücreler `<button>`; ahtapotlu hücrede `aria-label="Ahtapot"`, boşlarda `aria-label="Boş kare"`.
- Skor ve süre için `aria-live="polite"` (süre her 5 saniyede bir okunabilir).

## Test kancaları (PRD)
`data-testid`: `basla`, `hucre-0` … `hucre-8`, `skor`, `sure`, `en-iyi`, `tekrar-oyna`. Referans HTML bunları zaten içerir.
