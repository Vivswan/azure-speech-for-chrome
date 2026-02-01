import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return initial value immediately", () => {
		const { result } = renderHook(() => useDebounce("initial", 500));

		expect(result.current).toBe("initial");
	});

	it("should debounce value changes", () => {
		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: "first", delay: 500 },
		});

		expect(result.current).toBe("first");

		// Change value
		rerender({ value: "second", delay: 500 });

		// Value should not change immediately
		expect(result.current).toBe("first");

		// Fast-forward time by 500ms
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Now value should be updated
		expect(result.current).toBe("second");
	});

	it("should reset timer on rapid value changes", () => {
		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: "first", delay: 500 },
		});

		// Change value multiple times rapidly
		rerender({ value: "second", delay: 500 });
		act(() => vi.advanceTimersByTime(200));

		rerender({ value: "third", delay: 500 });
		act(() => vi.advanceTimersByTime(200));

		// Timer was reset, so value should still be 'first'
		expect(result.current).toBe("first");

		// Complete the debounce period
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Now should have the latest value
		expect(result.current).toBe("third");
	});

	it("should use default delay of 500ms when delay is 0", () => {
		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: "first", delay: 0 },
		});

		rerender({ value: "second", delay: 0 });

		// Should use default delay of 500ms
		act(() => {
			vi.advanceTimersByTime(499);
		});
		expect(result.current).toBe("first");

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe("second");
	});

	it("should respect custom delay", () => {
		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: "first", delay: 1000 },
		});

		rerender({ value: "second", delay: 1000 });

		act(() => {
			vi.advanceTimersByTime(999);
		});
		expect(result.current).toBe("first");

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe("second");
	});

	it("should handle number values", () => {
		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: 0, delay: 500 },
		});

		expect(result.current).toBe(0);

		rerender({ value: 42, delay: 500 });

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(result.current).toBe(42);
	});

	it("should handle object values", () => {
		const obj1 = { name: "first" };
		const obj2 = { name: "second" };

		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: obj1, delay: 500 },
		});

		expect(result.current).toBe(obj1);

		rerender({ value: obj2, delay: 500 });

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(result.current).toBe(obj2);
	});

	it("should handle array values", () => {
		const arr1 = [1, 2, 3];
		const arr2 = [4, 5, 6];

		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: arr1, delay: 500 },
		});

		expect(result.current).toBe(arr1);

		rerender({ value: arr2, delay: 500 });

		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(result.current).toBe(arr2);
	});

	it("should cleanup timer on unmount", () => {
		const { unmount } = renderHook(() => useDebounce("value", 500));

		// Unmount should not throw
		expect(() => unmount()).not.toThrow();
	});

	it("should update when delay changes", () => {
		const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
			initialProps: { value: "first", delay: 1000 },
		});

		rerender({ value: "second", delay: 1000 });

		// Change delay mid-debounce
		rerender({ value: "second", delay: 200 });

		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current).toBe("second");
	});
});
