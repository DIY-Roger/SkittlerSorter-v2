# Pakt de mesh-export uit Fusion (fusion_mesh_export.py, een .json per lichaam) in één JS-bestand
# dat de webhandleiding ook vanaf file:// kan laden (geen fetch nodig).
# Gebruik: python pak_modellen.py <map met .json> <uitvoer .js> <sleutel> [regex om over te slaan]
import base64, json, os, re, sys
import numpy as np

src, uit, sleutel = sys.argv[1:4]
skip = re.compile(sys.argv[4]) if len(sys.argv) > 4 else None
lichamen, delen, off = [], [], 0
for fn in sorted(os.listdir(src)):
    if not fn.endswith('.json'):
        continue
    d = json.load(open(os.path.join(src, fn)))
    if skip and skip.search(d['naam']):
        continue
    p = np.round(np.array(d['p'], dtype=np.float64) * 100).astype(np.int16)   # 0,01 mm
    i = np.array(d['i'], dtype=np.uint32)
    it = np.uint16 if p.size // 3 < 65536 else np.uint32
    pb, ib = p.tobytes(), i.astype(it).tobytes()
    pad = (-len(pb)) % 4
    lichamen.append({'n': d['naam'], 'p': [off, p.size], 'i': [off + len(pb) + pad, i.size, 2 if it == np.uint16 else 4]})
    delen += [pb, b'\0' * pad, ib, b'\0' * ((-len(ib)) % 4)]
    off += len(pb) + pad + len(ib) + ((-len(ib)) % 4)
blob = b''.join(delen)
with open(uit, 'w', encoding='utf-8') as f:
    f.write('// Gegenereerd door tools/pak_modellen.py uit Fusion Versie3. Niet met de hand wijzigen.\n')
    f.write('(window.HB_MODELLEN = window.HB_MODELLEN || {})[%s] = {schaal: 0.01, lichamen: %s, data: "%s"};\n'
            % (json.dumps(sleutel), json.dumps(lichamen, separators=(',', ':')), base64.b64encode(blob).decode()))
print(len(lichamen), 'lichamen', round(len(blob) / 1e6, 2), 'MB')

# Vingerafdruk per lichaam (bbox + aantal driehoeken), naast het model. Bij een "update" van de handleiding
# vergelijk je een nieuwe export hiermee om te zien welke delen in Fusion zijn veranderd.
vinger = {}
for fn in sorted(os.listdir(src)):
    if not fn.endswith('.json'):
        continue
    d = json.load(open(os.path.join(src, fn)))
    if skip and skip.search(d['naam']):
        continue
    p = np.array(d['p']).reshape(-1, 3)
    vinger[d['naam']] = {'min': np.round(p.min(0), 1).tolist(), 'max': np.round(p.max(0), 1).tolist(), 'driehoeken': len(d['i']) // 3}
with open(os.path.splitext(uit)[0] + '.vingerafdruk.json', 'w', encoding='utf-8') as f:
    json.dump(vinger, f, indent=1, ensure_ascii=False)
