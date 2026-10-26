export const BASLIK = 'Ahtapot Yakala';

export function baslikYaz(kok: HTMLElement): void {
  const h1 = document.createElement('h1');
  h1.textContent = BASLIK;
  kok.replaceChildren(h1);
}
