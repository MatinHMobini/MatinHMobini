// Draws the SVGs used by the profile README:
//   assets/hero.svg          animated banner: name + a small neural network with signals flowing through it
//   assets/model-card.svg    "matin.summary()" card for the intro
//   assets/divider.svg       thin glowing line between sections
//   assets/stack.svg         tools grid: 5 rows x 8 tiles, same-size logos (Simple Icons, CC0)
//   assets/rally-banner.svg  Rally banner in Rally's own brand
//   assets/rally-flow.svg    animated "how Rally works" strip
// Run: node .github/scripts/build-readme-art.mjs   (needs internet once, to fetch the logos)
import fs from 'node:fs';

const PINK = '#FE428E', PURPLE = '#A78BFA', BG = '#0D1117', BG2 = '#161B2E', TEXT = '#E6EDF3', MUTED = '#8B949E';
const SANS = "font-family: -apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;";
const MONO = "font-family: 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;";
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const svg = (w, h, title, css, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${css}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }</style>
${body}
</svg>
`;

// ---------------------------------------------------------------- hero
function hero() {
  const W = 1200, H = 340;
  // Layers of the network: x position and node count.
  const layers = [[690, 4], [810, 6], [930, 6], [1050, 3]];
  const nodes = layers.map(([x, n]) => Array.from({ length: n }, (_, i) => [x, 170 + (i - (n - 1) / 2) * 46]));
  let edges = '', pulses = '';
  let k = 0;
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const [x1, y1] of nodes[l]) {
      for (const [x2, y2] of nodes[l + 1]) {
        edges += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PURPLE}" stroke-opacity=".16" stroke-width="1.2"/>`;
        // Light up a fixed subset of edges, layer by layer, like a forward pass.
        if ((k * 7) % 5 === 0) {
          pulses += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" pathLength="100" class="pulse" style="animation-delay:${l * 0.7 + (k % 3) * 0.08}s"/>`;
        }
        k++;
      }
    }
  }
  const outLabels = ['AI / ML', 'GEN AI', 'DATA SCIENCE'];
  const circles = nodes.map((layer, l) => layer.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${l === nodes.length - 1 ? 9 : 7}" class="node${l === nodes.length - 1 ? ' out' : ''}" style="animation-delay:${l * 0.7 + 0.5}s"/>${
    l === nodes.length - 1 ? `<text x="${x + 20}" y="${y + 5}" class="lbl">${outLabels[i]}</text>` : ''}`).join('')).join('');
  let dots = '';
  for (let x = 20; x < W; x += 40) for (let y = 20; y < H; y += 40) dots += `<circle cx="${x}" cy="${y}" r="1" fill="#30363D"/>`;
  const css = `
.name { ${SANS} font-size: 66px; font-weight: 700; letter-spacing: -1.5px; }
.sub { ${SANS} font-size: 24px; fill: ${TEXT}; }
.code { ${MONO} font-size: 17px; fill: ${MUTED}; }
.url { ${MONO} font-size: 16px; fill: ${TEXT}; }
.lbl { ${MONO} font-size: 13px; fill: ${MUTED}; letter-spacing: 1px; }
.node { fill: ${BG}; stroke: ${PURPLE}; stroke-width: 2; animation: glow 2.1s ease-in-out infinite; }
.out { stroke: ${PINK}; }
@keyframes glow { 0%, 100% { fill: ${BG}; } 15% { fill: ${PURPLE}; } 40% { fill: ${BG}; } }
.pulse { stroke: ${PINK}; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 10 100; stroke-dashoffset: 110; animation: pass 2.1s linear infinite; }
@keyframes pass { 0% { stroke-dashoffset: 110; opacity: 1; } 33% { stroke-dashoffset: 0; opacity: 1; } 34%, 100% { stroke-dashoffset: 0; opacity: 0; } }
.cursor { animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }`;
  const body = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BG}"/><stop offset="1" stop-color="${BG2}"/></linearGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${PINK}"/><stop offset="1" stop-color="${PURPLE}"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" rx="18" fill="url(#bg)"/>
${dots}
<text x="64" y="132" class="name" fill="url(#ink)">Matin Mobini</text>
<text x="66" y="180" class="sub">AI/ML · Generative AI · Data Science</text>
<text x="66" y="226" class="code">&gt; CS @ uOttawa · AI &amp; ML concentration<tspan class="cursor"> _</tspan></text>
<rect x="64" y="256" width="196" height="38" rx="19" fill="none" stroke="#30363D"/>
<circle cx="86" cy="275" r="5" fill="${PINK}"/><text x="100" y="281" class="url">matinmobini.com</text>
${edges}
${pulses}
${circles}`;
  return svg(W, H, 'Matin Mobini: AI/ML, generative AI and data science. A small neural network with signals flowing through it.', css, body);
}

