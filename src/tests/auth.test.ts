import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, it } from "vitest";
import { createApp } from "../app";

describe("Auth Middleware", () => {
    let app: Application;

    beforeEach(() => {
        app = createApp(true);
    });

    describe("GET /api/users/test/protected", () => {
        it("should return 401 if Authorization header is missing", async () => {
            await request(app).get("/api/users/test/protected").expect(401);
        });

        it("should return 401 if token is invalid", async () => {
            await request(app)
                .get("/api/users/test/protected")
                .set("Authorization", "Bearer invalid-token")
                .expect(401);
        });

        it("should return 200 if token is valid", async () => {
            await request(app)
                .get("/api/users/test/protected")
                .set("Authorization", "Bearer 123456")
                .expect(200);
        });
    });
});
