import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Transpile TypeScript module once for all tests
const source = await readFile(new URL('./lead-context.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext }
}).outputText;
const { collectLeadContext, initAttribution } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

// Helper to setup browser globals for a test
function setupBrowserGlobals(options = {}) {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalSessionStorage = globalThis.sessionStorage;

  const storage = options.storage || {};

  globalThis.window = {
    location: {
      hostname: options.hostname || 'consulting.go2market.qa',
      pathname: options.pathname || '/',
      search: options.search || '',
    },
  };

  globalThis.document = {
    referrer: options.referrer || '',
  };

  globalThis.sessionStorage = {
    _data: storage,
    getItem(key) {
      if (options.storageThrows) throw new Error('SecurityError');
      return this._data[key] ?? null;
    },
    setItem(key, value) {
      if (options.storageThrows) throw new Error('SecurityError');
      this._data[key] = value;
    },
  };

  return () => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.sessionStorage = originalSessionStorage;
  };
}

// --- SSR safety tests ---

test('collectLeadContext returns defaults without browser APIs', async () => {
  const context = collectLeadContext('en');
  assert.equal(context.sourcePage, '/');
  assert.equal(context.language, 'en');
  assert.equal(context.referrer, undefined);
  assert.equal(context.utmSource, undefined);
  assert.equal(context.utmMedium, undefined);
  assert.equal(context.utmCampaign, undefined);
  assert.equal(context.utmTerm, undefined);
  assert.equal(context.utmContent, undefined);
});

test('collectLeadContext respects language parameter', async () => {
  assert.equal(collectLeadContext('en').language, 'en');
  assert.equal(collectLeadContext('ru').language, 'ru');
});

test('collectLeadContext does not throw without browser APIs', async () => {
  assert.doesNotThrow(() => collectLeadContext('en'));
  assert.doesNotThrow(() => collectLeadContext('ru'));
});

// --- Browser behavior tests ---

