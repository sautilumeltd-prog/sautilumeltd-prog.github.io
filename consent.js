/* SautiLume cookie notice.
   Shown once per browser until the visitor chooses Accept All or Decline.
   The site sets no advertising, analytics or tracking cookies, so both
   choices behave the same today; the choice itself is the only thing saved
   (in localStorage, key "sl_cookie_consent"). If optional cookies are ever
   added, load them only when SautiLumeConsent.get() === "accepted". */
(function () {
  "use strict";
  var KEY = "sl_cookie_consent";
  var STYLE_ID = "slConsentStyle";
  var BANNER_ID = "slConsent";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, date: new Date().toISOString() })); } catch (e) {}
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  var css =
    ".sl-consent{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1000;" +
      "width:calc(100% - 32px);max-width:920px;display:flex;align-items:center;gap:20px;padding:22px 26px;" +
      "background:#0f1a3d;border:1px solid rgba(255,255,255,0.12);border-radius:18px;" +
      "box-shadow:0 24px 60px -20px rgba(15,26,61,0.65);color:#fff;" +
      "font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;" +
      "animation:slConsentIn .35s ease-out}" +
    ".sl-consent-icon{flex:0 0 auto;width:48px;height:48px;border-radius:50%;background:rgba(43,197,234,0.14);" +
      "display:flex;align-items:center;justify-content:center;color:#2BC5EA}" +
    ".sl-consent-body{flex:1 1 auto;min-width:0}" +
    ".sl-consent-title{margin:0 0 4px;font-weight:700;font-size:1.05rem;line-height:1.3;color:#fff}" +
    ".sl-consent-text{margin:0;font-size:0.9rem;line-height:1.55;color:#cfe0ff}" +
    ".sl-consent-text a{color:#2BC5EA;font-weight:600}" +
    ".sl-consent-actions{flex:0 0 auto;display:flex;gap:10px;align-items:center}" +
    ".sl-consent button{font:inherit;font-weight:700;font-size:0.92rem;line-height:1.2;border-radius:999px;" +
      "padding:11px 22px;cursor:pointer;border:2px solid transparent;white-space:nowrap}" +
    ".sl-consent .sl-decline{background:transparent;color:#fff;border-color:rgba(255,255,255,0.3)}" +
    ".sl-consent .sl-decline:hover{border-color:#fff}" +
    ".sl-consent .sl-accept{background:linear-gradient(90deg,#2BC5EA,#A6CE39);color:#0f1a3d}" +
    ".sl-consent .sl-accept:hover{opacity:0.9}" +
    ".sl-consent button:focus-visible,.sl-consent a:focus-visible{outline:3px solid #fff;outline-offset:2px}" +
    "@keyframes slConsentIn{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}" +
    "@media (max-width:720px){.sl-consent{flex-direction:column;align-items:stretch;gap:16px;bottom:16px;padding:20px}" +
      ".sl-consent-icon{display:none}.sl-consent-actions button{flex:1}}" +
    "@media (prefers-reduced-motion:reduce){.sl-consent{animation:none}}" +
    "@media print{.sl-consent{display:none}}";

  var html =
    '<div class="sl-consent-icon" aria-hidden="true">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>' +
        '<path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>' +
      '</svg>' +
    '</div>' +
    '<div class="sl-consent-body">' +
      '<p class="sl-consent-title" id="slConsentTitle">We value your privacy</p>' +
      '<p class="sl-consent-text" id="slConsentText">We use only essential cookies and similar technologies to run this site and remember your choices. ' +
        'We do not use advertising or tracking cookies, and we never store voice recordings or biometric data. ' +
        '<a href="cookies.html">Cookie settings</a></p>' +
    '</div>' +
    '<div class="sl-consent-actions">' +
      '<button type="button" class="sl-decline">Decline</button>' +
      '<button type="button" class="sl-accept">Accept All</button>' +
    '</div>';

  function show() {
    if (document.getElementById(BANNER_ID)) return;
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }
    var banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.className = "sl-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "slConsentTitle");
    banner.setAttribute("aria-describedby", "slConsentText");
    banner.innerHTML = html;

    function choose(choice) {
      write(choice);
      banner.parentNode.removeChild(banner);
      document.dispatchEvent(new CustomEvent("sl-consent-change", { detail: { choice: choice } }));
    }
    banner.querySelector(".sl-accept").addEventListener("click", function () { choose("accepted"); });
    banner.querySelector(".sl-decline").addEventListener("click", function () { choose("declined"); });

    // First in the page so keyboard and screen reader users reach it early.
    document.body.insertBefore(banner, document.body.firstChild);
  }

  window.SautiLumeConsent = {
    get: function () { var v = read(); return (v && v.choice) || null; },
    reset: function () { clear(); show(); }
  };

  if (!read()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show);
    else show();
  }
})();
