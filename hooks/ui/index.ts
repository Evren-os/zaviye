/**
 * UI utility hooks
 * Re-exports all utility hooks for easier importing
 */

// Existing hooks
export { useAutoScroll } from "../use-auto-scroll";
export { useKeyboardShortcuts } from "../use-keyboard-shortcuts";
export { useIsMobile } from "../use-mobile";
export { useMounted } from "../use-mounted";
export { useClipboard } from "./use-clipboard";
export { useDebounce } from "./use-debounce";
// New utility hooks
export { useDialogState } from "./use-dialog-state";
export { useFormField, useFormFields } from "./use-form-field";
