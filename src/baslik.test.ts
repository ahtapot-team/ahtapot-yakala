import { describe, expect, it } from 'vitest';
import { BASLIK, baslikYaz } from './baslik';

describe('baslikYaz', () => {
  it('kök elemente başlığı yazar', () => {
    const kok = document.createElement('main');
    baslikYaz(kok);
    expect(kok.querySelector('h1')?.textContent).toBe(BASLIK);
  });
});
