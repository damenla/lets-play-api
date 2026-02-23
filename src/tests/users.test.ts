import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { clearDatabase } from "./db-utils";

describe("User API", () => {
    let app: Application;
    let authToken: string;

    beforeEach(async () => {
        await clearDatabase();
        // Set JWT secret for tests
        process.env.JWT_SECRET = "test-secret";
        const useInMemory = process.env.IN_MEMORY_DATA !== "false";
        app = createApp(useInMemory);

        // Register and login a default user for tokens
        await request(app).post("/api/auth/register").send({
            username: "mainuser",
            email: "main@test.com",
            name: "Main User",
            password: "password123"
        });

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ username: "mainuser", password: "password123" });

        authToken = loginRes.body.token;
    });

    const getAuthHeader = () => ({ Authorization: `Bearer ${authToken}` });

    describe("POST /api/auth/register", () => {
        it("should register a new user with valid data", async () => {
            const newUser = {
                username: "testuser",
                email: "test@example.com",
                name: "Test User",
                password: "password123"
            };

            const response = await request(app)
                .post("/api/auth/register")
                .send(newUser)
                .expect("Content-Type", /json/)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.username).toBe(newUser.username);
            expect(response.body).not.toHaveProperty("password");
        });
    });

    describe("GET /api/users/me", () => {
        it("should return the authenticated user profile", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set(getAuthHeader())
                .expect(200);

            expect(response.body.username).toBe("mainuser");
            expect(response.body).not.toHaveProperty("password");
        });

        it("should return 401 if token is missing", async () => {
            await request(app).get("/api/users/me").expect(401);
        });
    });

    describe("PATCH /api/users/me/password", () => {
        it("should update password when current password is correct", async () => {
            await request(app)
                .patch("/api/users/me/password")
                .set(getAuthHeader())
                .send({
                    currentPassword: "password123",
                    newPassword: "newpassword123"
                })
                .expect(204);

            // Verify login with new password works
            await request(app)
                .post("/api/auth/login")
                .send({ username: "mainuser", password: "newpassword123" })
                .expect(200);
        });

        it("should return 401 when current password is incorrect", async () => {
            await request(app)
                .patch("/api/users/me/password")
                .set(getAuthHeader())
                .send({
                    currentPassword: "wrongpassword",
                    newPassword: "newpassword123"
                })
                .expect(401);
        });
    });
});
