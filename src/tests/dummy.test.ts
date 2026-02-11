import { describe, expect, it } from "vitest";

function sum(a: number, b: number): number {
    return a + b;
}

describe("Dummy Test", () => {
    it("should add two numbers correctly", () => {
        expect(sum(1, 2)).toBe(3);
        expect(sum(-1, 1)).toBe(0);
        expect(sum(-1, 2)).toBe(1);
        expect(sum(2, 3)).toBe(5);
    });
});
