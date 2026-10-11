// Draws the pixel-art SVGs used by the profile README (same palette and sprites as matinmobini.com):
//   assets/hero.svg         animated banner: name, runner jumping an enemy on scrolling ground
//   assets/player-card.svg  "PLAYER 1" stat card with the runner
//   assets/ground.svg       thin brick strip used as a section divider
// Run: node .github/scripts/build-readme-art.mjs
import fs from 'node:fs';

const PAL = {
  K: '#100C26', W: '#F5F2FF', Y: '#FFD447', y: '#C99A1E', P: '#FF5C8A', p: '#B24A68', S: '#F2B38A', s: '#D98E66',
  H: '#3A2A1A', U: '#5B4FC4', u: '#3B3380', D: '#2A2266', B: '#1C1645', C: '#3DDCFF', G: '#7CFF6B', g: '#3FAF3A',
};

const HEAD = ['...YYYYYY...', '..YHHHHHHY..', '..HHHHHHHH..', '.YHSSSSSSHY.', '.YHSKSSKSHY.', '.Y.SSSSSS.Y.', '...SSppSS...', '.....SS.....'];
const BODY = ['..PPPPPPPP..', '.PPPPPPPPPP.', 'SPPWKWWPWPPS', 'SPPWWWWWWPPS'];
const RUN = [
  [...HEAD, ...BODY, '...UU..UU...', '..UU....UU..', '.WW......WW.'],
  [...HEAD, ...BODY, '....UUUU....', '....UU.UU...', '...WWW.WW...'],
  [...HEAD, ...BODY, '...UUUUU....', '...UU..UU...', '..WW...WWW..'],
];
const IDLE = [...HEAD, ...BODY, '...UU..UU...', '...UU..UU...', '..WWW..WWW..'];
const WALKER = [
  ['....KKKK....', '..KKGGGGKK..', '.KGGGGGGGGK.', '.KGWKGGWKGK.', 'KGGWKGGWKGGK', 'KGGGGGGGGGGK', 'KGgGGGGGGgGK', 'KGGgggggGGGK', '.KGGGGGGGGK.', '..KgK..KgK..', '..KK....KK..'],
  ['............', '....KKKK....', '..KKGGGGKK..', '.KGWKGGWKGK.', 'KGGWKGGWKGGK', 'KGGGGGGGGGGK', 'KGgGGGGGGgGK', 'KGGgggggGGGK', 'KGGGGGGGGGGK', '.KgK.KK.KgK.', '.KK......KK.'],
];
const COIN = ['..KKKK..', '.KYYYYK.', 'KYYWYYyK', 'KYWYYYyK', 'KYYYYYyK', 'KYYYYyyK', '.KyyyyK.', '..KKKK..'];
const MOON = ['.....YYYYYY.....', '...YYYYYYYYYY...', '..YYYYYYYYYYYY..', '.YYYYyyyYYYYYYY.', '.YYYyyyyYYYYYYY.', 'YYYYYyyYYYYYYYYY', 'YYYYYYYYYYyyYYYY', 'YYYYYYYYYYyyYYYY', 'YYYYYYYYYYYYYYYY', 'YYYYYYYYYYYYYYYY', 'YYYYYYyyyYYYYYYY', '.YYYYYyyyYYYYYY.', '.YYYYYYYYYYYYYY.', '..YYYYYYYYYYYY..', '...YYYYYYYYYY...', '.....YYYYYY.....'];

// 5x7 pixel font.
const F = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#####|..#..|..#..|..#..|..#..|..#..|#####', J: '..###|...#.|...#.|...#.|#..#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  ' ': '.....|.....|.....|.....|.....|.....|.....', '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#', '-': '.....|.....|.....|#####|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '·': '.....|.....|.....|.##..|.##..|.....|.....',
  '×': '.....|#...#|.#.#.|..#..|.#.#.|#...#|.....', "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..', '@': '.###.|#...#|#.###|#.#.#|#.###|#....|.###.',
  '▶': '#....|##...|###..|####.|###..|##...|#....',
};

