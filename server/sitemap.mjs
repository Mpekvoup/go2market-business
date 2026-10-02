/**
 * Sitemap and robots.txt generation for business sites.
 * Uses trusted site configurations from shared routes module.
 * Never reflects arbitrary Host headers in generated URLs.
 */
import {
  SITE_CONFIGS,
  SHARED_ROUTES,
  getSitemapUrls,
  getSiteKeyFromHostname,
} from '../scripts/routes.mjs';

// Re-export for use by tests
export { SITE_CONFIGS, SHARED_ROUTES, getSitemapUrls, getSiteKeyFromHostname };

/**
 * Escape XML special characters.
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate sitemap XML for a site.
 * @param {string} siteKey - 'consulting' or 'registration'
 * @returns {string} - Complete sitemap XML
 */
export function generateSitemapXml(siteKey) {
  const urls = getSitemapUrls(siteKey);

  const urlEntries = urls.map(url => {
    const safeUrl = escapeXml(url);
    return `  <url>\n    <loc>${safeUrl}</loc>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

/**
 * Generate robots.txt for a site.
 * @param {string} siteKey - 'consulting' or 'registration'
 * @returns {string} - Complete robots.txt content
 */
export function generateRobotsTxt(siteKey) {
  const config = SITE_CONFIGS[siteKey];
  if (!config) {
    throw new Error(`Unknown site: ${siteKey}`);
  }

  return `# Allow Facebook crawlers for Events Setup Tool
User-agent: meta-externalagent
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: ${config.origin}/sitemap.xml
`;
}

/**
 * Create Express middleware for sitemap.xml
 */
export function createSitemapHandler() {
  return (req, res) => {
    const siteKey = getSiteKeyFromHostname(req.hostname);
    const xml = generateSitemapXml(siteKey);
    res.type('application/xml').send(xml);
  };
}

/**
 * Create Express middleware for robots.txt
 */
export function createRobotsHandler() {
  return (req, res) => {
    const siteKey = getSiteKeyFromHostname(req.hostname);
    const txt = generateRobotsTxt(siteKey);
    res.type('text/plain').send(txt);
  };
}
