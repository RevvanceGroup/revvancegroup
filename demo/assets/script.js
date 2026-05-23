// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // Header shadow on scroll
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Fade-in on scroll
  var fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // FAQ toggle
  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.addEventListener('click', function () {
      q.parentElement.classList.toggle('open');
    });
  });

  // Lead form (placeholder, no real backend wired in template)
  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Thanks. We will call you within 1 business day.';
        btn.disabled = true;
        btn.style.background = '#16a34a';
      }
      form.querySelectorAll('input, select, textarea').forEach(function (input) {
        input.disabled = true;
      });
    });
  });
});
