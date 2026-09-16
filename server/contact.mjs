export function createContactHandler({ token, chatId, fetchImpl = fetch, now = Date.now }) {
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
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phone = /^\+?[\d\s().-]+$/;
    const digits = fields.contact.replace(/\D/g, '');
    if (!email.test(fields.contact) && !(phone.test(fields.contact) && digits.length >= 7 && digits.length <= 15)) {
      return reply(400, { error: 'Enter a valid phone number or email' });
    }
    const sites = {
      'consulting.go2market.qa': 'Business Consultation',
      'registration.go2market.qa': 'Company Registration',
    };
    if (!Object.hasOwn(sites, data.source)) return reply(400, { error: 'Invalid source' });
    const text = ['New enquiry — go2market.qa', `Source: ${data.source}`, `Service: ${sites[data.source]}`, `Name: ${fields.name}`, `Contact: ${fields.contact}`, `Region: ${fields.region}`, '', fields.message].join('\n');
    try {
      const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: AbortSignal.timeout(10_000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Delivery failed');
      return reply(200, { ok: true });
    } catch {
      // Never expose upstream URLs, tokens, messages or Telegram responses.
      return reply(502, { error: 'Could not deliver your enquiry. Please try again later.' });
    }
  };
}
