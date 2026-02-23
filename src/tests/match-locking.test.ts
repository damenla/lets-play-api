import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { clearDatabase } from "./db-utils";

describe("Matches API - Locking Logic", () => {
    let app: Application;
    let oToken: string, mToken: string;
    let oId: string, mId: string;
    let groupId: string;

    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    beforeEach(async () => {
        await clearDatabase();
        process.env.JWT_SECRET = "lock-secret";
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
            return { id: profile.body.id, token };
        };

        const uO = await setupUser("owner");
        oId = uO.id;
        oToken = uO.token;
        const uM = await setupUser("member");
        mId = uM.id;
        mToken = uM.token;

        const gRes = await request(app)
            .post("/api/groups")
            .set(auth(oToken))
            .send({ name: "Lock Group" });
        groupId = gRes.body.id;

        await request(app)
            .post(`/api/groups/${groupId}/members`)
            .set(auth(oToken))
            .send({ userId: mId });
        await request(app)
            .patch(`/api/groups/${groupId}/invitations`)
            .set(auth(mToken))
            .send({ status: "accepted" });
    });

    describe("PATCH /api/matches/:id/lock", () => {
        it("should allow owner to lock a finished match", async () => {
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
            const mIdMatch = match.body.id;

            await request(app)
                .patch(`/api/matches/${mIdMatch}/status`)
                .set(auth(oToken))
                .send({ status: "playing" });
            await request(app)
                .patch(`/api/matches/${mIdMatch}/status`)
                .set(auth(oToken))
                .send({ status: "finished" });

            await request(app).patch(`/api/matches/${mIdMatch}/lock`).set(auth(oToken)).expect(200);
        });

        it("should return 400 if trying to lock a non-finished match", async () => {
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

            await request(app)
                .patch(`/api/matches/${match.body.id}/lock`)
                .set(auth(oToken))
                .expect(400); // Because status is 'planning'
        });

        it("should return 403 if a member tries to lock the match", async () => {
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

            await request(app)
                .patch(`/api/matches/${match.body.id}/lock`)
                .set(auth(mToken))
                .expect(403);
        });

        it("should prevent further evaluations once locked", async () => {
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
            const mIdMatch = match.body.id;
            await request(app).post(`/api/matches/${mIdMatch}/participants`).set(auth(mToken));
            await request(app)
                .patch(`/api/matches/${mIdMatch}/status`)
                .set(auth(oToken))
                .send({ status: "playing" });
            await request(app)
                .patch(`/api/matches/${mIdMatch}/status`)
                .set(auth(oToken))
                .send({ status: "finished" });

            await request(app).patch(`/api/matches/${mIdMatch}/lock`).set(auth(oToken)).expect(200);

            const res = await request(app)
                .patch(`/api/matches/${mIdMatch}/participants/${mId}/evaluation`)
                .set(auth(oToken))
                .send({ didPlay: true })
                .expect(403);

            expect(res.body.code).toBe("MATCH_LOCKED");
        });
    });
});
