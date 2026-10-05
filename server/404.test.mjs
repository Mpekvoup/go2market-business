/**
 * Integration tests for HTTP 404 handling (Task 10C.4)
 * Tests that unknown routes return HTTP 404 with proper content.
 * Tests site-specific 404 pages for consulting/registration.
 */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Find available port
function findPort() {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

// Start server and wait for ready
function startServer(port) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['server/index.js'], {
      cwd: root,
      env: { ...process.env, PORT: port },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        proc.kill();
        reject(new Error('Server start timeout'));
      }
    }, 10000);

    proc.stdout.on('data', (data) => {
      if (data.toString().includes('Server running') && !started) {
        started = true;
        clearTimeout(timeout);
        resolve(proc);
      }
    });

    proc.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString());
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

// Make HTTP request
function request(port, pathname, { query = '', method = 'GET', host = '' } = {}) {
  return new Promise((resolve, reject) => {
    const fullPath = query ? `${pathname}?${query}` : pathname;
    const headers = host ? { Host: host } : {};
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: fullPath,
      method,
      headers,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function runTests() {
  const port = await findPort();
  console.log(`Starting server on port ${port}...`);

  const proc = await startServer(port);
  const results = [];

  try {
    // Test 1: Unknown route returns 404 (consulting by default)
    const unknown = await request(port, '/this-route-does-not-exist');
    results.push({
      test: 'Unknown route /this-route-does-not-exist',
      expected: 404,
      actual: unknown.status,
      pass: unknown.status === 404,
    });

    // Test 2: Unknown service returns 404
    const unknownService = await request(port, '/services/fake-service');
    results.push({
      test: 'Unknown service /services/fake-service',
      expected: 404,
      actual: unknownService.status,
      pass: unknownService.status === 404,
    });

    // Test 3: Unknown case study returns 404
    const unknownCase = await request(port, '/case-studies/fake-company');
    results.push({
      test: 'Unknown case study /case-studies/fake-company',
      expected: 404,
      actual: unknownCase.status,
      pass: unknownCase.status === 404,
    });

    // Test 4: Missing static asset returns 404
    const missingAsset = await request(port, '/assets/js/nonexistent.js');
    results.push({
      test: 'Missing asset /assets/js/nonexistent.js',
      expected: 404,
      actual: missingAsset.status,
      pass: missingAsset.status === 404,
    });

    // Test 5: Valid route returns 200
    const validRoute = await request(port, '/');
    results.push({
      test: 'Valid route /',
      expected: 200,
      actual: validRoute.status,
      pass: validRoute.status === 200,
    });

    // Test 6: Valid prerendered route returns 200
    const privacy = await request(port, '/privacy');
    results.push({
      test: 'Valid route /privacy',
      expected: 200,
      actual: privacy.status,
      pass: privacy.status === 200,
    });

    // Test 7: 404 response includes noindex
    results.push({
      test: '404 response includes noindex',
      expected: true,
      actual: unknown.body.includes('noindex'),
      pass: unknown.body.includes('noindex'),
    });

    // Test 8: Consulting 404 via query parameter
    const consulting404Query = await request(port, '/unknown-route', { query: 'site=consulting' });
    results.push({
      test: 'Consulting 404 (query) has correct nav',
      expected: true,
      actual: consulting404Query.body.includes('Book Consultation') || consulting404Query.body.includes('Consulting'),
      pass: consulting404Query.body.includes('Book Consultation') || consulting404Query.body.includes('Consulting'),
    });

    // Test 9: Registration 404 via query parameter
    const registration404Query = await request(port, '/unknown-route', { query: 'site=registration' });
    results.push({
      test: 'Registration 404 (query) has correct nav',
      expected: true,
      actual: registration404Query.body.includes('Start Registration') || registration404Query.body.includes('Registration'),
      pass: registration404Query.body.includes('Start Registration') || registration404Query.body.includes('Registration'),
    });

    // Test 10: Consulting 404 via Host header - status and unique nav link
    const consulting404Host = await request(port, '/unknown-route', { host: 'consulting.go2market.qa' });
    results.push({
      test: 'Consulting 404 (Host header) returns 404',
      expected: 404,
      actual: consulting404Host.status,
      pass: consulting404Host.status === 404,
    });
    // Verify consulting-specific nav link from Footer component
    results.push({
      test: 'Consulting 404 has /#consulting-areas link',
      expected: true,
      actual: consulting404Host.body.includes('href="/#consulting-areas"'),
      pass: consulting404Host.body.includes('href="/#consulting-areas"'),
    });

    // Test 11: Registration 404 via Host header - status and unique nav link
    const registration404Host = await request(port, '/unknown-route', { host: 'registration.go2market.qa' });
    results.push({
      test: 'Registration 404 (Host header) returns 404',
      expected: 404,
      actual: registration404Host.status,
      pass: registration404Host.status === 404,
    });
    // Verify registration-specific nav link from Footer component
    results.push({
      test: 'Registration 404 has /#registration link',
      expected: true,
      actual: registration404Host.body.includes('href="/#registration"'),
      pass: registration404Host.body.includes('href="/#registration"'),
    });

    // Test 12: HEAD request for 404 returns 404 with no body
    const head404 = await request(port, '/unknown-route', { method: 'HEAD' });
    results.push({
      test: 'HEAD /unknown-route returns 404',
      expected: 404,
      actual: head404.status,
      pass: head404.status === 404,
    });

    // Test 13: HEAD request for valid route returns 200
    const headValid = await request(port, '/privacy', { method: 'HEAD' });
    results.push({
      test: 'HEAD /privacy returns 200',
      expected: 200,
      actual: headValid.status,
      pass: headValid.status === 200,
    });

    // Test 14: Trailing slash serves same content as without (no redirect)
    const trailingSlash = await request(port, '/privacy/');
    results.push({
      test: '/privacy/ returns 200',
      expected: 200,
      actual: trailingSlash.status,
      pass: trailingSlash.status === 200,
    });

    // Print results
    console.log('\n=== BUSINESS Server 404 Tests ===\n');
    for (const r of results) {
      const status = r.pass ? '✓' : '✗';
      console.log(`${status} ${r.test}: expected=${r.expected}, actual=${r.actual}`);
    }

    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    console.log(`\n${passed}/${total} tests passed\n`);

    if (passed !== total) {
      process.exitCode = 1;
    }
  } finally {
    proc.kill();
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exitCode = 1;
});
