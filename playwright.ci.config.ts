import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// CI'da runner'daki hazır Google Chrome kullanılır (tarayıcı indirmesi ~12 dk sürüyordu).
export default defineConfig({
  ...base,
  use: { ...base.use, channel: 'chrome' },
});
