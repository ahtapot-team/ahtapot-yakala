# Ahtapot Yakala — Ürün gereksinimleri (PRD)

> Durum: TASLAK (onay bekliyor)
> Bu dosya projenin tek doğruluk kaynağıdır. Ajanlar sohbet geçmişine değil buraya bakar.
> Kapsam değişirse önce bu dosya güncellenir ve yeniden onaylanır.

## Amaç
Ahtapot ekibinin uçtan uca iş akışını (PRD → onay → tasarım → kabul testleri → geliştirme → CI → inceleme → PR) gerçek ama çok küçük bir ürünle denemek. Ürün: tarayıcıda oynanan, tek ekranlık bir refleks oyunu.

## Hedef kullanıcı ve platform
- Kullanıcı: Ekip üyeleri ve arkadaşları (test amaçlı).
- Platform: Mobil uyumlu web (telefon dikey + masaüstü). GitHub Pages'te statik site.

## Kapsam (bu sürümde var)
- Tek ekran, üç durum: **başlangıç** (başlık + "Başla"), **oyun** (3x3 ızgara, kalan süre, skor), **bitiş** (skor, en iyi skor, "Tekrar oyna").
- Oyun 30 saniye sürer.
- Aynı anda yalnızca bir ahtapot görünür. 1 saniye görünür kalır, sonra başka bir hücreye geçer. Ahtapot aynı hücrede üst üste iki kez çıkmaz.
- Ahtapotun olduğu hücreye dokununca/tıklayınca skor +1 olur ve ahtapot hemen kaybolur (çift tıklama yalnızca +1).
- Boş hücreye tıklamak skoru değiştirmez (ceza yok).
- Süre bitince tıklamalar sayılmaz.
- En iyi skor tarayıcıda (`localStorage`) saklanır.
- "Tekrar oyna" skoru ve süreyi sıfırlar, en iyi skoru korur.

## Kapsam dışı (bilerek yapmıyoruz)
- Sunucu, veritabanı, giriş, skor tablosu
- Ses, titreşim, seviye/zorluk
- Telegram Mini App entegrasyonu

## Kullanıcı akışları
1. Kullanıcı sayfayı açar → başlangıç ekranı → "Başla".
2. 30 sn boyunca ahtapotlara dokunur, skor ve kalan süre ekranda güncellenir.
3. Süre biter → bitiş ekranı: skor ve en iyi skor → "Tekrar oyna" ile 2. adıma döner.

## Kabul kriterleri
Her madde test edilebilir olmalı; QA bunlardan otomatik kabul testleri yazar.
- [ ] KK-1: Sayfa açılınca başlangıç ekranı ve "Başla" düğmesi görünür.
- [ ] KK-2: "Başla" sonrası 3x3 = 9 hücre, skor 0 ve kalan süre 30 görünür.
- [ ] KK-3: Ahtapotun olduğu hücreye tıklamak skoru tam 1 artırır; aynı ahtapota ikinci tıklama skoru değiştirmez.
- [ ] KK-4: Boş hücreye tıklamak skoru değiştirmez.
- [ ] KK-5: Ahtapot 1 sn sonra başka bir hücreye geçer; art arda iki konum asla aynı hücre değildir.
- [ ] KK-6: Aynı anda en fazla bir ahtapot görünür.
- [ ] KK-7: 30. saniyede oyun biter, bitiş ekranı görünür; süre bitince yapılan tıklamalar sayılmaz.
- [ ] KK-8: Bitiş ekranında skor ve en iyi skor görünür; en iyi skor sayfa yenilense de korunur (`localStorage`).
- [ ] KK-9: "Tekrar oyna" skoru 0'a, süreyi 30'a sıfırlar; en iyi skor korunur.
- [ ] KK-10: Aynı seed ile (`?seed=<sayı>`) ahtapotun çıkış sırası her seferinde aynıdır.
- [ ] KK-11: Mobilde (390px genişlik) yatay kaydırma yoktur; hücre dokunma alanı en az 96px; çift dokunmayla zoom olmaz.
- [ ] KK-12: Sayfa GitHub Pages'te yayınlanır, her PR için önizleme linki üretilir.

## Test edilebilirlik şartları (QA)
- Oyun mantığı arayüzden ayrı, saf bir modüldür (durum, tıklama, süre, tur sonu).
- Rastgelelik dışarıdan verilir (tohumlu PRNG / `rng` parametresi); URL'de `?seed=` desteklenir.
- Zaman dışarıdan verilir (sahte saat); `setInterval` kaymasına güvenilmez, süre `Date.now`/saat kaynağıyla hesaplanır.
- Test kancaları: `data-testid` → `basla`, `hucre-0` … `hucre-8`, `skor`, `sure`, `en-iyi`, `tekrar-oyna`.

## Teknik kararlar
| Karar | Seçim | Gerekçe | Karar veren |
|---|---|---|---|
| Dil / framework | TypeScript + Vite (framework yok, DOM/CSS) | En küçük kurulum, motor gerekmez | frontend önerisi, Metehan onayı |
| Test | Vitest (birim + kabul), Playwright (1–2 E2E) | Hızlı; 8 GB makineye uygun | qa + frontend önerisi, Metehan onayı |
| Kalite | ESLint + Prettier, `sablonlar/ci.yml` | Ekip kalite kapıları | ekip kuralı |
| Barındırma | GitHub Pages + PR önizleme (`sablonlar/onizleme.yml`) | Sunucu yok, ücretsiz | Metehan onayı |
| Veri | Yalnızca `localStorage` (en iyi skor) | Sunucu yok | Metehan onayı |
| Görsel | SVG/CSS, Ahtapot paleti (lacivert-turuncu) | Asset üretimi gerekmez | tasarim önerisi |

## Riskler ve açık sorular
- Vite `base` ayarı GitHub Pages alt yoluna (`/ahtapot-yakala/`) göre yapılmalı.
- Private repo'da GitHub Pages hesap planına bağlı olabilir; çalışmazsa insanlara sorulur (repo public yapılabilir veya başka statik barındırma).
- Mobilde çift dokunma/zoom (`touch-action`, viewport) dikkat ister.

## Ekip görüşleri (fikir turu özeti)
- tasarim: Tek ekran, 3 durum, S. Mobilde dikey tek kolon, dokunma alanı ≥96px. SVG/CSS yeterli. En iyi skor localStorage, ceza yok, ses yok.
- backend: Sunucu yok, backend işi yok.
- frontend: TS + Vite + Vitest uygun, S. Playwright yalnızca 1 E2E. Pages `base`, mobil zoom ve zamanlayıcı kayması riskleri.
- qa: S. Saf mantık modülü, enjekte rastgelelik ve zaman, `data-testid` kancaları, `?seed=`; 1 Playwright testi yeterli.
- İnsanlar: Metehan "A" (Ahtapot Yakala) ve varsayılan kuralları onayladı (26.10.2026).
