# Contact API for consulting and registration

The existing Express server (`npm start`) handles `POST /api/contact` before
static files and the site-specific HTML routing. Both sites use this endpoint.
The request contains the site domain; the server accepts only
`consulting.go2market.qa` and `registration.go2market.qa` and derives the service
label from this allowlist. Source is a routing label, not authentication.

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in this project's Railway service
Variables, then deploy. Never prefix these with `VITE_` or commit actual values.
Railway's supplied `PORT` is respected. Local API defaults to port 3002.

For development with Node 22+, put the variables in ignored `.env.local`, run
`npm run dev:api`, and run `npm run dev` in another terminal. Vite proxies `/api`
to port 3002. Use `?site=registration` to select the registration site locally.

`npm run test:contact` runs HTTP tests with mocked Telegram delivery, without
sending messages. `npm run build` creates both site variants. After deployment,
GET `/api/contact` must return JSON with HTTP 405, not a page of HTML. Verify
delivery from both sites using authorized test enquiries and the target chat.

The API validates name, phone/email, region, message length and source, limits
request bodies to 16 KiB, and sends plain text to Telegram. It returns only a
success flag or a generic error, never credentials or Telegram message data.

Rate limiting is per process: 10 attempts/minute per socket address and 100
globally. Proxy clients may share a socket address and therefore a limit;
forwarded IP headers are not trusted. Limits reset on restart. Use shared
storage and a verified proxy policy if scaling to multiple replicas.

Missing credentials return HTTP 503; delivery failures return 502. No production
message is sent by the automated tests.
