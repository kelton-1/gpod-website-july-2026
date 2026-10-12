/**
 * Cart behaviour: open the cart drawer after add to cart, keep the
 * redesigned cart's item count in sync, close the cart when the header menu
 * or search is opened, and apply discount codes from the cart.
 *
 * The base theme only flashes a small "added" popover on desktop (nothing on
 * phones), so shoppers can't tell anything happened. This subscribes to the
 * theme's own success channel ('cart-update', published only after
 * /cart/add.js succeeds) and opens the existing cart drawer. Failed adds
 * publish on 'cart-error' instead, so the theme's inline error still shows.
 *
 * Loaded deferred right after theme.js (layout/theme.liquid), which creates
 * window.cart and window.theme.subscribers.
 */
(function () {
  'use strict';

  function init() {
    if (window.__gpodCartOnAddReady) return;
    if (!window.theme || !window.theme.subscribers) return;
    if (!window.cart || typeof window.cart.openCartDrawer !== 'function') return;
    // Non-ajax mode already redirects to /cart; the cart page has no drawer.
    if (!window.theme.settings || !window.theme.settings.enableAjaxCart) return;
    if (document.body.classList.contains('template-cart')) return;

    window.__gpodCartOnAddReady = true;

    var eventName = 'cart-update';
    if (!window.theme.subscribers[eventName]) {
      window.theme.subscribers[eventName] = [];
    }

    window.theme.subscribers[eventName].push(function (event) {
      if (!event || event.source !== 'product-form') return;
      // Short beat so the button's success state registers before the
      // drawer slides in; the theme refreshes drawer contents itself.
      setTimeout(function () {
        if (!window.cart.cartDrawerIsOpen) window.cart.openCartDrawer();
      }, 250);
    });
  }

  /* Cart header item count ("2 items") for the redesigned cart
     (snippets/site-cart.liquid). theme.js only updates the header badge, so
     recount from the quantity fields whenever theme.js re-renders the line
     items (after add / quantity change / remove). The drawer's markup is
     cloned from a <template> on first open, so observe the containers that
     exist at load and look the count element up on each pass. */

  function syncCartCount(root) {
    var count = root.querySelector('[data-gpod-cart-count]');
    var holder = root.querySelector('[data-items-holder]');
    if (!count || !holder) return;

    var total = 0;
    holder.querySelectorAll('[data-item] [data-quantity-field]').forEach(function (field) {
      var qty = parseInt(field.value, 10);
      if (qty > 0) total += qty;
    });

    var text = total + (total === 1 ? ' item' : ' items');
    if (count.textContent !== text) count.textContent = text;
  }

  function initCartCount() {
    document.querySelectorAll('[data-cart-container], .template-cart [data-cart]').forEach(function (root) {
      if (root.hasAttribute('data-gpod-count-ready')) return;
      root.setAttribute('data-gpod-count-ready', '');

      var queued = false;
      new MutationObserver(function () {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(function () {
          queued = false;
          syncCartCount(root);
          renderDiscountCodes();
        });
      }).observe(root, {childList: true, subtree: true});
    });
  }

  /* The header (menu, search) stays visible above the cart drawer. Opening
     the menu or search while the cart is open closes the cart first, so the
     two panels never stack. theme.js's closeCartDrawer() schedules a scroll
     unlock 500ms later, which would land after the menu has locked scrolling
     and leave the page scrollable behind it — so that timer is cancelled and
     the unlock dispatched now, before the menu's own click handler locks
     again. Capture phase so this runs ahead of the theme's handlers. */

  document.addEventListener('click', function (event) {
    var cart = window.cart;
    if (!cart || !cart.cartDrawerIsOpen) return;
    if (!event.target.closest || !event.target.closest('[data-menu-toggle], [data-popdown-toggle]')) return;

    cart.closeCartDrawer();
    clearTimeout(cart.scrollLockTimeout);
    document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
  }, true);

  /* Discount codes in the cart (snippets/site-cart.liquid). Apple Pay,
     Google Pay and Shop Pay skip the checkout page's discount field, so codes
     are applied to the cart itself via cart/update.js `discount` — they then
     carry into every checkout path. The field lives in the drawer's cloned
     template and on /cart, so everything is event-delegated and every
     [data-gpod-discount-codes] container is re-rendered from the last known
     cart. */

  var discountCodes = [];

  function cartRequest(path, body) {
    var opts = {headers: {Accept: 'application/json'}};
    if (body) {
      opts.method = 'POST';
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    return fetch(window.theme.routes.root + path, opts).then(function (response) {
      if (!response.ok) throw new Error('Cart request failed: ' + response.status);
      return response.json();
    });
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function renderDiscountCodes() {
    var html = discountCodes.map(function (code) {
      var safe = escapeHtml(code);
      return '<span class="gpod-cart__discount-chip">' + safe +
        '<button type="button" data-gpod-discount-remove="' + safe + '" aria-label="Remove discount ' + safe + '">&times;</button></span>';
    }).join('');

    // Compare a key, not innerHTML: the browser re-serialises entities
    // (&times; -> ×), so an innerHTML check never matches and the count
    // observer above would re-render forever.
    var key = discountCodes.join('\n');
    document.querySelectorAll('[data-gpod-discount-codes]').forEach(function (holder) {
      if (holder.getAttribute('data-gpod-rendered') === key) return;
      holder.setAttribute('data-gpod-rendered', key);
      holder.innerHTML = html;
    });
  }

  function storeCodes(cart) {
    discountCodes = (cart.discount_codes || [])
      .filter(function (entry) { return entry.applicable !== false; })
      .map(function (entry) { return entry.code; });
    renderDiscountCodes();
  }

  function setDiscountMessage(root, text, state) {
    var message = root.querySelector('[data-gpod-discount-msg]');
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('is-error', state === 'error');
    message.classList.toggle('is-success', state === 'success');
  }

  // Let theme.js redraw totals, discount rows and line items.
  function refreshCart() {
    if (window.cart && typeof window.cart.getCart === 'function') window.cart.getCart();
  }

  function applyDiscount(root) {
    var input = root.querySelector('[data-gpod-discount-input]');
    var button = root.querySelector('[data-gpod-discount-apply]');
    var code = input ? input.value.trim() : '';
    if (!code) {
      setDiscountMessage(root, 'Enter a discount code.', 'error');
      return;
    }

    if (button) button.disabled = true;
    setDiscountMessage(root, 'Applying…', '');

    cartRequest('cart.js')
      .then(function (cart) {
        var current = (cart.discount_codes || [])
          .filter(function (entry) { return entry.applicable !== false; })
          .map(function (entry) { return entry.code; });

        if (current.some(function (c) { return c.toLowerCase() === code.toLowerCase(); })) {
          return {cart: cart, already: true};
        }

        return cartRequest('cart/update.js', {discount: current.concat(code).join(',')}).then(function (updated) {
          // Store without per-code discount support: fall back to the
          // /discount/CODE route, which applies the code and comes back here.
          if (!updated.discount_codes) {
            window.location.href = window.theme.routes.root + 'discount/' + encodeURIComponent(code) +
              '?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
            return null;
          }

          var entry = updated.discount_codes.filter(function (e) {
            return e.code.toLowerCase() === code.toLowerCase();
          })[0];

          if (entry && entry.applicable) return {cart: updated};

          // Not valid for this cart — take it back off so it doesn't linger.
          return cartRequest('cart/update.js', {discount: current.join(',')}).then(function (reverted) {
            return {cart: reverted, invalid: true};
          });
        });
      })
      .then(function (result) {
        if (!result) return;
        storeCodes(result.cart);
        if (result.invalid) {
          setDiscountMessage(root, '“' + code + '” isn’t valid for the items in your cart.', 'error');
        } else if (result.already) {
          setDiscountMessage(root, '“' + code + '” is already applied.', 'success');
          if (input) input.value = '';
        } else {
          setDiscountMessage(root, 'Discount applied.', 'success');
          if (input) input.value = '';
          refreshCart();
        }
      })
      .catch(function () {
        setDiscountMessage(root, 'Couldn’t apply that code. Please try again.', 'error');
      })
      .then(function () {
        if (button) button.disabled = false;
      });
  }

  function removeDiscount(root, code) {
    var remaining = discountCodes.filter(function (c) { return c !== code; });
    setDiscountMessage(root, '', '');
    cartRequest('cart/update.js', {discount: remaining.join(',')})
      .then(function (cart) {
        storeCodes(cart);
        refreshCart();
      })
      .catch(function () {
        setDiscountMessage(root, 'Couldn’t remove that code. Please try again.', 'error');
      });
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest) return;
    var apply = event.target.closest('[data-gpod-discount-apply]');
    var remove = event.target.closest('[data-gpod-discount-remove]');
    if (apply) {
      event.preventDefault();
      applyDiscount(apply.closest('[data-gpod-discount]'));
    } else if (remove) {
      event.preventDefault();
      removeDiscount(remove.closest('[data-gpod-discount]'), remove.getAttribute('data-gpod-discount-remove'));
    }
  });

  // Enter in the code field would otherwise submit the cart form straight to
  // checkout.
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' || !event.target.matches || !event.target.matches('[data-gpod-discount-input]')) return;
    event.preventDefault();
    applyDiscount(event.target.closest('[data-gpod-discount]'));
  });

  function initDiscountCodes() {
    if (window.__gpodDiscountReady || !window.theme || !window.theme.routes) return;
    window.__gpodDiscountReady = true;
    cartRequest('cart.js').then(storeCodes).catch(function () {});
  }

  init();
  initCartCount();
  initDiscountCodes();
  document.addEventListener('DOMContentLoaded', function () {
    init();
    initCartCount();
    initDiscountCodes();
  });
  window.addEventListener('load', init);
})();
