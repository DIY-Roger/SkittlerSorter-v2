# Skittle Sorter v2: bouwhandleiding (web)

Interactieve bouwhandleiding in IKEA-stijl, in het **Engels**, in de DIY_Roger-huisstijl. Opgezet als kopie van de TheBOX-handleiding (`D:\DIY_Roger\PuzzleBox\PuzzleBox\Handleiding\web`): zelfde viewer, zelfde opbouw, UI vertaald.

Online: **https://diy-roger.com/projects/skittle-sorter/handleiding/** (knop "Build guide" op de projectpagina).

## Openen
- Lokaal: `python -m http.server 8766 --directory Handleiding/web` en dan http://localhost:8766 (of preview "handleiding" in `.claude/launch.json`). Nodig: internet voor three.js (cdn.jsdelivr.net, 0.170.0) en voor de YouTube-video.
- Bediening: → / spatie = volgende stap, ← = vorige, R = animatie opnieuw; slepen = draaien, scroll = zoom.

## Publiceren (eenmalig, geen automatische sync)
Op verzoek van Roger (2026-10-25) is er **geen** geplande sync-taak zoals bij TheBOX. Na een wijziging: committen en dan

```
python D:\DIY_Roger\Voorraad\vault\tools\site-sync.py --name skittle-sorter-handleiding --source <repo>\Handleiding\web --dest public/projects/skittle-sorter/handleiding
```

Alleen gewijzigde bestanden gaan mee (vergelijking met `%USERPROFILE%\.vault\site-sync-skittle-sorter-handleiding.json`). README, `tools/` en vingerafdrukken gaan niet mee. Verhoog bij elke update `HB_VERSIE` en de `?v=` in `index.html`.

## Opbouw
| Bestand | Wat |
|---|---|
| `index.html` | schil (kop, lade met hoofdstukken) |
| `js/inhoud.js` | **alle inhoud**: links, het "why"-blok, hoofdstukken en stappen (Engels) |
| `js/app.js` | navigatie, stappagina; extra t.o.v. TheBOX: `foto`, `bij` (tijd in de bouwvideo), `beeld` en `video` per stap |
| `js/viewer.js` | 3D-viewer (ongewijzigd van TheBOX) |
| `models/sorter.js` | geometrie uit Fusion "Skittles Sorter v2" (gegenereerd, niet met de hand wijzigen) |
| `img/` | foto's uit `Media\`, stills uit de bouwvideo (`D:\VideoProjects\Skittler V2 Built\Buildv2-v01.mp4`), schema `Wiringv2.png` |
| `tools/pak_modellen.py` | pakt de mesh-export in tot `models/sorter.js` |

## Bronnen en keuzes
- Volgorde en tips: ondertitels van de bouwvideo (YouTube FV6zuGcm5Gw). Pinnen, servokanalen en seriële commando's: `Code/SkittlesMachine_v3_8`. Stuklijst en "why": MakerWorld-pagina's v1 en v2.
- **Geen Vandoren-logo**: de sensorkap in het Fusion-model bestaat in twee varianten; de handleiding gebruikt `SensorCap-Clean`. Foto's en video's met de Vandoren-kap zijn bewust niet gebruikt (dit is de hobbysite).
- Schroeflengtes staan niet in het model; de handleiding noemt daarom "M3 screws" zonder lengte, behalve waar de video het laat zien.

## Geometrie bijwerken na een wijziging in Fusion
Exporteer opnieuw (alleen lezen) met het exportscript uit de sessie van 2026-10-25: alle zichtbare lichamen per groep samengevoegd (o.a. `EL_Arduino`, `EL_Servo_1..6`, `Trapdoor_1..6`, `FixedDisc`, `MovingDisc`, `SensorCap` = Clean-variant) naar `_mesh/` als JSON (mm), dan `python tools/pak_modellen.py _mesh models/sorter.js sorter`. De groepnamen moeten blijven kloppen met de regexen bovenaan `js/inhoud.js`.
