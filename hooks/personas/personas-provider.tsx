"use client";

import type { PropsWithChildren } from "react";
import { PersonasContext } from "./personas-context";
import { usePersonasState } from "./use-personas-state";

/**
 * Provider for personas context
 * Wraps the app to provide persona state to all components
 */
export function PersonasProvider({ children }: PropsWithChildren) {
	const contextValue = usePersonasState();

	return (
		<PersonasContext.Provider value={contextValue}>
			{children}
		</PersonasContext.Provider>
	);
}
