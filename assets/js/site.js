/**
 * Theme (light/dark), plain-text mode, shared chrome helpers.
 */
(function () {
  const THEME_KEY = 'ea-theme';
  const PLAIN_KEY = 'ea-plain';

  function applyTheme(theme) {
    const t = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      el.textContent = t === 'light' ? 'Dark' : 'Light';
    });
  }

  function applyPlain(on) {
    document.documentElement.classList.toggle('plain-text', !!on);
    localStorage.setItem(PLAIN_KEY, on ? '1' : '0');
    document.querySelectorAll('[data-plain-toggle]').forEach((el) => {
      el.textContent = on ? 'Rich' : 'Plain';
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // Apply early theme from storage (also set in <head> inline when possible)
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
  if (localStorage.getItem(PLAIN_KEY) === '1') applyPlain(true);

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
    applyPlain(localStorage.getItem(PLAIN_KEY) === '1');

    document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
      });
    });
    document.querySelectorAll('[data-plain-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        applyPlain(!document.documentElement.classList.contains('plain-text'));
      });
    });
  });

  window.EASite = { applyTheme, applyPlain };
})();
