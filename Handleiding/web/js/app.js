// Navigatie en opbouw van de pagina's (overgenomen van de TheBOX-handleiding, UI in het Engels).
// Inhoud staat in js/inhoud.js (window.HB). Adressen: #/ (overzicht), #/h2 (hoofdstuk 2), #/h2/3 (stap 3).
// Extra t.o.v. TheBOX: een stap kan i.p.v. een 3D-scene een afbeelding (beeld) of de bouwvideo (video) tonen.
(function () {
  'use strict';
  const app = document.getElementById('app');
  const HB = window.HB;
  const H = HB.hoofdstukken;
  let viewer = null, viewerKlaar = null, huidig = null, sceneTeller = 0;

  // Voortgang (alleen deze browser)
  const OPSLAG = 'skittle-sorter-guide-done';
  function gedaanLijst() { try { return JSON.parse(localStorage.getItem(OPSLAG)) || {}; } catch (e) { return {}; } }
  function zetGedaan(sleutel, aan) {
    const g = gedaanLijst();
    if (aan) g[sleutel] = 1; else delete g[sleutel];
    try { localStorage.setItem(OPSLAG, JSON.stringify(g)); } catch (e) { /* geen opslag: niet erg */ }
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Schroef- en moericoon (zijaanzicht, 4 px per mm, lengte geknepen boven 25 mm)
  function hwIcoon(soort) {
    const m = /^(M2|M2\.5|M3)x(\d+)/.exec(soort);
    const S = 4;
    if (m) {
      const d = m[1] === 'M2' ? 2 : m[1] === 'M2.5' ? 2.5 : 3, dk = d === 2 ? 3.8 : d === 2.5 ? 4.5 : 5.5, k = d === 3 ? 3 : 2, L = Math.min(+m[2], 25);
      const w = (k + L) * S + 4, h = dk * S + 4, cy = h / 2;
      let draad = '';
      for (let x = k * S + 6; x < (k + L) * S; x += 0.5 * S * 1.2) draad += `<line x1="${x + 2}" y1="${cy - d * S / 2}" x2="${x + 4}" y2="${cy + d * S / 2}" stroke="#15140F" stroke-width=".8"/>`;
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect x="2" y="2" width="${k * S}" height="${dk * S}" rx="2" fill="#2b2b2b"/><rect x="${2 + k * S}" y="${cy - d * S / 2}" width="${L * S}" height="${d * S}" fill="#cfcfcf" stroke="#15140F" stroke-width="1"/>${draad}</svg>`;
    }
    if (/nut/i.test(soort)) {
      return `<svg width="30" height="30" viewBox="0 0 30 30"><polygon points="15,2 26,8.5 26,21.5 15,28 4,21.5 4,8.5" fill="#9a9a9a" stroke="#15140F" stroke-width="1.5"/><circle cx="15" cy="15" r="6" fill="#fff" stroke="#15140F" stroke-width="1.5"/></svg>`;
    }
    return `<svg width="30" height="30" viewBox="0 0 30 30"><rect x="4" y="4" width="22" height="22" fill="#fff" stroke="#15140F" stroke-width="1.5"/></svg>`;
  }

  function kruimel(html) { document.getElementById('kruimel').innerHTML = html; }
  const ytEmbed = (id, start) => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0${start ? '&start=' + start : ''}" title="Build video: Skittle Sorter v2" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;

  // ---------- overzicht ----------
  function toonOverzicht() {
    huidig = null;
    kruimel('All chapters');
    const g = gedaanLijst();
    const kaart = h => {
      const n = h.stappen ? h.stappen.length : 0;
      const klaar = h.stappen ? h.stappen.filter((_, i) => g[h.id + '/' + (i + 1)]).length : 0;
      return `<a class="hfd" href="#/${h.id}/1">
        <span class="hfd__status">${n} ${n === 1 ? 'step' : 'steps'}</span>
        <div class="hfd__nr">${h.nr}</div><h2>${esc(h.titel)}</h2><p>${esc(h.samenvatting)}</p>
        <div class="voortgang"><i style="width:${n ? 100 * klaar / n : 0}%"></i></div></a>`;
    };
    const delen = HB.delen.map(d =>
      `<h2 class="deel-kop">${esc(d.titel)}</h2><div class="hfd-raster">${H.filter(h => h.deel === d.id).map(kaart).join('')}</div>`);
    const W = HB.waarom;
    app.innerHTML = `<div class="pagina">
      <section class="held"><div>
        <h1>Skittle Sorter<br><span class="geel">build guide</span></h1>
        <p>Step by step, like a flat-pack manual, but on screen. Every step shows the real Fusion model of version 2: drag to rotate, scroll to zoom, ▶ plays the assembly.</p>
        <p>Keys: <b>→</b> or space = next step, <b>←</b> = previous, <b>R</b> = replay the animation.</p>
        <div class="uitleg"><span class="u-nieuw">new in this step</span><span class="u-klaar">already assembled</span><span class="u-ctx">surroundings (for orientation)</span></div>
        <p class="held__knoppen"><a class="knop knop--vol" href="#/${H[0].id}/1">Start building →</a> <a class="knop" href="${HB.links.makerworld}" target="_blank" rel="noopener">Print files on MakerWorld</a></p>
      </div><div class="held__beeld"><img src="img/sorter.jpg" alt="The Skittle Sorter v2 next to a bag of Skittles"></div></section>
      <section class="waarom"><div class="waarom__tekst">
        <p class="kicker">${esc(W.kop)}</p><h2>${W.titel}</h2>${W.tekst}
      </div><div class="waarom__video">${ytEmbed(HB.links.video)}<p>The complete build on video (14 min). This guide follows the same order.</p></div></section>
      ${delen.join('')}
    </div>`;
  }

  // ---------- stap ----------
  function toonStap(h, nr) {
    const s = h.stappen[nr - 1];
    const sleutel = h.id + '/' + nr;
    const g = gedaanLijst();
    huidig = { h, nr };
    kruimel(`<a href="#/">Overview</a> › <a href="#/${h.id}/1">${h.nr}. ${esc(h.titel)}</a> › step ${nr}`);
    const zij = `<aside class="zij"><h2>Chapter ${h.nr}</h2><h3>${esc(h.titel)}</h3><ol>
      ${h.stappen.map((t, i) => `<li><a href="#/${h.id}/${i + 1}" class="${i + 1 === nr ? 'actief' : ''} ${g[h.id + '/' + (i + 1)] ? 'gedaan' : ''}"><span class="n">${h.nr}.${i + 1}</span>${esc(t.titel)}</a></li>`).join('')}
      </ol><div class="terug"><a class="knop knop--klein" href="#/">← All chapters</a></div></aside>`;
    const hw = s.hw && s.hw.length ? `<div class="hw"><h4>Hardware</h4>${s.hw.map(([n, soort, waar]) =>
      `<div class="hw__rij"><div class="hw__aantal">${n ? n + '<small>×</small>' : ''}</div><div class="hw__wat">${hwIcoon(soort)}<div><b>${esc(soort)}</b><span>${esc(waar || '')}</span></div></div></div>`).join('')}</div>` : '';
    const gereed = s.gereedschap ? `<div><h4>Tools</h4><div class="gereedschap">${s.gereedschap.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>` : '';
    const delen = s.delen ? `<div><h4>${esc(s.delenKop || 'Parts')}</h4><ul class="delen">${s.delen.map(([n, naam, opm]) => `<li><b>${n}×</b><span>${esc(naam)}</span><em>${esc(opm || '')}</em></li>`).join('')}</ul></div>` : '';
    const letop = (s.letop || []).map(t => `<div class="let-op"><div class="ic">!</div><div>${t}</div></div>`).join('');
    const tip = (s.tip || []).map(t => `<div class="tip"><div class="ic">i</div><div>${t}</div></div>`).join('');
    const foto = s.foto ? `<figure class="foto"><a href="${s.foto.src}" target="_blank" rel="noopener" title="Open full size"><img src="${s.foto.src}" alt="${esc(s.foto.alt)}" loading="lazy"></a>${s.foto.bijschrift ? `<figcaption>${esc(s.foto.bijschrift)}</figcaption>` : ''}</figure>` : '';
    const mmss = t => Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    const bij = s.bij !== undefined ? `<a class="bij" href="https://www.youtube.com/watch?v=${HB.links.video}&t=${s.bij}s" target="_blank" rel="noopener">▶ Watch this step in the build video (${mmss(s.bij)})</a>` : '';
    const vorige = nr > 1 ? `#/${h.id}/${nr - 1}` : null;
    const volgende = nr < h.stappen.length ? `#/${h.id}/${nr + 1}` : null;
    const volgHfd = H[H.indexOf(h) + 1];
    app.innerHTML = `<div class="hoofdstuk">${zij}<section class="stap">
      <div class="stap__kop"><div class="stap__nr">${h.nr}.${nr}</div><div class="stap__titel"><small>Chapter ${h.nr} · ${esc(h.titel)}</small>${esc(s.titel)}</div>
        <div class="ruimte"></div><button class="stap__gedaan ${g[sleutel] ? 'aan' : ''}" id="knopGedaan">${g[sleutel] ? '✓ Done' : 'Mark as done'}</button></div>
      <div class="scene" id="scene"><div class="scene__melding" id="melding">Loading 3D model…</div>
        <div class="scene__label" id="labels"></div><div class="scene__hint">drag = rotate · scroll = zoom · right-drag = pan</div>
        <div class="scene__bediening"><button id="knopSpeel" title="Play/pause">❚❚</button><button id="knopOpnieuw" title="Replay (R)">↺</button>
        <input type="range" id="tijd" min="0" max="1000" value="0" aria-label="Timeline"><button id="knopCam" title="Reset view">⌂</button></div></div>
      <div class="paneel">${delen}${hw}${gereed}<div class="tekst">${s.tekst || ''}</div>${letop}${tip}${foto}${bij}</div>
      <div class="stap__voet">${vorige ? `<a class="knop" href="${vorige}">← Previous</a>` : `<a class="knop" href="#/">← Overview</a>`}
        <span class="teller">Step ${nr} of ${h.stappen.length} <span class="stip">${h.stappen.map((_, i) => `<i class="${i + 1 === nr ? 'a' : g[h.id + '/' + (i + 1)] ? 'g' : ''}"></i>`).join('')}</span></span>
        ${volgende ? `<a class="knop knop--vol" href="${volgende}">Next →</a>` : volgHfd ? `<a class="knop knop--vol" href="#/${volgHfd.id}/1">Chapter ${volgHfd.nr} →</a>` : `<a class="knop knop--vol" href="#/">Finished ✓</a>`}</div>
    </section></div>`;

    document.getElementById('knopGedaan').onclick = () => {
      zetGedaan(sleutel, !gedaanLijst()[sleutel]);
      toonStap(h, nr);
    };
    toonScene(s);
  }

  function toonScene(s) {
    const el = document.getElementById('scene');
    const melding = document.getElementById('melding');
    if (s.beeld || s.video) {
      el.classList.add('scene--leeg', 'scene--media');
      melding.className = 'scene__media';
      melding.innerHTML = s.video ? ytEmbed(s.video.id, s.video.start)
        : `<a href="${s.beeld.src}" target="_blank" rel="noopener" title="Open full size"><img src="${s.beeld.src}" alt="${esc(s.beeld.alt)}"></a>${s.beeld.bijschrift ? `<p>${s.beeld.bijschrift}</p>` : ''}`;
      return;
    }
    if (!s.scene) { el.classList.add('scene--leeg'); melding.innerHTML = '<span>No 3D view for this step.<br>Follow the text and the lists.</span>'; return; }
    // De viewer (canvas) wordt hergebruikt tussen stappen: verplaats hem naar de nieuwe scene.
    // Altijd op viewerKlaar wachten: 'viewer' bestaat al terwijl three.js nog laadt (anders: THREE undefined
    // als je tijdens het eerste laden al naar een andere stap gaat).
    const mijn = ++sceneTeller;
    const start = viewerKlaar = viewerKlaar || (async () => {
      const houder = document.createElement('div');
      houder.style.cssText = 'position:absolute;inset:0';
      const v = new window.HBViewer(houder, f => { const t = document.getElementById('tijd'); if (t) t.value = Math.round(f * 1000); });
      v.houder = houder;
      await v.init();
      viewer = window.HB_VIEWER = v;   // HB_VIEWER: voor debuggen in de console
    })().catch(err => { viewerKlaar = null; throw err; });   // mislukt laden: volgende stap probeert opnieuw
    start.then(async () => {
      if (mijn !== sceneTeller) return;   // intussen naar een andere stap gegaan
      el.insertBefore(viewer.houder, el.firstChild);
      viewer.maat();
      await viewer.toon(s.scene);
      if (mijn !== sceneTeller) return;
      melding.remove();
      document.getElementById('labels').innerHTML = (s.scene.labels || []).map(l => `<span class="${l.startsWith('+') ? 'n' : ''}">${esc(l.replace(/^\+/, ''))}</span>`).join('');
      const speel = document.getElementById('knopSpeel');
      const zetKnop = () => speel.textContent = viewer.speelt ? '❚❚' : '▶';
      viewer.speelt = true; zetKnop();
      speel.onclick = () => { viewer.speelt = !viewer.speelt; zetKnop(); };
      document.getElementById('knopOpnieuw').onclick = () => { viewer.zetTijd(0); viewer.speelt = true; zetKnop(); };
      document.getElementById('knopCam').onclick = () => viewer.herstelCamera();
      document.getElementById('tijd').oninput = e => { viewer.speelt = false; zetKnop(); viewer.zetTijd(e.target.value / 1000); };
    }).catch(err => {
      melding.innerHTML = 'The 3D model could not load (' + esc(err.message) + ').<br>Three.js needs internet access (cdn.jsdelivr.net).';
    });
  }

  // ---------- router ----------
  function route() {
    const m = /^#\/(h\d+)(?:\/(\d+))?/.exec(location.hash);
    document.getElementById('lade').hidden = true;
    const h = m && H.find(x => x.id === m[1]);
    if (!h) { toonOverzicht(); window.scrollTo(0, 0); return; }
    const nr = Math.min(Math.max(+(m[2] || 1), 1), h.stappen.length);
    toonStap(h, nr);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || !huidig) return;
    const { h, nr } = huidig;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (nr < h.stappen.length) location.hash = `#/${h.id}/${nr + 1}`;
      else if (H[H.indexOf(h) + 1]) location.hash = `#/${H[H.indexOf(h) + 1].id}/1`;
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (nr > 1) location.hash = `#/${h.id}/${nr - 1}`;
    } else if (e.key === 'r' || e.key === 'R') {
      if (viewer) { viewer.zetTijd(0); viewer.speelt = true; }
    }
  });

  // Lade met alle hoofdstukken
  document.getElementById('knopInhoud').onclick = () => {
    document.getElementById('ladeInhoud').innerHTML = HB.delen.map(d =>
      `<h2 class="deel-kop">${esc(d.titel)}</h2>` + H.filter(h => h.deel === d.id).map(h =>
        `<p><a class="knop knop--klein knop--vol" href="#/${h.id}/1">${h.nr}. ${esc(h.titel)}</a></p>`).join('')).join('');
    document.getElementById('lade').hidden = false;
  };
  document.getElementById('lade').onclick = e => { if (e.target.id === 'lade') e.currentTarget.hidden = true; };

  route();
})();
