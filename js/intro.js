// Opening scene: hand-drawn characters arrive from the edges of the book
// and cluster around the middle (~4s, plays once, then stays still).
(function () {
  const SKIN1 = "#ffe3c4", SKIN2 = "#b97a56", SKIN3 = "#f3cfa6";

  const svg = `
<svg viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kids reading and drawing, a pencil running, an owl on a paper airplane, and letters parachuting in">
<defs>
  <filter id="sketch" x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <clipPath id="wormHole"><rect x="-160" y="-600" width="320" height="476"/></clipPath>
  <style>
    .k{fill:none;stroke:#2b2b2b;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
    .kf{stroke:#2b2b2b;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
    .thin{stroke-width:3}
    .txt{font-family:"Patrick Hand","Comic Sans MS",sans-serif;fill:#2b2b2b}
    .rd{font-family:"Andika","Comic Sans MS",sans-serif;font-weight:700}
  </style>
</defs>

<!-- title -->
<g id="title" transform="translate(800 150)">
  <g filter="url(#sketch)">
    <text class="txt" text-anchor="middle" font-size="92" y="0">
      <tspan fill="#ef5b5b">D</tspan><tspan fill="#ff9f45">o</tspan><tspan fill="#e8b500">o</tspan><tspan fill="#6bcb77">d</tspan><tspan fill="#4d96ff">l</tspan><tspan fill="#a77bca">e</tspan><tspan> </tspan><tspan fill="#2b2b2b">Words</tspan>
    </text>
    <path class="k thin" d="M-190 26 Q-60 44 70 28 T200 30" stroke="#ffd93d" stroke-width="8"/>
  </g>
</g>

<!-- doodle stars & hearts (draw on at the end) -->
<g class="doodle" filter="url(#sketch)">
  <path class="k draw" pathLength="1" stroke="#e8b500" d="M90 80 l14 30 l33 4 l-24 22 l7 33 l-30 -17 l-30 17 l7 -33 l-24 -22 l33 -4 z"/>
  <path class="k draw" pathLength="1" stroke="#ef5b5b" d="M1530 560 c-14 -22 -46 -6 -30 20 l30 30 l30 -30 c16 -26 -16 -42 -30 -20 z"/>
  <path class="k draw" pathLength="1" stroke="#4d96ff" d="M600 60 q20 -20 40 0 t40 0 t40 0"/>
  <path class="k draw" pathLength="1" stroke="#6bcb77" d="M60 560 l10 22 l24 3 l-18 16 l5 24 l-21 -12 l-21 12 l5 -24 l-18 -16 l24 -3 z"/>
</g>

<!-- grass under the kids -->
<g class="doodle" filter="url(#sketch)">
  <path class="k draw thin" pathLength="1" stroke="#6bcb77" d="M110 886 q60 -6 120 0 t120 -2 t120 2 t110 0 M140 886 l-6 -16 M150 886 l6 -18 M420 886 l-4 -14 M430 886 l6 -16 M520 886 l4 -16"/>
  <path class="k draw thin" pathLength="1" stroke="#6bcb77" d="M1070 648 q60 -5 120 0 t130 0 M1100 648 l-4 -14 M1110 648 l6 -16 M1300 648 l4 -14"/>
</g>

<!-- FLYING BOOKS -->
<g transform="translate(190 400)"><g id="fbook1"><g filter="url(#sketch)">
  <g class="wingL"><path class="kf" fill="#4d96ff" d="M0 0 Q-34 -26 -70 -14 L-70 26 Q-34 16 0 40 Z"/><path class="k thin" d="M-14 6 l-42 -6 M-14 18 l-42 -4"/></g>
  <g class="wingR"><path class="kf" fill="#4d96ff" d="M0 0 Q34 -26 70 -14 L70 26 Q34 16 0 40 Z"/><path class="k thin" d="M14 6 l42 -6 M14 18 l42 -4"/></g>
  <circle cx="-6" cy="12" r="3" fill="#2b2b2b"/><circle cx="6" cy="12" r="3" fill="#2b2b2b"/>
</g></g></g>
<g transform="translate(450 300)"><g id="fbook2"><g filter="url(#sketch)">
  <g class="wingL"><path class="kf" fill="#ff9f45" d="M0 0 Q-28 -22 -58 -12 L-58 22 Q-28 14 0 34 Z"/></g>
  <g class="wingR"><path class="kf" fill="#ff9f45" d="M0 0 Q28 -22 58 -12 L58 22 Q28 14 0 34 Z"/></g>
  <circle cx="-5" cy="10" r="3" fill="#2b2b2b"/><circle cx="5" cy="10" r="3" fill="#2b2b2b"/>
</g></g></g>

<!-- OWL ON A PAPER AIRPLANE -->
<g transform="translate(300 175)"><g id="owl"><g filter="url(#sketch)">
  <path class="kf" fill="#ffffff" d="M-130 20 L140 -12 L-70 52 Z"/>
  <path class="kf" fill="#e9eef7" d="M-70 52 L-30 12 L140 -12 Z"/>
  <path class="kf" fill="#d6deec" d="M-30 12 L-62 72 L-70 52 Z"/>
  <ellipse class="kf" fill="#a47148" cx="-10" cy="-38" rx="40" ry="46"/>
  <ellipse fill="#e7c9a0" cx="-10" cy="-22" rx="24" ry="26"/>
  <path class="k thin" d="M-22 -18 q6 6 12 0 q6 6 12 0 M-22 -6 q6 6 12 0 q6 6 12 0"/>
  <circle class="kf" fill="#fff" cx="-26" cy="-58" r="15"/><circle class="kf" fill="#fff" cx="8" cy="-58" r="15"/>
  <circle fill="#2b2b2b" cx="-23" cy="-56" r="6"/><circle fill="#2b2b2b" cx="11" cy="-56" r="6"/>
  <path class="k thin" d="M-11 -60 l4 0"/>
  <path class="kf" fill="#ff9f45" d="M-14 -44 l5 10 l5 -10 z"/>
  <path class="kf" fill="#2b2b2b" d="M-52 -98 L-10 -116 L32 -98 L-10 -82 Z"/>
  <path class="kf" fill="#2b2b2b" d="M-34 -92 L-34 -80 Q-10 -70 14 -80 L14 -92"/>
  <path class="k" stroke="#ffd93d" stroke-width="4" d="M-10 -99 L22 -92 L24 -70"/>
  <g class="owlWing"><path class="kf" fill="#8b5a33" d="M28 -40 Q62 -66 56 -98 Q40 -70 24 -58 Z"/></g>
  <text class="txt" x="40" y="-120" font-size="40" transform="rotate(-8)">Hoo!</text>
</g></g></g>

<!-- ABC PARACHUTES -->
<g transform="translate(1120 215)"><g class="chute" id="chuteA"><g filter="url(#sketch)">
  <path class="kf" fill="#ffd93d" d="M-70 -110 Q0 -196 70 -110 Q52 -122 35 -110 Q18 -124 0 -110 Q-18 -124 -35 -110 Q-52 -122 -70 -110 Z"/>
  <path class="k thin" d="M-70 -110 L-34 -40 M70 -110 L34 -40 M0 -110 L0 -40"/>
  <rect class="kf" fill="#ef5b5b" x="-40" y="-40" width="80" height="80" rx="10"/>
  <text class="rd" x="0" y="22" text-anchor="middle" font-size="62" fill="#fff" stroke="#2b2b2b" stroke-width="2">A</text>
</g></g></g>
<g transform="translate(1290 150)"><g class="chute" id="chuteB"><g filter="url(#sketch)">
  <path class="kf" fill="#ff8fab" d="M-70 -110 Q0 -196 70 -110 Q52 -122 35 -110 Q18 -124 0 -110 Q-18 -124 -35 -110 Q-52 -122 -70 -110 Z"/>
  <path class="k thin" d="M-70 -110 L-34 -40 M70 -110 L34 -40 M0 -110 L0 -40"/>
  <rect class="kf" fill="#4d96ff" x="-40" y="-40" width="80" height="80" rx="10"/>
  <text class="rd" x="0" y="22" text-anchor="middle" font-size="62" fill="#fff" stroke="#2b2b2b" stroke-width="2">b</text>
</g></g></g>
<g transform="translate(1455 240)"><g class="chute" id="chuteC"><g filter="url(#sketch)">
  <path class="kf" fill="#6bcb77" d="M-66 -106 Q0 -186 66 -106 Q50 -118 33 -106 Q16 -120 0 -106 Q-16 -120 -33 -106 Q-50 -118 -66 -106 Z"/>
  <path class="k thin" d="M-66 -106 L-34 -40 M66 -106 L34 -40 M0 -106 L0 -40"/>
  <rect class="kf" fill="#ffd93d" x="-40" y="-40" width="80" height="80" rx="10"/>
  <text class="rd" x="0" y="22" text-anchor="middle" font-size="62" fill="#fff" stroke="#2b2b2b" stroke-width="2">c</text>
</g></g></g>

<!-- PENCIL RUNNER -->
<g transform="translate(1195 640)"><g id="pencil"><g id="pencilBob"><g filter="url(#sketch)">
  <g class="speed"><path class="k thin" stroke="#9a9a9a" d="M70 -250 l70 0 M80 -210 l90 0 M70 -170 l60 0"/></g>
  <g transform="translate(-14 -82)"><g class="legA"><path class="k" d="M0 0 L-6 76"/><ellipse class="kf" fill="#ef5b5b" cx="-16" cy="78" rx="18" ry="8"/></g></g>
  <g transform="translate(14 -82)"><g class="legB"><path class="k" d="M0 0 L6 76"/><ellipse class="kf" fill="#ef5b5b" cx="-4" cy="78" rx="18" ry="8"/></g></g>
  <path class="kf" fill="#f2c98f" d="M-30 -92 L0 -40 L30 -92 Z"/>
  <path class="kf" fill="#2b2b2b" d="M-9 -56 L0 -40 L9 -56 Z"/>
  <rect class="kf" fill="#ffd93d" x="-30" y="-300" width="60" height="208"/>
  <path class="k thin" d="M-10 -296 L-10 -96 M10 -296 L10 -96"/>
  <rect class="kf" fill="#bfc5cc" x="-32" y="-318" width="64" height="20"/>
  <path class="kf" fill="#ff8fab" d="M-30 -318 L-30 -336 Q0 -356 30 -336 L30 -318 Z"/>
  <circle fill="#fff" class="kf" cx="-12" cy="-240" r="10"/><circle fill="#fff" class="kf" cx="12" cy="-240" r="10"/>
  <circle fill="#2b2b2b" cx="-15" cy="-239" r="4"/><circle fill="#2b2b2b" cx="9" cy="-239" r="4"/>
  <ellipse class="kf" fill="#ff6b6b" cx="0" cy="-212" rx="10" ry="8"/>
  <path class="k" d="M-30 -190 L-60 -160 L-74 -176 M30 -190 L60 -224"/>
  <g class="sweat"><path class="kf" fill="#8ec5ff" d="M40 -286 q-8 12 0 16 q8 -4 0 -16 z"/><path class="kf" fill="#8ec5ff" d="M54 -258 q-6 10 0 13 q6 -3 0 -13 z"/></g>
</g></g></g></g>

<!-- BOOKWORM in a book stack -->
<g transform="translate(800 905)"><g id="stack"><g filter="url(#sketch)">
  <g clip-path="url(#wormHole)"><g id="worm">
    <circle class="kf" fill="#8fd694" cx="0" cy="-132" r="24"/>
    <circle class="kf" fill="#8fd694" cx="10" cy="-168" r="24"/>
    <circle class="kf" fill="#8fd694" cx="4" cy="-204" r="24"/>
    <circle class="kf" fill="#a3e4a8" cx="-12" cy="-246" r="32"/>
    <circle class="k thin" cx="-26" cy="-252" r="10"/><circle class="k thin" cx="0" cy="-252" r="10"/><path class="k thin" d="M-16 -252 l6 0"/>
    <circle fill="#2b2b2b" cx="-25" cy="-251" r="3.5"/><circle fill="#2b2b2b" cx="1" cy="-251" r="3.5"/>
    <path class="k thin" d="M-28 -232 q14 12 28 0"/>
    <path class="k thin" d="M-22 -276 q-10 -24 -22 -26 M0 -276 q6 -24 18 -28"/>
    <circle fill="#ef5b5b" cx="-44" cy="-302" r="6"/><circle fill="#ef5b5b" cx="18" cy="-304" r="6"/>
  </g></g>
  <rect class="kf" fill="#ef5b5b" x="-112" y="-124" width="214" height="40" rx="5"/>
  <path class="k thin" stroke="#fff" d="M-96 -112 l60 0"/>
  <rect class="kf" fill="#ffd93d" x="-98" y="-84" width="224" height="42" rx="5"/>
  <path class="k thin" d="M90 -78 l0 30 M100 -78 l0 30"/>
  <rect class="kf" fill="#4d96ff" x="-120" y="-42" width="236" height="42" rx="5"/>
  <path class="k thin" stroke="#fff" d="M-100 -22 l70 0"/>
</g></g></g>

<!-- CONVEYOR BELT with the drawing girl -->
<g transform="translate(1260 800)"><g id="conveyor"><g filter="url(#sketch)">
  <path class="k" d="M-230 44 L-250 150 M230 44 L250 150 M-250 150 l-20 0 M250 150 l20 0"/>
  <rect class="kf" fill="#cfcfcf" x="-270" y="0" width="540" height="46" rx="23"/>
  <path class="k thin belt" stroke="#8a8a8a" stroke-dasharray="18 22" d="M-250 6 L250 6"/>
  <g transform="translate(-246 23)"><g class="roller"><circle class="kf" fill="#9a9a9a" r="15"/><path class="k thin" d="M-12 0 L12 0"/></g></g>
  <g transform="translate(-130 23)"><g class="roller"><circle class="kf" fill="#9a9a9a" r="15"/><path class="k thin" d="M-12 0 L12 0"/></g></g>
  <g transform="translate(0 23)"><g class="roller"><circle class="kf" fill="#9a9a9a" r="15"/><path class="k thin" d="M-12 0 L12 0"/></g></g>
  <g transform="translate(130 23)"><g class="roller"><circle class="kf" fill="#9a9a9a" r="15"/><path class="k thin" d="M-12 0 L12 0"/></g></g>
  <g transform="translate(246 23)"><g class="roller"><circle class="kf" fill="#9a9a9a" r="15"/><path class="k thin" d="M-12 0 L12 0"/></g></g>
  <rect class="kf" fill="#ff9f45" x="262" y="-34" width="62" height="80" rx="8"/>
  <path class="kf" fill="#ffd93d" d="M296 -24 l-14 28 l12 0 l-8 26 l20 -32 l-12 0 l10 -22 z"/>
  <g class="puffs"><circle class="k thin" cx="300" cy="-60" r="10"/><circle class="k thin" cx="318" cy="-84" r="14"/><circle class="k thin" cx="296" cy="-112" r="9"/></g>

  <!-- paper with a doodle -->
  <path class="kf" fill="#fff" d="M-262 0 L-150 0 L-128 -40 L-240 -40 Z"/>
  <circle class="k thin" stroke="#e8b500" cx="-206" cy="-20" r="9"/>
  <path class="k thin" stroke="#e8b500" d="M-222 -20 l-8 0 M-190 -20 l8 0 M-206 -34 l0 -4"/>
  <path class="k thin" stroke="#4d96ff" d="M-176 -10 q10 -14 22 -2"/>

  <!-- the girl, lying on her tummy -->
  <g id="drawer">
    <g transform="translate(70 -24)"><g class="kickA"><path class="k" d="M0 0 L70 4 L58 -76"/><ellipse class="kf" fill="#ffd93d" cx="58" cy="-84" rx="10" ry="16" transform="rotate(-20 58 -84)"/></g></g>
    <g transform="translate(70 -20)"><g class="kickB"><path class="k" d="M0 0 L84 10 L92 -66"/><ellipse class="kf" fill="#ffd93d" cx="94" cy="-74" rx="10" ry="16" transform="rotate(10 94 -74)"/></g></g>
    <path class="kf" fill="#a77bca" d="M50 -46 Q90 -44 92 -26 Q92 -8 50 -8 Z"/>
    <path class="kf" fill="#6bcb77" d="M-80 -60 Q-10 -76 58 -52 L58 -8 Q-10 -2 -84 -10 Z"/>
    <path class="k" d="M-62 -16 L-102 -6 L-142 -24"/>
    <rect class="kf" fill="#ef5b5b" x="-170" y="-34" width="34" height="11" rx="3" transform="rotate(-24 -150 -28)"/>
    <path class="k" d="M-70 -30 L-118 -2"/>
    <circle class="kf" fill="${SKIN3}" cx="-112" cy="-76" r="40"/>
    <path class="kf" fill="#f4a259" d="M-150 -86 Q-140 -126 -96 -118 Q-70 -110 -72 -84 Q-96 -100 -150 -86 Z"/>
    <path class="k" stroke="#f4a259" stroke-width="12" d="M-82 -104 Q-50 -130 -36 -96"/>
    <circle fill="#2b2b2b" cx="-132" cy="-74" r="4"/><circle fill="#2b2b2b" cx="-110" cy="-76" r="4"/>
    <path class="k thin" d="M-142 -90 l14 4 M-118 -92 l12 0"/>
    <path class="k thin" d="M-136 -56 l18 -2"/>
    <ellipse fill="#ff8fab" class="kf" cx="-124" cy="-52" rx="6" ry="5" stroke-width="3"/>
    <g class="focus"><path class="k thin" stroke="#4d96ff" d="M-170 -110 l-12 -10 M-160 -126 l-8 -16 M-144 -132 l-2 -18"/></g>
  </g>
</g></g></g>

<!-- BOY with a book (walks in from the left) -->
<g transform="translate(250 880)"><g id="boy"><g id="boyBob"><g filter="url(#sketch)">
  <g transform="translate(-12 -120)"><g class="legA"><path class="k" d="M0 0 L0 112"/><ellipse class="kf" fill="#4d96ff" cx="10" cy="115" rx="18" ry="8"/></g></g>
  <g transform="translate(12 -120)"><g class="legB"><path class="k" d="M0 0 L0 112"/><ellipse class="kf" fill="#4d96ff" cx="10" cy="115" rx="18" ry="8"/></g></g>
  <path class="kf" fill="#3d5a98" d="M-32 -132 L32 -132 L36 -102 L6 -102 L0 -114 L-6 -102 L-36 -102 Z"/>
  <path class="kf" fill="#ff9f45" d="M-30 -230 Q0 -238 30 -230 L36 -130 L-36 -130 Z"/>
  <path class="kf" fill="#ffd93d" d="M0 -200 l6 12 l13 1 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -1 z" stroke-width="3"/>
  <path class="k" d="M0 -236 L0 -244"/>
  <circle class="kf" fill="${SKIN1}" cx="4" cy="-286" r="44"/>
  <path class="kf" fill="#8b5a2b" d="M-40 -292 Q-42 -332 4 -334 Q48 -332 48 -292 Q30 -312 4 -308 Q-22 -314 -40 -292 Z"/>
  <path class="k" stroke="#8b5a2b" d="M-12 -330 l-6 -16 M6 -334 l2 -18 M22 -330 l10 -14"/>
  <path class="k" d="M10 -292 q7 -9 14 0 M32 -292 q6 -8 12 0"/>
  <path class="kf" fill="#ff6b6b" d="M10 -270 Q28 -244 46 -272 Z"/>
  <circle fill="#ff9bb0" cx="-4" cy="-270" r="8" opacity=".7"/>
  <path class="k thin" d="M-38 -290 q-10 5 0 14"/>
  <path class="k" d="M-6 -222 Q30 -186 76 -206 M8 -216 Q46 -166 90 -186"/>
  <g transform="translate(74 -238) rotate(-10)">
    <path class="kf" fill="#ef5b5b" d="M-5 -5 L42 6 L89 -5 L89 66 L42 77 L-5 66 Z"/>
    <path class="kf" fill="#fff" d="M0 0 L42 10 L84 0 L84 60 L42 70 L0 60 Z"/>
    <path class="k" d="M42 10 L42 70"/>
    <path class="k thin" d="M8 18 L32 24 M8 30 L32 36 M8 42 L28 47 M52 24 L76 18 M52 36 L76 30"/>
    <circle class="k thin" stroke="#ff9f45" cx="62" cy="48" r="7"/>
  </g>
</g></g></g></g>

<!-- GIRL laughing (walks in from the left, then turns to her friend) -->
<g transform="translate(450 880)"><g id="girl"><g id="girlFace"><g id="girlBob"><g filter="url(#sketch)">
  <g transform="translate(-12 -108)"><g class="legA"><path class="k" d="M0 0 L-2 104"/><ellipse class="kf" fill="#a77bca" cx="-10" cy="107" rx="17" ry="8"/></g></g>
  <g transform="translate(12 -108)"><g class="legB"><path class="k" d="M0 0 L2 104"/><ellipse class="kf" fill="#a77bca" cx="-6" cy="107" rx="17" ry="8"/></g></g>
  <path class="kf" fill="#ff8fab" d="M0 -230 Q-8 -230 -14 -226 L-52 -102 Q0 -92 52 -102 L14 -226 Q8 -230 0 -230 Z"/>
  <circle fill="#fff" cx="-18" cy="-150" r="6"/><circle fill="#fff" cx="16" cy="-170" r="6"/><circle fill="#fff" cx="4" cy="-124" r="6"/>
  <path class="k" d="M0 -234 L0 -240"/>
  <circle class="kf" fill="#3b2a20" cx="-50" cy="-296" r="18"/><circle class="kf" fill="#3b2a20" cx="42" cy="-296" r="18"/>
  <path class="kf" fill="#ffd93d" d="M-62 -322 l12 10 l-14 8 z M-38 -322 l-12 10 l14 8 z" stroke-width="3"/>
  <circle class="kf" fill="${SKIN2}" cx="-4" cy="-280" r="42"/>
  <path class="kf" fill="#3b2a20" d="M-46 -286 Q-44 -326 -4 -324 Q36 -326 38 -286 Q14 -306 -4 -296 Q-24 -308 -46 -286 Z"/>
  <path class="k" d="M-34 -292 l12 6 l-12 6 M2 -292 l-12 6 l12 6"/>
  <path class="kf" fill="#ff6b6b" d="M-36 -266 Q-16 -232 6 -266 Z"/>
  <path class="kf" fill="#ff9bb0" d="M-24 -254 q8 -8 16 0 q-8 10 -16 0" stroke-width="2"/>
  <path class="k" d="M-6 -214 Q-34 -186 -14 -168"/>
  <path class="k" d="M6 -214 Q34 -238 44 -268"/>
  <path class="k thin" d="M50 -284 l8 -8 M54 -268 l10 -2"/>
</g></g></g>
  <g class="haha"><text class="txt" x="-110" y="-350" font-size="44" fill="#ef5b5b" transform="rotate(-10 -80 -350)">ha ha!</text></g>
</g></g>
</svg>`;

  const D = { fill: "both", easing: "cubic-bezier(.25,.8,.35,1)" };
  const q = (root, s) => root.querySelector(s);
  const qa = (root, s) => [...root.querySelectorAll(s)];

  function walk(legs, bob, delay, duration, steps) {
    const anims = [];
    const legA = legs.find(l => l.classList.contains("legA"));
    const legB = legs.find(l => l.classList.contains("legB"));
    const stepDur = duration / steps;
    const iter = { delay, duration: stepDur, iterations: steps, direction: "alternate", easing: "ease-in-out" };
    if (legA) anims.push(legA.animate([{ transform: "rotate(24deg)" }, { transform: "rotate(-24deg)" }], iter));
    if (legB) anims.push(legB.animate([{ transform: "rotate(-24deg)" }, { transform: "rotate(24deg)" }], iter));
    if (bob) anims.push(bob.animate([{ transform: "translateY(0)" }, { transform: "translateY(-10px)" }, { transform: "translateY(0)" }], { delay, duration: stepDur, iterations: steps }));
    return anims;
  }

  // Plays the opening. Calls onDone() once everything has settled.
  function play(stageEl, onDone) {
    stageEl.innerHTML = svg;
    const root = stageEl.querySelector("svg");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const all = [];
    const add = (a) => { if (Array.isArray(a)) all.push(...a); else all.push(a); return a; };

    // Title
    add(q(root, "#title").animate([{ transform: "translate(800px,150px) scale(0) rotate(-12deg)" }, { transform: "translate(800px,150px) scale(1.15) rotate(3deg)", offset: .7 }, { transform: "translate(800px,150px) scale(1)" }], { ...D, duration: 700, delay: 100 }));
    // q(root,"#title") has an attribute transform; use CSS transform that includes it.

    // Girl: walks in from the left, turns to face her friend, laughs
    const girl = q(root, "#girl");
    add(girl.animate([{ transform: "translateX(-720px)" }, { transform: "translateX(0)" }], { ...D, duration: 1700, delay: 0, easing: "cubic-bezier(.3,.6,.4,1)" }));
    add(walk(qa(girl, ".legA, .legB"), q(girl, "#girlBob"), 0, 1600, 8));
    add(q(root, "#girlFace").animate([{ transform: "scaleX(-1)" }, { transform: "scaleX(-1)", offset: .85 }, { transform: "scaleX(1)" }], { ...D, duration: 2000 }));
    add(q(root, ".haha").animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }], { ...D, duration: 400, delay: 2300, easing: "cubic-bezier(.3,1.6,.5,1)" }));

    // Boy: walks in from the left holding out his book
    const boy = q(root, "#boy");
    add(boy.animate([{ transform: "translateX(-600px)" }, { transform: "translateX(0)" }], { ...D, duration: 2100, delay: 250, easing: "cubic-bezier(.3,.6,.4,1)" }));
    add(walk(qa(boy, ".legA, .legB"), q(boy, "#boyBob"), 250, 2000, 10));

    // Owl swoops in on a paper airplane
    add(q(root, "#owl").animate([
      { transform: "translate(-560px,-300px) rotate(14deg)" },
      { transform: "translate(-200px,90px) rotate(-6deg)", offset: .45 },
      { transform: "translate(60px,-30px) rotate(6deg)", offset: .78 },
      { transform: "translate(0,0) rotate(0deg)" },
    ], { ...D, duration: 2300, delay: 300, easing: "ease-in-out" }));
    add(q(root, ".owlWing").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-25deg)" }], { duration: 230, delay: 300, iterations: 10, direction: "alternate", fill: "both" }));

    // Flying books
    add(q(root, "#fbook1").animate([{ transform: "translate(-420px,60px)" }, { transform: "translate(-200px,-50px)", offset: .5 }, { transform: "translate(0,0)" }], { ...D, duration: 2200, delay: 700, easing: "ease-out" }));
    add(q(root, "#fbook2").animate([{ transform: "translate(-640px,-120px)" }, { transform: "translate(-300px,40px)", offset: .5 }, { transform: "translate(0,0)" }], { ...D, duration: 2400, delay: 900, easing: "ease-out" }));
    qa(root, ".wingL, .wingR").forEach((w, i) => add(w.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.35)" }], { duration: 180, delay: 700 + (i > 1 ? 200 : 0), iterations: 12, direction: "alternate", fill: "both", easing: "ease-in-out" })));

    // Conveyor belt rolls the drawing girl in from the bottom-right corner
    add(q(root, "#conveyor").animate([{ transform: "translate(780px,260px)" }, { transform: "translate(0,0)" }], { ...D, duration: 2300, delay: 600, easing: "cubic-bezier(.2,.7,.3,1)" }));
    qa(root, ".roller").forEach(r => add(r.animate([{ transform: "rotate(0)" }, { transform: "rotate(-1080deg)" }], { duration: 2300, delay: 600, fill: "both", easing: "cubic-bezier(.2,.7,.3,1)" })));
    add(q(root, ".belt").animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 400 }], { duration: 2300, delay: 600, fill: "both", easing: "cubic-bezier(.2,.7,.3,1)" }));
    add(q(root, ".puffs").animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1 }, { opacity: 0, transform: "translateY(-30px)" }], { duration: 800, delay: 700, iterations: 2, fill: "both" }));
    add(q(root, ".kickA").animate([{ transform: "rotate(0)" }, { transform: "rotate(16deg)" }], { duration: 300, delay: 1200, iterations: 8, direction: "alternate", fill: "both" }));
    add(q(root, ".kickB").animate([{ transform: "rotate(10deg)" }, { transform: "rotate(-6deg)" }], { duration: 300, delay: 1200, iterations: 8, direction: "alternate", fill: "both" }));

    // ABC parachutes drift down with a sway
    ["#chuteA", "#chuteB", "#chuteC"].forEach((id, i) => add(q(root, id).animate([
      { transform: "translateY(-560px) rotate(-10deg)" },
      { transform: "translateY(-300px) rotate(9deg)", offset: .35 },
      { transform: "translateY(-90px) rotate(-6deg)", offset: .7 },
      { transform: "translateY(0) rotate(0deg)" },
    ], { ...D, duration: 2300, delay: 900 + i * 250, easing: "ease-out" })));

    // Pencil sprints in from the right, panting
    const pencil = q(root, "#pencil");
    add(pencil.animate([{ transform: "translateX(560px)" }, { transform: "translateX(-14px)", offset: .88 }, { transform: "translateX(0)" }], { ...D, duration: 1600, delay: 1500, easing: "cubic-bezier(.3,.7,.4,1)" }));
    add(walk(qa(pencil, ".legA, .legB"), q(pencil, "#pencilBob"), 1500, 1400, 12));
    add(q(root, ".speed").animate([{ opacity: 1 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: 1700, delay: 1500, fill: "both" }));
    add(q(root, ".sweat").animate([{ opacity: 0, transform: "translate(0,0)" }, { opacity: 1, transform: "translate(6px,-6px)" }], { duration: 400, delay: 3000, fill: "both" }));

    // Book stack rises, then the bookworm pops out
    add(q(root, "#stack").animate([{ transform: "translateY(320px)" }, { transform: "translateY(0)" }], { ...D, duration: 700, delay: 2200, easing: "cubic-bezier(.3,1.4,.5,1)" }));
    add(q(root, "#worm").animate([{ transform: "translateY(240px)" }, { transform: "translateY(-16px)", offset: .7 }, { transform: "translateY(0)" }], { ...D, duration: 700, delay: 2900 }));

    // Doodles draw themselves on
    qa(root, ".draw").forEach((p, i) => add(p.animate([{ strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0 }], { duration: 600, delay: 3100 + i * 120, fill: "both", easing: "ease-out" })));

    if (reduce) all.forEach(a => a.finish());

    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      all.forEach(a => { try { a.finish(); } catch (e) {} });
      onDone && onDone();
    };
    Promise.all(all.map(a => a.finished.catch(() => {}))).then(finish);
    return { skip: finish };
  }

  // A tiny boy+girl doodle used on other screens.
  window.Intro = { play };
})();
