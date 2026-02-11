import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("User API", () => {
    let app: Application;

    beforeEach(() => {
        app = createApp();
    });

    describe("POST /api/users", () => {
        it("should create a new user with valid data", async () => {
            const newUser = {
                email: "test@example.com",
                name: "Test User"
            };

            const response = await request(app)
                .post("/api/users")
                .send(newUser)
                .expect("Content-Type", /json/)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.email).toBe(newUser.email);
            expect(response.body.name).toBe(newUser.name);
            expect(response.body.isActive).toBe(true);
            expect(response.body).toHaveProperty("createdAt");
            expect(response.body).toHaveProperty("updatedAt");
        });

        it("should return 400 if required fields are missing", async () => {
            const invalidUser = {
                name: "Test User" // Missing email
            };

            await request(app).post("/api/users").send(invalidUser).expect(400);
        });

        it("should return 400 if email is invalid", async () => {
            const invalidUser = {
                email: "not-an-email",
                name: "Test User"
            };

            await request(app).post("/api/users").send(invalidUser).expect(400);
        });

        // This test will fail or be flaky until we have real or mocked persistence.
        // For now we assume that in pure TDD, we will implement the logic later.
        // To simplify, I will omit the conflict test in this first structure pass
        // or leave it prepared to fail.
        it("should return 409 if email already exists", async () => {
            // First create one
            const user = { email: "duplicate@example.com", name: "Original" };
            await request(app).post("/api/users").send(user);

            // Try to create the same one
            await request(app).post("/api/users").send(user).expect(409);
        });
    });

    describe("GET /api/users/:id", () => {
        it("should return the correct user by ID when multiple users exist", async () => {
            // Create multiple users to ensure we get the correct one
            await request(app)
                .post("/api/users")
                .send({ email: "userA@example.com", name: "User A" });
            const userBRes = await request(app)
                .post("/api/users")
                .send({ email: "userB@example.com", name: "User B" });
            await request(app)
                .post("/api/users")
                .send({ email: "userC@example.com", name: "User C" });

            const userId = userBRes.body.id;

            const response = await request(app)
                .get(`/api/users/${userId}`)
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body.id).toBe(userId);
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
                .send({ email: "updateA@example.com", name: "User A" });
            const resB = await request(app)
                .post("/api/users")
                .send({ email: "updateB@example.com", name: "User B" });

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
                .send({ email: "old@example.com", name: "User" });
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

        it("should return 409 if new email conflicts", async () => {
            // Create user A
            await request(app).post("/api/users").send({ email: "a@example.com", name: "A" });
            // Create user B
            const resB = await request(app)
                .post("/api/users")
                .send({ email: "b@example.com", name: "B" });
            const userIdB = resB.body.id;

            // Try to change B's email to A's email
            await request(app)
                .patch(`/api/users/${userIdB}`)
                .send({ email: "a@example.com" })
                .expect(409);
        });

        it("should return 404", async () => {
            await request(app)
                .patch("/api/users/00000000-0000-0000-0000-000000000000")
                .send({ name: "New" })
                .expect(404);
        });
    });
});
