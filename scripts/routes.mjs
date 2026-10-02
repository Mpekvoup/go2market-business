/**
 * Shared routes and site configuration.
 * Single source of truth for prerender.mjs and server/sitemap.mjs.
 *
 * IMPORTANT: This module must be pure JavaScript (no TypeScript, no JSX).
 * It is imported by both build scripts and the production Node server.
 */

/**
 * Site configurations with trusted origins.
 * Used for sitemap generation and robots.txt.
 */
export const SITE_CONFIGS = {
  consulting: {
    domain: 'consulting.go2market.qa',
    origin: 'https://consulting.go2market.qa',
  },
  registration: {
    domain: 'registration.go2market.qa',
    origin: 'https://registration.go2market.qa',
  },
};

/**
 * Shared routes that appear on consulting site and sitemap.
 * Registration site only has homepage (handled separately).
 */
export const SHARED_ROUTES = [
  '/case-studies',
  '/case-studies/caring-hands',
  '/case-studies/sidr-technology',
  '/case-studies/qalan',
  '/services/b2b-lead-generation',
  '/services/business-intelligence',
  '/services/incorporation',
  '/services/business-matchmaking',
  '/services/fundraising',
  '/privacy',
  '/terms',
];

/**
 * Get all sitemap URLs for a site.
 * @param {string} siteKey - 'consulting' or 'registration'
 * @returns {string[]} - Array of absolute URLs
 */
export function getSitemapUrls(siteKey) {
  const config = SITE_CONFIGS[siteKey];
  if (!config) {
    throw new Error(`Unknown site: ${siteKey}`);
  }

  if (siteKey === 'registration') {
    // Registration site only has homepage
    return [`${config.origin}/`];
  }

  // Consulting site has homepage + all shared routes
  const urls = [`${config.origin}/`];
  for (const route of SHARED_ROUTES) {
    urls.push(`${config.origin}${route}`);
  }
  return urls;
}

/**
 * Determine site key from hostname.
 * Returns 'consulting' or 'registration', defaults to 'consulting' for unknown hosts.
 */
export function getSiteKeyFromHostname(hostname) {
  if (hostname === SITE_CONFIGS.registration.domain || hostname.startsWith('registration.')) {
    return 'registration';
  }
  return 'consulting';
}
