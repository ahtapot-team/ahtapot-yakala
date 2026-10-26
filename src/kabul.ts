import { it } from 'vitest';

/**
 * KABUL TESTLERİ ANAHTARI.
 *
 * `true`: oyun henüz yazılmadı; kabul testleri "beklendiği gibi kırmızı" (it.fails) çalışır,
 *         böylece CI yeşil kalır ve PR merge edilebilir.
 * `false`: testler normal çalışır.
 *
 * #4'ü (oyun) yapan geliştirici uygulama bitince bunu `false` yapar (ve e2e/kabul.ts'deki
 * BEKLEYEN'i de). Unutursa CI "test kırmızı olmalıydı ama geçti" diye kırmızı olur — bu bilerek.
 */
export const BEKLEYEN = true;

export const kabul = BEKLEYEN ? it.fails : it;
