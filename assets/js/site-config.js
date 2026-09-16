/**
 * Effective Agents — public site config (safe to commit).
 * Set TIP_URL to your BuyMeACoffee / Stripe Payment Link / similar.
 * Leave as empty string to keep the #tip section instructions only.
 */
window.EA_CONFIG = Object.assign(
  {
    TIP_URL: '',
    CONTACT_EMAIL: 'hello@example.com',
    SITE_NAME: 'Effective Agents',
    TAGLINE: 'Ship Outcomes, Not Chat',
  },
  window.EA_CONFIG || {}
);
