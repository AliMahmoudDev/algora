// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  enabled: process.env.NODE_ENV === 'production',

  // Ignore specific errors that are not actionable
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'Development-only error',
  ],

  debug: false,
});
