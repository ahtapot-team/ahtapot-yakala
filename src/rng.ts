// TOHUMLU RASTGELELİK ARAYÜZÜ (sözleşme) — gövde #4'te (frontend) yazılır.

/** Aynı tohumla aynı diziyi üreten, [0, 1) aralığında sayı veren üreteç. */
export function tohumluRng(tohum: number): () => number {
  throw new Error(`tohumluRng henüz yazılmadı (#4): ${tohum}`);
}

/** '?seed=42' → 42. Yoksa veya sayı değilse null. */
export function tohumOku(arama: string): number | null {
  throw new Error(`tohumOku henüz yazılmadı (#4): ${arama}`);
}
