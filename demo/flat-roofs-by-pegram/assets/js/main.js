/* =====================================================================
   FLAT ROOFS BY PEGRAM — Site JS (Revvance build)
   Nav, scroll reveal, lead form, and the AI chat widget (GHL-ready).
   No dependencies. Keep it light.
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     GoHighLevel hook
     Set window.GHL_WEBHOOK_URL to your GHL Inbound Webhook URL to forward
     every lead (hero form + chat) straight into the pipeline so it texts
     and emails the owner. Leave empty to run in demo mode (no network call).
  ------------------------------------------------------------------- */
  var GHL_WEBHOOK_URL = window.GHL_WEBHOOK_URL || "";
  var PHONE = "(757) 537-1945";
  var TEL = "tel:+17575371945";

  function sendToGHL(payload) {
    payload.source = "pegram-website";
    payload.page = location.pathname;
    if (!GHL_WEBHOOK_URL) { console.log("[demo] lead captured:", payload); return; }
    try {
      fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) { /* demo mode */ }
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

    /* ---------- Header shadow on scroll ---------- */
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
      }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---------- Hero lead form ---------- */
    var leadForm = document.getElementById("leadForm");
    if (leadForm) {
      leadForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var el = leadForm.elements;
        var data = {
          name: (el["name"].value || "").trim(),
          phone: (el["phone"].value || "").trim(),
          zip: (el["zip"].value || "").trim(),
          service: el["service"].value || ""
        };
        if (!data.name || !data.phone || !data.service || !data.zip) {
          leadForm.reportValidity();
          return;
        }
        sendToGHL({ type: "estimate_form", name: data.name, phone: data.phone, zip: data.zip, service: data.service });
        var first = data.name.split(" ")[0];
        var msg = document.getElementById("leadSuccessMsg");
        if (msg) msg.textContent = "Thanks " + first + "! We'll text and call you at " + data.phone + " within one business hour to set up your free flat roof estimate.";
        leadForm.style.display = "none";
        var ok = document.getElementById("leadSuccess");
        if (ok) ok.classList.add("show");
      });
    }

    /* ================================================================
       AI CHAT WIDGET
       A lightweight scripted assistant that qualifies the visitor and
       captures a lead. In production, swap for the GHL widget or post
       the captured lead to GHL via sendToGHL() (already wired below).
       ================================================================ */
    var chat = document.getElementById("chat");
    if (!chat) return;

    var launch = document.getElementById("chatLaunch");
    var panel = document.getElementById("chatPanel");
    var closeBtn = document.getElementById("chatClose");
    var body = document.getElementById("chatBody");
    var chips = document.getElementById("chatChips");
    var form = document.getElementById("chatForm");
    var text = document.getElementById("chatText");

    var started = false;
    var flow = null;            // null | 'name' | 'phone' | 'detail'
    var lead = {};

    function scrollDown() { body.scrollTop = body.scrollHeight; }

    function bubble(kind, html) {
      var d = document.createElement("div");
      d.className = "msg " + kind;
      d.innerHTML = html;
      body.appendChild(d);
      scrollDown();
      return d;
    }

    function typing(then, delay) {
      var t = document.createElement("div");
      t.className = "msg typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(t);
      scrollDown();
      setTimeout(function () { t.remove(); then(); }, delay || 900);
    }

    function botSay(html, delay) { typing(function () { bubble("bot", html); }, delay); }

    function setChips(items) {
      chips.innerHTML = "";
      items.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = it.label;
        b.addEventListener("click", function () { handle(it.value || it.label); });
        chips.appendChild(b);
      });
    }
    function clearChips() { chips.innerHTML = ""; }

    var MENU = [
      { label: "Get a free estimate", value: "estimate" },
      { label: "I have a roof leak", value: "leak" },
      { label: "What areas do you serve?", value: "areas" },
      { label: "Free roof inspection", value: "inspection" }
    ];

    function start() {
      if (started) return;
      started = true;
      botSay("Hi there, thanks for stopping by Flat Roofs by Pegram. I'm the Pegram assistant. How can I help with your flat roof today?", 500);
      setTimeout(function () { setChips(MENU); }, 1500);
    }

    function startEstimate() {
      flow = "name";
      lead = {};
      botSay("Happy to help you get a free estimate. First, what's your name?", 700);
    }

    function handle(input) {
      var raw = (input || "").toString().trim();
      if (!raw) return;
      bubble("user", escapeHtml(raw));
      clearChips();

      // Active lead-capture flow
      if (flow === "name") {
        lead.name = raw;
        flow = "phone";
        botSay("Nice to meet you, " + escapeHtml(raw.split(" ")[0]) + ". What's the best phone number to reach you?", 700);
        return;
      }
      if (flow === "phone") {
        lead.phone = raw;
        flow = "detail";
        botSay("Got it. Briefly, what's going on with your roof? For example: a leak, a full replacement, a roof coating, or just an inspection.", 800);
        return;
      }
      if (flow === "detail") {
        lead.detail = raw;
        flow = null;
        sendToGHL({ type: "chat_lead", name: lead.name, phone: lead.phone, detail: lead.detail });
        botSay("Thank you, " + escapeHtml(lead.name.split(" ")[0]) + ". We'll text and call you at " + escapeHtml(lead.phone) + " shortly. If it's urgent, you can also reach us right now at <a href='" + TEL + "'>" + PHONE + "</a>.", 900);
        setTimeout(function () { setChips([{ label: "Start a new question", value: "menu" }]); }, 1900);
        return;
      }

      // Intent routing
      var t = raw.toLowerCase();
      if (raw === "estimate" || /estimat|quote|price|cost/.test(t)) { startEstimate(); return; }
      if (raw === "leak" || /leak|storm|water|drip|damage|emergency/.test(t)) {
        botSay("Sorry to hear that. A flat roof leak is worth looking at quickly before it spreads. We offer free inspections across Hampton Roads. Let me grab your details so we can get out to you fast.", 800);
        setTimeout(startEstimate, 2000);
        return;
      }
      if (raw === "areas" || /area|serve|location|near|city|chesapeake|hampton|norfolk|portsmouth|suffolk|virginia/.test(t)) {
        botSay("We're based in Chesapeake and serve all of Hampton Roads, including Virginia Beach, Norfolk, Portsmouth, Suffolk, Hampton, and Newport News. Want a free estimate for your property?", 800);
        setTimeout(function () { setChips([{ label: "Yes, get my estimate", value: "estimate" }, { label: "Ask something else", value: "menu" }]); }, 1900);
        return;
      }
      if (raw === "inspection" || /inspect|check|look|assess/.test(t)) {
        botSay("We offer free flat roof inspections and an honest assessment of whether you need a repair, a coating, or a full replacement. No pressure. Want me to set one up?", 800);
        setTimeout(function () { setChips([{ label: "Yes, book my inspection", value: "estimate" }, { label: "Ask something else", value: "menu" }]); }, 1900);
        return;
      }
      if (raw === "menu" || /help|menu|start|hello|hi/.test(t)) {
        botSay("Of course. What would you like to do?", 600);
        setTimeout(function () { setChips(MENU); }, 1300);
        return;
      }
      // Fallback
      botSay("Great question. The fastest way to get you a precise answer is a quick free estimate or a call with our team. Want me to set that up?", 800);
      setTimeout(function () { setChips([{ label: "Get a free estimate", value: "estimate" }, { label: "Call " + PHONE, value: "callnow" }]); }, 1900);
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function openChat() {
      panel.classList.add("open");
      launch.classList.add("hide");
      start();
      setTimeout(function () { text.focus(); }, 300);
    }
    function closeChat() {
      panel.classList.remove("open");
      launch.classList.remove("hide");
    }

    launch.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = text.value;
      text.value = "";
      if (v.trim()) handle(v);
    });

    // Special chip values that are not text intents
    var _handle = handle;
    handle = function (input) {
      if (input === "callnow") { window.location.href = TEL; return; }
      _handle(input);
    };
  });
})();
