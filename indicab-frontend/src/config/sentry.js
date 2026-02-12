import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * 
 * Environment Variables Required:
 * REACT_APP_SENTRY_DSN: Your Sentry project DSN
 * REACT_APP_ENVIRONMENT: Environment name (development, staging, production)
 */
export const initSentry = () => {
  const sentryDSN = process.env.REACT_APP_SENTRY_DSN;
  const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

  if (!sentryDSN) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    environment,
    
    // Performance monitoring
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          window.history
        ),
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Set sampling rates for performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Session replay sampling
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: process.env.REACT_APP_VERSION || '1.0.0',

    // Configure ignored errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // Chrome extensions
      'chrome-extension://',
      'moz-extension://',
      // Network errors that aren't actionable
      'NetworkError',
      'Non-Error promise rejection captured',
    ],

    // Before sending to Sentry
    beforeSend(event) {
      // Don't send errors in development
      if (environment === 'development') {
        console.log('Sentry event (not sent in development):', event);
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized for error tracking');
};

export default Sentry;
