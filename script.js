// ---------- Nav: line on scroll, mobile toggle, active link ----------
const nav = document.getElementById("nav");
const toggle = nav.querySelector(".nav-toggle");
const links = [...nav.querySelectorAll(".nav-links a")];

addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 10), { passive: true });
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => activeObserver.observe(s));

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  // anything already on screen fades in straight away
  if (el.getBoundingClientRect().top < innerHeight) requestAnimationFrame(() => el.classList.add("in"));
  else revealObserver.observe(el);
});

// ---------- Count-up numbers ----------
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// ---------- Background spiral (an Archimedean curl) ----------
(() => {
  const path = document.querySelector(".spiral path");
  if (!path) return;
  let d = "";
  for (let t = 0; t <= Math.PI * 9; t += 0.08) {
    const r = 4 + t * 6.6;
    const x = 200 + r * Math.cos(t);
    const y = 200 + r * Math.sin(t) * 0.92;
    d += (d ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  path.setAttribute("d", d);

  // Turn with the scroll: down spins one way, up spins it back. Eased so it glides.
  const spiral = path.closest("svg");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let current = 0;
  const tick = () => {
    const target = scrollY * 0.06;
    current += (target - current) * 0.08;
    spiral.style.transform = `rotate(${current.toFixed(2)}deg)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// ---------- Moon phase (computed locally, no API) ----------
const SYNODIC = 29.530588853;
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14); // reference new moon
const DAY = 86400000;

function moonAge(date) {
  const days = (date - KNOWN_NEW) / DAY;
  return ((days % SYNODIC) + SYNODIC) % SYNODIC;
}
// Named phases get about a day either side; everything between is crescent/gibbous.
function phaseName(age) {
  const q = SYNODIC / 4;
  if (age < 1 || age > SYNODIC - 1) return "New Moon";
  if (Math.abs(age - q) < 1) return "First Quarter";
  if (Math.abs(age - 2 * q) < 1) return "Full Moon";
  if (Math.abs(age - 3 * q) < 1) return "Last Quarter";
  if (age < q) return "Waxing Crescent";
  if (age < 2 * q) return "Waxing Gibbous";
  if (age < 3 * q) return "Waning Gibbous";
  return "Waning Crescent";
}
// SVG path of the lit part of a moon of radius r at (c, c)
function litPath(age, c, r) {
  const a = (age / SYNODIC) * 2 * Math.PI;
  const rx = Math.abs(Math.cos(a)) * r;
  const waxing = age < SYNODIC / 2;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (Math.cos(a) > 0 ? 0 : 1) : (Math.cos(a) > 0 ? 1 : 0);
  return `M${c} ${c - r} A${r} ${r} 0 0 ${outer} ${c} ${c + r} A${rx} ${r} 0 0 ${inner} ${c} ${c - r}Z`;
}
function moonSVG(age, size, id) {
  const c = size / 2, r = size / 2 - 2;
  return `
    <defs>
      <radialGradient id="lit-${id}" cx="40%" cy="38%" r="70%">
        <stop offset="0" stop-color="#ece6d6"/><stop offset=".7" stop-color="#cfc7b4"/><stop offset="1" stop-color="#a69e8b"/>
      </radialGradient>
      <clipPath id="clip-${id}"><path d="${litPath(age, c, r)}"/></clipPath>
    </defs>
    <circle cx="${c}" cy="${c}" r="${r}" fill="#1a1b20" stroke="rgba(217,210,195,.18)" stroke-width="1"/>
    <g clip-path="url(#clip-${id})">
      <circle cx="${c}" cy="${c}" r="${r}" fill="url(#lit-${id})"/>
      <g fill="rgba(90,84,72,.35)">
        <circle cx="${c * 0.72}" cy="${c * 0.7}" r="${r * 0.16}"/>
        <circle cx="${c * 1.28}" cy="${c * 0.9}" r="${r * 0.1}"/>
        <circle cx="${c * 1.05}" cy="${c * 1.32}" r="${r * 0.2}"/>
        <circle cx="${c * 0.62}" cy="${c * 1.22}" r="${r * 0.08}"/>
        <circle cx="${c * 1.38}" cy="${c * 1.3}" r="${r * 0.07}"/>
      </g>
      <circle cx="${c}" cy="${c}" r="${r}" fill="#000" filter="url(#grit)" opacity=".5"/>
    </g>`;
}

(() => {
  const now = new Date();
  const age = moonAge(now);
  const lit = Math.round(((1 - Math.cos((age / SYNODIC) * 2 * Math.PI)) / 2) * 100);
  const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const untilFull = (SYNODIC / 2 - age + SYNODIC) % SYNODIC;
  const name = phaseName(age);

  document.getElementById("moon-svg").innerHTML = moonSVG(age, 200, "big");
  document.getElementById("moon-name").textContent = name;
  document.getElementById("moon-meta").textContent = `${lit}% lit · day ${Math.floor(age) + 1} of 29`;
  document.getElementById("moon-full").textContent = name === "Full Moon"
    ? "Full tonight"
    : `Next full moon: ${fmt(new Date(+now + untilFull * DAY))}`;

  const week = document.getElementById("moon-week");
  for (let i = 0; i < 7; i++) {
    const d = new Date(+now + i * DAY);
    const li = document.createElement("li");
    if (i === 0) li.className = "today";
    li.style.transitionDelay = `${400 + i * 110}ms`;
    li.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${moonSVG(moonAge(d), 24, "d" + i)}</svg>
      <span>${i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" })}</span>`;
    li.title = phaseName(moonAge(d));
    week.append(li);
  }
})();

// ---------- Spotify: now playing ----------
const sp = {
  dot: document.getElementById("spotify-dot"),
  label: document.getElementById("spotify-label"),
  link: document.getElementById("spotify-link"),
  vinyl: document.getElementById("spotify-vinyl"),
  art: document.getElementById("spotify-art"),
  title: document.getElementById("spotify-title"),
  artist: document.getElementById("spotify-artist"),
  eq: document.getElementById("spotify-eq"),
};

async function loadSpotify() {
  try {
    const res = await fetch("/api/now-playing", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    if (!d.title) throw new Error("empty");

    sp.title.textContent = d.title;
    sp.artist.textContent = d.artist;
    sp.link.href = d.songUrl || "https://open.spotify.com";
    if (d.albumImageUrl) sp.art.src = d.albumImageUrl;
    sp.dot.classList.toggle("live", d.isPlaying);
    sp.vinyl.classList.toggle("spin", d.isPlaying);
    sp.eq.classList.toggle("on", d.isPlaying);
    sp.label.textContent = d.isPlaying ? "Now playing" : "Last played";
  } catch {
    sp.title.textContent = "Nothing playing right now";
    sp.artist.textContent = "Check back soon";
    sp.label.textContent = "Spotify";
    sp.dot.classList.remove("live");
    sp.vinyl.classList.remove("spin");
    sp.eq.classList.remove("on");
  }
}
loadSpotify();
setInterval(() => document.visibilityState === "visible" && loadSpotify(), 30000);

// ---------- Spotify: top tracks this month ----------
async function loadTopTracks() {
  try {
    const res = await fetch("/api/top-tracks");
    if (!res.ok) return;
    const { tracks } = await res.json();
    if (!tracks?.length) return;
    const list = document.getElementById("top-list");
    tracks.forEach((t) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = t.songUrl || "https://open.spotify.com";
      a.target = "_blank";
      a.rel = "noopener";
      if (t.albumImageUrl) {
        const img = document.createElement("img");
        img.src = t.albumImageUrl;
        img.alt = "";
        a.append(img);
      }
      const text = document.createElement("span");
      text.className = "tt-text";
      const title = document.createElement("span");
      title.className = "tt-title";
      title.textContent = t.title;
      const artist = document.createElement("span");
      artist.className = "tt-artist";
      artist.textContent = ` · ${t.artist}`;
      text.append(title, artist);
      a.append(text);
      li.append(a);
      list.append(li);
    });
    document.getElementById("top-tracks").hidden = false;
  } catch {}
}
loadTopTracks();

document.getElementById("year").textContent = new Date().getFullYear();
