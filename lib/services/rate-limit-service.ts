import { RATE_LIMIT_WINDOW_MS } from "@/lib/constants/rate-limits";
import { getModelById } from "@/lib/models";
import type { ModelId } from "@/lib/types";

/**
 * Rate limiting service for managing API request throttling
 */

/**
 * Checks if a request should be throttled based on the model's RPM limit
 * Updates timestamps and sets throttle state if needed
 */
export function checkThrottle(
	modelId: ModelId,
	requestTimestamps: Record<string, number[]>,
	setThrottleSeconds: (seconds: number) => void,
	setRequestTimestamps: (timestamps: Record<string, number[]>) => void,
	onThrottle?: (seconds: number) => void,
): boolean {
	const model = getModelById(modelId);
	if (!model) {
		return true;
	}

	const now = Date.now();
	const oneMinuteAgo = now - RATE_LIMIT_WINDOW_MS;

	const recentTimestamps = (requestTimestamps[modelId] || []).filter(
		(ts) => ts > oneMinuteAgo,
	);

	if (recentTimestamps.length >= model.rpm) {
		const oldestRequestTime = recentTimestamps[0];
		const timeToWait = Math.ceil(
			(RATE_LIMIT_WINDOW_MS - (now - oldestRequestTime)) / 1000,
		);
		setThrottleSeconds(timeToWait);
		onThrottle?.(timeToWait);
		return true;
	}

	setRequestTimestamps({
		...requestTimestamps,
		[modelId]: [...recentTimestamps, now],
	});

	return false;
}

/**
 * Starts a countdown timer for throttle seconds
 * Automatically clears when countdown reaches 0
 */
export function startThrottleTimer(
	setThrottleSeconds: (fn: (prev: number) => number) => void,
): NodeJS.Timeout {
	const timer = setInterval(() => {
		setThrottleSeconds((prev: number) => {
			if (prev <= 1) {
				clearInterval(timer);
				return 0;
			}
			return prev - 1;
		});
	}, 1000);
	return timer;
}
