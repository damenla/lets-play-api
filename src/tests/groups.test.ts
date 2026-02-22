import type { Application } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("Groups API - Comprehensive Suite", () => {
    let app: Application;

    beforeEach(async () => {
        process.env.JWT_SECRET = "test-secret";
        app = createApp(true);
    });

    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    const createTestUser = async (u: string) => {
        await request(app)
            .post("/api/auth/register")
            .send({
                username: u,
                email: `${u}@test.com`,
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

    describe("1. Group Creation (POST /api/groups)", () => {
        it("should create a group successfully and assign creator as accepted owner", async () => {
            const creatorUser = await createTestUser("creator");
            const newGroup = {
                name: "My Awesome Group",
                description: "This is a test group"
            };

            // Create the group
            const groupResp = await request(app)
                .post("/api/groups")
                .set(auth(creatorUser.token))
                .send(newGroup)
                .expect(201);

            // Verify the group was created successfully
            expect(groupResp.body).toHaveProperty("id");
            expect(groupResp.body.name).toBe(newGroup.name);
            expect(groupResp.body.description).toBe(newGroup.description);
            expect(groupResp.body.isActive).toBe(true);
            expect(groupResp.body.createdAt).toBeDefined();
            expect(groupResp.body.updatedAt).toBeDefined();

            // Members verifications
            const membersResp = await request(app)
                .get(`/api/groups/${groupResp.body.id}/members`)
                .set(auth(creatorUser.token))
                .expect(200);
            const members = membersResp.body;

            // Verify only one member is in the group members list
            expect(members).toHaveLength(1);

            // Verify the creator is an owner in the group members list
            const owner = members.find((m: any) => m.userId === creatorUser.id);
            expect(owner).toBeDefined();
            expect(owner.role).toBe("owner");
            expect(owner.status).toBe("accepted");
        });

        it("should return 401 if token is missing", async () => {
            await request(app).post("/api/groups").send({ name: "Unauthorized Group" }).expect(401);
        });

        it("should return 400 if name is missing", async () => {
            const creatorUser = await createTestUser("c_bad");
            const groupResp = await request(app)
                .post("/api/groups")
                .set(auth(creatorUser.token))
                .send({})
                .expect(400);
            expect(groupResp.body.code).toBe("REQUIRED_FIELD_MISSING");
        });

        it("should return 409 if name already exists", async () => {
            const creatorUser = await createTestUser("c_dup");
            await request(app)
                .post("/api/groups")
                .set(auth(creatorUser.token))
                .send({ name: "Duplicate" })
                .expect(201);

            const duplicatedGroupResp = await request(app)
                .post("/api/groups")
                .set(auth(creatorUser.token))
                .send({ name: "Duplicate" })
                .expect(409);
            expect(duplicatedGroupResp.body.code).toBe("GROUP_NAME_ALREADY_EXISTS");
        });

        it("should return 403 if the user is inactive", async () => {
            const creatorUser = await createTestUser("c_inactive");
            await request(app)
                .patch("/api/users/me")
                .set(auth(creatorUser.token))
                .send({ isActive: false });
            const groupResp = await request(app)
                .post("/api/groups")
                .set(auth(creatorUser.token))
                .send({ name: "Fail" })
                .expect(403);
            expect(groupResp.body.code).toBe("USER_INACTIVE");
        });
    });

    describe("2. Group Retrieval (GET /api/groups)", () => {
        it("should list only groups where user is member or invited", async () => {
            const u1 = await createTestUser("u1");
            const u2 = await createTestUser("u2");
            const g1 = await request(app)
                .post("/api/groups")
                .set(auth(u1.token))
                .send({ name: "Group 1" });
            await request(app).post("/api/groups").set(auth(u2.token)).send({ name: "Group 2" });

            const res = await request(app).get("/api/groups").set(auth(u1.token)).expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(g1.body.id);
        });

        it("should return group details if the user is a member", async () => {
            const u = await createTestUser("u_det");
            const g = await request(app)
                .post("/api/groups")
                .set(auth(u.token))
                .send({ name: "Details" });
            const res = await request(app)
                .get(`/api/groups/${g.body.id}`)
                .set(auth(u.token))
                .expect(200);
            expect(res.body.name).toBe("Details");
        });

        it("should return 404 if group does not exist", async () => {
            const u = await createTestUser("u_404");
            await request(app)
                .get("/api/groups/00000000-0000-0000-0000-000000000000")
                .set(auth(u.token))
                .expect(404);
        });

        it("should return 403 if user is not a member", async () => {
            const u1 = await createTestUser("owner_p");
            const u2 = await createTestUser("outsider_p");
            const g = await request(app)
                .post("/api/groups")
                .set(auth(u1.token))
                .send({ name: "Private" });
            const res = await request(app)
                .get(`/api/groups/${g.body.id}`)
                .set(auth(u2.token))
                .expect(403);
            expect(res.body.code).toBe("NOT_A_GROUP_MEMBER");
        });
    });

    describe("3. Invitations & Membership List", () => {
        let o1: any, u2: any, group: any;

        beforeEach(async () => {
            o1 = await createTestUser("inv_o1");
            u2 = await createTestUser("inv_u2");
            const res = await request(app)
                .post("/api/groups")
                .set(auth(o1.token))
                .send({ name: "Inv" });
            group = res.body;
        });

        it("should allow an owner to invite a user", async () => {
            const res = await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id })
                .expect(201);
            expect(res.body.status).toBe("invited");
        });

        it("should allow a manager to invite a user", async () => {
            // Setup manager
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id });
            await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(u2.token))
                .send({ status: "accepted" });
            await request(app)
                .patch(`/api/groups/${group.id}/members/${u2.id}/role`)
                .set(auth(o1.token))
                .send({ role: "manager" });

            const u3 = await createTestUser("inv_u3");
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(u2.token))
                .send({ userId: u3.id })
                .expect(201);
        });

        it("should return 403 if a member tries to invite", async () => {
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id });
            await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(u2.token))
                .send({ status: "accepted" });

            const u3 = await createTestUser("inv_u3_fail");
            const res = await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(u2.token))
                .send({ userId: u3.id })
                .expect(403);
            expect(res.body.code).toBe("INSUFFICIENT_PERMISSIONS");
        });

        it("should return 409 if user is already in group", async () => {
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id })
                .expect(201);
            const res = await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id })
                .expect(409);
            expect(res.body.code).toBe("USER_ALREADY_IN_GROUP");
        });

        it("should allow a user to accept their invitation", async () => {
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id });
            const res = await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(u2.token))
                .send({ status: "accepted" })
                .expect(200);
            expect(res.body.status).toBe("accepted");
        });

        it("should return 409 if accepting an already processed invitation", async () => {
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id });
            await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(u2.token))
                .send({ status: "accepted" });
            const res = await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(u2.token))
                .send({ status: "accepted" })
                .expect(409);
            expect(res.body.code).toBe("ALREADY_PROCESSED");
        });

        it("should return 403 if another user tries to manage invitation", async () => {
            const hacker = await createTestUser("hacker");
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: u2.id });
            const res = await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(hacker.token))
                .send({ status: "accepted" })
                .expect(403);
            expect(res.body.code).toBe("NO_INVITATION_FOUND");
        });
    });

    describe("4. Administrative Governance (Seniority & Roles)", () => {
        let o1: any, o2: any, o3: any, m1: any, group: any;

        beforeEach(async () => {
            o1 = await createTestUser("admin_o1"); // Oldest
            o2 = await createTestUser("admin_o2");
            o3 = await createTestUser("admin_o3");
            m1 = await createTestUser("admin_m1");

            const res = await request(app)
                .post("/api/groups")
                .set(auth(o1.token))
                .send({ name: "Hierarchy" });
            group = res.body;

            const setupOwner = async (u: any) => {
                await request(app)
                    .post(`/api/groups/${group.id}/members`)
                    .set(auth(o1.token))
                    .send({ userId: u.id });
                await request(app)
                    .patch(`/api/groups/${group.id}/invitations`)
                    .set(auth(u.token))
                    .send({ status: "accepted" });
                await request(app)
                    .patch(`/api/groups/${group.id}/members/${u.id}/role`)
                    .set(auth(o1.token))
                    .send({ role: "owner" });
            };
            await setupOwner(o2);
            await setupOwner(o3);

            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(o1.token))
                .send({ userId: m1.id });
            await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(m1.token))
                .send({ status: "accepted" });
        });

        it("should allow any owner to promote a member to manager", async () => {
            const res = await request(app)
                .patch(`/api/groups/${group.id}/members/${m1.id}/role`)
                .set(auth(o3.token))
                .send({ role: "manager" })
                .expect(200);
            expect(res.body.role).toBe("manager");
        });

        it("should allow only oldest owner to demote other owners", async () => {
            // o2 tries to demote o3 (Fail because o1 is oldest and active)
            const res = await request(app)
                .patch(`/api/groups/${group.id}/members/${o3.id}/role`)
                .set(auth(o2.token))
                .send({ role: "manager" })
                .expect(403);
            expect(res.body.code).toBe("ONLY_OLDEST_OWNER_CAN_DEMOTE_OWNERS");

            // o1 demotes o2 (Success)
            await request(app)
                .patch(`/api/groups/${group.id}/members/${o2.id}/role`)
                .set(auth(o1.token))
                .send({ role: "manager" })
                .expect(200);
        });

        it("should allow demotion by the new oldest if previous one leaves", async () => {
            await request(app)
                .delete(`/api/groups/${group.id}/members/me`)
                .set(auth(o1.token))
                .expect(204);
            // Now o2 is oldest, should be able to demote o3
            await request(app)
                .patch(`/api/groups/${group.id}/members/${o3.id}/role`)
                .set(auth(o2.token))
                .send({ role: "manager" })
                .expect(200);
        });

        it("should return 400 when demoting the last owner", async () => {
            await request(app).delete(`/api/groups/${group.id}/members/me`).set(auth(o2.token));
            await request(app).delete(`/api/groups/${group.id}/members/me`).set(auth(o3.token));
            const res = await request(app)
                .patch(`/api/groups/${group.id}/members/${o1.id}/role`)
                .set(auth(o1.token))
                .send({ role: "manager" })
                .expect(400);
            expect(res.body.code).toBe("MINIMUM_OWNER_REQUIRED");
        });

        it("should return 400 for invalid role", async () => {
            await request(app)
                .patch(`/api/groups/${group.id}/members/${m1.id}/role`)
                .set(auth(o1.token))
                .send({ role: "god" })
                .expect(400);
        });
    });

    describe("5. Group Status (Deactivation/Reactivation)", () => {
        let o1: any, o2: any, o3: any, group: any;

        beforeEach(async () => {
            o1 = await createTestUser("status_o1");
            o2 = await createTestUser("status_o2");
            o3 = await createTestUser("status_o3");
            const res = await request(app)
                .post("/api/groups")
                .set(auth(o1.token))
                .send({ name: "Status Group" });
            group = res.body;

            const makeOwner = async (u: any) => {
                await request(app)
                    .post(`/api/groups/${group.id}/members`)
                    .set(auth(o1.token))
                    .send({ userId: u.id });
                await request(app)
                    .patch(`/api/groups/${group.id}/invitations`)
                    .set(auth(u.token))
                    .send({ status: "accepted" });
                await request(app)
                    .patch(`/api/groups/${group.id}/members/${u.id}/role`)
                    .set(auth(o1.token))
                    .send({ role: "owner" });
            };
            await makeOwner(o2);
            await makeOwner(o3);
        });

        it("should allow only oldest owner to deactivate group", async () => {
            // o2 fails (joined second)
            const res2 = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(o2.token))
                .send({ isActive: false })
                .expect(403);
            expect(res2.body.code).toBe("ONLY_OLDEST_OWNER_CAN_DEACTIVATE_GROUP");

            // o1 succeeds (the creator/oldest)
            const res1 = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(o1.token))
                .send({ isActive: false })
                .expect(200);
            expect(res1.body.isActive).toBe(false);
        });

        it("should allow any active owner to reactivate group", async () => {
            await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(o1.token))
                .send({ isActive: false })
                .expect(200);
            // o3 (the newest owner) reactivates
            const res = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(o3.token))
                .send({ isActive: true })
                .expect(200);
            expect(res.body.isActive).toBe(true);
        });

        it("should shift deactivation power if the oldest owner leaves", async () => {
            // o1 leaves
            await request(app)
                .delete(`/api/groups/${group.id}/members/me`)
                .set(auth(o1.token))
                .expect(204);

            // o3 still fails (o2 is now the oldest)
            await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(o3.token))
                .send({ isActive: false })
                .expect(403);

            // o2 succeeds
            const res = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(o2.token))
                .send({ isActive: false })
                .expect(200);
            expect(res.body.isActive).toBe(false);
        });
    });

    describe("6. Leaving Group (DELETE /api/groups/:id/members/me)", () => {
        it("should allow a regular member to leave", async () => {
            const o = await createTestUser("leave_o");
            const m = await createTestUser("leave_m");
            const g = await request(app)
                .post("/api/groups")
                .set(auth(o.token))
                .send({ name: "Leave Group" });

            await request(app)
                .post(`/api/groups/${g.body.id}/members`)
                .set(auth(o.token))
                .send({ userId: m.id });
            await request(app)
                .patch(`/api/groups/${g.body.id}/invitations`)
                .set(auth(m.token))
                .send({ status: "accepted" });

            await request(app)
                .delete(`/api/groups/${g.body.id}/members/me`)
                .set(auth(m.token))
                .expect(204);

            const members = await request(app)
                .get(`/api/groups/${g.body.id}/members`)
                .set(auth(o.token));
            expect(members.body.find((mb: any) => mb.userId === m.id)).toBeUndefined();
        });

        it("should return 400 when the last owner tries to leave", async () => {
            const o = await createTestUser("leave_last");
            const g = await request(app)
                .post("/api/groups")
                .set(auth(o.token))
                .send({ name: "Last Owner" });
            const res = await request(app)
                .delete(`/api/groups/${g.body.id}/members/me`)
                .set(auth(o.token))
                .expect(400);
            expect(res.body.code).toBe("MINIMUM_OWNER_REQUIRED");
        });
    });

    describe("7. Group Metadata Update (PATCH /api/groups/:id)", () => {
        let owner: any, manager: any, group: any;

        beforeEach(async () => {
            owner = await createTestUser("meta_o");
            manager = await createTestUser("meta_m");
            const res = await request(app).post("/api/groups").set(auth(owner.token)).send({
                name: "Original Name",
                description: "Original Description"
            });
            group = res.body;

            // Setup manager
            await request(app)
                .post(`/api/groups/${group.id}/members`)
                .set(auth(owner.token))
                .send({ userId: manager.id });
            await request(app)
                .patch(`/api/groups/${group.id}/invitations`)
                .set(auth(manager.token))
                .send({ status: "accepted" });
            await request(app)
                .patch(`/api/groups/${group.id}/members/${manager.id}/role`)
                .set(auth(owner.token))
                .send({ role: "manager" });
        });

        it("should allow an owner to update name and description", async () => {
            const res = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(owner.token))
                .send({ name: "New Name", description: "New Description" })
                .expect(200);

            expect(res.body.name).toBe("New Name");
            expect(res.body.description).toBe("New Description");
        });

        it("should return 403 if a manager tries to update name or description", async () => {
            const res = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(manager.token))
                .send({ name: "Hacker Name" })
                .expect(403);

            expect(res.body.code).toBe("ONLY_OWNER_CAN_EDIT_METADATA");
        });

        it("should return 409 if updating to a name that already exists", async () => {
            // Create another group
            await request(app)
                .post("/api/groups")
                .set(auth(owner.token))
                .send({ name: "Other Group" });

            const res = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(owner.token))
                .send({ name: "Other Group" })
                .expect(409);

            expect(res.body.code).toBe("GROUP_NAME_ALREADY_EXISTS");
        });

        it("should allow updating description without changing name", async () => {
            const res = await request(app)
                .patch(`/api/groups/${group.id}`)
                .set(auth(owner.token))
                .send({ description: "Just description update" })
                .expect(200);

            expect(res.body.name).toBe("Original Name");
            expect(res.body.description).toBe("Just description update");
        });
    });
});
