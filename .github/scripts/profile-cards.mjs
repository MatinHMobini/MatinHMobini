// Builds the images the profile README loads from the `output` branch:
//   dist/languages.svg          language breakdown across public repos
//   dist/github-snake.svg       snake eating contribution days (light theme)
//   dist/github-snake-dark.svg  same, dark theme
//
// The snake adds up daily contribution counts from this account and every
// account in WORK_ACCOUNTS, drops the days with no contributions and packs the
// rest into a 7-row grid, so long quiet stretches don't show up as empty space.

import fs from "node:fs";
import { generateSnakeAnimation } from "generate-snake-animation";

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_REPOSITORY_OWNER;
const WORK_ACCOUNTS = list(process.env.WORK_ACCOUNTS);
const HIDE_LANGUAGES = list(process.env.HIDE_LANGUAGES, ",").map((l) => l.toLowerCase());
const OUT_DIR = "dist";

const TOP_LANGUAGES = 8;
const MAX_COLUMNS = 53; // same width as GitHub's own contribution graph
const SNAKE_COLOR = "#fe428e";
const LIGHT_DOTS = ["transparent", "#d8ccfb", "#b9a4f8", "#9170f0", "#6d3fe0"];
const DARK_DOTS = ["transparent", "#5b3fa3", "#7c5ce0", "#a78bfa", "#d8b4fe"];

const realFetch = globalThis.fetch;

function list(value, separator = /[\s,]+/) {
  return (value ?? "").split(separator).map((s) => s.trim()).filter(Boolean);
}

