import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3000;

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.hostname} ${req.path}`);
  next();
});

// Static assets with caching (shared across both sites)
app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true,
  index: false // Don't auto-serve index.html
}));

/**
 * Determine which HTML file to serve based on hostname and query params
 * @param {string} hostname - Request hostname
 * @param {object} query - URL query parameters
 * @returns {string} - HTML filename ('index-consulting.html' or 'index-registration.html')
 */
function getHtmlFile(hostname, query) {
  // Development: support ?site= query parameter
  if (query.site === 'registration') {
    return 'index-registration.html';
  }
  if (query.site === 'consulting') {
    return 'index-consulting.html';
  }

  // Production: use hostname
  if (hostname.startsWith('registration.')) {
    return 'index-registration.html';
  }

  // Default to consulting
  return 'index-consulting.html';
}

/**
 * Check if a pre-rendered HTML file exists for this path
 * @param {string} pathname - Request pathname
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

  try {
    // Check for pre-rendered routes first (shared routes like /privacy, /terms, /case-studies)
    if (pathname !== '/') {
      const prerenderPath = getPrerenderPath(pathname);

      try {
        // Try to serve pre-rendered HTML
        const { default: fs } = await import('fs/promises');
        await fs.access(prerenderPath);
        return res.sendFile(prerenderPath);
      } catch (err) {
        // Pre-rendered file doesn't exist, fall through to SPA
      }
    }

    // Homepage or SPA fallback: serve site-specific HTML
    const htmlFile = getHtmlFile(hostname, req.query);
    res.sendFile(path.join(distPath, htmlFile));
  } catch (err) {
    console.error('Error serving file:', err);

    // Fallback to consulting site on error
    res.sendFile(path.join(distPath, 'index-consulting.html'));
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
