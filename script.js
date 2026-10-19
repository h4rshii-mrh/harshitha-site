// ---------- Nav: border on scroll, mobile toggle, active link ----------
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
  revealObserver.observe(el);
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

// ---------- Photos: placeholder until real photos are added ----------
document.querySelectorAll(".frame img").forEach((img) => {
  const markEmpty = () => img.closest(".frame").classList.add("empty");
  if (img.complete && img.naturalWidth === 0) markEmpty();
  img.addEventListener("error", markEmpty);
});

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
