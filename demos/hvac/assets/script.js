/* =================================================================
   MERIDIAN HEATING & AIR — Shared JS
   ================================================================= */

document.addEventListener('DOMContentLoaded', function() {

  /* ---------- MOBILE NAV ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Optional: close all others
      // document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ---------- SCROLL REVEAL ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- BEFORE/AFTER SLIDER ---------- */
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const after = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;

    let dragging = false;
    const setPos = (pct) => {
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = `${pct}%`;
    };

    const getPct = (clientX) => {
      const rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    slider.addEventListener('mousedown', (e) => { dragging = true; setPos(getPct(e.clientX)); });
    document.addEventListener('mousemove', (e) => { if (dragging) setPos(getPct(e.clientX)); });
    document.addEventListener('mouseup', () => dragging = false);

    slider.addEventListener('touchstart', (e) => {
      dragging = true; setPos(getPct(e.touches[0].clientX));
    }, { passive: true });
    slider.addEventListener('touchmove', (e) => {
      if (dragging) setPos(getPct(e.touches[0].clientX));
    }, { passive: true });
    slider.addEventListener('touchend', () => dragging = false);

    // Init
    setPos(50);
  });

  /* ---------- COST CALCULATOR ---------- */
  const calc = document.querySelector('#cost-calc');
  if (calc) {
    const update = () => {
      const sqft = parseInt(calc.querySelector('[name=sqft]').value) || 0;
      const system = calc.querySelector('[name=system]').value;
      const efficiency = calc.querySelector('[name=efficiency]').value;
      const output = calc.querySelector('.calc-result strong');
      const outputRange = calc.querySelector('.calc-result span');

      // Base per-sqft pricing by system type
      const basePrices = {
        'ac-only': { low: 4.5, high: 7 },
        'heat-pump': { low: 6, high: 9.5 },
        'full-hvac': { low: 8, high: 13 },
        'mini-split': { low: 9, high: 14 }
      };
      const effMultiplier = {
        'standard': 1,
        'high': 1.25,
        'premium': 1.6
      };
      const base = basePrices[system] || basePrices['ac-only'];
      const mult = effMultiplier[efficiency] || 1;

      const low = Math.round((sqft * base.low * mult) / 100) * 100;
      const high = Math.round((sqft * base.high * mult) / 100) * 100;

      if (sqft < 500) {
        output.textContent = 'Enter Square Footage';
        outputRange.textContent = 'Estimate range appears here';
      } else {
        output.textContent = '$' + low.toLocaleString() + ' – $' + high.toLocaleString();
        outputRange.textContent = `Typical range for ${sqft.toLocaleString()} sq ft • Final quote requires on-site inspection`;
      }
    };
    calc.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  }

  /* ---------- FORM BASIC VALIDATION ---------- */
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks! This is a demo form — in a live site your message would be sent directly to our dispatch team. We would respond within 15 minutes during business hours.');
      form.reset();
    });
  });

  /* ---------- YEAR IN FOOTER ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