test('collects all five UTM parameters from URL', async (t) => {
  const restore = setupBrowserGlobals({
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=spring2024&utm_term=qatar-business&utm_content=banner1',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.utmSource, 'google');
  assert.equal(context.utmMedium, 'cpc');
  assert.equal(context.utmCampaign, 'spring2024');
  assert.equal(context.utmTerm, 'qatar-business');
  assert.equal(context.utmContent, 'banner1');
});

test('collects current pathname', async (t) => {
  const restore = setupBrowserGlobals({
    pathname: '/services/consulting',
  });
  t.after(restore);

  const context = collectLeadContext('ru');
  assert.equal(context.sourcePage, '/services/consulting');
  assert.equal(context.language, 'ru');
});

test('extracts external referrer as hostname only', async (t) => {
  const restore = setupBrowserGlobals({
    referrer: 'https://google.com/search?q=qatar+consulting',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.referrer, 'google.com');
});

test('excludes same-origin referrer', async (t) => {
  const restore = setupBrowserGlobals({
    hostname: 'consulting.go2market.qa',
    referrer: 'https://consulting.go2market.qa/other-page',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.referrer, undefined);
});

test('excludes go2market.qa subdomains from referrer', async (t) => {
  const restore = setupBrowserGlobals({
    hostname: 'consulting.go2market.qa',
    referrer: 'https://registration.go2market.qa/',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.referrer, undefined);
});

test('excludes main go2market.qa from referrer', async (t) => {
  const restore = setupBrowserGlobals({
    hostname: 'consulting.go2market.qa',
    referrer: 'https://go2market.qa/',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.referrer, undefined);
});

test('writes UTM to sessionStorage', async (t) => {
  const storage = {};
  const restore = setupBrowserGlobals({
    search: '?utm_source=facebook&utm_medium=social',
    storage,
  });
  t.after(restore);

  collectLeadContext('en');

  assert.ok(storage['g2m_utm']);
  const stored = JSON.parse(storage['g2m_utm']);
  assert.equal(stored.utmSource, 'facebook');
  assert.equal(stored.utmMedium, 'social');
});

test('reads UTM from sessionStorage when not in URL', async (t) => {
  const storage = {
    'g2m_utm': JSON.stringify({
      utmSource: 'stored-source',
      utmMedium: 'stored-medium',
      utmCampaign: 'stored-campaign',
    }),
  };
  const restore = setupBrowserGlobals({
    search: '', // No UTM in URL
    storage,
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.utmSource, 'stored-source');
  assert.equal(context.utmMedium, 'stored-medium');
  assert.equal(context.utmCampaign, 'stored-campaign');
});

test('handles unavailable sessionStorage gracefully', async (t) => {
  const restore = setupBrowserGlobals({
    search: '?utm_source=test',
    storageThrows: true,
  });
  t.after(restore);

  // Should not throw
  assert.doesNotThrow(() => collectLeadContext('en'));
  const context = collectLeadContext('en');
  // UTM from URL should still work
  assert.equal(context.utmSource, 'test');
});

test('handles corrupted JSON in sessionStorage', async (t) => {
  const storage = {
    'g2m_utm': 'not valid json {{{',
  };
  const restore = setupBrowserGlobals({
    search: '', // No UTM in URL
    storage,
  });
  t.after(restore);

  // Should not throw
  assert.doesNotThrow(() => collectLeadContext('en'));
  const context = collectLeadContext('en');
  // No UTM should be present
  assert.equal(context.utmSource, undefined);
});

test('new URL UTM takes priority over stored UTM', async (t) => {
  const storage = {
    'g2m_utm': JSON.stringify({
      utmSource: 'old-source',
      utmMedium: 'old-medium',
      utmCampaign: 'old-campaign',
    }),
  };
  const restore = setupBrowserGlobals({
    search: '?utm_source=new-source&utm_medium=new-medium',
    storage,
  });
  t.after(restore);

  const context = collectLeadContext('en');
  // New URL params should replace stored
  assert.equal(context.utmSource, 'new-source');
  assert.equal(context.utmMedium, 'new-medium');
  // Old campaign should NOT be present (new campaign replaces entire stored object)
  assert.equal(context.utmCampaign, undefined);

  // Verify storage was updated
  const stored = JSON.parse(storage['g2m_utm']);
  assert.equal(stored.utmSource, 'new-source');
  assert.equal(stored.utmMedium, 'new-medium');
  assert.equal(stored.utmCampaign, undefined);
});

test('partial new UTM does not mix with old campaign fields', async (t) => {
  const storage = {
    'g2m_utm': JSON.stringify({
      utmSource: 'old-source',
      utmMedium: 'old-medium',
      utmCampaign: 'old-campaign',
      utmTerm: 'old-term',
      utmContent: 'old-content',
    }),
  };
  const restore = setupBrowserGlobals({
    search: '?utm_source=new-source', // Only one new param
    storage,
  });
  t.after(restore);

  const context = collectLeadContext('en');
  // New param present
  assert.equal(context.utmSource, 'new-source');
  // Old params should NOT be mixed in
  assert.equal(context.utmMedium, undefined);
  assert.equal(context.utmCampaign, undefined);
  assert.equal(context.utmTerm, undefined);
  assert.equal(context.utmContent, undefined);
});

test('sanitizes control characters from pathname', async (t) => {
  const restore = setupBrowserGlobals({
    pathname: '/path\nwith\tnewlines',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.sourcePage, '/pathwithnewlines');
});

test('sanitizes control characters from UTM', async (t) => {
  const restore = setupBrowserGlobals({
    search: '?utm_source=value\rwith\tcontrol',
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.utmSource, 'valuewithcontrol');
});

// --- Attribution persistence across navigation ---

test('UTM persists after navigation to page without UTM params', async (t) => {
  // Simulate: user lands with UTM, then navigates to another page
  const storage = {};

  // Step 1: Land on homepage with UTM
  let restore = setupBrowserGlobals({
    pathname: '/',
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=spring2024',
    storage,
  });
  collectLeadContext('en'); // This saves UTM to storage
  restore();

  // Step 2: Navigate to another page without UTM (simulated by new URL without params)
  restore = setupBrowserGlobals({
    pathname: '/services/consulting',
    search: '', // No UTM in URL after navigation
    storage, // Same storage session
  });
  t.after(restore);

  const context = collectLeadContext('en');

  // Original UTM should be preserved from storage
  assert.equal(context.utmSource, 'google');
  assert.equal(context.utmMedium, 'cpc');
  assert.equal(context.utmCampaign, 'spring2024');
  assert.equal(context.sourcePage, '/services/consulting');
});

test('clean session without UTM produces no UTM in context', async (t) => {
  const storage = {}; // Empty storage
  const restore = setupBrowserGlobals({
    search: '', // No UTM in URL
    storage,
  });
  t.after(restore);

  const context = collectLeadContext('en');
  assert.equal(context.utmSource, undefined);
  assert.equal(context.utmMedium, undefined);
  assert.equal(context.utmCampaign, undefined);
});

// --- initAttribution tests ---

test('initAttribution saves UTM to sessionStorage', async (t) => {
  const storage = {};
  const restore = setupBrowserGlobals({
    search: '?utm_source=facebook&utm_medium=social',
    storage,
  });
  t.after(restore);

  initAttribution();

  assert.ok(storage['g2m_utm']);
  const stored = JSON.parse(storage['g2m_utm']);
  assert.equal(stored.utmSource, 'facebook');
  assert.equal(stored.utmMedium, 'social');
});

test('initAttribution does not throw without browser APIs', async () => {
  assert.doesNotThrow(() => initAttribution());
});

test('initAttribution on landing preserves UTM for later navigation', async (t) => {
  // Scenario: initAttribution called on page load, then user navigates away
  const storage = {};

  // Step 1: Land with UTM, call initAttribution (simulates component mount)
  let restore = setupBrowserGlobals({
    pathname: '/',
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=spring2024',
    storage,
  });
  initAttribution(); // Called on component mount
  restore();

  // Verify UTM saved immediately
  assert.ok(storage['g2m_utm'], 'UTM should be saved after initAttribution');
  const storedAfterInit = JSON.parse(storage['g2m_utm']);
  assert.equal(storedAfterInit.utmSource, 'google');

  // Step 2: Navigate to another page (URL no longer has UTM)
  restore = setupBrowserGlobals({
    pathname: '/services/consulting',
    search: '', // No UTM params after navigation
    storage, // Same storage
  });
  t.after(restore);

  // Step 3: Collect context at form submission time
  const context = collectLeadContext('en');

  // UTM should be preserved from storage (saved during initAttribution)
  assert.equal(context.utmSource, 'google');
  assert.equal(context.utmMedium, 'cpc');
  assert.equal(context.utmCampaign, 'spring2024');
  assert.equal(context.sourcePage, '/services/consulting');
});
