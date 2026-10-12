// ---------- Nav: shadow on scroll, mobile toggle, active link ----------
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
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// ---------- "Blast" notifications (once per section, max a few per visit) ----------
const blast = document.getElementById("blast");
const blastText = document.getElementById("blast-text");
let blastTimer;
let blastsShown = 0;
let blastsMuted = false;

function showBlast(msg) {
  if (blastsMuted || blastsShown >= 4) return;
  blastsShown++;
  blastText.textContent = msg;
  blast.classList.add("show");
  clearTimeout(blastTimer);
  blastTimer = setTimeout(() => blast.classList.remove("show"), 5200);
}
document.getElementById("blast-close").addEventListener("click", () => {
  blast.classList.remove("show");
  blastsMuted = true;
});
const blastObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      showBlast(e.target.dataset.blast);
      blastObserver.unobserve(e.target);
    });
  },
  { threshold: 0.35 }
);
document.querySelectorAll("[data-blast]").forEach((s) => blastObserver.observe(s));

// ---------- Photos: show a styled placeholder until real photos are added ----------
document.querySelectorAll(".polaroid img").forEach((img) => {
  const markEmpty = () => img.closest(".polaroid").classList.add("empty");
  if (img.complete && img.naturalWidth === 0) markEmpty();
  img.addEventListener("error", markEmpty);
});

// ---------- Spotify now playing ----------
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
    sp.label.textContent = d.isPlaying ? "Now playing in her headphones" : "Last spotted listening to";
  } catch {
    sp.title.textContent = "Taking a break from the aux";
    sp.artist.textContent = "Check back soon";
    sp.label.textContent = "Off the record";
    sp.dot.classList.remove("live");
    sp.vinyl.classList.remove("spin");
    sp.eq.classList.remove("on");
  }
}
loadSpotify();
setInterval(() => document.visibilityState === "visible" && loadSpotify(), 30000);

document.getElementById("year").textContent = new Date().getFullYear();
