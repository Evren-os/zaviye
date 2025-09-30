import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export { RATE_LIMIT_WINDOW_MS } from "@/lib/constants/rate-limits";
/**
 * Re-export services for backward compatibility
 * These maintain the original API from this file
 */
export {
	checkThrottle,
	startThrottleTimer,
} from "@/lib/services/rate-limit-service";

export {
	safeLocalStorageGet,
	safeLocalStorageRemove,
	safeLocalStorageSet,
} from "@/lib/services/storage-service";
export { handleError } from "@/lib/utils/error-utils";
