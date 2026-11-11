(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hdr = document.getElementById('hdr');
  const hero = document.querySelector('.hero');
  const ctrl = document.getElementById('heroCtrl');

  // Hero video, 720p on phones, VP9 WebM where supported, MP4 otherwise.
  // With reduced motion it stays on the still poster until the visitor presses play.
  const video = document.getElementById('heroVideo');
  const label = ctrl.querySelector('span');
  const setPaused = paused => {
    hero.classList.toggle('paused', paused);
    ctrl.setAttribute('aria-pressed', String(paused));
    label.textContent = paused ? 'Videó lejátszása' : 'Videó megállítása';
  };
  let userPaused = reduce.matches;
  const play = () => video.play().then(() => setPaused(false)).catch(() => setPaused(true));
  if (reduce.matches) setPaused(true);
  else {
    const small = matchMedia('(max-width: 760px)').matches;
    const webm = video.canPlayType('video/webm; codecs="vp9"') !== '';
    video.src = small ? '/media/hero-garden-v2-720.mp4' : webm ? '/media/hero-garden-v2-1080.webm' : '/media/hero-garden-v2-1080.mp4';
    play();
  }
  ctrl.addEventListener('click', () => {
    if (video.paused) {
      if (!video.currentSrc) video.src = '/media/hero-garden-v2-1080.mp4';
      userPaused = false;
      play();
    } else {
      userPaused = true;
      video.pause();
      setPaused(true);
    }
  });

  // Pause the video and the vines while the hero is off screen to save battery.
  new IntersectionObserver(([e]) => {
    hero.classList.toggle('offscreen', !e.isIntersecting);
    if (!e.isIntersecting) video.pause();
    else if (!userPaused && video.currentSrc) video.play().catch(() => {});
  }, { threshold: 0.02 }).observe(hero);

  // Parallax: every [data-depth] layer moves by depth × its [data-px] host's distance from the viewport centre.
  const layers = [...document.querySelectorAll('[data-depth]')].map(el => ({ el, host: el.closest('[data-px]'), d: parseFloat(el.dataset.depth) }));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    hdr.classList.toggle('solid', scrollY > 40);
    if (reduce.matches) return;
    for (const { el, host, d } of layers) {
      const r = host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      let shift;
      if (host === hero) shift = scrollY * d;
      else {
        // Image plates have 13% of spare height above and below, so keep the shift inside it.
        const max = r.height * 0.12;
        shift = Math.max(-max, Math.min(max, -(r.top + r.height / 2 - vh / 2) * d));
      }
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();

  // Load the Google map only on request (keeps the page fast and cookie-free).
  const mapBtn = document.getElementById('mapLoad');
  mapBtn.addEventListener('click', e => {
    const f = document.createElement('iframe');
    f.title = 'Kilátó Terasz a Google Térképen';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.src = `https://www.google.com/maps?q=${mapBtn.dataset.lat},${mapBtn.dataset.lng}&z=15&hl=hu&output=embed`;
    e.currentTarget.replaceWith(f);
  });
})();
