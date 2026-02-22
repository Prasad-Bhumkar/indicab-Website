/**
 * Initialize Sentry for error tracking and performance monitoring
 *
 * Environment Variables Required:
 * VITE_SENTRY_DSN: Your Sentry project DSN
 * VITE_ENVIRONMENT: Environment name (development, staging, production)
 */

let sentryInitialized = false;
let Sentry = null;

export const initSentry = async () => {
  // Don't initialize multiple times
  if (sentryInitialized) {
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development';

  // Try to use Sentry if available
  if (dsn) {
    try {
      // Dynamically import Sentry if available
      const SentryReact = await import('@sentry/react');
      const SentryTracing = await import('@sentry/tracing');

      Sentry = SentryReact.default || SentryReact;

      Sentry.init({
        dsn,
        environment,
        integrations: [
          new SentryTracing.BrowserTracing(),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });

      sentryInitialized = true;
    } catch (error) {
      // Sentry packages not available or initialization failed
      sentryInitialized = true; // Mark as initialized to avoid repeated attempts
    }
  } else {
    // VITE_SENTRY_DSN not configured - Sentry error tracking is disabled
    sentryInitialized = true;
  }
};

/**
 * Get Sentry instance for manual error reporting
 */
export const getSentry = () => {
  return Sentry;
};

/**
 * Capture exception and send to Sentry
 */
export const captureException = (error, context = {}) => {
  if (Sentry) {
    Sentry.captureException(error, { contexts: context });
  }
  // Error not sent if Sentry is not initialized
};

/**
 * Capture message and send to Sentry
 */
export const captureMessage = (message, level = 'info') => {
  if (Sentry) {
    Sentry.captureMessage(message, level);
  }
  // Message not sent if Sentry is not initialized
};

export default {
  initSentry,
  getSentry,
  captureException,
  captureMessage,
};
