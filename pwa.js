'use strict';
// PWA glue: service worker registration, install prompt, update + offline notices.
(function () {
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function toast(html, { action, ms = 3500 } = {}) {
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    toastEl.onclick = action || (() => { toastEl.hidden = true; });
    clearTimeout(toastTimer);
    if (ms) toastTimer = setTimeout(() => { toastEl.hidden = true; }, ms);
  }

  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let deferred = null;

  window.PWA = {
    isIOS,
    isStandalone,
    // 'prompt' = native install available, 'ios' = show Share → Add to Home Screen hint, null = nothing to offer
    installMode() {
      if (isStandalone()) return null;
      if (deferred) return 'prompt';
      if (isIOS) return 'ios';
      return null;
    },
    async install() {
      if (!deferred) return false;
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      rerender();
      return outcome === 'accepted';
    },
    toast,
  };
  const rerender = () => { if (typeof window.pwaRefresh === 'function') window.pwaRefresh(); };

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; rerender(); });
  window.addEventListener('appinstalled', () => { deferred = null; toast('🎉 English Quest installed!'); rerender(); });
  window.addEventListener('offline', () => toast('📴 You are offline. Lessons still work.'));
  window.addEventListener('online', () => toast('✅ Back online.', { ms: 2000 }));

  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      const offerUpdate = w => toast('✨ New version available. <b>Tap to update</b>', {
        ms: 0, action: () => { toastEl.hidden = true; w.postMessage('skipWaiting'); },
      });
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(w);
        });
      });
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return; reloaded = true; location.reload();
      });
      // check for updates when the app comes back to the foreground
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    } catch (err) { console.warn('SW registration failed', err); }
  });
})();
