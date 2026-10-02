/**
 * Unit and integration tests for sitemap and robots.txt generation.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import http from 'node:http';
import {
  SITE_CONFIGS,
  SHARED_ROUTES,
  getSiteKeyFromHostname,
  getSitemapUrls,
  generateSitemapXml,
  generateRobotsTxt,
} from './sitemap.mjs';

// Request timeout for all HTTP calls (5 seconds)
const REQUEST_TIMEOUT_MS = 5000;

// ============================================================================
// Unit tests for pure functions
// ============================================================================

describe('getSiteKeyFromHostname', () => {
  test('returns consulting for consulting.go2market.qa', () => {
    assert.equal(getSiteKeyFromHostname('consulting.go2market.qa'), 'consulting');
  });

  test('returns registration for registration.go2market.qa', () => {
    assert.equal(getSiteKeyFromHostname('registration.go2market.qa'), 'registration');
  });

  test('returns registration for registration.localhost', () => {
    assert.equal(getSiteKeyFromHostname('registration.localhost'), 'registration');
  });

  test('defaults to consulting for localhost', () => {
    assert.equal(getSiteKeyFromHostname('localhost'), 'consulting');
  });

  test('defaults to consulting for unknown host', () => {
    assert.equal(getSiteKeyFromHostname('example.com'), 'consulting');
  });
});

describe('getSitemapUrls', () => {
  test('consulting has 12 URLs (homepage + 11 shared routes)', () => {
    const urls = getSitemapUrls('consulting');
    assert.equal(urls.length, 12, `Expected 12 URLs, got ${urls.length}`);
  });

  test('consulting homepage is first URL', () => {
    const urls = getSitemapUrls('consulting');
    assert.equal(urls[0], 'https://consulting.go2market.qa/');
  });

  test('consulting includes b2b-lead-generation', () => {
    const urls = getSitemapUrls('consulting');
    assert.ok(
      urls.includes('https://consulting.go2market.qa/services/b2b-lead-generation'),
      'Should include b2b-lead-generation'
    );
  });

  test('consulting includes all case studies', () => {
    const urls = getSitemapUrls('consulting');
    assert.ok(urls.includes('https://consulting.go2market.qa/case-studies'));
    assert.ok(urls.includes('https://consulting.go2market.qa/case-studies/caring-hands'));
    assert.ok(urls.includes('https://consulting.go2market.qa/case-studies/sidr-technology'));
    assert.ok(urls.includes('https://consulting.go2market.qa/case-studies/qalan'));
  });

  test('consulting includes all services', () => {
    const urls = getSitemapUrls('consulting');
    assert.ok(urls.includes('https://consulting.go2market.qa/services/incorporation'));
    assert.ok(urls.includes('https://consulting.go2market.qa/services/business-intelligence'));
    assert.ok(urls.includes('https://consulting.go2market.qa/services/business-matchmaking'));
    assert.ok(urls.includes('https://consulting.go2market.qa/services/fundraising'));
    assert.ok(urls.includes('https://consulting.go2market.qa/services/b2b-lead-generation'));
  });

  test('consulting includes legal pages', () => {
    const urls = getSitemapUrls('consulting');
    assert.ok(urls.includes('https://consulting.go2market.qa/privacy'));
    assert.ok(urls.includes('https://consulting.go2market.qa/terms'));
  });

  test('registration has exactly 1 URL (homepage only)', () => {
    const urls = getSitemapUrls('registration');
    assert.equal(urls.length, 1, `Expected 1 URL, got ${urls.length}`);
    assert.equal(urls[0], 'https://registration.go2market.qa/');
  });

  test('throws for unknown site', () => {
    assert.throws(() => getSitemapUrls('unknown'), /Unknown site/);
  });

  test('consulting URLs match SHARED_ROUTES exactly', () => {
    const urls = getSitemapUrls('consulting');
    const origin = SITE_CONFIGS.consulting.origin;

    // Check homepage
    assert.ok(urls.includes(`${origin}/`), 'Should include homepage');

    // Check all shared routes are present
    for (const route of SHARED_ROUTES) {
      assert.ok(
        urls.includes(`${origin}${route}`),
        `Should include shared route: ${route}`
      );
    }

    // Check no extra URLs beyond homepage + shared routes
    assert.equal(
      urls.length,
      1 + SHARED_ROUTES.length,
      `Expected ${1 + SHARED_ROUTES.length} URLs (homepage + ${SHARED_ROUTES.length} shared routes)`
    );
  });
});

describe('generateSitemapXml', () => {
  test('generates valid XML with namespace', () => {
    const xml = generateSitemapXml('consulting');
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  });

  test('consulting sitemap has 12 <loc> tags', () => {
    const xml = generateSitemapXml('consulting');
    const locMatches = xml.match(/<loc>/g);
    assert.equal(locMatches?.length, 12, `Expected 12 <loc> tags, got ${locMatches?.length}`);
  });

  test('registration sitemap has 1 <loc> tag', () => {
    const xml = generateSitemapXml('registration');
    const locMatches = xml.match(/<loc>/g);
    assert.equal(locMatches?.length, 1, `Expected 1 <loc> tag, got ${locMatches?.length}`);
  });

  test('all URLs in loc tags use HTTPS', () => {
    const xml = generateSitemapXml('consulting');
    // Extract all URLs from <loc> tags
    const locUrls = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    for (const loc of locUrls) {
      assert.ok(!loc.includes('http://'), `URL should use HTTPS: ${loc}`);
      assert.ok(loc.includes('https://'), `URL should use HTTPS: ${loc}`);
    }
  });

  test('no localhost URLs in loc tags', () => {
    const xml = generateSitemapXml('consulting');
    const locUrls = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    for (const loc of locUrls) {
      assert.ok(!loc.includes('localhost'), `URL should not contain localhost: ${loc}`);
    }
  });

  test('no query parameters or hash in loc tags', () => {
    const xml = generateSitemapXml('consulting');
    const locUrls = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    for (const loc of locUrls) {
      assert.ok(!loc.includes('?'), `URL should not contain query parameters: ${loc}`);
      assert.ok(!loc.includes('#'), `URL should not contain hash: ${loc}`);
    }
  });
});

describe('generateRobotsTxt', () => {
  test('consulting robots references consulting sitemap', () => {
    const txt = generateRobotsTxt('consulting');
    assert.ok(txt.includes('Sitemap: https://consulting.go2market.qa/sitemap.xml'));
  });

  test('registration robots references registration sitemap', () => {
    const txt = generateRobotsTxt('registration');
    assert.ok(txt.includes('Sitemap: https://registration.go2market.qa/sitemap.xml'));
  });

  test('allows all crawlers', () => {
    const txt = generateRobotsTxt('consulting');
    assert.ok(txt.includes('User-agent: *'));
    assert.ok(txt.includes('Allow: /'));
  });

  test('includes Facebook crawler rules', () => {
    const txt = generateRobotsTxt('consulting');
    assert.ok(txt.includes('User-agent: facebookexternalhit'));
    assert.ok(txt.includes('User-agent: meta-externalagent'));
  });

  test('throws for unknown site', () => {
    assert.throws(() => generateRobotsTxt('unknown'), /Unknown site/);
  });
});

describe('SITE_CONFIGS', () => {
  test('consulting origin is trusted', () => {
    assert.equal(SITE_CONFIGS.consulting.origin, 'https://consulting.go2market.qa');
  });

  test('registration origin is trusted', () => {
    assert.equal(SITE_CONFIGS.registration.origin, 'https://registration.go2market.qa');
  });
});

describe('SHARED_ROUTES from shared module', () => {
  test('SHARED_ROUTES is exported and non-empty', () => {
    assert.ok(Array.isArray(SHARED_ROUTES));
    assert.ok(SHARED_ROUTES.length > 0, 'SHARED_ROUTES should not be empty');
  });

  test('SHARED_ROUTES has 11 routes', () => {
    assert.equal(SHARED_ROUTES.length, 11, `Expected 11 shared routes, got ${SHARED_ROUTES.length}`);
  });

  test('all routes start with /', () => {
    for (const route of SHARED_ROUTES) {
      assert.ok(route.startsWith('/'), `Route should start with /: ${route}`);
    }
  });
});

// ============================================================================
// Integration tests with real server
// ============================================================================

let serverProcess;
let serverPort;

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

async function startServer(port) {
  const cwd = process.cwd();
  const serverPath = 'server/index.js';

  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: String(port) },
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.kill('SIGKILL');
        reject(new Error(`Server start timeout (10s).\nstdout: ${stdout}\nstderr: ${stderr}`));
      }
    }, 10000);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (!resolved && stdout.includes('G2M Server running')) {
        resolved = true;
        clearTimeout(timeout);
        setTimeout(() => resolve(proc), 200);
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Failed to spawn server: ${err.message}`));
      }
    });

    proc.on('exit', (code, signal) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Server exited early (code=${code}, signal=${signal}).\nstdout: ${stdout}\nstderr: ${stderr}`));
      }
    });
  });
}

async function stopServer(proc) {
  if (!proc || proc.killed) return;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve();
    }, 3000);

    proc.on('exit', () => {
      clearTimeout(timeout);
      resolve();
    });

    proc.kill('SIGTERM');
  });
}

/**
 * Make HTTP request with custom Host header using http module.
 * Node.js fetch overrides Host header, so we use http.request directly.
 * Properly handles HEAD requests by waiting for response to end.
 * Includes timeout to prevent hanging tests.
 * Optionally follows redirects (up to maxRedirects).
 */