const r = (n) => Math.round(n * 100) / 100;
/** One <path> drawing pixel `text` at (x, y); each font pixel is `s` units. */
function text(str, x, y, s, fill, extra = '') {
  let d = '';
  [...str.toUpperCase()].forEach((ch, i) => {
    const g = F[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    g.split('|').forEach((row, j) => [...row].forEach((c, k) => {
      if (c === '#') d += `M${r(x + (i * 6 + k) * s)} ${r(y + j * s)}h${s}v${s}h-${s}z`;
    }));
  });
  return `<path fill="${fill}" d="${d}"${extra}/>`;
}
const textWidth = (str, s) => (str.length * 6 - 1) * s;
/** A sprite grid as one <path> per colour. */
function sprite(grid, x, y, s) {
  const by = {};
  grid.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === '.' || !PAL[c]) return;
    by[c] = (by[c] ?? '') + `M${x + i * s} ${y + j * s}h${s}v${s}h-${s}z`;
  }));
  return Object.entries(by).map(([c, d]) => `<path fill="${PAL[c]}" d="${d}"/>`).join('');
}
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const svg = (w, h, title, body, css) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${css}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }</style>
${body}
</svg>
`;

// ---------------------------------------------------------------- hero
function hero() {
  const W = 1200, H = 330, GROUND = 266, LOOP = 3; // seconds for one enemy pass
  // Moving things (enemy, coins) only show on the right, so they never cross the text.
  const ZONE = 740, FROM = 1250, TO = 640;
  let stars = '';
  const pts = [[40, 30], [130, 92], [210, 24], [300, 210], [380, 118], [470, 40], [560, 196], [640, 26], [700, 120], [760, 60], [830, 180], [900, 34], [980, 140], [1150, 160], [1180, 40], [600, 236], [1110, 210], [260, 160]];
  pts.forEach(([x, y], i) => {
    stars += `<rect class="tw" x="${x}" y="${y}" width="4" height="4" fill="${i % 3 ? '#B3ADD6' : '#F5F2FF'}" style="animation-delay:${(i * 0.37) % 3}s"/>`;
  });
  const hills = `<path fill="#1C1645" d="M0 ${GROUND}V200h120v-24h96v-32h144v40h88v-28h120v44h96v-36h160v28h104v-48h128v36h144v60z"/>`;
  // Two copies of the brick strip side by side; the group slides left by one brick and repeats.
  let bricks = '';
  for (let x = -48; x < W + 96; x += 48) {
    bricks += `<rect x="${x}" y="${GROUND + 8}" width="44" height="20" fill="#2A2266"/><rect x="${x + 24}" y="${GROUND + 32}" width="44" height="20" fill="#2A2266"/>`;
  }
  const RX = 820, S = 5, RY = GROUND - 15 * S;
  const runner = RUN.map((g, i) => `<g class="f f${i}">${sprite(g, RX, RY, S)}</g>`).join('');
  const enemy = WALKER.map((g, i) => `<g class="w w${i}">${sprite(g, 0, GROUND - 11 * S, S)}</g>`).join('');
  const coins = [0, 1].map((i) => `<g class="coin" style="animation-delay:${-i * 1.5}s">${sprite(COIN, 0, GROUND - 130 - i * 26, 4)}</g>`).join('');
  const title = 'MATIN MOBINI';
  const sub = 'AI/ML · ROBOTICS · SOFTWARE';
  const css = `
.tw { animation: tw 3s steps(2) infinite; }
@keyframes tw { 50% { opacity: .25; } }
.scroll { animation: scroll ${r((48 * LOOP) / (FROM - TO))}s linear infinite; }
@keyframes scroll { to { transform: translateX(-48px); } }
.f { opacity: 0; animation: run .36s steps(1) infinite; }
.f1 { animation-delay: .12s; } .f2 { animation-delay: .24s; }
@keyframes run { 0% { opacity: 1; } 33.33% { opacity: 0; } }
.jump { animation: jump ${LOOP}s infinite; }
@keyframes jump { 0%, 52% { transform: translateY(0); animation-timing-function: ease-out; } 70% { transform: translateY(-100px); animation-timing-function: ease-in; } 88%, 100% { transform: translateY(0); } }
.enemy { animation: walk ${LOOP}s linear infinite; }
@keyframes walk { from { transform: translateX(${FROM}px); } to { transform: translateX(${TO}px); } }
.w { animation: run2 .5s steps(1) infinite; } .w1 { opacity: 0; animation-delay: .25s; }
@keyframes run2 { 0% { opacity: 1; } 50% { opacity: 0; } }
.coin { animation: walk ${LOOP}s linear infinite; }
.blink { animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }`;
  const body = `<rect width="${W}" height="${H}" fill="#100C26"/>
