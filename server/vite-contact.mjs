import { createContactHandler } from './contact.mjs';

// Vite and its preview server own the local API; no separate process is needed.
export function contactApiPlugin(env) {
  const configure = (server) => {
    const contact = createContactHandler({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID });
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/contact') return next();
      contact(req, res).catch(() => {
        if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: 'Contact service unavailable' }));
      });
    });
  };
  return { name: 'contact-api', configureServer: configure, configurePreviewServer: configure };
}
