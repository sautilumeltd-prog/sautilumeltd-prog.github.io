/* SautiLume content protection.

   Loaded by every public page (home, demo, privacy, terms, cookies). It makes
   the site harder to copy:
     - text can't be selected, copied, cut or dragged out of the page
       (copying puts a copyright notice in the clipboard instead);
     - right-click and long-press menus are off;
     - the save, print, view-source and developer-tools shortcuts are off,
       and printing gives a blank page with a notice;
     - the page is covered while it is in the background (another tab, the
       phone's app switcher, or, on a computer, another window in front), and
       the Print Screen key wipes the clipboard, so most screenshot and
       screen-recording tools catch nothing.

   A web page cannot fully stop screenshots or screen recording, because the
   phone or computer takes them, not the browser. This is a deterrent, not a
   lock. The Android app uses Android's own protection (FLAG_SECURE), which
   does block them.

   Still works for everyone: screen readers (TalkBack, VoiceOver, NVDA, JAWS)
   and zoom, the emergency call buttons, Quick Exit, typing and pasting in
   form fields, and copying phone numbers and email addresses.

   The creator is exempt: signing in on dashboard.html with the SautiLume
   Google account sets "sl_creator" in that browser, and this file then does
   nothing there. Signing out of the dashboard turns the protection back on. */
(function () {
  "use strict";
  try { if (localStorage.getItem("sl_creator") === "1") return; } catch (e) {}

  var NOTICE = "© SautiLume Ltd. All rights reserved. Copying SautiLume content is not allowed.";
  var root = document.documentElement;
  // A computer with a mouse: there, leaving the window also covers the page
  var desktop = !!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches);

  var css =
    "html{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
    "input,textarea,select,[contenteditable],[contenteditable] *,a[href^='mailto:'],a[href^='tel:']" +
      "{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}" +
    "img,svg,video{-webkit-user-drag:none}" +
    ".sl-shield{position:fixed;inset:0;z-index:2147483647;display:none;flex-direction:column;align-items:center;" +
      "justify-content:center;gap:10px;padding:24px;background:#0d1117;color:#f0f6fc;text-align:center;" +
      "font:600 18px/1.45 -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif}" +
    ".sl-shield b{font-size:28px;letter-spacing:.5px}.sl-shield b span{color:#4fc3f7}" +
    ".sl-shield small{font-weight:400;font-size:15px;color:#9da7b3}" +
    "html.sl-covered .sl-shield{display:flex}" +
    "@media print{body>*{display:none!important}" +
      "body::after{content:\"Printing SautiLume pages is not allowed. © SautiLume Ltd. All rights reserved.\";" +
      "display:block;padding:48px;font:16px/1.5 Arial,sans-serif;color:#000;background:#fff}}";

  var style = document.createElement("style");
  style.id = "slProtectStyle";
  style.textContent = css;
  (document.head || root).appendChild(style);

  function element(node) { return node && node.nodeType === 3 ? node.parentNode : node; }
  function editable(node) {
    var el = element(node);
    if (!el || el.nodeType !== 1) return false;
    return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
  }
  // Fields people type in, and phone numbers and email addresses, stay copyable
  function free(node) {
    var el = element(node);
    if (!el || el.nodeType !== 1) return false;
    return editable(el) || !!(el.closest && el.closest("a[href^='mailto:'],a[href^='tel:']"));
  }

  function block(e) { if (!free(e.target)) e.preventDefault(); }
  document.addEventListener("contextmenu", block, true);
  document.addEventListener("selectstart", block, true);
  document.addEventListener("dragstart", function (e) { if (!editable(e.target)) e.preventDefault(); }, true);

  function copying(e) {
    var sel = window.getSelection ? window.getSelection() : null;
    if (free(e.target) && (!sel || !sel.focusNode || free(sel.focusNode))) return;
    e.preventDefault();
    try { if (e.clipboardData) e.clipboardData.setData("text/plain", NOTICE); } catch (x) {}
  }
  document.addEventListener("copy", copying, true);
  document.addEventListener("cut", copying, true);

  // Keys by position (e.code), because Option changes the letter on a Mac.
  // Shortcuts with Alt are left alone where AltGr (Ctrl+Alt) types letters
  // such as ś and ć, so typing in the contact form keeps working.
  document.addEventListener("keydown", function (e) {
    var code = e.code || "";
    var mod = (e.ctrlKey || e.metaKey) && !e.altKey;
    if (e.key === "F12" ||
        (mod && /^Key[SPU]$/.test(code)) ||                                // save, print, view source
        (e.ctrlKey && e.shiftKey && /^Key[IJC]$/.test(code)) ||            // developer tools (Windows, Linux)
        (e.metaKey && e.altKey && /^Key[IJCU]$/.test(code)) ||             // developer tools, view source (Mac)
        (mod && code === "KeyA" && !editable(e.target))) {                 // select all, outside fields
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // The cover: shown while the page is in the background
  var timer = null;
  function cover(on) {
    clearTimeout(timer);
    if (root.classList) root.classList.toggle("sl-covered", !!on);
  }
  function addShield() {
    if (document.getElementById("slShield")) return;
    var s = document.createElement("div");
    s.id = "slShield";
    s.className = "sl-shield";
    s.setAttribute("aria-hidden", "true");   // screen readers carry on reading the page underneath
    s.innerHTML = "<b>Sauti<span>Lume</span></b><span>This content is protected.</span>" +
      "<small>Come back to this window to carry on.</small>";
    s.addEventListener("click", function () { cover(false); });
    document.body.appendChild(s);
  }
  if (document.body) addShield();
  else document.addEventListener("DOMContentLoaded", addShield);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cover(true);
    else if (!desktop || document.hasFocus()) cover(false);
  });
  window.addEventListener("pagehide", function () { cover(true); });
  window.addEventListener("pageshow", function () { if (!desktop || document.hasFocus()) cover(false); });
  if (desktop) {
    window.addEventListener("blur", function () { cover(true); });
    window.addEventListener("focus", function () { cover(false); });
  }
  // Any tap, click or key press means the person is back on the page
  document.addEventListener("pointerdown", function () { cover(false); }, true);
  document.addEventListener("keydown", function (e) { if (e.key !== "PrintScreen") cover(false); }, true);

  // Print Screen (Windows): replace the screenshot in the clipboard and hide the page briefly
  document.addEventListener("keyup", function (e) {
    if (e.key !== "PrintScreen") return;
    try { if (navigator.clipboard) navigator.clipboard.writeText(NOTICE).catch(function () {}); } catch (x) {}
    cover(true);
    timer = setTimeout(function () { cover(false); }, 1500);
  }, true);

  try {
    console.log("%cSautiLume", "font:700 28px sans-serif;color:#4fc3f7", "\n" + NOTICE +
      " The code, text, verified answer library and images on this site belong to SautiLume Ltd.");
  } catch (e) {}
})();
