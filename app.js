/* The published page contains aggregate figures only. No source customer records. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.getElementById('reading-progress');
  const steps = [...document.querySelectorAll('.journey-step')];
  const rings = [...document.querySelectorAll('.customer-ring')];
  const stages = [
    { label: '見学予約', total: 11, summary: '会場で見学予約をいただいたお客様', legend: '<span><i class="legend-ring"></i>見学予約 11組</span>' },
    { label: '実来店', total: 8, summary: '予約11組のうち、8組が店舗へ', legend: '<span><i class="legend-ring"></i>実来店 8組</span><span><i class="legend-ring cancel"></i>見学キャンセル 3組</span>' },
    { label: '成約', total: 3, summary: '実来店8組のうち、3組が成約', legend: '<span><i class="legend-ring won"></i>成約 3組</span><span><i class="legend-ring"></i>成約未確認 4組</span><span><i class="legend-ring lost"></i>他社決定 1組</span><span><i class="legend-ring cancel"></i>見学キャンセル 3組</span>' }
  ];
  let currentStage = -1;
  function setStage(index) {
    if (index === currentStage) return;
    currentStage = index;
    const stage = stages[index];
    document.getElementById('stage-label').textContent = stage.label;
    document.getElementById('stage-index').textContent = String(index + 1);
    document.getElementById('stage-total').innerHTML = `${stage.total}<span>組</span>`;
    document.getElementById('stage-summary').textContent = stage.summary;
    document.getElementById('ring-legend').innerHTML = stage.legend;
    rings.forEach((ring, i) => {
      ring.className = 'customer-ring';
      if (index >= 1 && i >= 8) ring.classList.add('is-cancelled');
      if (index === 2 && i < 3) ring.classList.add('is-won');
      if (index === 2 && i >= 3 && i < 7) ring.classList.add('is-open');
      if (index === 2 && i === 7) ring.classList.add('is-lost');
    });
  }
  let ticking = false;
  function syncScroll() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0})`;
    const focus = window.innerHeight * (window.innerWidth < 960 ? .64 : .52);
    let nearest = 0;
    steps.forEach((step, index) => { if (step.getBoundingClientRect().top <= focus) nearest = index; });
    setStage(nearest);
    ticking = false;
  }
  function queueScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(syncScroll); } }
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  syncScroll();

  const toggle = document.getElementById('scenario-toggle');
  function updateRates(simulated) {
    const wins = simulated ? 4 : 3;
    toggle.setAttribute('aria-pressed', String(simulated));
    toggle.textContent = simulated ? '実績の3組に戻す' : '成約が1組増えたら';
    document.getElementById('visit-rate').textContent = ((wins / 8) * 100).toFixed(1);
    document.getElementById('booking-rate').textContent = ((wins / 11) * 100).toFixed(1);
    document.querySelectorAll('.win-count').forEach(el => { el.textContent = String(wins); });
    document.querySelectorAll('.unit-bar').forEach(bar => [...bar.children].forEach((unit, i) => unit.classList.toggle('filled', i < wins)));
    document.getElementById('scenario-status').textContent = simulated ? '仮定：成約4組（実績は3組）' : '実績：成約3組';
    document.getElementById('visit-rate-note').textContent = simulated ? 'あと1組で50％になるのは「実来店8組」が分母の場合' : '店舗で見学された方からの成約率';
    document.getElementById('rate-takeaway').textContent = simulated ? '成約が1組増えると、来店からは50.0％、見学予約からは36.4％。予約全体から50％という計画仮説とは、分母が違います。' : '母数が少ないため、1組の違いで率は大きく動きます。今回だけで、成約率の想定や接客の良し悪しを決めません。';
  }
  toggle.addEventListener('click', () => updateRates(toggle.getAttribute('aria-pressed') !== 'true'));
  const slider = document.getElementById('booking-slider');
  function updatePlan() {
    const bookings = Number(slider.value);
    const expected = bookings * .5;
    document.getElementById('booking-count').value = String(bookings);
    document.getElementById('expected-wins').value = String(expected);
    document.getElementById('plan-equation').textContent = `${bookings}組 × 50％ = ${expected}組`;
    slider.setAttribute('aria-valuetext', `見学予約${bookings}組、成約の期待件数${expected}組`);
  }
  slider.addEventListener('input', updatePlan);
  updatePlan();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.documentElement.classList.add('motion-ready');
    const revealTargets = document.querySelectorAll('.section-heading, .learning-intro, .learning-stories article, .handover-copy, .next-opening, .next-actions article');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
    revealTargets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
    const count = document.querySelector('[data-count]');
    const start = performance.now();
    function tick(now) {
      const percent = Math.min(1, (now - start) / 550);
      count.textContent = String(Math.round(3 * (1 - Math.pow(1 - percent, 3))));
      if (percent < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }
  reducedMotion.addEventListener('change', event => { if (event.matches) document.documentElement.classList.remove('motion-ready'); });
  window.addEventListener('beforeprint', () => { setStage(2); updateRates(false); });
  window.addEventListener('afterprint', queueScroll);
})();
