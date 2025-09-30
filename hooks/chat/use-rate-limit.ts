import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	checkThrottle,
	startThrottleTimer,
} from "@/lib/services/rate-limit-service";
import type { ModelId } from "@/lib/types";

/**
 * Hook for managing rate limiting state and logic
 */
export function useRateLimit(_chatType: string) {
	const [requestTimestamps, setRequestTimestamps] = useState<
		Record<string, number[]>
	>({});
	const [throttleSeconds, setThrottleSeconds] = useState(0);
	const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Cleanup throttle timer on component unmount or chat switch
	useEffect(() => {
		return () => {
			if (throttleTimerRef.current) {
				clearInterval(throttleTimerRef.current);
				throttleTimerRef.current = null;
			}
			setThrottleSeconds(0);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const checkAndApplyThrottle = useCallback(
		(modelId: ModelId): boolean => {
			return checkThrottle(
				modelId,
				requestTimestamps,
				setThrottleSeconds,
				setRequestTimestamps,
				(timeToWait) => {
					if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
					throttleTimerRef.current = startThrottleTimer(setThrottleSeconds);
					toast.warning(
						`Rate limit reached. Please wait ${timeToWait} seconds.`,
						{ duration: 2000 },
					);
				},
			);
		},
		[requestTimestamps],
	);

	return {
		throttleSeconds,
		checkAndApplyThrottle,
	};
}
