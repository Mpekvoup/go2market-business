import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { contactApiPlugin } from './vite-contact.mjs';

const source = await readFile(new URL('../src/contact-client.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { postContact } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for (const [label, status, body, expected] of [
  ['empty proxy error', 500, '', /HTTP 500/],
  ['HTML response', 200, '<html>fallback</html>', /HTTP 200/],
  ['missing config', 503, '{"error":"Contact service is not configured"}', /temporarily unavailable/],
  ['invalid contact', 400, '{"error":"Invalid contact"}', /valid phone/],
  ['null JSON', 200, 'null', /HTTP 200/],
]) {
  test(label, async t => {
    t.mock.method(globalThis, 'fetch', async () => new Response(body, { status }));
    await assert.rejects(postContact({}, 'en'), expected);
  });
}
test('accepts explicit server success', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('{"ok":true}'));
  assert.deepEqual(await postContact({}, 'en'), { ok: true });
});
test('Vite mounts the API without a standalone server', async () => {
  let middleware;
  contactApiPlugin({}).configureServer({ middlewares: { use(handler) { middleware = handler; } } });
  const response = { writeHead(status, headers) { this.status = status; this.headers = headers; }, end(body) { this.body = body; } };
  middleware({ url: '/api/contact', method: 'POST' }, response, () => assert.fail('API fell through to HTML'));
  assert.equal(response.status, 503);
  assert.match(response.headers['Content-Type'], /json/);
  assert.equal(JSON.parse(response.body).error, 'Contact service is not configured');
});