async function graphql(query, variables) {
  const res = await realFetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

// ---------------------------------------------------------------- languages

async function buildLanguagesCard() {
  const { user } = await graphql(
    `query ($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
          nodes { languages(first: 20) { edges { size node { name color } } } }
        }
      }
    }`,
    { login: OWNER },
  );

  const languages = new Map();
  let repoCount = 0;
  for (const repo of user.repositories.nodes) {
    const edges = repo.languages.edges.filter(({ node }) => !HIDE_LANGUAGES.includes(node.name.toLowerCase()));
    if (edges.length) repoCount++;
    for (const { size, node } of edges) {
      const lang = languages.get(node.name) ?? { name: node.name, color: node.color ?? "#8b949e", bytes: 0, repos: 0 };
      lang.bytes += size;
      lang.repos += 1;
      languages.set(node.name, lang);
    }
  }

  // Weight by code size and by how many repos use the language, so one huge repo can't dominate.
  const ranked = [...languages.values()]
    .map((lang) => ({ ...lang, score: Math.sqrt(lang.bytes * lang.repos) }))
    .sort((a, b) => b.score - a.score);
  const items = ranked.slice(0, TOP_LANGUAGES);
  const rest = ranked.slice(TOP_LANGUAGES);
  if (rest.length) items.push({ name: "Other", color: "#6e7681", score: rest.reduce((s, l) => s + l.score, 0) });

  const total = items.reduce((s, l) => s + l.score, 0);
  for (const item of items) item.pct = (item.score / total) * 100;

  return renderLanguagesSvg(items, { repoCount, languageCount: ranked.length });
}

function escapeXml(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function renderLanguagesSvg(items, { repoCount, languageCount }) {
  const W = 800;
  const PAD = 28;
  const COL_GAP = 44;
  const BAR_Y = 92;
  const LIST_Y = 134;
  const ROW_H = 46;
  const colW = (W - PAD * 2 - COL_GAP) / 2;
  const rows = Math.ceil(items.length / 2);
  const H = LIST_Y + rows * ROW_H + 10;
  const barW = W - PAD * 2;
  const maxPct = Math.max(...items.map((i) => i.pct));

  let x = PAD;
  const segments = items
    .map((item) => {
      const w = (item.pct / 100) * barW;
      const rect = `<rect x="${x.toFixed(2)}" y="${BAR_Y}" width="${w.toFixed(2)}" height="12" fill="${item.color}"/>`;
      x += w;
      return rect;
    })
    .join("");

  const listRows = items
    .map((item, i) => {
      const cx = PAD + Math.floor(i / rows) * (colW + COL_GAP);
      const cy = LIST_Y + (i % rows) * ROW_H;
      const delay = (0.35 + i * 0.08).toFixed(2);
      const fillW = ((item.pct / maxPct) * colW).toFixed(2);
      return `
    <g class="fade" style="animation-delay:${delay}s">
      <circle cx="${cx + 6}" cy="${cy + 8}" r="6" fill="${item.color}"/>
      <text x="${cx + 20}" y="${cy + 13}" class="name">${escapeXml(item.name)}</text>
      <text x="${cx + colW}" y="${cy + 13}" class="pct" text-anchor="end">${item.pct.toFixed(1)}%</text>
      <rect x="${cx}" y="${cy + 22}" width="${colW}" height="6" rx="3" class="track"/>
      <rect x="${cx}" y="${cy + 22}" width="${fillW}" height="6" rx="3" fill="${item.color}" class="grow" style="animation-delay:${delay}s"/>
    </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">Most used languages: ${items.map((i) => `${escapeXml(i.name)} ${i.pct.toFixed(1)}%`).join(", ")}</title>
  <style>
    text { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif; }
    .title { font-size: 22px; font-weight: 600; fill: #fe428e; }
    .sub { font-size: 13px; fill: #a9fef7; opacity: .75; }
    .stats { font-size: 14px; font-weight: 600; fill: #f8d847; }
    .name { font-size: 15px; fill: #a9fef7; }
    .pct { font-size: 15px; font-weight: 600; fill: #ffffff; }
    .track { fill: #ffffff; opacity: .08; }
    .grow { transform-box: fill-box; transform-origin: left; transform: scaleX(0); animation: grow 1.1s cubic-bezier(.2,.8,.2,1) forwards; }
    .fade { opacity: 0; animation: fade .6s ease-out forwards; }
    @keyframes grow { to { transform: scaleX(1); } }
    @keyframes fade { to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .grow, .fade { animation: none; transform: none; opacity: 1; } }
  </style>
  <defs><clipPath id="bar"><rect x="${PAD}" y="${BAR_Y}" width="${barW}" height="12" rx="6"/></clipPath></defs>
  <rect width="${W}" height="${H}" rx="12" fill="#141321"/>
  <text x="${PAD}" y="44" class="title">Most Used Languages</text>
  <text x="${PAD}" y="66" class="sub">Across my public repos · weighted by code size and repo count</text>
  <text x="${W - PAD}" y="44" class="stats" text-anchor="end">${repoCount} repos · ${languageCount} languages</text>
  <g clip-path="url(#bar)"><g class="grow">${segments}</g></g>${listRows}
</svg>
`;
}

// ---------------------------------------------------------------- snake

async function contributionCounts(login) {
  const { user } = await graphql(`query ($login: String!) { user(login: $login) { createdAt } }`, { login });
  if (!user) throw new Error(`GitHub user "${login}" not found`);

  const counts = new Map();
  const now = new Date();
  // The API returns at most one year per request, so fetch one calendar year at a time.
  for (let year = new Date(user.createdAt).getUTCFullYear(); year <= now.getUTCFullYear(); year++) {
    const to = new Date(Math.min(Date.parse(`${year}-12-31T23:59:59Z`), now.getTime()));
    const data = await graphql(
      `query ($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar { weeks { contributionDays { date contributionCount } } }
          }
        }
      }`,
      { login, from: `${year}-01-01T00:00:00Z`, to: to.toISOString() },
    );
    for (const week of data.user.contributionsCollection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) counts.set(day.date, day.contributionCount);
    }
  }
  return counts;
}

// Same shape as GitHub's contribution calendar, but only days with contributions,
// packed seven to a column in date order.
function packedCalendar(totals) {
  const days = [...totals]
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-MAX_COLUMNS * 7);

  const counts = days.map(([, count]) => count).sort((a, b) => a - b);
  const quartile = (p) => counts[Math.floor(p * (counts.length - 1))];
  const [q1, q2, q3] = [quartile(0.25), quartile(0.5), quartile(0.75)];
  const level = (n) =>
    n <= q1 ? "FIRST_QUARTILE" : n <= q2 ? "SECOND_QUARTILE" : n <= q3 ? "THIRD_QUARTILE" : "FOURTH_QUARTILE";

  const weeks = [];
  days.forEach(([date, count], i) => {
    weeks[Math.floor(i / 7)] ??= { contributionDays: [] };
    weeks[Math.floor(i / 7)].contributionDays.push({
      date,
      contributionCount: count,
      contributionLevel: level(count),
      weekday: i % 7,
    });
  });
  return weeks;
}

async function buildSnakes() {
  const totals = new Map();
  for (const login of [OWNER, ...WORK_ACCOUNTS]) {
    let counts;
    try {
      counts = await contributionCounts(login);
    } catch (err) {
      if (login === OWNER) throw err;
      console.log(`::warning::Skipped work account "${login}": ${err.message}`);
      continue;
    }
    for (const [date, n] of counts) totals.set(date, (totals.get(date) ?? 0) + n);
    console.log(`${login}: ${[...counts.values()].reduce((s, n) => s + n, 0)} contributions`);
  }

  const weeks = packedCalendar(totals);
  if (!weeks.length) throw new Error("No contributions found");

  // Hand the packed calendar to the snake generator in place of a real API response.
  const fakeApi = "https://packed-calendar.invalid";
  globalThis.fetch = async (url, init) =>
    String(url).startsWith(fakeApi)
      ? Response.json({ data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } } })
      : realFetch(url, init);

  // Bigger squares when there are few columns, so a short history doesn't render tiny.
  const sizeCell = Math.max(16, Math.min(32, Math.floor(600 / (weeks.length + 2))));
  const drawOptions = {
    sizeCell,
    sizeDot: Math.round(sizeCell * 0.75),
    sizeDotBorderRadius: Math.round(sizeCell / 8),
    colorDotBorder: "transparent",
    colorEmpty: "transparent",
    colorSnake: SNAKE_COLOR,
  };
  const animationOptions = { frameByStep: 1, stepDurationMs: 100 };

  try {
    return await generateSnakeAnimation({ platform: "github", username: OWNER, githubToken: "unused", baseUrl: fakeApi }, [
      { format: "svg", drawOptions: { ...drawOptions, colorDots: LIGHT_DOTS }, animationOptions },
      { format: "svg", drawOptions: { ...drawOptions, colorDots: DARK_DOTS }, animationOptions },
    ]);
  } finally {
    globalThis.fetch = realFetch;
  }
}

// ---------------------------------------------------------------- main

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(`${OUT_DIR}/languages.svg`, await buildLanguagesCard());
const [light, dark] = await buildSnakes();
fs.writeFileSync(`${OUT_DIR}/github-snake.svg`, light);
fs.writeFileSync(`${OUT_DIR}/github-snake-dark.svg`, dark);
console.log(`Wrote languages.svg, github-snake.svg and github-snake-dark.svg to ${OUT_DIR}/`);
