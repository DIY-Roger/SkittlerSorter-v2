// Inhoud van de bouwhandleiding Skittle Sorter v2 (Engels). Eén bestand voor alle hoofdstukken.
// Bronnen: Fusion "Skittles Sorter v2" (geometrie, models/sorter.js), de bouwvideo (volgorde en tips,
// ondertitels), code SkittlesMachine_v3_8.ino (pinnen, servokanalen, seriële commando's) en Media/Wiringv2.png.
//
// Hoofdstuk: { id:'h2', nr, deel, titel, samenvatting, stappen:[...] }
// Stap:      { titel, delen:[[aantal, naam, opm]], hw:[[aantal, 'M3x8', 'waar']], gereedschap:[], tekst:'<p>..</p>',
//              letop:['..'], tip:['..'], foto:{src, alt, bijschrift}, bij: seconden in de bouwvideo,
//              scene:{...} | beeld:{src, alt, bijschrift} | video:{id, start} }
// Scene:     zie viewer.js (model, nieuw, klaar, context, verberg, richting, richtingen, cam, focus, doorzichtig, labels)
// Coördinaten in mm zoals in Fusion: z omhoog, de draaischijf ligt rond z = 0, de bodemplaat op z = -151.
(function () {
  // Lichaamsgroepen (regex op de namen in models/sorter.js)
  const BASE = ['^Base$'];
  const BOXES = ['^ColorBox'];
  const BAY = ['^ControlPanelBase$'];
  const BTN = ['^ButtonBox$'];
  const ARDUINO = ['^EL_Arduino$'], PCA = ['^EL_PCA9685$'], DRV = ['^EL_DRV8825$'], LM = ['^EL_LM2596$'];
  const BOARDS = [...ARDUINO, ...PCA, ...DRV];
  const DECK = ['^FixedDisc$'];
  const SERVOS = ['^EL_Servo_'], FLAPS = ['^Trapdoor_'];
  const NEMA = ['^EL_Nema17$'];
  const DISC = ['^MovingDisc$', '^MovingDiscColoring$'];
  const SWITCH = ['^EL_Microswitch$'];
  const BSERVO = ['^EL_BufferServo$'], BGEAR = ['^BufferGear$'], SWGEAR = ['^SweeperGear$'];
  const SENSOR = ['^SensorBay$', '^EL_TCS3200$', '^SensorCap$'];
  const HOPPER = ['^Buffer$', '^SweeperV2$', '^BufferExtender$'];

  const ONDER = [...BASE, ...BSERVO, ...BGEAR, ...BOXES];                  // zwarte basis met bufferaandrijving
  const BAY_ALL = [...BAY, ...BTN, ...BOARDS, ...LM];
  const TOP = [...DECK, ...NEMA, ...DISC, ...SWITCH, ...SERVOS, ...FLAPS];  // het sorteerdek
  const ALLES = [...ONDER, ...BAY_ALL, ...TOP, ...SWGEAR, ...SENSOR, ...HOPPER];

  const CAM_DEK = { kijk: [0.9, -1.2, 1.1] };
  const CAM_ONDER = { kijk: [-0.4, -1.3, -0.9] };    // van onder tegen het dek aan
  const CAM_BAY = { kijk: [-1.2, 1.0, 0.45] };       // naar de elektronica-bay (achterkant, x<0 en y>0)

  window.HB = {
    links: {
      makerworld: 'https://makerworld.com/en/models/2753363-skittler-sorter-v2#profileId-3055268',
      v1: 'https://makerworld.com/en/models/1481101-skittlers-sorter#profileId-1546502',
      code: 'https://github.com/RexoLudus/SkittlerSorter-v2',
      video: 'FV6zuGcm5Gw',
    },
    waarom: {
      kop: 'Why I built this',
      titel: 'Kids are tough critics. <span class="geel">That is the point.</span>',
      tekst: `<p>The Skittle Sorter started as a guest lesson for a class of ten-year-olds. I wanted to show them that technology is not something that happens inside a phone, but something you can design, print, wire and program yourself, and that it can actually do a job.</p>
        <p>The first thing they said: <em>"We can sort them faster by hand."</em> True. Then the machine started reading colours, turning, and flicking trapdoors open, and the room went quiet. That moment is why this machine exists.</p>
        <p>Version 1 was built in a few days. It won a MakerWorld contest and went on to be used in technical classes and on school open days. Version 2 is what real classroom use taught me: faster, smoother, more reliable, and with candy bins you can take out. Every engineer, maker and tech wizard should take the chance to inspire kids. If this gets just one kid excited about engineering, it is a win.</p>`,
    },
    delen: [
      { id: 'A', titel: 'Part A · Get ready' },
      { id: 'B', titel: 'Part B · The sorting deck' },
      { id: 'C', titel: 'Part C · Base and electronics' },
      { id: 'D', titel: 'Part D · Bring it to life' },
    ],
    hoofdstukken: [
      // ---------------------------------------------------------------- A
      {
        id: 'h1', nr: 1, deel: 'A', titel: 'Before you start',
        samenvatting: 'What the machine does, what to print, what to buy, and a dry fit of all parts.',
        stappen: [
          {
            titel: 'How the sorter works',
            tekst: `<p>Skittles go into the <b>hopper</b> on top. A yellow <b>sweeper</b>, driven by a continuous-rotation servo, keeps them moving so they drop one by one into the holes of the <b>turntable</b>.</p>
              <p>A <b>NEMA 17 stepper</b> turns the table one hole at a time; a <b>micro switch</b> clicks into the notches on its rim so every stop is exact. Under the black <b>sensor cap</b> a <b>TCS3200 colour sensor</b> reads each candy.</p>
              <p>The Arduino remembers which colour sits in which hole. When a candy passes the right exit, a <b>servo flips its trapdoor</b> and the candy drops into one of the <b>removable bins</b> below. Purple, red, green, yellow and orange each have their own exit; the sixth exit is used to empty the table on a reset.</p>`,
            tip: ['Drag the model to rotate it, scroll to zoom. In every step the yellow parts are the ones you add.'],
            scene: { model: 'sorter', nieuw: [], klaar: ALLES, cam: { oog: [420, -520, 330], doel: [0, 0, -40] },
              labels: ['Skittle Sorter v2', 'Fusion model'] },
          },
          {
            titel: 'Print the parts',
            delenKop: 'Printed parts',
            delen: [
              [1, 'Base', 'black; bottom plate with the three posts'],
              [3, 'Colour box', 'two compartments each, removable'],
              [1, 'Fixed disc (the deck)', 'white; the biggest print'],
              [1, 'Moving disc (turntable)', 'white with yellow ring (colour change)'],
              [6, 'Trapdoor (flipper)', 'yellow'],
              [1, 'Electronics bay', 'white'],
              [1, 'Button box', 'white'],
              [1, 'Sensor bay + sensor cap', 'yellow + black'],
              [1, 'Hopper + extender tube', 'white'],
              [1, 'Sweeper + sweeper gear + servo gear', 'yellow'],
            ],
            tekst: `<p>All print files are on <a href="https://makerworld.com/en/models/2753363-skittler-sorter-v2#profileId-3055268" target="_blank" rel="noopener">MakerWorld</a>, ready to open in Bambu Studio. The designer profile uses 0.2 mm layers, 2 walls and 15 % infill in PLA, about 34 hours and 1.2 kg of filament in total.</p>
              <p>Colours are up to you. White, yellow and black match the machine in the photos and make the candy stand out.</p>`,
            letop: ['Remove all supports and check that every part fits <b>before</b> you start the assembly. Holes for screws and the bearing seat must be clean.'],
            bij: 37,
            scene: { model: 'sorter', nieuw: ALLES, klaar: [], richting: 'radiaal', afstand: 70, cam: { oog: [460, -560, 380], doel: [0, 0, -40] } },
          },
          {
            titel: 'Electronics and hardware',
            delenKop: 'Electronics (bill of materials)',
            delen: [
              [1, 'Arduino Uno R3', 'main controller'],
              [1, 'TCS3200 colour sensor', 'reads the candy colour'],
              [1, 'PCA9685 servo driver', '16 channels over I²C'],
              [6, 'SG90 / MG90S micro servo, 180°', 'trapdoors'],
              [1, 'SG90 micro servo, 360° (continuous)', 'hopper sweeper'],
              [1, 'NEMA 17 stepper motor', 'turntable'],
              [1, 'DRV8825 driver + expansion board', 'for the stepper'],
              [1, 'Micro switch KW11-3Z-1', 'turntable position'],
              [1, 'LM2596 buck converter 12 V → 5 V', 'servo power'],
              [1, '12 V 2 A power supply + DC socket', ''],
              [1, 'Push button 12 mm with LED', 'start / stop'],
              [1, '51105 thrust bearing', '25 × 42 × 11 mm'],
              [1, 'small passive buzzer (optional)', 'start/stop jingles and alarm'],
            ],
            hw: [[0, 'M3 screws', 'various lengths, plus M3 brass heat-set inserts'], [0, 'servo screws', 'the small screws supplied with each servo']],
            gereedschap: ['screwdriver set', 'soldering iron', 'side cutters', 'multimeter', 'servo tester (handy)', 'a drop of glue', 'USB-B cable'],
            tekst: '<p>The same list, with shop links, is on the MakerWorld page. Every part is cheap and easy to find, which matters if a school wants to build a few.</p>',
            foto: { src: 'img/photo-electronics.jpg', alt: 'The finished electronics bay with Arduino, PCA9685, DRV8825 board and buck converter', bijschrift: 'Where it is all going: the finished electronics bay.' },
            scene: { model: 'sorter', nieuw: [...BOARDS, ...LM, ...NEMA, ...SERVOS, ...BSERVO, ...SWITCH, '^EL_TCS3200$'], klaar: [], context: [...BAY, ...DECK, ...BASE],
              richting: 'radiaal', afstand: 60, cam: { oog: [-380, 420, 160], doel: [-40, 20, -60] }, labels: ['+electronics', 'printed parts (context)'] },
          },
        ],
      },
      // ---------------------------------------------------------------- B
      {
        id: 'h2', nr: 2, deel: 'B', titel: 'Trapdoor servos',
        samenvatting: 'Six servos get a trimmed horn and a yellow flipper. Centre them first.',
        stappen: [
          {
            titel: 'Centre the servo, trim the horn',
            delen: [[6, 'servo, 180°', ''], [6, 'standard single-arm horn', 'comes with the servo']],
            hw: [[6, 'servo screws', 'horn to servo']],
            gereedschap: ['servo tester', 'side cutters', 'small screwdriver'],
            tekst: `<p>Put each servo on a servo tester and drive it fully to one side. Only then mount the horn, so every trapdoor starts closed in exactly the same position.</p>
              <p>Trim the standard arm that comes with the servo to size, so it fits inside the flipper, and screw it onto the servo.</p>`,
            letop: ['Without a servo tester the flippers end up at random angles. No tester? Wire the servo to the finished machine later and use the serial command <code>test 1</code>.'],
            foto: { src: 'img/step-servo-arm.jpg', alt: 'Trimming the servo horn to size', bijschrift: 'Trim the standard horn so it fits in the flipper.' },
            bij: 71,
            scene: { model: 'sorter', nieuw: ['^EL_Servo_1$'], klaar: [], cam: { kijk: [0.6, -1, 0.8], zoom: 2.2 }, labels: ['+servo 1 of 6'] },
          },
          {
            titel: 'Glue on the flipper',
            delen: [[6, 'Trapdoor (flipper)', 'printed, yellow']],
            gereedschap: ['glue'],
            tekst: '<p>Slide the yellow flipper over the trimmed horn and glue it in place. Do all six the same way, so they are identical and interchangeable.</p>',
            bij: 75,
            scene: { model: 'sorter', nieuw: ['^Trapdoor_1$'], klaar: ['^EL_Servo_1$'], richting: [-30, 0, 25], cam: { kijk: [0.6, -1, 0.8], zoom: 1.5 } },
          },
        ],
      },
      {
        id: 'h3', nr: 3, deel: 'B', titel: 'Drive and turntable',
        samenvatting: 'Stepper motor in the centre of the deck, thrust bearing, turntable and the position switch.',
        stappen: [
          {
            titel: 'Stepper motor into the deck',
            delen: [[1, 'Fixed disc (deck)', ''], [1, 'NEMA 17 stepper', '']],
            hw: [[4, 'M3 screws', 'motor to deck, from the top']],
            tekst: '<p>The NEMA 17 fits neatly in the centre, from below, with the shaft pointing up. Fix it with four M3 screws through the deck.</p>',
            foto: { src: 'img/step-nema.jpg', alt: 'Screwing the stepper motor into the centre of the deck', bijschrift: 'Motor in the centre, screws from the top.' },
            bij: 153,
            scene: { model: 'sorter', nieuw: NEMA, klaar: DECK, richting: [0, 0, -70], cam: CAM_ONDER, doorzichtig: DECK, focus: DECK },
          },
          {
            titel: 'Thrust bearing and turntable',
            delen: [[1, '51105 thrust bearing', ''], [1, 'Moving disc (turntable)', '']],
            tekst: `<p>The horizontal bearing fits tightly. Apply slight pressure to press it into its seat around the motor shaft.</p>
              <p>Then lower the turntable onto the bearing and the motor shaft. It carries all the weight on the bearing, so the motor only has to turn it.</p>`,
            letop: ['Do not hammer the bearing in. Press evenly; a tilted bearing makes the table wobble and the sensor read badly.'],
            foto: { src: 'img/step-bearing.jpg', alt: 'Pressing the thrust bearing into the deck', bijschrift: 'Press the bearing in with even pressure.' },
            bij: 179,
            scene: { model: 'sorter', nieuw: DISC, klaar: [...DECK, ...NEMA], richting: [0, 0, 90], cam: CAM_DEK },
          },
          {
            titel: 'Position switch',
            delen: [[1, 'micro switch KW11-3Z-1', 'with lever']],
            tekst: `<p>Mount the micro switch on the deck, next to the hopper corner, so its lever rides on the notched rim of the turntable. Every time it drops into a notch, the Arduino stops the stepper: one hole further, exactly in place.</p>
              <p>Turn the table by hand: you should hear the switch click once per hole.</p>`,
            tip: ['If the motor turns but never stops, the switch is not reaching the notches. After 6 seconds the software stops and sounds an alarm (jam detection).'],
            scene: { model: 'sorter', nieuw: SWITCH, klaar: [...DECK, ...DISC], richting: [-40, 0, 0], cam: { kijk: [-0.7, -0.8, 0.9], zoom: 0.75 }, focus: ['^MovingDisc$'] },
          },
        ],
      },
      {
        id: 'h4', nr: 4, deel: 'B', titel: 'Servos in the deck',
        samenvatting: 'The six trapdoor servos drop into their pockets around the turntable.',
        stappen: [
          {
            titel: 'Install the six trapdoor servos',
            delen: [[6, 'servo with flipper', 'from chapter 2']],
            hw: [[12, 'servo screws', 'two per servo']],
            tekst: `<p>Each servo goes into its own pocket on the rim of the deck, flipper towards the turntable. Exit 1 is the first one after the colour sensor, counting in the direction the table turns; the software counts the same way.</p>
              <p>Lead the cable down through the deck.</p>`,
            foto: { src: 'img/step-servos.jpg', alt: 'Servos with yellow flippers installed around the turntable', bijschrift: 'All six in place, flippers under the turntable.' },
            bij: 200,
            scene: { model: 'sorter', nieuw: [...SERVOS, ...FLAPS], klaar: [...DECK, ...DISC, ...NEMA, ...SWITCH], richting: 'radiaal', afstand: 60, cam: CAM_DEK },
          },
          {
            titel: 'Test and tidy the cables',
            gereedschap: ['servo tester', 'glue'],
            tekst: `<p>After installing all the servos, use the servo tester again to check that every flipper opens and closes freely without touching the turntable.</p>
              <p>Use a small drop of glue to keep the servo wires in place. (Version 3 might get a more "engineered" solution.)</p>`,
            bij: 263,
            scene: { model: 'sorter', nieuw: [], klaar: [...DECK, ...DISC, ...NEMA, ...SWITCH, ...SERVOS, ...FLAPS], cam: { oog: [200, -420, -380], doel: [0, 0, -20] }, labels: ['view from below'] },
          },
        ],
      },
      // ---------------------------------------------------------------- C
      {
        id: 'h5', nr: 5, deel: 'C', titel: 'Base and hopper drive',
        samenvatting: 'The continuous servo and its gear go into the black base; the bins slide in.',
        stappen: [
          {
            titel: 'Buffer servo into the base',
            delen: [[1, 'Base', 'black'], [1, 'servo 360° (continuous rotation)', ''], [1, 'servo gear', 'yellow, small']],
            hw: [[1, 'servo screw', 'gear to servo (the one supplied)']],
            tekst: `<p>The hopper sweeper needs a <b>continuous-rotation (360°) servo</b>. A normal 180° servo will not work here.</p>
              <p>Mount it at the top of the base, then press the small yellow gear onto its shaft. No glue: the gear is held by the original screw supplied with the servo.</p>`,
            letop: ['Check the label: a 360° servo looks exactly like a 180° one.'],
            foto: { src: 'img/step-buffer-gear.jpg', alt: 'Mounting the yellow gear on the buffer servo', bijschrift: 'Gear on the 360° servo, held by its own screw.' },
            bij: 361,
            scene: { model: 'sorter', nieuw: [...BSERVO, ...BGEAR], klaar: BASE, richtingen: [['^BufferGear$', [0, 0, 40]]], richting: [0, 0, 50], cam: { kijk: [0.6, -1.2, 0.9] }, focus: BASE },
          },
          {
            titel: 'Colour bins',
            delen: [[3, 'Colour box', 'two compartments each']],
            tekst: '<p>Slide the three colour boxes between the posts of the base. They are loose on purpose: after a run you take a bin out, show the class, and eat the evidence.</p>',
            foto: { src: 'img/photo-bins.jpg', alt: 'A colour box with green and yellow Skittles in its two compartments', bijschrift: 'Two colours per removable bin.' },
            scene: { model: 'sorter', nieuw: BOXES, klaar: [...BASE, ...BSERVO, ...BGEAR], richting: 'radiaal', afstand: 90, cam: { kijk: [1, -1.2, 0.7] } },
          },
        ],
      },
      {
        id: 'h6', nr: 6, deel: 'C', titel: 'Electronics bay',
        samenvatting: 'Arduino, servo driver, stepper driver, button and the 5 V converter in one white bay.',
        stappen: [
          {
            titel: 'Boards into the bay',
            delen: [[1, 'Electronics bay', 'printed'], [1, 'Arduino Uno R3', ''], [1, 'PCA9685 servo driver', ''], [1, 'DRV8825 + expansion board', '']],
            hw: [[0, 'M3 screws', 'into the bay, short (the board must not be pushed through)']],
            tekst: '<p>Assemble everything in the electronics bay, <b>except the power converter</b>: that one needs a few solder joints first (step 6.3).</p><p>Put the DRV8825 on its expansion board before mounting it.</p>',
            foto: { src: 'img/step-electronics-bay.jpg', alt: 'Screwing the Arduino into the white electronics bay', bijschrift: 'Arduino and drivers into the bay.' },
            bij: 411,
            scene: { model: 'sorter', nieuw: BOARDS, klaar: BAY, richting: [-60, 0, 0], cam: CAM_BAY, focus: BAY },
          },
          {
            titel: 'Button box',
            delen: [[1, 'Button box', 'printed'], [1, 'push button with LED', ''], [1, 'DC socket', '']],
            gereedschap: ['soldering iron'],
            tekst: `<p>Solder wires to the push button (switch and LED) and to the DC socket, then mount both in the button box. Leave the wires long enough to reach the Arduino and the converter.</p>
              <p>The button starts and stops the machine. Its LED blinks while waiting, burns steady while sorting, and flashes fast on an alarm.</p>`,
            foto: { src: 'img/step-button-box.jpg', alt: 'Soldering the button and DC socket in the button box', bijschrift: 'Button and power socket in the little white box.' },
            bij: 600,
            scene: { model: 'sorter', nieuw: BTN, klaar: [...BAY, ...BOARDS], richting: [40, 0, 0], cam: { kijk: [0.3, 1.2, 0.5] }, focus: BAY },
          },
          {
            titel: '12 V → 5 V converter',
            delen: [[1, 'LM2596 buck converter', '']],
            gereedschap: ['multimeter', 'small screwdriver', 'soldering iron'],
            tekst: `<p>Solder the input and output wires to the converter. Installing it is a tight fit and needs a bit of patience.</p>
              <p><b>Then, before anything else is connected:</b> put 12 V on the input, measure the output and turn the trim screw until it reads 5.0 V.</p>`,
            letop: ['Most converters arrive set to a higher voltage. Connecting the servo driver before you have adjusted it to 5 V can destroy all seven servos at once.'],
            foto: { src: 'img/step-5v.jpg', alt: 'Multimeter reading 4.99 V on the converter output', bijschrift: '4.99 V: good to go.' },
            bij: 683,
            scene: { model: 'sorter', nieuw: LM, klaar: [...BAY, ...BOARDS, ...BTN], richting: [-50, 0, 0], cam: CAM_BAY, focus: BAY },
          },
          {
            titel: 'Bay into the base',
            tekst: '<p>Slide the complete electronics bay into the open sector of the base, between the bins, and fix it with M3 screws through the holes along its bottom edge. The button box faces outward.</p>',
            scene: { model: 'sorter', nieuw: BAY_ALL, klaar: ONDER, richting: [-70, 70, 0], cam: { kijk: [-1, 1, 0.6] } },
          },
        ],
      },
      // ---------------------------------------------------------------- D
      {
        id: 'h7', nr: 7, deel: 'D', titel: 'Deck on the base',
        samenvatting: 'The sweeper gear, then the complete deck on the posts. No screws.',
        stappen: [
          {
            titel: 'Sweeper gear',
            delen: [[1, 'Sweeper gear', 'yellow, with long shaft']],
            tekst: '<p>Stand the yellow sweeper gear with its long shaft on the base, so it meshes with the small servo gear. The shaft will go up through the deck and drive the sweeper in the hopper.</p>',
            scene: { model: 'sorter', nieuw: SWGEAR, klaar: [...ONDER, ...BAY_ALL], richting: [0, 0, 80], cam: { kijk: [0.7, -1.2, 0.8], zoom: 1.7 }, focus: [...SWGEAR, ...BGEAR] },
          },
          {
            titel: 'Lower the deck',
            tekst: `<p>The top simply rests on the base: no glue, no screws. Guide all servo, motor and switch wires neatly into the electronics bay while you lower it, and let the sweeper shaft slide up through its hole.</p>`,
            tip: ['Because nothing is screwed, you can lift the deck off later to fix a wire. Handy in a classroom.'],
            foto: { src: 'img/step-top-on-base.jpg', alt: 'Lowering the deck onto the black base', bijschrift: 'Lower the deck, wires into the bay.' },
            bij: 393,
            scene: { model: 'sorter', nieuw: TOP, klaar: [...ONDER, ...BAY_ALL, ...SWGEAR], richting: [0, 0, 140], cam: { oog: [420, -520, 300], doel: [0, 0, -50] } },
          },
        ],
      },
      {
        id: 'h8', nr: 8, deel: 'D', titel: 'Colour sensor and hopper',
        samenvatting: 'The TCS3200 in its bay above the turntable, then the hopper with the sweeper.',
        stappen: [
          {
            titel: 'Shorten the sensor LEDs',
            delen: [[1, 'TCS3200 colour sensor', '']],
            gereedschap: ['side cutters', 'soldering iron'],
            tekst: '<p>The four white LEDs on the TCS3200 stick out too far and would touch the turntable. Shorten them (desolder, trim the legs and solder them back lower) so they sit just above the board.</p>',
            foto: { src: 'img/step-sensor-leds.jpg', alt: 'Shortening the LEDs on the colour sensor', bijschrift: 'LEDs lower, so they clear the turntable.' },
            bij: 521,
            scene: { model: 'sorter', nieuw: ['^EL_TCS3200$'], klaar: [], cam: { kijk: [0.5, -1, 1.1], zoom: 1.5 } },
          },
          {
            titel: 'Sensor bay and cap',
            delen: [[1, 'Sensor bay', 'yellow'], [1, 'Sensor cap', 'black']],
            hw: [[0, 'M3 screws', 'sensor into the bay']],
            tekst: `<p>Mount the sensor in the yellow sensor bay, looking down, and place the bay on the deck so it sits right above the holes of the turntable. The black cap keeps daylight out.</p>
              <p>Wire the colour sensor according to the diagram (chapter 9) and route the wires neatly. Neat wires make happy engineers.</p>`,
            letop: ['The software is tuned with the cap on. Daylight leaking in changes the readings; always calibrate with the cap in place.'],
            foto: { src: 'img/step-sensor-wiring.jpg', alt: 'Wiring the colour sensor on the assembled machine', bijschrift: 'Sensor wiring along the deck.' },
            bij: 739,
            scene: { model: 'sorter', nieuw: SENSOR, klaar: [...TOP], context: [...ONDER, ...BAY_ALL], richting: [0, 0, 90], richtingen: [['^SensorCap$', [0, 0, 150]]], cam: { kijk: [0.4, -1.2, 0.9], zoom: 1.2 }, focus: [...SENSOR, '^MovingDisc$'] },
          },
          {
            titel: 'Hopper and sweeper',
            delen: [[1, 'Hopper', 'white'], [1, 'Sweeper', 'yellow'], [1, 'Extender tube', 'white']],
            tekst: `<p>Place the hopper on the back of the deck, over the sweeper shaft. Push the yellow sweeper onto the shaft inside the hopper, and put the extender tube on top.</p>
              <p>While sorting, the sweeper swings left and right every two seconds, so candy never jams and keeps dropping into the turntable.</p>`,
            scene: { model: 'sorter', nieuw: HOPPER, klaar: [...TOP, ...SWGEAR, ...SENSOR], context: [...ONDER, ...BAY_ALL], richting: [0, 0, 110], cam: { kijk: [0.6, -1.2, 0.8], zoom: 1.2 }, focus: [...HOPPER, ...DECK] },
          },
        ],
      },
      {
        id: 'h9', nr: 9, deel: 'D', titel: 'Wiring',
        samenvatting: 'Wiring diagram plus a pin table straight from the code.',
        stappen: [
          {
            titel: 'Wiring diagram',
            tekst: `<p>The diagram shows every connection. 12 V from the DC socket feeds the Arduino (VIN), the stepper driver and the converter; the converter makes 5 V for the servos (V+ on the PCA9685). All grounds are connected together.</p>
              <p>Click the diagram to open it full size.</p>`,
            tip: ['Reading the diagram: the push button with LED is drawn as two red buttons (D6 = the button, D7 = its LED) and the micro switch as a small slide switch (D5). The pin table in the next step lists every connection.'],
            beeld: { src: 'img/wiring.png', alt: 'Wiring diagram: Arduino Uno, PCA9685, DRV8825, LM2596, TCS3200, switch and buttons', bijschrift: 'Wiring diagram Skittle Sorter v2 (Fritzing).' },
          },
          {
            titel: 'Pin table',
            tekst: `<table class="tabel"><tr><th>Arduino</th><th>To</th></tr>
              <tr><td>D2 / D3 / D4</td><td>DRV8825 DIR / STEP / ENABLE</td></tr>
              <tr><td>D5</td><td>micro switch (other side to GND)</td></tr>
              <tr><td>D6</td><td>push button (other side to GND)</td></tr>
              <tr><td>D7</td><td>button LED (+)</td></tr>
              <tr><td>D8 / D9</td><td>TCS3200 S0 / S1</td></tr>
              <tr><td>D10 / D11</td><td>TCS3200 S2 / S3</td></tr>
              <tr><td>D12</td><td>TCS3200 OUT</td></tr>
              <tr><td>D13</td><td>TCS3200 LED</td></tr>
              <tr><td>A0</td><td>buzzer (optional)</td></tr>
              <tr><td>A4 / A5</td><td>PCA9685 SDA / SCL</td></tr>
              <tr><td>5V / GND</td><td>PCA9685 VCC, TCS3200 VCC</td></tr>
              <tr><td>VIN</td><td>12 V</td></tr></table>
              <p><b>PCA9685 channels:</b> 0 = hopper servo (360°), 1–6 = trapdoors, exit 1 to 6. Servo plugs: yellow/orange on PWM, red on V+, brown/black on GND.</p>`,
            tip: ['The switch and the button use the Arduino\'s internal pull-up: wire them between the pin and GND, no resistor needed.'],
            foto: { src: 'img/photo-electronics.jpg', alt: 'Wired electronics bay', bijschrift: 'All wired up.' },
            bij: 631,
            scene: { model: 'sorter', nieuw: [], klaar: [...BAY_ALL], context: [...ONDER], cam: { kijk: [-1.2, 1, 0.5], zoom: 0.8 }, focus: BAY_ALL, labels: ['electronics bay'] },
          },
        ],
      },
      {
        id: 'h10', nr: 10, deel: 'D', titel: 'Software and calibration',
        samenvatting: 'Upload the sketch, test every servo, teach the sensor your Skittles.',
        stappen: [
          {
            titel: 'Upload the code',
            gereedschap: ['computer with Arduino IDE', 'USB-B cable'],
            tekst: `<p>Download the sketch from <a href="https://github.com/RexoLudus/SkittlerSorter-v2" target="_blank" rel="noopener">GitHub</a> (also linked on MakerWorld). In the Arduino IDE install the library <b>Adafruit PWM Servo Driver</b>, select <i>Arduino Uno</i> and upload.</p>
              <p>Open the Serial Monitor at <b>9600 baud</b>. You should see <code>BOOT ok</code>, <code>I2C PCA9685... ok</code> and <code>Klaar. Wacht op knop.</code></p>`,
            letop: ['Three low beeps and nothing moves? The Arduino cannot find the PCA9685. Check VCC, GND, SDA (A4) and SCL (A5).'],
            beeld: { src: 'img/photo-electronics.jpg', alt: 'Electronics bay with Arduino Uno', bijschrift: 'Plug the USB cable into the Arduino in the bay.' },
          },
          {
            titel: 'Test the mechanics',
            tekst: `<p>Type commands in the Serial Monitor:</p>
              <table class="tabel"><tr><th>Command</th><th>What it does</th></tr>
              <tr><td><code>test 3 5</code></td><td>opens and closes trapdoor 3, five times</td></tr>
              <tr><td><code>turn</code></td><td>one step of the turntable, until the switch clicks</td></tr>
              <tr><td><code>buffer</code></td><td>short sweeper test</td></tr>
              <tr><td><code>reset</code></td><td>empties the turntable and cycles every trapdoor</td></tr></table>
              <p>If a flipper does not close fully or opens too far, adjust its numbers in <code>servoMin[]</code> / <code>servoMax[]</code> at the top of the sketch.</p>`,
            scene: { model: 'sorter', nieuw: [...SERVOS, ...FLAPS], klaar: [...DECK, ...DISC, ...NEMA], cam: CAM_DEK, labels: ['+trapdoors 1–6'] },
          },
          {
            titel: 'Calibrate the colours',
            tekst: `<p>The software has a built-in calibration mode. Load one Skittles colour per run and type <code>cal</code>: it measures the candy under the sensor and prints red, green and blue plus two ratios (red/green and blue/green).</p>
              <p>Because it uses ratios instead of raw values, it copes well with small changes in brightness. The thresholds are at the top of the sketch (<code>GREEN_MIN_RG</code>, <code>YELLOW_MIN_BG</code>, …). Run <code>validate</code> to check 25 holes in a row.</p>`,
            tip: ['Calibrate again if you change the turntable colour, the sensor cap or the room lighting. The default values are tuned for a black disc.'],
            foto: { src: 'img/photo-skittles.jpg', alt: 'Red, yellow, green and purple Skittles on a cutting mat', bijschrift: 'One colour at a time.' },
            bij: 771,
            scene: { model: 'sorter', nieuw: ['^EL_TCS3200$'], klaar: [...DISC, '^SensorBay$'], context: [...DECK], verberg: ['^SensorCap$'], cam: { kijk: [0.3, -1, 1.2], zoom: 1.2 }, focus: ['^EL_TCS3200$', '^SensorBay$'], labels: ['+sensor', 'cap hidden'] },
          },
          {
            titel: 'Press the button and sort',
            tekst: `<p>Fill the hopper and press the button. A short jingle, the LED lights up, the sweeper starts swinging, and the table steps around: read, remember, flip.</p>
              <p>Purple, red, green, yellow and orange each get their own exit. When twelve empty holes pass in a row, the machine stops by itself and plays its stop jingle. Press the button again to stop it earlier.</p>`,
            tip: ['A jam (the table cannot reach the next notch within 6 seconds) stops everything and plays an alarm. Clear it and press the button once to reset.'],
            beeld: { src: 'img/photo-bins.jpg', alt: 'Sorted green and yellow Skittles in a bin', bijschrift: 'Mission accomplished.' },
          },
        ],
      },
      {
        id: 'h11', nr: 11, deel: 'D', titel: 'In the classroom',
        samenvatting: 'Ideas for using it with kids, and what to let them discover.',
        stappen: [
          {
            titel: 'Ideas: let them be the critics',
            tekst: `<p>Start with a challenge: <em>who is faster, you or the machine?</em> Kids will win. Then ask them how the machine knows which colour it sees, and why the trapdoor opens at exactly the right moment.</p>
              <p>Everything is visible: the turntable, the flippers, the wires in the open bay. Point at the parts while it runs: sensor (eyes), Arduino (brain), servos and stepper (muscles). Lift off the cap so they can see the light.</p>
              <p>Let them guess what happens with a candy the machine has never seen (an M&amp;M, a brown one). Then try it.</p>`,
            tip: ['Open days: let the machine run on its own and put a removable bin in visitors\' hands. The sorted candy is the best conversation starter.'],
            beeld: { src: 'img/photo-deck.jpg', alt: 'The Skittle Sorter with servos and filled bins', bijschrift: 'Start, build, learn, improve. And most of all: inspire others.' },
          },
          {
            titel: 'Share yours',
            tekst: `<p>Built one? I would love to see it, and if you use it in a classroom or workshop, I am especially curious how it is received. Post a make on <a href="https://makerworld.com/en/models/2753363-skittler-sorter-v2#profileId-3055268" target="_blank" rel="noopener">MakerWorld</a> or leave a comment under the <a href="https://www.youtube.com/watch?v=FV6zuGcm5Gw" target="_blank" rel="noopener">build video</a>.</p>
              <p>There is plenty of room to improve it, and that is exactly the point.</p>`,
            video: { id: 'FV6zuGcm5Gw' },
          },
        ],
      },
    ],
  };
})();