function fetchWithHost(path, hostname, method = 'GET', maxRedirects = 0) {
  return new Promise((resolve, reject) => {
    const makeRequest = (currentPath, redirectsLeft) => {
      const options = {
        hostname: '127.0.0.1',
        port: serverPort,
        path: currentPath,
        method,
        headers: { Host: hostname },
        timeout: REQUEST_TIMEOUT_MS,
      };

      const req = http.request(options, (res) => {
        // Handle redirects
        if (redirectsLeft > 0 && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          makeRequest(res.headers.location, redirectsLeft - 1);
          return;
        }

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: { get: (name) => res.headers[name.toLowerCase()] },
            text: data,
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms: ${method} ${currentPath}`));
      });

      req.on('error', reject);
      req.end();
    };

    makeRequest(path, maxRedirects);
  });
}

/**
 * Extract canonical URL from HTML response.
 * Returns null if no canonical found, or an array if multiple found.
 */
function extractCanonical(html) {
  const matches = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/gi) || [];
  const canonicals = [];

  for (const match of matches) {
    const hrefMatch = match.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      canonicals.push(hrefMatch[1]);
    }
  }

  if (canonicals.length === 0) return null;
  if (canonicals.length === 1) return canonicals[0];
  return canonicals; // Multiple canonicals - should be an error
}

/**
 * Extract URLs from sitemap XML.
 */
function extractSitemapUrls(xml) {
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return matches.map(m => m.replace(/<\/?loc>/g, ''));
}

describe('Server sitemap/robots endpoints', () => {
  before(async () => {
    serverPort = await findFreePort();
    serverProcess = await startServer(serverPort);
  });

  after(async () => {
    await stopServer(serverProcess);
    serverProcess = null;
  });

  test('GET /sitemap.xml for consulting returns 12 URLs', async () => {
    const { status, headers, text } = await fetchWithHost('/sitemap.xml', 'consulting.go2market.qa');
    assert.equal(status, 200);
    assert.ok(headers.get('content-type').includes('application/xml'));

    const locMatches = text.match(/<loc>/g);
    assert.equal(locMatches?.length, 12, `Expected 12 URLs, got ${locMatches?.length}`);
    assert.ok(text.includes('https://consulting.go2market.qa/'));
    assert.ok(text.includes('https://consulting.go2market.qa/services/b2b-lead-generation'));
  });

  test('GET /sitemap.xml for registration returns 1 URL', async () => {
    const { status, headers, text } = await fetchWithHost('/sitemap.xml', 'registration.go2market.qa');
    assert.equal(status, 200);
    assert.ok(headers.get('content-type').includes('application/xml'));

    const locMatches = text.match(/<loc>/g);
    assert.equal(locMatches?.length, 1, `Expected 1 URL, got ${locMatches?.length}`);
    assert.ok(text.includes('https://registration.go2market.qa/'));
    assert.ok(!text.includes('consulting.go2market.qa'));
  });

  test('GET /robots.txt for consulting references consulting sitemap', async () => {
    const { status, headers, text } = await fetchWithHost('/robots.txt', 'consulting.go2market.qa');
    assert.equal(status, 200);
    assert.ok(headers.get('content-type').includes('text/plain'));
    assert.ok(text.includes('Sitemap: https://consulting.go2market.qa/sitemap.xml'));
  });

  test('GET /robots.txt for registration references registration sitemap', async () => {
    const { status, headers, text } = await fetchWithHost('/robots.txt', 'registration.go2market.qa');
    assert.equal(status, 200);
    assert.ok(headers.get('content-type').includes('text/plain'));
    assert.ok(text.includes('Sitemap: https://registration.go2market.qa/sitemap.xml'));
  });

  test('HEAD /sitemap.xml returns correct headers with empty body', async () => {
    const { status, headers, text } = await fetchWithHost('/sitemap.xml', 'consulting.go2market.qa', 'HEAD');
    assert.equal(status, 200);
    assert.equal(text, '', 'HEAD should return empty body');
    assert.ok(headers.get('content-type').includes('application/xml'));
  });

  test('HEAD /robots.txt returns correct headers with empty body', async () => {
    const { status, headers, text } = await fetchWithHost('/robots.txt', 'consulting.go2market.qa', 'HEAD');
    assert.equal(status, 200);
    assert.equal(text, '', 'HEAD should return empty body');
    assert.ok(headers.get('content-type').includes('text/plain'));
  });

  test('alternating requests do not mix responses', async () => {
    const consulting1 = await fetchWithHost('/sitemap.xml', 'consulting.go2market.qa');
    const registration = await fetchWithHost('/sitemap.xml', 'registration.go2market.qa');
    const consulting2 = await fetchWithHost('/sitemap.xml', 'consulting.go2market.qa');

    // Consulting should have 12 URLs
    const consulting1Locs = consulting1.text.match(/<loc>/g);
    const consulting2Locs = consulting2.text.match(/<loc>/g);
    assert.equal(consulting1Locs?.length, 12);
    assert.equal(consulting2Locs?.length, 12);

    // Registration should have 1 URL
    const registrationLocs = registration.text.match(/<loc>/g);
    assert.equal(registrationLocs?.length, 1);

    // Responses should not be mixed
    assert.ok(consulting1.text.includes('consulting.go2market.qa'));
    assert.ok(consulting2.text.includes('consulting.go2market.qa'));
    assert.ok(registration.text.includes('registration.go2market.qa'));
    assert.ok(!registration.text.includes('consulting.go2market.qa'));
  });

  test('unknown host defaults to consulting (no URL injection)', async () => {
    const { text } = await fetchWithHost('/sitemap.xml', 'evil.example.com');
    // Should default to consulting, not reflect the evil host
    assert.ok(text.includes('consulting.go2market.qa'));
    assert.ok(!text.includes('evil.example.com'));
  });
});

// ============================================================================
// Sitemap ↔ HTML canonical verification tests
// ============================================================================

describe('Sitemap URLs match HTML canonical tags', () => {
  before(async () => {
    // Server should already be running from previous describe block
    if (!serverProcess) {
      serverPort = await findFreePort();
      serverProcess = await startServer(serverPort);
    }
  });

  after(async () => {
    await stopServer(serverProcess);
    serverProcess = null;
  });

  test('all consulting sitemap URLs return HTTP 200 with matching canonical', async () => {
    // Get sitemap from server (not from function - test real server response)
    const sitemapResponse = await fetchWithHost('/sitemap.xml', 'consulting.go2market.qa');
    assert.equal(sitemapResponse.status, 200, 'Sitemap should return 200');

    const sitemapUrls = extractSitemapUrls(sitemapResponse.text);
    assert.equal(sitemapUrls.length, 12, `Expected 12 URLs in sitemap, got ${sitemapUrls.length}`);

    const results = [];

    for (const url of sitemapUrls) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Request page with correct Host header, follow up to 1 redirect
      // (server may add trailing slash for directories)
      const pageResponse = await fetchWithHost(pathname, 'consulting.go2market.qa', 'GET', 1);

      // Check HTTP 200
      const httpOk = pageResponse.status === 200;

      // Extract canonical from actual HTML response (not computed)
      const canonical = extractCanonical(pageResponse.text);

      // Check exactly one canonical
      const hasOneCanonical = typeof canonical === 'string';

      // Check canonical matches sitemap URL exactly
      const canonicalMatches = canonical === url;

      results.push({
        sitemapUrl: url,
        pathname,
        httpStatus: pageResponse.status,
        canonical,
        httpOk,
        hasOneCanonical,
        canonicalMatches,
      });
    }

    // Report all results
    for (const r of results) {
      assert.ok(r.httpOk, `${r.pathname}: expected HTTP 200, got ${r.httpStatus}`);
      assert.ok(
        r.hasOneCanonical,
        `${r.pathname}: expected exactly one canonical, got ${JSON.stringify(r.canonical)}`
      );
      assert.ok(
        r.canonicalMatches,
        `${r.pathname}: canonical mismatch - sitemap: ${r.sitemapUrl}, html: ${r.canonical}`
      );
    }
  });

  test('registration sitemap URL returns HTTP 200 with matching canonical', async () => {
    // Get sitemap from server
    const sitemapResponse = await fetchWithHost('/sitemap.xml', 'registration.go2market.qa');
    assert.equal(sitemapResponse.status, 200, 'Sitemap should return 200');

    const sitemapUrls = extractSitemapUrls(sitemapResponse.text);
    assert.equal(sitemapUrls.length, 1, `Expected 1 URL in registration sitemap, got ${sitemapUrls.length}`);

    const url = sitemapUrls[0];
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Request page with correct Host header, follow up to 1 redirect
    const pageResponse = await fetchWithHost(pathname, 'registration.go2market.qa', 'GET', 1);

    assert.equal(pageResponse.status, 200, `${pathname}: expected HTTP 200`);

    const canonical = extractCanonical(pageResponse.text);
    assert.ok(
      typeof canonical === 'string',
      `${pathname}: expected exactly one canonical, got ${JSON.stringify(canonical)}`
    );
    assert.equal(
      canonical,
      url,
      `${pathname}: canonical mismatch - sitemap: ${url}, html: ${canonical}`
    );
  });

  test('consulting sitemap URLs match SHARED_ROUTES without missing or extra pages', async () => {
    // Get sitemap from server
    const sitemapResponse = await fetchWithHost('/sitemap.xml', 'consulting.go2market.qa');
    const sitemapUrls = extractSitemapUrls(sitemapResponse.text);

    const origin = SITE_CONFIGS.consulting.origin;

    // Expected URLs: homepage + all shared routes
    const expectedUrls = new Set([
      `${origin}/`,
      ...SHARED_ROUTES.map(r => `${origin}${r}`),
    ]);

    const actualUrls = new Set(sitemapUrls);

    // Check no missing URLs
    for (const expected of expectedUrls) {
      assert.ok(actualUrls.has(expected), `Missing URL in sitemap: ${expected}`);
    }

    // Check no extra URLs
    for (const actual of actualUrls) {
      assert.ok(expectedUrls.has(actual), `Extra URL in sitemap: ${actual}`);
    }

    // Check count matches
    assert.equal(
      actualUrls.size,
      expectedUrls.size,
      `URL count mismatch: sitemap has ${actualUrls.size}, expected ${expectedUrls.size}`
    );
  });
});
