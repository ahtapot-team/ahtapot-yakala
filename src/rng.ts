// TOHUMLU RASTGELELİK — mulberry32.

/** Aynı tohumla aynı diziyi üreten, [0, 1) aralığında sayı veren üreteç. */
export function tohumluRng(tohum: number): () => number {
  let a = tohum >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** '?seed=42' → 42. Yoksa veya sayı değilse null. */
export function tohumOku(arama: string): number | null {
  const ham = new URLSearchParams(arama).get('seed');
  if (ham === null || !/^-?\d+$/.test(ham.trim())) return null;
  return Number(ham);
}
