import { useCallback, useState } from "react";

/**
 * Hook for managing a single form field
 */
export function useFormField<T>(initialValue: T) {
	const [value, setValue] = useState<T>(initialValue);
	const [isDirty, setIsDirty] = useState(false);

	const handleChange = useCallback((newValue: T) => {
		setValue(newValue);
		setIsDirty(true);
	}, []);

	const reset = useCallback(() => {
		setValue(initialValue);
		setIsDirty(false);
	}, [initialValue]);

	return {
		value,
		setValue,
		handleChange,
		isDirty,
		reset,
	};
}

/**
 * Hook for managing multiple form fields
 */
export function useFormFields<T extends Record<string, unknown>>(
	initialValues: T,
) {
	const [values, setValues] = useState<T>(initialValues);
	const [dirtyFields, setDirtyFields] = useState<Set<keyof T>>(new Set());

	const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
		setValues((prev) => ({ ...prev, [field]: value }));
		setDirtyFields((prev) => new Set(prev).add(field));
	}, []);

	const setMultipleValues = useCallback((updates: Partial<T>) => {
		setValues((prev) => ({ ...prev, ...updates }));
		setDirtyFields((prev) => {
			const newSet = new Set(prev);
			Object.keys(updates).forEach((key) => {
				newSet.add(key as keyof T);
			});
			return newSet;
		});
	}, []);

	const reset = useCallback(() => {
		setValues(initialValues);
		setDirtyFields(new Set());
	}, [initialValues]);

	const isDirty = dirtyFields.size > 0;

	return {
		values,
		setValue,
		setMultipleValues,
		isDirty,
		dirtyFields,
		reset,
	};
}
