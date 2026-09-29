// Two animations: the chronicle-to-biography regrouping in the introduction, and the staged
// method pipeline. Both respect prefers-reduced-motion by jumping to their final state.
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Chronicle -> biographies: thumbnails fly from the timeline into each biography row.
  const regroup = document.getElementById("regroup");
  if (regroup) {
    const chron = [...regroup.querySelectorAll(".chron figure")];
    const bios = [...regroup.querySelectorAll(".bio figure[data-moment]")];
    const lines = [...regroup.querySelectorAll(".bio-line")];
    let playing = false;

    function play() {
      if (playing) return;
      playing = true;
      regroup.classList.add("animating");
      lines.forEach((l) => { l.style.transition = "none"; l.style.transform = "scaleX(0)"; });
      bios.forEach((fig, i) => {
        const src = chron[Number(fig.dataset.moment) - 1].getBoundingClientRect();
        const dst = fig.getBoundingClientRect();
        fig.style.transition = "none";
        fig.style.opacity = "0";
        fig.style.transform = `translate(${src.left - dst.left}px, ${src.top - dst.top}px)`;
      });
      // force layout so the transition below starts from the chronicle position
      void regroup.offsetWidth;
      bios.forEach((fig, i) => {
        fig.style.transition = `transform 900ms cubic-bezier(.2,.7,.2,1) ${i * 130}ms, opacity 400ms ease ${i * 130}ms`;
        fig.style.opacity = "1";
        fig.style.transform = "none";
      });
      const settle = 900 + bios.length * 130;
      setTimeout(() => {
        lines.forEach((l) => { l.style.transition = "transform 700ms ease"; l.style.transform = "scaleX(1)"; });
        setTimeout(() => { regroup.classList.remove("animating"); playing = false; }, 800);
      }, settle);
    }

    if (reduced) {
      // static: nothing to do, the rows are already in their final layout
    } else {
      bios.forEach((f) => { f.style.opacity = "0"; });
      lines.forEach((l) => { l.style.transform = "scaleX(0)"; });
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { play(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(regroup);
      document.getElementById("regroup-replay").addEventListener("click", play);
    }
  }

  // ---------- 2. Method pipeline: six stages, auto-advancing, with links drawn between observations.
  const pipe = document.getElementById("pipeline");
  if (!pipe) return;
  const body = document.getElementById("pipe-body");
  const svg = document.getElementById("pipe-links");
  const caption = document.getElementById("pipe-caption");
  const stagesEl = [...document.querySelectorAll("#pipe-stages li")];
  const playBtn = document.getElementById("pipe-play");
  const typed = document.getElementById("typed-day1");
  const entity = document.getElementById("entity");
  const obs = [...pipe.querySelectorAll(".obs")];
  const onEls = [...pipe.querySelectorAll("[data-on]")];
  const dimEls = [...pipe.querySelectorAll("[data-dim]")];
  const hlEls = [...pipe.querySelectorAll("[data-hl]")];

  const captions = [
    "Ground. Each tracked subject in a clip becomes an observation, described from its own crops, the scene frames and the dialogue of that moment.",
    "Observe. The mixer is seen again on Days 3 to 6. Every encounter is a separate observation with its own description and source frames.",
    "Associate. Observations are linked into one persistent instance. A new one joins only if it matches the entity's recent references and is never seen apart from them in a shared frame.",
    "Retrieve. The controller's search matches one moment. Relevance flows along the identity links to the other observations of the same instance.",
    "Read. The biography excerpt lists the retrieved encounters in time order and the appearances not yet inspected, next to the linked episode context.",
    "Answer. The answer model reads the biography together with the episode and names Shure.",
  ];
  const durations = [3000, 3400, 5400, 3000, 3200, 3000];
  const LAST = captions.length - 1;
  let stage = 0;
  let playing = !reduced;
  let timer = null;
  let typeTimer = null;

  function typeText(full) {
    clearInterval(typeTimer);
    typed.textContent = "";
    if (reduced) { typed.textContent = full; return; }
    let i = 0;
    typeTimer = setInterval(() => { typed.textContent = full.slice(0, ++i); if (i >= full.length) clearInterval(typeTimer); }, 22);
  }

  // Connectors continue the dotted lines baked into the frame crops: entity chip -> the exit point at the top of
  // each Day 3-6 frame, and entity chip -> the right edge of the Day 1 card at the height where its line exits.
  const frameDay1 = document.getElementById("frame-day1");
  const cardDay1 = pipe.querySelector(".obs-card");
  function drawLinks() {
    const b = body.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
    svg.setAttribute("width", b.width); svg.setAttribute("height", b.height);
    const rel = (r) => ({ x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height });
    const e = rel(entity.getBoundingClientRect());
    const paths = [];
    // Links are drawn from the observations towards the entity: one vertical per frame rises to a horizontal
    // bus, a stem climbs from the bus to the chip, and the Day 1 card joins the chip from the left.
    const xs = obs.map((o) => {
      const f = rel(o.querySelector(".frame").getBoundingClientRect());
      return { x: f.x + f.w * Number(o.dataset.lx || 0.5), top: f.y + 2 };
    });
    const busY = e.y + e.h + 18;
    const cx = e.x + e.w / 2;
    xs.forEach((p) => paths.push({ d: `M ${p.x} ${p.top} V ${busY}` }));
    paths.push({ d: `M ${Math.min(...xs.map((p) => p.x))} ${busY} H ${Math.max(...xs.map((p) => p.x))}` });
    paths.push({ d: `M ${cx} ${busY} V ${e.y + e.h}` });
    const f1 = rel(frameDay1.getBoundingClientRect());
    const card = rel(cardDay1.getBoundingClientRect());
    const ey = e.y + e.h / 2, exitY = f1.y + f1.h * Number(frameDay1.dataset.exit || 0.5);
    const cardRight = card.x + card.w;
    // In the stacked (narrow) layout the Day 1 card sits above the chip and a link would cross the text, so skip it.
    if (cardRight < e.x) {
      const ex = cardRight + 26, r = 12;
      paths.push({ d: `M ${cardRight} ${exitY} H ${ex - r} Q ${ex} ${exitY} ${ex} ${exitY - r} V ${ey + r} Q ${ex} ${ey} ${ex + r} ${ey} H ${e.x}` });
    }
    svg.replaceChildren();
    paths.forEach((p, i) => {
      const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
      base.setAttribute("d", p.d); base.setAttribute("class", "link"); base.setAttribute("pathLength", "1");
      base.dataset.order = String(i);
      const pulse = base.cloneNode(); pulse.setAttribute("class", "link pulse");
      pulse.style.animationDelay = `${i * 180}ms`;
      svg.append(base, pulse);
    });
    timeLinks();
  }
  // Associate timing: verticals (Day 3-6) every LINK_STEP ms, then the bus, the stem and the Day 1 elbow;
  // the entity chip lights up once everything has converged (see .assoc-live rules in style.css).
  const LINK_STEP = 650;
  const LATE = [4 * LINK_STEP, 4 * LINK_STEP + 350, 4 * LINK_STEP + 650];  // bus, stem, Day 1 elbow
  function timeLinks() {
    svg.querySelectorAll("path.link:not(.pulse)").forEach((p) => {
      const i = Number(p.dataset.order);
      const delay = i < obs.length ? i * LINK_STEP : LATE[i - obs.length];
      p.style.transitionDelay = stage === 2 ? `${delay}ms` : "0ms";
    });
  }

  function render(prev) {
    timeLinks();  // delays must be in place before the stage attribute starts the transitions
    pipe.dataset.stage = String(stage);
    onEls.forEach((el) => el.classList.toggle("on", Number(el.dataset.on) <= stage));
    dimEls.forEach((el) => el.classList.toggle("on", Number(el.dataset.dim) <= stage));
    hlEls.forEach((el) => el.classList.toggle("hl", Number(el.dataset.hl) === stage));
    stagesEl.forEach((li) => li.classList.toggle("active", Number(li.dataset.stage) === stage));
    stagesEl.forEach((li) => li.classList.toggle("done", Number(li.dataset.stage) < stage));
    caption.textContent = captions[stage];
    if (stage === 0 && prev !== 0) typeText(typed.dataset.text);
    if (stage > 0 && typed.textContent !== typed.dataset.text) { clearInterval(typeTimer); typed.textContent = typed.dataset.text; }
    obs.forEach((o, i) => {
      o.classList.toggle("linked", stage >= 2);
      o.classList.toggle("reached", stage >= 3);
      o.style.setProperty("--i", i);
    });
    pipe.classList.toggle("assoc-live", stage === 2 && prev < 2);
  }

  function schedule() {
    clearTimeout(timer);
    if (!playing) return;
    timer = setTimeout(() => { const prev = stage; stage = stage === LAST ? 0 : stage + 1; render(prev); schedule(); }, durations[stage] + (stage === LAST ? 1200 : 0));
  }
  function goto(n) { const prev = stage; stage = Math.max(0, Math.min(LAST, n)); render(prev); schedule(); }

  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "Pause" : "Play";
    playBtn.setAttribute("aria-label", playBtn.textContent);
    schedule();
  });
  document.getElementById("pipe-prev").addEventListener("click", () => goto(stage - 1));
  document.getElementById("pipe-next").addEventListener("click", () => goto(stage === LAST ? 0 : stage + 1));
  stagesEl.forEach((li) => li.addEventListener("click", () => goto(Number(li.dataset.stage))));
  window.addEventListener("resize", drawLinks);

  if (reduced) { stage = LAST; playBtn.textContent = "Play"; }
  // Start only once the pipeline is visible, so the first stage is not missed while the reader is elsewhere.
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { drawLinks(); render(-1); schedule(); io.disconnect(); }
  }, { threshold: 0.3 });
  drawLinks(); render(-1); clearTimeout(timer); clearInterval(typeTimer); typed.textContent = "";
  io.observe(pipe);
})();
