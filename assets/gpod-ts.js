/**
 * Tenscope home sections — rails + review wall.
 * Loaded (deferred) by each section that needs it; the guard makes the
 * duplicate <script> tags harmless.
 *
 * Progressive enhancement throughout: without JS every rail is still a
 * touch-scrollable row and every review is visible. JS only adds the
 * prev/next + progress footer (rendered `hidden`) and the "Load more" cut.
 */
(function () {
  'use strict';

  if (window.__gpodTsLoaded) return;
  window.__gpodTsLoaded = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rails: [data-ts-rail] wraps [data-ts-track] + footer ---------- */

  function initRail(rail) {
    if (!rail || rail.__tsRail) return;
    var track = rail.querySelector('[data-ts-track]');
    var foot = rail.querySelector('[data-ts-rail-foot]');
    if (!track || !foot) return;
    rail.__tsRail = true;

    var bar = foot.querySelector('[data-ts-rail-bar]');
    var prev = foot.querySelector('[data-ts-rail-prev]');
    var next = foot.querySelector('[data-ts-rail-next]');

    function step() {
      var first = track.firstElementChild;
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 12;
      // Advance by whole cards so scroll-snap never lands half a card in.
      var per = Math.max(1, Math.floor((track.clientWidth + gap) / (first.offsetWidth + gap)));
      return per * (first.offsetWidth + gap);
    }

    function go(dir) {
      track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      // A grid at desktop widths (tour) or a row that fits needs no controls.
      var scrollable = max > 2 && getComputedStyle(track).overflowX !== 'visible';
      foot.hidden = !scrollable;
      if (!scrollable) return;
      var size = Math.min(100, (track.clientWidth / track.scrollWidth) * 100);
      var pos = max > 0 ? (track.scrollLeft / max) * ((100 - size) / size) * 100 : 0;
      if (bar) {
        bar.style.setProperty('--ts-rail-size', size + '%');
        bar.style.setProperty('--ts-rail-pos', pos + '%');
      }
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; sync(); });
    }, { passive: true });

    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(sync).observe(track);
    } else {
      window.addEventListener('resize', sync);
    }
    sync();
  }

  /* ---------- Review wall: show N, reveal the rest on demand ---------- */

  function initWall(wall) {
    if (!wall || wall.__tsWall) return;
    wall.__tsWall = true;

    var button = wall.querySelector('[data-ts-wall-more]');
    var items = Array.prototype.slice.call(wall.querySelectorAll('[data-ts-review]'));
    if (!button || !items.length) return;

    var desktop = window.matchMedia('(min-width: 1024px)');
    var batch = parseInt(wall.getAttribute('data-ts-batch'), 10) || 6;
    var shown = 0;

    function reveal(count) {
      var target = Math.min(items.length, shown + count);
      var firstNew = null;
      for (var i = 0; i < items.length; i++) {
        var visible = i < target;
        if (visible && items[i].hidden && !firstNew) firstNew = items[i];
        items[i].hidden = !visible;
      }
      shown = target;
      button.parentNode.hidden = shown >= items.length;
      return firstNew;
    }

    // First paint: a desktop masonry of 3 columns reads better with 9.
    reveal(desktop.matches ? Math.max(batch, 9) : batch);

    button.addEventListener('click', function () {
      var firstNew = reveal(batch);
      // Move focus into the new content so keyboard users are not left
      // stranded on a button that may have just disappeared.
      if (firstNew) {
        var target = firstNew.querySelector('a, [tabindex]') || firstNew;
        if (!target.hasAttribute('tabindex') && target === firstNew) firstNew.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: false });
      }
    });
  }

  function init(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-ts-rail]').forEach(initRail);
    scope.querySelectorAll('[data-ts-wall]').forEach(initWall);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', function (event) { init(event.target); });
})();
