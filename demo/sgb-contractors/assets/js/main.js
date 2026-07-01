/* =====================================================================
   SGB CONTRACTORS — Site JS (Revvance build)
   Nav, scroll reveal, lead form, and the AI chat widget (GHL-ready).
   ===================================================================== */
(function () {
  "use strict";

  var GHL_WEBHOOK_URL = window.GHL_WEBHOOK_URL || "";
  var PHONE = "(757) 619-2348";
  var TEL = "tel:+17576192348";

  function sendToGHL(payload) {
    payload.source = "sgb-website";
    payload.page = location.pathname;
    if (!GHL_WEBHOOK_URL) { console.log("[demo] lead captured:", payload); return; }
    try {
      fetch(GHL_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(function () {});
    } catch (e) { /* demo mode */ }
  }

  document.addEventListener("DOMContentLoaded", function () {

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

    var header = document.getElementById("header");
    if (header) {
      var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var leadForm = document.getElementById("leadForm");
    if (leadForm) {
      leadForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var el = leadForm.elements;
        var data = { name: (el["name"].value || "").trim(), phone: (el["phone"].value || "").trim(), zip: (el["zip"].value || "").trim(), service: el["service"].value || "" };
        if (!data.name || !data.phone || !data.service || !data.zip) { leadForm.reportValidity(); return; }
        sendToGHL({ type: "estimate_form", name: data.name, phone: data.phone, zip: data.zip, service: data.service });
        var first = data.name.split(" ")[0];
        var msg = document.getElementById("leadSuccessMsg");
        if (msg) msg.textContent = "Thanks " + first + "! We'll text and call you at " + data.phone + " within one business day to talk through your project.";
        leadForm.style.display = "none";
        var ok = document.getElementById("leadSuccess");
        if (ok) ok.classList.add("show");
      });
    }

    var chat = document.getElementById("chat");
    if (!chat) return;
    var launch = document.getElementById("chatLaunch");
    var panel = document.getElementById("chatPanel");
    var closeBtn = document.getElementById("chatClose");
    var body = document.getElementById("chatBody");
    var chips = document.getElementById("chatChips");
    var form = document.getElementById("chatForm");
    var text = document.getElementById("chatText");

    var started = false, flow = null, lead = {};
    function scrollDown() { body.scrollTop = body.scrollHeight; }
    function bubble(kind, html) { var d = document.createElement("div"); d.className = "msg " + kind; d.innerHTML = html; body.appendChild(d); scrollDown(); return d; }
    function typing(then, delay) { var t = document.createElement("div"); t.className = "msg typing"; t.innerHTML = "<span></span><span></span><span></span>"; body.appendChild(t); scrollDown(); setTimeout(function () { t.remove(); then(); }, delay || 900); }
    function botSay(html, delay) { typing(function () { bubble("bot", html); }, delay); }
    function setChips(items) { chips.innerHTML = ""; items.forEach(function (it) { var b = document.createElement("button"); b.type = "button"; b.textContent = it.label; b.addEventListener("click", function () { handle(it.value || it.label); }); chips.appendChild(b); }); }
    function clearChips() { chips.innerHTML = ""; }

    var MENU = [
      { label: "Request an estimate", value: "estimate" },
      { label: "Custom or modular home", value: "build" },
      { label: "Remodel or renovation", value: "remodel" },
      { label: "What areas do you serve?", value: "areas" }
    ];

    function start() {
      if (started) return;
      started = true;
      botSay("Hi there, thanks for visiting SGB Contractors. I'm the SGB assistant. What can we build or improve for you?", 500);
      setTimeout(function () { setChips(MENU); }, 1500);
    }
    function startEstimate() { flow = "name"; lead = {}; botSay("Glad to help. First, what's your name?", 700); }

    function handle(input) {
      var raw = (input || "").toString().trim();
      if (!raw) return;
      bubble("user", escapeHtml(raw));
      clearChips();
      if (flow === "name") { lead.name = raw; flow = "phone"; botSay("Nice to meet you, " + escapeHtml(raw.split(" ")[0]) + ". What's the best phone number to reach you?", 700); return; }
      if (flow === "phone") { lead.phone = raw; flow = "detail"; botSay("Got it. Briefly, what's the project? For example: a custom home, a modular home, a remodel, or a commercial project.", 800); return; }
      if (flow === "detail") {
        lead.detail = raw; flow = null;
        sendToGHL({ type: "chat_lead", name: lead.name, phone: lead.phone, detail: lead.detail });
        botSay("Thank you, " + escapeHtml(lead.name.split(" ")[0]) + ". We'll text and call you at " + escapeHtml(lead.phone) + " shortly. If it's urgent, reach us now at <a href='" + TEL + "'>" + PHONE + "</a>.", 900);
        setTimeout(function () { setChips([{ label: "Start a new question", value: "menu" }]); }, 1900);
        return;
      }
      var t = raw.toLowerCase();
      if (raw === "estimate" || raw === "remodel" || /estimat|quote|price|remodel|renovat|restor|kitchen|bath/.test(t)) { startEstimate(); return; }
      if (raw === "build" || /custom|modular|new home|build|home/.test(t)) {
        botSay("That's our specialty. We have been building custom and modular homes across Hampton Roads since 2001, where quality is never an upgrade. Want to set up a time to talk through your build?", 950);
        setTimeout(function () { setChips([{ label: "Yes, let's talk", value: "estimate" }, { label: "Ask something else", value: "menu" }]); }, 2200);
        return;
      }
      if (raw === "areas" || /area|serve|location|near|beach|chesapeake|norfolk|hampton/.test(t)) {
        botSay("We build and remodel across Hampton Roads, including Virginia Beach and Chesapeake. Want to set up a free estimate?", 850);
        setTimeout(function () { setChips([{ label: "Yes, get started", value: "estimate" }, { label: "Ask something else", value: "menu" }]); }, 2000);
        return;
      }
      if (raw === "menu" || /help|menu|start|hello|hi/.test(t)) { botSay("Of course. What would you like to do?", 600); setTimeout(function () { setChips(MENU); }, 1300); return; }
      botSay("Great question. The best next step is a quick estimate so we can understand your project. Want me to set that up?", 850);
      setTimeout(function () { setChips([{ label: "Request an estimate", value: "estimate" }, { label: "Call " + PHONE, value: "callnow" }]); }, 2000);
    }

    function escapeHtml(s) { return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function openChat() { panel.classList.add("open"); launch.classList.add("hide"); start(); setTimeout(function () { text.focus(); }, 300); }
    function closeChat() { panel.classList.remove("open"); launch.classList.remove("hide"); }
    launch.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    form.addEventListener("submit", function (e) { e.preventDefault(); var v = text.value; text.value = ""; if (v.trim()) handle(v); });
    var _handle = handle;
    handle = function (input) { if (input === "callnow") { window.location.href = TEL; return; } _handle(input); };
  });
})();