// ---------------------------------------------------------------- model card
function modelCard() {
  const W = 320, H = 324;
  const rows = [
    ['school', 'uOttawa CS'],
    ['focus', 'AI & ML'],
    ['gpa', '3.9 / 4.0'],
    ['awards', "9x Dean's List"],
    ['current', 'Adaptron'],
    ['building', 'Rally'],
    ['main_language', 'Python'],
  ];
  const line = '─'.repeat(31);
  const css = `
text { ${MONO} font-size: 15px; fill: ${TEXT}; }
.p { fill: ${PINK}; } .m { fill: ${MUTED}; } .v { fill: ${PURPLE}; }
.cursor { animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }`;
  const body = `<rect width="${W}" height="${H}" rx="14" fill="${BG}" stroke="#30363D"/>
<rect x="1" y="1" width="${W - 2}" height="38" rx="13" fill="#161B22"/>
<text x="18" y="25"><tspan class="m">In [1]:</tspan> matin.summary()</text>
<text x="18" y="70">Model: <tspan class="v">"matin_mobini"</tspan></text>
<text x="18" y="94" class="m">${line}</text>
<text x="18" y="116" class="m">Layer<tspan x="162">Output</tspan></text>
<text x="18" y="134" class="m">${line}</text>
${rows.map(([k, v], i) => `<text x="18" y="${160 + i * 24}"><tspan class="p">${esc(k)}</tspan><tspan x="162">${esc(v)}</tspan></text>`).join('\n')}
<text x="18" y="${154 + rows.length * 24}" class="m">${line}</text>
`;
  return svg(W, H, "matin.summary(): uOttawa CS with an AI & ML concentration, GPA 3.9/4.0, nine-time Dean's Honour List, now doing AI research at Adaptron, building Rally, main language Python.", css, body);
}

// ---------------------------------------------------------------- divider
function divider() {
  const W = 1200, H = 24;
  const body = `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${PURPLE}" stop-opacity="0"/><stop offset=".5" stop-color="${PINK}"/><stop offset="1" stop-color="${PURPLE}" stop-opacity="0"/></linearGradient></defs>
<rect x="0" y="11" width="${W}" height="2" fill="url(#g)"/>
<circle cx="${W / 2 - 22}" cy="12" r="3" fill="${PURPLE}"/><circle cx="${W / 2}" cy="12" r="5" fill="${BG}" stroke="${PINK}" stroke-width="2"/><circle cx="${W / 2 + 22}" cy="12" r="3" fill="${PURPLE}"/>`;
  return svg(W, H, '', '', body);
}

