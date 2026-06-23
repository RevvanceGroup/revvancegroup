/* =====================================================================
   R&G REMODELING AND ROOFING — site JS
   Nav, header shadow, scroll reveal, lead form (GoHighLevel-ready).
   No dependencies.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     GoHighLevel hook.
     Set window.GHL_WEBHOOK_URLS (an array, one line, before this script loads)
     to one or more GHL Inbound Webhook URLs and every lead form POSTs to all of
     them. A single window.GHL_WEBHOOK_URL string still works too (back-compat).
     Until then leads log to the console (demo mode).
     Example:
       <script>window.GHL_WEBHOOK_URLS = ["https://services.leadconnectorhq.com/hooks/AAAA","https://services.leadconnectorhq.com/hooks/BBBB"];</script>
  ------------------------------------------------------------------- */
  var GHL_WEBHOOK_URLS = (window.GHL_WEBHOOK_URLS && window.GHL_WEBHOOK_URLS.length)
    ? window.GHL_WEBHOOK_URLS
    : (window.GHL_WEBHOOK_URL ? [window.GHL_WEBHOOK_URL] : []);

  function sendToGHL(payload) {
    payload.source = "rg-remodeling-website";
    payload.page = location.pathname;
    payload.submitted_at = new Date().toISOString();
    if (!GHL_WEBHOOK_URLS.length) { console.log("[demo mode] lead captured:", payload); return; }
    GHL_WEBHOOK_URLS.forEach(function (url) {
      try {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(function () {});
      } catch (e) { /* never block the success state on a network error */ }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Mobile nav ---------- */
    var hamburger = document.getElementById("hamburger");
    var nav = document.getElementById("nav");
    var backdrop = document.getElementById("navBackdrop");
    function closeDrops() {
      document.querySelectorAll(".nav-drop.open").forEach(function (d) {
        d.classList.remove("open");
        var t = d.querySelector(".nav-drop-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }
    function closeNav() {
      if (!nav) return;
      nav.classList.remove("open");
      if (backdrop) backdrop.classList.remove("show");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
      closeDrops();
    }
    if (hamburger && nav) {
      hamburger.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        if (backdrop) backdrop.classList.toggle("show", open);
        hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    }
    if (backdrop) backdrop.addEventListener("click", closeNav);

    /* ---------- Nav dropdowns (hover on desktop via CSS; click toggle for mobile + a11y) ---------- */
    document.querySelectorAll(".nav-drop-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var drop = btn.closest(".nav-drop");
        if (!drop) return;
        var open = drop.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-drop")) closeDrops();
    });

    /* ---------- Header shadow ---------- */
    var header = document.getElementById("header");
    if (header) {
      var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------- Reveal on scroll ---------- */
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---------- Lead forms ---------- */
    document.querySelectorAll("form[data-leadform]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var el = form.elements;
        var data = {
          type: "estimate_request",
          name: (el.namedItem("name").value || "").trim(),
          phone: (el.namedItem("phone").value || "").trim(),
          city: (el.namedItem("city").value || "").trim(),
          service: el.namedItem("service").value || "",
          message: el.namedItem("message") ? (el.namedItem("message").value || "").trim() : ""
        };
        sendToGHL(data);
        var wrap = form.closest(".leadcard") || form.parentElement;
        var ok = wrap.querySelector(".leadsuccess");
        if (ok) {
          var first = data.name.split(" ")[0];
          var msg = ok.querySelector("[data-success-msg]");
          if (msg) msg.textContent = "Thanks " + first + ". You will get a call back at " + data.phone + " to talk through the job and set up your free estimate.";
          form.style.display = "none";
          var top = wrap.querySelector(".leadcard__top");
          if (top) top.style.display = "none";
          ok.classList.add("show");
        }
      });
    });
  });
})();
