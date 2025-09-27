import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getModelById } from "./models"
import type { ModelId } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rate limiting utilities
// Interface for tracking rate limit records per model
export interface RateLimitRecord {
  count: number;
  lastRequest: number;
}

// Window for rate limiting: 1 minute
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Checks if a request should be throttled based on the model's RPM limit.
 * Updates timestamps and sets throttle state if needed.
 * @param modelId - The ID of the model to check
 * @param requestTimestamps - Current timestamps for all models
 * @param setThrottleSeconds - Setter for throttle countdown
 * @param setRequestTimestamps - Setter for updating timestamps
 * @param onThrottle - Callback when throttled
 * @returns true if throttled, false otherwise
 */
export function checkThrottle(
  modelId: ModelId,
  requestTimestamps: Record<string, number[]>,
  setThrottleSeconds: (seconds: number) => void,
  setRequestTimestamps: (timestamps: Record<string, number[]>) => void,
  onThrottle?: (seconds: number) => void
): boolean {
  const model = getModelById(modelId);
  if (!model) {
    return true; // Invalid model, treat as throttled
  }

  const now = Date.now();
  const oneMinuteAgo = now - RATE_LIMIT_WINDOW_MS;

  const recentTimestamps = (requestTimestamps[modelId] || []).filter((ts) => ts > oneMinuteAgo);

  if (recentTimestamps.length >= model.rpm) {
    const oldestRequestTime = recentTimestamps[0];
    const timeToWait = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestRequestTime)) / 1000);
    setThrottleSeconds(timeToWait);
    onThrottle?.(timeToWait);
    return true; // Is throttled
  }

  setRequestTimestamps({
    ...requestTimestamps,
    [modelId]: [...recentTimestamps, now],
  });

  return false; // Not throttled
}

/**
 * Starts a countdown timer for throttle seconds.
 * Automatically clears when countdown reaches 0.
 * @param setThrottleSeconds - Setter for throttle countdown
 * @returns The interval timer ID
 */
export function startThrottleTimer(setThrottleSeconds: (seconds: number) => void): NodeJS.Timeout {
  const timer = setInterval(() => {
    setThrottleSeconds((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return timer;
}

// Error handling utilities

/**
 * Handles errors by showing a toast notification and logging.
 * Skips toast for aborted requests.
 * @param error - The error object
 * @param context - Context where the error occurred
 * @param toast - Toast function to show notifications
 */
export function handleError(error: unknown, context: string, toast: any) {
  if (error instanceof Error && error.name === "AbortError") {
    return; // Don't show toast for aborted requests
  }
  if (error instanceof Error) {
    toast.error(error.message, {
      duration: 3500,
      description: "Consider switching to a different model if this persists.",
    });
  } else {
    toast.error(`An error occurred in ${context}`, { duration: 3500 });
  }
  console.error(`Error in ${context}:`, error);
}

/**
 * Safely gets a value from localStorage, returning default if fails.
 * @param key - localStorage key
 * @param defaultValue - Default value if key not found or parse fails
 * @returns Parsed value or default
 */
export function safeLocalStorageGet(key: string, defaultValue: any = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to get ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely sets a value in localStorage.
 * @param key - localStorage key
 * @param value - Value to set
 */
export function safeLocalStorageSet(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set ${key} in localStorage:`, error);
  }
}

/**
 * Safely removes a key from localStorage.
 * @param key - localStorage key to remove
 */
export function safeLocalStorageRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
}
