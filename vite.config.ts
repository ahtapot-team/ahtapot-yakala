import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/ahtapot-yakala/',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
