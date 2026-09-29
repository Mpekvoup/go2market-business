import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createContactHandler } from './contact.mjs';

const valid = { name: 'Тест <b>name</b>', contact: 'test@example.com', region: 'qatar', message: 'Проверка <tag> & text', source: 'consulting.go2market.qa' };
async function fixture(t, overrides = {}) {
  const sent = [];
  const handler = createContactHandler({ token: 'test-secret', chatId: 'test-chat', fetchImpl: async (url, options) => {
    sent.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ ok: true, result: { private: 'never returned' } }) };
  }, ...overrides });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  return { sent, request: (data = valid, options = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), ...options }) };
}
test('delivers Unicode as plain text and returns only success', async t => {
  const f = await fixture(t);
  const r = await f.request();
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  assert.match(f.sent[0].body.text, /Проверка <tag> & text/);
  assert.equal(f.sent[0].body.parse_mode, undefined);
  assert.match(f.sent[0].body.text, /Service: Business Consultation/);
});
test('preserves registration source and derives the service server-side', async t => {
  const f = await fixture(t);
  assert.equal((await f.request({ ...valid, source: 'registration.go2market.qa', service: 'untrusted' })).status, 200);
  assert.match(f.sent[0].body.text, /Source: registration.go2market.qa/);
  assert.match(f.sent[0].body.text, /Service: Company Registration/);
  assert.doesNotMatch(f.sent[0].body.text, /untrusted/);
  assert.equal((await f.request({ ...valid, source: 'unknown.example' })).status, 400);
});
test('rejects malformed contacts, whitespace, long fields and invalid JSON', async t => {
  const f = await fixture(t);
  for (const data of [{ ...valid, contact: 'abc' }, { ...valid, name: '  ' }, { ...valid, message: 'x'.repeat(2501) }, null]) {
    assert.equal((await f.request(data)).status, 400);
  }
  assert.equal((await f.request(valid, { body: '{' })).status, 400);
  assert.equal((await f.request(valid, { body: 'x'.repeat(17000) })).status, 413);
  assert.equal(f.sent.length, 0);
});
test('rejects missing configuration and unsupported methods', async t => {
  const f = await fixture(t, { token: '' });
  assert.equal((await f.request()).status, 503);
  assert.equal((await f.request(valid, { method: 'GET', body: undefined })).status, 405);
});
test('hides upstream failures and secrets', async t => {
  const f = await fixture(t, { fetchImpl: async () => { throw new Error('test-secret'); } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.doesNotMatch(await r.text(), /test-secret/);
});
test('rejects Telegram ok:false even with HTTP 200', async t => {
  const f = await fixture(t, { fetchImpl: async () => ({ ok: true, json: async () => ({ ok: false }) }) });
  assert.equal((await f.request()).status, 502);
});
test('rate limits requests without trusting forwarded headers', async t => {
  const f = await fixture(t);
  for (let i = 0; i < 10; i++) assert.equal((await f.request()).status, 200);
  assert.equal((await f.request(valid, { headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': 'different' } })).status, 429);
  assert.equal(f.sent.length, 10);
});

test('accepts formatted and pasted phones without accepting arbitrary text', async t => {
  const f = await fixture(t);
  for (const contact of ['+7 (777) 123-45-67', '+7 (777) 123–45–67', '\u200e+974 1234 5678\u200f', '+٩٧٤ ١٢٣٤ ٥٦٧٨', ' name@example.com ']) {
    assert.equal((await f.request({ ...valid, contact })).status, 200, contact);
  }
  for (const contact of ['abc', '123', '@username']) assert.equal((await f.request({ ...valid, contact })).status, 400);
});

test('reports safe authentication failure without exposing upstream details', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ ok: false, error_code: 401, description: 'private upstream details test-secret' }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  const body = await r.json();
  assert.equal(body.code, 'TG_AUTH');
  assert.deepEqual(logs, ['TG_AUTH']);
  assert.doesNotMatch(JSON.stringify(body), /test-secret|private upstream/);
});

// --- Telegram error classification tests ---

test('TG_ACCESS on HTTP 403', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ ok: false, error_code: 403 }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_ACCESS');
  assert.deepEqual(logs, ['TG_ACCESS']);
});

test('TG_RATE_LIMIT on HTTP 429', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 429, json: async () => ({ ok: false, error_code: 429 }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_RATE_LIMIT');
  assert.deepEqual(logs, ['TG_RATE_LIMIT']);
});

test('TG_CHAT_NOT_FOUND on 400 with chat not found', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ ok: false, error_code: 400, description: 'Bad Request: chat not found' }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_CHAT_NOT_FOUND');
});

