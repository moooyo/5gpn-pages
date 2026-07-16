(function () {
  'use strict';

  var THEME_KEY = '5gpn-theme';
  var THEME_ORDER = ['auto', 'light', 'dark'];
  var THEME_LABELS = {
    auto: '自动',
    light: '浅色',
    dark: '深色'
  };
  var root = document.documentElement;
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function currentTheme() {
    try {
      var value = localStorage.getItem(THEME_KEY);
      return THEME_ORDER.indexOf(value) !== -1 ? value : 'auto';
    } catch (error) {
      return 'auto';
    }
  }

  function nextTheme(theme) {
    return THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
  }

  function updateThemeColor(theme) {
    var meta = document.getElementById('themeColor');
    if (!meta) return;
    var dark = theme === 'dark' || (theme === 'auto' && systemDark.matches);
    meta.setAttribute('content', dark ? '#0a0a0c' : '#fbfbfd');
  }

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }

    var upcoming = nextTheme(theme);
    document.querySelectorAll('[data-theme-label]').forEach(function (label) {
      label.textContent = THEME_LABELS[theme];
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute(
        'aria-label',
        '当前主题：' + THEME_LABELS[theme] + '；点击切换至' + THEME_LABELS[upcoming]
      );
    });
    updateThemeColor(theme);
  }

  applyTheme(currentTheme());

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-theme-toggle]');
    if (!button) return;

    var theme = nextTheme(currentTheme());
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {}
    applyTheme(theme);
  });

  systemDark.addEventListener('change', function () {
    if (currentTheme() === 'auto') updateThemeColor('auto');
  });

  window.addEventListener('storage', function (event) {
    if (event.key === THEME_KEY) applyTheme(currentTheme());
  });

  var DEFAULT_INSTALL_COMMAND =
    'curl -fsSL https://raw.githubusercontent.com/moooyo/5gpn/main/quick-install.sh | sudo bash';
  var copyResetTimer;

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (document.execCommand('copy')) resolve();
        else reject(new Error('Copy command was rejected'));
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }
    return fallbackCopy(text);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-copy-command]');
    if (!button) return;

    var label = button.querySelector('[data-copy-label]');
    if (!label) return;

    label.textContent = '已复制';
    window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(function () {
      label.textContent = '复制';
    }, 1600);

    var command = button.getAttribute('data-copy-text') || DEFAULT_INSTALL_COMMAND;
    copyText(command).catch(function () {
      // Some embedded previews deny clipboard access even after a user gesture.
      // The visible state follows the product interaction spec; HTTPS browsers
      // still use the Clipboard API and older browsers get the fallback path.
    });
  });

  function syncDiagramMotion() {
    document.querySelectorAll('[data-animated-diagram]').forEach(function (svg) {
      if (reducedMotion.matches && typeof svg.pauseAnimations === 'function') {
        svg.pauseAnimations();
      } else if (!reducedMotion.matches && typeof svg.unpauseAnimations === 'function') {
        svg.unpauseAnimations();
      }
    });
  }

  syncDiagramMotion();
  reducedMotion.addEventListener('change', syncDiagramMotion);

  // DNS Gateway and Apple Relay are separate static documents for resilient direct
  // links and SEO. Enhance their switcher into an in-page navigation after load so
  // the shared shell stays mounted; normal navigation remains the failure fallback.
  var PAGE_META_SELECTOR = [
    'link[rel="canonical"]',
    'link[rel="prefetch"]',
    'meta[name="description"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]'
  ].join(',');
  var PAGE_SLOT_SELECTORS = ['.nav', 'main', '.footer'];
  var pageCache = new Map();
  var navigationSequence = 0;
  var transitionSequence = 0;
  var scrollSaveFrame = 0;
  var renderedPageKey = window.location.pathname + window.location.search;

  function solutionPageIsActive() {
    return document.body.hasAttribute('data-solution-page');
  }

  function pageKey(url) {
    return url.pathname + url.search;
  }

  function readHistoryState() {
    return history.state && typeof history.state === 'object' ? history.state : {};
  }

  function saveScrollPosition() {
    if (!solutionPageIsActive()) return;
    history.replaceState(Object.assign({}, readHistoryState(), {
      solutionPage: true,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    }), '', window.location.href);
  }

  function loadSolutionPage(url) {
    var key = url.href;
    if (!pageCache.has(key)) {
      pageCache.set(key, fetch(key, { credentials: 'same-origin' }).then(function (response) {
        if (!response.ok) throw new Error('页面加载失败：' + response.status);
        return response.text();
      }).catch(function (error) {
        pageCache.delete(key);
        throw error;
      }));
    }

    return pageCache.get(key).then(function (html) {
      var nextDocument = new DOMParser().parseFromString(html, 'text/html');
      var valid = nextDocument.body.hasAttribute('data-solution-page') &&
        PAGE_SLOT_SELECTORS.every(function (selector) {
          return nextDocument.querySelector(selector);
        });
      if (!valid) throw new Error('目标页面结构不完整');
      return nextDocument;
    });
  }

  function syncPageMetadata(nextDocument) {
    document.title = nextDocument.title;
    document.querySelectorAll(PAGE_META_SELECTOR).forEach(function (node) {
      node.remove();
    });
    nextDocument.querySelectorAll(PAGE_META_SELECTOR).forEach(function (node) {
      document.head.appendChild(document.importNode(node, true));
    });
  }

  function replacePage(nextDocument, url, options) {
    syncPageMetadata(nextDocument);
    PAGE_SLOT_SELECTORS.forEach(function (selector) {
      var current = document.querySelector(selector);
      var incoming = document.importNode(nextDocument.querySelector(selector), true);
      current.replaceWith(incoming);
    });
    document.body.setAttribute(
      'data-solution-page',
      nextDocument.body.getAttribute('data-solution-page')
    );

    if (options.history === 'push') {
      history.pushState({ solutionPage: true, scrollX: 0, scrollY: 0 }, '', url.href);
    }
    renderedPageKey = pageKey(url);
    applyTheme(currentTheme());
    syncDiagramMotion();
    window.scrollTo(options.scrollX || 0, options.scrollY || 0);
  }

  function focusPageContent() {
    var content = document.getElementById('content');
    if (content) content.focus({ preventScroll: true });
  }

  function renderSolutionPage(nextDocument, url, options) {
    var swap = function () {
      replacePage(nextDocument, url, options);
    };

    if (!reducedMotion.matches && typeof document.startViewTransition === 'function') {
      var transitionToken = String(++transitionSequence);
      var direction = nextDocument.body.getAttribute('data-solution-page') === 'relay'
        ? 'forward'
        : 'back';
      root.setAttribute('data-solution-direction', direction);
      root.setAttribute('data-solution-transition', transitionToken);
      var transition = document.startViewTransition(swap);
      // A second navigation can intentionally supersede an in-flight transition.
      // Consume `ready` rejections so browsers do not report the expected skip as
      // an unhandled AbortError.
      transition.ready.catch(function () {});
      var finishTransition = function () {
        if (root.getAttribute('data-solution-transition') === transitionToken) {
          root.removeAttribute('data-solution-direction');
          root.removeAttribute('data-solution-transition');
        }
        focusPageContent();
      };
      transition.finished.then(finishTransition, finishTransition);
      return transition.updateCallbackDone;
    } else {
      swap();
      focusPageContent();
      return Promise.resolve();
    }
  }

  function navigateToSolution(url, options) {
    var sequence = ++navigationSequence;
    document.body.setAttribute('aria-busy', 'true');

    return loadSolutionPage(url).then(function (nextDocument) {
      if (sequence !== navigationSequence) return;
      return renderSolutionPage(nextDocument, url, options);
    }).catch(function () {
      if (sequence === navigationSequence) window.location.assign(url.href);
    }).finally(function () {
      if (sequence === navigationSequence) document.body.removeAttribute('aria-busy');
    });
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-solution-link]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    saveScrollPosition();
    navigateToSolution(url, { history: 'push', scrollX: 0, scrollY: 0 });
  });

  window.addEventListener('popstate', function (event) {
    if (!solutionPageIsActive()) return;
    var url = new URL(window.location.href);
    if (pageKey(url) === renderedPageKey) return;

    var state = event.state && typeof event.state === 'object' ? event.state : {};
    navigateToSolution(url, {
      history: 'none',
      scrollX: Number.isFinite(state.scrollX) ? state.scrollX : 0,
      scrollY: Number.isFinite(state.scrollY) ? state.scrollY : 0
    });
  });

  window.addEventListener('scroll', function () {
    if (!solutionPageIsActive() || document.body.hasAttribute('aria-busy') || scrollSaveFrame) return;
    scrollSaveFrame = window.requestAnimationFrame(function () {
      scrollSaveFrame = 0;
      saveScrollPosition();
    });
  }, { passive: true });

  if (solutionPageIsActive()) {
    saveScrollPosition();
    var initialHTML = '<!doctype html>\n' + document.documentElement.outerHTML;
    var initialURL = new URL(window.location.href);
    initialURL.hash = '';
    pageCache.set(initialURL.href, Promise.resolve(initialHTML));
    if (document.body.getAttribute('data-solution-page') === 'dns') {
      pageCache.set(new URL('index.html', initialURL).href, Promise.resolve(initialHTML));
    }
    var warmPages = function () {
      document.querySelectorAll('a[data-solution-link]').forEach(function (link) {
        loadSolutionPage(new URL(link.href, window.location.href)).catch(function () {});
      });
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(warmPages);
    else window.setTimeout(warmPages, 0);
  }
})();
