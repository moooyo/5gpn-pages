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

  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var theme = nextTheme(currentTheme());
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (error) {}
      applyTheme(theme);
    });
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

  document.querySelectorAll('[data-copy-command]').forEach(function (button) {
    button.addEventListener('click', function () {
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
})();
