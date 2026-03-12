/* ========= Util ========= */
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

/* ========= 0) Sonido ambiental (olas) ========= */
(function ambientSound(){
  const audio = $("#bgAudio");
  const btn = $("#soundFab");
  const icon = $("#soundIcon");
  const txt = $("#soundTxt");
  if(!audio || !btn || !icon || !txt) return;

  const KEY = "ipisa_ocean_sound_on";

  const setUI = (on) => {
    btn.classList.toggle("on", on);
    icon.textContent = on ? "🔊" : "🔈";
    txt.textContent = on ? "ON" : "OFF";
    btn.setAttribute("aria-label", on ? "Pausar sonido ambiental" : "Activar sonido ambiental");
  };

  const tryPlay = async () => {
    try{
      audio.volume = 0.35;
      await audio.play();
      return true;
    }catch(e){
      return false;
    }
  };

  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  const saved = localStorage.getItem(KEY) === "1";
  setUI(false);

  if(saved){
    tryPlay().then(ok=>{
      if(ok){
        setUI(true);
      }else{
        localStorage.setItem(KEY, "0");
        setUI(false);
      }
    });
  }

  btn.addEventListener("click", async ()=>{
    const isOn = btn.classList.contains("on");
    if(isOn){
      stop();
      localStorage.setItem(KEY, "0");
      setUI(false);
      return;
    }
    const ok = await tryPlay();
    if(ok){
      localStorage.setItem(KEY, "1");
      setUI(true);
    }else{
      btn.animate([
        {transform:"translateY(0)"},
        {transform:"translateY(-2px)"},
        {transform:"translateY(0)"},
        {transform:"translateY(-2px)"},
        {transform:"translateY(0)"}
      ], {duration: 280});
      localStorage.setItem(KEY, "0");
      setUI(false);
    }
  });

  document.addEventListener("visibilitychange", ()=>{
    if(document.hidden && btn.classList.contains("on")){
      audio.pause();
    }else if(!document.hidden && btn.classList.contains("on")){
      tryPlay();
    }
  });
})();

/* ========= 1) Progress bar ========= */
(function progressBar(){
  const bar = $("#progress");
  if(!bar) return;
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    bar.style.width = pct.toFixed(2) + "%";
  };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
})();

/* ========= 2) ScrollSpy menú activo ========= */
(function scrollSpy(){
  const navLinks = $$("a[data-nav]");
  const targets = navLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if(!navLinks.length || !targets.length) return;

  const setActive = (id) => {
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  };

  const io = new IntersectionObserver((entries)=>{
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
    if(visible) setActive(visible.target.id);
  }, {root:null, threshold:[0.25,0.45,0.6,0.75]});

  targets.forEach(t => io.observe(t));
})();

/* ========= 3) Reveal (NO desaparece al subir) + Stagger ========= */
(function reveal(){
  const revealEls = $$(".reveal, .revealUp");
  const staggerEls = $$(".stagger");
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.15});

  revealEls.forEach(el => io.observe(el));
  staggerEls.forEach(el => io.observe(el));
})();

/* ========= 4) Parallax suave en headers ========= */
(function parallaxHeaders(){
  const heads = $$(".blockHead");
  if(!heads.length) return;

  const onScroll = () => {
    heads.forEach(h=>{
      const rect = h.getBoundingClientRect();
      const p = Math.max(-40, Math.min(40, rect.top * -0.08));
      h.style.setProperty("--parallax", p + "px");
    });
  };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
})();

/* ========= 5) Modal de imágenes ========= */
(function imageModal(){
  const modal = $("#imgModal");
  const modalImg = $("#modalImg");
  const modalCap = $("#modalCap");
  if(!modal || !modalImg || !modalCap) return;

  const open = (src, cap="") => {
    modalImg.src = src;
    modalCap.textContent = cap;
    modal.setAttribute("aria-hidden","false");
    modal.classList.add("open");
    document.body.classList.add("noScroll");
  };

  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("noScroll");
    modalImg.src = "";
    modalCap.textContent = "";
  };

  $$(".zoomable").forEach(img=>{
    img.addEventListener("click", ()=>{
      open(img.src, img.dataset.caption || img.alt || "");
    });
  });

  modal.addEventListener("click", (e)=>{
    if(e.target.dataset.close) close();
  });

  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && modal.classList.contains("open")) close();
  });
})();

/* ========= 6) Checklist: recomendación dinámica ========= */
(function checklist(){
  const box = $("#resultBox");
  const wrap = $("#checklist");
  if(!box || !wrap) return;

  const msgs = {
    plástico: "✅ Reduce plásticos de un solo uso.",
    limpieza: "✅ Organiza limpieza de ríos, cañadas o playas.",
    reciclaje: "✅ Separa residuos en casa o escuela.",
    educación: "✅ Promueve educación ambiental."
  };

  const update = () => {
    const checked = $$("input[type=checkbox]:checked", wrap).map(i=>i.value);
    if(checked.length === 0){
      box.textContent = "Marca al menos una acción para ver la recomendación.";
      return;
    }
    box.innerHTML = checked.map(k => msgs[k] || "✅ Buena acción.").join("<br>");
  };

  wrap.addEventListener("change", update);
  update();
})();