<rect y="150" width="${W}" height="${GROUND - 150}" fill="#140F33"/>
${stars}
${sprite(MOON, 1040, 34, 6)}
${hills}
${text(title, 66, 66, 9, '#FF5C8A')}${text(title, 60, 60, 9, '#FFD447')}
${text(sub, 62, 148, 4, '#F5F2FF')}
${text('▶ PRESS START', 62, 196, 3, '#3DDCFF', ' class="blink"')}
${text('MATINMOBINI.COM', 62 + textWidth('▶ PRESS START  ', 3), 196, 3, '#B3ADD6')}
<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#1C1645"/>
<rect y="${GROUND}" width="${W}" height="6" fill="#5B4FC4"/>
<g class="scroll">${bricks}</g>
<clipPath id="zone"><rect x="${ZONE}" y="0" width="${W - ZONE}" height="${H}"/></clipPath>
<g clip-path="url(#zone)"><g>${coins}</g><g class="enemy">${enemy}</g></g>
<g class="jump">${runner}</g>`;
  return svg(W, H, 'Matin Mobini: AI/ML, robotics and software. The runner from matinmobini.com jumps an enemy.', body, css);
}

// ---------------------------------------------------------------- player card
function playerCard() {
  const W = 360, H = 446;
  const rows = [
    ['CLASS', 'CS · AI & ML'],
    ['GUILD', 'UOTTAWA'],
    ['GPA', '3.9 / 4.0'],
    ['BUFF', "9× DEAN'S LIST"],
    ['MAIN', 'PYTHON'],
    ['NOW', 'ADAPTRON'],
    ['QUEST', 'RALLY'],
  ];
  const s = 2;
  const stats = rows.map(([k, v], i) => text(k, 24, 222 + i * 26, s, '#FF5C8A') + text(v, 104, 222 + i * 26, s, '#F5F2FF')).join('');
  const css = `
.bob { animation: bob 1.2s steps(2) infinite; }
@keyframes bob { 50% { transform: translateY(-6px); } }
.blink { animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }`;
  const body = `<rect width="${W}" height="${H}" fill="#100C26"/>
<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none" stroke="#5B4FC4" stroke-width="4"/>
<rect x="14" y="14" width="${W - 28}" height="40" fill="#1C1645"/>
${text('PLAYER 1', 26, 27, 2, '#FFD447')}
${text('READY', W - 26 - textWidth('READY', 2), 27, 2, '#3DDCFF', ' class="blink"')}
<rect x="${W / 2 - 70}" y="182" width="140" height="6" fill="#2A2266"/>
<g class="bob">${sprite(IDLE, W / 2 - 48, 64, 8)}</g>
${stats}
${text('▶ MATINMOBINI.COM', 24, H - 34, 2, '#FFD447', ' class="blink"')}`;
  return svg(W, H, 'Player 1 card: Matin Mobini. Class CS with an AI & ML concentration, uOttawa, GPA 3.9/4.0, nine-time Dean\'s Honour List, main language Python, now at Adaptron, quest: Rally.', body, css);
}

// ---------------------------------------------------------------- ground divider
function ground() {
  const W = 1200, H = 28;
  let bricks = '';
  for (let x = 0; x < W; x += 48) bricks += `<rect x="${x}" y="10" width="44" height="8" fill="#2A2266"/><rect x="${x + 24}" y="20" width="44" height="8" fill="#2A2266"/>`;
  const body = `<rect y="6" width="${W}" height="${H - 6}" fill="#1C1645"/><rect y="6" width="${W}" height="3" fill="#5B4FC4"/>${bricks}${sprite(COIN, W / 2 - 12, -2, 3)}`;
  return svg(W, H, '', body, '');
}

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/hero.svg', hero());
fs.writeFileSync('assets/player-card.svg', playerCard());
fs.writeFileSync('assets/ground.svg', ground());
console.log('wrote assets/hero.svg, assets/player-card.svg, assets/ground.svg');
