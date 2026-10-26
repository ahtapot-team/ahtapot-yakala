(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`Ahtapot Yakala`,t=1e3,n=`ahtapot-yakala:en-iyi`,r=3e4;function i(e){let t=e?.getItem(n);return t!=null&&/^\d+$/.test(t)?Number(t):0}function a({rng:e,now:a,depo:o}){let s=`baslangic`,c=0,l=i(o),u=null,d=-1,f=0,p=0,m=0,h=()=>Math.floor(e()*9),g=()=>(d+1+Math.floor(e()*8))%9,_=e=>{d=e,u=e},v=()=>{s=`bitis`,u=null,c>l&&(l=c,o?.setItem(n,String(l)))},y=()=>{s=`oyun`,c=0,f=m=a(),p=f+t,d=-1,_(h())},b=()=>s===`baslangic`?r:s===`bitis`?0:Math.max(0,r-(m-f));return{get evre(){return s},get skor(){return c},get kalanSure(){return Math.ceil(b()/1e3)},get kalanMs(){return b()},get enIyi(){return l},get ahtapot(){return u},basla(){s===`baslangic`&&y()},tikla(e){s===`oyun`&&u!==null&&e===u&&(c+=1,u=null)},tekrarOyna(){s===`bitis`&&y()},guncelle(){if(s===`oyun`){if(m=a(),m-f>=r)v();else for(;m>=p;)_(g()),p+=t}}}}var o=100,s=400,c=`<svg width="76" height="76" aria-hidden="true" viewBox="0 0 100 100">
  <g fill="#ff7a59">
    <ellipse cx="50" cy="38" rx="26" ry="24"/>
    <path d="M28 50 q-6 22 -18 26 q10 2 18 -8 q2 14 -6 24 q12 -4 16 -20 q0 14 4 22 q6 -10 4 -22 q4 14 12 20 q2 -12 -4 -22 q8 14 18 16 q-6 -10 -4 -22 q8 10 18 8 q-12 -4 -16 -26 z"/>
  </g>
  <circle cx="41" cy="36" r="5" fill="#fff"/><circle cx="59" cy="36" r="5" fill="#fff"/>
  <circle cx="42" cy="37" r="2.4" fill="#0f2a4a"/><circle cx="60" cy="37" r="2.4" fill="#0f2a4a"/>
</svg>`,l=c.replace(`width="76" height="76"`,`width="88" height="88"`);function u(e){let t=document.createElement(`template`);return t.innerHTML=e.trim(),t.content.firstElementChild}function d(e,t){let n=e.querySelector(t);if(!n)throw Error(`öğe bulunamadı: ${t}`);return n}function f(t,n){let r=null,i=()=>{},a,f=n.enIyi,p=()=>{a!==void 0&&clearInterval(a),a=void 0},m=()=>{p(),a=window.setInterval(()=>{n.guncelle(),v()},o)};function h(){let r=u(`
      <section class="ekran baslangic">
        <div class="hero">
          <div class="logo">${l}</div>
          <h1></h1>
          <p class="aciklama">30 saniyen var. Ahtapot nerede belirirse oraya dokun!</p>
          <span class="rozet" hidden>🏆 En iyi skorun: <b data-rozet></b></span>
        </div>
        <div class="alt">
          <button class="btn" data-testid="basla">Başla</button>
          <p class="ipucu">Boş kareye dokunmanın cezası yok.</p>
        </div>
      </section>`);d(r,`h1`).textContent=e;let a=d(r,`.rozet`);d(r,`[data-testid="basla"]`).addEventListener(`click`,()=>{f=n.enIyi,n.basla(),m(),v()}),i=()=>{a.hidden=n.enIyi===0,d(a,`[data-rozet]`).textContent=String(n.enIyi)},t.replaceChildren(r)}function g(){let e=u(`
      <section class="ekran oyun">
        <div class="ust">
          <div class="sayac"><small>SKOR</small><strong data-testid="skor" aria-live="polite"></strong></div>
          <div class="sayac sag"><small>KALAN SÜRE</small><strong data-testid="sure"></strong></div>
        </div>
        <div class="cubuk"><span></span></div>
        <div class="izgara"></div>
        <p class="ipucu">Ahtapota dokun!</p>
      </section>`),r=d(e,`.izgara`),a=[];for(let e=0;e<9;e++){let t=document.createElement(`button`);t.type=`button`,t.className=`hucre`,t.dataset.testid=`hucre-${e}`,t.addEventListener(`click`,()=>{let t=n.skor;n.tikla(e),n.skor>t&&(p={hucre:e,bitis:performance.now()+s}),v()}),a.push(t)}r.append(...a);let o=d(e,`[data-testid="skor"]`),l=d(e,`[data-testid="sure"]`),f=d(e,`.cubuk span`),p=null,m=null;i=()=>{o.textContent=String(n.skor),l.textContent=String(n.kalanSure),f.style.width=`${n.kalanMs/3e4*100}%`,p&&performance.now()>=p.bitis&&(p=null),a.forEach((e,t)=>{let r=n.ahtapot===t,i=p?.hucre===t&&!r;r!==(m===t)&&(e.innerHTML=r?c:``),e.setAttribute(`aria-label`,r?`Ahtapot`:`Boş kare`),e.classList.toggle(`dolu`,r),e.classList.toggle(`vurdu`,i);let a=e.querySelector(`.arti`);i&&!a&&e.insertAdjacentHTML(`beforeend`,`<span class="arti">+1</span>`),!i&&a&&a.remove()}),m=n.ahtapot},t.replaceChildren(e)}function _(){let e=n.skor>f,r=Math.max(0,f-n.skor),a=u(`
      <section class="ekran bitis">
        <div class="sonuc">
          <p class="baslik">Süre doldu!</p>
          <div class="buyuk" data-testid="skor"></div>
          <p>ahtapot yakaladın</p>
          <div class="kartlar">
            <div class="kart"><small>En iyi skor</small><strong data-testid="en-iyi"></strong></div>
            ${e?`<div class="kart rekor"><strong>🎉 Yeni rekor!</strong></div>`:`<div class="kart"><small>Rekora kalan</small><strong>${r}</strong></div>`}
          </div>
        </div>
        <div class="alt">
          <button class="btn" data-testid="tekrar-oyna">Tekrar oyna</button>
        </div>
      </section>`);d(a,`[data-testid="skor"]`).textContent=String(n.skor),d(a,`[data-testid="en-iyi"]`).textContent=String(n.enIyi),d(a,`[data-testid="tekrar-oyna"]`).addEventListener(`click`,()=>{f=n.enIyi,n.tekrarOyna(),m(),v()}),i=()=>{},t.replaceChildren(a)}function v(){n.evre!==r&&(r=n.evre,r===`baslangic`?h():r===`oyun`?g():(p(),_())),i()}v()}function p(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function m(e){let t=new URLSearchParams(e).get(`seed`);return t===null||!/^-?\d+$/.test(t.trim())?null:Number(t)}function h(){try{return window.localStorage}catch{return}}var g=document.getElementById(`app`);if(g){let e=m(window.location.search);f(g,a({rng:e===null?Math.random:p(e),now:()=>Date.now(),depo:h()}))}