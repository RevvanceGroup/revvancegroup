/* =====================================================================
   BULTMAN CONSTRUCTION SERVICES — Site JS (Revvance build)
   Nav, scroll reveal, lead form, and the AI chat widget (GHL-ready).
   ===================================================================== */
(function () {
  "use strict";

  var GHL_WEBHOOK_URL = window.GHL_WEBHOOK_URL || "";
  var PHONE = "(386) 843-9429";
  var TEL = "tel:+13868439429";

  function sendToGHL(payload) {
    payload.source = "bultman-website";
    payload.page = location.pathname;
    if (!GHL_WEBHOOK_URL) { console.log("[demo] lead captured:", payload); return; }
    try { fetch(GHL_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(function () {}); } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    var hamburger = document.getElementById("hamburger");
    var nav = document.getElementById("nav");
    var backdrop = document.getElementById("navBackdrop");
    function closeNav() { if (!nav) return; nav.classList.remove("open"); if (backdrop) backdrop.classList.remove("show"); if (hamburger) hamburger.setAttribute("aria-expanded", "false"); }
    if (hamburger && nav) {
      hamburger.addEventListener("click", function () { var open = nav.classList.toggle("open"); if (backdrop) backdrop.classList.toggle("show", open); hamburger.setAttribute("aria-expanded", open ? "true" : "false"); });
      nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    }
    if (backdrop) backdrop.addEventListener("click", closeNav);

    var header = document.getElementById("header");
    if (header) { var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); }; onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); }

    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
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
    var launch = document.getElementById("chatLaunch"), panel = document.getElementById("chatPanel"), closeBtn = document.getElementById("chatClose");
    var body = document.getElementById("chatBody"), chips = document.getElementById("chatChips"), form = document.getElementById("chatForm"), text = document.getElementById("chatText");
    var started = false, flow = null, lead = {};
    function scrollDown() { body.scrollTop = body.scrollHeight; }
    function bubble(kind, html) { var d = document.createElement("div"); d.className = "msg " + kind; d.innerHTML = html; body.appendChild(d); scrollDown(); return d; }
    function typing(then, delay) { var t = document.createElement("div"); t.className = "msg typing"; t.innerHTML = "<span></span><span></span><span></span>"; body.appendChild(t); scrollDown(); setTimeout(function () { t.remove(); then(); }, delay || 900); }
    function botSay(html, delay) { typing(function () { bubble("bot", html); }, delay); }
    function setChips(items) { chips.innerHTML = ""; items.forEach(function (it) { var b = document.createElement("button"); b.type = "button"; b.textContent = it.label; b.addEventListener("click", function () { handle(it.value || it.label); }); chips.appendChild(b); }); }
    function clearChips() { chips.innerHTML = ""; }

    var MENU = [
      { label: "Request an estimate", value: "estimate" },
      { label: "Bathroom or kitchen remodel", value: "remodel" },
      { label: "Custom built-ins", value: "builtin" },
      { label: "What areas do you serve?", value: "areas" }
    ];

    function start() { if (started) return; started = true; botSay("Hi there, thanks for stopping by Bultman Construction Services. I'm the Bultman assistant. What can we help you build or renovate?", 500); setTimeout(function () { setChips(MENU); }, 1500); }
    function startEstimate() { flow = "name"; lead = {}; botSay("Happy to help. First, what's your name?", 700); }

    function handle(input) {
      var raw = (input || "").toString().trim();
      if (!raw) return;
      bubble("user", escapeHtml(raw)); clearChips();
      if (flow === "name") { lead.name = raw; flow = "phone"; botSay("Nice to meet you, " + escapeHtml(raw.split(" ")[0]) + ". What's the best phone number to reach you?", 700); return; }
      if (flow === "phone") { lead.phone = raw; flow = "detail"; botSay("Got it. Briefly, what's the project? For example: a bathroom or kitchen remodel, a custom built-in, or a home renovation.", 800); return; }
      if (flow === "detail") {
        lead.detail = raw; flow = null;
        sendToGHL({ type: "chat_lead", name: lead.name, phone: lead.phone, detail: lead.detail });
        botSay("Thank you, " + escapeHtml(lead.name.split(" ")[0]) + ". Justin will text and call you at " + escapeHtml(lead.phone) + " shortly. If you'd like, you can also reach us now at <a href='" + TEL + "'>" + PHONE + "</a>.", 900);
        setTimeout(function () { setChips([{ label: "Start a new question", value: "menu" }]); }, 1900);
        return;
      }
      var t = raw.toLowerCase();
      if (raw === "estimate" || raw === "remodel" || /estimat|quote|price|bathroom|kitchen|remodel|renovat/.test(t)) { startEstimate(); return; }
      if (raw === "builtin" || /built.?in|cabinet|carpentry|shelv|custom/.test(t)) {
        botSay("Custom built-ins are one of our favorite things to build, from bookcases and window seats to full wall units. Want to set up a time so we can see your space?", 900);
        setTimeout(function () { setChips([{ label: "Yes, let's talk", value: "estimate" }, { label: "Ask something else", value: "menu" }]); }, 2100);
        return;
      }
      if (raw === "areas" || /area|serve|location|near|mechanicsville|richmond|hanover|henrico/.test(t)) {
        botSay("We serve Mechanicsville and the greater Richmond area. Want to set up a free estimate?", 850);
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
