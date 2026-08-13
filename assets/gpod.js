/**
 * GPOD redesign scripts.
 * Currently: the product finder quiz (sections/product-finder.liquid).
 * Vanilla JS, no dependencies; safe to load deferred on any page.
 */
(function () {
  'use strict';

  /* The file is loaded globally from layout/theme.liquid (the drill-down nav
     is in the header, so it has to be on every template) AND still by several
     sections that predate that. A duplicated <script src> executes twice, so
     bail on the second run rather than binding every listener again. */
  if (window.__gpodScriptLoaded) return;
  window.__gpodScriptLoaded = true;

  /* --------------------------------------------------------------
     Product finder quiz
     Answers: where (grass|indoor|both) → device → priority.
     The recommendation map returns a product handle + a "why" line.
     Handles must exist in the section's candidate <template>.
     -------------------------------------------------------------- */

  var RECOMMEND = {
    grass: {
      pack: {
        handle: 'gpodx',
        why: 'It collapses to 20 in for your golf bag, then extends to a full 51 in on the course.'
      },
      speed: {
        handle: 'gpod-pauly-p2',
        why: 'The Pauly P’s oversized twist ring makes height changes the fastest in the lineup.'
      },
      stability: {
        handle: 'gpod-pauly-p2',
        why: 'Aluminum build with a 5.5 in stainless GPEG stake — the most planted feel on turf.'
      },
      value: {
        handle: 'gpodmagsafe',
        why: 'The original GPOD: stake it, snap your phone on, film. Everything you need at the best price.'
      }
    },
    indoor: {
      pack: {
        handle: 'gpod-travel-1',
        why: 'It packs to just 9 in, stands on any hard surface, and extends to 62 in.'
      },
      speed: {
        handle: 'gpod-travel-1',
        why: 'Flip-out legs and quick extension make it the fastest indoor setup.'
      },
      stability: {
        handle: 'gpod-studio',
        why: 'The Studio 2.0 is our most stable tripod — built for coaches, sims, and daily use.'
      },
      value: {
        handle: 'gpod-travel-1',
        why: 'One compact tripod that covers mats, sims, and travel — remote included.'
      }
    },
    both: {
      pack: {
        handle: 'g-bundle-two-gpod-x-with-gpod-base',
        why: 'The collapsible GPOD X for the course plus the Base 2.0 for indoors — bundled and packable.'
      },
      speed: {
        handle: 'g-bundle-three-gpod-pauly-p-and-gpod-base',
        why: 'The fast-adjusting Pauly P on grass, dropped into the Base 2.0 when you’re on mats.',
        fallback: {
          handle: 'g-bundle-two-gpod-x-with-gpod-base',
          why: 'The collapsible GPOD X covers the course and drops into the Base 2.0 for quick setups on mats.'
        }
      },
      stability: {
        handle: 'g-bundle-three-gpod-pauly-p-and-gpod-base',
        why: 'Our most premium monopod plus the weighted Base 2.0 — stable on turf and hard floors.',
        fallback: {
          handle: 'g-bundle-two-gpod-x-with-gpod-base',
          why: 'The GPOD X covers the course and pairs with the weighted Base 2.0 for stable filming on hard floors.'
        }
      },
      value: {
        handle: 'g-bundle-one-gpod-with-gpod-base',
        why: 'The original GPOD plus the Base 2.0 — the cheapest way to cover grass and indoors.'
      }
    }
  };

  var DEVICE_NOTES = {
    iphone: 'Your iPhone snaps straight onto the MagSafe mount — no plates needed.',
    android: 'The included 3M metal plates make your Android just as magnetic as an iPhone.',
    tablet: 'Use the included metal plates for your tablet — and consider the Studio 2.0 for larger iPads.'
  };

  function initFinder(root) {
    var form = root.querySelector('[data-finder-form]');
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-finder-step]'));
    var progress = Array.prototype.slice.call(root.querySelectorAll('[data-finder-progress]'));
    var nextBtn = root.querySelector('[data-finder-next]');
    var backBtn = root.querySelector('[data-finder-back]');
    var resultWrap = root.querySelector('[data-finder-result]');
    var footer = root.querySelector('[data-finder-footer]');
    var template = root.querySelector('template[data-finder-products]');
    if (!form || !steps.length || !nextBtn || !template) return;

    var current = 0;

    function stepIsAnswered(index) {
      return !!steps[index].querySelector('input:checked');
    }

    function show(index) {
      current = index;
      steps.forEach(function (step, i) {
        step.hidden = i !== index;
      });
      progress.forEach(function (bar, i) {
        bar.classList.toggle('is-active', i <= index);
      });
      backBtn.hidden = index === 0;
      nextBtn.disabled = !stepIsAnswered(index);
      nextBtn.textContent = index === steps.length - 1 ? 'See my GPOD' : 'Next';
    }

    function answers() {
      var data = new FormData(form);
      return {
        where: data.get('where'),
        device: data.get('device'),
        priority: data.get('priority')
      };
    }

    function finish() {
      var a = answers();
      var rec = (RECOMMEND[a.where] || {})[a.priority];
      if (!rec) return;

      var card = template.content.querySelector('[data-handle="' + rec.handle + '"]');
      var reason = rec.why;

      if (!card || card.getAttribute('data-available') !== 'true') {
        card = rec.fallback
          ? template.content.querySelector('[data-handle="' + rec.fallback.handle + '"][data-available="true"]')
          : null;
        if (card) reason = rec.fallback.why;
      }

      if (!card) {
        // Last-resort guard: always recommend an available candidate.
        card = template.content.querySelector('[data-handle][data-available="true"]');
        reason = 'This available setup is the closest match for how and where you plan to film.';
      }
      if (!card) return;

      var clone = card.cloneNode(true);
      var why = clone.querySelector('[data-finder-why]');
      if (why) {
        why.textContent = reason + ' ' + (DEVICE_NOTES[a.device] || '');
      }

      resultWrap.innerHTML = '';
      resultWrap.appendChild(clone);
      resultWrap.hidden = false;
      footer.hidden = false;
      form.hidden = true;
      root.querySelector('.gpod-finder__progress').hidden = true;
      resultWrap.focus && resultWrap.setAttribute('tabindex', '-1');
      resultWrap.focus();
    }

    nextBtn.addEventListener('click', function () {
      if (!stepIsAnswered(current)) return;
      if (current === steps.length - 1) {
        finish();
      } else {
        show(current + 1);
      }
    });

    backBtn.addEventListener('click', function () {
      if (current > 0) show(current - 1);
    });

    form.addEventListener('change', function () {
      nextBtn.disabled = !stepIsAnswered(current);
    });

    root.addEventListener('click', function (event) {
      if (event.target.closest('[data-finder-restart]')) {
        form.reset();
        form.hidden = false;
        root.querySelector('.gpod-finder__progress').hidden = false;
        resultWrap.hidden = true;
        footer.hidden = true;
        show(0);
      }
    });

    show(0);
  }

  /* --------------------------------------------------------------
     Interactive compare picker (sections/compare-table.liquid)
     Each column gets a model <select>; changing it re-renders that
     column's product card and spec cells from the JSON payload.
     Deep links: ?models=handle1,handle2,... preselect the columns.
     -------------------------------------------------------------- */

  function initComparePicker(root) {
    if (root.hasAttribute('data-compare-ready')) return;
    var dataEl = root.querySelector('script[data-compare-data]');
    var table = root.querySelector('[data-compare-table]');
    if (!dataEl || !table) return;
    root.setAttribute('data-compare-ready', '');

    var data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      return;
    }
    var byHandle = {};
    data.candidates.forEach(function (c) { byHandle[c.handle] = c; });

    var cols = Array.prototype.slice.call(table.querySelectorAll('thead [data-compare-col]'));
    if (!cols.length) return;

    var selection = cols.map(function (th) {
      return th.getAttribute('data-compare-initial') || '';
    });

    // ?models=a,b,c preselects columns left to right.
    var params = new URLSearchParams(window.location.search);
    var wanted = (params.get('models') || '').split(',').filter(function (h) {
      return byHandle[h];
    });
    wanted.forEach(function (h, i) {
      if (i < selection.length) selection[i] = h;
    });

    function renderCard(th, candidate) {
      var card = th.querySelector('[data-compare-card]');
      if (!card) return;
      if (!candidate) {
        card.innerHTML = '<span class="gpod-compare__empty">Select a model</span>';
        return;
      }
      var html = '';
      if (candidate.image) {
        html += '<img class="gpod-compare__thumb" src="' + candidate.image + '" srcset="' + candidate.image + ' 1x, ' + candidate.image2x + ' 2x" width="110" height="140" loading="lazy" alt="">';
      }
      html += '<a class="gpod-compare__title" href="' + candidate.url + '"></a>';
      html += '<span class="gpod-compare__price"></span>';
      html += '<a class="gpod-compare__cta btn btn--primary btn--solid btn--small" href="' + candidate.url + '">Shop</a>';
      card.innerHTML = html;
      card.querySelector('.gpod-compare__title').textContent = candidate.title;
      var price = card.querySelector('.gpod-compare__price');
      price.textContent = candidate.price;
      if (candidate.compareAt) {
        var s = document.createElement('s');
        s.textContent = candidate.compareAt;
        price.appendChild(document.createTextNode(' '));
        price.appendChild(s);
      }
    }

    function renderCells() {
      data.specKeys.forEach(function (key) {
        var row = table.querySelector('[data-compare-row="' + key + '"]');
        if (!row) return;
        var any = false;
        row.querySelectorAll('td[data-compare-col]').forEach(function (td) {
          var idx = parseInt(td.getAttribute('data-compare-col'), 10);
          var candidate = byHandle[selection[idx]];
          var value = candidate && candidate.specs[key];
          // Carry the model name on the cell. On mobile the table reflows to a
          // spec-major layout where each value needs its own model label, and
          // that label is rendered from this attribute via CSS content:attr().
          // Without updating it here the labels would go stale the moment a
          // shopper swapped a model.
          td.setAttribute('data-compare-model', (candidate && candidate.title) || '');
          if (value) {
            td.textContent = value;
            any = true;
          } else {
            td.innerHTML = '<span class="gpod-compare__empty" aria-label="Not applicable">—</span>';
          }
        });
        row.hidden = !any;
      });
    }

    cols.forEach(function (th, idx) {
      var select = document.createElement('select');
      select.className = 'gpod-compare__picker';
      select.setAttribute('aria-label', 'Choose model for column ' + (idx + 1));
      data.candidates.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c.handle;
        opt.textContent = c.title;
        if (c.handle === selection[idx]) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', function () {
        selection[idx] = select.value;
        renderCard(th, byHandle[select.value]);
        renderCells();
      });
      th.insertBefore(select, th.firstChild);

      // Apply deep-linked selection if it differs from the server render.
      if (selection[idx] && selection[idx] !== th.getAttribute('data-compare-initial')) {
        renderCard(th, byHandle[selection[idx]]);
      }
    });

    if (wanted.length) renderCells();
  }

  /* --------------------------------------------------------------
     Collection result count
     The base theme replaces only the product-grid inner HTML after
     filtering. A non-rendered template travels with that HTML and
     provides Shopify's translated, server-calculated result label.
     -------------------------------------------------------------- */

  function initCollectionCount(root) {
    if (root.hasAttribute('data-gpod-count-ready')) return;

    var count = document.querySelector('[data-collection-count]');
    if (!count) return;

    root.setAttribute('data-gpod-count-ready', '');

    function update() {
      var state = root.querySelector('[data-collection-count-state]');
      if (state && state.dataset.label) {
        count.textContent = state.dataset.label;
      }
    }

    update();
    new MutationObserver(update).observe(root, {childList: true});
  }

  /* --------------------------------------------------------------
     PDP variant availability
     Subscribes to the base theme's existing variant-change channel so
     the message always follows the selected Shopify variant.
     -------------------------------------------------------------- */

  function initVariantAvailability(root) {
    if (root.hasAttribute('data-gpod-availability-ready')) return;
    if (!window.theme || !window.theme.subscribers) return;

    root.setAttribute('data-gpod-availability-ready', '');

    var sectionId = root.dataset.sectionId;
    var label = root.querySelector('[data-gpod-variant-availability-label]');
    var eventName = 'variant-change';

    if (!window.theme.subscribers[eventName]) {
      window.theme.subscribers[eventName] = [];
    }

    window.theme.subscribers[eventName].push(function (event) {
      if (!event || !event.data || event.data.sectionId !== sectionId) return;

      var variant = event.data.variant;
      var available = !!(variant && variant.available);

      root.classList.toggle('is-available', available);
      root.classList.toggle('is-unavailable', !available);

      if (!label) return;
      if (!variant) {
        label.textContent = root.dataset.itemUnavailable;
      } else {
        label.textContent = available ? root.dataset.inStock : root.dataset.outOfStock;
      }
    });
  }

  /* --------------------------------------------------------------
     Sticky PDP purchase action
     Delegates to the primary Shopify product form so quantity,
     line-item properties, gift-recipient data, and app fields remain
     part of the submitted cart line.
     -------------------------------------------------------------- */

  function initShopBarSubmit(root) {
    if (root.hasAttribute('data-gpod-submit-ready')) return;

    var button = root.querySelector('[data-gpod-shop-bar-submit]');
    var sectionId = root.dataset.productSectionId;
    if (!button || !sectionId) return;

    var productRoot = document.getElementById('Product--' + sectionId);
    var primaryButton = productRoot && productRoot.querySelector('form[data-product-form] [data-add-to-cart]');
    if (!primaryButton) return;

    root.setAttribute('data-gpod-submit-ready', '');
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (button.disabled || primaryButton.disabled) return;
      primaryButton.click();
    });
  }

  /* --------------------------------------------------------------
     Decorative hero video motion preference
     -------------------------------------------------------------- */

  function initHeroMotion(root) {
    if (root.hasAttribute('data-gpod-motion-ready')) return;

    var videos = Array.prototype.slice.call(root.querySelectorAll('video'));
    if (!videos.length || !window.matchMedia) return;

    root.setAttribute('data-gpod-motion-ready', '');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mobileViewport = window.matchMedia('(max-width: 767px)');
    var playOnMobile = root.dataset.gpodPlayVideoMobile === 'true';

    function update() {
      videos.forEach(function (video) {
        var layer = video.closest('.gpod-hero__layer');
        var hiddenForViewport =
          !!layer &&
          ((layer.classList.contains('gpod-hero__layer--desktop') && mobileViewport.matches) ||
            (layer.classList.contains('gpod-hero__layer--mobile') && !mobileViewport.matches));

        if (hiddenForViewport || reducedMotion.matches || (mobileViewport.matches && !playOnMobile)) {
          video.pause();
        } else {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
      });
    }

    update();
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', update);
    }
    if (typeof mobileViewport.addEventListener === 'function') {
      mobileViewport.addEventListener('change', update);
    }
  }

  /* --------------------------------------------------------------
     Drill-down navigation (snippets/navigation.liquid)

     Each level is a panel absolutely positioned over the level before it and
     slid in from the right. Panels for level 2 are nested inside their level-1
     panel in the DOM, so the nesting composes for free: a nested panel's
     containing block is its parent panel, and it covers exactly the same box.

     The one thing that cannot be done in CSS is the height. The container has
     to be as tall as whichever panel is showing, and the panels are out of
     flow, so nothing sizes it. JS measures the visible level and sets an
     explicit height, which also gives the open/close a height transition for
     free.
     -------------------------------------------------------------- */

  function initNavDrilldown(root) {
    var drill = root.matches('[data-gpod-drill]') ? root : root.querySelector('[data-gpod-drill]');
    if (!drill || drill.dataset.gpodDrillReady === 'true') return;
    drill.dataset.gpodDrillReady = 'true';

    var rootList = drill.querySelector('[data-gpod-drill-root]');
    if (!rootList) return;

    /* The open panels, innermost last. */
    var stack = [];

    /* Sum of the children's laid-out heights, which is the height the element
       WOULD take in flow. Measuring the element itself is no good once the
       panels are stretched to the container (they all report the same value),
       and nested panels are absolutely positioned so they contribute nothing
       to the sum — exactly what we want. */
    function naturalHeight(el) {
      var h = 0;
      for (var i = 0; i < el.children.length; i++) {
        h += el.children[i].offsetHeight;
      }
      return h;
    }

    /* The container takes the height of whichever level is showing, and
       everything else is clipped.

       The interplay with CSS matters: panels are `height: 100%` of this, and
       both the container and the panels clip their overflow. So when a short
       child is open the container shrinks, and the taller parent underneath
       (and the root list under that) are cut off at the same edge instead of
       showing their tails below the child. Sizing to the tallest level
       instead was the other option, but it leaves the island permanently as
       tall as its deepest submenu, with dead space at the top level. */
    function syncHeight() {
      var visible = stack.length ? stack[stack.length - 1] : rootList;
      var h = naturalHeight(visible);
      /* Zero means the drawer is not laid out yet (it is hidden until
         opened). Pinning 0 would collapse the menu. */
      if (h > 0) drill.style.height = h + 'px';
    }

    function setPanelState(panel, open) {
      panel.classList.toggle('is-active', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');

      var trigger = drill.querySelector('[data-gpod-drill-open="' + panel.getAttribute('data-gpod-drill-panel') + '"]');
      if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function openPanel(panel) {
      if (!panel || stack.indexOf(panel) !== -1) return;
      stack.push(panel);
      setPanelState(panel, true);
      syncHeight();

      /* Move focus to the back button so keyboard and screen-reader users land
         inside the panel they just opened rather than back at the top.

         preventScroll is load-bearing. At this instant the panel is still at
         translateX(100%) because the transition has only just started, so a
         plain focus() makes the browser scroll `.nav-inner` sideways to reveal
         it — dragging the whole menu ~318px out of the drawer. overflow-x:
         hidden does not stop a scroll the browser initiates itself. */
      var back = panel.querySelector('[data-gpod-drill-back]');
      if (back) back.focus({ preventScroll: true });
    }

    function closeTop() {
      var panel = stack.pop();
      if (!panel) return;
      setPanelState(panel, false);
      syncHeight();

      var trigger = drill.querySelector('[data-gpod-drill-open="' + panel.getAttribute('data-gpod-drill-panel') + '"]');
      if (trigger) trigger.focus({ preventScroll: true });
    }

    function reset() {
      while (stack.length) {
        setPanelState(stack.pop(), false);
      }
      syncHeight();
    }

    drill.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-gpod-drill-open]');
      if (opener && drill.contains(opener)) {
        event.preventDefault();
        openPanel(drill.querySelector('[data-gpod-drill-panel="' + opener.getAttribute('data-gpod-drill-open') + '"]'));
        return;
      }

      if (event.target.closest('[data-gpod-drill-back]')) {
        event.preventDefault();
        closeTop();
      }
    });

    /* Escape steps back one level. Only while the drawer is open, and only if
       we are actually drilled in — otherwise leave Escape to the theme, which
       uses it to close the drawer. */
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !stack.length) return;
      event.stopPropagation();
      closeTop();
    });

    /* Reopening the drawer should start at the top level again. The theme
       toggles `nav--is-visible` on <body> — watching the class is more robust
       than guessing which of the toggle, the underlay or the close button was
       used to dismiss it. */
    var host = document.body;
    var wasOpen = host.classList.contains('nav--is-visible');
    new MutationObserver(function () {
      var isOpen = host.classList.contains('nav--is-visible');
      if (isOpen && !wasOpen) syncHeight();
      if (wasOpen && !isOpen) reset();
      wasOpen = isOpen;
    }).observe(host, { attributes: true, attributeFilter: ['class'] });

    /* A panel's height changes with the viewport, and the drawer is hidden at
       load so the first measurement can be zero. Re-measure on resize. */
    window.addEventListener('resize', syncHeight);
    syncHeight();
  }

  function init() {
    document.querySelectorAll('[data-gpod-drill]').forEach(initNavDrilldown);
    document.querySelectorAll('[data-gpod-finder]').forEach(initFinder);
    document.querySelectorAll('[data-compare-picker]').forEach(initComparePicker);
    document.querySelectorAll('[data-collection-products]').forEach(initCollectionCount);
    document.querySelectorAll('[data-gpod-variant-availability]').forEach(initVariantAvailability);
    document.querySelectorAll('[data-shop-bar]').forEach(initShopBarSubmit);
    document.querySelectorAll('[data-section-type="home-hero"]').forEach(initHeroMotion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init inside the Shopify theme editor when the section reloads.
  document.addEventListener('shopify:section:load', function (event) {
    var drill = event.target.querySelector('[data-gpod-drill]');
    if (drill) initNavDrilldown(drill);
    var finder = event.target.querySelector('[data-gpod-finder]');
    if (finder) initFinder(finder);
    var compare = event.target.closest('[data-compare-picker]') || event.target.querySelector('[data-compare-picker]');
    if (compare) initComparePicker(compare);
    var collectionProducts = event.target.querySelector('[data-collection-products]');
    if (collectionProducts) initCollectionCount(collectionProducts);
    var availability = event.target.querySelector('[data-gpod-variant-availability]');
    if (availability) initVariantAvailability(availability);
    var shopBar = event.target.querySelector('[data-shop-bar]');
    if (shopBar) initShopBarSubmit(shopBar);
    var hero = event.target.closest('[data-section-type="home-hero"]') || event.target.querySelector('[data-section-type="home-hero"]');
    if (hero) initHeroMotion(hero);
  });
})();
