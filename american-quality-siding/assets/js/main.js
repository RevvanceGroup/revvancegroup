/* =====================================================================
   AMERICAN QUALITY SIDING & CONSTRUCTION — site JS
   Nav, header shadow, scroll reveal, lead form (GoHighLevel-ready).
   No dependencies.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     GoHighLevel hook.
     Set window.GHL_WEBHOOK_URL (one line, before this script loads) to a
     GHL Inbound Webhook URL and every lead form on the site POSTs there.
     Until then leads log to the console (demo mode).
     Example:
       <script>window.GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/XXXX";</script>
  ------------------------------------------------------------------- */
  var GHL_WEBHOOK_URL = window.GHL_WEBHOOK_URL || "";

  function sendToGHL(payload) {
    payload.source = "american-quality-siding-website";
    payload.page = location.pathname;
    payload.submitted_at = new Date().toISOString();
    if (!GHL_WEBHOOK_URL) { console.log("[demo mode] lead captured:", payload); return; }
    try {
      fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) { /* never block the success state on a network error */ }
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Mobile nav ---------- */
    var hamburger = document.getElementById("hamburger");
    var nav = document.getElementById("nav");
    var backdrop = document.getElementById("navBackdrop");
    function closeNav() {
      if (!nav) return;
      nav.classList.remove("open");
      if (backdrop) backdrop.classList.remove("show");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
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

    /* ---------- Lead forms (hero + contact share the same markup) ---------- */
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
          if (msg) msg.textContent = "Thanks " + first + ". Derek will call you at " + data.phone + " to talk through the job and set up a time to look at it.";
          form.style.display = "none";
          var top = wrap.querySelector(".leadcard__top");
          if (top) top.style.display = "none";
          ok.classList.add("show");
        }
      });
    });
  });
})();
