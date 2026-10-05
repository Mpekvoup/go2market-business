import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createContactHandler } from './contact.mjs';
import { createSitemapHandler, createRobotsHandler } from './sitemap.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3002;

// Handle API requests before static assets and the site-specific SPA fallback.
const contact = createContactHandler({
  token: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
});
app.all('/api/contact', (req, res, next) => {
  contact(req, res).catch(next);
});
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use('/api', (err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Contact service unavailable' });
});

// Dynamic sitemap and robots.txt - must be before static middleware
// to prevent serving old static files from dist/
app.get('/sitemap.xml', createSitemapHandler());
app.get('/robots.txt', createRobotsHandler());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.hostname} ${req.path}`);
  next();
});

// Static assets with caching (shared across both sites)
app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true,
  index: false, // Don't auto-serve index.html
  redirect: false // Don't redirect directories (we handle this ourselves)
}));

/**
 * Determine site type from hostname and query params
 * @param {string} hostname - Request hostname
 * @param {object} query - URL query parameters
 * @returns {string} - Site type ('consulting' or 'registration')
 */
function getSiteType(hostname, query) {
  // Development: support ?site= query parameter
  if (query.site === 'registration') return 'registration';
  if (query.site === 'consulting') return 'consulting';

  // Production: use hostname
  if (hostname.startsWith('registration.')) return 'registration';

  // Default to consulting
  return 'consulting';
}

/**
 * Get HTML file name for homepage based on site type
 * @param {string} siteType - Site type
 * @returns {string} - HTML filename
 */
function getHtmlFile(siteType) {
  return siteType === 'registration' ? 'index-registration.html' : 'index-consulting.html';
}

/**
 * Validate pathname for security issues.
 * Returns false if path contains suspicious patterns.
 */
function isPathSafe(pathname) {
  // Reject paths with directory traversal or null bytes
  return !pathname.includes('..') && !pathname.includes('\0');
}

/**
 * Normalize pathname: remove trailing slash for prerender lookup.
 */
function normalizeForPrerender(pathname) {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Check if a pre-rendered HTML file exists for this path
 * @param {string} pathname - Request pathname (must be normalized, no trailing slash)
 * @returns {string|null} - Path to pre-rendered HTML or null
 */
function getPrerenderPath(pathname) {
  // Homepage is handled by site-specific index files
  if (pathname === '/') {
    return null;
  }

  // Check if pre-rendered HTML exists for this route
  const htmlPath = path.join(distPath, pathname.slice(1), 'index.html');
  return htmlPath;
}

// Main routing logic
app.get('*', async (req, res) => {
  const hostname = req.hostname;
  const pathname = req.path;
  const { default: fs } = await import('fs/promises');

  try {
    // Security check
    if (!isPathSafe(pathname)) {
      return res.status(400).send('Bad Request');
    }

    const siteType = getSiteType(hostname, req.query);

    // Homepage: serve site-specific HTML
    if (pathname === '/') {
      const htmlFile = getHtmlFile(siteType);
      return res.sendFile(path.join(distPath, htmlFile));
    }

    // Check for pre-rendered routes (shared routes like /privacy, /terms, /case-studies)
    // Normalize trailing slash for consistent prerender lookup
    const normalizedPath = normalizeForPrerender(pathname);
    const prerenderPath = getPrerenderPath(normalizedPath);
    try {
      await fs.access(prerenderPath);
      return res.sendFile(prerenderPath);
    } catch {
      // Pre-rendered file doesn't exist
    }

    // Site-specific 404 file
    const notFoundPath = path.join(distPath, `404-${siteType}.html`);

    // Check if this is a static asset request (has file extension)
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
    if (hasExtension) {
      // Static asset not found - Express static middleware already tried
      try {
        await fs.access(notFoundPath);
        res.set('Cache-Control', 'no-store');
        return res.status(404).sendFile(notFoundPath);
      } catch {
        res.set('Cache-Control', 'no-store');
        return res.status(404).send('Not Found');
      }
    }

    // Unknown route without extension - serve 404 with 404 status
    try {
      await fs.access(notFoundPath);
      res.set('Cache-Control', 'no-store');
      return res.status(404).sendFile(notFoundPath);
    } catch {
      res.set('Cache-Control', 'no-store');
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    console.error('Error serving file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 G2M Server running on port ${PORT}`);
  console.log(`\n📍 Local URLs:`);
  console.log(`   🔵 Consulting:    http://localhost:${PORT}/`);
  console.log(`   🟢 Registration:  http://localhost:${PORT}/?site=registration`);
  console.log(`\n📍 Production domains:`);
  console.log(`   🔵 https://consulting.go2market.qa`);
  console.log(`   🟢 https://registration.go2market.qa`);
  console.log(``);
});
