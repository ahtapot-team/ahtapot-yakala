import './stil.css';
import { arayuzKur } from './arayuz';
import { oyunOlustur } from './oyun';
import { tohumluRng, tohumOku } from './rng';

function depoAl() {
  try {
    return window.localStorage;
  } catch {
    return undefined; // gizli mod vb.: en iyi skor kalıcı olmaz, oyun çalışır
  }
}

const kok = document.getElementById('app');
if (kok) {
  const tohum = tohumOku(window.location.search);
  const rng = tohum === null ? Math.random : tohumluRng(tohum);
  arayuzKur(kok, oyunOlustur({ rng, now: () => Date.now(), depo: depoAl() }));
}
