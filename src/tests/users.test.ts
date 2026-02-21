import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("User API", () => {
    let app: Application;
    let authToken: string;

    beforeEach(async () => {
        // Set JWT secret for tests
        process.env.JWT_SECRET = "test-secret";
        app = createApp(true);

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

    describe("GET /api/users/:id", () => {
        it("should return user by ID with valid token", async () => {
            const regRes = await request(app).post("/api/auth/register").send({
                username: "userA",
                email: "userA@example.com",
                name: "User A",
                password: "passwordA"
            });
            const userId = regRes.body.id;

            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set(getAuthHeader())
                .expect(200);

            expect(response.body.id).toBe(userId);
            expect(response.body.username).toBe("userA");
        });

        it("should return 401 if token is missing", async () => {
            await request(app).get("/api/users/some-id").expect(401);
        });
    });

    describe("PATCH /api/users/:id/password", () => {
        it("should update password when current password is correct", async () => {
            const regRes = await request(app).post("/api/auth/register").send({
                username: "pwduser",
                email: "pwd@test.com",
                name: "Pwd User",
                password: "oldpassword"
            });
            const userId = regRes.body.id;

            await request(app)
                .patch(`/api/users/${userId}/password`)
                .set(getAuthHeader())
                .send({
                    currentPassword: "oldpassword",
                    newPassword: "newpassword123"
                })
                .expect(204);

            // Verify login with new password works
            await request(app)
                .post("/api/auth/login")
                .send({ username: "pwduser", password: "newpassword123" })
                .expect(200);
        });

        it("should return 401 when current password is incorrect", async () => {
            const regRes = await request(app).post("/api/auth/register").send({
                username: "pwduser2",
                email: "pwd2@test.com",
                name: "Pwd User 2",
                password: "correctpassword"
            });
            const userId = regRes.body.id;

            await request(app)
                .patch(`/api/users/${userId}/password`)
                .set(getAuthHeader())
                .send({
                    currentPassword: "wrongpassword",
                    newPassword: "newpassword123"
                })
                .expect(401);
        });
    });
});