test('TG_CHAT_MIGRATED when migrate_to_chat_id present', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ ok: false, parameters: { migrate_to_chat_id: -100123 } }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_CHAT_MIGRATED');
});

test('TG_TOKEN_FORMAT on HTTP 404', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({ ok: false, error_code: 404, description: 'Not Found' }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_TOKEN_FORMAT');
});

test('TG_REJECTED as fallback for unknown Telegram error', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ ok: false, error_code: 400, description: 'some unknown error' }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_REJECTED');
});

test('TG_REJECTED on HTTP 500/502 from Telegram', async t => {
  for (const status of [500, 502]) {
    const logs = [];
    const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status, json: async () => ({ ok: false }) }) });
    const r = await f.request();
    assert.equal(r.status, 502);
    assert.equal((await r.json()).code, 'TG_REJECTED');
  }
});

test('HTTP error with ok:true in body is not treated as success', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({ ok: true }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.notDeepEqual(await r.json(), { ok: true });
});

test('handles invalid JSON response from Telegram', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('invalid'); } }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_REJECTED');
});

test('handles empty response body from Telegram', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => null }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_REJECTED');
});

test('handles unexpected JSON structure', async t => {
  const logs = [];
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => [1, 2, 3] }) });
  const r = await f.request();
  assert.equal(r.status, 502);
});

// --- Timeout and network error tests ---

test('TG_TIMEOUT on TimeoutError', async t => {
  const logs = [];
  const timeoutError = new Error('timeout'); timeoutError.name = 'TimeoutError';
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => { throw timeoutError; } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_TIMEOUT');
  assert.deepEqual(logs, ['TG_TIMEOUT']);
});

