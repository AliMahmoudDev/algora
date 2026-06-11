// This file configures the initialization of Sentry for edge features (middleware, edge API routes, etc.)
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  // Only capture errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Don't sample performance events for non-error routes in production to save quota
  replaysOnErrorSampleRate: 1.0,

  // Disable session replay to save quota (free tier)
  replaysSessionSampleRate: 0,

  debug: false,
});
