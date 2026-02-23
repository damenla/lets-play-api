import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { clearDatabase } from "./db-utils";

describe("Matches API - Exhaustive Merit System Suite", () => {
    let app: Application;
    let oToken: string;
    let groupId: string;
    const users: { id: string; token: string; username: string }[] = [];

    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    beforeEach(async () => {
        await clearDatabase();
        process.env.JWT_SECRET = "merit-secret";
        const useInMemory = process.env.IN_MEMORY_DATA !== "false";
        app = createApp(useInMemory);

        const setupUser = async (u: string) => {
            await request(app)
                .post("/api/auth/register")
                .send({
                    username: u,
                    email: `${u}@t.com`,
                    name: u,
                    password: "password123"
                });
            const login = await request(app)
                .post("/api/auth/login")
                .send({ username: u, password: "password123" });
            const token = login.body.token;
            const profile = await request(app).get("/api/users/me").set(auth(token));
            return { id: profile.body.id, token, username: u };
        };

        // 1. Crear 20 usuarios
        const owner = await setupUser("owner");
        oToken = owner.token;
        users.length = 0; // Clear array for each test
        for (let i = 1; i <= 19; i++) {
            users.push(await setupUser(`player_${i}`));
        }

        const gRes = await request(app).post("/api/groups").set(auth(oToken)).send({
            name: "Merit League",
            meritPointsPlayed: 10,
            meritPointsNoShow: -20,
            meritPointsReserve: 5,
            meritPointsPositiveAttitude: 5,
            meritPointsNegativeAttitude: -5,
            meritPointsLateCancel: -30,
            meritConfigHoursBeforePenalty: 2,
            meritConfigMaxMatches: 10
        });
        groupId = gRes.body.id;

        for (const u of users) {
            await request(app)
                .post(`/api/groups/${groupId}/members`)
                .set(auth(oToken))
                .send({ userId: u.id });
            await request(app)
                .patch(`/api/groups/${groupId}/invitations`)
                .set(auth(u.token))
                .send({ status: "accepted" });
        }
    });

    it("should correctly handle dynamic reserve calculation when capacity is exceeded", async () => {
        const match = await request(app)
            .post("/api/matches")
            .set(auth(oToken))
            .send({
                groupId,
                sport: "football",
                scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                durationMinutes: 60,
                capacity: 2,
                location: "Small",
                teamAColor: { r: 0, g: 0, b: 0 },
                teamBColor: { r: 1, g: 1, b: 1 }
            });
        const mId = match.body.id;

        // Join 4 users with 0 points
        await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[10].token));
        await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[11].token));
        await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[12].token));
        await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[13].token));

        const res = await request(app)
            .get(`/api/matches/${mId}/participants`)
            .set(auth(oToken))
            .expect(200);

        expect(res.body[0].isReserveCalculated).toBe(false);
        expect(res.body[1].isReserveCalculated).toBe(false);
        expect(res.body[2].isReserveCalculated).toBe(true); // Over capacity
        expect(res.body[3].isReserveCalculated).toBe(true); // Over capacity
    });

    it("should handle 20 users and 10 past matches with complex merit logic", async () => {
        // Simular 10 partidos pasados
        for (let m = 0; m < 10; m++) {
            const matchRes = await request(app)
                .post("/api/matches")
                .set(auth(oToken))
                .send({
                    groupId,
                    sport: "football",
                    scheduledAt: new Date(Date.now() - (m + 1) * 86400000).toISOString(),
                    durationMinutes: 60,
                    capacity: 2,
                    location: "Past",
                    teamAColor: { r: 0, g: 0, b: 0 },
                    teamBColor: { r: 1, g: 1, b: 1 }
                });
            const mId = matchRes.body.id;

            await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[0].token)); // Star
            await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[1].token)); // Bad
            await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[2].token)); // Reserve
            await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[3].token)); // Ghost
            await request(app).post(`/api/matches/${mId}/participants`).set(auth(users[4].token)); // Late

            // Transition matches to finished (will be 501 for now)
            await request(app)
                .patch(`/api/matches/${mId}/status`)
                .set(auth(oToken))
                .send({ status: "playing" });
            await request(app)
                .patch(`/api/matches/${mId}/status`)
                .set(auth(oToken))
                .send({ status: "finished" });

            // Evaluaciones (will be 501 for now)
            await request(app)
                .patch(`/api/matches/${mId}/participants/${users[0].id}/evaluation`)
                .set(auth(oToken))
                .send({ didPlay: true, attitude: "positive" });
            await request(app)
                .patch(`/api/matches/${mId}/participants/${users[1].id}/evaluation`)
                .set(auth(oToken))
                .send({ didPlay: true, attitude: "negative" });
            await request(app)
                .patch(`/api/matches/${mId}/participants/${users[3].id}/evaluation`)
                .set(auth(oToken))
                .send({ didPlay: false });
        }

        const currentMatch = await request(app)
            .post("/api/matches")
            .set(auth(oToken))
            .send({
                groupId,
                sport: "football",
                scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                durationMinutes: 90,
                capacity: 5,
                location: "Main",
                teamAColor: { r: 0, g: 0, b: 0 },
                teamBColor: { r: 1, g: 1, b: 1 }
            });
        const cmId = currentMatch.body.id;

        await request(app).post(`/api/matches/${cmId}/participants`).set(auth(users[4].token));
        await request(app).post(`/api/matches/${cmId}/participants`).set(auth(users[3].token));
        await request(app).post(`/api/matches/${cmId}/participants`).set(auth(users[2].token));
        await request(app).post(`/api/matches/${cmId}/participants`).set(auth(users[1].token));
        await request(app).post(`/api/matches/${cmId}/participants`).set(auth(users[0].token));

        const res = await request(app)
            .get(`/api/matches/${cmId}/participants`)
            .set(auth(oToken))
            .expect(200);

        // This expectation will fail until merits logic is implemented
        expect(res.body[0].userId).toBe(users[0].id); // Star first
    });

    describe("Exhaustive Logic: Group Listing & Metadata Updates", () => {
        it("should list all matches of a group", async () => {
            await request(app)
                .post("/api/matches")
                .set(auth(oToken))
                .send({
                    groupId,
                    sport: "football",
                    scheduledAt: new Date().toISOString(),
                    durationMinutes: 60,
                    capacity: 10,
                    location: "Field 1",
                    teamAColor: { r: 0, g: 0, b: 0 },
                    teamBColor: { r: 1, g: 1, b: 1 }
                });

            const res = await request(app)
                .get(`/api/groups/${groupId}/matches`)
                .set(auth(oToken))
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it("should allow owner to update match metadata if not locked", async () => {
            const match = await request(app)
                .post("/api/matches")
                .set(auth(oToken))
                .send({
                    groupId,
                    sport: "football",
                    scheduledAt: new Date().toISOString(),
                    durationMinutes: 60,
                    capacity: 10,
                    location: "Original Location",
                    teamAColor: { r: 0, g: 0, b: 0 },
                    teamBColor: { r: 1, g: 1, b: 1 }
                });
            const mId = match.body.id;

            const res = await request(app)
                .patch(`/api/matches/${mId}`)
                .set(auth(oToken))
                .send({ location: "Updated Location", capacity: 20 })
                .expect(200);

            expect(res.body.location).toBe("Updated Location");
            expect(res.body.capacity).toBe(20);
        });

        it("should return 403 if owner tries to update a locked match", async () => {
            const match = await request(app)
                .post("/api/matches")
                .set(auth(oToken))
                .send({
                    groupId,
                    sport: "football",
                    scheduledAt: new Date().toISOString(),
                    durationMinutes: 60,
                    capacity: 10,
                    location: "L",
                    teamAColor: { r: 0, g: 0, b: 0 },
                    teamBColor: { r: 1, g: 1, b: 1 }
                });
            const mId = match.body.id;

            // Finish and Lock
            await request(app)
                .patch(`/api/matches/${mId}/status`)
                .set(auth(oToken))
                .send({ status: "playing" })
                .expect(200);
            await request(app)
                .patch(`/api/matches/${mId}/status`)
                .set(auth(oToken))
                .send({ status: "finished" })
                .expect(200);
            await request(app).patch(`/api/matches/${mId}/lock`).set(auth(oToken)).expect(200);

            await request(app)
                .patch(`/api/matches/${mId}`)
                .set(auth(oToken))
                .send({ location: "Locked Location" })
                .expect(403);
        });
    });
});
