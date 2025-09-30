/**
 * Rate limiting configuration
 */

/**
 * Time window for rate limiting in milliseconds
 * Currently set to 1 minute
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Default model ID used throughout the application
 */
export const DEFAULT_MODEL_ID = "gemini-2.5-flash" as const;
