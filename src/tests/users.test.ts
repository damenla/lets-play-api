import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("User API", () => {
    let app: Application;

    beforeEach(() => {
        app = createApp(true);
    });

    describe("POST /api/users", () => {
        it("should create a new user with valid data", async () => {
            const newUser = {
                username: "testuser",
                email: "test@example.com",
                name: "Test User",
                password: "password123"
            };

            const response = await request(app)
                .post("/api/users")
                .send(newUser)
                .expect("Content-Type", /json/)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.username).toBe(newUser.username);
            expect(response.body.email).toBe(newUser.email);
            expect(response.body.name).toBe(newUser.name);
            expect(response.body.isActive).toBe(true);
            expect(response.body).not.toHaveProperty("password");
            expect(response.body).toHaveProperty("createdAt");
            expect(response.body).toHaveProperty("updatedAt");
        });

        it("should return 400 if required fields are missing", async () => {
            const invalidUser = {
                username: "testuser",
                // Missing email
                name: "Test User",
                password: "password123"
            };

            await request(app).post("/api/users").send(invalidUser).expect(400);
        });

        it("should return 400 if email is invalid", async () => {
            const invalidUser = {
                username: "testuser",
                email: "not-an-email",
                name: "Test User",
                password: "password123"
            };

            await request(app).post("/api/users").send(invalidUser).expect(400);
        });

        it("should return 409 if username already exists", async () => {
            const user = {
                username: "duplicate",
                email: "user1@example.com",
                name: "User 1",
                password: "password123"
            };
            await request(app).post("/api/users").send(user).expect(201);

            const duplicateUser = {
                username: "duplicate",
                email: "user2@example.com",
                name: "User 2",
                password: "password456"
            };
            await request(app).post("/api/users").send(duplicateUser).expect(409);
        });

        it("should allow duplicate emails", async () => {
            const user1 = {
                username: "user1",
                email: "shared@example.com",
                name: "User 1",
                password: "password123"
            };
            await request(app).post("/api/users").send(user1).expect(201);

            const user2 = {
                username: "user2",
                email: "shared@example.com",
                name: "User 2",
                password: "password456"
            };
            await request(app).post("/api/users").send(user2).expect(201);
        });
    });

    describe("GET /api/users/:id", () => {
        it("should return the correct user by ID when multiple users exist", async () => {
            // Create multiple users to ensure we get the correct one
            await request(app)
                .post("/api/users")
                .send({
                    username: "userA",
                    email: "userA@example.com",
                    name: "User A",
                    password: "passwordA"
                });
            const userBRes = await request(app)
                .post("/api/users")
                .send({
                    username: "userB",
                    email: "userB@example.com",
                    name: "User B",
                    password: "passwordB"
                });
            await request(app)
                .post("/api/users")
                .send({
                    username: "userC",
                    email: "userC@example.com",
                    name: "User C",
                    password: "passwordC"
                });

            const userId = userBRes.body.id;

            const response = await request(app)
                .get(`/api/users/${userId}`)
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body.id).toBe(userId);
            expect(response.body.username).toBe("userB");
            expect(response.body.email).toBe("userB@example.com");
            expect(response.body.name).toBe("User B");
        });

        it("should return 404 for non-existent user", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000"; // Valid but non-existent UUID
            await request(app).get(`/api/users/${nonExistentId}`).expect(404);
        });

        it("should return 400 for invalid UUID format", async () => {
            await request(app).get("/api/users/invalid-uuid").expect(400);
        });
    });

    describe("PATCH /api/users/:id", () => {
        it("should update the correct user and leave others unchanged", async () => {
            // Create two users
            const resA = await request(app)
                .post("/api/users")
                .send({
                    username: "userA",
                    email: "updateA@example.com",
                    name: "User A",
                    password: "passwordA"
                });
            const resB = await request(app)
                .post("/api/users")
                .send({
                    username: "userB",
                    email: "updateB@example.com",
                    name: "User B",
                    password: "passwordB"
                });

            const userIdA = resA.body.id;
            const userIdB = resB.body.id;

            const updateData = {
                name: "Updated Name A",
                isActive: false
            };

            // Update User A
            const response = await request(app)
                .patch(`/api/users/${userIdA}`)
                .send(updateData)
                .expect(200);

            // Verify User A is updated
            expect(response.body.id).toBe(userIdA);
            expect(response.body.name).toBe(updateData.name);
            expect(response.body.isActive).toBe(false);
            expect(response.body.email).toBe("updateA@example.com");

            // Verify User B is NOT updated
            const checkResB = await request(app).get(`/api/users/${userIdB}`).expect(200);
            expect(checkResB.body.name).toBe("User B");
            expect(checkResB.body.email).toBe("updateB@example.com");
        });

        it("should update user email successfully", async () => {
            const createRes = await request(app)
                .post("/api/users")
                .send({
                    username: "user",
                    email: "old@example.com",
                    name: "User",
                    password: "password"
                });
            const userId = createRes.body.id;

            const updateData = {
                email: "new@example.com"
            };

            const response = await request(app)
                .patch(`/api/users/${userId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.email).toBe(updateData.email);
        });

        it("should update username successfully", async () => {
            const createRes = await request(app)
                .post("/api/users")
                .send({
                    username: "oldusername",
                    email: "user@example.com",
                    name: "User",
                    password: "password"
                });
            const userId = createRes.body.id;

            const updateData = {
                username: "newusername"
            };

            const response = await request(app)
                .patch(`/api/users/${userId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.username).toBe(updateData.username);
        });

        it("should return 409 if new username conflicts", async () => {
            // Create user A
            await request(app)
                .post("/api/users")
                .send({ username: "userA", email: "a@example.com", name: "A", password: "p" });
            // Create user B
            const resB = await request(app)
                .post("/api/users")
                .send({ username: "userB", email: "b@example.com", name: "B", password: "p" });
            const userIdB = resB.body.id;

            // Try to change B's username to A's username
            await request(app)
                .patch(`/api/users/${userIdB}`)
                .send({ username: "userA" })
                .expect(409);
        });

        it("should return 404", async () => {
            await request(app)
                .patch("/api/users/00000000-0000-0000-0000-000000000000")
                .send({ name: "New" })
                .expect(404);
        });
    });

    describe("PATCH /api/users/:id/password", () => {
        it("should update user password successfully", async () => {
            const createRes = await request(app)
                .post("/api/users")
                .send({
                    username: "userpw",
                    email: "pw@example.com",
                    name: "User",
                    password: "oldpassword"
                });
            const userId = createRes.body.id;

            await request(app)
                .patch(`/api/users/${userId}/password`)
                .send({ password: "newpassword" })
                .expect(204);
        });

        it("should return 400 if password is missing", async () => {
            const createRes = await request(app)
                .post("/api/users")
                .send({
                    username: "userpw2",
                    email: "pw2@example.com",
                    name: "User",
                    password: "oldpassword"
                });
            const userId = createRes.body.id;

            await request(app).patch(`/api/users/${userId}/password`).send({}).expect(400);
        });

        it("should return 404 if user not found", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            await request(app)
                .patch(`/api/users/${nonExistentId}/password`)
                .send({ password: "newpassword" })
                .expect(404);
        });
    });
});
