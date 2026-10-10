(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('loader-progress');
  const loaderNumber = document.getElementById('loader-number');
  let displayed = 0;
  let assetsReady = document.readyState === 'complete';
  window.addEventListener('load', () => { assetsReady = true; }, { once: true });
  const started = performance.now();
  function finishLoading() {
    const elapsed = performance.now() - started;
    const target = assetsReady ? 100 : Math.min(92, 15 + elapsed / 25);
    displayed += (target - displayed) * (reduceMotion ? 1 : .19);
    if (target === 100 && displayed > 99.3) displayed = 100;
    progressBar.style.width = `${displayed}%`;
    loaderNumber.textContent = `${Math.floor(displayed)}%`;
    if (displayed >= 100) {
      preloader.classList.add('done');
      document.body.classList.remove('loading');
      window.setTimeout(() => preloader.remove(), 750);
    } else requestAnimationFrame(finishLoading);
  }
  requestAnimationFrame(finishLoading);

  const header = document.getElementById('header');
  const backTop = document.getElementById('back-top');
  const navLinks = document.getElementById('nav-links');
  const menuToggle = document.getElementById('menu-toggle');
  const sections = [...document.querySelectorAll('main section[id]')];
  function updateScroll() {
    header.classList.toggle('scrolled', window.scrollY > 24);
    backTop.classList.toggle('visible', window.scrollY > 500);
    let current = '';
    for (const section of sections) if (section.getBoundingClientRect().top < window.innerHeight * .38) current = section.id;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const active = link.dataset.nav === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
  function closeMenu() { navLinks.classList.remove('open'); menuToggle.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open navigation'); }
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav') && navLinks.classList.contains('open')) closeMenu(); });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' }));

  const revealElements = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) revealElements.forEach(el => el.classList.add('visible'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach(el => observer.observe(el));
  }

  const glow = document.getElementById('cursor-glow');
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      glow.style.opacity = '1';
    }, { passive: true });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  }

  // Lightweight falling particles: subtle white/red dots, continuously recycled from top.
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx || reduceMotion) return;
  let width = 0, height = 0, dpr = 1, dots = [], animationId = 0;
  let pointerX = -9999, pointerY = -9999;
  const random = (min, max) => min + Math.random() * (max - min);
  function makeDot(fromTop = false) {
    return { x: random(0, width), y: fromTop ? random(-height * .3, -5) : random(0, height), r: random(.65, 2.1), speed: random(.32, 1.22), drift: random(-.18, .18), alpha: random(.2, .65), red: Math.random() < .2, phase: random(0, Math.PI * 2) };
  }
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(105, Math.max(30, Math.round(width * height / 14000)));
    dots = Array.from({ length: count }, () => makeDot());
  }
  window.addEventListener('resize', resize, { passive: true });
  if (window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', e => { pointerX = e.clientX; pointerY = e.clientY; }, { passive: true });
  resize();
  let frame = 0;
  function draw() {
    frame++;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < dots.length; i++) {
      let p = dots[i];
      p.y += p.speed; p.x += p.drift + Math.sin(frame * .006 + p.phase) * .075;
      const dx = p.x - pointerX, dy = p.y - pointerY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < 11000 && distanceSquared > 1) {
        const force = (1 - Math.sqrt(distanceSquared) / 105) * .4;
        p.x += dx * force / 25; p.y += dy * force / 25;
      }
      if (p.y > height + 5 || p.x < -10 || p.x > width + 10) dots[i] = p = makeDot(true);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.red ? `rgba(244,63,85,${p.alpha})` : `rgba(226,226,235,${p.alpha})`;
      ctx.fill();
    }
    animationId = requestAnimationFrame(draw);
  }
  draw();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else { cancelAnimationFrame(animationId); draw(); }
  });
})();
