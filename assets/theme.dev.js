
/*
* @license
* Modular Theme (c) Presidio Creative Themes
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Presidio Creative.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/

(function (bodyScrollLock, themeCurrency, Flickity, FlickityFade, Ajaxinate, FlickityAsNavFor, Rellax) {
    'use strict';

    (function() {
        const env = {"NODE_ENV":"production"};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    window.theme = window.theme || {};

    window.theme.subscribers = {};

    window.theme.sizes = {
      mobile: 480,
      small: 768,
      large: 1024,
      widescreen: 1320,
    };

    window.theme.dimensions = {
      headerScrolled: 60,
    };

    window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    window.theme.a11yTrigger = null;

    function floatLabels(container) {
      const floats = container.querySelectorAll('.form-field');
      floats.forEach((element) => {
        const label = element.querySelector('label');
        const input = element.querySelector('input, textarea');
        if (label && input) {
          input.addEventListener('keyup', (event) => {
            if (event.target.value !== '') {
              label.classList.add('label--float');
            } else {
              label.classList.remove('label--float');
            }
          });
          if (input.value && input.value.length) {
            label.classList.add('label--float');
          }
        }
      });
    }

    function readHeights() {
      const h = {};
      h.windowHeight = window.innerHeight;
      h.footerHeight = getHeight('[data-section-type*="footer"]');
      h.headerHeight = getHeight('[data-header-height].header--has-scrolled') || 60; // Header height is always 60px on scroll
      h.headerInitialHeight = getHeight('[data-header-height]:not(.header--has-scrolled)');
      return h;
    }

    function setVarsOnResize() {
      document.addEventListener('theme:resize', resizeVars);
    }

    function setVars() {
      const {windowHeight, headerInitialHeight, headerHeight, footerHeight} = readHeights();

      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--header-initial-height', `${headerInitialHeight}px`);

      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
      document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);
    }

    function resizeVars() {
      // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
      const {windowHeight, headerHeight, footerHeight} = readHeights();
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
    }

    function getHeight(selector) {
      const el = document.querySelector(selector);
      if (el) {
        return el.clientHeight;
      } else {
        return 0;
      }
    }

    function getScrollbarWidth() {
      // Creating invisible container
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll'; // forcing scrollbar to appear
      outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
      document.body.appendChild(outer);

      // Creating inner element and placing it in the container
      const inner = document.createElement('div');
      outer.appendChild(inner);

      // Calculating difference between container's full width and the child width
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

      // Removing temporary elements from the DOM
      outer.parentNode.removeChild(outer);

      return scrollbarWidth;
    }

    const outerHeight = (el) => {
      const style = getComputedStyle(el);
      let height = el.offsetHeight;

      height += parseInt(style.marginTop) + parseInt(style.marginBottom);

      return height;
    };

    const selectors$Q = {
      bannerContainer: '[data-banner-container]',
      bannerContent: '[data-banner-content]',
    };

    function preventOverflow(container) {
      const banners = container.querySelectorAll(selectors$Q.bannerContainer);

      if (banners) {
        banners.forEach((banner) => {
          const content = banner.querySelector(selectors$Q.bannerContent);

          if (content) {
            banner.style.minHeight = `${outerHeight(content)}px`;

            document.addEventListener('theme:resize', () => {
              banner.style.minHeight = `${outerHeight(content)}px`;
            });
          }
        });
      }
    }

    function debounce(fn, time) {
      let timeout;
      return function () {
        // eslint-disable-next-line prefer-rest-params
        if (fn) {
          const functionCall = () => fn.apply(this, arguments);
          clearTimeout(timeout);
          timeout = setTimeout(functionCall, time);
        }
      };
    }

    window.lastWindowWidth = window.innerWidth;

    function dispatchResizeEvent() {
      document.dispatchEvent(
        new CustomEvent('theme:resize', {
          bubbles: true,
        })
      );

      if (window.lastWindowWidth !== window.innerWidth) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:width', {
            bubbles: true,
          })
        );

        window.lastWindowWidth = window.innerWidth;
      }
    }

    function resizeListener() {
      window.addEventListener('resize', debounce(dispatchResizeEvent, 50));
    }

    let prev = window.pageYOffset;
    let up = null;
    let down = null;
    let wasUp = null;
    let wasDown = null;
    let scrollLockTimeout = 0;

    function dispatch() {
      const position = window.pageYOffset;
      if (position > prev) {
        down = true;
        up = false;
      } else if (position < prev) {
        down = false;
        up = true;
      } else {
        up = null;
        down = null;
      }
      prev = position;
      document.dispatchEvent(
        new CustomEvent('theme:scroll', {
          detail: {
            up,
            down,
            position,
          },
          bubbles: false,
        })
      );
      if (up && !wasUp) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:up', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      if (down && !wasDown) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:down', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      wasDown = down;
      wasUp = up;
    }

    function lock(e) {
      bodyScrollLock.disableBodyScroll(e.detail, {
        allowTouchMove: (el) => el.tagName === 'TEXTAREA',
      });
      document.documentElement.setAttribute('data-scroll-locked', '');
    }

    function unlock() {
      // Prevent body scroll lock race conditions
      scrollLockTimeout = setTimeout(() => {
        document.body.removeAttribute('data-drawer-closing');
      }, 20);

      if (document.body.hasAttribute('data-drawer-closing')) {
        document.body.removeAttribute('data-drawer-closing');

        if (scrollLockTimeout) {
          clearTimeout(scrollLockTimeout);
        }

        return;
      } else {
        document.body.setAttribute('data-drawer-closing', '');
      }

      document.documentElement.removeAttribute('data-scroll-locked');
      bodyScrollLock.clearAllBodyScrollLocks();
    }

    function scrollListener() {
      let timeout;
      window.addEventListener(
        'scroll',
        function () {
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(function () {
            dispatch();
          });
        },
        {passive: true}
      );

      window.addEventListener('theme:scroll:lock', lock);
      window.addEventListener('theme:scroll:unlock', unlock);
    }

    function isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function isTouch() {
      if (isTouchDevice()) {
        document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
        window.theme.touched = true;
      } else {
        window.theme.touched = false;
      }
    }

    function ariaToggle(container) {
      const toggleButtons = container.querySelectorAll('[data-aria-toggle]');
      if (toggleButtons.length) {
        toggleButtons.forEach((element) => {
          element.addEventListener('click', function (event) {
            event.preventDefault();
            const currentTarget = event.currentTarget;
            currentTarget.setAttribute('aria-expanded', currentTarget.getAttribute('aria-expanded') == 'false' ? 'true' : 'false');
            const toggleID = currentTarget.getAttribute('aria-controls');
            document.querySelector(`#${toggleID}`).classList.toggle('expanding');
            setTimeout(function () {
              document.querySelector(`#${toggleID}`).classList.toggle('expanded');
            }, 40);
          });
        });
      }
    }

    const classes$x = {
      loading: 'is-loading',
    };

    const selectors$P = {
      img: 'img.is-loading',
    };

    /*
      Catch images loaded events and remove class "is-loading" to them and their containers
    */
    function loadedImagesEventHook() {
      document.addEventListener(
        'load',
        (e) => {
          if (e.target.tagName == 'IMG' && e.target.classList.contains(classes$x.loading)) {
            e.target.classList.remove(classes$x.loading);
            e.target.parentNode.classList.remove(classes$x.loading);
          }
        },
        true
      );
    }

    /*
      Remove "is-loading" class to the loaded images and their containers
    */
    function removeLoadingClassFromLoadedImages(container) {
      container.querySelectorAll(selectors$P.img).forEach((img) => {
        if (img.complete) {
          img.classList.remove(classes$x.loading);
          img.parentNode.classList.remove(classes$x.loading);
        }
      });
    }

    let isCompleted = false;
    let docComplete = false;

    function preloadImages() {
      document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
          docComplete = true;
          initImagesPreloader();
        }
      };

      requestIdleCallback(initImagesPreloader);
    }

    function initImagesPreloader() {
      setTimeout(() => {
        if (isCompleted) return;
        if (!docComplete) {
          initImagesPreloader();
          return;
        }

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        if (lazyImages.length) {
          lazyImages.forEach((image) => {
            image.setAttribute('loading', 'eager');
          });
        }

        isCompleted = true;
      }, 3000);
    }

    /**
     * A11y Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help make your theme more accessible
     */

    /**
     * Moves focus to an HTML element
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects. Used in bindInPageLinks()
     * eg move focus to a modal that is opened. Used in trapFocus()
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */
    function forceFocus(element, options) {
        options = options || {};
      
        var savedTabIndex = element.tabIndex;
      
        element.tabIndex = -1;
        element.dataset.tabIndex = savedTabIndex;
        element.focus();
        if (typeof options.className !== 'undefined') {
          element.classList.add(options.className);
        }
        element.addEventListener('blur', callback);
      
        function callback(event) {
          event.target.removeEventListener(event.type, callback);
      
          element.tabIndex = savedTabIndex;
          delete element.dataset.tabIndex;
          if (typeof options.className !== 'undefined') {
            element.classList.remove(options.className);
          }
        }
      }
      
      /**
       * If there's a hash in the url, focus the appropriate element
       * This compensates for older browsers that do not move keyboard focus to anchor links.
       * Recommendation: To be called once the page in loaded.
       *
       * @param {Object} options - Settings unique to your theme
       * @param {string} options.className - Class name to apply to element on focus.
       * @param {string} options.ignore - Selector for elements to not include.
       */
      
      function focusHash(options) {
        options = options || {};
        var hash = window.location.hash;
        var element = document.getElementById(hash.slice(1));
      
        // if we are to ignore this element, early return
        if (element && options.ignore && element.matches(options.ignore)) {
          return false;
        }
      
        if (hash && element) {
          forceFocus(element, options);
        }
      }
      
      /**
       * When an in-page (url w/hash) link is clicked, focus the appropriate element
       * This compensates for older browsers that do not move keyboard focus to anchor links.
       * Recommendation: To be called once the page in loaded.
       *
       * @param {Object} options - Settings unique to your theme
       * @param {string} options.className - Class name to apply to element on focus.
       * @param {string} options.ignore - CSS selector for elements to not include.
       */
      
      function bindInPageLinks(options) {
        options = options || {};
        var links = Array.prototype.slice.call(
          document.querySelectorAll('a[href^="#"]')
        );

        function queryCheck (selector) {
          return document.getElementById(selector) !== null
        }
      
        return links.filter(function(link) {
          if (link.hash === '#' || link.hash === '') {
            return false;
          }
      
          if (options.ignore && link.matches(options.ignore)) {
            return false;
          }

          if (!queryCheck(link.hash.substr(1))) {
            return false;
          }
      
          var element = document.querySelector(link.hash);
      
          if (!element) {
            return false;
          }
      
          link.addEventListener('click', function() {
            forceFocus(element, options);
          });
      
          return true;
        });
      }
      
      function focusable(container) {
        var elements = Array.prototype.slice.call(
          container.querySelectorAll(
            '[tabindex],' +
              '[draggable],' +
              'a[href],' +
              'area,' +
              'button:enabled,' +
              'input:not([type=hidden]):enabled,' +
              'object,' +
              'select:enabled,' +
              'textarea:enabled'
          )
        );
      
        // Filter out elements that are not visible.
        // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
        return elements.filter(function(element) {
          return !!(
            element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length
          );
        });
      }
      
      /**
       * Traps the focus in a particular container
       *
       * @param {Element} container - Container DOM element to trap focus inside of
       * @param {Element} elementToFocus - Element to be focused on first
       * @param {Object} options - Settings unique to your theme
       * @param {string} options.className - Class name to apply to element on focus.
       */
      
      var trapFocusHandlers = {};
      
      function trapFocus(container, options) {
        options = options || {};
        var elements = focusable(container);
        var elementToFocus = options.elementToFocus || container;
        var first = elements[0];
        var last = elements[elements.length - 1];
      
        removeTrapFocus();
      
        trapFocusHandlers.focusin = function(event) {
          if (container !== event.target && !container.contains(event.target)) {
            first.focus();
          }
      
          if (
            event.target !== container &&
            event.target !== last &&
            event.target !== first
          )
            return;
          document.addEventListener('keydown', trapFocusHandlers.keydown);
        };
      
        trapFocusHandlers.focusout = function() {
          document.removeEventListener('keydown', trapFocusHandlers.keydown);
        };
      
        trapFocusHandlers.keydown = function(event) {
          if (event.code !== 'Tab') return; // If not TAB key
      
          // On the last focusable element and tab forward, focus the first element.
          if (event.target === last && !event.shiftKey) {
            event.preventDefault();
            first.focus();
          }
      
          //  On the first focusable element and tab backward, focus the last element.
          if (
            (event.target === container || event.target === first) &&
            event.shiftKey
          ) {
            event.preventDefault();
            last.focus();
          }
        };
      
        document.addEventListener('focusout', trapFocusHandlers.focusout);
        document.addEventListener('focusin', trapFocusHandlers.focusin);
      
        forceFocus(elementToFocus, options);
      }
      
      /**
       * Removes the trap of focus from the page
       */
      function removeTrapFocus() {
        document.removeEventListener('focusin', trapFocusHandlers.focusin);
        document.removeEventListener('focusout', trapFocusHandlers.focusout);
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
      }
      
      /**
       * Add a preventive message to external links and links that open to a new window.
       * @param {string} elements - Specific elements to be targeted
       * @param {object} options.messages - Custom messages to overwrite with keys: newWindow, external, newWindowExternal
       * @param {string} options.messages.newWindow - When the link opens in a new window (e.g. target="_blank")
       * @param {string} options.messages.external - When the link is to a different host domain.
       * @param {string} options.messages.newWindowExternal - When the link is to a different host domain and opens in a new window.
       * @param {object} options.prefix - Prefix to namespace "id" of the messages
       */
      function accessibleLinks(elements, options) {
        if (typeof elements !== 'string') {
          throw new TypeError(elements + ' is not a String.');
        }
      
        elements = document.querySelectorAll(elements);
      
        if (elements.length === 0) {
          return;
        }
      
        options = options || {};
        options.messages = options.messages || {};
      
        var messages = {
          newWindow: options.messages.newWindow || 'Opens in a new window.',
          external: options.messages.external || 'Opens external website.',
          newWindowExternal:
            options.messages.newWindowExternal ||
            'Opens external website in a new window.'
        };
      
        var prefix = options.prefix || 'a11y';
      
        var messageSelectors = {
          newWindow: prefix + '-new-window-message',
          external: prefix + '-external-message',
          newWindowExternal: prefix + '-new-window-external-message'
        };
      
        function generateHTML(messages) {
          var container = document.createElement('ul');
          var htmlMessages = Object.keys(messages).reduce(function(html, key) {
            return (html +=
              '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
          }, '');
      
          container.setAttribute('hidden', true);
          container.innerHTML = htmlMessages;
      
          document.body.appendChild(container);
        }
      
        function externalSite(link) {
          return link.hostname !== window.location.hostname;
        }
      
        elements.forEach(function(link) {
          var target = link.getAttribute('target');
          var rel = link.getAttribute('rel');
          var isExternal = externalSite(link);
          var isTargetBlank = target === '_blank';
          var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;
      
          if (isTargetBlank && missingRelNoopener) {
            var relValue = rel === null ? 'noopener' : rel + ' noopener';
            link.setAttribute('rel', relValue);
          }
      
          if (isExternal && isTargetBlank) {
            link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
          } else if (isExternal) {
            link.setAttribute('aria-describedby', messageSelectors.external);
          } else if (isTargetBlank) {
            link.setAttribute('aria-describedby', messageSelectors.newWindow);
          }
        });
      
        generateHTML(messages);
      }

    var a11y = /*#__PURE__*/Object.freeze({
        __proto__: null,
        forceFocus: forceFocus,
        focusHash: focusHash,
        bindInPageLinks: bindInPageLinks,
        focusable: focusable,
        trapFocus: trapFocus,
        removeTrapFocus: removeTrapFocus,
        accessibleLinks: accessibleLinks
    });

    function getWindowWidth() {
      return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }

    function getWindowHeight() {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    function isDesktop() {
      return getWindowWidth() >= window.theme.sizes.small;
    }

    function isMobile() {
      return getWindowWidth() < window.theme.sizes.small;
    }

    const selectors$O = {
      inputSearch: 'input[type="search"]',
      focusedElements: '[aria-selected="true"] a',
      resetButton: 'button[type="reset"]',
    };

    const classes$w = {
      hidden: 'hidden',
    };

    class HeaderSearchForm extends HTMLElement {
      constructor() {
        super();

        this.input = this.querySelector(selectors$O.inputSearch);
        this.resetButton = this.querySelector(selectors$O.resetButton);

        if (this.input) {
          this.input.form.addEventListener('reset', this.onFormReset.bind(this));
          this.input.addEventListener(
            'input',
            debounce((event) => {
              this.onChange(event);
            }, 300).bind(this)
          );
        }
      }

      toggleResetButton() {
        const resetIsHidden = this.resetButton.classList.contains(classes$w.hidden);
        if (this.input.value.length > 0 && resetIsHidden) {
          this.resetButton.classList.remove(classes$w.hidden);
        } else if (this.input.value.length === 0 && !resetIsHidden) {
          this.resetButton.classList.add(classes$w.hidden);
        }
      }

      onChange() {
        this.toggleResetButton();
      }

      shouldResetForm() {
        return !document.querySelector(selectors$O.focusedElements);
      }

      onFormReset(event) {
        // Prevent default so the form reset doesn't set the value gotten from the url on page load
        event.preventDefault();
        // Don't reset if the user has selected an element on the predictive search dropdown
        if (this.shouldResetForm()) {
          this.input.value = '';
          this.toggleResetButton();
          event.target.querySelector(selectors$O.inputSearch).focus();
        }
      }
    }

    customElements.define('header-search-form', HeaderSearchForm);

    const selectors$N = {
      allVisibleElements: '[role="option"]',
      ariaSelected: '[aria-selected="true"]',
      predictiveSearch: 'predictive-search',
      predictiveSearchResults: '[data-predictive-search-results]',
      predictiveSearchStatus: '[data-predictive-search-status]',
      searchInput: 'input[type="search"]',
      searchPopdown: '[data-popdown]',
      searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
      searchResultsGroupsWrapper: 'data-search-results-groups-wrapper',
      searchForText: '[data-predictive-search-search-for-text]',
      sectionPredictiveSearch: '#shopify-section-predictive-search',
      selectedLink: '[aria-selected="true"] a',
      selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
    };

    class PredictiveSearch extends HeaderSearchForm {
      constructor() {
        super();
        this.a11y = a11y;
        this.abortController = new AbortController();
        this.allPredictiveSearchInstances = document.querySelectorAll(selectors$N.predictiveSearch);
        this.cachedResults = {};
        this.input = this.querySelector(selectors$N.searchInput);
        this.isOpen = false;
        this.predictiveSearchResults = this.querySelector(selectors$N.predictiveSearchResults);
        this.searchPopdown = this.closest(selectors$N.searchPopdown);
        this.searchTerm = '';
      }

      connectedCallback() {
        this.input.addEventListener('focus', this.onFocus.bind(this));
        this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));

        this.addEventListener('focusout', this.onFocusOut.bind(this));
        this.addEventListener('keyup', this.onKeyup.bind(this));
        this.addEventListener('keydown', this.onKeydown.bind(this));
      }

      getQuery() {
        return this.input.value.trim();
      }

      onChange() {
        super.onChange();
        const newSearchTerm = this.getQuery();

        if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
          // Remove the results when they are no longer relevant for the new search term
          // so they don't show up when the dropdown opens again
          this.querySelector(selectors$N.searchResultsGroupsWrapper)?.remove();
        }

        // Update the term asap, don't wait for the predictive search query to finish loading
        this.updateSearchForTerm(this.searchTerm, newSearchTerm);

        this.searchTerm = newSearchTerm;

        if (!this.searchTerm.length) {
          this.reset();
          return;
        }

        this.getSearchResults(this.searchTerm);
      }

      onFormSubmit(event) {
        if (!this.getQuery().length || this.querySelector(selectors$N.selectedLink)) event.preventDefault();
      }

      onFormReset(event) {
        super.onFormReset(event);
        if (super.shouldResetForm()) {
          this.searchTerm = '';
          this.abortController.abort();
          this.abortController = new AbortController();
          this.closeResults(true);
        }
      }

      shouldResetForm() {
        return !document.querySelector(selectors$N.selectedLink);
      }

      onFocus() {
        const currentSearchTerm = this.getQuery();

        if (!currentSearchTerm.length) return;

        if (this.searchTerm !== currentSearchTerm) {
          // Search term was changed from other search input, treat it as a user change
          this.onChange();
        } else if (this.getAttribute('results') === 'true') {
          this.open();
        } else {
          this.getSearchResults(this.searchTerm);
        }
      }

      onFocusOut() {
        setTimeout(() => {
          if (!this.contains(document.activeElement)) this.close();
        });
      }

      onKeyup(event) {
        if (!this.getQuery().length) this.close(true);
        event.preventDefault();

        switch (event.code) {
          case 'ArrowUp':
            this.switchOption('up');
            break;
          case 'ArrowDown':
            this.switchOption('down');
            break;
          case 'Enter':
            this.selectOption();
            break;
        }
      }

      onKeydown(event) {
        // Prevent the cursor from moving in the input when using the up and down arrow keys
        if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
          event.preventDefault();
        }
      }

      updateSearchForTerm(previousTerm, newTerm) {
        const searchForTextElement = this.querySelector(selectors$N.searchForText);
        const currentButtonText = searchForTextElement?.innerText;

        if (currentButtonText) {
          if (currentButtonText.match(new RegExp(previousTerm, 'g'))?.length > 1) {
            // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
            return;
          }
          const newButtonText = currentButtonText.replace(previousTerm, newTerm);
          searchForTextElement.innerText = newButtonText;
        }
      }

      switchOption(direction) {
        if (!this.getAttribute('open')) return;

        const moveUp = direction === 'up';
        const selectedElement = this.querySelector(selectors$N.ariaSelected);

        // Filter out hidden elements (duplicated page and article resources) thanks
        // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
        const allVisibleElements = Array.from(this.querySelectorAll(selectors$N.allVisibleElements)).filter((element) => element.offsetParent !== null);

        let activeElementIndex = 0;

        if (moveUp && !selectedElement) return;

        let selectedElementIndex = -1;
        let i = 0;

        while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
          if (allVisibleElements[i] === selectedElement) {
            selectedElementIndex = i;
          }
          i++;
        }

        this.statusElement.textContent = '';

        if (!moveUp && selectedElement) {
          activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
        } else if (moveUp) {
          activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
        }

        if (activeElementIndex === selectedElementIndex) return;

        const activeElement = allVisibleElements[activeElementIndex];

        activeElement.setAttribute('aria-selected', true);
        if (selectedElement) selectedElement.setAttribute('aria-selected', false);

        this.input.setAttribute('aria-activedescendant', activeElement.id);
      }

      selectOption() {
        const selectedOption = this.querySelector(selectors$N.selectedOption);

        if (selectedOption) selectedOption.click();
      }

      getSearchResults(searchTerm) {
        const queryKey = searchTerm.replace(' ', '-').toLowerCase();
        this.setLiveRegionLoadingState();

        if (this.cachedResults[queryKey]) {
          this.renderSearchResults(this.cachedResults[queryKey]);
          return;
        }

        fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`, {signal: this.abortController.signal})
          .then((response) => {
            if (!response.ok) {
              var error = new Error(response.status);
              this.close();
              throw error;
            }
            return response.text();
          })
          .then((text) => {
            const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$N.sectionPredictiveSearch).innerHTML;
            // Save bandwidth keeping the cache in all instances synced
            this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
              predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
            });
            this.renderSearchResults(resultsMarkup);
          })
          .catch((error) => {
            if (error?.code === 20) {
              // Code 20 means the call was aborted
              return;
            }
            this.close();
            throw error;
          });
      }

      setLiveRegionLoadingState() {
        this.statusElement = this.statusElement || this.querySelector(selectors$N.predictiveSearchStatus);
        this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

        this.setLiveRegionText(this.loadingText);
        this.setAttribute('loading', true);
      }

      setLiveRegionText(statusText) {
        this.statusElement.setAttribute('aria-hidden', 'false');
        this.statusElement.textContent = statusText;

        setTimeout(() => {
          this.statusElement.setAttribute('aria-hidden', 'true');
        }, 1000);
      }

      renderSearchResults(resultsMarkup) {
        this.predictiveSearchResults.innerHTML = resultsMarkup;

        this.setAttribute('results', true);

        this.setLiveRegionResults();
        this.open();
      }

      setLiveRegionResults() {
        this.removeAttribute('loading');
        this.setLiveRegionText(this.querySelector(selectors$N.searchResultsLiveRegion).textContent);
      }

      getResultsMaxHeight() {
        this.resultsMaxHeight = getWindowHeight() - document.querySelector(selectors$N.searchPopdown).getBoundingClientRect().bottom;
        return this.resultsMaxHeight;
      }

      open() {
        this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
        this.setAttribute('open', true);
        this.input.setAttribute('aria-expanded', true);
        this.isOpen = true;
      }

      close(clearSearchTerm = false) {
        this.closeResults(clearSearchTerm);
        this.isOpen = false;
      }

      closeResults(clearSearchTerm = false) {
        if (clearSearchTerm) {
          this.input.value = '';
          this.removeAttribute('results');
        }
        const selected = this.querySelector(selectors$N.ariaSelected);

        if (selected) selected.setAttribute('aria-selected', false);

        this.input.setAttribute('aria-activedescendant', '');
        this.removeAttribute('loading');
        this.removeAttribute('open');
        this.input.setAttribute('aria-expanded', false);
        this.resultsMaxHeight = false;
        this.predictiveSearchResults?.removeAttribute('style');
      }

      reset() {
        this.predictiveSearchResults.innerHTML = '';

        this.input.val = '';
        this.a11y.removeTrapFocus();
      }
    }

    customElements.define('predictive-search', PredictiveSearch);

    const selectors$M = {
      aos: '[data-aos]:not(.aos-animate)',
      aosAnchor: '[data-aos-anchor]',
      aosIndividual: '[data-aos]:not([data-aos-anchor]):not(.aos-animate)',
    };

    const classes$v = {
      aosAnimate: 'aos-animate',
    };

    const observerConfig = {
      attributes: false,
      childList: true,
      subtree: true,
    };

    let anchorContainers = [];

    const mutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const element = mutation.target;
          const elementsToAnimate = element.querySelectorAll(selectors$M.aos);
          const anchors = element.querySelectorAll(selectors$M.aosAnchor);

          if (elementsToAnimate.length) {
            elementsToAnimate.forEach((element) => {
              aosItemObserver.observe(element);
            });
          }

          if (anchors.length) {
            // Get all anchors and attach observers
            initAnchorObservers(anchors);
          }
        }
      }
    };

    /*
      Observe each element that needs to be animated
    */
    const aosItemObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(classes$v.aosAnimate);

            // Stop observing element after it was animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Observe anchor elements
    */
    const aosAnchorObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            const elementsToAnimate = entry.target.querySelectorAll(selectors$M.aos);

            if (elementsToAnimate.length) {
              elementsToAnimate.forEach((item) => {
                item.classList.add(classes$v.aosAnimate);
              });
            }

            // Stop observing anchor element after inner elements were animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Watch for mutations in the body and start observing the newly added animated elements and anchors
    */
    function bodyMutationObserver() {
      const bodyObserver = new MutationObserver(mutationCallback);
      bodyObserver.observe(document.body, observerConfig);
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function elementsIntersectionObserver() {
      const elementsToAnimate = document.querySelectorAll(selectors$M.aosIndividual);

      if (elementsToAnimate.length) {
        elementsToAnimate.forEach((element) => {
          aosItemObserver.observe(element);
        });
      }
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function anchorsIntersectionObserver() {
      const anchors = document.querySelectorAll(selectors$M.aosAnchor);

      if (anchors.length) {
        // Get all anchors and attach observers
        initAnchorObservers(anchors);
      }
    }

    function initAnchorObservers(anchors) {
      if (!anchors.length) return;

      anchors.forEach((anchor) => {
        const containerId = anchor.dataset.aosAnchor;

        // Avoid adding multiple observers to the same element
        if (containerId && anchorContainers.indexOf(containerId) === -1) {
          const container = document.querySelector(containerId);

          if (container) {
            aosAnchorObserver.observe(container);
            anchorContainers.push(containerId);
          }
        }
      });
    }

    function initAnimations() {
      elementsIntersectionObserver();
      anchorsIntersectionObserver();
      bodyMutationObserver();

      // Remove unloaded section from the anchors array on section:unload event
      document.addEventListener('shopify:section:unload', (e) => {
        const sectionId = '#' + e.target.querySelector('[data-section-id]')?.id;
        const sectionIndex = anchorContainers.indexOf(sectionId);

        if (sectionIndex !== -1) {
          anchorContainers.splice(sectionIndex, 1);
        }
      });
    }

    // Safari requestIdleCallback polyfill
    window.requestIdleCallback =
      window.requestIdleCallback ||
      function (cb) {
        var start = Date.now();
        return setTimeout(function () {
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 50 - (Date.now() - start));
            },
          });
        }, 1);
      };
    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id);
      };

    // Animate on scroll
    const showAnimations = document.body.getAttribute('data-animations') === 'true';
    if (showAnimations) {
      initAnimations();
    }

    resizeListener();
    scrollListener();
    isTouch();
    setVars();
    loadedImagesEventHook();

    window.addEventListener('DOMContentLoaded', () => {
      setVarsOnResize();
      floatLabels(document);
      preventOverflow(document);
      ariaToggle(document);
      removeLoadingClassFromLoadedImages(document);

      if (window.fastNetworkAndCPU) {
        preloadImages();
      }
    });

    document.addEventListener('shopify:section:load', (e) => {
      const container = e.target;
      floatLabels(container);
      preventOverflow(container);
      ariaToggle(document);

      document.dispatchEvent(new CustomEvent('theme:header:update', {bubbles: true}));
    });

    document.addEventListener('shopify:section:reorder', () => {
      document.dispatchEvent(new CustomEvent('theme:header:update', {bubbles: true}));
    });

    document.addEventListener('shopify:section:unload', () => {
      // When you hide/disable a section, the unload event is fired before the section is actually removed from the DOM
      // We need a little delay before checking for transparent header to make sure it's already removed from the DOM
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('theme:header:update', {bubbles: true}));
      }, 200);
    });

    (function () {
      function n(n) {
        var i = window.innerWidth || document.documentElement.clientWidth,
          r = window.innerHeight || document.documentElement.clientHeight,
          t = n.getBoundingClientRect();
        return t.top >= 0 && t.bottom <= r && t.left >= 0 && t.right <= i;
      }
      function t(n) {
        var i = window.innerWidth || document.documentElement.clientWidth,
          r = window.innerHeight || document.documentElement.clientHeight,
          t = n.getBoundingClientRect(),
          u = (t.left >= 0 && t.left <= i) || (t.right >= 0 && t.right <= i),
          f = (t.top >= 0 && t.top <= r) || (t.bottom >= 0 && t.bottom <= r);
        return u && f;
      }
      function i(n, i) {
        function r() {
          var r = t(n);
          r != u && ((u = r), typeof i == 'function' && i(r, n));
        }
        var u = t(n);
        window.addEventListener('load', r);
        window.addEventListener('resize', r);
        window.addEventListener('scroll', r);
      }
      function r(t, i) {
        function r() {
          var r = n(t);
          r != u && ((u = r), typeof i == 'function' && i(r, t));
        }
        var u = n(t);
        window.addEventListener('load', r);
        window.addEventListener('resize', r);
        window.addEventListener('scroll', r);
      }
      window.visibilityHelper = {isElementTotallyVisible: n, isElementPartiallyVisible: t, inViewportPartially: i, inViewportTotally: r};
    })();

    const settings$1 = {
      elements: {
        html: 'html',
        body: 'body',
        inPageLink: '[data-skip-content]',
        linksWithOnlyHash: 'a[href="#"]',
        triggerFocusElement: '[data-focus-element]',
      },
      classes: {
        focus: 'is-focused',
      },
    };

    class Accessibility {
      constructor() {
        this.init();
      }

      init() {
        this.settings = settings$1;
        this.window = window;
        this.document = document;
        this.a11y = a11y;

        // DOM Elements
        this.inPageLink = this.document.querySelector(this.settings.elements.inPageLink);
        this.linksWithOnlyHash = this.document.querySelectorAll(this.settings.elements.linksWithOnlyHash);
        this.html = this.document.querySelector(this.settings.elements.html);
        this.body = this.document.querySelector(this.settings.elements.body);
        this.lastFocused = null;

        // Flags
        this.isFocused = false;

        // A11Y init methods
        this.a11y.focusHash();
        this.a11y.bindInPageLinks();

        // Events
        this.clickEvents();
        this.focusEvents();
        this.focusEventsOff();
        this.closeExpandedElements();
      }

      /**
       * Clicked events accessibility
       *
       * @return  {Void}
       */

      clickEvents() {
        if (this.inPageLink) {
          this.inPageLink.addEventListener('click', (event) => {
            event.preventDefault();
          });
        }

        if (this.linksWithOnlyHash) {
          this.linksWithOnlyHash.forEach((item) => {
            item.addEventListener('click', (event) => {
              event.preventDefault();
            });
          });
        }
      }

      /**
       * Focus events
       *
       * @return  {Void}
       */

      focusEvents() {
        this.document.addEventListener('keyup', (event) => {
          if (event.code !== 'Tab') {
            return;
          }

          this.body.classList.add(this.settings.classes.focus);
          this.isFocused = true;
        });

        // Expand modals
        this.document.addEventListener('keyup', (event) => {
          if (!this.isFocused) {
            return;
          }

          const target = event.target;
          const pressEnterOrSpace = event.code === 'Enter' || event.code === 'Space';
          const targetElement = target.matches(this.settings.elements.triggerFocusElement) || target.closest(this.settings.elements.triggerFocusElement);

          if (pressEnterOrSpace && targetElement) {
            if (this.lastFocused === null) {
              this.lastFocused = target;
            }
          }
        });

        // Focus addToCart button or quickview button
        this.html.addEventListener('theme:cart:add', (event) => {
          this.lastFocused = event.detail.selector;
        });
      }

      /**
       * Focus events off
       *
       * @return  {Void}
       */

      focusEventsOff() {
        this.document.addEventListener('mousedown', () => {
          this.body.classList.remove(this.settings.classes.focus);
          this.isFocused = false;
        });
      }

      /**
       * Close expanded elements with when press escape
       *
       * @return  {Void}
       */

      closeExpandedElements() {
        document.addEventListener('keyup', (event) => {
          if (event.code !== 'Escape') {
            return;
          }

          this.a11y.removeTrapFocus();

          if (this.lastFocused !== null) {
            setTimeout(() => {
              this.lastFocused.focus();
              this.lastFocused = null;
            }, 600);
          }
        });
      }
    }

    window.accessibility = new Accessibility();

    const selectors$L = {
      accordion: '[data-accordion]',
      trigger: '[data-accordion-trigger]',
      body: '[data-accordion-body]',
      content: '[data-accordion-content]',
      focusable: 'input, button, a',
    };

    const attributes$a = {
      open: 'open',
      single: 'single',
    };

    class AccordionElements extends HTMLElement {
      constructor() {
        super();

        this.accordions = this.querySelectorAll(selectors$L.accordion);
      }

      connectedCallback() {
        this.accordions.forEach((accordion) => {
          const trigger = accordion.querySelector(selectors$L.trigger);
          const body = accordion.querySelector(selectors$L.body);

          trigger.addEventListener('click', (event) => this.onCollapsibleClick(event));

          body.addEventListener('transitionend', (event) => {
            if (event.target !== body) return;

            if (accordion.getAttribute(attributes$a.open) == 'true') {
              this.setBodyHeight(body, 'auto');

              // Focus on the first focusable element in the details tag
              accordion.querySelector(selectors$L.focusable)?.focus();
            }

            if (accordion.getAttribute(attributes$a.open) == 'false') {
              accordion.removeAttribute(attributes$a.open);
              this.setBodyHeight(body, '');
            }
          });
        });

        this.addEventListener('keyup', (event) => this.onKeyUp(event));
      }

      open(accordion) {
        if (accordion.getAttribute('open') == 'true') return;

        const body = accordion.querySelector(selectors$L.body);
        const content = accordion.querySelector(selectors$L.content);

        accordion.setAttribute('open', true);

        this.setBodyHeight(body, content.offsetHeight);
      }

      close(accordion) {
        if (!accordion.hasAttribute('open')) return;

        const body = accordion.querySelector(selectors$L.body);
        const content = accordion.querySelector(selectors$L.content);

        this.setBodyHeight(body, content.offsetHeight);

        accordion.setAttribute('open', false);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.setBodyHeight(body, 0);
          });
        });
      }

      setBodyHeight(body, contentHeight) {
        body.style.height = contentHeight !== 'auto' && contentHeight !== '' ? `${contentHeight}px` : contentHeight;
      }

      onCollapsibleClick(event) {
        event.preventDefault();

        const accordion = event.target.closest(selectors$L.accordion);
        const single = this.hasAttribute(attributes$a.single);

        // When we want only one item expanded at the same time
        if (single) {
          this.accordions.forEach((otherCollapsible) => {
            // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
            if (otherCollapsible.hasAttribute(attributes$a.open) && otherCollapsible != accordion) {
              requestAnimationFrame(() => {
                this.close(otherCollapsible);
              });
            }
          });
        }

        if (accordion.hasAttribute(attributes$a.open)) {
          this.close(accordion);
        } else {
          this.open(accordion);
        }
      }

      onKeyUp(event) {
        const accordion = this.querySelector('details[open]');

        if (event.code == 'Escape' && accordion) {
          accordion.querySelector('summary').dispatchEvent(new Event('click'));
        }
      }
    }

    if (!customElements.get('accordion-elements')) {
      customElements.define('accordion-elements', AccordionElements);
    }

    const slideUp = (target, duration = 500) => {
      target.style.transitionProperty = 'all';
      target.style.transitionDuration = duration + 'ms';
      target.style.boxSizing = 'border-box';
      target.style.height = target.offsetHeight + 'px';
      target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      window.setTimeout(() => {
        target.style.display = 'none';
        target.style.removeProperty('height');
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
      }, duration);
    };

    const slideDown = (target, duration = 500, checkHidden = true) => {
      let display = window.getComputedStyle(target).display;
      if (checkHidden && display !== 'none') {
        return;
      }
      target.style.removeProperty('display');
      if (display === 'none') {
        display = 'block';
      }
      target.style.display = display;
      let height = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      target.offsetHeight;
      target.style.boxSizing = 'border-box';
      target.style.transitionProperty = 'all';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = height + 'px';
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      window.setTimeout(() => {
        target.style.removeProperty('height');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
      }, duration);
    };

    function FetchError(object) {
      this.status = object.status || null;
      this.headers = object.headers || null;
      this.json = object.json || null;
      this.body = object.body || null;
    }
    FetchError.prototype = Error.prototype;

    function subscribe(eventName, callback) {
      if (window.theme.subscribers[eventName] === undefined) {
        window.theme.subscribers[eventName] = [];
      }

      window.theme.subscribers[eventName] = [...window.theme.subscribers[eventName], callback];

      return function unsubscribe() {
        window.theme.subscribers[eventName] = window.theme.subscribers[eventName].filter((cb) => {
          return cb !== callback;
        });
      };
    }

    function publish(eventName, data) {
      if (window.theme.subscribers[eventName]) {
        window.theme.subscribers[eventName].forEach((callback) => {
          callback(data);
        });
      }
    }

    const selectors$K = {
      quantityHolder: '[data-quantity-holder]',
      quantityField: '[data-quantity-field]',
      quantityButton: '[data-quantity-button]',
      quantityMinusButton: '[data-quantity-minus]',
      quantityPlusButton: '[data-quantity-plus]',
      quantityReadOnly: 'read-only',
      isDisabled: 'is-disabled',
    };

    class QuantityCounter {
      constructor(holder, inCart = false) {
        this.holder = holder;
        this.quantityUpdateCart = inCart;
      }

      init() {
        // Settings
        this.settings = selectors$K;

        // DOM Elements
        this.quantity = this.holder.querySelector(this.settings.quantityHolder);
        this.field = this.quantity.querySelector(this.settings.quantityField);
        this.buttons = this.quantity.querySelectorAll(this.settings.quantityButton);
        this.increaseButton = this.quantity.querySelector(this.settings.quantityPlusButton);

        // Set value or classes
        this.quantityValue = Number(this.field.value || 0);
        this.cartItemID = this.field.getAttribute('data-id');
        this.maxValue = Number(this.field.getAttribute('max')) > 0 ? Number(this.field.getAttribute('max')) : null;
        this.minValue = Number(this.field.getAttribute('min')) > 0 ? Number(this.field.getAttribute('min')) : 0;
        this.disableIncrease = this.disableIncrease.bind(this);

        // Methods
        this.updateQuantity = this.updateQuantity.bind(this);
        this.decrease = this.decrease.bind(this);
        this.increase = this.increase.bind(this);

        this.disableIncrease();

        // Events
        if (!this.quantity.classList.contains(this.settings.quantityReadOnly)) {
          this.changeValueOnClick();
          this.changeValueOnInput();
        }
      }

      /**
       * Change field value when click on quantity buttons
       *
       * @return  {Void}
       */

      changeValueOnClick() {
        const that = this;

        this.buttons.forEach((element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();

            this.quantityValue = Number(this.field.value || 0);

            const clickedElement = event.target;
            const isDescrease = clickedElement.matches(that.settings.quantityMinusButton) || clickedElement.closest(that.settings.quantityMinusButton);
            const isIncrease = clickedElement.matches(that.settings.quantityPlusButton) || clickedElement.closest(that.settings.quantityPlusButton);

            if (isDescrease) {
              that.decrease();
            }

            if (isIncrease) {
              that.increase();
            }

            that.updateQuantity();
          });
        });
      }

      /**
       * Change field value when input new value in a field
       *
       * @return  {Void}
       */

      changeValueOnInput() {
        this.field.addEventListener('input', () => {
          this.quantityValue = this.field.value;
          this.updateQuantity();
        });
      }

      /**
       * Update field value
       *
       * @return  {Void}
       */

      updateQuantity() {
        if (this.maxValue < this.quantityValue && this.maxValue !== null) {
          this.quantityValue = this.maxValue;
        }

        if (this.minValue > this.quantityValue) {
          this.quantityValue = this.minValue;
        }

        this.field.value = this.quantityValue;

        this.disableIncrease();

        document.dispatchEvent(new CustomEvent('theme:popout:update'));

        if (this.quantityUpdateCart) {
          this.updateCart();
        }
      }

      /**
       * Decrease value
       *
       * @return  {Void}
       */

      decrease() {
        if (this.quantityValue > this.minValue) {
          this.quantityValue--;

          return;
        }

        this.quantityValue = 0;
      }

      /**
       * Increase value
       *
       * @return  {Void}
       */

      increase() {
        this.quantityValue++;
      }

      /**
       * Disable increase
       *
       * @return  {[type]}  [return description]
       */

      disableIncrease() {
        this.increaseButton.classList.toggle(this.settings.isDisabled, this.quantityValue >= this.maxValue && this.maxValue !== null);
      }

      /**
       * Update cart
       *
       * @return  {Void}
       */

      updateCart() {
        if (this.quantityValue === '') return;

        const event = new CustomEvent('theme:cart:update', {
          bubbles: true,
          detail: {
            id: this.cartItemID,
            quantity: this.quantityValue,
          },
        });

        this.holder.dispatchEvent(event);
      }
    }

    const events$2 = {
      cartUpdate: 'cart-update',
      cartError: 'cart-error',
    };

    const settings = {
      dimensions: {
        maxSize: 100,
      },
      times: {
        timeoutAddProduct: 1000,
        closeDropdownAfter: 5000,
      },
      classes: {
        template: 'template-cart',
        hidden: 'is-hidden',
        cartVisible: 'cart--is-visible',
        open: 'is-open',
        focused: 'is-focused',
        visible: 'is-visible',
        loading: 'is-loading',
        disabled: 'is-disabled',
        success: 'product__form-submit--success',
        defaultSuccess: 'is-success',
        cartEmpty: 'cartToggle--empty',
        isAdded: 'is-added',
      },
      attributes: {
        expanded: 'aria-expanded',
        disabled: 'disabled',
        dataId: 'data-id',
        cartTotalPrice: 'data-cart-total-price',
        freeMessageLimit: 'data-limit',
        hideErrors: 'data-hide-errors',
      },
      elements: {
        apiContent: '[data-api-content]',
        html: 'html',
        button: 'button',
        buttonAddToCart: '[data-add-to-cart]',
        buttonAddToCartText: '[data-add-to-cart-text]',
        buttonHolder: '[data-foot-holder]',
        buttonUpdateCart: '[data-update-cart]',
        cart: '[data-cart]',
        cartScroll: '[data-cart-scroll]',
        cartContainer: '[data-cart-container]',
        cartTemplate: '[data-cart-template]',
        cartToggleElement: '[data-cart-toggle]',
        cartClose: '[data-cart-close]',
        cartItemRemove: '[data-item-remove]',
        cartItemsCount: '[data-cart-items-count]',
        cartTotal: '[data-cart-total]',
        cartErrors: '[data-cart-errors]',
        cartCloseError: '[data-cart-error-close]',
        cartOriginalTotal: '[data-cart-original-total]',
        cartOriginaTotalPrice: '[data-cart-original-total-price]',
        cartDiscountsHolder: '[data-cart-discounts-holder]',
        cartAcceptanceCheckbox: '[data-cart-acceptance-checkbox]',
        cartButtons: '[data-cart-buttons]',
        cartButtonsFieldset: '[data-cart-buttons-fieldset]',
        cartFormError: '[data-cart-error]',
        cartMessage: 'data-cart-message',
        cartMessageItem: '[data-cart-message]',
        cartProgress: '[data-cart-progress]',
        continueBtn: '[data-continue]',
        emptyMessage: '[data-empty-message]',
        errorMessage: '[data-error-message]',
        input: 'input',
        item: '[data-item]',
        itemsHolder: '[data-items-holder]',
        leftToSpend: '[data-left-to-spend]',
        popover: '[data-popover]',
        popoverTemplate: '[data-popover-template]',
        popoverHeading: '[data-popover-heading]',
        popoverImage: '[data-popover-image]',
        popoverTitle: '[data-popover-title]',
        popoverVariant: '[data-popover-variant]',
        popoverSellingPlan: '[data-popover-selling-plan]',
        popoverItemProps: '[data-popover-item-props]',
        popoverItemPrice: '[data-popover-item-price]',
        popoverItemUnitPrice: '[data-popover-unit-price]',
        qty: '[data-quantity-field]',
        quickAddHolder: '[data-quick-add-holder]',
        cartDiscountTitle: '[data-cart-discount-title]',
        cartDiscountPrice: '[data-cart-discount-price]',
      },
      cartTotalDiscountsTemplate: '[data-cart-total-discount]',
    };

    class CartDrawer {
      constructor() {
        if (window.location.pathname === '/password') {
          return;
        }

        this.init();
      }

      init() {
        // DOM Elements
        this.html = document.querySelector(settings.elements.html);
        this.body = document.body;

        this.defineSelectors();
        this.accessibility = a11y;
        this.ajaxEnabled = theme.settings.enableAjaxCart;
        this.popoverTimer = '';
        this.scrollLockTimeout = 0;
        this.cartFocusTimeout = 0;
        this.form = null;
        this.cartItemsCount = document.querySelector(settings.elements.cartItemsCount);
        this.hideErrors = false;

        // Flags
        this.cartDrawerIsOpen = false;
        this.cartDiscounts = 0;
        this.cartLimitErrorIsHidden = true;

        // Cart events
        this.openCartDrawer = this.openCartDrawer.bind(this);
        this.closeCartDrawer = this.closeCartDrawer.bind(this);
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.cartKeyUpEvent = this.cartKeyUpEvent.bind(this);

        if (this.ajaxEnabled) {
          this.eventToggleCart();
        }

        this.initDefaultCartEvents();
        this.addProductEvent();
      }

      /**
       * Render cart and define all elements after cart drawer is open for a first time
       *
       * @return  {Void}
       */
      renderCart() {
        // Append cart template html to the cart drawer
        this.cartContainer.innerHTML = document.querySelector(settings.elements.cartTemplate).innerHTML;
        this.totalItems = this.items.length;

        this.defineSelectors();
        this.initDefaultCartEvents();

        this.getCart();
      }

      /**
       * Define cart selectors
       *
       * @return  {Void}
       */
      defineSelectors() {
        this.cartContainer = document.querySelector(settings.elements.cartContainer);
        this.cartTemplate = document.querySelector(settings.elements.cartTemplate);
        this.popover = document.querySelector(settings.elements.popover);
        this.popoverTemplate = document.querySelector(settings.elements.popoverTemplate);
        this.cart = document.querySelector(settings.elements.cart);
        this.cartScroll = document.querySelector(settings.elements.cartScroll);
        this.emptyMessage = document.querySelector(settings.elements.emptyMessage);
        this.buttonHolder = document.querySelector(settings.elements.buttonHolder);
        this.itemsHolder = document.querySelector(settings.elements.itemsHolder);
        this.items = document.querySelectorAll(settings.elements.item);
        this.cartToggle = document.querySelector(settings.elements.cartToggleElement);
        this.continueBtns = document.querySelectorAll(settings.elements.continueBtn);
        this.cartTotal = document.querySelector(settings.elements.cartTotal);
        this.cartOriginalTotal = document.querySelector(settings.elements.cartOriginalTotal);
        this.cartOriginaTotalPrice = document.querySelector(settings.elements.cartOriginaTotalPrice);
        this.cartDiscountHolder = document.querySelector(settings.elements.cartDiscountsHolder);
        this.cartTotalDiscountTemplate = document.querySelector(settings.cartTotalDiscountsTemplate).innerHTML;
        this.cartErrorHolder = document.querySelector(settings.elements.cartErrors);
        this.cartClose = document.querySelector(settings.elements.cartClose);
        this.cartCloseErrorMessage = document.querySelector(settings.elements.cartCloseError);
        this.cartAcceptanceCheckbox = document.querySelector(settings.elements.cartAcceptanceCheckbox);
        this.cartMessage = document.querySelector(`[${settings.elements.cartMessage}]`);
        this.leftToSpend = document.querySelectorAll(settings.elements.leftToSpend);
      }

      /**
       * Init default cart events
       *
       * @return  {Void}
       */
      initDefaultCartEvents() {
        // Cart Events
        if (this.ajaxEnabled) {
          this.cartEvents();
          this.customEventAddProduct();
        } else if (this.items.length) {
          this.noAjaxUpdate();
        }

        // Init quantity for fields
        this.initQuantity(this.ajaxEnabled);

        if (this.cartMessage) {
          this.cartFreeLimitShipping = Number(this.cartMessage.getAttribute(settings.attributes.freeMessageLimit)) * window.Shopify.currency.rate;
          this.subtotal = Number(this.cartMessage.getAttribute(settings.attributes.cartTotalPrice));
          this.cartBarProgress();
          this.updateProgress();
        }
      }

      /**
       * Init quantity field functionality
       *
       * @return  {Void}
       */

      initQuantity(ajax) {
        this.items = document.querySelectorAll(settings.elements.item);

        this.items.forEach((item) => {
          const initQuantity = new QuantityCounter(item, true);

          initQuantity.init();
          if (ajax) {
            this.customEventsHandle(item);
          }
        });
      }

      noAjaxUpdate() {
        const updateBtn = this.buttonHolder.querySelector(settings.elements.buttonUpdateCart);
        updateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.items.forEach((item) => {
            const qty = item.querySelector(`input[${settings.attributes.dataId}]`);
            this.updateCart({
              id: qty.getAttribute(settings.attributes.dataId),
              quantity: qty.value,
            });
          });
        });
      }

      /**
       * Custom event who change the cart
       *
       * @return  {Void}
       */

      customEventsHandle(holder) {
        holder.addEventListener(
          'theme:cart:update',
          debounce((event) => {
            this.updateCart(
              {
                id: event.detail.id,
                quantity: event.detail.quantity,
              },
              holder,
              event.detail.valueIsEmpty
            );
          }, 500)
        );
      }

      /**
       *  Custom event for add product to the cart
       */
      customEventAddProduct() {
        document.addEventListener(
          'theme:cart:add',
          debounce((event) => {
            this.cartToggle.classList.add(settings.classes.isAdded);
            setTimeout(() => {
              this.cartToggle.classList.remove(settings.classes.isAdded);
            }, 800);
          }, 500)
        );
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartEvents() {
        const cartItemRemove = document.querySelectorAll(settings.elements.cartItemRemove);

        if (cartItemRemove) {
          cartItemRemove.forEach((item) => {
            item.addEventListener('click', (event) => {
              event.preventDefault();
              event.target.closest(settings.elements.item).classList.add(settings.classes.loading);

              this.updateCart({
                id: item.getAttribute(settings.attributes.dataId),
                quantity: 0,
              });
            });
          });
        }

        if (this.cartCloseErrorMessage) {
          this.cartCloseErrorMessage.addEventListener('click', (event) => {
            event.preventDefault();

            slideUp(this.cartErrorHolder, 400);
          });
        }

        // Continue Shopping Button
        if (this.continueBtns) {
          this.continueBtns.forEach((continueBtn) => {
            continueBtn.addEventListener('click', (e) => {
              const referrer = document.referrer;
              const origin = window.location.origin + '/';
              const isDesktop = window.innerWidth >= theme.sizes.small;

              e.preventDefault();

              if (isDesktop && !(window.location.href.indexOf('/cart') > -1)) {
                this.closeCartDrawer();
              } else if (referrer === origin) {
                window.location.href = theme.routes.root;
              } else {
                history.back(1);
              }
            });
          });
        }

        // Close Cart Button
        if (this.cartClose) {
          this.cartClose.addEventListener('click', this.closeCartDrawer);
        }

        // Esc key close cart dropdown and popover
        if (this.cartContainer) {
          this.cartContainer.addEventListener('keyup', this.cartKeyUpEvent);
        }

        // Terms and conditions checkbox listener
        if (this.cartAcceptanceCheckbox) {
          this.cart.addEventListener('click', (event) => {
            const clickedElement = event.target;
            const isCartButtons = clickedElement.matches(settings.elements.cartButtons) || clickedElement.closest(settings.elements.cartButtons);
            if (isCartButtons) {
              this.termsAcceptance(event);
            }
          });
          this.cartAcceptanceCheckbox.addEventListener('change', (event) => this.termsAcceptance(event));

          if (this.cartAcceptanceCheckbox.checked === false) {
            this.cart.querySelector(settings.elements.cartButtonsFieldset).setAttribute(settings.attributes.disabled, true);
          }
        }
      }

      cartKeyUpEvent(e) {
        const key = e.code;

        if (key === 'Escape' && this.cartDrawerIsOpen) {
          this.closeCartDrawer();
          this.popoverHide();
        }
      }

      /**
       * Disable checkout if terms not accepted
       *
       * @return  {Void}
       */

      termsAcceptance(event) {
        const termsNotAccepted = this.cartAcceptanceCheckbox.checked === false;
        const cartFormError = this.cart.querySelector(settings.elements.cartFormError);
        const cartButtonsFieldset = this.cart.querySelector(settings.elements.cartButtonsFieldset);

        // Disable form submit if terms and conditions are not accepted
        if (termsNotAccepted) {
          event.preventDefault();
          cartButtonsFieldset.setAttribute(settings.attributes.disabled, true);
          slideDown(cartFormError);
        } else {
          cartButtonsFieldset.removeAttribute(settings.attributes.disabled);
          slideUp(cartFormError);
        }
      }

      /**
       * Cart Popover
       *
       * @return  {Void}
       */

      renderPopover(product, qty) {
        const stripHtmlRegex = /(<([^>]+)>)/gi;
        const productTitle = product.title.replace(stripHtmlRegex, '');
        let price = product.final_price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(product.final_price, theme.settings.moneyFormat);
        let prodImg = theme.assets.no_image;
        let unitPrice = '';
        const sellingPlanName = product.selling_plan_allocation ? product.selling_plan_allocation.selling_plan.name : null;
        let properties = '';

        // Unit price
        if (product.unit_price_measurement) {
          unitPrice = `${themeCurrency.formatMoney(product.unit_price, theme.moneyWithoutCurrencyFormat)} / `;
          if (product.unit_price_measurement.reference_value != 1) {
            unitPrice += product.unit_price_measurement.reference_value;
          }
          unitPrice += product.unit_price_measurement.reference_unit;
        }

        // Product image
        if (product.featured_image != null) {
          prodImg = product.featured_image.url;
        }

        // Properties
        if (product.properties) {
          for (const property in product.properties) {
            if ({}.hasOwnProperty.call(product.properties, property)) {
              const propValue = product.properties[property];
              const propFirstChar = property.slice(0, 1);

              if (propValue && propFirstChar !== '_') {
                properties += '<p>' + property + ': ' + product.properties[property] + '</p>';
              }
            }
          }
        }

        const templateContent = document.importNode(this.popoverTemplate.content, true);
        const heading = templateContent.querySelector(settings.elements.popoverHeading);
        const image = templateContent.querySelector(settings.elements.popoverImage);
        const title = templateContent.querySelector(settings.elements.popoverTitle);
        const variant = templateContent.querySelector(settings.elements.popoverVariant);
        const sellingPlanElement = templateContent.querySelector(settings.elements.popoverSellingPlan);
        const itemProperties = templateContent.querySelector(settings.elements.popoverItemProps);
        const itemPrice = templateContent.querySelector(settings.elements.popoverItemPrice);
        const itemUnitPrice = templateContent.querySelector(settings.elements.popoverItemUnitPrice);

        heading.innerHTML = `(${qty}) ${productTitle} ${heading.innerHTML}`;

        const imgElement = document.createElement('img');
        imgElement.src = `${prodImg}&width=240`;
        imgElement.alt = productTitle;
        imgElement.width = 120;
        imgElement.height = 120;
        imgElement.sizes = '120px';
        imgElement.srcset = `${prodImg}&width=120 1x, ${prodImg}&width=180 1.5x, ${prodImg}&width=240 2x`;
        image.appendChild(imgElement);

        title.innerHTML = productTitle;
        variant.innerHTML = product.product_has_only_default_variant ? '' : product.variant_title;
        sellingPlanElement.innerHTML = sellingPlanName ? sellingPlanName : '';
        itemProperties.innerHTML = properties;
        itemPrice.innerHTML = price;
        itemUnitPrice.innerHTML = unitPrice;

        const tempElement = document.createElement('div');
        tempElement.appendChild(templateContent);
        const templateContentReplaced = tempElement.innerHTML;
        tempElement.remove();

        return templateContentReplaced;
      }

      popoverShow(product, quantity) {
        this.popover.innerHTML = this.renderPopover(product, quantity);
        this.popover.classList.add(settings.classes.visible);

        // clear popover timer, set at top of Cart object
        clearTimeout(this.popoverTimer);

        // set a new instance of popoverTimer
        this.popoverTimer = setTimeout(() => {
          this.popoverHide();
        }, settings.times.closeDropdownAfter);
      }

      popoverHide() {
        this.popover.classList.remove(settings.classes.visible);
        setTimeout(() => {
          this.popover.innerHtml = '';
        }, 300);
      }

      /**
       * Cart event add product to cart
       *
       * @return  {Void}
       */

      addProductEvent() {
        document.addEventListener('click', (event) => {
          if (event.target.matches(settings.elements.buttonAddToCart)) {
            event.preventDefault();
            const button = event.target;

            if (button.hasAttribute(settings.attributes.disabled)) {
              return;
            }

            button.setAttribute(settings.attributes.disabled, true);
            this.form = button.closest('form');
            this.hideErrors = this.form?.getAttribute(settings.attributes.hideErrors) === 'true';
            const quantity = this.form.querySelector(settings.elements.qty).value;
            const formData = new FormData(this.form);

            if (this.form.querySelector('[type="file"]')) {
              return;
            }

            this.addToCart(formData, null, button, quantity);

            document.dispatchEvent(
              new CustomEvent('theme:cart:add', {
                bubbles: true,
                detail: {
                  selector: button,
                },
              })
            );
          }
        });
      }

      /**
       * Get response from the cart
       *
       * @return  {Void}
       */

      getCart() {
        fetch(theme.routes.root + 'cart.js')
          .then(this.handleErrors)
          .then((response) => response.json())
          .then((response) => {
            this.updateCounter(response.item_count);

            if (this.cart !== null) {
              this.newTotalItems = response.items.length;

              this.buildTotalPrice(response);
              this.freeShippingMessageHandle(response.total_price);
              this.subtotal = response.total_price;
            }

            return fetch(theme.routes.cart_url + '?section_id=api-cart-items');
          })
          .then((response) => response.text())
          .then((response) => {
            this.build(response);

            // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
            if (this.cartMessage) {
              this.updateProgress();
            }
          })
          .catch((error) => console.log(error));
      }

      /**
       * Add item(s) to the cart and show the added item(s)
       *
       * @param   {String}  data
       * @param   {DOM Element}  quickAddHolder
       * @param   {DOM Element}  button
       *
       * @return  {Void}
       */

      addToCart(data, quickAddHolder = null, button = null, quantity = 1) {
        const variantId = data.get('id');

        fetch(theme.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/javascript',
          },
          body: data,
        })
          .then((response) => response.json())
          .then((response) => {
            let error = false;

            if (response.status) {
              publish(events$2.cartError, {source: 'product-form', productVariantId: variantId, errors: response.description, message: response.message});

              if (quickAddHolder !== null) {
                this.addToCartError(response, quickAddHolder.element, button);
              } else {
                this.addToCartError(response, null, button);
              }

              if (this.hideErrors && button !== null) {
                button.removeAttribute(settings.attributes.disabled);
              }

              error = true;
              this.hideErrors = false;

              return;
            }

            if (!error) {
              publish(events$2.cartUpdate, {source: 'product-form', productVariantId: variantId});
            }

            if (this.ajaxEnabled) {
              this.cart !== null ? this.getCart() : this.renderCart();

              if (button) {
                button.classList.remove(settings.classes.loading);
                button.classList.add(settings.classes.success);
              }

              setTimeout(() => {
                if (button !== null) {
                  button.removeAttribute(settings.attributes.disabled);
                  button.classList.remove(settings.classes.success);
                }

                const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

                if (windowWidth >= theme.sizes.mobile) {
                  this.popoverShow(response, quantity);
                }
              }, settings.times.timeoutAddProduct);
            } else {
              window.location.href = theme.routes.cart_url;
            }
          })
          .catch((error) => console.log(error));
      }

      /**
       * Update cart
       *
       * @param   {Object}  updateData
       *
       * @return  {Void}
       */

      updateCart(updateData = {}, holder = null, valueIsEmpty = false) {
        let newCount = null;
        let oldCount = null;
        let newItem = null;
        let settedQuantity = updateData.quantity;

        if (holder !== null) {
          holder.closest(settings.elements.item).classList.add(settings.classes.loading);
        }

        this.items.forEach((item) => {
          item.classList.add(settings.classes.disabled);
          item.querySelector(settings.elements.input).setAttribute(settings.attributes.disabled, true);
          item.querySelector(settings.elements.input).blur();
          item.querySelectorAll(settings.elements.button).forEach((button) => {
            button.setAttribute(settings.attributes.disabled, true);
          });
        });

        fetch(theme.routes.root + 'cart.js')
          .then(this.handleErrors)
          .then((response) => response.json())
          .then((response) => {
            const matchKeys = (item) => item.key === updateData.id;
            const index = response.items.findIndex(matchKeys);
            oldCount = response.item_count;
            newItem = response.items[index].title;

            const data = {
              line: `${index + 1}`,
              quantity: settedQuantity,
            };

            return fetch(theme.routes.root + 'cart/change.js', {
              method: 'post',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data),
            });
          })
          .then(this.handleErrors)
          .then((response) => response.json())
          .then((response) => {
            newCount = response.item_count;

            if (valueIsEmpty) {
              settedQuantity = 1;
            }

            if (this.ajaxEnabled) {
              if (settedQuantity !== 0) {
                this.cartLimitErrorIsHidden = newCount !== oldCount;

                this.toggleLimitError(newItem);
              } else {
                this.cartLimitErrorIsHidden = true;
                this.toggleLimitError();
              }

              this.updateCounter(newCount);

              // Change the cart total and hide message if missing discounts and the changed product is not deleted
              this.buildTotalPrice(response);
              this.freeShippingMessageHandle(response.total_price);
              this.cartDiscounts = response.total_discount;

              // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
              if (this.cartMessage) {
                this.subtotal = response.total_price;
                this.updateProgress();
              }

              this.getCart();
            } else {
              const form = this.buttonHolder.closest('form');
              response.items.forEach((item) => {
                if (item.key === updateData.id) {
                  form.querySelector(`[${settings.attributes.dataId}="${item.key}"]`).value = item.quantity;
                }
              });
              form.submit();
            }
          })
          .catch((error) => {
            console.log(error);

            this.cartLimitErrorIsHidden = false;
            this.toggleLimitError(error.json.message);
            this.resetItems();
          });
      }

      resetItems() {
        this.items.forEach((item) => {
          const input = item.querySelector(settings.elements.input);
          const qty = input.getAttribute('value');
          input.removeAttribute(settings.attributes.disabled);
          input.value = qty;

          item.classList.remove(settings.classes.disabled, settings.classes.loading);
          item.querySelectorAll(settings.elements.button).forEach((button) => {
            button.removeAttribute(settings.attributes.disabled);
          });
        });
      }

      /**
       * Show/hide limit error
       *
       * @param   {String}  itemTitle
       *
       * @return  {Void}
       */

      toggleLimitError(itemTitle = '') {
        this.cartErrorHolder.querySelector(settings.elements.errorMessage).innerText = itemTitle;

        if (this.cartLimitErrorIsHidden) {
          slideUp(this.cartErrorHolder, 400);
        } else {
          slideDown(this.cartErrorHolder, 400);
        }
      }

      /**
       * Handle errors
       *
       * @param   {Object}  response
       *
       * @return  {Object}
       */

      handleErrors(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      /**
       * Add to cart error handle
       *
       * @param   {Object}  data
       * @param   {DOM Element/Null} quickAddHolder
       * @param   {DOM Element/Null} button
       *
       * @return  {Void}
       */

      addToCartError(data, quickAddHolder, button) {
        if (!this.ajaxEnabled || this.hideErrors) {
          return;
        }
        let errorContainer = this.popover;

        if (button !== null) {
          const addToCartText = button.querySelector(settings.elements.buttonAddToCartText);
          addToCartText.textContent = theme.translations.form_submit_error;
          button.setAttribute(settings.attributes.disabled, settings.attributes.disabled);

          setTimeout(() => {
            button.removeAttribute(settings.attributes.disabled);
            addToCartText.textContent = theme.translations.form_submit; // swap it back
          }, 1000);
        }

        clearTimeout(this.popoverTimer);

        if (errorContainer) {
          errorContainer.innerHTML = `<div class="popover-error">${data.message}: ${data.description}</div>`;

          errorContainer.classList.add(settings.classes.visible);
        }

        if (quickAddHolder) {
          this.html.dispatchEvent(
            new CustomEvent('theme:cart:add-error', {
              bubbles: true,
              detail: {
                message: data.message,
                description: data.description,
                holder: quickAddHolder,
              },
            })
          );
        }

        this.popoverTimer = setTimeout(() => {
          errorContainer.classList.remove(settings.classes.visible);
        }, settings.times.closeDropdownAfter);
      }

      /**
       * Open cart dropdown and add class on body
       *
       * @return  {Void}
       */

      openCartDrawer() {
        this.popoverHide();

        if (this.cart === null) {
          this.renderCart();
        }

        document.dispatchEvent(
          new CustomEvent('theme:drawer:close', {
            bubbles: false,
          })
        );

        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartScroll}));

        this.setCartClosePosition();
        this.body.classList.add(settings.classes.cartVisible);
        this.cart.classList.add(settings.classes.open);
        this.cartToggle.setAttribute(settings.attributes.expanded, true);
        this.accessibility.removeTrapFocus();
        this.cartDrawerIsOpen = true;

        // Reset cart focus timeout
        if (this.cartFocusTimeout) {
          clearTimeout(this.cartFocusTimeout);
        }

        // Focus first clickable element after drawer animation completes
        this.cartFocusTimeout = setTimeout(() => {
          this.accessibility.trapFocus(this.cart, {
            elementToFocus: this.cart.querySelector('a, button, input'),
          });
        }, 500);
      }

      /**
       * Close cart dropdown and remove class on body
       *
       * @return  {Void}
       */

      closeCartDrawer() {
        this.cartDrawerIsOpen = false;
        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:close', {
            bubbles: true,
          })
        );

        this.accessibility.removeTrapFocus();

        slideUp(this.cartErrorHolder, 400);

        if (this.body.classList.contains(settings.classes.focused)) {
          const button = document.querySelector(`${settings.elements.cartToggleElement}`);

          setTimeout(() => {
            button.focus();
          }, 200);
        }

        this.body.classList.remove(settings.classes.cartVisible);
        this.cart.classList.remove(settings.classes.open);
        this.cartToggle.setAttribute(settings.attributes.expanded, false);
        this.popoverHide();

        if (this.scrollLockTimeout) {
          clearTimeout(this.scrollLockTimeout);
        }

        // Unlock body scroll after animation completed to prevent content shifting
        this.scrollLockTimeout = setTimeout(() => {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }, 500);
      }

      /**
       * Toggle cart dropdown
       *
       * @return  {Void}
       */

      toggleCartDrawer() {
        if (this.body.classList.contains(settings.classes.template)) {
          return;
        }

        this.cartDrawerIsOpen ? this.closeCartDrawer() : this.openCartDrawer();
      }

      /**
       * Event click to element to open cart dropdown
       *
       * @return  {Void}
       */

      eventToggleCart() {
        document.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isCartToggle = clickedElement.matches(settings.elements.cartToggleElement) || clickedElement.closest(settings.elements.cartToggleElement);
          const isPopover = clickedElement.matches(settings.elements.popover) || clickedElement.closest(settings.elements.popover);

          if (isCartToggle || isPopover) {
            this.toggleCartDrawer();
            event.preventDefault();
          }
        });
      }

      /**
       * Toggle classes on different containers and messages
       *
       * @return  {Void}
       */

      toggleClassesOnContainers() {
        this.emptyMessage.classList.toggle(settings.classes.hidden, this.hasItemsInCart());
        this.buttonHolder.classList.toggle(settings.classes.hidden, !this.hasItemsInCart());
        this.itemsHolder.classList.toggle(settings.classes.hidden, !this.hasItemsInCart());
      }

      /**
       * Build cart depends on results
       *
       * @param   {Object}  data
       *
       * @return  {Void}
       */

      build(data) {
        if (this.cart === null) {
          this.renderCart();
          return;
        }

        if (this.totalItems !== this.newTotalItems) {
          this.totalItems = this.newTotalItems;

          this.toggleClassesOnContainers();
        }

        const fresh = document.createElement('div');
        fresh.innerHTML = data;
        this.itemsHolder.innerHTML = fresh.querySelector(settings.elements.apiContent).innerHTML;

        this.cartEvents();
        this.initQuantity(this.ajaxEnabled);
      }

      /**
       * Update cart count
       *
       * @param   {Number}  countItems
       *
       * @return  {Void}
       */

      updateCounter(countItems) {
        if (countItems > 0) {
          this.cartToggle.classList.remove(settings.classes.cartEmpty);
        } else {
          this.cartToggle.classList.add(settings.classes.cartEmpty);
        }

        // Update cart icon counter
        if (this.cartItemsCount) {
          this.cartItemsCount.innerText = countItems < 10 ? countItems : '9+';
        }
      }

      /**
       * Check for items in the cart
       *
       * @return  {Void}
       */

      hasItemsInCart() {
        return this.totalItems > 0;
      }

      /**
       * Build total cart total price
       *
       * @param   {Object}  data
       *
       * @return  {Void}
       */

      buildTotalPrice(data) {
        if (this.cart !== null) {
          if (data.original_total_price > data.total_price && data.cart_level_discount_applications.length > 0) {
            this.cartOriginalTotal.classList.remove(settings.classes.hidden);
            this.cartOriginaTotalPrice.innerHTML = data.original_total_price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(data.original_total_price, theme.moneyWithoutCurrencyFormat);
          } else {
            this.cartOriginalTotal.classList.add(settings.classes.hidden);
          }

          this.cartTotal.innerHTML = data.total_price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(data.total_price, theme.moneyWithCurrencyFormat);

          if (data.cart_level_discount_applications.length > 0) {
            const discountsMarkup = this.buildCartTotalDiscounts(data.cart_level_discount_applications);

            this.cartDiscountHolder.classList.remove(settings.classes.hidden);
            this.cartDiscountHolder.innerHTML = discountsMarkup;
          } else {
            this.cartDiscountHolder.classList.add(settings.classes.hidden);
          }
        }
      }

      /**
       * Build cart total discounts
       *
       * @param   {Array}  discounts
       *
       * @return  {String}
       */

      buildCartTotalDiscounts(discounts) {
        let discountMarkup = '';
        const cartTotalDiscountsTemplateHtml = document.querySelector(settings.cartTotalDiscountsTemplate).innerHTML;

        discounts.forEach((discount) => {
          const discountTemplate = document.createElement('div');
          discountTemplate.innerHTML = cartTotalDiscountsTemplateHtml;
          const title = discountTemplate.querySelector(settings.elements.cartDiscountTitle);
          const price = discountTemplate.querySelector(settings.elements.cartDiscountPrice);
          title.textContent = discount.title;
          price.innerHTML = themeCurrency.formatMoney(discount.total_allocated_amount, theme.moneyWithoutCurrencyFormat);

          discountMarkup += discountTemplate.innerHTML;
        });

        return discountMarkup;
      }

      /**
       * Set cart close position
       *
       * @return  {Void}
       */

      setCartClosePosition() {
        if (this.cartToggle) {
          const cartToggleTop = this.cartToggle.getBoundingClientRect().top;
          const containerPadding = 40;

          this.cartClose.style.top = `${cartToggleTop - containerPadding}px`;
        }
      }

      /**
       * Show/hide free shipping message
       *
       * @param   {Number}  total
       *
       * @return  {Void}
       */

      freeShippingMessageHandle(total) {
        if (!this.cartMessage) return;

        const cartMessageItems = document.querySelectorAll(settings.elements.cartMessageItem);
        cartMessageItems.forEach((message) => {
          const isEligibleForFreeShipping = message.hasAttribute(settings.elements.cartMessage) && message.getAttribute(settings.elements.cartMessage) === 'true' && total >= this.cartFreeLimitShipping;

          if (isEligibleForFreeShipping) {
            message.classList.add(settings.classes.defaultSuccess);
          } else {
            message.classList.remove(settings.classes.defaultSuccess);
          }
        });
      }

      /**
       * Cart bar progress with message for free shipping
       *
       * @param   {Number}  progress
       *
       */
      cartBarProgress(progress = null) {
        const cartProgress = document.querySelectorAll(settings.elements.cartProgress);

        cartProgress.forEach((element) => {
          const progressPercentage = progress === null ? element.getAttribute('data-percent') : progress;
          element.style.setProperty('--percent', progressPercentage);
        });
      }

      /**
       * Update progress when update cart
       *
       * @return  {Void}
       */

      updateProgress() {
        const newPercentValue = (this.subtotal / this.cartFreeLimitShipping) * 100;
        const leftToSpend = themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.settings.moneyFormat);

        document.querySelectorAll(settings.elements.leftToSpend).forEach((element) => {
          element.innerHTML = leftToSpend.replace('.00', '').replace(',00', '');
        });

        this.cartBarProgress(newPercentValue > 100 ? 100 : newPercentValue);
      }
    }

    window.cart = new CartDrawer();

    const showElement = (elem, removeProp = false, prop = 'block') => {
      if (elem) {
        if (removeProp) {
          elem.style.removeProperty('display');
        } else {
          elem.style.display = prop;
        }
      }
    };

    const selectors$J = {
      saleClass: ' is-sale',
      soldClass: ' is-sold-out',
      apiContent: '[data-api-content]',
      productTemplate: '[data-product-template]',
    };

    Shopify.Products = (function () {
      const config = {
        howManyToShow: 4,
        howManyToStoreInMemory: 10,
        wrapperId: 'RecentlyViewed',
        onComplete: null,
      };

      let productHandleQueue = [];
      let wrapper = null;
      let howManyToShowItems = null;

      const cookie = {
        configuration: {
          expires: 90,
          path: '/',
          domain: window.location.hostname,
        },
        name: 'shopify_recently_viewed',
        write: function (recentlyViewed) {
          const recentlyViewedString = recentlyViewed.join(' ');
          document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        },
        read: function () {
          let recentlyViewed = [];
          let cookieValue = null;
          const templateProduct = document.querySelector(selectors$J.productTemplate);

          if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
            cookieValue = document.cookie
              .split('; ')
              .find((row) => row.startsWith(this.name))
              .split('=')[1];
          }

          if (cookieValue !== null) {
            recentlyViewed = cookieValue.split(' ');
          }

          if (templateProduct) {
            const currentProduct = templateProduct.getAttribute('data-product-handle');

            // Remove current product from the array
            if (recentlyViewed.indexOf(currentProduct) != -1) {
              const currentProductIndex = recentlyViewed.indexOf(currentProduct);
              recentlyViewed.splice(currentProductIndex, 1);
            }
          }

          return recentlyViewed;
        },
        destroy: function () {
          const cookieVal = null;
          document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        },
        remove: function (productHandle) {
          const recentlyViewed = this.read();
          const position = recentlyViewed.indexOf(productHandle);
          if (position !== -1) {
            recentlyViewed.splice(position, 1);
            this.write(recentlyViewed);
          }
        },
      };

      const finalize = () => {
        showElement(wrapper, true);
        const cookieItemsLength = cookie.read().length;

        if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
          let allClassesArr = [];
          let addClassesArr = [];
          let objCounter = 0;

          for (const property in Shopify.recentlyViewed) {
            objCounter += 1;
            const objString = Shopify.recentlyViewed[property];
            const objArr = objString.split(' ');
            const propertyIdx = parseInt(property.split('_')[1]);
            allClassesArr = [...allClassesArr, ...objArr];

            if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
              addClassesArr = [...addClassesArr, ...objArr];
            }
          }

          for (let i = 0; i < wrapper.children.length; i++) {
            const element = wrapper.children[i];
            if (allClassesArr.length) {
              element.classList.remove(...allClassesArr);
            }

            if (addClassesArr.length) {
              element.classList.add(...addClassesArr);
            }
          }
        }

        // If we have a callback.
        if (config.onComplete) {
          try {
            config.onComplete();
          } catch (error) {
            console.log('error: ', error);
          }
        }
      };

      const moveAlong = (shown) => {
        if (productHandleQueue.length && shown < config.howManyToShow) {
          fetch('/products/' + productHandleQueue[0] + '?section_id=api-product-grid-item')
            .then((response) => response.text())
            .then((product) => {
              const fresh = document.createElement('div');
              fresh.innerHTML = product;

              wrapper.innerHTML += fresh.querySelector(selectors$J.apiContent).innerHTML;

              productHandleQueue.shift();
              shown++;
              moveAlong(shown);
            })
            .catch(() => {
              cookie.remove(productHandleQueue[0]);
              productHandleQueue.shift();
              moveAlong(shown);
            });
        } else {
          finalize();
        }
      };

      return {
        showRecentlyViewed: function (params) {
          const paramsNew = params || {};
          const shown = 0;

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          productHandleQueue = cookie.read();

          // Template and element where to insert.
          wrapper = document.querySelector(`#${config.wrapperId}`);

          // How many products to show.
          howManyToShowItems = config.howManyToShow;
          config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

          // If we have any to show.
          if (config.howManyToShow && wrapper) {
            // Getting each product with an Ajax call and rendering it on the page.
            moveAlong(shown);
          }
        },

        getConfig: function () {
          return config;
        },

        clearList: function () {
          cookie.destroy();
        },

        recordRecentlyViewed: function (params) {
          const paramsNew = params || {};

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          let recentlyViewed = cookie.read();

          // If we are on a product page.
          if (window.location.pathname.indexOf('/products/') !== -1) {
            // What is the product handle on this page.
            const productHandle = decodeURIComponent(window.location.pathname)
              .match(
                /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
              )[0]
              .split('/products/')[1];
            // In what position is that product in memory.
            const position = recentlyViewed.indexOf(productHandle);

            // If not in memory.
            if (position === -1) {
              // Add product at the start of the list.
              recentlyViewed.unshift(productHandle);
              // Only keep what we need.
              recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
            } else {
              // Remove the product and place it at start of list.
              recentlyViewed.splice(position, 1);
              recentlyViewed.unshift(productHandle);
            }

            // Update cookie.
            cookie.write(recentlyViewed);
          }
        },

        hasProducts: cookie.read().length > 0,
      };
    })();

    const selectors$I = {
      inputSearch: 'input[type="search"]',
    };

    class MainSearch extends HeaderSearchForm {
      constructor() {
        super();

        this.allSearchInputs = document.querySelectorAll(selectors$I.inputSearch);
        this.setupEventListeners();
      }

      setupEventListeners() {
        let allSearchForms = [];
        this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
        this.input.addEventListener('focus', this.onInputFocus.bind(this));
        if (allSearchForms.length < 2) return;
        allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
        this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
      }

      onFormReset(event) {
        super.onFormReset(event);
        if (super.shouldResetForm()) {
          this.keepInSync('', this.input);
        }
      }

      onInput(event) {
        const target = event.target;
        this.keepInSync(target.value, target);
      }

      onInputFocus() {
        if (!isDesktop()) {
          this.scrollIntoView({behavior: 'smooth'});
        }
      }

      keepInSync(value, target) {
        this.allSearchInputs.forEach((input) => {
          if (input !== target) {
            input.value = value;
          }
        });
      }
    }

    customElements.define('main-search', MainSearch);

    const selectors$H = {
      details: 'details',
      input: 'input:not([type="hidden"])',
      popdown: '[data-popdown]',
      popdownClose: '[data-popdown-close]',
      popdownToggle: '[data-popdown-toggle]',
      predictiveSearch: 'predictive-search',
    };

    const attributes$9 = {
      popdownUnderlay: 'data-popdown-underlay',
    };

    const classes$u = {
      searchPopdownVisible: 'has-search-popdown-visible',
    };

    class SearchPopdown extends HTMLElement {
      constructor() {
        super();
        this.popdown = this.querySelector(selectors$H.popdown);
        this.popdownContainer = this.querySelector(selectors$H.details);
        this.popdownToggle = this.querySelector(selectors$H.popdownToggle);
        this.popdownClose = this.querySelector(selectors$H.popdownClose);
        this.a11y = a11y;
      }

      connectedCallback() {
        this.popdownContainer.addEventListener('keyup', (event) => event.code === 'Escape' && this.close());
        this.popdownClose.addEventListener('click', this.close.bind(this));
        this.popdownToggle.addEventListener('click', this.onPopdownToggleClick.bind(this));
        this.popdownToggle.setAttribute('role', 'button');
        this.popdown.addEventListener('transitionend', (event) => {
          if (event.propertyName == 'visibility' && this.popdownContainer.hasAttribute('open') && this.popdownContainer.getAttribute('open') == 'false') {
            this.closeCallback();
          }
        });
      }

      onPopdownToggleClick(event) {
        event.preventDefault();
        event.target.closest(selectors$H.details).hasAttribute('open') ? this.close() : this.open(event);
      }

      onBodyClick(event) {
        if (!this.contains(event.target) || event.target.hasAttribute(attributes$9.popdownUnderlay)) this.close();
      }

      open(event) {
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        event.target.closest(selectors$H.details).setAttribute('open', '');

        document.body.addEventListener('click', this.onBodyClickEvent);
        document.body.classList.add(classes$u.searchPopdownVisible);
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popdown}));

        // Safari opening transition fix
        requestAnimationFrame(() => {
          event.target.closest(selectors$H.details).setAttribute('open', 'true');

          // Trap focus after opening transition ends
          this.popdown.addEventListener(
            'transitionend',
            (e) => {
              if (e.target == this.popdown) {
                this.a11y.trapFocus(this.popdown, {
                  elementToFocus: this.popdown.querySelector(selectors$H.input),
                });
                theme.a11yTrigger = event.target;
              }
            },
            {once: true}
          );
        });
      }

      close() {
        this.popdownContainer.setAttribute('open', 'false');

        document.body.removeEventListener('click', this.onBodyClickEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }

      closeCallback() {
        this.popdownContainer.removeAttribute('open');
        this.a11y.removeTrapFocus();
        if (theme.a11yTrigger !== null) {
          theme.a11yTrigger.focus();
        }

        document.body.classList.remove(classes$u.searchPopdownVisible);
      }
    }

    customElements.define('header-search-popdown', SearchPopdown);

    window.isYoutubeAPILoaded = false;
    function loadYoutubeAPI() {
      if (!window.isYoutubeAPILoaded) {
        // Load Youtube API script
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }
    function onYouTubeIframeAPIReady() {
      window.isYoutubeAPILoaded = true;
      document.body.dispatchEvent(new CustomEvent('theme:youtube:api-ready'));
    }

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    window.loadYoutubeAPI = loadYoutubeAPI;

    theme.ProductModel = (function () {
      let modelJsonSections = {};
      let models = {};
      let xrButtons = {};
      const selectors = {
        productMediaWrapper: '[data-product-single-media-wrapper]',
        productXr: '[data-shopify-xr]',
        dataMediaId: 'data-media-id',
        dataModelId: 'data-model-id',
        dataModel3d: 'data-shopify-model3d-id',
        modelViewer: 'model-viewer',
        modelJson: '#ModelJson-',
        classMediaHidden: 'media--hidden',
        deferredMedia: '[data-deferred-media]',
        deferredMediaButton: '[data-deferred-media-button]',
      };
      const classes = {
        isLoading: 'is-loading',
      };

      function init(mediaContainer, sectionId) {
        modelJsonSections[sectionId] = {
          loaded: false,
        };

        const deferredMediaButton = mediaContainer.querySelector(selectors.deferredMediaButton);

        if (deferredMediaButton) {
          deferredMediaButton.addEventListener('click', loadContent.bind(this, mediaContainer, sectionId));
        }
      }

      function loadContent(mediaContainer, sectionId) {
        if (mediaContainer.querySelector(selectors.deferredMedia).getAttribute('loaded')) {
          return;
        }

        mediaContainer.classList.add(classes.isLoading);
        const content = document.createElement('div');
        content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
        const modelViewerElement = content.querySelector('model-viewer');
        const deferredMedia = mediaContainer.querySelector(selectors.deferredMedia);
        deferredMedia.appendChild(modelViewerElement).focus();
        deferredMedia.setAttribute('loaded', true);
        const mediaId = mediaContainer.dataset.mediaId;
        const modelId = modelViewerElement.dataset.modelId;
        const xrButton = mediaContainer.closest(selectors.productMediaWrapper).querySelector(selectors.productXr);
        xrButtons[sectionId] = {
          element: xrButton,
          defaultId: modelId,
        };

        models[mediaId] = {
          modelId: modelId,
          mediaId: mediaId,
          sectionId: sectionId,
          container: mediaContainer,
          element: modelViewerElement,
        };

        window.Shopify.loadFeatures([
          {
            name: 'shopify-xr',
            version: '1.0',
            onLoad: setupShopifyXr,
          },
          {
            name: 'model-viewer-ui',
            version: '1.0',
            onLoad: setupModelViewerUi,
          },
        ]);
      }

      function setupShopifyXr(errors) {
        if (errors) {
          console.warn(errors);
          return;
        }
        if (!window.ShopifyXR) {
          document.addEventListener('shopify_xr_initialized', function () {
            setupShopifyXr();
          });
          return;
        }

        for (const sectionId in modelJsonSections) {
          if (modelJsonSections.hasOwnProperty(sectionId)) {
            const modelSection = modelJsonSections[sectionId];
            if (modelSection.loaded) {
              continue;
            }

            const modelJson = document.querySelector(`${selectors.modelJson}${sectionId}`);
            if (modelJson) {
              window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
              modelSection.loaded = true;
            }
          }
        }
        window.ShopifyXR.setupXRElements();
      }

      function setupModelViewerUi(errors) {
        if (errors) {
          console.warn(errors);
          return;
        }

        for (const key in models) {
          if (models.hasOwnProperty(key)) {
            const model = models[key];
            if (!model.modelViewerUi) {
              model.modelViewerUi = new Shopify.ModelViewerUI(model.element);
            }
            setupModelViewerListeners(model);
          }
        }
      }

      function setupModelViewerListeners(model) {
        const xrButton = xrButtons[model.sectionId];

        model.container.addEventListener('theme:media:visible', function () {
          if (xrButton.element) {
            xrButton.element.setAttribute(selectors.dataModel3d, model.modelId);
          }

          pauseOtherMedia(model.mediaId);

          if (window.theme.touched) {
            return;
          }
          model.modelViewerUi.play();
        });

        model.container.addEventListener('theme:media:hidden', function () {
          model.modelViewerUi.pause();
        });

        model.container.addEventListener('theme:xr-launch', function () {
          model.modelViewerUi.pause();
        });

        model.element.addEventListener('load', () => {
          model.container.classList.remove(classes.isLoading);
        });

        model.element.addEventListener('shopify_model_viewer_ui_toggle_play', function () {
          pauseOtherMedia(model.mediaId);
        });
      }

      function pauseOtherMedia(mediaId) {
        const mediaIdString = `[${selectors.dataMediaId}="${mediaId}"]`;
        const currentMedia = document.querySelector(`${selectors.productMediaWrapper}${mediaIdString}`);
        const otherMedia = document.querySelectorAll(`${selectors.productMediaWrapper}:not(${mediaIdString})`);

        currentMedia.classList.remove(selectors.classMediaHidden);
        if (otherMedia.length) {
          otherMedia.forEach((element) => {
            element.dispatchEvent(new CustomEvent('theme:media:hidden'));
            element.classList.add(selectors.classMediaHidden);
          });
        }
      }

      function removeSectionModels(sectionId) {
        for (const key in models) {
          if (models.hasOwnProperty(key)) {
            const model = models[key];
            if (model.sectionId === sectionId) {
              delete models[key];
            }
          }
        }
        delete modelJsonSections[sectionId];
        delete theme.mediaInstances[sectionId];
      }

      return {
        init: init,
        loadContent: loadContent,
        removeSectionModels: removeSectionModels,
      };
    })();

    const selectors$G = {
      templateAddresses: '.template-customers-addresses',
      accountForm: '[data-form]',
      addressNewForm: '[data-form-new]',
      btnNew: '[data-button-new]',
      btnEdit: '[data-button-edit]',
      btnDelete: '[data-button-delete]',
      btnCancel: '[data-button-cancel]',
      dataFormId: 'data-form-id',
      editAddress: 'data-form-edit',
      addressCountryNew: 'AddressCountryNew',
      addressProvinceNew: 'AddressProvinceNew',
      addressProvinceContainerNew: 'AddressProvinceContainerNew',
      addressCountryOption: '[data-country-option]',
      addressCountry: 'AddressCountry',
      addressProvince: 'AddressProvince',
      addressProvinceContainer: 'AddressProvinceContainer',
      notOptionalInputs: 'input[type="text"]:not(.optional)',
    };

    const classes$t = {
      hidden: 'is-hidden',
      validation: 'validation--showup',
    };

    class Addresses {
      constructor(section) {
        this.section = section;
        this.addressNewForm = this.section.querySelector(selectors$G.addressNewForm);
        this.accountForms = this.section.querySelectorAll(selectors$G.accountForm);

        this.init();
        this.validate();
      }

      init() {
        if (this.addressNewForm) {
          const section = this.section;
          const newAddressForm = this.addressNewForm;
          this.customerAddresses();

          const newButtons = section.querySelectorAll(selectors$G.btnNew);
          if (newButtons.length) {
            newButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                button.classList.add(classes$t.hidden);
                newAddressForm.classList.remove(classes$t.hidden);
              });
            });
          }

          const editButtons = section.querySelectorAll(selectors$G.btnEdit);
          if (editButtons.length) {
            editButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                const formId = this.getAttribute(selectors$G.dataFormId);
                section.querySelector(`[${selectors$G.editAddress}="${formId}"]`).classList.toggle(classes$t.hidden);
              });
            });
          }

          const deleteButtons = section.querySelectorAll(selectors$G.btnDelete);
          if (deleteButtons.length) {
            deleteButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                const formId = this.getAttribute(selectors$G.dataFormId);
                if (confirm(theme.translations.delete_confirm)) {
                  Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
                }
              });
            });
          }

          const cancelButtons = section.querySelectorAll(selectors$G.btnCancel);
          if (cancelButtons.length) {
            cancelButtons.forEach((button) => {
              button.addEventListener('click', function (e) {
                e.preventDefault();
                this.closest(selectors$G.accountForm).classList.add(classes$t.hidden);
                document.querySelector(selectors$G.btnNew).classList.remove(classes$t.hidden);
              });
            });
          }
        }
      }

      customerAddresses() {
        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify.CountryProvinceSelector) {
          new Shopify.CountryProvinceSelector(selectors$G.addressCountryNew, selectors$G.addressProvinceNew, {
            hideElement: selectors$G.addressProvinceContainerNew,
          });
        }

        // Initialize each edit form's country/province selector
        const countryOptions = this.section.querySelectorAll(selectors$G.addressCountryOption);
        countryOptions.forEach((element) => {
          const formId = element.getAttribute(selectors$G.dataFormId);
          const countrySelector = `${selectors$G.addressCountry}_${formId}`;
          const provinceSelector = `${selectors$G.addressProvince}_${formId}`;
          const containerSelector = `${selectors$G.addressProvinceContainer}_${formId}`;

          new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
            hideElement: containerSelector,
          });
        });
      }

      validate() {
        this.accountForms.forEach((accountForm) => {
          const form = accountForm.querySelector('form');
          const inputs = form.querySelectorAll(selectors$G.notOptionalInputs);

          form.addEventListener('submit', (event) => {
            let isEmpty = false;

            // Display notification if input is empty
            inputs.forEach((input) => {
              if (!input.value) {
                input.nextElementSibling.classList.add(classes$t.validation);
                isEmpty = true;
              } else {
                input.nextElementSibling.classList.remove(classes$t.validation);
              }
            });

            if (isEmpty) {
              event.preventDefault();
            }
          });
        });
      }
    }

    const template = document.querySelector(selectors$G.templateAddresses);
    if (template) {
      new Addresses(template);
    }

    const selectors$F = {
      form: '[data-account-form]',
      showReset: '[data-show-reset]',
      hideReset: '[data-hide-reset]',
      recover: '[data-recover-password]',
      login: '[data-login-form]',
      recoverHash: '#recover',
    };

    const classes$s = {
      hidden: 'is-hidden',
    };

    class Login {
      constructor(form) {
        this.form = form;
        this.showButton = form.querySelector(selectors$F.showReset);
        this.hideButton = form.querySelector(selectors$F.hideReset);
        this.recover = form.querySelector(selectors$F.recover);
        this.login = form.querySelector(selectors$F.login);
        this.init();
      }

      init() {
        if (window.location.hash == selectors$F.recoverHash) {
          this.showRecoverPasswordForm();
        } else {
          this.hideRecoverPasswordForm();
        }
        this.showButton.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            this.showRecoverPasswordForm();
          }.bind(this),
          false
        );
        this.hideButton.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            this.hideRecoverPasswordForm();
          }.bind(this),
          false
        );
      }

      showRecoverPasswordForm() {
        this.recover.classList.remove(classes$s.hidden);
        this.login.classList.add(classes$s.hidden);
        window.location.hash = selectors$F.recoverHash;
        return false;
      }

      hideRecoverPasswordForm() {
        this.login.classList.remove(classes$s.hidden);
        this.recover.classList.add(classes$s.hidden);
        window.location.hash = '';
        return false;
      }
    }

    const loginForm = document.querySelector(selectors$F.form);
    if (loginForm) {
      new Login(loginForm);
    }

    const selectors$E = {
      frame: '[data-ticker-frame]',
      scale: '[data-ticker-scale]',
      text: '[data-ticker-text]',
      clone: 'data-clone',
      moveTime: 1.63, // 100px going to move for 1.63s
      space: 100, // 100px
    };

    const classes$r = {
      tickerAnimated: 'ticker--animated',
      tickerUnloaded: 'ticker--unloaded',
      tickerComparator: 'ticker__comparator',
    };

    class Ticker {
      constructor(el, stopClone = false) {
        this.frame = el;
        this.stopClone = stopClone;
        this.scale = this.frame.querySelector(selectors$E.scale);
        this.text = this.frame.querySelector(selectors$E.text);

        this.comparator = this.text.cloneNode(true);
        this.comparator.classList.add(classes$r.tickerComparator);
        this.frame.appendChild(this.comparator);
        this.scale.classList.remove(classes$r.tickerUnloaded);
        this.checkWidthOnResize = debounce(() => this.checkWidth(), 100);
        this.listen();
      }

      listen() {
        document.addEventListener('theme:resize', this.checkWidthOnResize);
        this.checkWidth();
      }

      checkWidth() {
        const padding = window.getComputedStyle(this.frame).paddingLeft.replace('px', '') * 2;

        if (this.frame.clientWidth - padding < this.text.clientWidth || this.stopClone) {
          this.text.classList.add(classes$r.tickerAnimated);
          if (this.scale.childElementCount === 1) {
            this.clone = this.text.cloneNode(true);
            this.clone.setAttribute(selectors$E.clone, '');
            this.scale.appendChild(this.clone);

            if (this.stopClone) {
              for (let index = 0; index < 10; index++) {
                const cloneSecond = this.text.cloneNode(true);
                cloneSecond.setAttribute(selectors$E.clone, '');
                this.scale.appendChild(cloneSecond);
              }
            }

            const animationTimeFrame = (this.text.clientWidth / selectors$E.space) * selectors$E.moveTime;

            this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
          }
        } else {
          this.text.classList.add(classes$r.tickerAnimated);
          let clone = this.scale.querySelector(`[${selectors$E.clone}]`);
          if (clone) {
            this.scale.removeChild(clone);
          }
          this.text.classList.remove(classes$r.tickerAnimated);
        }
      }

      unload() {
        document.removeEventListener('theme:resize', this.checkWidthOnResize);
      }
    }

    const selectors$D = {
      slider: '[data-slider]',
      slide: '[data-slide]',
      slideValue: 'data-slide',
      dataAutoplay: 'data-autoplay',
      dataAutoplaySpeed: 'data-speed',
      dataWatchCss: 'data-watch-css',
      dataDraggable: 'data-draggable',
      dataSlideIndex: 'data-slide-index',
      dataSliderStartIndex: 'data-slider-start-index',
      dataArrowPositionMiddle: 'data-arrow-position-middle',
      dataFade: 'data-fade',
    };

    const classes$q = {
      classIsSelected: 'is-selected',
      classSliderInitialized: 'js-slider--initialized',
      classSliderArrowsHidden: 'flickity-button-hide',
    };

    class Slider {
      constructor(container, slideshow = null, slideSelector = '') {
        this.container = container;
        this.slideshow = slideshow || this.container.querySelector(selectors$D.slider);

        if (!this.slideshow) {
          return;
        }

        this.slideshowSlides = this.slideshow.querySelectorAll(selectors$D.slide);
        this.autoPlay = this.slideshow.getAttribute(selectors$D.dataAutoplay) === 'true';
        this.autoPlaySpeed = this.slideshow.getAttribute(selectors$D.dataAutoplaySpeed);
        this.infinite = this.slideshow.getAttribute(selectors$D.dataInfinite) !== 'false';
        this.watchCss = this.slideshow.getAttribute(selectors$D.dataWatchCss) === 'true';
        this.draggable = this.slideshow.getAttribute(selectors$D.dataDraggable) !== 'false';
        this.sliderStartIndex = this.slideshow.hasAttribute(selectors$D.dataSliderStartIndex);
        this.fade = this.slideshow.getAttribute(selectors$D.dataFade) === 'true';
        this.slideSelector = slideSelector;

        this.flkty = null;
        this.init();
      }

      init() {
        const sliderOptions = {
          initialIndex: this.sliderStartIndex ? parseInt(this.slideshow.getAttribute(selectors$D.dataSliderStartIndex)) : 0,
          autoPlay: this.autoPlay && this.autoPlaySpeed ? parseInt(this.autoPlaySpeed) : false,
          contain: true,
          pageDots: false,
          wrapAround: this.infinite,
          percentPosition: this.percentPosition,
          watchCSS: this.watchCss,
          draggable: this.draggable ? '>1' : false,
          cellSelector: this.slideSelector,
          on: {
            ready: () => {
              requestAnimationFrame(() => {
                this.slideshow.parentNode.dispatchEvent(
                  new CustomEvent('theme:slider:loaded', {
                    bubbles: true,
                    detail: {
                      slider: this,
                    },
                  })
                );
              });

              if (this.slideshow.classList.contains(classes$q.classIsSelected)) {
                this.slideshow.classList.remove(classes$q.classIsSelected);
              }
            },
          },
        };

        if (this.fade) {
          sliderOptions.fade = true;
          this.flkty = new FlickityFade(this.slideshow, sliderOptions);
        }

        if (!this.fade) {
          this.flkty = new Flickity(this.slideshow, sliderOptions);
        }
      }

      onUnload() {
        if (this.slideshow && this.flkty) {
          this.flkty.options.watchCSS = false;
          this.flkty.destroy();
        }
      }

      onBlockSelect(evt) {
        if (!this.slideshow) {
          return;
        }
        // Ignore the cloned version
        const slide = this.slideshow.querySelector(`[${selectors$D.slideValue}="${evt.detail.blockId}"]`);

        if (!slide) {
          return;
        }
        let slideIndex = parseInt(slide.getAttribute(selectors$D.dataSlideIndex));

        if (this.multipleSlides && !this.slideshow.classList.contains(classes$q.classSliderInitialized)) {
          slideIndex = 0;
        }

        this.slideshow.classList.add(classes$q.classIsSelected);

        // Go to selected slide, pause autoplay
        this.flkty.selectCell(slideIndex);
        this.flkty.stopPlayer();
      }

      onBlockDeselect() {
        if (!this.slideshow) {
          return;
        }
        this.slideshow.classList.remove(classes$q.classIsSelected);

        if (!this.autoPlay) {
          return;
        }
        this.flkty.playPlayer();
      }
    }

    const selectors$C = {
      bar: '[data-bar]',
      barSlide: '[data-slide]',
      frame: '[data-ticker-frame]',
      header: '[data-header-wrapper]',
      slider: '[data-slider]',
      slideValue: 'data-slide',
      tickerScale: '[data-ticker-scale]',
      tickerText: '[data-ticker-text]',
    };

    const attributes$8 = {
      dataStop: 'data-stop',
      style: 'style',
      dataTargetReferrer: 'data-target-referrer',
    };

    const classes$p = {
      tickerAnimated: 'ticker--animated',
      mobile: 'mobile',
      desktop: 'desktop',
    };

    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();
        this.locationPath = location.href;

        this.slides = this.querySelectorAll(selectors$C.barSlide);
        this.slider = this.querySelector(selectors$C.slider);
        this.initSliderFlag = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) >= theme.sizes.small ? true : false;
        this.initSliderEvent = (event) => this.initSlider(event);
      }

      connectedCallback() {
        this.removeAnnouncement();

        if (this.slider) {
          this.initSliders();
        }

        if (!this.slider) {
          this.initTickers(true);
        }

        this.addEventListener('theme:block:select', (e) => {
          this.onBlockSelect(e);
        });

        this.addEventListener('theme:block:deselect', (e) => {
          this.onBlockDeselect(e);
        });
      }

      /**
       * Delete announcement which has a target referrer attribute and it is not contained in page URL
       */
      removeAnnouncement() {
        for (let index = 0; index < this.slides.length; index++) {
          const element = this.slides[index];

          if (!element.hasAttribute(attributes$8.dataTargetReferrer)) {
            continue;
          }

          if (this.locationPath.indexOf(element.getAttribute(attributes$8.dataTargetReferrer)) === -1 && !window.Shopify.designMode) {
            element.parentNode.removeChild(element);
          }
        }
      }

      /**
       * Init slider
       */
      initSliders() {
        this.initSlider();
        document.addEventListener('theme:resize:width', this.initSliderEvent);

        this.addEventListener('theme:slider:loaded', () => this.initTickers());
      }

      initSlider(event) {
        const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        if ((windowWidth >= theme.sizes.small && this.initSliderFlag) || (windowWidth < theme.sizes.small && !this.initSliderFlag)) {
          let slidesSelector = '';

          if (this.slider.flkty) {
            this.slider.flkty.destroy();
          }

          if (windowWidth >= theme.sizes.small && this.initSliderFlag) {
            this.initSliderFlag = false;
            slidesSelector = `${selectors$C.barSlide}:not(.${classes$p.mobile})`;
          } else if (windowWidth < theme.sizes.small && !this.initSliderFlag) {
            this.initSliderFlag = true;
            slidesSelector = `${selectors$C.barSlide}:not(.${classes$p.desktop})`;
          }

          if (this.querySelector(slidesSelector)) {
            this.slider = new Slider(this, this.querySelector(selectors$C.slider), slidesSelector);
            this.slider.flkty.reposition();
          }
        }
      }

      /**
       * Init tickers in sliders
       */
      initTickers(stopClone = false) {
        const frames = this.querySelectorAll(selectors$C.frame);

        frames.forEach((element) => {
          new Ticker(element, stopClone);
        });
      }

      toggleTicker(e, isStoped = false) {
        const tickerScale = document.querySelector(selectors$C.tickerScale);
        const element = document.querySelector(`[${selectors$C.slideValue}="${e.detail.blockId}"]`);

        if (isStoped && element) {
          tickerScale.setAttribute(attributes$8.dataStop, '');
          tickerScale.querySelectorAll(selectors$C.tickerText).forEach((textHolder) => {
            textHolder.classList.remove(classes$p.tickerAnimated);
            textHolder.style.transform = `translate3d(${-(element.offsetLeft - element.clientWidth)}px, 0, 0)`;
          });
        }

        if (!isStoped && element) {
          tickerScale.querySelectorAll(selectors$C.tickerText).forEach((textHolder) => {
            textHolder.classList.add(classes$p.tickerAnimated);
            textHolder.removeAttribute(attributes$8.style);
          });
          tickerScale.removeAttribute(attributes$8.dataStop);
        }
      }

      onBlockSelect(e) {
        if (this.slider) {
          this.slider.onBlockSelect(e);
        } else {
          this.toggleTicker(e, true);
        }
      }

      onBlockDeselect(e) {
        if (this.slider) {
          this.slider.onBlockDeselect(e);
        } else {
          this.toggleTicker(e, false);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.initSliderEvent);
      }
    }

    if (!customElements.get('announcement-bar')) {
      customElements.define('announcement-bar', AnnouncementBar);
    }

    window.Shopify = window.Shopify || {};
    window.Shopify.theme = window.Shopify.theme || {};
    window.Shopify.theme.sections = window.Shopify.theme.sections || {};

    window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
    window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
    const registered = window.Shopify.theme.sections.registered;
    const instances = window.Shopify.theme.sections.instances;

    const selectors$B = {
      id: 'data-section-id',
      type: 'data-section-type',
    };

    class Registration {
      constructor(type = null, components = []) {
        this.type = type;
        this.components = validateComponentsArray(components);
        this.callStack = {
          onLoad: [],
          onUnload: [],
          onSelect: [],
          onDeselect: [],
          onBlockSelect: [],
          onBlockDeselect: [],
          onReorder: [],
        };
        components.forEach((comp) => {
          for (const [key, value] of Object.entries(comp)) {
            const arr = this.callStack[key];
            if (Array.isArray(arr) && typeof value === 'function') {
              arr.push(value);
            } else {
              console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
              console.warn(value);
            }
          }
        });
      }

      getStack() {
        return this.callStack;
      }
    }

    class Section {
      constructor(container, registration) {
        this.container = validateContainerElement(container);
        this.id = container.getAttribute(selectors$B.id);
        this.type = registration.type;
        this.callStack = registration.getStack();

        try {
          this.onLoad();
        } catch (e) {
          console.warn(`Error in section: ${this.id}`);
          console.warn(this);
          console.warn(e);
        }
      }

      callFunctions(key, e = null) {
        this.callStack[key].forEach((func) => {
          const props = {
            id: this.id,
            type: this.type,
            container: this.container,
          };
          if (e) {
            func.call(props, e);
          } else {
            func.call(props);
          }
        });
      }

      onLoad() {
        this.callFunctions('onLoad');
      }

      onUnload() {
        this.callFunctions('onUnload');
      }

      onSelect(e) {
        this.callFunctions('onSelect', e);
      }

      onDeselect(e) {
        this.callFunctions('onDeselect', e);
      }

      onBlockSelect(e) {
        this.callFunctions('onBlockSelect', e);
      }

      onBlockDeselect(e) {
        this.callFunctions('onBlockDeselect', e);
      }

      onReorder(e) {
        this.callFunctions('onReorder', e);
      }
    }

    function validateContainerElement(container) {
      if (!(container instanceof Element)) {
        throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
      }
      if (container.getAttribute(selectors$B.id) === null) {
        throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + selectors$B.id + ' attribute.');
      }

      return container;
    }

    function validateComponentsArray(value) {
      if ((typeof value !== 'undefined' && typeof value !== 'object') || value === null) {
        throw new TypeError('Theme Sections: The components object provided is not a valid');
      }

      return value;
    }

    /*
     * @shopify/theme-sections
     * -----------------------------------------------------------------------------
     *
     * A framework to provide structure to your Shopify sections and a load and unload
     * lifecycle. The lifecycle is automatically connected to theme editor events so
     * that your sections load and unload as the editor changes the content and
     * settings of your sections.
     */

    function register(type, components) {
      if (typeof type !== 'string') {
        throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
      }

      if (typeof registered[type] !== 'undefined') {
        throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
      }

      if (!Array.isArray(components)) {
        components = [components];
      }

      const section = new Registration(type, components);
      registered[type] = section;

      return registered;
    }

    function load(types, containers) {
      types = normalizeType(types);

      if (typeof containers === 'undefined') {
        containers = document.querySelectorAll('[' + selectors$B.type + ']');
      }

      containers = normalizeContainers(containers);

      types.forEach(function (type) {
        const registration = registered[type];

        if (typeof registration === 'undefined') {
          return;
        }

        containers = containers.filter(function (container) {
          // Filter from list of containers because container already has an instance loaded
          if (isInstance(container)) {
            return false;
          }

          // Filter from list of containers because container doesn't have data-section-type attribute
          if (container.getAttribute(selectors$B.type) === null) {
            return false;
          }

          // Keep in list of containers because current type doesn't match
          if (container.getAttribute(selectors$B.type) !== type) {
            return true;
          }

          instances.push(new Section(container, registration));

          // Filter from list of containers because container now has an instance loaded
          return false;
        });
      });
    }

    function reorder(selector) {
      var instancesToReorder = getInstances(selector);

      instancesToReorder.forEach(function (instance) {
        instance.onReorder();
      });
    }

    function unload(selector) {
      var instancesToUnload = getInstances(selector);

      instancesToUnload.forEach(function (instance) {
        var index = instances
          .map(function (e) {
            return e.id;
          })
          .indexOf(instance.id);
        instances.splice(index, 1);
        instance.onUnload();
      });
    }

    function getInstances(selector) {
      var filteredInstances = [];

      // Fetch first element if its an array
      if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
        var firstElement = selector[0];
      }

      // If selector element is DOM element
      if (selector instanceof Element || firstElement instanceof Element) {
        var containers = normalizeContainers(selector);

        containers.forEach(function (container) {
          filteredInstances = filteredInstances.concat(
            instances.filter(function (instance) {
              return instance.container === container;
            })
          );
        });

        // If select is type string
      } else if (typeof selector === 'string' || typeof firstElement === 'string') {
        var types = normalizeType(selector);

        types.forEach(function (type) {
          filteredInstances = filteredInstances.concat(
            instances.filter(function (instance) {
              return instance.type === type;
            })
          );
        });
      }

      return filteredInstances;
    }

    function getInstanceById(id) {
      var instance;

      for (var i = 0; i < instances.length; i++) {
        if (instances[i].id === id) {
          instance = instances[i];
          break;
        }
      }
      return instance;
    }

    function isInstance(selector) {
      return getInstances(selector).length > 0;
    }

    function normalizeType(types) {
      // If '*' then fetch all registered section types
      if (types === '*') {
        types = Object.keys(registered);

        // If a single section type string is passed, put it in an array
      } else if (typeof types === 'string') {
        types = [types];

        // If single section constructor is passed, transform to array with section
        // type string
      } else if (types.constructor === Section) {
        types = [types.prototype.type];

        // If array of typed section constructors is passed, transform the array to
        // type strings
      } else if (Array.isArray(types) && types[0].constructor === Section) {
        types = types.map(function (Section) {
          return Section.type;
        });
      }

      types = types.map(function (type) {
        return type.toLowerCase();
      });

      return types;
    }

    function normalizeContainers(containers) {
      // Nodelist with entries
      if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
        containers = Array.prototype.slice.call(containers);

        // Empty Nodelist
      } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
        containers = [];

        // Handle null (document.querySelector() returns null with no match)
      } else if (containers === null) {
        containers = [];

        // Single DOM element
      } else if (!Array.isArray(containers) && containers instanceof Element) {
        containers = [containers];
      }

      return containers;
    }

    if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + selectors$B.id + '="' + id + '"]');

        if (container !== null) {
          load(container.getAttribute(selectors$B.type), container);
        }
      });

      document.addEventListener('shopify:section:reorder', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + selectors$B.id + '="' + id + '"]');
        var instance = getInstances(container)[0];

        if (typeof instance === 'object') {
          reorder(container);
        }
      });

      document.addEventListener('shopify:section:unload', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + selectors$B.id + '="' + id + '"]');
        var instance = getInstances(container)[0];

        if (typeof instance === 'object') {
          unload(container);
        }
      });

      document.addEventListener('shopify:section:select', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onSelect(event);
        }
      });

      document.addEventListener('shopify:section:deselect', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onDeselect(event);
        }
      });

      document.addEventListener('shopify:block:select', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onBlockSelect(event);
        }
      });

      document.addEventListener('shopify:block:deselect', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onBlockDeselect(event);
        }
      });
    }

    const selectors$A = {
      aos: 'data-aos',
    };

    const removeAnimations = (container) => {
      const animatedElements = container.querySelectorAll(`[${selectors$A.aos}]`);
      animatedElements.forEach((element) => {
        element.removeAttribute(selectors$A.aos);
      });
    };

    function fetchProduct(handle) {
      const requestRoute = `${theme.routes.root}products/${handle}.js`;
      return window
        .fetch(requestRoute)
        .then((response) => {
          return response.json();
        })
        .catch((e) => {
          console.error(e);
        });
    }

    const handle = (str) => {
      str = str.toLowerCase();

      var toReplace = ['"', "'", '\\', '(', ')', '[', ']'];

      // For the old browsers
      for (var i = 0; i < toReplace.length; ++i) {
        str = str.replace(toReplace[i], '');
      }

      str = str.replace(/\W+/g, '-');

      if (str.charAt(str.length - 1) == '-') {
        str = str.replace(/-+\z/, '');
      }

      if (str.charAt(0) == '-') {
        str = str.replace(/\A-+/, '');
      }

      return str;
    };

    function getScript(url, callback, callbackError) {
      let head = document.getElementsByTagName('head')[0];
      let done = false;
      let script = document.createElement('script');
      script.src = url;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
          done = true;
          callback();
        } else {
          callbackError();
        }
      };

      head.appendChild(script);
    }

    const loaders = {};
    window.isYoutubeAPILoaded = false;

    function loadScript(options = {}) {
      if (!options.type) {
        options.type = 'json';
      }

      if (options.url) {
        if (loaders[options.url]) {
          return loaders[options.url];
        } else {
          return getScriptWithPromise(options.url, options.type);
        }
      } else if (options.json) {
        if (loaders[options.json]) {
          return Promise.resolve(loaders[options.json]);
        } else {
          return window
            .fetch(options.json)
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              loaders[options.json] = response;
              return response;
            });
        }
      } else if (options.name) {
        const key = ''.concat(options.name, options.version);
        if (loaders[key]) {
          return loaders[key];
        } else {
          return loadShopifyWithPromise(options);
        }
      } else {
        return Promise.reject();
      }
    }

    function getScriptWithPromise(url, type) {
      const loader = new Promise((resolve, reject) => {
        if (type === 'text') {
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              resolve(data);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          getScript(
            url,
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        }
      });

      loaders[url] = loader;
      return loader;
    }

    function loadShopifyWithPromise(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject) => {
        try {
          window.Shopify.loadFeatures([
            {
              name: options.name,
              version: options.version,
              onLoad: (err) => {
                onLoadFromShopify(resolve, reject, err);
              },
            },
          ]);
        } catch (err) {
          reject(err);
        }
      });
      loaders[key] = loader;
      return loader;
    }

    function onLoadFromShopify(resolve, reject, err) {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    }

    const defaults$1 = {
      color: 'ash',
    };

    const selectors$z = {
      swatch: 'data-swatch',
      swatchColor: '[data-swatch-color]',
      wrapper: '[data-grid-swatches]',
      template: '[data-swatch-template]',
      button: '[data-swatch-button]',
      link: '[data-swatch-link]',
      handle: 'data-swatch-handle',
      label: 'data-swatch-label',
    };

    class ColorMatch {
      constructor(options = {}) {
        this.settings = {
          ...defaults$1,
          ...options,
        };

        if (theme.settings.swatchesType == 'native') return;

        this.match = this.init();
      }

      getColor() {
        return this.match;
      }

      init() {
        const getColors = loadScript({json: theme.assets.swatches});
        return getColors
          .then((colors) => {
            return this.matchColors(colors, this.settings.color);
          })
          .catch((e) => {
            console.log('failed to load swatch colors script');
            console.log(e);
          });
      }

      matchColors(colors, name) {
        let bg = '#E5E5E5';
        let img = null;
        const path = theme.assets.base || '/';
        const comparisonName = name.toLowerCase().replace(/\s/g, '');
        const array = colors.colors;

        if (array) {
          let indexArray = null;

          const hexColorArr = array.filter((colorObj, index) => {
            const neatName = Object.keys(colorObj).toString().toLowerCase().replace(/\s/g, '');

            if (neatName === comparisonName) {
              indexArray = index;

              return colorObj;
            }
          });

          if (hexColorArr.length && indexArray !== null) {
            const value = Object.values(array[indexArray])[0];
            bg = value;

            if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
              img = `${path}${value}`;
              bg = '#888888';
            }
          }
        }

        return {
          color: this.settings.color,
          path: img,
          hex: bg,
        };
      }
    }

    class Swatch {
      constructor(element) {
        this.element = element;
        this.swatchColor = this.element.querySelector(selectors$z.swatchColor);
        if (!this.swatchColor || theme.settings.swatchesType == 'native') return;

        this.colorString = element.getAttribute(selectors$z.swatch);
        const matcher = new ColorMatch({color: this.colorString});
        matcher.getColor().then((result) => {
          this.colorMatch = result;
          this.init();
        });
      }

      init() {
        if (this.colorMatch && this.colorMatch.hex) {
          this.swatchColor.style.setProperty('--swatch', `${this.colorMatch.hex}`);
        }
        if (this.colorMatch && this.colorMatch.path) {
          this.swatchColor.style.setProperty('background-image', `url(${this.colorMatch.path})`);
        }
      }
    }

    class GridSwatch {
      constructor(wrap, container) {
        if (theme.settings.swatchesType == 'native') return;

        this.template = document.querySelector(selectors$z.template).innerHTML;
        this.wrap = wrap;
        this.container = container;
        this.handle = wrap.getAttribute(selectors$z.handle);
        const label = wrap.getAttribute(selectors$z.label).trim().toLowerCase();
        fetchProduct(this.handle).then((product) => {
          this.product = product;
          this.colorOption = product.options.find(function (element) {
            return element.name.toLowerCase() === label || null;
          });

          if (this.colorOption) {
            this.swatches = this.colorOption.values;
            this.init();
          }
        });
      }

      init() {
        this.wrap.innerHTML = '';

        this.swatches.forEach((swatch) => {
          let variant = this.product.variants.find((variant) => {
            return variant.options.includes(swatch);
          });

          if (variant) {
            const swatchTemplate = document.createElement('div');
            swatchTemplate.innerHTML = this.template;
            const button = swatchTemplate.querySelector(selectors$z.button);
            const swatchElement = swatchTemplate.querySelector(`[${selectors$z.swatch}]`);
            const link = swatchTemplate.querySelector(selectors$z.link);
            const swatchColor = swatchTemplate.querySelector(selectors$z.swatchColor);

            button.dataset.value = swatch;
            swatchElement.dataset.swatch = swatch;
            swatchElement.dataset.swatchVariant = variant.id;
            link.href = `${this.product.url}?variant=${variant.id}`;
            link.textContent = swatch;
            swatchColor.classList.add(`${swatchColor.classList[0]}--${handle(swatch)}`);

            this.wrap.innerHTML += swatchTemplate.innerHTML;
          }
        });

        this.swatchElements = this.wrap.querySelectorAll(`[${selectors$z.swatch}]`);

        this.swatchElements.forEach((el) => {
          new Swatch(el);
        });
      }
    }

    const makeGridSwatches = (container) => {
      const gridSwatchWrappers = container.querySelectorAll(selectors$z.wrapper);
      gridSwatchWrappers.forEach((wrap) => {
        new GridSwatch(wrap, undefined);
      });
    };

    const swatchSection = {
      onLoad() {
        this.swatches = [];
        const els = this.container.querySelectorAll(`[${selectors$z.swatch}]`);
        els.forEach((el) => {
          this.swatches.push(new Swatch(el));
        });
      },
    };

    const swatchGridSection = {
      onLoad() {
        makeGridSwatches(this.container);
      },
    };

    const throttle = (fn, wait) => {
      let prev, next;
      return function invokeFn(...args) {
        const now = Date.now();
        next = clearTimeout(next);
        if (!prev || now - prev >= wait) {
          // eslint-disable-next-line prefer-spread
          fn.apply(null, args);
          prev = now;
        } else {
          next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
        }
      };
    };

    const selectors$y = {
      itemsParent: '[data-custom-scrollbar-items]',
      scrollbar: '[data-custom-scrollbar]',
      scrollbarTrack: '[data-custom-scrollbar-track]',
    };
    class CustomScrollbar {
      constructor(container) {
        this.itemsParent = container.querySelector(selectors$y.itemsParent);
        this.scrollbar = container.querySelector(selectors$y.scrollbar);
        this.scrollbarTrack = container.querySelector(selectors$y.scrollbarTrack);
        this.trackWidth = 0;
        this.calcPositionEvent = throttle(() => this.calculatePosition(), 50);
        this.calcTrackEvent = () => this.calculateTrackWidth();

        if (this.scrollbar && this.itemsParent) {
          this.events();
          this.calculateTrackWidth();
        }
      }

      events() {
        this.itemsParent.addEventListener('scroll', this.calcPositionEvent);
        document.addEventListener('theme:resize:width', this.calcTrackEvent);
      }

      calculateTrackWidth() {
        this.trackWidth = 100 / this.itemsParent.children.length;
        this.trackWidth = this.trackWidth < 5 ? 5 : this.trackWidth; // Min track width: 5%
        this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}%`);
      }

      calculatePosition() {
        /* Scrollbar width must be re-calculated by subtracting the track width (in percentage)
         ** E.g. if the track width is 15% of the scroll bar then we must use a reduced by 15% scrollbar width for the calculations which is 85% of the total scrollbar width
         ** This is needed in order to prevent the track moving out of the scrollbar container
         */
        const reducedScrollbarWidth = this.scrollbar.clientWidth * ((100 - this.trackWidth) / 100);
        let position = this.itemsParent.scrollLeft / (this.itemsParent.scrollWidth - this.itemsParent.clientWidth);

        position *= reducedScrollbarWidth;

        this.scrollbar.style.setProperty('--position', `${Math.round(position)}px`);
      }

      destroy() {
        this.itemsParent.removeEventListener('scroll', this.calcPositionEvent);
        document.removeEventListener('theme:resize:width', this.calcTrackEvent);
      }
    }

    const selectors$x = {
      productSlideshow: '[data-product-slideshow]',
      productImage: '[data-product-single-media-wrapper]',
      productThumbs: '[data-product-single-media-thumbs]',
      productThumbsVertical: '[data-product-single-media-thumbs-vertical]',
      productThumb: '[data-thumbnail]',
      productThumbLink: '[data-thumbnail-id]',
      deferredMediaButton: '[data-deferred-media-button]',
      mediaType: 'data-type',
      id: 'data-id',
      tabIndex: 'tabindex',
      arrows: 'data-arrows',
      dots: 'data-dots',
      navSelected: '.is-nav-selected',
      scrollable: '[data-custom-scrollbar-items]',
    };

    const classes$o = {
      active: 'active',
      sliderEnabled: 'flickity-enabled',
      mediaHidden: 'media--hidden',
      focusEnabled: 'is-focused',
      thumbsArrows: 'product__images__slider-nav--arrows',
      isMoving: 'is-moving',
      navSelected: 'is-nav-selected',
    };

    const attributes$7 = {
      thumbnail: 'data-thumbnail',
    };

    class InitSlider {
      constructor(section) {
        this.container = section.container;
        this.scrollable = this.container.querySelector(selectors$x.scrollable);
        this.slideshow = this.container.querySelector(selectors$x.productSlideshow);
        this.productImages = this.container.querySelectorAll(selectors$x.productImage);
        this.thumbs = this.container.querySelector(selectors$x.productThumbs);
        this.thumbsVertical = this.container.querySelector(selectors$x.productThumbsVertical);
        this.flkty = null;
        this.flktyNav = null;
        this.flickityOptionsNav = null;
        this.resizeEvent = () => this.resizeEvents();

        if (this.slideshow) {
          this.flickityOptionsNav = {
            asNavFor: this.slideshow,
            pageDots: false,
            prevNextButtons: true,
            arrowShape: theme.icons.arrowNavSlider,
            groupCells: true,
            contain: true,
          };
        }

        if (this.productImages.length > 1) {
          this.init();
        }
      }

      init() {
        this.createSlider();
        this.createSliderNav();
        this.createScrollable();

        document.addEventListener('theme:resize:width', this.resizeEvent);
      }

      resizeEvents() {
        this.initSliderNavVertical();

        this.checkThumbsWidth();

        this.createScrollable();
      }

      createSlider() {
        if (!this.slideshow) {
          return;
        }

        const instance = this;
        const firstSlide = this.slideshow.querySelectorAll(`[${selectors$x.mediaType}]`)[0];
        const arrows = this.slideshow.getAttribute(selectors$x.arrows) === 'true';
        const dots = this.slideshow.getAttribute(selectors$x.dots) === 'true';

        const flickityOptions = {
          autoPlay: false,
          arrowShape: theme.icons.arrowNavSlider,
          prevNextButtons: arrows,
          contain: true,
          pageDots: dots,
          adaptiveHeight: true,
          wrapAround: true,
        };

        this.flkty = new Flickity(this.slideshow, flickityOptions);

        if (firstSlide) {
          const firstType = firstSlide.getAttribute(selectors$x.mediaType);

          if (firstType === 'model' || firstType === 'video' || firstType === 'external_video') {
            this.flkty.options.draggable = false;
            this.flkty.updateDraggable();
          }
        }

        this.flkty.on('dragStart', function () {
          instance.slideshow.classList.add(classes$o.isMoving);
        });

        this.flkty.on('change', function (index) {
          const currentMedia = this.cells[index].element;
          const newMedia = this.selectedElement;
          const isMobileView = isMobile();

          currentMedia.dispatchEvent(new CustomEvent('theme:media:hidden'));
          newMedia.classList.remove(classes$o.mediaHidden);

          if (instance.thumbsVertical && !isMobileView) {
            const selectedThumb = instance.thumbsVertical.querySelector(selectors$x.navSelected);
            const newSelectedThumb = instance.thumbsVertical.querySelector(`[${attributes$7.thumbnail}="${index}"]`);

            if (selectedThumb) {
              selectedThumb.classList.remove(classes$o.navSelected);
            }

            if (newSelectedThumb) {
              newSelectedThumb.classList.add(classes$o.navSelected);
            }

            instance.scrollToThumb();
          }
        });

        this.flkty.on('settle', function () {
          const currentMedia = this.selectedElement;
          const mediaType = currentMedia.getAttribute(selectors$x.mediaType);

          if (mediaType === 'model' || mediaType === 'video' || mediaType === 'external_video') {
            // first boolean sets value, second option false to prevent refresh
            instance.flkty.options.draggable = false;
            instance.flkty.updateDraggable();
          } else {
            instance.flkty.options.draggable = true;
            instance.flkty.updateDraggable();
          }

          instance.switchMedia(currentMedia);
          instance.slideshow.classList.remove(classes$o.isMoving);
        });
      }

      createSliderNav() {
        const thumbs = this.thumbs || this.thumbsVertical;
        if (!thumbs || !this.slideshow) return;

        if (this.thumbsVertical) {
          this.initSliderNavVertical();
        } else {
          this.flktyNav = new Flickity(thumbs, this.flickityOptionsNav);
        }

        this.checkThumbsWidth();

        thumbs.querySelectorAll(selectors$x.productThumbLink).forEach((thumbLink, index) => {
          const thumbParent = thumbLink.closest(selectors$x.productThumb);

          if (this.thumbsVertical && thumbParent && index === 0) {
            thumbParent.classList.add(classes$o.navSelected);
          }

          thumbLink.addEventListener('click', (e) => {
            e.preventDefault();
            const isMobileView = isMobile();
            if (this.thumbsVertical && thumbParent && !isMobileView && this.flkty !== null) {
              this.flkty.selectCell(parseInt(thumbParent.getAttribute(attributes$7.thumbnail)));
            }
          });
        });
      }

      initSliderNavVertical() {
        if (!this.thumbsVertical || !this.slideshow) return;

        const isMobileView = isMobile();

        if (isMobileView && !this.flktyNav) {
          this.flktyNav = new Flickity(this.thumbsVertical, this.flickityOptionsNav);
        } else if (!isMobileView && this.flktyNav) {
          this.flktyNav.destroy();
          this.flktyNav = null;
        }
      }

      scrollToThumb() {
        const thumbs = this.thumbsVertical;

        if (thumbs) {
          const thumb = thumbs.querySelector(selectors$x.navSelected);
          if (!thumb) return;
          const thumbsScrollTop = thumbs.scrollTop;
          const thumbsScrollLeft = thumbs.scrollLeft;
          const thumbsWidth = thumbs.offsetWidth;
          const thumbsHeight = thumbs.offsetHeight;
          const thumbsPositionBottom = thumbsScrollTop + thumbsHeight;
          const thumbsPositionRight = thumbsScrollLeft + thumbsWidth;
          const thumbPosTop = thumb.offsetTop;
          const thumbPosLeft = thumb.offsetLeft;
          const thumbWidth = thumb.offsetWidth;
          const thumbHeight = thumb.offsetHeight;
          const thumbRightPos = thumbPosLeft + thumbWidth;
          const thumbBottomPos = thumbPosTop + thumbHeight;
          const topCheck = thumbsScrollTop > thumbPosTop;
          const bottomCheck = thumbBottomPos > thumbsPositionBottom;
          const leftCheck = thumbsScrollLeft > thumbPosLeft;
          const rightCheck = thumbRightPos > thumbsPositionRight;
          const verticalCheck = bottomCheck || topCheck;
          const horizontalCheck = rightCheck || leftCheck;
          const isMobileView = isMobile();

          if (verticalCheck || horizontalCheck) {
            let scrollTopPosition = thumbPosTop - thumbsHeight + thumbHeight;
            let scrollLeftPosition = thumbPosLeft - thumbsWidth + thumbWidth;

            if (topCheck) {
              scrollTopPosition = thumbPosTop;
            }

            if (rightCheck && isMobileView) {
              scrollLeftPosition += parseInt(window.getComputedStyle(thumbs).paddingRight);
            }

            if (leftCheck) {
              scrollLeftPosition = thumbPosLeft;

              if (isMobileView) {
                scrollLeftPosition -= parseInt(window.getComputedStyle(thumbs).paddingLeft);
              }
            }

            thumbs.scrollTo({
              top: scrollTopPosition,
              left: scrollLeftPosition,
              behavior: 'smooth',
            });
          }
        }
      }

      checkThumbsWidth() {
        if (this.thumbs || (this.thumbsVertical && isMobile())) {
          const thumbsHolder = this.thumbs || this.thumbsVertical;
          const thumbs = thumbsHolder.querySelectorAll(selectors$x.productThumb);
          const thumbsContainerPadding = parseInt(window.getComputedStyle(thumbsHolder).paddingLeft.replace('px', '')) * 2;
          const thumbsContainerWidth = thumbsHolder.offsetWidth - thumbsContainerPadding;
          let thumbsWidth = 0;

          thumbs.forEach((thumb) => {
            thumbsWidth += thumb.offsetWidth;
          });

          if (thumbsContainerWidth < thumbsWidth) {
            thumbsHolder.classList.add(classes$o.thumbsArrows);
          } else {
            thumbsHolder.classList.remove(classes$o.thumbsArrows);
          }

          if (this.flktyNav !== null && typeof this.flktyNav == 'object') {
            this.flktyNav.resize();
          }
        }
      }

      createScrollable() {
        if (!this.scrollable) return;

        if (isMobile()) {
          this.customScrollbar = new CustomScrollbar(this.container);
        } else if (this.customScrollbar) {
          this.customScrollbar.destroy();
        }
      }

      switchMedia(currentMedia) {
        const otherMedia = Array.prototype.filter.call(currentMedia.parentNode.children, function (child) {
          return child !== currentMedia;
        });
        const isFocusEnabled = document.body.classList.contains(classes$o.focusEnabled);

        if (isFocusEnabled) {
          currentMedia.dispatchEvent(new Event('focus'));
        }

        if (otherMedia.length) {
          otherMedia.forEach((element) => {
            element.classList.add(classes$o.mediaHidden);
            element.dispatchEvent(new CustomEvent('theme:media:hidden'));
          });
        }

        currentMedia.classList.remove(classes$o.mediaHidden);
        currentMedia.dispatchEvent(new CustomEvent('theme:media:visible'));

        // Force media loading if slide becomes visible
        const deferredMedia = currentMedia.querySelector('deferred-media');
        if (deferredMedia && deferredMedia.getAttribute('loaded') !== true) {
          currentMedia.querySelector(selectors$x.deferredMediaButton).dispatchEvent(new Event('click', {bubbles: false}));
        }
      }

      unload() {
        document.removeEventListener('theme:resize:width', this.resizeEvent);
      }
    }

    const selectors$w = {
      popupContainer: '.pswp',
      popupCloseBtn: '.pswp__custom-close',
      popupIframe: 'iframe, video',
      popupCustomIframe: '.pswp__custom-iframe',
      popupThumbs: '.pswp__thumbs',
      dataOptionClasses: 'data-pswp-option-classes',
      dataVideoType: 'data-video-type',
    };

    const classes$n = {
      classCurrent: 'is-current',
      classCustomLoader: 'pswp--custom-loader',
      classCustomOpen: 'pswp--custom-opening',
      classLoader: 'pswp__loader',
    };

    const loaderHTML = `<div class="${classes$n.classLoader}"><div class="loader pswp__loader-line"><div class="loader-indeterminate"></div></div></div>`;

    class LoadPhotoswipe {
      constructor(items, options = '') {
        this.accessibility = a11y;
        this.items = items;
        this.pswpElement = document.querySelectorAll(selectors$w.popupContainer)[0];
        this.popup = null;
        this.popupThumbs = null;
        this.popupThumbsContainer = this.pswpElement.querySelector(selectors$w.popupThumbs);
        this.closeBtn = this.pswpElement.querySelector(selectors$w.popupCloseBtn);
        this.closeButtonClick = () => this.closeButtonClickEvent();
        const defaultOptions = {
          history: false,
          focus: false,
          mainClass: '',
        };
        this.options = options !== '' ? options : defaultOptions;

        this.init();
      }

      init() {
        this.pswpElement.classList.add(classes$n.classCustomOpen);

        this.initLoader();

        loadScript({url: window.theme.assets.photoswipe})
          .then(() => this.loadPopup())
          .catch((e) => console.error(e));
      }

      initLoader() {
        if (this.pswpElement.classList.contains(classes$n.classCustomLoader) && this.options !== '' && this.options.mainClass) {
          this.pswpElement.setAttribute(selectors$w.dataOptionClasses, this.options.mainClass);
          let loaderElem = document.createElement('div');
          loaderElem.innerHTML = loaderHTML;
          loaderElem = loaderElem.firstChild;
          this.pswpElement.appendChild(loaderElem);
        } else {
          this.pswpElement.setAttribute(selectors$w.dataOptionClasses, '');
        }
      }

      loadPopup() {
        const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
        const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

        if (this.pswpElement.classList.contains(classes$n.classCustomLoader)) {
          this.pswpElement.classList.remove(classes$n.classCustomLoader);
        }

        this.pswpElement.classList.remove(classes$n.classCustomOpen);

        this.popup = new PhotoSwipe(this.pswpElement, PhotoSwipeUI, this.items, this.options);
        this.popup.init();

        this.accessibility.trapFocus(this.pswpElement);

        this.thumbsActions();

        if (this.closeBtn) {
          this.closeBtn.addEventListener('click', this.closeButtonClick);
        }

        this.popup.listen('close', () => this.onClose());
      }

      closeButtonClickEvent() {
        this.popup.close();
        this.accessibility.removeTrapFocus();
        if (theme.a11yTrigger !== null) {
          theme.a11yTrigger.focus();
        }
      }

      thumbsActions() {
        if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
          this.popupThumbsContainer.addEventListener('wheel', (e) => this.stopDisabledScroll(e));
          this.popupThumbsContainer.addEventListener('mousewheel', (e) => this.stopDisabledScroll(e));
          this.popupThumbsContainer.addEventListener('DOMMouseScroll', (e) => this.stopDisabledScroll(e));

          this.popupThumbs = this.pswpElement.querySelectorAll(`${selectors$w.popupThumbs} > *`);
          this.popupThumbs.forEach((element, i) => {
            element.addEventListener('click', (e) => {
              e.preventDefault();
              element.parentElement.querySelector(`.${classes$n.classCurrent}`).classList.remove(classes$n.classCurrent);
              element.classList.add(classes$n.classCurrent);
              this.popup.goTo(i);
            });
          });

          this.popup.listen('imageLoadComplete', () => this.setCurrentThumb());
          this.popup.listen('beforeChange', () => this.setCurrentThumb());
        }
      }

      stopDisabledScroll(e) {
        e.stopPropagation();
      }

      onClose() {
        const popupIframe = this.pswpElement.querySelector(selectors$w.popupIframe);
        if (popupIframe) {
          popupIframe.parentNode.removeChild(popupIframe);
        }

        if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
          while (this.popupThumbsContainer.firstChild) {
            this.popupThumbsContainer.removeChild(this.popupThumbsContainer.firstChild);
          }
        }

        this.pswpElement.setAttribute(selectors$w.dataOptionClasses, '');
        const loaderElem = this.pswpElement.querySelector(`.${classes$n.classLoader}`);
        if (loaderElem) {
          this.pswpElement.removeChild(loaderElem);
        }

        this.accessibility.removeTrapFocus();

        if (theme.a11yTrigger !== null) {
          theme.a11yTrigger.focus();
        }

        this.closeBtn.removeEventListener('click', this.closeButtonClick);
      }

      setCurrentThumb() {
        const lastCurrentThumb = this.pswpElement.querySelector(`${selectors$w.popupThumbs} > .${classes$n.classCurrent}`);
        if (lastCurrentThumb) {
          lastCurrentThumb.classList.remove(classes$n.classCurrent);
        }

        if (!this.popupThumbs) {
          return;
        }
        const currentThumb = this.popupThumbs[this.popup.getCurrentIndex()];
        currentThumb.classList.add(classes$n.classCurrent);
        this.scrollThumbs(currentThumb);
      }

      scrollThumbs(currentThumb) {
        const thumbsContainerLeft = this.popupThumbsContainer.scrollLeft;
        const thumbsContainerWidth = this.popupThumbsContainer.offsetWidth;
        const thumbsContainerPos = thumbsContainerLeft + thumbsContainerWidth;
        const currentThumbLeft = currentThumb.offsetLeft;
        const currentThumbWidth = currentThumb.offsetWidth;
        const currentThumbPos = currentThumbLeft + currentThumbWidth;

        if (thumbsContainerPos <= currentThumbPos || thumbsContainerPos > currentThumbLeft) {
          const currentThumbMarginLeft = parseInt(window.getComputedStyle(currentThumb).marginLeft);
          this.popupThumbsContainer.scrollTo({
            top: 0,
            left: currentThumbLeft - currentThumbMarginLeft,
            behavior: 'smooth',
          });
        }
      }
    }

    const selectors$v = {
      productContainer: '[data-product-container]',
      productSlideshow: '[data-product-slideshow]',
      zoomWrapper: '[data-zoom-wrapper]',
      dataImageSrc: 'data-image-src',
      dataImageWidth: 'data-image-width',
      dataImageHeight: 'data-image-height',
      dataImageZoomEnable: 'data-lightbox',
    };

    const classes$m = {
      popupClass: 'pswp-zoom-gallery',
      popupClassNoThumbs: 'pswp-zoom-gallery--single',
      isMoving: 'is-moving',
    };

    class Zoom {
      constructor(section) {
        this.container = section.container;
        this.productContainer = this.container.querySelector(selectors$v.productContainer);
        this.slideshow = this.container.querySelector(selectors$v.productSlideshow);
        this.zoomWrappers = this.container.querySelectorAll(selectors$v.zoomWrapper);
        this.zoomEnable = this.productContainer.getAttribute(selectors$v.dataImageZoomEnable) === 'true';

        if (this.zoomEnable) {
          this.init();
        }
      }

      init() {
        if (this.zoomWrappers.length) {
          this.zoomWrappers.forEach((element, i) => {
            element.addEventListener('click', (e) => {
              e.preventDefault();

              const isMoving = this.slideshow && this.slideshow.classList.contains(classes$m.isMoving);
              theme.a11yTrigger = element;

              if (!isMoving) {
                this.createZoom(i);
              }
            });

            element.addEventListener('keyup', (e) => {
              // On keypress Enter move the focus to the first focusable element in the related slide
              if (e.code === 'Enter') {
                e.preventDefault();

                element.dispatchEvent(new Event('click'));
              }
            });
          });
        }
      }

      createZoom(indexImage) {
        const instance = this;
        let items = [];
        let counter = 0;

        this.zoomWrappers.forEach((elementImage) => {
          const imgSrc = elementImage.getAttribute('href');
          const imgWidth = parseInt(elementImage.getAttribute(selectors$v.dataImageWidth));
          const imgHeight = parseInt(elementImage.getAttribute(selectors$v.dataImageHeight));

          items.push({
            src: imgSrc,
            w: imgWidth,
            h: imgHeight,
            msrc: imgSrc,
          });

          counter += 1;
          if (instance.zoomWrappers.length === counter) {
            let popupClass = `${classes$m.popupClass}`;
            if (counter === 1) {
              popupClass = `${classes$m.popupClass} ${classes$m.popupClassNoThumbs}`;
            }
            const options = {
              barsSize: {top: 0, bottom: 'auto'},
              history: false,
              focus: false,
              index: indexImage,
              mainClass: popupClass,
              showHideOpacity: true,
              showAnimationDuration: 250,
              hideAnimationDuration: 250,
              closeOnScroll: false,
              closeOnVerticalDrag: false,
              captionEl: false,
              closeEl: true,
              closeElClasses: ['caption-close'],
              tapToClose: false,
              clickToCloseNonZoomable: false,
              maxSpreadZoom: 2,
              loop: true,
              spacing: 0,
              allowPanToNext: true,
              pinchToClose: false,
            };

            new LoadPhotoswipe(items, options);
          }
        });
      }
    }

    const hosts = {
      html5: 'html5',
      youtube: 'youtube',
    };

    const selectors$u = {
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
      productMediaWrapper: '[data-product-single-media-wrapper]',
      productMediaSlider: '[data-product-single-media-slider]',
      mediaContainer: '[data-video]',
      mediaId: 'data-media-id',
    };

    const classes$l = {
      mediaHidden: 'media--hidden',
    };

    theme.mediaInstances = {};
    class Video {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.id = section.id;
        this.players = {};
        this.init();
      }

      init() {
        const mediaContainers = this.container.querySelectorAll(selectors$u.mediaContainer);

        mediaContainers.forEach((mediaContainer) => {
          const deferredMediaButton = mediaContainer.querySelector(selectors$u.deferredMediaButton);

          if (deferredMediaButton) {
            deferredMediaButton.addEventListener('click', this.loadContent.bind(this, mediaContainer));
          }
        });
      }

      loadContent(mediaContainer) {
        if (mediaContainer.querySelector(selectors$u.deferredMedia).getAttribute('loaded')) {
          return;
        }

        const content = document.createElement('div');
        content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
        const mediaId = mediaContainer.dataset.mediaId;
        const element = content.querySelector('video, iframe');
        const host = this.hostFromVideoElement(element);
        const deferredMedia = mediaContainer.querySelector(selectors$u.deferredMedia);
        deferredMedia.appendChild(element).focus();
        deferredMedia.setAttribute('loaded', true);

        this.players[mediaId] = {
          mediaId: mediaId,
          sectionId: this.id,
          container: mediaContainer,
          element: element,
          host: host,
          ready: () => {
            this.createPlayer(mediaId);
          },
        };

        const video = this.players[mediaId];

        switch (video.host) {
          case hosts.html5:
            this.loadVideo(video, hosts.html5);
            break;
          case hosts.youtube:
            if (window.isYoutubeAPILoaded) {
              this.loadVideo(video, hosts.youtube);
            } else {
              loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadVideo(video, hosts.youtube));
            }
            break;
        }
      }

      hostFromVideoElement(video) {
        if (video.tagName === 'VIDEO') {
          return hosts.html5;
        }

        if (video.tagName === 'IFRAME') {
          if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(video.src)) {
            return hosts.youtube;
          }
        }
        return null;
      }

      loadVideo(video, host) {
        if (video.host === host) {
          video.ready();
        }
      }

      createPlayer(mediaId) {
        const video = this.players[mediaId];
        const enableLooping = video.container.dataset.enableVideoLooping;

        switch (video.host) {
          case hosts.html5:
            // Force video play on iOS
            video.element.play();
            video.element.addEventListener('play', () => {
              this.pauseOtherMedia(mediaId);
            });

            video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
            video.container.addEventListener('theme:xr-launch', (event) => this.onHidden(event));
            video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));

            this.observeVideo(video);

            break;

          case hosts.youtube:
            if (video.host == hosts.youtube && video.player) {
              return;
            }

            YT.ready(() => {
              const videoId = video.container.dataset.videoId;

              this.players[mediaId].player = new YT.Player(video.element, {
                videoId: videoId,
                events: {
                  onReady: (event) => {
                    event.target.playVideo(); // Force video autoplay on iOS
                  },
                  onStateChange: (event) => {
                    if (event.data === 0) {
                      // ended
                      if (enableLooping) {
                        event.target.seekTo(0);
                      }
                    }
                    if (event.data === 1) {
                      // playing
                      this.pauseOtherMedia(mediaId);
                    }
                    if (event.data === 2) ;
                  },
                },
              });

              window.isYoutubeAPILoaded = true;

              // Force video play on iOS
              video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
              video.container.addEventListener('theme:xr-launch', (event) => this.onHidden(event));
              video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));

              this.observeVideo(video);
            });

            break;
        }
      }

      observeVideo(video) {
        let observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              const outsideViewport = entry.intersectionRatio != 1;

              if (outsideViewport) {
                this.pauseVideo(video);
              } else {
                this.playVideo(video);
              }
            });
          },
          {threshold: 1}
        );
        observer.observe(video.element);
      }

      playVideo(video) {
        if (video.player && video.player.playVideo) {
          video.player.playVideo();
        } else if (video.element && video.element.play) {
          video.element.play();
        }
      }

      pauseVideo(video) {
        if (video.player && video.player.pauseVideo) {
          video.player.pauseVideo();
        } else if (video.element && video.element.pause) {
          video.element.pause();
        }
      }

      onHidden(event) {
        if (typeof event.target.dataset.mediaId !== 'undefined') {
          const mediaId = event.target.dataset.mediaId;
          const video = this.players[mediaId];
          this.pauseVideo(video);
        }
      }

      onVisible(event) {
        if (typeof event.target.dataset.mediaId !== 'undefined') {
          const mediaId = event.target.dataset.mediaId;
          const video = this.players[mediaId];
          this.playVideo(video);
        }
      }

      pauseOtherMedia(mediaId) {
        const mediaIdString = `[${selectors$u.mediaId}="${mediaId}"]`;
        const currentMedia = document.querySelector(`${selectors$u.productMediaWrapper}${mediaIdString}`);
        const otherMedia = document.querySelectorAll(`${selectors$u.productMediaWrapper}:not(${mediaIdString})`);
        currentMedia.classList.remove(classes$l.mediaHidden);

        if (otherMedia.length) {
          otherMedia.forEach((element) => {
            element.dispatchEvent(new CustomEvent('theme:media:hidden'));
            element.classList.add(classes$l.mediaHidden);
          });
        }
      }
    }

    theme.mediaInstances = {};

    const selectors$t = {
      videoPlayer: '[data-video]',
      modelViewer: '[data-model]',
      sliderEnabled: 'flickity-enabled',
      classMediaHidden: 'media--hidden',
    };

    class Media {
      constructor(section) {
        this.section = section;
        this.id = section.id;
        this.container = section.container;
      }

      init() {
        this.detect3d();
        this.launch3d();

        new Video(this.section);
        new Zoom(this.section);
        new InitSlider(this.section);
      }

      detect3d() {
        const modelViewerElements = this.container.querySelectorAll(selectors$t.modelViewer);
        if (modelViewerElements.length) {
          modelViewerElements.forEach((element) => {
            theme.ProductModel.init(element, this.id);
          });
        }
      }

      launch3d() {
        const instance = this;

        document.addEventListener('shopify_xr_launch', function () {
          const currentMedia = instance.container.querySelector(`${selectors$t.modelViewer}:not(.${selectors$t.classMediaHidden})`);
          currentMedia.dispatchEvent(new CustomEvent('theme:xr-launch'));
        });
      }
    }

    const selectors$s = {
      list: '[data-store-availability-list]',
    };

    const defaults = {
      close: '.js-modal-close',
      open: '.js-modal-open-store-availability-modal',
      openClass: 'modal--is-active',
      openBodyClass: 'modal--is-visible',
      closeModalOnClick: false,
    };

    class Modals {
      constructor(id, options) {
        this.modal = document.getElementById(id);
        this.accessibility = a11y;

        if (!this.modal) {
          return false;
        }

        this.nodes = {
          parents: [document.querySelector('html'), document.body],
        };

        this.config = Object.assign(defaults, options);

        this.modalIsOpen = false;

        this.focusOnOpen = this.config.focusOnOpen ? document.getElementById(this.config.focusOnOpen) : this.modal;

        this.openElement = document.querySelector(this.config.open);
        this.init();
      }

      init() {
        this.openElement.addEventListener('click', this.open.bind(this));

        this.modal.querySelector(this.config.close).addEventListener('click', this.closeModal.bind(this));
      }

      open(evt) {
        var self = this;

        // Keep track if modal was opened from a click, or called by another function
        var externalCall = false;

        if (this.modalIsOpen) {
          return;
        }

        // Prevent following href if link is clicked
        if (evt) {
          evt.preventDefault();
        } else {
          externalCall = true;
        }

        // Without this, the modal opens, the click event bubbles up
        // which closes the modal.
        if (evt && evt.stopPropagation) {
          evt.stopPropagation();
        }

        if (this.modalIsOpen && !externalCall) {
          this.closeModal();
        }

        this.modal.classList.add(this.config.openClass);

        this.nodes.parents.forEach(function (node) {
          node.classList.add(self.config.openBodyClass);
        });

        this.modalIsOpen = true;

        // Scroll lock
        this.scrollableElement = document.querySelector(selectors$s.list);
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.scrollableElement}));

        this.accessibility.trapFocus(this.modal);

        this.bindEvents();
      }

      closeModal() {
        if (!this.modalIsOpen) {
          return;
        }

        document.activeElement.blur();

        this.modal.classList.remove(this.config.openClass);

        var self = this;

        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        this.nodes.parents.forEach(function (node) {
          node.classList.remove(self.config.openBodyClass);
        });

        this.modalIsOpen = false;

        this.accessibility.removeTrapFocus();

        this.openElement.focus();

        this.unbindEvents();
      }

      bindEvents() {
        this.keyupHandler = this.keyupHandler.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        document.body.addEventListener('keyup', this.keyupHandler);
        document.body.addEventListener('click', this.clickHandler);
      }

      unbindEvents() {
        document.body.removeEventListener('keyup', this.keyupHandler);
        document.body.removeEventListener('click', this.clickHandler);
      }

      keyupHandler(event) {
        if (event.code === 'Escape') {
          this.closeModal();
        }
      }

      clickHandler(event) {
        if (this.config.closeModalOnClick && !this.modal.contains(event.target)) {
          this.closeModal();
        }
      }
    }

    const selectors$r = {
      body: 'body',
      storeAvailabilityModal: '[data-store-availability-modal]',
      storeAvailabilityModalOpen: '[data-store-availability-modal-open]',
      storeAvailabilityModalClose: '[data-store-availability-modal-close]',
      storeAvailabilityModalProductTitle: '[data-store-availability-modal-product-title]',
    };

    const classes$k = {
      openClass: 'store-availabilities-modal--active',
      hidden: 'visually-hidden',
    };

    class StoreAvailability {
      constructor(container) {
        this.container = container;
      }

      updateContent(variantId, productTitle) {
        this._fetchStoreAvailabilities(variantId, productTitle);
      }

      clearContent() {
        this.container.innerHTML = '';
      }

      _initModal() {
        return new Modals('StoreAvailabilityModal', {
          close: selectors$r.storeAvailabilityModalClose,
          open: selectors$r.storeAvailabilityModalOpen,
          closeModalOnClick: true,
          openClass: classes$k.openClass,
        });
      }

      _fetchStoreAvailabilities(variantId, productTitle) {
        const variantSectionUrl = `/variants/${variantId}/?section_id=store-availability`;
        this.clearContent();
        const self = this;
        fetch(variantSectionUrl)
          .then(function (response) {
            return response.text();
          })
          .then(function (storeAvailabilityHTML) {
            if (storeAvailabilityHTML.trim() === '') {
              return;
            }

            const body = document.querySelector(selectors$r.body);
            let storeAvailabilityModal = body.querySelector(selectors$r.storeAvailabilityModal);

            if (storeAvailabilityModal) {
              storeAvailabilityModal.remove();
            }

            self.container.innerHTML = storeAvailabilityHTML;
            self.container.innerHTML = self.container.firstElementChild.innerHTML;

            const storeAvailabilityModalOpen = self.container.querySelector(selectors$r.storeAvailabilityModalOpen);
            // Only create modal if open modal element exists
            if (!storeAvailabilityModalOpen) {
              return;
            }

            self.modal = self._initModal();
            self._updateProductTitle(productTitle);

            storeAvailabilityModal = self.container.querySelector(selectors$r.storeAvailabilityModal);

            if (storeAvailabilityModal) {
              body.appendChild(storeAvailabilityModal);
            }
          });
      }

      _updateProductTitle(productTitle) {
        const stripHtmlRegex = /(<([^>]+)>)/gi;
        const storeAvailabilityModalProductTitle = this.container.querySelector(selectors$r.storeAvailabilityModalProductTitle);
        storeAvailabilityModalProductTitle.textContent = productTitle.replace(stripHtmlRegex, '');
      }
    }

    function Listeners() {
      this.entries = [];
    }

    Listeners.prototype.add = function (element, event, fn) {
      this.entries.push({element: element, event: event, fn: fn});
      element.addEventListener(event, fn);
    };

    Listeners.prototype.removeAll = function () {
      this.entries = this.entries.filter(function (listener) {
        listener.element.removeEventListener(listener.event, listener.fn);
        return false;
      });
    };

    /**
     * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromSerializedArray(product, collection) {
      _validateProductStructure(product);

      // If value is an array of options
      var optionArray = _createOptionArrayFromOptionCollection(product, collection);
      return getVariantFromOptionArray(product, optionArray);
    }

    /**
     * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromOptionArray(product, options) {
      _validateProductStructure(product);
      _validateOptionsArray(options);

      var result = product.variants.filter(function (variant) {
        return options.every(function (option, index) {
          return variant.options[index] === option;
        });
      });

      return result[0] || null;
    }

    /**
     * Creates an array of selected options from the object
     * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
     * @param {Object} product Product JSON object
     * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
     */
    function _createOptionArrayFromOptionCollection(product, collection) {
      _validateProductStructure(product);
      _validateSerializedArray(collection);

      var optionArray = [];

      collection.forEach(function (option) {
        for (var i = 0; i < product.options.length; i++) {
          var name = product.options[i].name || product.options[i];
          if (name.toLowerCase() === option.name.toLowerCase()) {
            optionArray[i] = option.value;
            break;
          }
        }
      });

      return optionArray;
    }

    /**
     * Check if the product data is a valid JS object
     * Error will be thrown if type is invalid
     * @param {object} product Product JSON object
     */
    function _validateProductStructure(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (Object.keys(product).length === 0 && product.constructor === Object) {
        throw new Error(product + ' is empty.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted like jQuery's serializeArray()
     * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
     */
    function _validateSerializedArray(collection) {
      if (!Array.isArray(collection)) {
        throw new TypeError(collection + ' is not an array.');
      }

      if (collection.length === 0) {
        throw new Error(collection + ' is empty.');
      }

      if (collection[0].hasOwnProperty('name')) {
        if (typeof collection[0].name !== 'string') {
          throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
        }
      } else {
        throw new Error(collection[0] + 'does not contain name key.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted as list of values
     * @param {Array} collection Array of object (e.g. ['36', 'Black'])
     */
    function _validateOptionsArray(options) {
      if (Array.isArray(options) && typeof options[0] === 'object') {
        throw new Error(options + 'is not a valid array of options.');
      }
    }

    var selectors$q = {
      idInput: '[name="id"]',
      optionInput: '[name^="options"]',
      quantityInput: '[name="quantity"]',
      propertyInput: '[name^="properties"]',
    };

    /**
     * Constructor class that creates a new instance of a product form controller.
     *
     * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
     * @param {Object} product - A product object
     * @param {Object} options - Optional options object
     * @param {Function} options.onOptionChange - Callback for whenever an option input changes
     * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
     * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
     * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
     */
    function ProductForm(element, product, options) {
      this.element = element;
      this.product = _validateProductObject(product);

      options = options || {};

      this._listeners = new Listeners();
      this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

      this.optionInputs = this._initInputs(selectors$q.optionInput, options.onOptionChange);

      //this.quantityInputs = this._initInputs(selectors.quantityInput, options.onQuantityChange);

      this.propertyInputs = this._initInputs(selectors$q.propertyInput, options.onPropertyChange);
    }

    /**
     * Cleans up all event handlers that were assigned when the Product Form was constructed.
     * Useful for use when a section needs to be reloaded in the theme editor.
     */
    ProductForm.prototype.destroy = function () {
      this._listeners.removeAll();
    };

    /**
     * Getter method which returns the array of currently selected option values
     *
     * @returns {Array} An array of option values
     */
    ProductForm.prototype.options = function () {
      return _serializeInputValues(this.optionInputs, function (item) {
        var regex = /(?:^(options\[))(.*?)(?:\])/;
        item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
        return item;
      });
    };

    /**
     * Getter method which returns the currently selected variant, or `null` if variant
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */
    ProductForm.prototype.variant = function () {
      return getVariantFromSerializedArray(this.product, this.options());
    };

    /**
     * Getter method which returns a collection of objects containing name and values
     * of property inputs
     *
     * @returns {Array} Collection of objects with name and value keys
     */
    ProductForm.prototype.properties = function () {
      return _serializeInputValues(this.propertyInputs, function (item) {
        var regex = /(?:^(properties\[))(.*?)(?:\])/;
        item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
        return item;
      });
    };

    /**
     * Getter method which returns the current quantity or 1 if no quantity input is
     * included in the form
     *
     * @returns {Array} Collection of objects with name and value keys
     */
    ProductForm.prototype.quantity = function () {
      return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
    };

    // Private Methods
    // -----------------------------------------------------------------------------
    ProductForm.prototype._setIdInputValue = function (value) {
      var idInputElement = this.element.querySelector(selectors$q.idInput);

      if (!idInputElement) {
        idInputElement = document.createElement('input');
        idInputElement.type = 'hidden';
        idInputElement.name = 'id';
        this.element.appendChild(idInputElement);
      }

      idInputElement.value = value.toString();
    };

    ProductForm.prototype._onSubmit = function (options, event) {
      event.dataset = this._getProductFormEventData();

      this._setIdInputValue(event.dataset.variant.id);

      if (options.onFormSubmit) {
        options.onFormSubmit(event);
      }
    };

    ProductForm.prototype._onFormEvent = function (cb) {
      if (typeof cb === 'undefined') {
        return Function.prototype;
      }

      return function (event) {
        event.dataset = this._getProductFormEventData();
        cb(event);
      }.bind(this);
    };

    ProductForm.prototype._initInputs = function (selector, cb) {
      var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

      return elements.map(
        function (element) {
          this._listeners.add(element, 'change', this._onFormEvent(cb));
          return element;
        }.bind(this)
      );
    };

    ProductForm.prototype._getProductFormEventData = function () {
      return {
        options: this.options(),
        variant: this.variant(),
        properties: this.properties(),
        //quantity: this.quantity(),
      };
    };

    function _serializeInputValues(inputs, transform) {
      return inputs.reduce(function (options, input) {
        if (
          input.checked || // If input is a checked (means type radio or checkbox)
          (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
        ) {
          options.push(transform({name: input.name, value: input.value}));
        }

        return options;
      }, []);
    }

    function _validateProductObject(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (typeof product.variants[0].options === 'undefined') {
        throw new TypeError(
          'Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route'
        );
      }

      return product;
    }

    const events$1 = {
      variantChange: 'variant-change',
    };

    const selectors$p = {
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      colorLabel: '[data-color-label]',
      comparePrice: '[data-compare-price]',
      dataImageId: 'data-id',
      dataOption: '[data-option]',
      idInput: '[name="id"]',
      notificationForm: '[data-notification-form]',
      originalSelectorId: '[data-product-select]',
      preOrderTag: '_preorder',
      priceWrapper: '[data-price-wrapper]',
      product: '[data-product-container]',
      productForm: '[data-product-form-container]',
      productImage: '[data-product-single-media-wrapper]',
      productImagesScroller: '[data-custom-scrollbar-items]',
      productJson: '[data-product-json]',
      productPrice: '[data-product-price]',
      productSlideshow: '[data-product-slideshow]',
      remainingCount: '[data-remaining-count]',
      remainingMax: '[data-remaining-max]',
      remainingWrapper: '[data-remaining-wrapper]',
      remainingJSON: '[data-product-remaining-json]',
      shopBarImageActive: '[data-shop-bar-image-active]',
      showQuantity: '[data-show-quantity]',
      storeAvailabilityContainer: '[data-store-availability-container]',
      unitBase: '[data-product-base]',
      unitPrice: '[data-product-unit-price]',
      unitWrapper: '[data-product-unit]',
      variantId: '[data-variant-id]',
      variantIdAttr: 'data-variant-id',
      dataSectionId: 'data-section-id',
    };

    const classes$j = {
      hidden: 'hidden',
      hiddenPrice: 'product__price--hidden',
      onboarding: 'onboarding-product',
      productPriceSale: 'product__price--sale',
      remainingIn: 'count-is-in',
      remainingLow: 'count-is-low',
      remainingOut: 'count-is-out',
      remainingUnavailable: 'count-is-unavailable',
      shopBarImageShown: 'shop-bar__image--shown',
      sliderEnabled: 'flickity-enabled',
      visuallyHidden: 'visually-hidden',
    };

    const attributes$6 = {
      enableHistoryState: 'data-enable-history-state',
      remainingMax: 'data-remaining-max',
      scrollableImages: 'data-product-scrollable-images',
      shopBarImageActive: 'data-shop-bar-image-active',
      variantId: 'data-variant-id',
    };

    class ProductAddForm {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.sectionId = this.container.getAttribute(selectors$p.dataSectionId);
        this.product = this.container.querySelector(selectors$p.product);
        this.onboarding = this.product.classList.contains(classes$j.onboarding);
        this.scrollable = this.product.hasAttribute(attributes$6.scrollableImages);
        this.storeAvailabilityContainer = this.container.querySelector(selectors$p.storeAvailabilityContainer);
        this.enableHistoryState = this.container.getAttribute(attributes$6.enableHistoryState) === 'true';

        // Stop parsing if we don't have the product
        if (!this.product || this.onboarding) {
          return;
        }

        this.productForm = this.container.querySelector(selectors$p.productForm);

        this.remainingWrapper = this.container.querySelector(selectors$p.remainingWrapper);

        if (this.remainingWrapper) {
          const remainingMaxWrap = this.container.querySelector(selectors$p.remainingMax);
          if (remainingMaxWrap) {
            this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(attributes$6.remainingMax), 10);
            this.remainingCount = this.container.querySelector(selectors$p.remainingCount);
            this.remainingJSONWrapper = this.container.querySelector(selectors$p.remainingJSON);
            this.remainingJSON = null;

            if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
              this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
            } else {
              console.warn('Missing product quantity JSON');
            }
          }
        }

        if (this.product.querySelector(selectors$p.showQuantity)) {
          const counter = new QuantityCounter(this.container);
          counter.init();
        }

        this.init();

        this.hasUnitPricing = this.container.querySelector(selectors$p.unitWrapper);
      }

      init() {
        let productJSON = null;
        const productElemJSON = this.container.querySelector(selectors$p.productJson);
        if (productElemJSON) {
          productJSON = productElemJSON.innerHTML;
        }
        if (productJSON) {
          this.productJSON = JSON.parse(productJSON);
          this.linkForm();
        } else {
          console.error('Missing product JSON');
        }

        if (this.storeAvailabilityContainer) {
          this.storeAvailability = new StoreAvailability(this.storeAvailabilityContainer);
          let variantId = this.productForm.product.variants[0].id;

          if (this.productForm.product.variants.length > 1) {
            // If there are more variants - set current variant id
            variantId = this.productForm.variant().id;
          }
          this.storeAvailability.updateContent(variantId, this.productForm.product.title);
        }
      }

      destroy() {
        this.productForm.destroy();
      }

      linkForm() {
        this.productForm = new ProductForm(this.productForm, this.productJSON, {
          onOptionChange: this.onOptionChange.bind(this),
        });

        const variants = this.productForm.product.variants;
        const variant = variants.length > 1 ? this.productForm._getProductFormEventData().variant : variants[0];

        this.fireHookEvent(variant);

        if (variants.length > 1) {
          this.updateRemaining(this.productForm._getProductFormEventData());
        }
      }

      onOptionChange(evt) {
        this.updateAddToCartState(evt);
        this.updateProductImage(evt);
        this.updateProductPrices(evt);
        this.updateColorName(evt);
        this.updateHiddenSelect(evt);
        this.updateShopBarImage(evt);
        this.updateRemaining(evt);
        this.fireHookEvent(evt.dataset.variant);
        if (this.enableHistoryState) {
          this.updateHistoryState(evt);
        }

        if (this.storeAvailability) {
          this.updateStoreAvailability(evt);
        }
      }

      updateHistoryState(evt) {
        const variant = evt.dataset.variant;
        const location = window.location.href;
        if (variant && location.includes('/product')) {
          const url = new window.URL(location);
          const params = url.searchParams;
          params.set('variant', variant.id);
          url.search = params.toString();
          const urlString = url.toString();
          window.history.replaceState({path: urlString}, '', urlString);
        }
      }

      updateHiddenSelect(evt) {
        const variant = evt.dataset.variant;

        if (variant) {
          let idInputElement = this.container.querySelector(selectors$p.idInput);
          if (!idInputElement) {
            idInputElement = document.createElement('input');
            idInputElement.type = 'hidden';
            idInputElement.name = 'id';
            this.element.appendChild(idInputElement);
          }
          idInputElement.value = variant.id.toString();
          idInputElement.dispatchEvent(new Event('change', {bubbles: true}));
        }
      }

      updateAddToCartState(evt) {
        const variant = evt.dataset.variant;
        const notificationForm = this.container.querySelectorAll(selectors$p.notificationForm);
        const addToCart = this.container.querySelectorAll(selectors$p.addToCart);
        const addToCartText = this.container.querySelectorAll(selectors$p.addToCartText);
        const formSelects = this.container.querySelectorAll(selectors$p.originalSelectorId);
        let addText = theme.translations.add_to_cart;

        if (this.productJSON.tags.includes(selectors$p.preOrderTag)) {
          addText = theme.translations.pre_order;
        }

        if (notificationForm.length) {
          notificationForm.forEach((element) => {
            if (variant) {
              if (variant.available) {
                element.classList.add(classes$j.hidden);
              } else {
                element.classList.remove(classes$j.hidden);
              }
            } else {
              element.classList.remove(classes$j.hidden);
            }
          });
        }

        if (addToCart.length) {
          addToCart.forEach((element) => {
            if (variant) {
              if (variant.available) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            } else {
              element.disabled = true;
            }
          });
        }

        if (addToCartText.length) {
          addToCartText.forEach((element) => {
            if (variant) {
              if (variant.available) {
                element.innerHTML = addText;
              } else {
                element.innerHTML = theme.translations.sold_out;
              }
            } else {
              element.innerHTML = theme.translations.unavailable;
            }
          });
        }

        if (formSelects && variant) {
          formSelects.forEach((formSelect) => {
            formSelect.value = variant.id;
          });
        }
      }

      updateStoreAvailability(evt) {
        if (evt.dataset.variant) {
          this.storeAvailability.updateContent(evt.dataset.variant.id, evt.dataset.variant.title);
        } else {
          this.storeAvailability.clearContent();
        }
      }

      updateRemaining(evt) {
        const variant = evt?.variant || evt.dataset.variant;

        this.remainingWrapper?.classList.remove(classes$j.remainingIn, classes$j.remainingOut, classes$j.remainingUnavailable, classes$j.remainingLow);

        if (variant && this.remainingWrapper && this.remainingJSON) {
          const remaining = this.remainingJSON[variant.id];

          if (remaining === 'out' || remaining < 1) {
            this.remainingWrapper.classList.add(classes$j.remainingOut);
          }

          if (remaining === 'in' || remaining >= this.remainingMaxInt) {
            this.remainingWrapper.classList.add(classes$j.remainingIn);
          }
          if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
            this.remainingWrapper.classList.add(classes$j.remainingLow);

            if (this.remainingCount) {
              this.remainingCount.innerHTML = remaining;
            }
          }
        } else if (!variant && this.remainingWrapper) {
          this.remainingWrapper.classList.add(classes$j.remainingUnavailable);
        }
      }

      getBaseUnit(variant) {
        return variant.unit_price_measurement.reference_value === 1
          ? variant.unit_price_measurement.reference_unit
          : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
      }

      updateProductPrices(evt) {
        const variant = evt.dataset.variant;
        const priceWrappers = this.container.querySelectorAll(selectors$p.priceWrapper);

        priceWrappers.forEach((wrap) => {
          const comparePrice = wrap.querySelector(selectors$p.comparePrice);
          const productPrice = wrap.querySelector(selectors$p.productPrice);

          if (variant) {
            wrap.classList.remove(classes$j.hiddenPrice);
            productPrice.innerHTML = variant.price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(variant.price, theme.settings.moneyFormat);
          } else {
            wrap.classList.add(classes$j.hiddenPrice);
          }

          if (variant && variant.compare_at_price > variant.price) {
            comparePrice.innerHTML = themeCurrency.formatMoney(variant.compare_at_price, theme.settings.moneyFormat);
            comparePrice.classList.remove(classes$j.visuallyHidden);
            productPrice.classList.add(classes$j.productPriceSale);
          } else if (comparePrice) {
            comparePrice.innerHTML = '';
            comparePrice.classList.add(classes$j.visuallyHidden);
            productPrice.classList.remove(classes$j.productPriceSale);
          }
        });

        if (this.hasUnitPricing) {
          this.updateProductUnits(evt);
        }
      }

      updateProductUnits(evt) {
        const variant = evt.dataset.variant;
        let unitPrice = null;

        if (variant && variant.unit_price) {
          unitPrice = variant.unit_price;
        }

        if (unitPrice) {
          const base = this.getBaseUnit(variant);
          const price = themeCurrency.formatMoney(variant.unit_price, theme.moneyWithoutCurrencyFormat);

          this.container.querySelector(selectors$p.unitPrice).innerHTML = price;
          this.container.querySelector(selectors$p.unitBase).innerHTML = base;
          this.container.querySelector(selectors$p.unitWrapper).classList.remove(classes$j.hidden);
        } else {
          this.container.querySelector(selectors$p.unitWrapper).classList.add(classes$j.hidden);
        }
      }

      updateColorName(evt) {
        const target = evt.target;
        const optionLabel = target.closest(selectors$p.dataOption).querySelector(selectors$p.colorLabel);

        if (target.tagName === 'INPUT' && optionLabel !== null) {
          optionLabel.innerText = target.value;
        }
      }

      updateProductImage(evt) {
        const variant = evt.dataset.variant;

        if (variant) {
          // Update variant image, if one is set
          if (variant.featured_media) {
            const newImg = this.container.querySelector(`${selectors$p.productImage}[${selectors$p.dataImageId}*="${variant.featured_media.id}"]`);

            if (newImg) {
              const slider = this.container.querySelector(selectors$p.productSlideshow);

              if (slider && slider.classList.contains(classes$j.sliderEnabled)) {
                const newImagePos = Array.from(newImg.parentElement.children).indexOf(newImg);
                FlickityAsNavFor.data(slider).select(newImagePos);
              }

              // Scroll to variant image
              if (this.scrollable) {
                if (window.innerWidth >= theme.sizes.small) {
                  const headerHeight = 60; // Header height is always 60px on scroll
                  window.scrollTo({
                    top: newImg.getBoundingClientRect().top + window.scrollY - headerHeight,
                    left: 0,
                    behavior: 'smooth',
                  });
                } else {
                  const scroller = this.container.querySelector(selectors$p.productImagesScroller);
                  scroller.scrollTo({
                    top: 0,
                    left: newImg.getBoundingClientRect().left + scroller.scrollLeft,
                    behavior: 'smooth',
                  });
                }
              }
            }
          }
        }
      }

      updateShopBarImage(evt) {
        const variant = evt.dataset.variant;
        const shopBarImages = this.container.querySelectorAll(selectors$p.variantId);
        const activeImage = this.container.querySelector(selectors$p.shopBarImageActive);

        if (!variant || variant.featured_image === null) {
          return;
        }

        if (activeImage) {
          activeImage.classList.remove(classes$j.shopBarImageShown);
          activeImage.removeAttribute(attributes$6.shopBarImageActive);
        }

        shopBarImages.forEach((element) => {
          if (Number(variant.id) === Number(element.getAttribute(attributes$6.variantId))) {
            element.classList.add(classes$j.shopBarImageShown);
            element.setAttribute(attributes$6.shopBarImageActive, '');
          }
        });
      }

      fireHookEvent(variant) {
        publish(events$1.variantChange, {
          data: {
            sectionId: this.sectionId,
            variant,
          },
        });
      }
    }

    const productFormSection = {
      onLoad() {
        this.section = new ProductAddForm(this);
      },
    };

    const selectors$o = {
      id: 'id',
      apiContent: '[data-api-content]',
      container: '[data-section-id]',
      collectionSlider: '[data-collection-slider]',
      collectionSliderWrapper: '[data-collection-slider-wrapper]',
      quickviewWrap: '[data-quickview-wrap]',
      quickviewId: 'data-quickview-id',
      quickviewClose: '[data-quickview-close]',
      featuredBlock: '[data-collection-featured-block]',
      productBlock: '[data-product-block]',
      productContainer: '[data-product-container]',
      productImage: '[data-product-single-media-wrapper]',
      addToCart: '[data-add-to-cart]',
      handle: 'data-trigger-quickview',
      productSlider: '[data-product-slideshow]',
      swatch: '[data-swatch]',
      videoLoop: 'data-video-looping',
    };

    const classes$i = {
      isLoading: 'is-loading',
      isLoaded: 'is-loaded',
      isSelected: 'is-selected',
      isVisible: 'is-visible',
      isQuickviewOpen: 'is-quickview-open',
      focusEnabled: 'is-focused',
      sliderEnabled: 'flickity-enabled',
      mediaHidden: 'media--hidden',
    };

    /**
     * Button constructor, triggered for each button by Quickview
     */
    class QuickviewButton {
      constructor(button, id) {
        this.button = button;
        this.id = id;
        this.container = this.button.closest(selectors$o.container);
        this.collectionSliderWrapper = this.container.querySelector(selectors$o.collectionSliderWrapper);
        this.layoutCarousel = this.container.querySelector(selectors$o.collectionSlider);
        this.handle = this.button.getAttribute(selectors$o.handle);
        this.productBlock = this.button.closest(selectors$o.productBlock);
        this.quickview = null;
        this.quickviewWrap = null;
        this.quickviewClose = null;
        this.quickviewWrapHeight = 0;
        this.isQuickViewLoading = false;
        this.accessibility = a11y;
        this.swatches = [];
        this.form = {};
        this.init();
      }

      init() {
        this.initButton();
        this.initFetch();
      }

      initFetch() {
        this.productBlock.addEventListener(
          'theme:quickview:open',
          () => {
            this.renderProduct();
          },
          false
        );
      }

      renderProduct() {
        fetch(`${theme.routes.root}products/${this.handle}?section_id=api-quickview`)
          .then((response) => {
            return response.text();
          })
          .then((data) => {
            const fresh = document.createElement('div');
            fresh.innerHTML = data.replaceAll('||product-handle||', this.handle);
            const uniq = fresh.querySelector(selectors$o.quickviewWrap).dataset.quickviewId;

            if (this.layoutCarousel && this.collectionSliderWrapper) {
              this.collectionSliderWrapper.insertAdjacentHTML('beforeend', fresh.querySelector(selectors$o.apiContent).innerHTML);
            } else {
              this.productBlock.insertAdjacentHTML('beforeend', fresh.querySelector(selectors$o.apiContent).innerHTML);
            }

            this.productBlock.classList.add(classes$i.isLoaded);

            this.quickviewWrap = this.container.querySelector(`[${selectors$o.quickviewId}="${uniq}"]`);
            this.quickviewClose = this.quickviewWrap.querySelector(selectors$o.quickviewClose);
            this.quickviewWrapHeight = this.quickviewWrap.querySelector(selectors$o.productContainer).offsetHeight;
            this.quickview = this.quickviewWrap.parentNode;

            this.onLoaded();
            this.show();
          })
          .catch(function (error) {
            console.log('error: ', error);
          });
      }

      initButton() {
        const initButtons = this.productBlock.querySelectorAll(`[${selectors$o.handle}='${this.handle}']`);

        if (initButtons.length) {
          initButtons.forEach((element) => {
            element.addEventListener('click', (e) => {
              e.preventDefault();

              const productBlockLoaded = this.productBlock.classList.contains(classes$i.isLoaded);
              const productBlockVisible = this.productBlock.classList.contains(classes$i.isQuickviewOpen);
              const siblingsVisible = this.productBlock.parentNode.querySelector(`.${classes$i.isQuickviewOpen}`) !== null;
              const eventQuickview = new CustomEvent('theme:quickview:open', {
                handle: this.handle,
              });

              if (!this.isQuickViewLoading) {
                this.isQuickViewLoading = true;

                if (productBlockLoaded && productBlockVisible) {
                  // if loaded and visible
                  this.hide();
                } else if (productBlockLoaded && !productBlockVisible && !siblingsVisible) {
                  // if loaded but not visible, no other quickViews open
                  this.show();
                } else if (productBlockLoaded && !productBlockVisible && siblingsVisible) {
                  // if loaded and not visible, other quickViews are open
                  this.hide();
                  setTimeout(() => {
                    this.show();
                  }, 200);
                } else if (siblingsVisible) {
                  // if not loaded yet, other quickViews open
                  this.hide();
                  setTimeout(() => {
                    this.productBlock.dispatchEvent(eventQuickview);
                  }, 200);
                } else {
                  // if not loaded yet, no other quickViews open
                  this.productBlock.dispatchEvent(eventQuickview);
                }
              }
            });
          });
        }
      }

      show() {
        const sub = (window.innerHeight - this.quickviewWrapHeight) / 2;
        const offset = this.quickviewWrap.getBoundingClientRect().top + window.scrollY;
        const scrollPosition = offset - sub - theme.dimensions.headerScrolled;
        const featuredBlockHeight = getHeight(selectors$o.featuredBlock);
        const isFocusEnabled = document.body.classList.contains(classes$i.focusEnabled);
        const quickViewPattern = 'api-quickview';
        const quickViewIds = this.productBlock.querySelectorAll(`[id*="${quickViewPattern}"]`);
        const quickViewFors = this.productBlock.querySelectorAll(`[for*="${quickViewPattern}"]`);
        document.documentElement.style.setProperty('--collection-featured-block-height', `${featuredBlockHeight}px`);

        quickViewIds.forEach((element) => {
          const uniqueId = element.id.replace(quickViewPattern, this.id);
          element.id = uniqueId;
        });

        quickViewFors.forEach((element) => {
          const uniqueFor = element.getAttribute('for').replace(quickViewPattern, this.id);
          element.setAttribute('for', uniqueFor);
        });

        this.quickview.classList.remove(classes$i.isLoading);

        window.scrollTo({
          top: scrollPosition,
          left: 0,
          behavior: 'smooth',
        });

        this.productBlock.classList.add(classes$i.isQuickviewOpen);
        this.quickview.classList.add(classes$i.isVisible);
        this.isQuickViewLoading = false;

        if (isFocusEnabled) {
          this.accessibility.trapFocus(this.quickviewWrap, {
            elementToFocus: this.quickviewClose,
          });
        }
      }

      hide() {
        const productBlocks = this.productBlock.parentNode.querySelectorAll(selectors$o.productBlock);
        const isFocusEnabled = document.body.classList.contains(classes$i.focusEnabled);
        productBlocks.forEach((productBlock) => {
          if (productBlock.classList.contains(classes$i.isQuickviewOpen)) {
            const visibleImage = productBlock.querySelector(`${selectors$o.productImage}.${classes$i.isSelected}`);
            const uniq = productBlock.dataset.quickviewElement;
            const quickviewWrap = this.container.querySelector(`[${selectors$o.quickviewId}="${uniq}"]`);
            const quickview = quickviewWrap.parentNode;
            if (visibleImage !== null) {
              visibleImage.dispatchEvent(new CustomEvent('theme:media:hidden'));
              visibleImage.classList.remove(classes$i.mediaHidden);
            }

            if (quickview) {
              quickview.classList.remove(classes$i.isVisible, classes$i.isLoading);
            }

            productBlock.classList.remove(classes$i.isQuickviewOpen);
          }
        });

        this.isQuickViewLoading = false;
        this.accessibility.removeTrapFocus();

        if (isFocusEnabled) {
          const button = document.querySelector(`[${selectors$o.handle}="${this.handle}"]`);

          setTimeout(() => {
            document.documentElement.style.setProperty('--collection-featured-block-height', 'none');
            button.focus();
          }, 300);
        }
      }

      onLoaded() {
        const sectionId = `${this.id}-${this.quickviewWrap.getAttribute(selectors$o.quickviewId)}`;
        const slider = this.quickviewWrap.querySelector(selectors$o.productSlider);
        const hasSlider = slider.classList.contains(classes$i.sliderEnabled);

        const section = {
          id: sectionId,
          container: this.quickviewWrap,
          type: 'quickview',
        };

        if (theme.settings.enableVideoLooping) {
          this.quickviewWrap.setAttribute(selectors$o.videoLoop, true);
        }

        if (hasSlider) {
          window.dispatchEvent(new Event('resize'));
        } else if (typeof theme.mediaInstances[this.id] === 'undefined') {
          theme.mediaInstances[sectionId] = new Media(section);
          theme.mediaInstances[sectionId].init();
        } else {
          theme.mediaInstances[sectionId].initSlider();
        }

        this.form = new ProductAddForm(section);

        if (theme.settings.showQuantity) {
          const counter = new QuantityCounter(section.container);
          counter.init();
        }

        const swatches = section.container.querySelectorAll(selectors$o.swatch);
        swatches.forEach((swatch) => {
          this.swatches.push(new Swatch(swatch));
        });

        this.quickviewClose.addEventListener('click', (e) => {
          e.preventDefault();
          this.hide();
        });

        document.addEventListener('keyup', (event) => {
          if (event.code === 'Escape' && document.querySelectorAll(`${selectors$o.productBlock}.${classes$i.isVisible}`).length) {
            this.hide();
          }
        });

        const event = new CustomEvent('theme:quickview:loaded', {
          bubbles: true,
        });

        this.productBlock.dispatchEvent(event);

        this.initPaymentButton();
      }

      initPaymentButton() {
        const enablePaymentButton = theme.settings.enablePaymentButton;
        const enableAcceptTerms = theme.settings.enableAcceptTerms;

        if (enablePaymentButton && !enableAcceptTerms && typeof Shopify !== 'undefined' && typeof Shopify.PaymentButton !== 'undefined' && typeof Shopify.PaymentButton.init !== 'undefined') {
          Shopify.PaymentButton.init();
        }
      }
    }

    const selectors$n = {
      trigger: '[data-trigger-quickview]',
      dataSectionId: 'data-section-id',
    };

    const classes$h = {
      init: 'is-init',
    };

    let sections$j = {};

    class Quickview {
      constructor(container) {
        this.container = container;
        this.id = this.container.dataset.sectionId;

        if (theme.settings.showQuickView) {
          this.init();
        }
      }

      init() {
        sections$j[this.id] = [];
        const buttons = this.container.querySelectorAll(selectors$n.trigger);

        if (buttons.length) {
          buttons.forEach((element) => {
            if (!element.classList.contains(classes$h.init)) {
              sections$j[this.id].push(new QuickviewButton(element, this.id));
              element.classList.add(classes$h.init);
            }
          });
        }
      }
    }

    const quickviewSection = {
      onLoad() {
        this.section = new Quickview(this.container);
      },
    };

    const selectors$m = {
      infinityContainer: '[data-infinity]',
      pagination: '[data-pagination]',
      collectionBlockImage: '[data-product-image]',
      dataId: 'data-section-id',
    };

    let sections$i = {};

    class Ajaxify {
      constructor(container) {
        this.container = container;
        this.infinityContainer = this.container.querySelector(selectors$m.infinityContainer);
        this.endlessScroll = null;

        if (this.infinityContainer) {
          this.init();
        }
      }

      init() {
        const id = this.container.getAttribute(selectors$m.dataId);
        this.fix();
        this.endlessScroll = new Ajaxinate({
          container: `section[${selectors$m.dataId}="${id}"] ${selectors$m.infinityContainer}`,
          pagination: `section[${selectors$m.dataId}="${id}"] ${selectors$m.pagination}`,
          callback: () => {
            makeGridSwatches(this.container);
            new Quickview(this.container);
          },
        });
      }

      // Fix ajaxinate in theme editor
      fix() {
        Ajaxinate.prototype.loadMore = function loadMore() {
          this.request = new XMLHttpRequest();

          this.request.onreadystatechange = function success() {
            if (!this.request.responseXML) {
              return;
            }
            if (!this.request.readyState === 4 || !this.request.status === 200) {
              return;
            }

            const newContainer = this.request.responseXML.querySelector(this.settings.container);
            const newPagination = this.request.responseXML.querySelector(this.settings.pagination);

            this.containerElement.insertAdjacentHTML('beforeend', newContainer.innerHTML);

            if (typeof newPagination === 'undefined' || newPagination === null) {
              this.removePaginationElement();
            } else {
              this.paginationElement.innerHTML = newPagination.innerHTML;

              if (this.settings.callback && typeof this.settings.callback === 'function') {
                this.settings.callback(this.request.responseXML);
              }

              this.initialize();
            }
          }.bind(this);

          this.request.open('GET', this.nextPageUrl, true);
          this.request.responseType = 'document';
          this.request.send();
        };
      }

      unload() {
        if (this.endlessScroll) {
          this.endlessScroll.destroy();
        }
      }
    }

    const ajaxify = {
      onLoad() {
        sections$i = new Ajaxify(this.container);
      },
      onUnload: function () {
        if (typeof sections$i.unload === 'function') {
          sections$i.unload();
        }
      },
    };

    const sections$h = {};

    class Blog {
      constructor(section) {
        this.container = section.container;
        this.checkWidthOnResize = this.checkWindowWidth();

        this.init();
      }

      init() {
        this.checkWindowWidth();

        document.addEventListener('theme:resize', this.checkWidthOnResize);
      }

      checkWindowWidth() {
        if (window.innerWidth < theme.sizes.small) {
          removeAnimations(this.container);
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize', this.checkWidthOnResize);
      }
    }

    const BlogSection = {
      onLoad() {
        sections$h[this.id] = new Blog(this);
      },
      onUnload(e) {
        sections$h[this.id].onUnload(e);
      },
    };

    register('blog', [BlogSection, ajaxify]);
    register('featured-blog', BlogSection);

    const selectors$l = {
      popoutWrapper: '[data-popout]',
      popoutList: '[data-popout-list]',
      popoutToggle: '[data-popout-toggle]',
      popoutInput: '[data-popout-input]',
      popoutOptions: '[data-popout-option]',
      popoutPrevent: 'data-popout-prevent',
      popoutQuantity: 'data-quantity-field',
      dataValue: 'data-value',
      dataName: 'data-name',
      ariaExpanded: 'aria-expanded',
      ariaCurrent: 'aria-current',
    };

    const classes$g = {
      listVisible: 'popout-list--visible',
      currentSuffix: '--current',
      classPopoutAlternative: 'popout-container--alt',
    };

    let sections$g = {};

    class Popout {
      constructor(popout) {
        this.container = popout;
        this.popoutList = this.container.querySelector(selectors$l.popoutList);
        this.popoutToggle = this.container.querySelector(selectors$l.popoutToggle);
        this.popoutInput = this.container.querySelector(selectors$l.popoutInput);
        this.popoutOptions = this.container.querySelectorAll(selectors$l.popoutOptions);
        this.popoutPrevent = this.container.getAttribute(selectors$l.popoutPrevent) === 'true';

        this._connectOptions();
        this._connectToggle();
        this._onFocusOut();
        this.popupListMaxWidth();

        if (this.popoutInput && this.popoutInput.hasAttribute(selectors$l.popoutQuantity)) {
          document.addEventListener('theme:popout:update', this.updatePopout.bind(this));
        }
      }

      unload() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.removeEventListener('theme:popout:click', this.popupOptionsClick.bind(this));
            element.removeEventListener('click', this._connectOptionsDispatch.bind(this));
          });
        }

        this.popoutToggle.removeEventListener('click', this.popupToggleClick.bind(this));

        this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));

        this.popoutList.removeEventListener('focusout', this.popupListFocusout.bind(this));

        this.container.removeEventListener('keyup', this.containerKeyup.bind(this));
      }

      popupToggleClick(evt) {
        const ariaExpanded = evt.currentTarget.getAttribute(selectors$l.ariaExpanded) === 'true';
        evt.currentTarget.setAttribute(selectors$l.ariaExpanded, !ariaExpanded);
        this.popoutList.classList.toggle(classes$g.listVisible);
        this.popupListMaxWidth();
      }
      popupToggleFocusout(evt) {
        const popoutLostFocus = this.container.contains(evt.relatedTarget);

        if (!popoutLostFocus) {
          this._hideList();
        }
      }
      popupListFocusout(evt) {
        const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
        const isVisible = this.popoutList.classList.contains(classes$g.listVisible);

        if (isVisible && !childInFocus) {
          this._hideList();
        }
      }
      popupListMaxWidth() {
        this.popoutList.style.setProperty('--max-width', '100vw');
        requestAnimationFrame(() => {
          this.popoutList.style.setProperty('--max-width', `${parseInt(document.body.clientWidth - this.popoutList.getBoundingClientRect().left)}px`);
        });
      }
      popupOptionsClick(evt) {
        evt.preventDefault();
        let attrValue = '';
        if (evt.currentTarget.getAttribute(selectors$l.dataValue)) {
          attrValue = evt.currentTarget.getAttribute(selectors$l.dataValue);
        }
        this.popoutInput.value = attrValue;

        if (this.popoutPrevent) {
          attrValue = evt.currentTarget.getAttribute(selectors$l.dataName);
          this.popoutInput.dispatchEvent(new Event('change'));
          if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(selectors$l.popoutQuantity)) {
            this.popoutInput.dispatchEvent(new Event('input'));
          }
          const currentElement = this.popoutList.querySelector(`[class*="${classes$g.currentSuffix}"]`);
          let targetClass = classes$g.currentSuffix;
          if (currentElement && currentElement.classList.length) {
            for (const currentElementClass of currentElement.classList) {
              if (currentElementClass.includes(classes$g.currentSuffix)) {
                targetClass = currentElementClass;
                break;
              }
            }
          }

          const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);
          if (listTargetElement) {
            listTargetElement.classList.remove(`${targetClass}`);
            evt.currentTarget.parentElement.classList.add(`${targetClass}`);
          }

          const targetAttribute = this.popoutList.querySelector(`[${selectors$l.ariaCurrent}]`);
          if (targetAttribute && targetAttribute.hasAttribute(`${selectors$l.ariaCurrent}`)) {
            targetAttribute.removeAttribute(`${selectors$l.ariaCurrent}`);
            evt.currentTarget.setAttribute(`${selectors$l.ariaCurrent}`, 'true');
          }

          if (attrValue !== '') {
            this.popoutToggle.textContent = attrValue;
          }

          this.popupToggleFocusout(evt);
          this.popupListFocusout(evt);
        } else {
          this._submitForm(attrValue);
        }
      }
      updatePopout(evt) {
        const targetElement = this.popoutList.querySelector(`[${selectors$l.dataValue}="${this.popoutInput.value}"]`);
        if (targetElement) {
          targetElement.dispatchEvent(
            new CustomEvent('theme:popout:click', {
              cancelable: true,
              bubbles: true,
              detail: {
                preventTrigger: true,
              },
            })
          );

          if (!targetElement.parentElement.nextSibling) {
            this.container.classList.add(classes$g.classPopoutAlternative);
          }
        } else {
          this.container.classList.add(classes$g.classPopoutAlternative);
        }
      }

      containerKeyup(evt) {
        if (evt.code !== 'Escape') {
          return;
        }
        this._hideList();
        this.popoutToggle.focus();
      }

      bodyClick(evt) {
        const isOption = this.container.contains(evt.target);
        const isVisible = this.popoutList.classList.contains(classes$g.listVisible);

        if (isVisible && !isOption) {
          this._hideList();
        }
      }

      _connectToggle() {
        this.popoutToggle.addEventListener('click', this.popupToggleClick.bind(this));
      }

      _connectOptions() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.addEventListener('theme:popout:click', this.popupOptionsClick.bind(this));
            element.addEventListener('click', this._connectOptionsDispatch.bind(this));
          });
        }
      }

      _connectOptionsDispatch(evt) {
        const event = new CustomEvent('theme:popout:click', {
          cancelable: true,
          bubbles: true,
          detail: {
            preventTrigger: false,
          },
        });

        if (!evt.target.dispatchEvent(event)) {
          evt.preventDefault();
        }
      }

      _onFocusOut() {
        this.popoutToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));

        this.popoutList.addEventListener('focusout', this.popupListFocusout.bind(this));

        this.container.addEventListener('keyup', this.containerKeyup.bind(this));

        document.body.addEventListener('click', this.bodyClick.bind(this));
      }

      _submitForm(value) {
        const form = this.container.closest('form');
        if (form) {
          form.submit();
        }
      }

      _hideList() {
        this.popoutList.classList.remove(classes$g.listVisible);
        this.popoutToggle.setAttribute(selectors$l.ariaExpanded, false);
      }
    }

    const popoutSection = {
      onLoad() {
        sections$g[this.id] = [];
        const wrappers = this.container.querySelectorAll(selectors$l.popoutWrapper);
        wrappers.forEach((wrapper) => {
          sections$g[this.id].push(new Popout(wrapper));
        });
      },
      onUnload() {
        sections$g[this.id].forEach((popout) => {
          if (typeof popout.unload === 'function') {
            popout.unload();
          }
        });
      },
    };

    const selectors$k = {
      rangeSlider: '[data-range-slider]',
      rangeDotLeft: '[data-range-left]',
      rangeDotRight: '[data-range-right]',
      rangeLine: '[data-range-line]',
      rangeHolder: '[data-range-holder]',
      dataMin: 'data-se-min',
      dataMax: 'data-se-max',
      dataMinValue: 'data-se-min-value',
      dataMaxValue: 'data-se-max-value',
      dataStep: 'data-se-step',
      dataFilterUpdate: 'data-range-filter-update',
      priceMin: '[data-field-price-min]',
      priceMax: '[data-field-price-max]',
    };

    const classes$f = {
      classInitialized: 'is-initialized',
    };

    class RangeSlider {
      constructor(section) {
        this.container = section.container;
        this.slider = section.querySelector(selectors$k.rangeSlider);
        this.initFilters = () => this.init();

        if (this.slider) {
          this.onMoveEvent = (event) => this.onMove(event);
          this.onStopEvent = (event) => this.onStop(event);
          this.onStartEvent = (event) => this.onStart(event);
          this.startX = 0;
          this.x = 0;

          // retrieve touch button
          this.touchLeft = this.slider.querySelector(selectors$k.rangeDotLeft);
          this.touchRight = this.slider.querySelector(selectors$k.rangeDotRight);
          this.lineSpan = this.slider.querySelector(selectors$k.rangeLine);

          // get some properties
          this.min = parseFloat(this.slider.getAttribute(selectors$k.dataMin));
          this.max = parseFloat(this.slider.getAttribute(selectors$k.dataMax));

          this.step = 0.0;

          // normalize flag
          this.normalizeFact = 26;

          document.addEventListener('theme:resize:width', this.initFilters);
          document.addEventListener('theme:filter:init', this.initFilters);

          this.init();
        }
      }

      init() {
        // retrieve default values
        let defaultMinValue = this.min;
        if (this.slider.hasAttribute(selectors$k.dataMinValue)) {
          defaultMinValue = parseFloat(this.slider.getAttribute(selectors$k.dataMinValue));
        }
        let defaultMaxValue = this.max;

        if (this.slider.hasAttribute(selectors$k.dataMaxValue)) {
          defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$k.dataMaxValue));
        }

        // check values are correct
        if (defaultMinValue < this.min) {
          defaultMinValue = this.min;
        }

        if (defaultMaxValue > this.max) {
          defaultMaxValue = this.max;
        }

        if (defaultMinValue > defaultMaxValue) {
          defaultMinValue = defaultMaxValue;
        }

        if (this.slider.getAttribute(selectors$k.dataStep)) {
          this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$k.dataStep)));
        }

        // initial reset
        this.reset();

        // usefull values, min, max, normalize fact is the width of both touch buttons
        this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
        this.selectedTouch = null;
        this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;

        // set defualt values
        this.setMinValue(defaultMinValue);
        this.setMaxValue(defaultMaxValue);

        // link events
        this.touchLeft.addEventListener('mousedown', this.onStartEvent);
        this.touchRight.addEventListener('mousedown', this.onStartEvent);
        this.touchLeft.addEventListener('touchstart', this.onStartEvent, {passive: true});
        this.touchRight.addEventListener('touchstart', this.onStartEvent, {passive: true});

        // initialize
        this.slider.classList.add(classes$f.classInitialized);
      }

      reset() {
        this.touchLeft.style.left = '0px';
        this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
        this.lineSpan.style.marginLeft = '0px';
        this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
        this.startX = 0;
        this.x = 0;
      }

      setMinValue(minValue) {
        const ratio = (minValue - this.min) / (this.max - this.min);
        this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
        this.slider.setAttribute(selectors$k.dataMinValue, minValue);
      }

      setMaxValue(maxValue) {
        const ratio = (maxValue - this.min) / (this.max - this.min);
        this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
        this.slider.setAttribute(selectors$k.dataMaxValue, maxValue);
      }

      onStart(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        let eventTouch = event;

        if (event.touches) {
          eventTouch = event.touches[0];
        }

        if (event.currentTarget === this.touchLeft) {
          this.x = this.touchLeft.offsetLeft;
        } else {
          this.x = this.touchRight.offsetLeft;
        }

        this.startX = eventTouch.pageX - this.x;
        this.selectedTouch = event.currentTarget;
        document.addEventListener('mousemove', this.onMoveEvent);
        document.addEventListener('mouseup', this.onStopEvent);
        document.addEventListener('touchmove', this.onMoveEvent, {passive: true});
        document.addEventListener('touchend', this.onStopEvent, {passive: true});
      }

      onMove(event) {
        let eventTouch = event;

        if (event.touches) {
          eventTouch = event.touches[0];
        }

        this.x = eventTouch.pageX - this.startX;

        if (this.selectedTouch === this.touchLeft) {
          if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
            this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
          } else if (this.x < 0) {
            this.x = 0;
          }

          this.selectedTouch.style.left = this.x + 'px';
        } else if (this.selectedTouch === this.touchRight) {
          if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
            this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
          } else if (this.x > this.maxX) {
            this.x = this.maxX;
          }
          this.selectedTouch.style.left = this.x + 'px';
        }

        // update line span
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';

        // write new value
        this.calculateValue();

        // call on change
        if (this.slider.getAttribute('on-change')) {
          const fn = new Function('min, max', this.slider.getAttribute('on-change'));
          fn(this.slider.getAttribute(selectors$k.dataMinValue), this.slider.getAttribute(selectors$k.dataMaxValue));
        }

        this.onChange(this.slider.getAttribute(selectors$k.dataMinValue), this.slider.getAttribute(selectors$k.dataMaxValue));
      }

      onStop(event) {
        document.removeEventListener('mousemove', this.onMoveEvent);
        document.removeEventListener('mouseup', this.onStopEvent);
        document.removeEventListener('touchmove', this.onMoveEvent);
        document.removeEventListener('touchend', this.onStopEvent);

        this.selectedTouch = null;

        // write new value
        this.calculateValue();

        // call did changed
        this.onChanged(this.slider.getAttribute(selectors$k.dataMinValue), this.slider.getAttribute(selectors$k.dataMaxValue));
      }

      onChange(min, max) {
        const rangeHolder = this.slider.closest(selectors$k.rangeHolder);
        if (rangeHolder) {
          const priceMin = rangeHolder.querySelector(selectors$k.priceMin);
          const priceMax = rangeHolder.querySelector(selectors$k.priceMax);

          if (priceMin && priceMax) {
            priceMin.value = min;
            priceMax.value = max;
          }
        }
      }

      onChanged(min, max) {
        if (this.slider.hasAttribute(selectors$k.dataFilterUpdate)) {
          this.slider.dispatchEvent(new CustomEvent('theme:filter:range-update', {bubbles: true}));
        }
      }

      calculateValue() {
        const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
        let minValue = this.lineSpan.offsetLeft / this.initialValue;
        let maxValue = minValue + newValue;

        minValue = minValue * (this.max - this.min) + this.min;
        maxValue = maxValue * (this.max - this.min) + this.min;

        if (this.step !== 0.0) {
          let multi = Math.floor(minValue / this.step);
          minValue = this.step * multi;

          multi = Math.floor(maxValue / this.step);
          maxValue = this.step * multi;
        }

        if (this.selectedTouch === this.touchLeft) {
          this.slider.setAttribute(selectors$k.dataMinValue, minValue);
        }

        if (this.selectedTouch === this.touchRight) {
          this.slider.setAttribute(selectors$k.dataMaxValue, maxValue);
        }
      }

      onUnload() {
        if (this.initFilters) {
          document.removeEventListener('theme:resize:width', this.initFilters);
        }
      }
    }

    const sections$f = {};

    const selectors$j = {
      accordionElements: 'accordion-elements',
      collectionGridWrapper: '[data-collection-grid-wrapper]',
      collectionProducts: '[data-collection-products]',
      collectionSort: '[data-collection-sort]',
      collectionWrapper: '[data-collection-wrapper]',
      filterContainer: '[data-filter-container]',
      filterTitle: '[data-accordion-trigger]',
      filters: '[data-filters]',
      filtersResets: '[data-filters-reset]',
      filtersResetButton: '[data-filters-reset-button]',
      filtersForm: '[data-filters-form]',
      filtersResetButtons: '[data-filter-reset-button]',
      inputs: 'input, select, label, textarea',
      pagination: '[data-pagination]',
      priceMin: '[data-field-price-min]',
      priceMax: '[data-field-price-max]',
      rangeMin: '[data-se-min-value]',
      rangeMax: '[data-se-max-value]',
      rangeSlider: '[data-range-slider]',
      swatch: '[data-swatch]',
    };

    const classes$e = {
      filtersTop: 'collection__filters--top',
      isLoading: 'is-loading',
    };

    const attributes$5 = {
      single: 'single',
      sort: 'data-sort',
      dataCollection: 'data-collection',
      filtersEnable: 'data-filters-enable',
      filtersAvailable: 'data-filters-available',
      rangeMinValue: 'data-se-min-value',
      rangeMaxValue: 'data-se-max-value',
    };

    class Collection {
      constructor(section) {
        this.container = section.container;
        this.collectionGridWrapper = this.container.querySelector(selectors$j.collectionGridWrapper);
        this.collectionSort = this.container.querySelector(selectors$j.collectionSort);
        this.collectionProducts = this.container.querySelector(selectors$j.collectionProducts);
        this.collectionWrapper = this.container.querySelector(selectors$j.collectionWrapper);
        this.pagination = this.container.querySelector(selectors$j.pagination);
        this.accordionElements = this.container.querySelector(selectors$j.accordionElements);
        this.filters = this.container.querySelector(selectors$j.filters);
        this.filtersEnable = this.container.getAttribute(attributes$5.filtersEnable) === 'true';
        this.filtersForm = this.container.querySelector(selectors$j.filtersForm);
        this.filtersResets = this.container.querySelector(selectors$j.filtersResets);
        this.filtersInputs = [];
        this.sort = null;
        this.collection = null;
        this.reset = null;
        this.filtersPositionState = this.isTopPosition() ? 'top' : 'left';
        this.isRangeSliderInitialized = false;
        this.resizeFiltersEvent = () => this.checkFiltersPosition();
        this.documentClick = (e) => this.closeOnOutsideClick(e);

        this.init();
      }

      init() {
        if (this.collectionSort) {
          this.initSort();
        }

        if (this.collectionProducts) {
          this.collection = this.collectionProducts.getAttribute(attributes$5.dataCollection);
        }

        if (this.filtersEnable) {
          this.initFacetedFilters();
        }

        this.initFilterToggleButtons();
        this.checkFiltersPosition(true);
        document.addEventListener('theme:resize', this.resizeFiltersEvent);
      }

      initSort() {
        this.collectionSort.addEventListener('change', (evt) => {
          const url = new window.URL(window.location.href);
          const value = evt.currentTarget.value;
          const params = url.searchParams;
          params.set('sort_by', value);
          url.search = params.toString();
          this.collectionProducts.setAttribute(attributes$5.sort, value);
          this.requestFilteredProducts(url.toString());
        });
      }

      initFilterToggleButtons() {
        if (!this.filters) {
          return;
        }

        this.filters.querySelectorAll(selectors$j.filterTitle)?.forEach((button) => {
          button.addEventListener('click', (e) => {
            const distanceFromTop = button.parentNode.querySelector(selectors$j.filterContainer).getBoundingClientRect().top;
            document.documentElement.style.setProperty('--filters-top', `${distanceFromTop}px`);

            const isPriceFilter = button.parentNode.querySelector(selectors$j.rangeSlider);

            if (isPriceFilter && !this.isRangeSliderInitialized) {
              this.filtersForm.dispatchEvent(new CustomEvent('theme:filter:init', {bubbles: true}));
              this.isRangeSliderInitialized = true;
            }

            // Close horizontal filters on click outside their container
            document.addEventListener('click', this.documentClick);
          });
        });
      }

      initFacetedFilters() {
        if (!this.filters.hasAttribute(attributes$5.filtersAvailable)) {
          return;
        }

        new RangeSlider(this.filtersForm);
        this.filtersInputs = this.filtersForm.querySelectorAll(selectors$j.inputs);

        if (this.filtersInputs.length) {
          this.filtersInputs.forEach((el) => {
            el.addEventListener(
              'input',
              debounce(() => {
                if (this.filtersForm && typeof this.filtersForm.submit === 'function') {
                  this.submitForm();
                }
              }, 500)
            );
          });
        }

        this.filtersForm.addEventListener('theme:filter:range-update', () => this.updateRange());
        this.initResets();
      }

      submitForm() {
        const formData = new FormData(this.filtersForm);
        const search = new URLSearchParams(formData);
        this.requestFilteredProducts(`${this.collection}${search.toString()}`);
      }

      initResets() {
        const resets = this.container.querySelectorAll(selectors$j.filtersResetButtons);
        this.resetAlt = this.collectionProducts.querySelector(selectors$j.filtersResetButton);

        // Bind reset
        if (resets.length) {
          resets.forEach((button) => {
            button.addEventListener('click', (e) => this.bindResetButton(e));
          });
        }
        if (this.resetAlt) {
          this.resetAlt.addEventListener('click', (e) => this.bindResetButton(e));
        }
      }

      updateRange() {
        if (this.filtersForm && typeof this.filtersForm.submit === 'function') {
          const rangeMin = this.filtersForm.querySelector(selectors$j.rangeMin);
          const rangeMax = this.filtersForm.querySelector(selectors$j.rangeMax);
          const priceMin = this.filtersForm.querySelector(selectors$j.priceMin);
          const priceMax = this.filtersForm.querySelector(selectors$j.priceMax);
          const checkElements = rangeMin && rangeMax && priceMin && priceMax;

          if (checkElements && rangeMin.hasAttribute(attributes$5.rangeMinValue) && rangeMax.hasAttribute(attributes$5.rangeMaxValue)) {
            const priceMinValue = parseInt(priceMin.placeholder);
            const priceMaxValue = parseInt(priceMax.placeholder);
            const rangeMinValue = parseInt(rangeMin.getAttribute(attributes$5.rangeMinValue));
            const rangeMaxValue = parseInt(rangeMax.getAttribute(attributes$5.rangeMaxValue));

            if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
              priceMin.value = rangeMinValue;
              priceMax.value = rangeMaxValue;

              this.submitForm();
            }
          }
        }
      }

      closeOnOutsideClick(e) {
        const isFiltersContainer = this.filters.contains(e.target);
        const isFilterExpanded = this.filters.querySelector('details[open]');

        // Close filter
        if (!isFiltersContainer && isFilterExpanded && this.isTopPosition()) {
          const expandedFilter = this.filters.querySelector('details[open]');
          expandedFilter.querySelector(selectors$j.filterTitle).dispatchEvent(new Event('click'));

          document.removeEventListener('click', this.documentClick);
        }
      }

      requestFilteredProducts(url) {
        const collectionWrapperTop = parseInt(Math.ceil(this.collectionWrapper.offsetTop) - theme.dimensions.headerScrolled);

        this.collectionWrapper.classList.add(classes$e.isLoading);

        // Scroll back to top
        window.scrollTo({
          top: collectionWrapperTop,
          left: 0,
          behavior: 'smooth',
        });

        if (history.replaceState) {
          window.history.pushState({path: url}, '', url);
        }

        fetch(url)
          .then((response) => {
            return response.text();
          })
          .then((data) => {
            const createdElement = document.createElement('div');
            createdElement.innerHTML = data;
            const collectionProducts = createdElement.querySelector(selectors$j.collectionProducts).innerHTML;
            const pagination = createdElement.querySelector(selectors$j.pagination);
            const filters = createdElement.querySelector(selectors$j.filters);

            this.collectionProducts.innerHTML = collectionProducts;

            if (this.pagination) {
              this.pagination.innerHTML = pagination !== null ? pagination.innerHTML : '';
            }

            if (!this.pagination && pagination !== null) {
              this.collectionGridWrapper.appendChild(pagination);
              this.pagination = this.collectionGridWrapper.querySelector(selectors$j.pagination);
            }

            if (filters) {
              const filtersHTML = filters.innerHTML;

              this.filters.innerHTML = filtersHTML;
              this.filtersForm = this.filters.querySelector(selectors$j.filtersForm);
              this.accordionElements = this.container.querySelector(selectors$j.accordionElements);

              this.initFacetedFilters();
              this.checkFiltersPosition();
              this.initFilterToggleButtons();
              this.bindSwatchFilters();
            }

            ajaxify.onUnload();
            new Ajaxify(this.container);
            makeGridSwatches(this.container);
            new Quickview(this.container);
          })
          .catch((e) => {
            this.collectionWrapper.classList.remove(classes$e.isLoading);
          })
          .finally(() => {
            // Stop loading animation
            setTimeout(() => {
              this.collectionWrapper.classList.remove(classes$e.isLoading);
            }, 450);
          });
      }

      checkFiltersPosition(init = false) {
        if (!this.filters) {
          return;
        }

        const currentState = this.isTopPosition() ? 'top' : 'left';
        const stateChanged = this.filtersPositionState !== currentState;

        if (!init && !stateChanged) return;

        // Run only if filters position is set to "Top" or window width is < 1279
        if (this.isTopPosition()) {
          this.accordionElements?.setAttribute(attributes$5.single, true);

          // Close filters if position is set to "Top"
          this.filters.querySelectorAll('details[open]')?.forEach((filter) => {
            const filterExpanded = filter.hasAttribute('open');

            // Check if dropdown is expanded and close it
            if (filterExpanded) {
              filter.removeAttribute('open');
              filter.querySelector(selectors$j.filterContainer).style.height = 0;
            }
          });
        } else {
          this.accordionElements?.removeAttribute(attributes$5.single);
        }

        // Update filters state
        this.filtersPositionState = currentState;
      }

      isTopPosition() {
        return window.innerWidth < theme.sizes.widescreen || this.filters?.classList.contains(classes$e.filtersTop);
      }

      bindSwatchFilters() {
        this.swatches = [];
        const els = this.container.querySelectorAll(selectors$j.swatch);
        els.forEach((el) => {
          this.swatches.push(new Swatch(el));
        });
      }

      bindResetButton(e) {
        e.preventDefault();

        this.requestFilteredProducts(e.currentTarget.href);
      }

      onUnload() {
        document.removeEventListener('theme:resize', this.resizeFiltersEvent);
      }
    }

    const CollectionSection = {
      onLoad() {
        sections$f[this.id] = new Collection(this);
      },
      onUnload(e) {
        sections$f[this.id].onUnload(e);
      },
    };

    register('collection', [CollectionSection, quickviewSection, ajaxify, swatchGridSection, swatchSection, popoutSection]);
    register('search-template', [CollectionSection, quickviewSection, ajaxify, swatchGridSection, swatchSection, popoutSection]);

    class PopupCookie {
      constructor(name, value, expires) {
        this.configuration = {
          expires: expires, // session cookie
          path: '/',
          domain: window.location.hostname,
        };
        this.name = name;
        this.value = value;
      }

      write() {
        const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));
        if (hasCookie || document.cookie.indexOf('; ') === -1) {
          document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        }
      }

      read() {
        if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          const returnCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(this.name))
            .split('=')[1];

          return returnCookie;
        } else {
          return false;
        }
      }

      destroy() {
        if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        }
      }
    }

    const selectors$i = {
      newsletterForm: '[data-newsletter-form]',
      popup: '[data-popup]',
    };

    const classes$d = {
      success: 'sign-up-posted',
      fail: 'sign-up-failed',
    };

    const attributes$4 = {
      testmode: 'data-testmode',
      checkTrueString: 'true',
    };

    const sections$e = {};

    class NewsletterCheckForResult {
      constructor(newsletter) {
        this.sessionStorage = window.sessionStorage;
        this.newsletter = newsletter;
        this.popup = this.newsletter.closest(selectors$i.popup);
        this.cookie = new PopupCookie('newsletter', 'user_has_closed', null);

        this.stopSubmit = true;
        this.isChallengePage = false;
        this.formID = null;

        this.checkForChallengePage();

        this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);

        if (!this.isChallengePage) {
          this.init();
        }
      }

      init() {
        this.newsletter.addEventListener('submit', this.newsletterSubmit);

        this.showMessage();
      }

      newsletterSubmitEvent(e) {
        if (this.stopSubmit) {
          e.preventDefault();

          this.removeStorage();
          this.writeStorage();
          this.stopSubmit = false;
          this.newsletter.submit();
        }
      }

      checkForChallengePage() {
        this.isChallengePage = window.location.pathname === '/challenge';
      }

      writeStorage() {
        if (this.sessionStorage !== undefined) {
          this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
        }
      }

      readStorage() {
        this.formID = this.sessionStorage.getItem('newsletter_form_id');
      }

      removeStorage() {
        this.sessionStorage.removeItem('newsletter_form_id');
      }

      showMessage() {
        this.readStorage();

        if (this.newsletter.id === this.formID) {
          const newsletter = document.getElementById(this.formID);
          const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
          const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

          if (submissionSuccess) {
            newsletter.classList.remove(classes$d.error);
            newsletter.classList.add(classes$d.success);

            this.scrollToForm(newsletter);

            if (this.popup && this.popup.getAttribute(attributes$4.testmode) !== attributes$4.checkTrueString) {
              this.cookie.write();
            }
          } else if (submissionFailure) {
            newsletter.classList.remove(classes$d.success);
            newsletter.classList.add(classes$d.fail);

            this.scrollToForm(newsletter);
          }
        }
      }

      scrollToForm(newsletter) {
        const rect = newsletter.getBoundingClientRect();
        const isVisible =
          rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);

        if (!isVisible) {
          setTimeout(() => {
            window.scroll({
              top: rect.top,
              left: 0,
              behavior: 'smooth',
            });
          }, 400);
        }
      }
    }

    const newsletterCheckForResultSection = {
      onLoad() {
        sections$e[this.id] = [];
        const newsletters = this.container.querySelectorAll(selectors$i.newsletterForm);
        newsletters.forEach((form) => {
          sections$e[this.id].push(new NewsletterCheckForResult(form));
        });
      },
      onUnload() {
        sections$e[this.id].forEach((form) => {
          if (typeof form.unload === 'function') {
            form.unload();
          }
        });
      },
    };

    const footerSection = {
      onLoad() {
        // Lighthouse fires security warning for the Shopify link.
        var shopifyLink = document.querySelector('[data-powered-link] a');
        if (shopifyLink) {
          shopifyLink.setAttribute('rel', 'noopener');
        }
      },
    };

    register('footer', [popoutSection, footerSection, newsletterCheckForResultSection]);

    const selectors$h = {
      faqTrigger: '[data-faq-trigger]',
      accordionTrigger: '[data-accordion-trigger]',
    };

    const attributes$3 = {
      faqTrigger: 'data-faq-trigger',
      index: 'data-index',
    };

    const classes$c = {
      isActive: 'is-active',
    };

    class FaqList extends AccordionElements {
      constructor() {
        super();
      }

      connectedCallback() {
        this.triggers = this.querySelectorAll(selectors$h.faqTrigger);

        this.triggers.forEach((button) => {
          button.addEventListener('click', (event) => {
            if (button.classList.contains(classes$c.isActive)) return;

            const activeButton = this.querySelector(`${selectors$h.faqTrigger}.${classes$c.isActive}`);
            const accordionButton = this.querySelector(`${selectors$h.accordionTrigger}[${attributes$3.index}="${button.dataset.index}"]`);

            activeButton?.classList.remove(classes$c.isActive);
            accordionButton?.click();

            button.classList.add(classes$c.isActive);
          });
        });
      }
    }

    if (!customElements.get('faq-list')) {
      customElements.define('faq-list', FaqList);
    }

    const sections$d = {};

    const selectors$g = {
      slider: '[data-collection-slider]',
      prevArrow: '[data-prev-arrow]',
      nextArrow: '[data-next-arrow]',
      productBlock: '[data-product-block]',
      productImage: '[data-product-image]',
      quickviewId: 'data-quickview-id',
      quickviewWrap: '[data-quickview-wrap]',
      quickviewButton: '[data-trigger-quickview]',
    };

    const classes$b = {
      isVisible: 'is-visible',
      flickityEnabled: 'flickity-enabled',
      isQuickviewOpen: 'is-quickview-open',
    };

    class CollectionSlider {
      constructor(section) {
        this.container = section.container;
        this.slideshow = this.container.querySelector(selectors$g.slider);
        this.productBlocks = this.container.querySelectorAll(selectors$g.productBlock);
        this.productImages = this.container.querySelectorAll(selectors$g.productImage);
        this.slideshowPrev = this.container.querySelector(selectors$g.prevArrow);
        this.slideshowNext = this.container.querySelector(selectors$g.nextArrow);
        this.flkty = null;
        this.resizeEvents = () => {
          this.sliderInit();
          this.setArrowPosition();
          this.setQuickViewPosition();
        };

        if (this.slideshow && this.productBlocks.length) {
          this.init();
        }
      }

      init() {
        this.slideshowPrev.addEventListener('click', this.goToPrevSlide.bind(this));
        this.slideshowNext.addEventListener('click', this.goToNextSlide.bind(this));

        removeAnimations(this.container);

        this.sliderInit();

        this.productBlocks.forEach((productBlock) => {
          productBlock.addEventListener('theme:quickview:loaded', () => {
            productBlock.classList.add(classes$b.isQuickviewOpen);
            this.setQuickViewPosition();
          });
        });

        document.addEventListener('theme:resize', this.resizeEvents);
      }

      sliderInit() {
        const sliderInitialized = this.slideshow.classList.contains(classes$b.flickityEnabled);

        if (window.innerWidth >= theme.sizes.small) {
          if (!sliderInitialized) {
            this.flkty = new Flickity(this.slideshow, {
              groupCells: '100%',
              autoPlay: false,
              prevNextButtons: false,
              pageDots: false,
              wrapAround: false,
              cellAlign: 'left',
              contain: true,
              on: {
                ready: () => {
                  this.setArrowPosition();
                },
                change: function () {
                  const visibleQuickView = this.element.querySelector(`${selectors$g.productBlock}.${classes$b.isVisible}`);

                  if (visibleQuickView !== null) {
                    visibleQuickView.querySelector(selectors$g.quickviewButton).dispatchEvent(new Event('click'));
                  }
                },
              },
            });
          }
        } else if (sliderInitialized) {
          this.flkty.destroy();
        }
      }

      goToPrevSlide(e) {
        e.preventDefault();

        this.flkty.previous(true);
      }

      goToNextSlide(e) {
        e.preventDefault();

        this.flkty.next(true);
      }

      setArrowPosition() {
        const productBlock = this.slideshow.querySelector(selectors$g.productImage);
        if (!productBlock) return;

        let arrowTop = productBlock.offsetHeight / 2;
        const arrowHeight = this.slideshowPrev.offsetHeight / 2;
        arrowTop -= arrowHeight;
        this.slideshowPrev.style.top = `${arrowTop}px`;
        this.slideshowNext.style.top = `${arrowTop}px`;
      }

      setQuickViewPosition() {
        // Get the product block that has Quick view opened
        const productBlock = this.slideshow.querySelector(`.${classes$b.isQuickviewOpen}`);

        if (productBlock === null) {
          return;
        }

        const uniq = productBlock.dataset.quickviewElement;
        const quickviewWrap = this.container.querySelector(`[${selectors$g.quickviewId}="${uniq}"]`);
        const sliderPadding = parseInt(window.getComputedStyle(this.slideshow).paddingLeft.replace('px', ''));
        const sliderInnerWidth = this.slideshow.offsetWidth - sliderPadding * 2;

        if (quickviewWrap) {
          let offsetLeft = productBlock.offsetLeft;

          if (offsetLeft >= sliderInnerWidth) {
            offsetLeft %= sliderInnerWidth;
          }

          quickviewWrap.style.left = `calc(${productBlock.style.left} - ${offsetLeft}px)`;
          quickviewWrap.style.width = '100%';
        }
      }

      onUnload() {
        if (this.slideshow) {
          const sliderInitialized = this.slideshow.classList.contains(classes$b.flickityEnabled);

          if (sliderInitialized) {
            this.flkty.destroy();
          }
        }

        document.removeEventListener('theme:resize', this.resizeEvents);
      }
    }

    const FeaturedCollectionSection = {
      onLoad() {
        sections$d[this.id] = new CollectionSlider(this);
      },
      onUnload(e) {
        sections$d[this.id].onUnload(e);
      },
    };

    register('featured-collection', [FeaturedCollectionSection, quickviewSection, swatchGridSection]);

    const outerWidth = (el) => {
      const style = getComputedStyle(el);
      let width = el.offsetWidth;

      width += parseInt(style.marginLeft) + parseInt(style.marginRight);

      return width;
    };

    const selectors$f = {
      menuToggle: '[data-menu-toggle]',
      hamburgerIcon: '[data-hamburger-icon]',
      hamburgerMenuScrollable: '[data-hamburger-scrollable]',
      headerIcons: '[data-header-icons]',
      navMain: '[data-nav-main]',
      menuDropdownParent: '[data-dropdown-parent]',
      dropdownTrigger: 'data-collapsible-trigger',
      menuItemLink: 'data-menu-item-link',
      visibleLink: 'data-visible-link',
      ariaExpanded: 'aria-expanded',
      href: 'href',
      tabIndex: 'tabindex',
    };

    const classes$a = {
      navVisible: 'nav--is-visible',
      navHiding: 'nav--is-hiding',
      megamenuVisible: 'header--megamenu-visible',
      headerHamburger: 'header--is-hamburger',
      menuItemDropdown: 'menu-item--dropdown',
      menuItemMegamenu: 'menu-item--meganav',
      isExpanded: 'is-expanded',
      isActive: 'is-active',
      open: 'open',
    };

    let sections$c = {};

    class Navigation {
      constructor(el) {
        this.header = el;
        this.body = document.body;
        this.menuToggles = document.querySelectorAll(selectors$f.menuToggle);
        this.headerIcons = this.header.querySelector(selectors$f.headerIcons);
        this.navStandard = this.header.querySelector(selectors$f.navMain);
        this.hamburger = this.header.querySelector(selectors$f.hamburgerIcon);
        this.scrollableElement = document.querySelector(selectors$f.hamburgerMenuScrollable);
        this.hamburgerNavLinks = this.scrollableElement.parentNode.querySelectorAll('button, a');
        this.documentClick = (e) => this.hideOnOutsideClick(e);
        this.documentKeyup = (e) => this.hideOnKeyUp(e);
        this.scrollLockTimeout = 0;
        this.resetHeight = 0;
        this.accessibility = a11y;

        this.init();
      }

      init() {
        this.hide();
        this.bindings();
        this.activeLinks();
      }

      bindings() {
        const dropdownParents = this.navStandard.querySelectorAll(selectors$f.menuDropdownParent);
        const emptyLinks = document.querySelectorAll(`${selectors$f.navMain} a[href^="#"]`);
        const dropdownTriggers = document.querySelectorAll(`${selectors$f.navMain} [${selectors$f.dropdownTrigger}]`);
        const triggers = [...dropdownTriggers, ...emptyLinks];

        // Init Bindings
        this.menuToggles.forEach((menuToggle) => {
          menuToggle.addEventListener('click', (e) => {
            e.preventDefault();

            if (this.body.classList.contains(classes$a.navVisible)) {
              this.hide();
            } else {
              this.show();
            }
          });
        });

        dropdownParents.forEach((dropdownParent) => {
          const visibleNavLinks = dropdownParent.querySelectorAll(`[${selectors$f.visibleLink}]`);

          dropdownParent.addEventListener('mouseenter', () => {
            if (theme.touched) {
              return;
            }

            if (!dropdownParent.classList.contains(classes$a.menuItemDropdown)) {
              this.header.classList.add(classes$a.megamenuVisible);
            }

            dropdownParent.classList.add(classes$a.isExpanded);
            visibleNavLinks.forEach((link) => {
              link.removeAttribute(selectors$f.tabIndex);

              if (link.hasAttribute(selectors$f.ariaExpanded)) {
                link.setAttribute(selectors$f.ariaExpanded, true);
              }
            });
          });

          dropdownParent.addEventListener('mouseleave', () => {
            if (!dropdownParent.classList.contains(classes$a.menuItemDropdown)) {
              this.header.classList.remove(classes$a.megamenuVisible);
            }

            dropdownParent.classList.remove(classes$a.isExpanded);
            visibleNavLinks.forEach((link) => {
              link.setAttribute(selectors$f.tabIndex, '-1');

              if (link.hasAttribute(selectors$f.ariaExpanded)) {
                link.setAttribute(selectors$f.ariaExpanded, false);
              }
            });
          });
        });

        triggers.forEach((trigger) => {
          trigger.addEventListener('click', () => {
            if (trigger.parentNode.classList.contains(classes$a.isExpanded)) {
              this.submenuClose(trigger.parentNode);
            } else {
              this.submenuOpen(trigger.parentNode);
            }
          });

          trigger.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
              if (trigger.parentNode.classList.contains(classes$a.isExpanded)) {
                this.submenuClose(trigger.parentNode);
              } else {
                this.submenuOpen(trigger.parentNode);
              }
            } else if (e.code === 'Escape') {
              this.submenuClose(trigger.parentNode);
            }
          });
        });

        // Hide hamburger menu on click outside
        document.addEventListener('click', this.documentClick);

        // Close header dropdowns on focus another elements or ESC key is pressed
        document.addEventListener('keyup', this.documentKeyup);
      }

      hideOnOutsideClick(e) {
        const menuToggle = this.headerIcons.querySelector(selectors$f.menuToggle);
        const isMenuToggle = menuToggle.contains(e.target);
        const isMenuContainer = document.querySelector(selectors$f.hamburgerMenuScrollable).parentNode.contains(e.target);
        const isHeaderHamburger = this.header.classList.contains(classes$a.headerHamburger);

        // Close hamburger menu
        if (!isMenuToggle && !isMenuContainer && isHeaderHamburger) {
          this.hide();
        }
      }

      hideOnKeyUp(e) {
        const key = e.code;
        const focusedElement = e.target;
        const hamburgerMenu = document.querySelectorAll(selectors$f.navMain)[1];
        const isHamburgerOpen = this.hamburger.classList.contains(classes$a.open);
        const expandedItem = document.querySelector(`${selectors$f.menuDropdownParent}.${classes$a.isExpanded}`);

        if (key !== 'Tab' && key !== 'Escape') {
          return;
        }

        if (key === 'Tab') {
          // Close dropdown
          if (focusedElement.hasAttribute(selectors$f.menuItemLink) && expandedItem !== null) {
            expandedItem.querySelector(`[${selectors$f.dropdownTrigger}]`).dispatchEvent(new Event('click'));
          }

          // Close hamburger menu
          if (!hamburgerMenu.contains(focusedElement) && isHamburgerOpen) {
            this.hide();
          }
        } else if (key === 'Escape') {
          if (expandedItem !== null) {
            expandedItem.querySelector(`[${selectors$f.dropdownTrigger}]`).dispatchEvent(new Event('click'));
          }

          if (isHamburgerOpen) {
            this.hide();
          }
        }
      }

      show() {
        const headerIconsLinks = this.headerIcons.querySelectorAll(`a:not(${selectors$f.menuToggle})`);

        // Scroll lock
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.scrollableElement}));

        this.hamburger.classList.add(classes$a.open);
        this.body.classList.add(classes$a.navVisible);

        headerIconsLinks.forEach((iconLink) => iconLink.setAttribute(selectors$f.tabIndex, '-1'));
        this.hamburgerNavLinks.forEach((hamburgerNavLink) => hamburgerNavLink.removeAttribute(selectors$f.tabIndex));
        this.menuToggles.forEach((menuToggle) => menuToggle.setAttribute(selectors$f.ariaExpanded, true));
      }

      hide() {
        const headerIconsLinks = this.headerIcons.querySelectorAll('a');

        if (!this.body.classList.contains(classes$a.navVisible)) {
          return;
        }

        this.hamburger.classList.remove(classes$a.open);
        this.body.classList.add(classes$a.navHiding);
        this.body.classList.remove(classes$a.navVisible);

        if (this.scrollLockTimeout) {
          clearTimeout(this.scrollLockTimeout);
        }

        this.scrollLockTimeout = setTimeout(() => {
          // Scroll unlock
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          this.body.classList.remove(classes$a.navHiding);
        }, 500);

        headerIconsLinks.forEach((iconLink) => iconLink.removeAttribute(selectors$f.tabIndex));
        this.hamburgerNavLinks.forEach((hamburgerNavLink) => hamburgerNavLink.setAttribute(selectors$f.tabIndex, '-1'));
        this.menuToggles.forEach((menuToggle) => menuToggle.setAttribute(selectors$f.ariaExpanded, false));
      }

      activeLinks() {
        const menuItemLinks = this.navStandard.querySelectorAll(`[${selectors$f.menuItemLink}]`);
        const visibleNavLinks = this.navStandard.querySelectorAll(`[${selectors$f.visibleLink}]`);
        let isTopLevel = false;

        menuItemLinks.forEach((link) => {
          if (link.getAttribute(selectors$f.href) === window.location.pathname) {
            link.parentNode.classList.add(classes$a.isActive);
            isTopLevel = true;
          }
        });

        if (!isTopLevel) {
          visibleNavLinks.forEach((link) => {
            if (link.getAttribute(selectors$f.href) === window.location.pathname) {
              link.parentNode.classList.add(classes$a.isActive);
              link.closest(selectors$f.menuDropdownParent).classList.add(classes$a.isActive);
            }
          });
        }
      }

      submenuClose(el) {
        const visibleNavLinks = el.querySelectorAll(`[${selectors$f.visibleLink}]`);

        visibleNavLinks.forEach((link) => {
          link.setAttribute(selectors$f.tabIndex, '-1');

          if (link.hasAttribute(selectors$f.ariaExpanded)) {
            link.setAttribute(selectors$f.ariaExpanded, false);
          }
        });

        if (el.classList.contains(classes$a.menuItemMegamenu)) {
          this.header.classList.remove(classes$a.megamenuVisible);
        }
      }

      submenuOpen(el) {
        const visibleNavLinks = el.querySelectorAll(`[${selectors$f.visibleLink}]`);

        visibleNavLinks.forEach((link) => {
          link.removeAttribute(selectors$f.tabIndex);

          if (link.hasAttribute(selectors$f.ariaExpanded)) {
            link.setAttribute(selectors$f.ariaExpanded, true);
          }
        });

        if (el.classList.contains(classes$a.menuItemMegamenu)) {
          this.header.classList.add(classes$a.megamenuVisible);
        }
      }

      unload() {
        document.removeEventListener('click', this.documentClick);
        document.removeEventListener('keyup', this.documentKeyup);
      }
    }

    const navigation = {
      onLoad() {
        sections$c = new Navigation(this.container);
      },
      onUnload: function () {
        if (typeof sections$c.unload === 'function') {
          sections$c.unload();
        }
      },
      onSelect() {
        if (typeof sections$c.hide === 'function') {
          sections$c.hide();
        }
      },
      onDeselect() {
        if (typeof sections$c.hide === 'function') {
          sections$c.hide();
        }
      },
    };

    const getSiblings = (el) => {
      return Array.prototype.filter.call(el.parentNode.children, function (child) {
        return child !== el;
      });
    };

    const selectors$e = {
      collapsibleTrigger: '[data-collapsible-trigger]',
      collapsibleContent: '[data-collapsible-content]',
      navHamburger: '[data-hamburger-scrollable]',
      header: 'data-header',
    };

    const attributes$2 = {
      expanded: 'aria-expanded',
      controls: 'aria-controls',
      hidden: 'aria-hidden',
      accordion: 'data-accordion',
    };

    const classes$9 = {
      isExpanded: 'is-expanded',
    };

    const sections$b = {};

    class Collapsible {
      constructor(el) {
        this.section = el;
        this.triggers = this.section.querySelectorAll(selectors$e.collapsibleTrigger);
        this.resetHeight = 0;

        this.init();
      }

      init() {
        const navHamburger = document.querySelector(selectors$e.navHamburger);

        if (this.section.hasAttribute(selectors$e.header)) {
          this.triggers = [...this.triggers, ...navHamburger.querySelectorAll(selectors$e.collapsibleTrigger)];
        }

        this.triggers.forEach((trigger) => {
          trigger.addEventListener('click', (event) => this.collapsibleToggleEvent(event, trigger));
          trigger.addEventListener('keyup', (event) => this.collapsibleToggleEvent(event, trigger));
        });
      }

      collapsibleToggleEvent(e, trigger) {
        e.preventDefault();
        const dropdownId = trigger.getAttribute(attributes$2.controls);
        const isAccordion = trigger.hasAttribute(attributes$2.accordion);
        const dropdown = document.getElementById(dropdownId);
        const parent = trigger.parentNode;
        const isExpanded = parent.classList.contains(classes$9.isExpanded);
        const isSpace = e.code === 'Space';
        const isEscape = e.code === 'Escape';
        let dropdownHeight = dropdown.querySelector(selectors$e.collapsibleContent).offsetHeight;

        // Do nothing if any different than ESC and Space key pressed
        if (e.code && !isSpace && !isEscape) {
          return;
        }

        if (!isExpanded && isEscape) {
          return;
        }

        if (isExpanded) {
          setTimeout(() => {
            dropdownHeight = 0;
            this.setDropdownHeight(dropdown, dropdownHeight, isExpanded);
          }, 0);
        } else if (isAccordion) {
          const siblings = getSiblings(parent);
          siblings.forEach((sibling) => {
            if (sibling.classList.contains(classes$9.isExpanded)) {
              const trigger = sibling.querySelector(selectors$e.collapsibleTrigger);
              trigger.dispatchEvent(new Event('click'));
            }
          });
        }

        trigger.setAttribute(attributes$2.expanded, !isExpanded);
        parent.classList.toggle(classes$9.isExpanded, !isExpanded);

        this.setDropdownHeight(dropdown, dropdownHeight, isExpanded);
      }

      setDropdownHeight(dropdown, dropdownHeight, isExpanded) {
        dropdown.style.maxHeight = `${dropdownHeight}px`;
        dropdown.setAttribute(attributes$2.hidden, isExpanded);
        let maxHeight = 'none';

        if (this.resetHeight) {
          clearTimeout(this.resetHeight);
        }

        if (dropdownHeight === 0) {
          maxHeight = null;
        }

        this.resetHeight = setTimeout(() => {
          dropdown.style.maxHeight = maxHeight;
        }, 500);
      }
    }

    const collapsible = {
      onLoad() {
        sections$b[this.id] = new Collapsible(this.container);
      },
    };

    const selectors$d = {
      bodyWrap: '[data-body-wrap]',
      mainContent: '.main-content',
      navMain: '[data-nav-main]',
      navItem: '.menu > .menu-item',
      headerRow: '.container > .row',
      headerIcons: '[data-header-icons]',
      dataHeaderStyle: '[data-header-style="transparent"]',
      logoImage: '[data-logo-image]',
      logoImageWidth: 'data-width',
      logoText: '[data-logo-text]',
      hamburgerIcon: '[data-hamburger-icon]',
      hamburgerMenuScrollable: '[data-hamburger-scrollable]',
      cartClose: '[data-cart-close]',
      dataTransparent: 'data-transparent',
    };

    const classes$8 = {
      headerFull: 'header--full',
      headerScrolled: 'header--has-scrolled',
      headerSticky: 'header--sticky',
      headerStandard: 'header--is-standard',
      headerHamburger: 'header--is-hamburger',
      headerTransparent: 'header--transparent',
      headerLogoCenterCenter: 'header--logo-center-links-center',
      headerLogoLeftCenter: 'header--logo-left-links-center',
      headerLogoCenterLeft: 'header--logo-center-links-left',
      headerHiding: 'header--is-hiding',
      hasTransparentHeader: 'has-transparent-header',
      navVisible: 'nav--is-visible',
      cartVisible: 'cart--is-visible',
      open: 'open',
    };

    let sections$a = {};

    class Header {
      constructor(el) {
        this.header = el;
        this.headerContainer = this.header.parentNode;
        this.html = document.documentElement;
        this.body = document.body;
        this.bodyWrap = document.querySelector(selectors$d.bodyWrap);
        this.headerStateEvent = (event) => this.stickyHeaderState(event);
        this.checkMobileNavEvent = () => this.checkMobileNav();
        this.checkNavOverlapEvent = () => this.checkNavigationOverlapping();
        this.checkTransparentHeaderEvent = (e) => this.checkTransparentHeader(e);
        this.init();
      }

      init() {
        this.resetHeader();
        this.checkTransparentHeader();
        this.checkNavigationOverlapping();

        window.addEventListener('load', this.checkNavOverlapEvent);
        document.addEventListener('theme:resize:width', this.checkNavOverlapEvent);
        document.addEventListener('theme:resize:width', this.checkMobileNavEvent);
        document.addEventListener('theme:header:update', this.checkTransparentHeaderEvent);

        if (this.header.classList.contains(classes$8.headerSticky)) {
          this.stickyHeaderState();
          document.addEventListener('theme:scroll', this.headerStateEvent);
        }
      }

      stickyHeaderState(event) {
        const scrolled = window.scrollY;
        const scrollUp = event && event.detail && event.detail.up;
        const {headerInitialHeight} = readHeights();
        this.headerHeight = this.headerHeight || headerInitialHeight;

        if (scrollUp && scrolled < this.headerHeight * 2) {
          this.header.classList.add(classes$8.headerHiding);
        } else {
          this.header.classList.remove(classes$8.headerHiding);
        }

        if (scrolled > this.headerHeight) {
          this.header.classList.add(classes$8.headerScrolled);
          this.header.classList.remove(classes$8.headerTransparent);
        } else {
          this.header.classList.remove(classes$8.headerScrolled);
          if (this.isHeaderTransparent()) {
            this.header.classList.add(classes$8.headerTransparent);
          }
        }
      }

      checkNavigationOverlapping() {
        const isDesktop = window.innerWidth >= theme.sizes.large;

        this.header.classList.remove(classes$8.headerHamburger);
        this.header.classList.add(classes$8.headerStandard);

        if (this.getNavigationOverlapping() || !isDesktop) {
          this.header.classList.remove(classes$8.headerStandard);
          this.header.classList.add(classes$8.headerHamburger);
        }
      }

      checkMobileNav() {
        const isDesktop = window.innerWidth >= theme.sizes.large;
        const isHamburgerNavOpen = this.body.classList.contains(classes$8.navVisible);

        if (isHamburgerNavOpen && isDesktop) {
          this.resetHeader();
        }
      }

      checkTransparentHeader() {
        if (this.isHeaderTransparent()) {
          this.body.classList.add(classes$8.hasTransparentHeader);
          this.header.classList.add(classes$8.headerTransparent);
        } else {
          this.body.classList.remove(classes$8.hasTransparentHeader);
          this.header.classList.remove(classes$8.headerTransparent);
        }
      }

      getNavigationOverlapping() {
        const headerRowWidth = this.header.querySelector(selectors$d.headerRow).offsetWidth;
        const navMenuWidth = this.getMenuItemsWidth();
        const headerClasses = this.header.classList;
        const isNavCentered = headerClasses.contains(classes$8.headerLogoCenterCenter) || headerClasses.contains(classes$8.headerLogoLeftCenter);
        const isNavLeftLogoCentered = headerClasses.contains(classes$8.headerLogoCenterLeft);
        const additionalSpace = 40; // Additional spacing from margins
        let isNavigationOverlapping = false;
        let headerIconsWidth = this.header.querySelector(selectors$d.headerIcons).offsetWidth;
        let logoWidth = this.getLogoWidth();

        if (isNavCentered) {
          logoWidth = logoWidth < headerIconsWidth ? headerIconsWidth : logoWidth;
          logoWidth *= 2;
          headerIconsWidth = 0;
        }

        isNavigationOverlapping = parseInt(headerRowWidth) < parseInt(navMenuWidth + logoWidth + headerIconsWidth + additionalSpace);

        if (isNavLeftLogoCentered && logoWidth) {
          isNavigationOverlapping = parseInt((headerRowWidth - logoWidth) / 2) < parseInt(navMenuWidth);
        }

        return isNavigationOverlapping;
      }

      getLogoWidth() {
        const logoImage = this.header.querySelector(selectors$d.logoImage);
        const logoText = this.header.querySelector(selectors$d.logoText);
        let logoWidth = 0;

        if (logoImage !== null) {
          logoWidth = parseInt(logoImage.getAttribute(selectors$d.logoImageWidth));
        }

        if (logoText !== null) {
          logoWidth += logoText.offsetWidth;
        }

        return logoWidth;
      }

      getMenuItemsWidth() {
        let itemsWidth = 0;
        const navStandard = this.header.querySelector(selectors$d.navMain);
        const menuItems = navStandard.querySelectorAll(selectors$d.navItem);
        menuItems.forEach((menuItem) => {
          itemsWidth += outerWidth(menuItem);
        });

        return itemsWidth;
      }

      isHeaderTransparent() {
        const firstSection = document.querySelector(selectors$d.mainContent).firstElementChild;

        if (!firstSection) return false;

        const firstSectionClass = firstSection?.classList.contains(classes$8.headerFull);
        const firstSectionStyle = firstSection?.querySelector(selectors$d.dataHeaderStyle) !== null;
        const transparentHeader = this.header.getAttribute(selectors$d.dataTransparent) === 'true';
        const headerFull = firstSectionClass || firstSectionStyle;
        const headerTransparent = transparentHeader && headerFull;

        return headerTransparent;
      }

      resetHeader() {
        const hamburger = this.header.querySelector(selectors$d.hamburgerIcon);

        this.body.classList.remove(classes$8.navVisible);
        hamburger.classList.remove(classes$8.open);

        if (this.body.classList.contains(classes$8.cartVisible)) {
          document.querySelector(selectors$d.cartClose).click();
        }

        // Unlock page scroll
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }

      unload() {
        document.removeEventListener('theme:scroll', this.headerStateEvent);
        document.removeEventListener('theme:resize:width', this.checkNavOverlapEvent);
        document.removeEventListener('theme:resize:width', this.checkMobileNavEvent);
        document.removeEventListener('theme:header:update', this.checkTransparentHeaderEvent);
      }

      onselect() {
        this.resetHeader();
        this.init();
      }
    }

    const header = {
      onLoad() {
        sections$a = new Header(this.container);
      },
      onUnload() {
        if (typeof sections$a.unload === 'function') {
          sections$a.unload();
        }
      },
      onSelect() {
        if (typeof sections$a.onselect === 'function') {
          sections$a.onselect();
        }
      },
    };

    register('header', [header, navigation, collapsible]);

    var sections$9 = {};

    const parallaxHero = {
      onLoad() {
        sections$9[this.id] = [];
        const frames = this.container.querySelectorAll('[data-parallax-wrapper]');
        frames.forEach((frame) => {
          const inner = frame.querySelector('[data-parallax-img]');

          sections$9[this.id].push(
            new Rellax(inner, {
              center: true,
              round: true,
              frame: frame,
            })
          );
        });
      },
      onUnload: function () {
        sections$9[this.id].forEach((image) => {
          if (typeof image.destroy === 'function') {
            image.destroy();
          }
        });
      },
    };

    const sections$8 = {};

    const selectors$c = {
      slider: '[data-gallery-slider]',
      slideshow: '[data-slider]',
      slideshowPrev: '[data-prev-arrow]',
      slideshowNext: '[data-next-arrow]',
      dataOptions: 'data-options',
      dataSlide: 'data-slide',
      dataSlideIndex: 'data-slide-index',
    };

    const classes$7 = {
      slideshowLoading: 'gallery-slider--is-loading',
      classIsSelected: 'is-selected',
      flickityEnabled: 'flickity-enabled',
    };

    class Gallery {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector(selectors$c.slider);
        this.slideshow = this.container.querySelector(selectors$c.slideshow);
        this.options = this.slideshow.getAttribute(selectors$c.dataOptions);
        this.slideshowPrev = this.container.querySelector(selectors$c.slideshowPrev);
        this.slideshowNext = this.container.querySelector(selectors$c.slideshowNext);
        this.checkSliderVisibilityOnScrollEvent = this.checkSliderVisibility();
        this.flkty = null;

        this.init();
      }

      init() {
        let options = JSON.parse(this.options.replace(/'/g, '"'));

        options = {
          ...options,
          on: {
            ready: () => this.slider.classList.remove(classes$7.slideshowLoading),
          },
        };

        this.flkty = new FlickityFade(this.slideshow, options);

        if (this.slideshowPrev) {
          this.slideshowPrev.addEventListener('click', () => this.flkty.previous(true));
        }

        if (this.slideshowNext) {
          this.slideshowNext.addEventListener('click', () => this.flkty.next(true));
        }

        document.addEventListener('theme:scroll', this.checkSliderVisibilityOnScrollEvent);
      }

      isAutoplay() {
        const autoplay = this.flkty.options.autoPlay !== false;

        return autoplay;
      }

      checkSliderVisibility() {
        if (!this.flkty) return;

        const isInitialized = this.slideshow.classList.contains(classes$7.flickityEnabled);
        const isVisible = visibilityHelper.isElementPartiallyVisible(this.slideshow) || visibilityHelper.isElementTotallyVisible(this.slideshow);

        if (isVisible && isInitialized && this.isAutoplay()) {
          this.flkty.playPlayer();
        } else {
          this.flkty.stopPlayer();
        }
      }

      onUnload() {
        this.flkty.destroy();

        document.removeEventListener('theme:scroll', this.checkSliderVisibilityOnScrollEvent);
      }

      onBlockSelect(evt) {
        const slide = this.slideshow.querySelector(`[${selectors$c.dataSlide}="${evt.detail.blockId}"]`);
        const slideIndex = parseInt(slide.getAttribute(selectors$c.dataSlideIndex));

        // Go to selected slide, pause autoplay
        this.flkty.select(slideIndex);
        this.flkty.stopPlayer();
      }

      onBlockDeselect() {
        if (this.isAutoplay()) {
          this.flkty.playPlayer();
        }
      }
    }

    const GallerySection = {
      onLoad() {
        sections$8[this.id] = new Gallery(this);
      },
      onUnload(e) {
        sections$8[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$8[this.id].onBlockSelect(e);
      },
      onBlockDeselect(e) {
        sections$8[this.id].onBlockDeselect(e);
      },
    };

    register('gallery', [GallerySection, parallaxHero]);

    register('collection-grid', [ajaxify]);

    const sections$7 = {};

    const selectors$b = {
      logoListSlider: '[data-logo-list-slider]',
      logoListSlide: '[data-logo-list-slide]',
      logoListSlideData: 'data-logo-list-slide',
      logoListSlideIndex: 'data-slide-index',
    };

    const classes$6 = {
      flickityEnabled: 'flickity-enabled',
    };

    class LogoList {
      constructor(section) {
        this.container = section.container;
        this.slideshow = this.container.querySelector(selectors$b.logoListSlider);
        this.sliderInitEvent = () => this.sliderInit();

        this.init();
      }

      init() {
        this.sliderInit();

        document.addEventListener('theme:resize', this.sliderInitEvent);
      }

      sliderInit() {
        const slidesCount = this.slideshow.querySelectorAll(selectors$b.logoListSlide).length;
        const slideWidth = 220;
        const windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
        const slidesWidth = slidesCount * slideWidth;
        const sliderInitialized = this.slideshow.classList.contains(classes$6.flickityEnabled);

        if (windowWidth < slidesWidth) {
          if (!sliderInitialized) {
            this.flkty = new Flickity(this.slideshow, {
              autoPlay: 4000,
              prevNextButtons: false,
              pageDots: false,
              wrapAround: true,
            });
          }
        } else if (sliderInitialized) {
          this.flkty.destroy();
        }
      }

      onUnload() {
        const sliderInitialized = this.slideshow.classList.contains(classes$6.flickityEnabled);

        if (sliderInitialized) {
          this.flkty.destroy();
        }

        document.removeEventListener('theme:resize', this.sliderInitEvent);
      }

      onBlockSelect(evt) {
        const slide = this.slideshow.querySelector(`[${selectors$b.logoListSlideData}="${evt.detail.blockId}"]`);
        const slideIndex = parseInt(slide.getAttribute(selectors$b.logoListSlideIndex));
        const sliderInitialized = this.slideshow.classList.contains(classes$6.flickityEnabled);

        if (sliderInitialized) {
          this.flkty.select(slideIndex);
          this.flkty.pausePlayer();
        }
      }

      onBlockDeselect() {
        const sliderInitialized = this.slideshow.classList.contains(classes$6.flickityEnabled);

        if (sliderInitialized) {
          this.flkty.unpausePlayer();
        }
      }
    }

    const LogoListSection = {
      onLoad() {
        sections$7[this.id] = new LogoList(this);
      },
      onUnload(e) {
        sections$7[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$7[this.id].onBlockSelect(e);
      },
      onBlockDeselect() {
        sections$7[this.id].onBlockDeselect();
      },
    };

    register('logo-list', LogoListSection);

    const selectors$a = {
      videoPlay: '[data-video-play]',
      videoPlayValue: 'data-video-play',
    };

    class VideoPlay {
      constructor(section, selector = selectors$a.videoPlay, selectorValue = selectors$a.videoPlayValue) {
        this.container = section;
        this.videoPlay = this.container.querySelectorAll(selector);

        if (this.videoPlay.length) {
          this.videoPlay.forEach((element) => {
            element.addEventListener('click', (e) => {
              const button = e.currentTarget;
              if (button.hasAttribute(selectorValue) && button.getAttribute(selectorValue).trim() !== '') {
                e.preventDefault();
                theme.a11yTrigger = button;

                const items = [
                  {
                    html: button.getAttribute(selectorValue),
                  },
                ];

                new LoadPhotoswipe(items);
              }
            });
          });
        }
      }
    }

    const videoPlay = {
      onLoad() {
        new VideoPlay(this.container);
      },
    };

    const sections$6 = {};

    const selectors$9 = {
      slideshow: '[data-mosaic-blocks]',
      slideshowPrev: '[data-prev-arrow]',
      slideshowNext: '[data-next-arrow]',
      dataSlide: 'data-slide',
      dataSlideIndex: 'data-slide-index',
    };

    const classes$5 = {
      flickityEnabled: 'flickity-enabled',
    };

    class Mosaic {
      constructor(section) {
        this.container = section.container;
        this.slideshow = this.container.querySelector(selectors$9.slideshow);
        this.slideshowPrev = this.container.querySelector(selectors$9.slideshowPrev);
        this.slideshowNext = this.container.querySelector(selectors$9.slideshowNext);
        this.flkty = null;
        this._listeners = new Listeners();
        this.sliderInitEvent = () => this.initMobileSlider();

        this.init();
      }

      init() {
        this.initMobileSlider();

        document.addEventListener('theme:resize', this.sliderInitEvent);
      }

      initMobileSlider() {
        const isMobile = window.innerWidth < theme.sizes.small;

        const options = {
          wrapAround: true,
          prevNextButtons: false,
          pageDots: false,
        };

        if (isMobile && !this.isInit()) {
          this.flkty = new Flickity(this.slideshow, options);

          // Bind slider controls event listeners
          if (this.slideshowPrev && this.slideshowNext) {
            this._listeners.add(this.slideshowPrev, 'click', () => this.flkty.previous(true));
            this._listeners.add(this.slideshowNext, 'click', () => this.flkty.next(true));
          }
        } else if (!isMobile && this.isInit()) {
          this.flkty.destroy();

          // Unbind all slider controls event listeners
          this._listeners.removeAll();
        }
      }

      isInit() {
        const isInitialized = this.slideshow?.classList.contains(classes$5.flickityEnabled);

        return isInitialized;
      }

      onUnload() {
        if (this.isInit()) {
          this.flkty.destroy();
        }

        document.removeEventListener('theme:resize', this.sliderInitEvent);
      }

      onBlockSelect(evt) {
        const slide = this.container.querySelector(`[${selectors$9.dataSlide}="${evt.detail.blockId}"]`);

        if (this.isInit() && slide !== null) {
          this.flkty.select(parseInt(slide.getAttribute(selectors$9.dataSlideIndex)));
        }
      }
    }

    const MosaicSection = {
      onLoad() {
        sections$6[this.id] = new Mosaic(this);
      },
      onUnload(e) {
        sections$6[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$6[this.id].onBlockSelect(e);
      },
    };

    register('mosaic', [MosaicSection, videoPlay]);

    register('newsletter', newsletterCheckForResultSection);

    const selectors$8 = {
      inputGroups: '.input-group--error',
      inputs: 'input.password, input.email',
    };

    class Password {
      constructor(section) {
        this.container = section.container;
        this.inputGroups = this.container.querySelectorAll(selectors$8.inputGroups);

        this.init();
      }

      init() {
        this.inputGroups.forEach((inputGroup) => {
          const input = inputGroup.querySelector(selectors$8.inputs);
          input.focus();
        });
      }
    }

    const PasswordSection = {
      onLoad() {
        new Password(this);
      },
    };

    register('password', PasswordSection);

    const selectors$7 = {
      popup: '[data-popup]',
      close: '[data-popup-close]',
    };

    const classes$4 = {
      popupVisible: 'popup--visible',
    };

    const attributes$1 = {
      delay: 'data-delay',
      reappearTime: 'data-reappear_time',
      testmode: 'data-testmode',
      checkTrueString: 'true',
    };

    let sections$5 = {};

    class Popup {
      constructor(el) {
        this.popup = el;
        this.close = this.popup.querySelector(selectors$7.close);
        this.timeout = 0;
        this.testmode = this.popup.getAttribute(attributes$1.testmode) === attributes$1.checkTrueString;
        this.delay = parseInt(this.popup.getAttribute(attributes$1.delay)) * 1000;
        this.cookie = new PopupCookie('newsletter', 'user_has_closed', this.expireDate());

        this.init();
      }

      expireDate() {
        const todayDate = new Date();
        const expireDate = new Date();
        let date = parseInt(this.popup.getAttribute(attributes$1.reappearTime));

        if (date !== 0) {
          expireDate.setTime(todayDate.getTime() + 3600000 * 24 * date);
        } else {
          expireDate.setTime(todayDate.getTime() + 3600000 * 24 * 365 * 100);
        }

        date = expireDate.toGMTString();

        return date;
      }

      init() {
        const cookieExists = this.cookie.read() !== false;
        const isChallengePage = window.location.pathname === '/challenge';
        const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;

        if (submissionSuccess) {
          this.delay = 0;
        }

        if ((!cookieExists && !isChallengePage) || this.testmode) {
          this.timeout = setTimeout(() => {
            this.popup.classList.add(classes$4.popupVisible);
            this.initClosers();
            this.close.focus();
          }, this.delay);
        }
      }

      initClosers() {
        this.close.addEventListener('click', this.closeModal.bind(this));
      }

      closeModal(e) {
        e.preventDefault();
        this.popup.classList.remove(classes$4.popupVisible);
        clearTimeout(this.timeout);

        if (!this.testmode) {
          this.cookie.write();
        }
      }
    }

    const popupSection = {
      onLoad() {
        const popup = this.container.querySelector(selectors$7.popup);
        if (popup !== null) {
          sections$5[this.id] = new Popup(popup);
        }
      },
    };

    register('popup', [popupSection, newsletterCheckForResultSection]);

    const selectors$6 = {
      quantityAdjust: '[data-qty-adjust]',
      quantityAdjustPlus: 'data-qty-adjust-plus',
      quantityAdjustMinus: 'data-qty-adjust-minus',
      quantityNum: '[data-qty]',
    };

    const quantity = (e, element) => {
      if (e.type === 'keyup' && e.code !== 'Enter') {
        return;
      }

      const el = element;
      const qtySelector = el.parentElement.querySelector(selectors$6.quantityNum);
      let qty = parseInt(qtySelector.value.replace(/\D/g, ''));

      // Make sure we have a valid integer
      if (parseFloat(qty) == parseInt(qty) && !isNaN(qty)) ; else {
        // Not a number. Default to 1.
        qty = 1;
      }
      // Add or subtract from the current quantity
      if (el.hasAttribute(selectors$6.quantityAdjustPlus)) {
        qty += 1;
      } else {
        qty -= 1;
        if (qty <= 1) {
          qty = 1;
        }
      }
      // Update the input's number
      qtySelector.value = qty;
      qtySelector.dispatchEvent(new Event('click'));
    };

    function quantitySelectors() {
      // Setup listeners to add/subtract from the input
      const quantityAdjust = document.querySelectorAll(selectors$6.quantityAdjust);
      quantityAdjust.forEach((element) => {
        element.addEventListener('click', function (e) {
          quantity(e, element);
        });
        element.addEventListener('keyup', function (e) {
          quantity(e, element);
        });
      });
    }

    const selectors$5 = {
      complementaryProducts: 'complementary-products',
      complementaryProduct: '[data-product-block]',
    };

    const classes$3 = {
      loaded: 'is-loaded',
    };

    const attributes = {
      url: 'data-url',
    };

    class ComplementaryProducts extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        const handleIntersection = (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          observer.unobserve(this);

          if (this.hasAttribute(attributes.url) && this.getAttribute(attributes.url) !== '') {
            fetch(this.getAttribute(attributes.url))
              .then((response) => response.text())
              .then((text) => {
                const html = document.createElement('div');
                html.innerHTML = text;
                const recommendations = html.querySelector(selectors$5.complementaryProducts);

                if (recommendations && recommendations.innerHTML.trim().length) {
                  this.innerHTML = recommendations.innerHTML;
                }

                if (html.querySelector(`${selectors$5.complementaryProducts} ${selectors$5.complementaryProduct}`)) {
                  this.classList.add(classes$3.loaded);
                }
              })
              .catch((e) => {
                console.error(e);
              });
          }
        };

        new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
      }
    }

    const events = {
      cartUpdate: 'cart-update',
      variantChange: 'variant-change',
      cartError: 'cart-error',
    };

    class RecipientForm extends HTMLElement {
      cartUpdateUnsubscriber = undefined;
      variantChangeUnsubscriber = undefined;
      cartErrorUnsubscriber = undefined;
      constructor() {
        super();
        this.checkboxInput = this.querySelector(`#Recipient-Checkbox-${this.dataset.sectionIdForm}`);
        this.checkboxInput.disabled = false;
        this.hiddenControlField = this.querySelector(`#Recipient-Control-${this.dataset.sectionIdForm}`);
        this.hiddenControlField.disabled = true;
        this.emailInput = this.querySelector(`#Recipient-email-${this.dataset.sectionIdForm}`);
        this.nameInput = this.querySelector(`#Recipient-name-${this.dataset.sectionIdForm}`);
        this.messageInput = this.querySelector(`#Recipient-message-${this.dataset.sectionIdForm}`);
        this.sendonInput = this.querySelector(`#Recipient-send_on-${this.dataset.sectionIdForm}`);
        this.offsetProperty = this.querySelector(`#Recipient-Offset-${this.dataset.sectionIdForm}`);
        if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset();

        this.errorMessageWrapper = this.querySelector('.product-form__recipient-error-message-wrapper');
        this.errorMessageList = this.errorMessageWrapper?.querySelector('ul');
        this.errorMessage = this.errorMessageWrapper?.querySelector('span.error-message');
        this.defaultErrorHeader = this.errorMessage?.textContent;
        this.currentProductVariantId = this.dataset.productVariantId;
        this.addEventListener('change', this.onChange.bind(this));
        this.onChange();
      }

      connectedCallback() {
        this.cartUpdateUnsubscriber = subscribe(events.cartUpdate, (event) => {
          if (event.source === 'product-form' && event.productVariantId && event.productVariantId.toString() === this.currentProductVariantId) {
            this.resetRecipientForm();
          }
        });

        this.variantChangeUnsubscriber = subscribe(events.variantChange, (event) => {
          if (event.data.sectionId === this.dataset.sectionIdForm) {
            this.currentProductVariantId = event.data.variant.id.toString();
          }
        });

        this.cartUpdateUnsubscriber = subscribe(events.cartError, (event) => {
          if (event.source === 'product-form' && event.productVariantId && event.productVariantId.toString() === this.currentProductVariantId) {
            this.displayErrorMessage(event.message, event.errors);
          }
        });
      }

      disconnectedCallback() {
        if (this.cartUpdateUnsubscriber) {
          this.cartUpdateUnsubscriber();
        }

        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber();
        }

        if (this.cartErrorUnsubscriber) {
          this.cartErrorUnsubscriber();
        }
      }

      onChange() {
        if (!this.checkboxInput.checked) {
          this.clearInputFields();
          this.disableInputFields();
          this.clearErrorMessage();
        } else {
          this.enableInputFields();
        }
      }

      inputFields() {
        return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput];
      }

      disableableFields() {
        return [...this.inputFields(), this.offsetProperty];
      }

      clearInputFields() {
        this.inputFields().forEach((field) => (field.value = ''));
      }

      enableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = false));
      }

      disableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = true));
      }

      displayErrorMessage(title, body) {
        this.clearErrorMessage();
        this.errorMessageWrapper.classList.add('is-visible');
        if (typeof body === 'object') {
          this.errorMessage.innerText = this.defaultErrorHeader;
          return Object.entries(body).forEach(([key, value]) => {
            const errorMessageId = `RecipientForm-${key}-error-${this.dataset.sectionIdForm}`;
            const fieldSelector = `#Recipient-${key}-${this.dataset.sectionIdForm}`;
            const message = `${value.join(', ')}`;
            const errorMessageElement = this.querySelector(`#${errorMessageId}`);
            const errorTextElement = errorMessageElement?.querySelector('.error-message');
            if (!errorTextElement) return;

            if (this.errorMessageList) {
              this.errorMessageList.appendChild(this.createErrorListItem(fieldSelector, message));
            }

            errorTextElement.innerText = `${message}.`;
            errorMessageElement.classList.remove('hidden');

            const inputElement = this[`${key}Input`];
            if (!inputElement) return;

            inputElement.setAttribute('aria-invalid', true);
            inputElement.setAttribute('aria-describedby', errorMessageId);
          });
        }

        this.errorMessage.innerText = body;
      }

      createErrorListItem(target, message) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', target);
        a.innerText = message;
        li.appendChild(a);
        li.className = 'error-message';
        return li;
      }

      clearErrorMessage() {
        this.errorMessageWrapper.classList.remove('is-visible');

        if (this.errorMessageList) this.errorMessageList.innerHTML = '';

        this.querySelectorAll('.recipient-fields .form__message').forEach((field) => {
          field.classList.add('hidden');
          const textField = field.querySelector('.error-message');
          if (textField) textField.innerText = '';
        });

        [this.emailInput, this.messageInput, this.nameInput].forEach((inputElement) => {
          inputElement.setAttribute('aria-invalid', false);
          inputElement.removeAttribute('aria-describedby');
        });
      }

      resetRecipientForm() {
        if (this.checkboxInput.checked) {
          this.checkboxInput.checked = false;
          this.clearInputFields();
          this.clearErrorMessage();
        }
      }
    }

    const selectors$4 = {
      slideshow: '[data-product-single-media-group]',
      formWrapper: '[data-form-wrapper]',
      header: '[data-header]',
    };

    const classes$2 = {
      sticky: 'is-sticky',
      headerSticky: 'header--sticky',
    };

    window.theme.variables = {
      productPageSticky: false,
    };

    const sections$4 = {};

    class ProductSticky {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.formWrapper = this.container.querySelector(selectors$4.formWrapper);
        this.stickyScrollTop = 0;
        this.scrollLastPosition = 0;
        this.stickyDefaultTop = 0;
        this.currentPoint = 0;
        this.defaultTopBottomSpacings = 30;
        this.scrollTop = window.scrollY;
        this.scrollDirectionDown = true;
        this.requestAnimationSticky = null;
        this.stickyFormLoad = true;
        this.stickyFormLastHeight = null;
        this.onChangeCounter = 0;
        this.scrollEvent = (e) => this.scrollEvents(e);
        this.resizeEvent = (e) => this.resizeEvents(e);

        if (this.formWrapper) {
          this.init();
        }
      }

      init() {
        this.stickyScrollCheck();

        document.addEventListener('theme:resize:width', this.resizeEvent);

        this.initSticky();
      }

      initSticky() {
        if (theme.variables.productPageSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());

          this.formWrapper.addEventListener('theme:form:sticky', (e) => {
            this.removeAnimationFrame();

            this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
          });

          document.addEventListener('theme:scroll', this.scrollEvent);
        }
      }

      scrollEvents(e) {
        this.scrollTop = e.detail.position;
        this.scrollDirectionDown = e.detail.down;

        if (!this.requestAnimationSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
        }
      }

      resizeEvents(e) {
        this.stickyScrollCheck();

        document.removeEventListener('theme:scroll', this.scrollEvent);

        this.initSticky();
      }

      stickyScrollCheck() {
        if (isDesktop()) {
          const slideshow = this.container.querySelector(selectors$4.slideshow);
          if (!this.formWrapper || !slideshow) return;
          const productCopyHeight = this.formWrapper.offsetHeight;
          const productImagesHeight = slideshow.offsetHeight;

          // Is the product description and form taller than window space
          // Is also shorter than the window and images
          if (productCopyHeight < productImagesHeight) {
            theme.variables.productPageSticky = true;
            this.formWrapper.classList.add(classes$2.sticky);
          } else {
            theme.variables.productPageSticky = false;
            this.formWrapper.classList.remove(classes$2.sticky);
          }
        } else {
          theme.variables.productPageSticky = false;
          this.formWrapper.classList.remove(classes$2.sticky);
        }
      }

      calculateStickyPosition(e = null) {
        const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');
        if (isScrollLocked) {
          this.removeAnimationFrame();
          return;
        }

        const eventExist = Boolean(e && e.detail);
        const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
        const formWrapperHeight = this.formWrapper.offsetHeight;
        const heightDifference = window.innerHeight - formWrapperHeight - this.defaultTopBottomSpacings;
        const scrollDifference = Math.abs(this.scrollTop - this.scrollLastPosition);

        if (this.scrollDirectionDown) {
          this.stickyScrollTop -= scrollDifference;
        } else {
          this.stickyScrollTop += scrollDifference;
        }

        if (this.stickyFormLoad) {
          const header = document.querySelector(selectors$4.header);
          if (header && header.classList.contains(classes$2.headerSticky)) {
            this.stickyDefaultTop = parseInt(document.documentElement.style.getPropertyValue('--header-height')) || 0;
          }

          this.stickyDefaultTop += this.defaultTopBottomSpacings;
          this.stickyScrollTop = this.stickyDefaultTop;
        }

        this.stickyScrollTop = Math.min(Math.max(this.stickyScrollTop, heightDifference), this.stickyDefaultTop);

        const differencePoint = this.stickyScrollTop - this.currentPoint;
        this.currentPoint = this.stickyFormLoad ? this.stickyScrollTop : this.currentPoint + differencePoint * 0.5;

        this.formWrapper.style.setProperty('--sticky-top', `${this.currentPoint}px`);

        this.scrollLastPosition = this.scrollTop;
        this.stickyFormLoad = false;

        if (
          (isAccordion && this.onChangeCounter <= 10) ||
          (isAccordion && this.stickyFormLastHeight !== formWrapperHeight) ||
          (this.stickyScrollTop !== this.currentPoint && this.requestAnimationSticky)
        ) {
          if (isAccordion) {
            this.onChangeCounter += 1;
          }

          if (isAccordion && this.stickyFormLastHeight !== formWrapperHeight) {
            this.onChangeCounter = 11;
          }

          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
        } else if (this.requestAnimationSticky) {
          this.removeAnimationFrame();
        }

        this.stickyFormLastHeight = formWrapperHeight;
      }

      removeAnimationFrame() {
        if (this.requestAnimationSticky) {
          cancelAnimationFrame(this.requestAnimationSticky);
          this.requestAnimationSticky = null;
          this.onChangeCounter = 0;
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.resizeEvent);

        if (theme.variables.productPageSticky) {
          document.removeEventListener('theme:scroll', this.scrollEvent);
        }
      }
    }

    const productStickySection = {
      onLoad() {
        sections$4[this.id] = new ProductSticky(this);
      },
      onUnload() {
        sections$4[this.id].onUnload();
      },
    };

    const selectors$3 = {
      productContainer: '[data-product-container]',
      addToCart: '[data-add-to-cart]',
      shopBar: '[data-shop-bar]',
      productJson: '[data-product-json]',
      form: '[data-product-form-container]',
      dropdown: '[data-single-option-selector]',
      footer: '[data-footer]',
      colorLabel: '[data-color-label]',
      colorSwatch: '[data-color-swatch]',
      dataOption: '[data-option]',
      dataSectionId: 'data-section-id',
      selectTag: 'select',
      dataPosition: 'data-position',
      dataIndex: 'data-index',
    };

    const classes$1 = {
      onboarding: 'onboarding-product',
      shopBarVisible: 'shop-bar--is-visible',
      footerPush: 'site-footer--push',
    };

    let sections$3 = {};

    /**
     * Product section constructor.
     * @param {string} container - selector for the section container DOM element
     */
    class Product {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.id = this.container.getAttribute(selectors$3.dataSectionId);
        this.productContainer = this.container.querySelector(selectors$3.productContainer);
        this.footer = document.querySelector(selectors$3.footer);
        this.onboarding = this.productContainer.classList.contains(classes$1.onboarding);
        this.shopBar = document.querySelector(selectors$3.shopBar);
        this.scrollEvent = throttle(() => this.shopBarShow(), 100);

        if (!this.onboarding) {
          // Stop parsing if we don't have the product json script tag
          // when loading section in the Theme Editor
          const productJson = this.container.querySelector(selectors$3.productJson);
          if ((productJson && !productJson.innerHTML) || !productJson) {
            return;
          }

          // Record recently viewed products when the product page is loading
          Shopify.Products.recordRecentlyViewed();

          this.form = this.container.querySelector(selectors$3.form);

          this.init();

          if (this.shopBar) {
            this.initShopBar();
          }
        } else {
          quantitySelectors();

          this.productContainer.querySelectorAll(selectors$3.colorSwatch).forEach((swatch) => {
            swatch.addEventListener('change', (e) => {
              this.updateColorName(e);
            });
          });
        }
      }

      init() {
        theme.mediaInstances[this.id] = new Media(this.section);
        theme.mediaInstances[this.id].init();
      }

      initShopBar() {
        const cartBarSelectors = this.shopBar.querySelectorAll(selectors$3.selectTag);
        const formSelectors = this.form.querySelectorAll(selectors$3.dropdown);
        const submit = this.shopBar.querySelector(selectors$3.addToCart);

        // Prevent shopbar submit
        submit.addEventListener('click', (e) => {
          e.preventDefault();
        });

        if (cartBarSelectors.length) {
          cartBarSelectors.forEach((element) => {
            // Update product form on cart bar variant change
            element.addEventListener('change', () => {
              const index = element.getAttribute(selectors$3.dataIndex);
              const optionSelected = element.value;
              const targets = this.form.querySelectorAll(`${selectors$3.dropdown}[${selectors$3.dataIndex}="${index}"]`);

              if (targets[0].tagName === 'INPUT') {
                for (const target of targets) {
                  const targetIndex = target.getAttribute(selectors$3.dataIndex);
                  const targetValue = target.value;
                  if (targetIndex === index && targetValue === optionSelected) {
                    target.checked = true;
                    target.dispatchEvent(new Event('change'));
                    break;
                  }
                }
              } else {
                const select = targets[0];
                select.value = optionSelected;
                select.dispatchEvent(new Event('change'));
              }
            });
          });
        }

        // Update cart bar on product form variant change
        if (formSelectors.length) {
          formSelectors.forEach((element) => {
            element.addEventListener('change', () => {
              const index = element.getAttribute(selectors$3.dataIndex);
              const optionSelected = element.value;

              this.shopBar.querySelector(`[${selectors$3.dataIndex}="${index}"]`).value = optionSelected;
            });
          });
        }

        this.shopBarShow();
        window.addEventListener('scroll', this.scrollEvent);
      }

      shopBarShow() {
        const scrolled = window.scrollY;
        const productContainerTop = this.productContainer.getBoundingClientRect().top + scrolled;

        if (scrolled > productContainerTop) {
          this.shopBar.classList.add(classes$1.shopBarVisible);
          this.footer.classList.add(classes$1.footerPush);
        } else if (scrolled < productContainerTop - theme.dimensions.headerScrolled) {
          this.shopBar.classList.remove(classes$1.shopBarVisible);
          this.footer.classList.remove(classes$1.footerPush);
        }
      }

      updateColorName(evt) {
        const target = evt.target;
        const optionLabel = target.closest(selectors$3.dataOption).querySelector(selectors$3.colorLabel);

        if (target.tagName === 'INPUT' && optionLabel !== null) {
          optionLabel.innerText = target.value;
        }
      }

      unload() {
        window.removeEventListener('scroll', this.scrollEvent);
      }
    }

    const productSection = {
      onLoad() {
        sections$3 = new Product(this);
      },
      onUnload: function () {
        if (typeof sections$3.unload === 'function') {
          sections$3.unload();
        }
      },
    };

    register('product', [productFormSection, productSection, swatchSection, productStickySection]);

    if (!customElements.get('complementary-products')) {
      customElements.define('complementary-products', ComplementaryProducts);
    }

    if (!customElements.get('recipient-form')) {
      customElements.define('recipient-form', RecipientForm);
    }

    const sections$2 = {};

    const selectors$2 = {
      recentlyViewed: '#RecentlyViewed',
      dataLimit: 'data-limit',
      productBlock: '[data-product-block]',
      productImage: '[data-product-image]',
    };

    class RecentlyViewedProducts {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.limit = parseInt(this.container.getAttribute(selectors$2.dataLimit));
        this.recentlyViewed = this.container.querySelector(selectors$2.recentlyViewed);

        if (this.recentlyViewed) {
          this.init();
        }
      }

      init() {
        Shopify.Products.showRecentlyViewed({
          howManyToShow: this.limit,
          onComplete: () => {
            const recentlyViewedProducts = this.container.querySelectorAll(selectors$2.productBlock);

            if (recentlyViewedProducts.length > 0) {
              makeGridSwatches(this.container);
              new Quickview(this.container);
            }
          },
        });
      }
    }

    const recentlyViewedProductsSection = {
      onLoad() {
        sections$2[this.id] = new RecentlyViewedProducts(this);
      },
    };

    register('recently-viewed-products', recentlyViewedProductsSection);

    const sections$1 = {};

    const selectors$1 = {
      section: '[data-section-type="related-products"]',
      product: '[data-product-block]',
      productImage: '[data-product-image]',
      sectionId: 'data-section-id',
      productId: 'data-product-id',
      limit: 'data-limit',
    };

    class RelatedProducts {
      constructor(section) {
        this.container = section.container;

        this.init();
      }

      init() {
        const relatedSection = this.container;
        const sectionId = relatedSection.getAttribute(selectors$1.sectionId);
        const productId = relatedSection.getAttribute(selectors$1.productId);
        const limit = relatedSection.getAttribute(selectors$1.limit);
        const requestUrl = `${theme.routes.product_recommendations_url}?section_id=${sectionId}&limit=${limit}&product_id=${productId}`;

        fetch(requestUrl)
          .then((response) => {
            return response.text();
          })
          .then((data) => {
            const createdElement = document.createElement('div');
            createdElement.innerHTML = data;
            const inner = createdElement.querySelector(selectors$1.section);

            if (inner.querySelector(selectors$1.product)) {
              relatedSection.innerHTML = inner.innerHTML;

              makeGridSwatches(relatedSection);
              new Quickview(relatedSection);
            }
          });
      }
    }

    const RelatedSection = {
      onLoad() {
        sections$1[this.id] = new RelatedProducts(this);
      },
    };

    register('related-products', RelatedSection);

    const sections = {};

    const selectors = {
      lazyImage: '[loading="lazy"]',
      shopifySection: '.shopify-section',
      slideshowPrev: '[data-prev-arrow]',
      slideshowNext: '[data-next-arrow]',
      header: '[data-header]',
      dataOptions: 'data-options',
      dataColor: 'data-style',
      dataCurrentColor: 'data-current-style',
      dataSlide: 'data-slide',
      dataSlideIndex: 'data-slide-index',
      scrollBtn: '[data-button-scroll]',
    };

    const classes = {
      slideshowLoading: 'hero--is-loading',
      classIsSelected: 'is-selected',
      flickityEnabled: 'flickity-enabled',
    };

    class Slideshow {
      constructor(section) {
        this.container = section.container;
        this.options = this.container.getAttribute(selectors.dataOptions);
        this.parentContainer = this.container.closest(selectors.shopifySection);
        this.slideshowPrev = this.parentContainer.querySelector(selectors.slideshowPrev);
        this.slideshowNext = this.parentContainer.querySelector(selectors.slideshowNext);
        this.scrollBtn = this.parentContainer.querySelector(selectors.scrollBtn);
        this.checkVisibilityOnScroll = this.checkSliderVisibility();
        this.flkty = null;

        this.init();
      }

      init() {
        let options = JSON.parse(this.options.replace(/'/g, '"'));

        options = {
          ...options,
          cellSelector: `[${selectors.dataSlide}]`,
          on: {
            ready: () => {
              requestAnimationFrame(() => {
                this.container.classList.remove(classes.slideshowLoading);
              });
              this.slideActions();
            },
          },
        };

        this.flkty = new FlickityFade(this.container, options);
        this.flkty.on('change', () => {
          this.slideActions();
        });

        if (this.slideshowPrev) {
          this.slideshowPrev.addEventListener('click', () => this.flkty.previous(true));
        }

        if (this.slideshowNext) {
          this.slideshowNext.addEventListener('click', () => this.flkty.next(true));
        }

        if (this.scrollBtn) {
          this.scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const headerHeight = 59;
            const containerTop = this.parentContainer.offsetTop;
            const containerHeight = this.parentContainer.offsetHeight;
            const scrollPosition = containerTop + containerHeight - headerHeight;

            scroll({
              top: scrollPosition,
              behavior: 'smooth',
            });
          });
        }

        document.addEventListener('theme:scroll', this.checkVisibilityOnScroll);
      }

      isAutoplay() {
        const autoplay = this.flkty.options.autoPlay !== false;

        return autoplay;
      }

      checkSliderVisibility() {
        if (!this.flkty) {
          return;
        }

        const isInitialized = this.container.classList.contains(classes.flickityEnabled);
        const isVisible = window.visibilityHelper.isElementPartiallyVisible(this.container) || window.visibilityHelper.isElementTotallyVisible(this.container);

        if (isVisible && isInitialized && this.isAutoplay()) {
          this.flkty.playPlayer();
        } else {
          this.flkty.stopPlayer();
        }
      }

      slideActions() {
        const currentSlide = this.container.querySelector(`.${classes.classIsSelected}`);
        const currentSlideColor = currentSlide.getAttribute(selectors.dataColor);

        this.container.setAttribute(selectors.dataCurrentColor, currentSlideColor);
      }

      onUnload() {
        this.flkty.destroy();

        document.removeEventListener('theme:scroll', this.checkVisibilityOnScroll);
      }

      onBlockSelect(evt) {
        const slide = this.container.querySelector(`[${selectors.dataSlide}="${evt.detail.blockId}"]`);
        const slideIndex = parseInt(slide.getAttribute(selectors.dataSlideIndex));

        // Go to selected slide, pause autoplay
        this.flkty.select(slideIndex);
        this.flkty.stopPlayer();
      }

      onBlockDeselect() {
        if (this.isAutoplay()) {
          this.flkty.playPlayer();
        }
      }
    }

    const SlideshowSection = {
      onLoad() {
        sections[this.id] = new Slideshow(this);
      },
      onUnload(e) {
        sections[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections[this.id].onBlockSelect(e);
      },
      onBlockDeselect(e) {
        sections[this.id].onBlockDeselect(e);
      },
    };

    register('slideshow', [SlideshowSection, parallaxHero]);

    register('featured-video', [videoPlay, parallaxHero]);

    const wrap = (toWrap, wrapperClass = '', wrapper) => {
      wrapper = wrapper || document.createElement('div');
      wrapper.classList.add(wrapperClass);
      toWrap.parentNode.insertBefore(wrapper, toWrap);
      return wrapper.appendChild(toWrap);
    };

    document.addEventListener('DOMContentLoaded', function () {
      // Load all registered sections on the page.
      load('*');

      // Smooth scroll to anchored element
      const anchorLinks = document.querySelectorAll('[data-anchor-link]');
      anchorLinks.forEach((anchorLink) => {
        anchorLink.addEventListener('click', (e) => {
          e.preventDefault();
          const targetElement = document.getElementById(anchorLink.getAttribute('href').split('#')[1]);
          const position = targetElement.getBoundingClientRect().top + window.scrollY - theme.dimensions.headerScrolled;

          window.scrollTo({
            top: position,
            left: 0,
            behavior: 'smooth',
          });
        });
      });

      // Target tables to make them scrollable
      const tableSelectors = '.rte table';
      const tables = document.querySelectorAll(tableSelectors);
      tables.forEach((table) => {
        wrap(table, 'rte__table-wrapper');
      });

      // Target iframes to make them responsive
      const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
      const frames = document.querySelectorAll(iframeSelectors);
      frames.forEach((frame) => {
        wrap(frame, 'rte__video-wrapper');
      });

      if (window.self !== window.top) {
        document.querySelector('html').classList.add('iframe');
      }

      // Safari smoothscroll polyfill
      let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
      if (!hasNativeSmoothScroll) {
        loadScript({url: window.theme.assets.smoothscroll});
      }
    });

    // Apply a specific class to the html element for browser support of cookies.
    if (window.navigator.cookieEnabled) {
      document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
    }

})(themeVendor.BodyScrollLock, themeVendor.themeCurrency, themeVendor.Flickity, themeVendor.FlickityFade, themeVendor.ajaxinate, themeVendor.FlickityAsNavFor, themeVendor.Rellax);
