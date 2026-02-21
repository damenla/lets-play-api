import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, it, expect } from "vitest";
import { createApp } from "../app";

describe("Auth API", () => {
    let app: Application;

    beforeEach(() => {
        process.env.JWT_SECRET = "test-secret";
        app = createApp(true);
    });

    const testUser = {
        username: "auth_test",
        email: "auth@test.com",
        name: "Auth Test",
        password: "password123"
    };

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser)
                .expect(201);

            expect(response.body.username).toBe(testUser.username);
            expect(response.body).not.toHaveProperty("password");
        });
    });

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
            // Register the user before testing login
            await request(app).post("/api/auth/register").send(testUser);
        });

        it("should return a JWT token for valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    username: testUser.username,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty("token");
            expect(typeof response.body.token).toBe("string");
        });

        it("should return 401 for invalid password", async () => {
            await request(app)
                .post("/api/auth/login")
                .send({
                    username: testUser.username,
                    password: "wrong_password"
                })
                .expect(401);
        });

        it("should return 401 for non-existent user", async () => {
            await request(app)
                .post("/api/auth/login")
                .send({
                    username: "non_existent",
                    password: "password123"
                })
                .expect(401);
        });

        it("should return 403 for inactive user", async () => {
            // First, register a user
            const regRes = await request(app).post("/api/auth/register").send({
                username: "inactive_user",
                email: "inactive@test.com",
                name: "Inactive",
                password: "password123"
            });
            const userId = regRes.body.id;

            // Get a token from another user to deactivate it
            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({ username: testUser.username, password: testUser.password });
            const token = loginRes.body.token;

            // Deactivate the user
            await request(app)
                .patch(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ isActive: false });

            // Try to login
            const response = await request(app)
                .post("/api/auth/login")
                .send({ username: "inactive_user", password: "password123" })
                .expect(403);

            expect(response.body.code).toBe("USER_INACTIVE");
        });
    });

    describe("JWT Authorization", () => {
        let token: string;
        let userId: string;

        beforeEach(async () => {
            const regRes = await request(app).post("/api/auth/register").send(testUser);
            userId = regRes.body.id;

            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({ username: testUser.username, password: testUser.password });
            token = loginRes.body.token;
        });

        it("should allow access with valid JWT token", async () => {
            await request(app)
                .get(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);
        });

        it("should return 401 for invalid JWT token", async () => {
            await request(app)
                .get(`/api/users/${userId}`)
                .set("Authorization", "Bearer invalid-token")
                .expect(401);
        });

        it("should return 403 when user has a valid token but account is inactive", async () => {
            // Deactivate the user
            await request(app)
                .patch(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ isActive: false })
                .expect(200);

            // Try to access a protected route with the same token
            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(403);

            expect(response.body.code).toBe("USER_INACTIVE");
        });
    });
});
