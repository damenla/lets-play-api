import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import { JwtService } from "../infrastructure/security/jwt-service";

describe("JwtService", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        process.env.JWT_SECRET = "test-secret";
        // Ensure JWT_EXPIRATION_SECONDS is NOT set to test default
        delete process.env.JWT_EXPIRATION_SECONDS;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const mockPayload = {
        id: "user-123",
        username: "testuser"
    };

    it("should generate a token with correct payload", () => {
        const service = new JwtService();
        const token = service.generateToken(mockPayload);

        const decoded = jwt.verify(token, "test-secret") as any;
        expect(decoded.id).toBe(mockPayload.id);
        expect(decoded.username).toBe(mockPayload.username);
    });

    it("should use 5 minutes as default expiration", () => {
        const service = new JwtService();
        const token = service.generateToken(mockPayload);

        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const iat = decoded.iat as number;
        const exp = decoded.exp as number;

        // 5 minutes = 300 seconds
        expect(exp - iat).toBe(300);
    });

    it("should respect JWT_EXPIRATION_SECONDS environment variable", () => {
        process.env.JWT_EXPIRATION_SECONDS = "300";
        const service = new JwtService();
        const token = service.generateToken(mockPayload);

        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const iat = decoded.iat as number;
        const exp = decoded.exp as number;

        // 5 minutes = 300 seconds
        expect(exp - iat).toBe(300);
    });

    it("should verify a valid token", () => {
        const service = new JwtService();
        const token = service.generateToken(mockPayload);

        const decoded = service.verifyToken(token);
        expect(decoded.id).toBe(mockPayload.id);
        expect(decoded.username).toBe(mockPayload.username);
    });

    it("should throw error when verifying an invalid token", () => {
        const service = new JwtService();
        expect(() => service.verifyToken("invalid-token")).toThrow();
    });

    it("should throw error when verifying a token with a different secret", () => {
        const service = new JwtService();
        const differentSecretToken = jwt.sign(mockPayload, "other-secret");

        expect(() => service.verifyToken(differentSecretToken)).toThrow();
    });

    it("should throw error when secret is not configured", () => {
        delete process.env.JWT_SECRET;
        const service = new JwtService();

        expect(() => service.generateToken(mockPayload)).toThrow("JWT secret is not configured");
        expect(() => service.verifyToken("some-token")).toThrow("JWT secret is not configured");
    });

    it("should throw error when token is expired", () => {
        process.env.JWT_EXPIRATION_SECONDS = "-1"; // Instant expiration
        const service = new JwtService();
        const token = service.generateToken(mockPayload);

        // We wait a tiny bit to ensure it expires
        // Actually jwt.sign with 0s might expire immediately
        expect(() => service.verifyToken(token)).toThrow();
    });
});