test('TG_NETWORK_OR_RESPONSE on AbortError when signal not aborted', async t => {
  // AbortError without timeout signal firing should be TG_NETWORK_OR_RESPONSE
  const loggedArgs = [];
  const abortError = new Error('aborted'); abortError.name = 'AbortError';
  const f = await fixture(t, { logError: (...args) => loggedArgs.push(args), fetchImpl: async () => { throw abortError; } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
  assert.deepEqual(loggedArgs, [['TG_NETWORK_OR_RESPONSE']]);
});

test('TG_TIMEOUT on AbortError when timeout signal is aborted with TimeoutError reason', async t => {
  const loggedArgs = [];
  const originalTimeout = AbortSignal.timeout;
  // AbortSignal.timeout() aborts with TimeoutError as reason
  const abortedSignal = AbortSignal.abort(new DOMException('Test timeout', 'TimeoutError'));
  t.after(() => { AbortSignal.timeout = originalTimeout; });
  AbortSignal.timeout = () => abortedSignal;
  const abortError = new Error('aborted'); abortError.name = 'AbortError';
  const f = await fixture(t, { logError: (...args) => loggedArgs.push(args), fetchImpl: async () => { throw abortError; } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_TIMEOUT');
  assert.deepEqual(loggedArgs, [['TG_TIMEOUT']]);
});

test('TG_NETWORK_OR_RESPONSE on AbortError when signal aborted with non-timeout reason', async t => {
  const loggedArgs = [];
  const originalTimeout = AbortSignal.timeout;
  // Signal aborted but reason is not TimeoutError (e.g., manual abort)
  const abortedSignal = AbortSignal.abort(new Error('Manual abort'));
  t.after(() => { AbortSignal.timeout = originalTimeout; });
  AbortSignal.timeout = () => abortedSignal;
  const abortError = new Error('aborted'); abortError.name = 'AbortError';
  const f = await fixture(t, { logError: (...args) => loggedArgs.push(args), fetchImpl: async () => { throw abortError; } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
  assert.deepEqual(loggedArgs, [['TG_NETWORK_OR_RESPONSE']]);
});

test('TG_NETWORK_OR_RESPONSE on DNS/network failure', async t => {
  const logs = [];
  const networkError = new Error('getaddrinfo ENOTFOUND'); networkError.code = 'ENOTFOUND';
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => { throw networkError; } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
  assert.deepEqual(logs, ['TG_NETWORK_OR_RESPONSE']);
});

// --- logError isolation tests ---

test('logError throwing synchronously does not break response', async t => {
  const f = await fixture(t, { logError: () => { throw new Error('logger crashed'); }, fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ ok: false, error_code: 401 }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_AUTH');
});

test('logError returning rejected Promise does not break response', async t => {
  const f = await fixture(t, { logError: async () => { throw new Error('async logger crashed'); }, fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ ok: false, error_code: 403 }) }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_ACCESS');
});

test('logError failure in catch block does not break response', async t => {
  const f = await fixture(t, { logError: () => { throw new Error('logger crashed in catch'); }, fetchImpl: async () => { throw new Error('network'); } });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
});

// --- No data leakage tests ---

test('no token/chatId/message leakage in response or logs', async t => {
  const FAKE_TOKEN = 'FAKE_TOKEN_DO_NOT_USE';
  const FAKE_CHAT = 'FAKE_CHAT_ID';
  const loggedArgs = [];
  const handler = createContactHandler({
    token: FAKE_TOKEN,
    chatId: FAKE_CHAT,
    fetchImpl: async (url) => {
      // Verify URL contains token but we don't expose it
      assert.match(url, /FAKE_TOKEN_DO_NOT_USE/);
      return { ok: false, status: 401, json: async () => ({ ok: false, error_code: 401, description: `PRIVATE_UPSTREAM_MARKER ${FAKE_TOKEN}` }) };
    },
    logError: (...args) => loggedArgs.push(args),
  });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const testData = { ...valid, name: 'FAKE_CONTACT_MARKER', message: 'FAKE_MESSAGE_MARKER' };
  const r = await fetch(`http://127.0.0.1:${server.address().port}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testData) });
  const body = await r.text();
  // Response must not contain sensitive markers
  assert.doesNotMatch(body, /FAKE_TOKEN_DO_NOT_USE/);
  assert.doesNotMatch(body, /FAKE_CHAT_ID/);
  assert.doesNotMatch(body, /PRIVATE_UPSTREAM_MARKER/);
  assert.doesNotMatch(body, /FAKE_CONTACT_MARKER/);
  assert.doesNotMatch(body, /FAKE_MESSAGE_MARKER/);
  // loggedArgs must be exactly [['TG_AUTH']] - no additional arguments
  assert.deepEqual(loggedArgs, [['TG_AUTH']]);
});

// --- Trim credentials test ---

test('trims whitespace from token and chatId', async t => {
  const urls = [];
  const bodies = [];
  const handler = createContactHandler({
    token: '  trimmed-token  ',
    chatId: '  trimmed-chat  ',
    fetchImpl: async (url, opts) => {
      urls.push(url);
      bodies.push(JSON.parse(opts.body));
      return { ok: true, json: async () => ({ ok: true }) };
    },
  });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const r = await fetch(`http://127.0.0.1:${server.address().port}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal(r.status, 200);
  assert.match(urls[0], /bottrimmed-token\//);
  assert.doesNotMatch(urls[0], /%20|  /);
  assert.equal(bodies[0].chat_id, 'trimmed-chat');
});

// --- Response body reading error tests ---

test('TG_TIMEOUT when response.json() throws TimeoutError', async t => {
  const logs = [];
  const timeoutError = new Error('body read timeout'); timeoutError.name = 'TimeoutError';
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => { throw timeoutError; } }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_TIMEOUT');
  assert.deepEqual(logs, ['TG_TIMEOUT']);
});

test('TG_NETWORK_OR_RESPONSE when response.json() throws AbortError without signal aborted', async t => {
  const loggedArgs = [];
  const abortError = new Error('body read aborted'); abortError.name = 'AbortError';
  const f = await fixture(t, { logError: (...args) => loggedArgs.push(args), fetchImpl: async () => ({ ok: true, json: async () => { throw abortError; } }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
  assert.deepEqual(loggedArgs, [['TG_NETWORK_OR_RESPONSE']]);
});

test('TG_TIMEOUT when response.json() throws AbortError with signal aborted and TimeoutError reason', async t => {
  const loggedArgs = [];
  const originalTimeout = AbortSignal.timeout;
  const abortedSignal = AbortSignal.abort(new DOMException('Test timeout', 'TimeoutError'));
  t.after(() => { AbortSignal.timeout = originalTimeout; });
  AbortSignal.timeout = () => abortedSignal;
  const abortError = new Error('body read aborted'); abortError.name = 'AbortError';
  const f = await fixture(t, { logError: (...args) => loggedArgs.push(args), fetchImpl: async () => ({ ok: true, json: async () => { throw abortError; } }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_TIMEOUT');
  assert.deepEqual(loggedArgs, [['TG_TIMEOUT']]);
});

test('TG_NETWORK_OR_RESPONSE when response.json() throws AbortError with signal aborted but non-timeout reason', async t => {
  const loggedArgs = [];
  const originalTimeout = AbortSignal.timeout;
  const abortedSignal = AbortSignal.abort(new Error('Manual abort'));
  t.after(() => { AbortSignal.timeout = originalTimeout; });
  AbortSignal.timeout = () => abortedSignal;
  const abortError = new Error('body read aborted'); abortError.name = 'AbortError';
  const f = await fixture(t, { logError: (...args) => loggedArgs.push(args), fetchImpl: async () => ({ ok: true, json: async () => { throw abortError; } }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
  assert.deepEqual(loggedArgs, [['TG_NETWORK_OR_RESPONSE']]);
});

test('TG_NETWORK_OR_RESPONSE when response.json() throws network error', async t => {
  const logs = [];
  const networkError = new Error('connection reset'); networkError.code = 'ECONNRESET';
  const f = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => { throw networkError; } }) });
  const r = await f.request();
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'TG_NETWORK_OR_RESPONSE');
  assert.deepEqual(logs, ['TG_NETWORK_OR_RESPONSE']);
});

test('distinguishes truly empty body from JSON null', async t => {
  const logs = [];
  // Empty string throws SyntaxError from JSON.parse
  const f1 = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('Unexpected end of JSON input'); } }) });
  const r1 = await f1.request();
  assert.equal(r1.status, 502);
  assert.equal((await r1.json()).code, 'TG_REJECTED');

  // JSON null is valid JSON but not ok:true
  const f2 = await fixture(t, { logError: code => logs.push(code), fetchImpl: async () => ({ ok: true, json: async () => null }) });
  const r2 = await f2.request();
  assert.equal(r2.status, 502);
  assert.equal((await r2.json()).code, 'TG_REJECTED');
});

// --- Direct classifier tests ---

import { telegramErrorCode } from './telegram-error.mjs';

test('telegramErrorCode handles null and undefined result', async t => {
  assert.equal(telegramErrorCode(401, null), 'TG_AUTH');
  assert.equal(telegramErrorCode(401, undefined), 'TG_AUTH');
  assert.equal(telegramErrorCode(500, null), 'TG_REJECTED');
  assert.equal(telegramErrorCode(200, null), 'TG_REJECTED');
});

test('telegramErrorCode handles primitives as result', async t => {
  assert.equal(telegramErrorCode(401, 'string'), 'TG_AUTH');
  assert.equal(telegramErrorCode(403, 123), 'TG_ACCESS');
  assert.equal(telegramErrorCode(429, true), 'TG_RATE_LIMIT');
  assert.equal(telegramErrorCode(404, false), 'TG_TOKEN_FORMAT');
});

test('telegramErrorCode handles arrays as result', async t => {
  assert.equal(telegramErrorCode(401, [1, 2, 3]), 'TG_AUTH');
  assert.equal(telegramErrorCode(200, []), 'TG_REJECTED');
});

test('telegramErrorCode handles description of wrong type', async t => {
  assert.equal(telegramErrorCode(400, { ok: false, description: 123 }), 'TG_REJECTED');
  assert.equal(telegramErrorCode(400, { ok: false, description: null }), 'TG_REJECTED');
  assert.equal(telegramErrorCode(400, { ok: false, description: ['chat not found'] }), 'TG_REJECTED');
});

test('telegramErrorCode handles parameters of wrong type', async t => {
  assert.equal(telegramErrorCode(400, { ok: false, parameters: 'string' }), 'TG_REJECTED');
  assert.equal(telegramErrorCode(400, { ok: false, parameters: null }), 'TG_REJECTED');
  assert.equal(telegramErrorCode(400, { ok: false, parameters: [{ migrate_to_chat_id: -100 }] }), 'TG_REJECTED');
});

test('telegramErrorCode priority: error_code overrides HTTP status', async t => {
  // Telegram error_code takes precedence over HTTP status when present and truthy
  assert.equal(telegramErrorCode(200, { ok: false, error_code: 401 }), 'TG_AUTH');
  assert.equal(telegramErrorCode(200, { ok: false, error_code: 403 }), 'TG_ACCESS');
  assert.equal(telegramErrorCode(200, { ok: false, error_code: 429 }), 'TG_RATE_LIMIT');
  // When error_code is missing, HTTP status is used
  assert.equal(telegramErrorCode(401, { ok: false }), 'TG_AUTH');
});

test('telegramErrorCode: conflicting HTTP status and error_code', async t => {
  // error_code takes precedence: HTTP 401 + error_code 429 → TG_RATE_LIMIT
  assert.equal(telegramErrorCode(401, { ok: false, error_code: 429 }), 'TG_RATE_LIMIT');
  // error_code takes precedence: HTTP 429 + error_code 401 → TG_AUTH
  assert.equal(telegramErrorCode(429, { ok: false, error_code: 401 }), 'TG_AUTH');
  // HTTP 403 + error_code 404 → TG_TOKEN_FORMAT (error_code wins)
  assert.equal(telegramErrorCode(403, { ok: false, error_code: 404 }), 'TG_TOKEN_FORMAT');
  // HTTP 404 + error_code 403 → TG_ACCESS (error_code wins)
  assert.equal(telegramErrorCode(404, { ok: false, error_code: 403 }), 'TG_ACCESS');
});

test('telegramErrorCode: HTTP 404 maps to TG_TOKEN_FORMAT (compatibility)', async t => {
  // Note: 404 alone does not definitively prove invalid token format,
  // but this mapping is kept for backward compatibility
  assert.equal(telegramErrorCode(404, { ok: false, error_code: 404 }), 'TG_TOKEN_FORMAT');
  assert.equal(telegramErrorCode(404, null), 'TG_TOKEN_FORMAT');
});

// --- Network error leakage tests ---

test('no leakage when network throws error with sensitive URL', async t => {
  const FAKE_TOKEN = 'FAKE_TOKEN_MARKER';
  const FAKE_CHAT = 'FAKE_CHAT_MARKER';
  const loggedArgs = [];
  const networkError = new Error(`connect ECONNREFUSED https://api.telegram.org/bot${FAKE_TOKEN}/sendMessage`);
  networkError.cause = new Error(`PRIVATE_CAUSE_MARKER ${FAKE_TOKEN}`);
  const handler = createContactHandler({
    token: FAKE_TOKEN,
    chatId: FAKE_CHAT,
    fetchImpl: async () => { throw networkError; },
    logError: (...args) => loggedArgs.push(args),
  });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const testData = { ...valid, name: 'CONTACT_MARKER', message: 'MESSAGE_MARKER' };
  const r = await fetch(`http://127.0.0.1:${server.address().port}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testData) });
  const body = await r.text();
  // Response must not contain any markers
  assert.doesNotMatch(body, /FAKE_TOKEN_MARKER/);
  assert.doesNotMatch(body, /FAKE_CHAT_MARKER/);
  assert.doesNotMatch(body, /PRIVATE_CAUSE_MARKER/);
  assert.doesNotMatch(body, /CONTACT_MARKER/);
  assert.doesNotMatch(body, /MESSAGE_MARKER/);
  assert.doesNotMatch(body, /ECONNREFUSED/);
  assert.doesNotMatch(body, /api\.telegram\.org/);
  // loggedArgs must be exactly [['TG_NETWORK_OR_RESPONSE']] - no additional arguments
  assert.deepEqual(loggedArgs, [['TG_NETWORK_OR_RESPONSE']]);
});
