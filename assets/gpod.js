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

  function init() {
    document.querySelectorAll('[data-gpod-finder]').forEach(initFinder);
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
  });
})();
