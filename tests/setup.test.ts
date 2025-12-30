import { describe, it, expect } from "vitest";

describe("Testing Framework Setup", () => {
	it("should verify Vitest is working", () => {
		expect(1 + 1).toBe(2);
	});

	it("should have access to globals", () => {
		expect(true).toBeTruthy();
	});
});
