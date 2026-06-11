// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  enabled: process.env.NODE_ENV === 'production',

  // Only send error events (no replays to save free tier quota)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,

  debug: false,

  // Performance monitoring
  integrations: [
    Sentry.browserTracingIntegration({
      // Exclude static assets and next internals from traces
      excludeAllAssets: true,
    }),
  ],
});
