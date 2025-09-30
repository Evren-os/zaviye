/**
 * Personas management hook and provider
 *
 * This file has been refactored for better maintainability.
 * The implementation is now split into focused modules:
 * - personas/personas-context.tsx: Context definition
 * - personas/personas-provider.tsx: Provider component
 * - personas/use-personas-state.ts: State management
 * - personas/personas-operations.ts: Business logic
 *
 * This file now serves as a backward-compatible re-export.
 */

export type { PersonasContextType } from "./personas/personas-context";
export { PersonasContext, usePersonas } from "./personas/personas-context";
export { PersonasProvider } from "./personas/personas-provider";
