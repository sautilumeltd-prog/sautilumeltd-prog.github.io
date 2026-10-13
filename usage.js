/* SautiLume anonymous usage counts.

   Each record says WHAT happened, never WHO did it: for example "a demo
   question in Kiswahili was answered from the periods library entry, typed
   on Firefox for Android". There is no name, no question or answer text, no
   voice, no IP address and no device or visitor ID in any record, and times
   are rounded to the hour.

   Records go to the SautiLume Firebase project (collection analytics_pings,
   shared with the Android app's opt-in counts). Only the SautiLume Google
   account can read them, through dashboard.html.

   Nothing is counted when the visitor chose Decline on the cookie notice,
   when the browser asks not to be tracked (Do Not Track or Global Privacy
   Control), on any address other than sautilume.com, or when the page is
   driven by automation, so the nightly review never adds to the numbers.

   Pages call slCount(event, fields). Calls made before this file loads wait
   in window.slQ. */
(function () {
  "use strict";
  // A Firebase web key identifies the project; it is not a secret. The
  // Firestore rules decide what anyone can do with it (add records only).
  var ENDPOINT = "https://firestore.googleapis.com/v1/projects/sautilume-1fa3c/databases/(default)/documents/" +
    "analytics_pings?key=AIzaSyDfT4U6UrZtM-y_IBW13OPnJcApnhBx9XE";
  var SEEN = "sl_counted";   // "this browser was counted once already"; the same value for everyone, so not an identifier

  function stored(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function allowed() {
    if (!/(^|\.)sautilume\.com$/.test(location.hostname)) return false;
    if (navigator.webdriver) return false;
    if (navigator.globalPrivacyControl === true) return false;
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return false;
    try {
      var consent = JSON.parse(stored("sl_cookie_consent"));
      if (consent && consent.choice === "declined") return false;
    } catch (e) {}
    return true;
  }

  var ua = navigator.userAgent || "";
  function browser() {
    if (/FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\//.test(ua)) return "in-app";
    if (/SamsungBrowser/.test(ua)) return "samsung";
    if (/OPR\/|Opera|OPiOS/.test(ua)) return "opera";
    if (/Edg(e|A|iOS)?\//.test(ua)) return "edge";
    if (/FxiOS|Firefox\//.test(ua)) return "firefox";
    if (/CriOS|Chrome\//.test(ua)) return "chrome";
    if (/Safari\//.test(ua)) return "safari";
    return "other";
  }
  function os() {
    if (/Android/.test(ua)) return "android";
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
    if (/Windows/.test(ua)) return "windows";
    if (/CrOS/.test(ua)) return "chromeos";
    if (/Macintosh|Mac OS X/.test(ua)) return "mac";
    if (/Linux/.test(ua)) return "linux";
    return "other";
  }
  var platform = /demo/.test(location.pathname) ? "web_demo" : "website";

  function value(v) {
    if (typeof v === "boolean") return { booleanValue: v };
    return { stringValue: String(v).slice(0, 60) };
  }
  function thisHour() { var d = new Date(); d.setUTCMinutes(0, 0, 0); return d.toISOString(); }

  function send(event, fields) {
    var f = {
      event: value(event), platform: value(platform), ts: { timestampValue: thisHour() },
      browser: value(browser()), os: value(os())
    };
    for (var k in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, k) && fields[k] !== null && fields[k] !== undefined && fields[k] !== "") f[k] = value(fields[k]);
    }
    try {
      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: f }) })
        .catch(function () {});
    } catch (e) {}
  }

  window.slCount = function (event, fields) {
    if (allowed()) send(event, fields || {});
  };

  // Where visitors came from: just the other site's name, never the full address
  function referrer() {
    try {
      var host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
      return host && !/(^|\.)sautilume\.com$/.test(host) ? host : "direct";
    } catch (e) { return "direct"; }
  }

  if (allowed()) {
    var page = platform === "web_demo" ? "demo" : (location.pathname.replace(/^.*\//, "").replace(/\.html$/, "") || "home");
    if (page === "index") page = "home";
    send("visit", { page: page, ref: referrer() });
    if (!stored(SEEN)) {
      send("first_visit", { page: page });
      try { localStorage.setItem(SEEN, "1"); } catch (e) {}
    }
  }

  var queued = window.slQ || [];
  window.slQ = { push: function (args) { window.slCount(args[0], args[1]); } };
  for (var i = 0; i < queued.length; i++) window.slCount(queued[i][0], queued[i][1]);
})();
