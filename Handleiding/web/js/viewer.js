// 3D-viewer voor de bouwstappen: IKEA-lijntekening (wit + zwarte randen), nieuwe delen geel,
// animatie "invliegen" + schroeven die indraaien. Geometrie komt 1-op-1 uit Fusion Versie3 (models/*.js).
// Klassiek script (werkt ook vanaf file://); three.js wordt via de importmap in index.html geladen.
(function () {
  'use strict';
  const KLEUR = {
    nieuw: 0xFEC600, nieuwLijn: 0x3a2f00,
    klaar: 0xffffff, klaarLijn: 0x2b2a26,
    context: 0xf3f2ee, contextLijn: 0xb9b6ab,
    elek: 0xd9d6cc, elekLijn: 0x4a4840,
    schroef: 0x2a2a2a, schroefLijn: 0x000000,
    papier: 0xfaf9f5,
  };
  let THREE, OrbitControls, laadPromise = null;

  function laadThree() {
    if (!laadPromise) {
      laadPromise = Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')])
        .then(([t, oc]) => { THREE = t; OrbitControls = oc.OrbitControls; });
    }
    return laadPromise;
  }

  function laadModelScript(sleutel) {
    if (window.HB_MODELLEN && window.HB_MODELLEN[sleutel]) return Promise.resolve();
    return new Promise((ok, fout) => {
      const s = document.createElement('script');
      s.src = 'models/' + sleutel + '.js' + (window.HB_VERSIE ? '?v=' + window.HB_VERSIE : '');
      s.onload = () => ok();
      s.onerror = () => fout(new Error('model ' + sleutel + ' niet gevonden'));
      document.head.appendChild(s);
    });
  }

  // Basisgeometrie per lichaam (eenmalig gedecodeerd)
  const geoCache = {};
  function geometrieen(sleutel) {
    if (geoCache[sleutel]) return geoCache[sleutel];
    const M = window.HB_MODELLEN[sleutel];
    const bin = Uint8Array.from(atob(M.data), c => c.charCodeAt(0)).buffer;
    const uit = {};
    for (const L of M.lichamen) {
      const q = new Int16Array(bin, L.p[0], L.p[1]);
      const pos = new Float32Array(q.length);
      for (let k = 0; k < q.length; k++) pos[k] = q[k] * M.schaal;
      const idx = L.i[2] === 2 ? new Uint16Array(bin, L.i[0], L.i[1]) : new Uint32Array(bin, L.i[0], L.i[1]);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setIndex(new THREE.BufferAttribute(idx.slice(), 1));
      g.computeVertexNormals();
      g.computeBoundingBox();
      uit[L.n] = { geo: g, lijn: null };
    }
    geoCache[sleutel] = uit;
    return uit;
  }
  function lijnGeo(item) {
    if (!item.lijn) item.lijn = new THREE.EdgesGeometry(item.geo, 28);
    return item.lijn;
  }

  function mat(kleur, lijn) {
    return {
      vlak: new THREE.MeshLambertMaterial({ color: kleur, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      lijn: new THREE.LineBasicMaterial({ color: lijn }),
    };
  }

  // Schroef (inbus DIN 912) of moer als eenvoudige geometrie. 'kop' = punt onder de kop, 'in' = richting de schroef in.
  function maakSchroef(maat, L) {
    const d = maat === 'M2.5' ? 2.5 : 3, dk = maat === 'M2.5' ? 4.5 : 5.5, k = maat === 'M2.5' ? 2.5 : 3;
    const g = new THREE.Group();
    const kop = new THREE.CylinderGeometry(dk / 2, dk / 2, k, 24);
    kop.rotateX(Math.PI / 2); kop.translate(0, 0, -k / 2);
    const steel = new THREE.CylinderGeometry(d / 2, d / 2, L, 16);
    steel.rotateX(Math.PI / 2); steel.translate(0, 0, L / 2);
    const inbus = new THREE.CylinderGeometry(dk * 0.26, dk * 0.26, 0.3, 6);
    inbus.rotateX(Math.PI / 2); inbus.translate(0, 0, -k - 0.1);
    const m = mat(KLEUR.schroef, KLEUR.schroefLijn);
    for (const geo of [kop, steel]) {
      g.add(new THREE.Mesh(geo, m.vlak));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), m.lijn));
    }
    g.add(new THREE.Mesh(inbus, new THREE.MeshBasicMaterial({ color: 0x777777 })));
    return g;
  }
  function maakMoer(maat) {
    const s = maat === 'M2.5' ? 5 : 5.5, h = maat === 'M2.5' ? 2 : 2.4;
    const geo = new THREE.CylinderGeometry(s / Math.sqrt(3), s / Math.sqrt(3), h, 6);
    geo.rotateX(Math.PI / 2); geo.translate(0, 0, h / 2);
    const m = mat(0x8c8c8c, 0x111111);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, m.vlak));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), m.lijn));
    return g;
  }
  function richt(obj, v) {
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...v).normalize());
  }

  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);

  class Viewer {
    constructor(el, onStatus) {
      this.el = el; this.onStatus = onStatus || (() => {});
      this.tijd = 0; this.speelt = true; this.duur = 6;
    }
    async init() {
      await laadThree();
      const r = this.renderer = new THREE.WebGLRenderer({ antialias: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      r.setClearColor(KLEUR.papier);
      this.el.appendChild(r.domElement);
      this.scene = new THREE.Scene();
      this.cam = new THREE.PerspectiveCamera(30, 1, 1, 5000);
      this.cam.up.set(0, 0, 1);
      this.controls = new OrbitControls(this.cam, r.domElement);
      this.controls.enableDamping = true;
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d4c8, 2.2));
      const zon = new THREE.DirectionalLight(0xffffff, 1.4);
      zon.position.set(300, -500, 800);
      this.scene.add(zon);
      this.wereld = new THREE.Group();
      this.scene.add(this.wereld);
      new ResizeObserver(() => this.maat()).observe(this.el);
      this.maat();
      this.klok = new THREE.Clock();
      const lus = () => {
        const dt = Math.min(this.klok.getDelta(), 0.1);
        if (this.speelt && this.stap) {
          this.tijd = (this.tijd + dt) % this.duur;
          this.onStatus(this.tijd / this.duur);
        }
        this.pose();
        this.controls.update();
        r.render(this.scene, this.cam);
        requestAnimationFrame(lus);
      };
      lus();
    }
    maat() {
      const w = this.el.clientWidth, h = this.el.clientHeight;
      if (!w || !h || !this.renderer) return;
      this.renderer.setSize(w, h);
      this.cam.aspect = w / h;
      this.cam.updateProjectionMatrix();
    }
    // stap = { model, nieuw:[regex], klaar:[regex], context:[regex], verberg:[regex], richting:[x,y,z],
    //          schroeven:[{maat,L,kop:[x,y,z],in:[x,y,z],moer:[x,y,z]?}], cam:{oog:[...],doel:[...]}, uitzicht }
    async toon(stap) {
      const sleutels = [].concat(stap.model || 'onderbouw');
      for (const k of sleutels) await laadModelScript(k);
      const G = Object.assign({}, ...sleutels.map(k => geometrieen(k)));
      this.stap = stap; this.tijd = 0;
      this.wereld.clear();
      this.bewegend = []; this.schroeven = [];
      const rx = s => new RegExp(s);
      const past = (n, lijst) => (lijst || []).some(p => rx(p).test(n));
      const M = {
        nieuw: mat(KLEUR.nieuw, KLEUR.nieuwLijn), klaar: mat(KLEUR.klaar, KLEUR.klaarLijn),
        context: mat(KLEUR.context, KLEUR.contextLijn), elek: mat(KLEUR.elek, KLEUR.elekLijn),
      };
      const box = new THREE.Box3(), focus = new THREE.Box3();
      for (const naam of Object.keys(G)) {
        if (past(naam, stap.verberg)) continue;
        let rol = past(naam, stap.nieuw) ? 'nieuw' : past(naam, stap.klaar) ? 'klaar' : past(naam, stap.context) ? 'context' : null;
        if (!rol) continue;
        if (rol === 'klaar' && /^EL_/.test(naam)) rol = 'elek';
        const g = new THREE.Group();
        let vlak = M[rol].vlak, lijn = M[rol].lijn;
        if (past(naam, stap.doorzichtig)) {   // bijv. de vloer als je van onder kijkt
          vlak = vlak.clone(); vlak.transparent = true; vlak.opacity = 0.3; vlak.depthWrite = false;
          lijn = lijn.clone(); lijn.transparent = true; lijn.opacity = 0.35;
        }
        g.add(new THREE.Mesh(G[naam].geo, vlak));
        g.add(new THREE.LineSegments(lijnGeo(G[naam]), lijn));
        g.userData.naam = naam;
        this.wereld.add(g);
        if (rol === 'nieuw') {
          g.userData.weg = this.verschuiving(naam, G[naam].geo.boundingBox);
          this.bewegend.push(g);
          box.union(G[naam].geo.boundingBox);
        }
        if (past(naam, stap.focus)) focus.union(G[naam].geo.boundingBox);
      }
      for (const s of stap.schroeven || []) {
        // L = 0: alleen een moer (de schroef zat er al)
        const sch = s.L ? maakSchroef(s.maat || 'M3', s.L) : new THREE.Group();
        richt(sch, s.in);
        this.wereld.add(sch);
        const item = { obj: sch, s, moer: null };
        if (s.moer) {
          item.moer = maakMoer(s.maat || 'M3');
          richt(item.moer, s.in.map(v => -v));
          this.wereld.add(item.moer);
        }
        this.schroeven.push(item);
        box.expandByPoint(new THREE.Vector3(...s.kop));
      }
      this.duur = stap.duur || (this.schroeven.length ? 6 : 4);
      if (!focus.isEmpty()) box.union(focus);
      this.zetCamera(stap.cam, box);
      this.pose();
    }
    // Waar een nieuw deel vandaan komt: per deel (richtingen: [[regex, [x,y,z] | 'radiaal' | ['radiaal', mm]]]) of voor de hele stap.
    verschuiving(naam, bb) {
      const st = this.stap;
      let r = st.richting || [0, 0, 60];
      for (const [p, v] of st.richtingen || []) if (new RegExp(p).test(naam)) { r = v; break; }
      if (r === 'radiaal' || (Array.isArray(r) && r[0] === 'radiaal')) {
        const afstand = Array.isArray(r) ? r[1] : (st.afstand || 45);
        const c = bb.getCenter(new THREE.Vector3());
        const L = Math.hypot(c.x, c.y) || 1;
        return [c.x / L * afstand, c.y / L * afstand, 0];
      }
      return r;
    }
    // cam = {oog, doel} (vast) of {kijk:[x,y,z], zoom} (richting vanaf het doel; afstand past zich aan de nieuwe delen aan)
    zetCamera(cam, box) {
      cam = cam || {};
      if (cam.oog) {
        this.cam.position.set(...cam.oog);
        this.controls.target.set(...cam.doel);
      } else if (box && !box.isEmpty()) {
        const c = cam.doel ? new THREE.Vector3(...cam.doel) : box.getCenter(new THREE.Vector3());
        const straal = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 25);
        const afst = straal / Math.sin(THREE.MathUtils.degToRad(this.cam.fov / 2)) * 1.05 * (cam.zoom || 1);
        const k = new THREE.Vector3(...(cam.kijk || [1, -1.3, 0.9])).normalize();
        this.controls.target.copy(c);
        this.cam.position.copy(c).addScaledVector(k, afst);
      }
      this.thuis = { oog: this.cam.position.clone(), doel: this.controls.target.clone() };
      this.controls.update();
    }
    herstelCamera() {
      if (!this.thuis) return;
      this.cam.position.copy(this.thuis.oog);
      this.controls.target.copy(this.thuis.doel);
    }
    // Tijdlijn: 0-35 % delen vliegen in, 35-80 % schroeven draaien in, daarna stilstand.
    pose() {
      if (!this.stap) return;
      const f = this.tijd / this.duur;
      const heeftSchroeven = this.schroeven.length > 0;
      const tDeel = ease(f / (heeftSchroeven ? 0.35 : 0.6));
      for (const g of this.bewegend) {
        const r = g.userData.weg;
        g.position.set(r[0] * (1 - tDeel), r[1] * (1 - tDeel), r[2] * (1 - tDeel));
      }
      const n = this.schroeven.length;
      this.schroeven.forEach((it, k) => {
        const s = it.s;
        const start = 0.35 + 0.4 * (k / Math.max(n, 1)) * 0.5;
        const t = ease((f - start) / 0.25);
        const weg = (s.L + 18) * (1 - t);
        const v = new THREE.Vector3(...s.in).normalize();
        it.obj.position.set(s.kop[0] - v.x * weg, s.kop[1] - v.y * weg, s.kop[2] - v.z * weg);
        it.obj.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0); // (oriëntatie blijft; draaiing hieronder)
        richt(it.obj, s.in);
        it.obj.rotateZ(-t * Math.PI * 6);
        it.obj.visible = f >= start - 0.05;
        if (it.moer) {
          const tm = ease((f - start - 0.12) / 0.2);
          const wm = 20 * (1 - tm);
          it.moer.position.set(s.moer[0] + v.x * wm, s.moer[1] + v.y * wm, s.moer[2] + v.z * wm);
          it.moer.visible = f >= start;
        }
      });
    }
    zetTijd(f) { this.tijd = f * this.duur; this.pose(); }
  }
  window.HBViewer = Viewer;
})();
