# Production integration sources

- Meta Conversions API overview: https://developers.facebook.com/documentation/ads-commerce/conversions-api
- Meta Conversions API usage: https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api
  - Direct website events use `POST https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}/events?access_token={TOKEN}`.
  - Payload uses `data[]`, `event_name`, Unix `event_time`, `event_id`, `action_source: website`, `event_source_url` and `user_data`.
  - Meta documents `event_id` for deduplication and allows batches up to 1,000 events.
- TikTok Events API overview: https://ads.tiktok.com/resources/help/article/events-api
- TikTok Events API setup: https://ads.tiktok.com/resources/help/article/getting-started-events-api?lang=en
  - TikTok recommends using Events API together with Pixel and event deduplication.
  - Events API 2.0 requires an access token; the direct integration documentation is linked from the official setup page.
- Vercel Node.js server entrypoint: https://vercel.com/docs/functions/runtimes/node-js
  - Vercel supports a Node HTTP server entrypoint that calls `server.listen(process.env.PORT)`.
- Vercel Express/backend docs surfaced by official documentation search: https://vercel.com/docs/frameworks/backend/fastify
  - Backend projects can use a server entrypoint and production deployment settings.