// ---------------------------------------------------------------- tools grid
const STACK = [
  ['Languages', [['dev:python/python-original', 'Python'], ['dev:cplusplus/cplusplus-original', 'C++'], ['dev:java/java-original', 'Java'], ['kotlin', 'Kotlin'], ['go', 'Go'], ['typescript', 'TypeScript'], ['javascript', 'JavaScript'], [null, 'SQL']]],
  ['ML & Deep Learning', [['pytorch', 'PyTorch'], ['tensorflow', 'TensorFlow'], ['keras', 'Keras'], ['scikitlearn', 'scikit-learn'], ['opencv', 'OpenCV'], ['ultralytics', 'YOLO'], ['numpy', 'NumPy'], ['pandas', 'pandas']]],
  ['Generative AI', [['claude', 'Claude'], ['openai', 'OpenAI API'], ['huggingface', 'Hugging Face'], ['langchain', 'LangChain'], ['langgraph', 'LangGraph'], ['modelcontextprotocol', 'MCP'], ['qdrant', 'Qdrant'], [null, 'vLLM']]],
  ['Backend & Data', [['fastapi', 'FastAPI'], ['flask', 'Flask'], ['react', 'React'], ['nodedotjs', 'Node.js'], ['postgresql', 'PostgreSQL'], ['supabase', 'Supabase'], ['firebase', 'Firebase'], ['streamlit', 'Streamlit']]],
  ['MLOps & Tools', [['docker', 'Docker'], ['amazonwebservices', 'AWS'], ['githubactions', 'GitHub Actions'], ['linux', 'Linux'], ['git', 'Git'], ['mlflow', 'MLflow'], ['weightsandbiases', 'W&B'], ['jupyter', 'Jupyter']]],
];
const lum = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
async function stack() {
  const data = await (await fetch('https://cdn.jsdelivr.net/npm/simple-icons@latest/data/simple-icons.json')).json();
  const list = Array.isArray(data) ? data : data.icons;
  const slugOf = (t) => t.toLowerCase().replace(/\+/g, 'plus').replace(/\./g, 'dot').replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
  const hexBySlug = Object.fromEntries(list.map((i) => [i.slug ?? slugOf(i.title), i.hex]));
  const LABEL_W = 190, TILE = 64, GAP = 22, ROW_H = 104, TOP = 10;
  const W = LABEL_W + 8 * (TILE + GAP), H = TOP + STACK.length * ROW_H;
  let body = '', n = 0;
  for (const [r, [name, items]] of STACK.entries()) {
    const y = TOP + r * ROW_H;
    body += `<text x="${LABEL_W - 24}" y="${y + TILE / 2 + 5}" class="cat" text-anchor="end">${esc(name)}</text>`;
    for (const [c, [slug, label]] of items.entries()) {
      const x = LABEL_W + c * (TILE + GAP);
      let inner;
      if (slug?.startsWith('dev:')) {
        // Full-colour Devicon logo (MIT), nested as its own little SVG.
        const src = await (await fetch(`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug.slice(4)}.svg`)).text();
        inner = src.replace(/<svg[^>]*viewBox="([^"]+)"[^>]*>/, `<svg x="${x + 14}" y="${y + 14}" width="36" height="36" viewBox="$1">`);
      } else if (slug) {
        const src = await (await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`)).text();
        const d = src.match(/ d="([^"]+)"/)[1];
        const hex = hexBySlug[slug] ?? 'E6EDF3';
        const fill = lum(hex) < 0.28 ? TEXT : `#${hex}`; // dark logos would vanish on the dark tile
        inner = `<path transform="translate(${x + 16} ${y + 16}) scale(${32 / 24})" fill="${fill}" d="${d}"/>`;
      } else {
        inner = `<text x="${x + TILE / 2}" y="${y + TILE / 2 + 6}" class="mono" text-anchor="middle">${esc(label)}</text>`;
      }
      body += `<g class="t" style="animation-delay:${(n++ * 0.03).toFixed(2)}s"><rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="14" fill="#161B22" stroke="#30363D"/>${inner}<text x="${x + TILE / 2}" y="${y + TILE + 18}" class="lbl" text-anchor="middle">${esc(label)}</text></g>`;
    }
  }
  const css = `
.cat { ${SANS} font-size: 15px; font-weight: 600; fill: ${MUTED}; }
.lbl { ${SANS} font-size: 12px; fill: ${MUTED}; }
.mono { ${MONO} font-size: 16px; font-weight: 700; fill: ${TEXT}; }
.t { animation: in .5s ease-out both; }
@keyframes in { from { opacity: 0; } }`;
  const all = STACK.flatMap(([cat, items]) => `${cat}: ${items.map((i) => i[1]).join(', ')}`).join('. ');
  return svg(W, H, `Languages and tools. ${all}.`, css, body);
}

