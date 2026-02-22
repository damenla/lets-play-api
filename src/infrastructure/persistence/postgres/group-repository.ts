import type { Pool } from "pg";
import type { Group, GroupMember, GroupMemberRole, GroupMemberStatus } from "../../../types/group";
import type { IGroupRepository } from "../group-repository";

export class PostgresGroupRepository implements IGroupRepository {
    constructor(private readonly pool: Pool) {}

    async create(group: Group): Promise<Group> {
        const query = `
            INSERT INTO groups (id, name, description, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            group.id,
            group.name,
            group.description,
            group.isActive,
            group.createdAt,
            group.updatedAt
        ];

        const { rows } = await this.pool.query(query, values);
        return this.mapRowToGroup(rows[0]);
    }

    async update(group: Group): Promise<Group> {
        const query = `
            UPDATE groups
            SET name = $2, description = $3, is_active = $4, updated_at = $5
            WHERE id = $1
            RETURNING *
        `;
        const values = [group.id, group.name, group.description, group.isActive, group.updatedAt];

        const { rows } = await this.pool.query(query, values);
        if (rows.length === 0) {
            throw new Error("GROUP_NOT_FOUND");
        }
        return this.mapRowToGroup(rows[0]);
    }

    async findByName(name: string): Promise<Group | null> {
        const query = "SELECT * FROM groups WHERE name = $1";
        const { rows } = await this.pool.query(query, [name]);

        if (rows.length === 0) {
            return null;
        }

        return this.mapRowToGroup(rows[0]);
    }

    async findById(id: string): Promise<Group | null> {
        const query = "SELECT * FROM groups WHERE id = $1";
        const { rows } = await this.pool.query(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return this.mapRowToGroup(rows[0]);
    }

    async findByUserId(userId: string): Promise<Group[]> {
        const query = `
            SELECT g.*
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1
        `;
        const { rows } = await this.pool.query(query, [userId]);
        return rows.map(this.mapRowToGroup);
    }

    async addMember(member: GroupMember): Promise<void> {
        const query = `
            INSERT INTO group_members (group_id, user_id, status, role, status_updated_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
            member.groupId,
            member.userId,
            member.status,
            member.role,
            member.statusUpdatedAt,
            member.createdAt,
            member.updatedAt
        ];

        try {
            await this.pool.query(query, values);
        } catch (error: any) {
            if (error.code === "23505") {
                // Unique violation
                throw new Error("MEMBER_ALREADY_EXISTS");
            }
            throw error;
        }
    }

    async updateMember(member: GroupMember): Promise<void> {
        const query = `
            UPDATE group_members
            SET status = $3, role = $4, status_updated_at = $5, updated_at = $6
            WHERE group_id = $1 AND user_id = $2
        `;
        const values = [
            member.groupId,
            member.userId,
            member.status,
            member.role,
            member.statusUpdatedAt,
            member.updatedAt
        ];

        const { rowCount } = await this.pool.query(query, values);
        if (rowCount === 0) {
            throw new Error("MEMBER_NOT_FOUND");
        }
    }

    async removeMember(groupId: string, userId: string): Promise<void> {
        const query = "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2";
        await this.pool.query(query, [groupId, userId]);
    }

    async findMembersByGroupId(groupId: string): Promise<GroupMember[]> {
        const query = "SELECT * FROM group_members WHERE group_id = $1";
        const { rows } = await this.pool.query(query, [groupId]);
        return rows.map(this.mapRowToMember);
    }

    async findMember(groupId: string, userId: string): Promise<GroupMember | null> {
        const query = "SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2";
        const { rows } = await this.pool.query(query, [groupId, userId]);

        if (rows.length === 0) {
            return null;
        }

        return this.mapRowToMember(rows[0]);
    }

    private mapRowToGroup(row: any): Group {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            isActive: row.is_active,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    private mapRowToMember(row: any): GroupMember {
        return {
            groupId: row.group_id,
            userId: row.user_id,
            status: row.status as GroupMemberStatus,
            role: row.role as GroupMemberRole,
            statusUpdatedAt: new Date(row.status_updated_at),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
