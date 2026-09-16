/**
 * Theme (light/dark), plain-text mode, stripHtml, cookie consent, flourishes.
 */
(function () {
  const THEME_KEY = 'ea-theme';
  const PLAIN_KEY = 'ea-plain';
  const COOKIE_KEY = 'ea-cookie-consent';
  const GRID_KEY = 'ea-thirds-grid';

  function stripHtml(s) {
    if (s == null) return '';
    const str = String(s);
    if (typeof document !== 'undefined') {
      const el = document.createElement('div');
      el.innerHTML = str;
      return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
    }
    return str
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyTheme(theme) {
    const t = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch (_) {}
    document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      el.textContent = t === 'light' ? 'Dark' : 'Light';
    });
  }

  function applyPlain(on) {
    document.documentElement.classList.toggle('plain-text', !!on);
    try {
      localStorage.setItem(PLAIN_KEY, on ? '1' : '0');
    } catch (_) {}
    document.querySelectorAll('[data-plain-toggle]').forEach((el) => {
      el.textContent = on ? 'Rich' : 'Plain';
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function getConsent() {
    try {
      const raw = localStorage.getItem(COOKIE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setConsent(prefs) {
    const payload = {
      necessary: true,
      analytics: !!prefs.analytics,
      ts: new Date().toISOString(),
    };
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify(payload));
    } catch (_) {}
    document.documentElement.setAttribute(
      'data-analytics',
      payload.analytics ? '1' : '0'
    );
    // Only set non-essential cookies after consent — we store preference in localStorage only.
    hideCookieBanner();
    return payload;
  }

  function hideCookieBanner() {
    const b = document.getElementById('ea-cookie-banner');
    if (b) b.remove();
  }

  function showCookieBanner() {
    if (getConsent()) return;
    if (document.getElementById('ea-cookie-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'ea-cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
      '<p><strong>Cookies</strong> — We use necessary storage for theme and game progress. Analytics are off unless you opt in. ' +
      '<a href="' +
      resolveLegalHref() +
      '#cookies">Details</a></p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="chip chip--ghost" data-cookie-deny>Necessary only</button>' +
      '<button type="button" class="chip chip--active" data-cookie-accept>Accept analytics</button>' +
      '</div></div>';
    document.body.appendChild(banner);
    banner.querySelector('[data-cookie-deny]').addEventListener('click', () => {
      setConsent({ analytics: false });
    });
    banner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
      setConsent({ analytics: true });
    });
  }

  function resolveLegalHref() {
    const path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    if (path === '/' || path.endsWith('/effective-agents')) return './legal/';
    const segs = path.split('/').filter(Boolean);
    // Nested capability lenses, blog posts, game v2
    if (
      path.includes('/game/v2') ||
      (path.includes('/blog/') && segs.length >= 2) ||
      (path.includes('/capabilities/') && segs.length >= 2)
    ) {
      return '../../legal/';
    }
    if (segs.length >= 1) {
      return '../legal/';
    }
    return './legal/';
  }

  function applyTipButton() {
    const cfg = window.EA_CONFIG || {};
    document.querySelectorAll('[data-tip-cta]').forEach((el) => {
      const url = (cfg.TIP_URL || '').trim();
      if (url) {
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
        el.classList.remove('is-placeholder');
      } else {
        const tipHref = resolveLegalHref() + '#tip';
        el.setAttribute('href', tipHref);
        el.removeAttribute('target');
        el.classList.add('is-placeholder');
      }
    });
    document.querySelectorAll('[data-contact-email]').forEach((el) => {
      const email = (cfg.CONTACT_EMAIL || 'hello@example.com').trim();
      el.textContent = email;
      if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + email);
    });
  }

  function initFlourishes() {
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Thirds grid overlay toggle
    document.querySelectorAll('[data-grid-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const on = !document.documentElement.classList.contains('show-thirds');
        document.documentElement.classList.toggle('show-thirds', on);
        try {
          localStorage.setItem(GRID_KEY, on ? '1' : '0');
        } catch (_) {}
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        el.textContent = on ? 'Grid on' : 'Grid';
      });
    });
    try {
      if (localStorage.getItem(GRID_KEY) === '1') {
        document.documentElement.classList.add('show-thirds');
      }
    } catch (_) {}

    if (reduce) return;

    // Soft parallax on framed heroes
    document.querySelectorAll('.framed.parallax-host, .hero .framed').forEach((frame) => {
      frame.classList.add('parallax-host');
      const onMove = (e) => {
        const r = frame.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.setProperty('--px', (x * 6).toFixed(2) + 'px');
        frame.style.setProperty('--py', (y * 4).toFixed(2) + 'px');
      };
      frame.addEventListener('pointermove', onMove);
      frame.addEventListener('pointerleave', () => {
        frame.style.setProperty('--px', '0px');
        frame.style.setProperty('--py', '0px');
      });
    });

    // Our Goal section markers
    document.querySelectorAll('main section.block').forEach((sec, i) => {
      if (sec.querySelector('.sect-mark')) return;
      const mark = document.createElement('span');
      mark.className = 'sect-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = String(i + 1).padStart(2, '0');
      sec.prepend(mark);
    });
  }

  // Apply early theme from storage
  try {
    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
    if (localStorage.getItem(PLAIN_KEY) === '1') applyPlain(true);
    const c = getConsent();
    if (c) {
      document.documentElement.setAttribute(
        'data-analytics',
        c.analytics ? '1' : '0'
      );
    }
  } catch (_) {}

  document.addEventListener('DOMContentLoaded', () => {
    try {
      applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
      applyPlain(localStorage.getItem(PLAIN_KEY) === '1');
    } catch (_) {}

    document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const next =
          document.documentElement.getAttribute('data-theme') === 'light'
            ? 'dark'
            : 'light';
        applyTheme(next);
      });
    });
    document.querySelectorAll('[data-plain-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        applyPlain(!document.documentElement.classList.contains('plain-text'));
      });
    });

    applyTipButton();
    showCookieBanner();
    if (!document.querySelector('.thirds-overlay')) {
      const ov = document.createElement('div');
      ov.className = 'thirds-overlay';
      ov.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ov);
    }
    initFlourishes();
  });

  window.EASite = {
    applyTheme,
    applyPlain,
    stripHtml,
    escapeHtml,
    getConsent,
    setConsent,
  };
})();
