import { describe, it, expect } from "vitest";
import { BcryptPasswordHasher } from "../infrastructure/security/bcrypt-hasher";

describe("BcryptPasswordHasher", () => {
    const hasher = new BcryptPasswordHasher();
    const password = "mySecurePassword123";

    it("should generate a hash different from the plain text password", async () => {
        const hash = await hasher.hash(password);
        expect(hash).not.toBe(password);
        expect(hash.length).toBeGreaterThan(20);
    });

    it("should generate different hashes for the same password due to salting", async () => {
        const hash1 = await hasher.hash(password);
        const hash2 = await hasher.hash(password);
        expect(hash1).not.toBe(hash2);
    });

    it("should return true when comparing a password with its correct hash", async () => {
        const hash = await hasher.hash(password);
        const isValid = await hasher.compare(password, hash);
        expect(isValid).toBe(true);
    });

    it("should return false when comparing a password with an incorrect hash", async () => {
        const hash = await hasher.hash(password);
        const isValid = await hasher.compare("wrongPassword", hash);
        expect(isValid).toBe(false);
    });

    it("should return false when comparing an incorrect password with a valid hash", async () => {
        const hash = await hasher.hash(password);
        const isValid = await hasher.compare("anotherPassword", hash);
        expect(isValid).toBe(false);
    });
});