// ---------------------------------------------------------------- Rally (Rally's own brand)
const RED = '#F2452E', CREAM = '#F6F1EA', INK = '#0E1014', CARD = '#16181D', RMUTED = '#9AA0A6';
function rallyBanner() {
  const W = 1200, H = 380;
  const MX = 760, MY = 40, MW = 400, MH = 300;
  let streets = '';
  for (let x = MX + 30; x < MX + MW; x += 52) streets += `<rect x="${x}" y="${MY}" width="6" height="${MH}" fill="#23262D"/>`;
  for (let y = MY + 24; y < MY + MH; y += 46) streets += `<rect x="${MX}" y="${y}" width="${MW}" height="6" fill="#23262D"/>`;
  // Event pins show what kind of event it is: sports, study, music, movie, gaming.
  const C = CREAM;
  const ICON = {
    ball: (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${C}" stroke-width="2"/><path d="M${x - 8} ${y} H ${x + 8} M ${x} ${y - 8} V ${y + 8} M ${x - 5.5} ${y - 6} Q ${x - 1} ${y} ${x - 5.5} ${y + 6} M ${x + 5.5} ${y - 6} Q ${x + 1} ${y} ${x + 5.5} ${y + 6}" fill="none" stroke="${C}" stroke-width="1.6"/>`,
    book: (x, y) => `<path d="M${x} ${y - 5} Q ${x - 4} ${y - 8} ${x - 9} ${y - 7} V ${y + 6} Q ${x - 4} ${y + 5} ${x} ${y + 8} Z M ${x} ${y - 5} Q ${x + 4} ${y - 8} ${x + 9} ${y - 7} V ${y + 6} Q ${x + 4} ${y + 5} ${x} ${y + 8} Z" fill="${C}"/><path d="M${x} ${y - 5} V ${y + 8}" stroke="${CARD}" stroke-width="1.2"/>`,
    music: (x, y) => `<circle cx="${x - 4}" cy="${y + 5}" r="3.6" fill="${C}"/><path d="M${x - 0.6} ${y + 5} V ${y - 8} L ${x + 7} ${y - 5} V ${y - 1} L ${x - 0.6} ${y - 4}" fill="none" stroke="${C}" stroke-width="2.2" stroke-linejoin="round"/>`,
    film: (x, y) => `<rect x="${x - 9}" y="${y - 2}" width="18" height="11" rx="2" fill="${C}"/><path d="M${x - 9} ${y - 4} L ${x + 8} ${y - 9} L ${x + 9} ${y - 5} L ${x - 8} ${y} Z" fill="${C}"/><path d="M${x - 4} ${y - 5.5} L ${x - 2} ${y - 1.5} M ${x + 2} ${y - 7.3} L ${x + 4} ${y - 3.3}" stroke="${CARD}" stroke-width="1.6"/>`,
    game: (x, y) => `<rect x="${x - 10}" y="${y - 6}" width="20" height="12" rx="6" fill="${C}"/><path d="M${x - 6} ${y} H ${x - 2} M ${x - 4} ${y - 2} V ${y + 2}" stroke="${CARD}" stroke-width="1.6"/><circle cx="${x + 4}" cy="${y - 1}" r="1.4" fill="${CARD}"/><circle cx="${x + 6.5}" cy="${y + 1.5}" r="1.4" fill="${CARD}"/>`,
  };
  const pins = [[MX + 110, MY + 70, 'ball'], [MX + 300, MY + 60, 'music'], [MX + 270, MY + 175, 'book'], [MX + 80, MY + 215, 'game'], [MX + 350, MY + 245, 'film']]
    .map(([x, y, kind], i) => `
  <circle cx="${x}" cy="${y}" r="28" fill="none" stroke="${RED}" stroke-width="3" class="ring" style="animation-delay:${i * 0.45}s"/>
  <circle cx="${x}" cy="${y}" r="23" fill="${CARD}" stroke="${RED}" stroke-width="3"/>
  <g transform="translate(${x} ${y}) scale(1.3) translate(${-x} ${-y})">${ICON[kind](x, y)}</g>`).join('');
  const css = `
text { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
.title { font-size: 46px; font-weight: 800; fill: ${CREAM}; letter-spacing: -1px; }
.word { font-size: 34px; font-weight: 700; fill: ${CREAM}; }
.sub { font-size: 19px; fill: ${RMUTED}; }
.n { font-size: 15px; font-weight: 700; fill: ${CREAM}; }
.url { font-size: 18px; font-weight: 600; fill: ${CREAM}; }
.ring { transform-box: fill-box; transform-origin: center; animation: ring 2.4s ease-out infinite; }
@keyframes ring { from { transform: scale(.7); opacity: .9; } to { transform: scale(1.9); opacity: 0; } }
.route { stroke-dasharray: 8 10; animation: dash 1.2s linear infinite; }
@keyframes dash { to { stroke-dashoffset: -18; } }
.me { animation: me 1.6s ease-in-out infinite; }
@keyframes me { 50% { opacity: .55; } }`;
  const body = `<rect width="${W}" height="${H}" rx="20" fill="${INK}"/>
<g transform="translate(56 52)"><path d="M10 4 V58" stroke="${RED}" stroke-width="7" stroke-linecap="round"/><path d="M15 6 H48 L38 19 L48 32 H15 Z" fill="${RED}"/><path d="M0 64 Q30 48 60 64 Z" fill="${CREAM}"/></g>
<text x="128" y="100" class="word">Rally</text>
<text x="56" y="180" class="title">Show up for something.</text>
<text x="56" y="234" class="title">Leave with a crew.</text>
<text x="56" y="280" class="sub">Pickup games, study sessions and jam nights near you, on one map.</text>
<rect x="56" y="314" width="176" height="40" rx="20" fill="#1F2228" stroke="#2C3038"/>
<circle cx="80" cy="334" r="7" fill="${RED}"/><text x="96" y="340" class="url">rallynow.ca</text>
<clipPath id="map"><rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18"/></clipPath>
<g clip-path="url(#map)">
  <rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" fill="#1B1E24"/>
  ${streets}
  <path d="M${MX} ${MY + MH - 40} C ${MX + 140} ${MY + MH - 80}, ${MX + 300} ${MY + MH - 10}, ${MX + MW} ${MY + MH - 60} L ${MX + MW} ${MY + MH} L ${MX} ${MY + MH} Z" fill="#14324A"/>
  <path d="M${MX + 185} ${MY + 150} C ${MX + 170} ${MY + 120}, ${MX + 140} ${MY + 90}, ${MX + 110} ${MY + 70}" fill="none" stroke="#4ADE80" stroke-width="4" class="route"/>
  <circle cx="${MX + 185}" cy="${MY + 150}" r="9" fill="${CREAM}" class="me"/>
  ${pins}
</g>
<rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18" fill="none" stroke="#2C3038" stroke-width="2"/>`;
  return svg(W, H, 'Rally: show up for something, leave with a crew. Pickup games, study sessions and jam nights near you, on one map. rallynow.ca', css, body);
}

// Five steps with a dot travelling along the line; each step lights up as the dot reaches it.
function rallyFlow() {
  const W = 1200, H = 210, Y = 92, LOOP = 6;
  const steps = [
    ['Open the map', 'See what is on near you'],
    ['Pick something', 'Games, study, music'],
    ['Join in', 'One tap and you are in'],
    ['Show up', 'Meet people in person'],
    ['Keep the crew', 'Plan the next one'],
  ];
  const xs = steps.map((_, i) => 140 + i * 230);
  const icons = [
    // map pin, magnifier, plus, flag, people
    (x) => `<path d="M${x} ${Y + 12} C ${x - 14} ${Y - 4}, ${x - 12} ${Y - 16}, ${x} ${Y - 16} C ${x + 12} ${Y - 16}, ${x + 14} ${Y - 4}, ${x} ${Y + 12} Z" fill="${CREAM}"/><circle cx="${x}" cy="${Y - 5}" r="4" fill="${INK}"/>`,
    (x) => `<circle cx="${x - 3}" cy="${Y - 3}" r="9" fill="none" stroke="${CREAM}" stroke-width="3"/><path d="M${x + 4} ${Y + 4} L ${x + 11} ${Y + 11}" stroke="${CREAM}" stroke-width="3.5" stroke-linecap="round"/>`,
    (x) => `<path d="M${x} ${Y - 11} V ${Y + 11} M ${x - 11} ${Y} H ${x + 11}" stroke="${CREAM}" stroke-width="4" stroke-linecap="round"/>`,
    (x) => `<path d="M${x - 7} ${Y - 13} V ${Y + 13}" stroke="${CREAM}" stroke-width="3.5" stroke-linecap="round"/><path d="M${x - 4} ${Y - 12} H ${x + 11} L ${x + 6} ${Y - 5} L ${x + 11} ${Y + 2} H ${x - 4} Z" fill="${CREAM}"/>`,
    (x) => `<circle cx="${x - 6}" cy="${Y - 6}" r="5" fill="${CREAM}"/><circle cx="${x + 7}" cy="${Y - 6}" r="5" fill="${CREAM}"/><path d="M${x - 15} ${Y + 11} Q ${x - 6} ${Y - 2} ${x + 3} ${Y + 11} Z M ${x - 2} ${Y + 11} Q ${x + 7} ${Y - 2} ${x + 16} ${Y + 11} Z" fill="${CREAM}"/>`,
  ];
  const nodes = steps.map(([t, s], i) => {
    const x = xs[i];
    const at = (i / (steps.length - 1)) * 80; // % of the loop when the dot arrives
    return `<g>
  <circle cx="${x}" cy="${Y}" r="34" fill="${CARD}" stroke="#2C3038" stroke-width="2"/>
  <circle cx="${x}" cy="${Y}" r="34" fill="none" stroke="${RED}" stroke-width="3" class="hit" style="animation-delay:${((at / 100) * LOOP).toFixed(2)}s"/>
  ${icons[i](x)}
  <text x="${x}" y="${Y + 66}" text-anchor="middle" class="t">${esc(t)}</text>
  <text x="${x}" y="${Y + 88}" text-anchor="middle" class="s">${esc(s)}</text>
</g>`;
  }).join('\n');
  const span = xs[xs.length - 1] - xs[0];
  const css = `
text { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
.t { font-size: 18px; font-weight: 700; fill: ${CREAM}; }
.s { font-size: 14px; fill: ${RMUTED}; }
.hit { opacity: 0; animation: hit ${LOOP}s linear infinite; }
@keyframes hit { 0% { opacity: 1; } 12% { opacity: 0; } 100% { opacity: 0; } }
.dot { animation: go ${LOOP}s ease-in-out infinite; }
@keyframes go { 0% { transform: translateX(0); } 80% { transform: translateX(${span}px); } 90% { transform: translateX(${span}px); opacity: 1; } 95%, 100% { transform: translateX(${span}px); opacity: 0; } }`;
  const body = `<rect width="${W}" height="${H}" rx="20" fill="${INK}"/>
<line x1="${xs[0]}" y1="${Y}" x2="${xs[xs.length - 1]}" y2="${Y}" stroke="#2C3038" stroke-width="3" stroke-dasharray="6 8"/>
${nodes}
<circle cx="${xs[0]}" cy="${Y - 46}" r="7" fill="${RED}" class="dot"/>`;
  return svg(W, H, 'How Rally works: open the map, pick something, join in, show up, keep the crew.', css, body);
}

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/hero.svg', hero());
fs.writeFileSync('assets/model-card.svg', modelCard());
fs.writeFileSync('assets/divider.svg', divider());
fs.writeFileSync('assets/stack.svg', await stack());
fs.writeFileSync('assets/rally-banner.svg', rallyBanner());
fs.writeFileSync('assets/rally-flow.svg', rallyFlow());
console.log('wrote hero, model-card, divider, stack, rally-banner, rally-flow');
