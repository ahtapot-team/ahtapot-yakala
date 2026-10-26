# Ahtapot Yakala

Ahtapot ekibi test oyunu: 3x3 ızgarada ahtapot yakala. Ayrıntı: [docs/PRD.md](docs/PRD.md).

## Komutlar

```
npm ci            # bağımlılıkları kur
npm run dev       # geliştirme sunucusu
npm run build     # tip kontrolü + üretim build'i (dist/)
npm test          # Vitest birim/kabul testleri
npm run test:e2e  # Playwright E2E (önce: npx playwright install chromium; npm run build)
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
npm run format    # Prettier ile biçimlendir (format:check yalnızca denetler)
```

## Yayın

- `main` → GitHub Pages: https://metehantopalhan.github.io/ahtapot-yakala/
- Her PR → `.../ahtapot-yakala/pr/<no>/` altında önizleme; link PR'a yorum olarak yazılır.
