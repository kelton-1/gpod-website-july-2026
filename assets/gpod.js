/**
 * GPOD redesign scripts.
 * Currently: the product finder quiz (sections/product-finder.liquid).
 * Vanilla JS, no dependencies; safe to load deferred on any page.
 */
(function () {
  'use strict';

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
        why: 'The fast-adjusting Pauly P on grass, dropped into the Base 2.0 when you’re on mats.'
      },
      stability: {
        handle: 'g-bundle-three-gpod-pauly-p-and-gpod-base',
        why: 'Our most premium monopod plus the weighted Base 2.0 — stable on turf and hard floors.'
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
      if (!card) {
        // Fallback: first candidate card, so the quiz never dead-ends.
        card = template.content.querySelector('[data-handle]');
      }
      if (!card) return;

      var clone = card.cloneNode(true);
      var why = clone.querySelector('[data-finder-why]');
      if (why) {
        why.textContent = rec.why + ' ' + (DEVICE_NOTES[a.device] || '');
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
        html += '<img src="' + candidate.image + '" srcset="' + candidate.image + ' 1x, ' + candidate.image2x + ' 2x" width="110" height="110" loading="lazy" alt="">';
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

  function init() {
    document.querySelectorAll('[data-gpod-finder]').forEach(initFinder);
    document.querySelectorAll('[data-compare-picker]').forEach(initComparePicker);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init inside the Shopify theme editor when the section reloads.
  document.addEventListener('shopify:section:load', function (event) {
    var finder = event.target.querySelector('[data-gpod-finder]');
    if (finder) initFinder(finder);
    var compare = event.target.closest('[data-compare-picker]') || event.target.querySelector('[data-compare-picker]');
    if (compare) initComparePicker(compare);
  });
})();
