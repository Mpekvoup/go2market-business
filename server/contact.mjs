import { telegramErrorCode } from './telegram-error.mjs';
import { isValidContact, normalizeContact } from '../src/contact-validation.mjs';

const MAX_STRING_LENGTH = 200;

/** Remove control characters including \r \n \t and null byte */
function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/** Validate sourcePage is a local pathname (no URL, query, hash, control chars) */
function isValidSourcePage(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  // Must start with /
  if (!trimmed.startsWith('/')) return false;
  // Must not contain protocol, query, hash, or control characters
  if (/[:\?#]/.test(trimmed)) return false;
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;
  // Must not be protocol-relative URL
  if (trimmed.startsWith('//')) return false;
  // Length check
  if (trimmed.length > MAX_STRING_LENGTH) return false;
  return true;
}

/** Validate referrer is a valid hostname */
function isValidReferrer(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_STRING_LENGTH) return false;
  // Must be just a hostname (no protocol, path, query, hash)
  if (/[\/:\?#@]/.test(trimmed)) return false;
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;
  // Basic hostname validation
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(trimmed);
}

/** Validate UTM field (no control chars, reasonable length) */
function isValidUtmField(value, maxLen = MAX_STRING_LENGTH) {
  if (typeof value !== 'string') return false;
  if (value.length > maxLen) return false;
  if (/[\x00-\x1F\x7F]/.test(value)) return false;
  return true;
}

export function createContactHandler({ token, chatId, fetchImpl = fetch, now = Date.now, logError = code => console.error('[contact-delivery]', code) }) {
  token = token?.trim();
  chatId = chatId?.trim();
  const attempts = new Map();
  return async (req, res) => {
    const reply = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return reply(405, { error: 'Method not allowed' });
    }
    if (!token || !chatId) return reply(503, { error: 'Contact service is not configured' });
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      return reply(415, { error: 'Expected application/json' });
    }
    // Use the socket address, not a visitor-controlled X-Forwarded-For header.
    // Shared across requests in this process; a global cap also protects Telegram.
    const time = now();
    for (const [key, entry] of attempts) if (entry.until <= time) attempts.delete(key);
    const ip = req.socket.remoteAddress || 'unknown';
    for (const [key, limit] of [[ip, 10], ['global', 100]]) {
      if ((attempts.get(key)?.count || 0) >= limit) {
        res.setHeader('Retry-After', '60');
        return reply(429, { error: 'Too many requests. Please try again later.' });
      }
    }
    for (const key of [ip, 'global']) {
      const entry = attempts.get(key) || { count: 0, until: time + 60_000 };
      entry.count++;
      attempts.set(key, entry);
    }
    let data;
    try {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 16_384) { reply(413, { error: 'Request too large' }); return; }
        chunks.push(Buffer.from(chunk));
      }
      data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return reply(400, { error: 'Invalid JSON' }); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, { error: 'Invalid request' });
    const limits = { name: 120, contact: 254, region: 80, message: 2500 };
    const fields = {};
    for (const [key, max] of Object.entries(limits)) {
      if (typeof data[key] !== 'string' || !data[key].trim() || data[key].trim().length > max) {
        return reply(400, { error: `Invalid ${key}` });
      }
      fields[key] = data[key].trim();
    }
    fields.contact = normalizeContact(fields.contact);
    if (!isValidContact(fields.contact)) {
      return reply(400, { error: 'Enter a valid phone number or email' });
    }
    const sites = {
      'consulting.go2market.qa': 'Business Consultation',
      'registration.go2market.qa': 'Company Registration',
    };
    if (!Object.hasOwn(sites, data.source)) return reply(400, { error: 'Invalid source' });

    // Validate optional context (silently ignore invalid fields, don't reject valid enquiry)
    const VALID_LANGUAGES = ['en', 'ru'];
    let context = null;

    if (data.context !== undefined && typeof data.context === 'object' && data.context !== null && !Array.isArray(data.context)) {
      const ctx = data.context;
      context = {};

      // sourcePage - must be valid pathname
      if (isValidSourcePage(ctx.sourcePage)) {
        context.sourcePage = sanitizeString(ctx.sourcePage).slice(0, MAX_STRING_LENGTH);
      }

      // language - must be en or ru
      if (VALID_LANGUAGES.includes(ctx.language)) {
        context.language = ctx.language;
      }

      // referrer - must be valid hostname
      if (ctx.referrer !== undefined && isValidReferrer(ctx.referrer)) {
        context.referrer = sanitizeString(ctx.referrer);
      }

      // UTM fields - validate each
      const utmFields = ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent'];
      for (const field of utmFields) {
        if (ctx[field] !== undefined && isValidUtmField(ctx[field], MAX_STRING_LENGTH)) {
          const sanitized = sanitizeString(ctx[field]);
          if (sanitized) context[field] = sanitized;
        }
      }
    }

    // Build Telegram message
    const lines = [
      'New enquiry — go2market.qa',
      `Source: ${data.source}`,
      `Service: ${sites[data.source]}`,
      `Name: ${fields.name}`,
      `Contact: ${fields.contact}`,
      `Region: ${fields.region}`,
    ];

    // Add context fields if present
    if (context) {
      if (context.sourcePage) lines.push(`Page: ${context.sourcePage}`);
      if (context.language) lines.push(`Language: ${context.language}`);
      if (context.referrer) lines.push(`Referrer: ${context.referrer}`);

      const utmParts = [];
      if (context.utmSource) utmParts.push(`src=${context.utmSource}`);
      if (context.utmMedium) utmParts.push(`med=${context.utmMedium}`);
      if (context.utmCampaign) utmParts.push(`cmp=${context.utmCampaign}`);
      if (context.utmTerm) utmParts.push(`trm=${context.utmTerm}`);
      if (context.utmContent) utmParts.push(`cnt=${context.utmContent}`);
      if (utmParts.length) lines.push(`UTM: ${utmParts.join(' | ')}`);
    }

    lines.push('', fields.message);
    const text = lines.join('\n');
    const safeLog = code => { try { Promise.resolve(logError(code)).catch(() => {}); } catch { /* isolate logging failures */ } };
    const timeoutSignal = AbortSignal.timeout(10_000);
    const classifyError = error => {
      // TimeoutError is definitive timeout
      if (error?.name === 'TimeoutError') return 'TG_TIMEOUT';
      // AbortError: only TG_TIMEOUT if signal aborted due to timeout (reason is TimeoutError)
      if (
        error?.name === 'AbortError' &&
        timeoutSignal.aborted &&
        timeoutSignal.reason?.name === 'TimeoutError'
      ) {
        return 'TG_TIMEOUT';
      }
      return 'TG_NETWORK_OR_RESPONSE';
    };
    try {
      const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: timeoutSignal,
      });
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        // Distinguish JSON syntax error from timeout/network during body read
        if (jsonError instanceof SyntaxError) {
          result = null; // Invalid JSON treated as rejection
        } else {
          // Timeout or network error during body read
          const code = classifyError(jsonError);
          safeLog(code);
          return reply(502, { error: 'Could not deliver your enquiry. Please try again later.', code });
        }
      }
      if (!response.ok || result?.ok !== true) {
        const code = telegramErrorCode(response.status, result);
        safeLog(code);
        return reply(502, { error: 'Could not deliver your enquiry. Please try again later.', code });
      }
      return reply(200, { ok: true });
    } catch (error) {
      const code = classifyError(error);
      safeLog(code);
      // Never expose upstream URLs, tokens, messages or Telegram responses.
      return reply(502, { error: 'Could not deliver your enquiry. Please try again later.', code });
    }
  };
}
