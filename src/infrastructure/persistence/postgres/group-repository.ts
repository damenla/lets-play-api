import type { Pool } from "pg";
import type { Group, GroupMember, GroupMemberRole, GroupMemberStatus } from "../../../types/group";
import type { IGroupRepository } from "../group-repository";

export class PostgresGroupRepository implements IGroupRepository {
    constructor(private readonly pool: Pool) {}

    async create(group: Group): Promise<Group> {
        const query = `
            INSERT INTO groups (
                id, name, description, is_active, created_at, updated_at,
                merit_config_max_matches, merit_points_played, merit_points_no_show,
                merit_points_reserve, merit_points_positive_attitude,
                merit_points_negative_attitude, merit_config_hours_before_penalty,
                merit_points_late_cancel
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;
        const values = [
            group.id,
            group.name,
            group.description,
            group.isActive,
            group.createdAt,
            group.updatedAt,
            group.meritConfigMaxMatches,
            group.meritPointsPlayed,
            group.meritPointsNoShow,
            group.meritPointsReserve,
            group.meritPointsPositiveAttitude,
            group.meritPointsNegativeAttitude,
            group.meritConfigHoursBeforePenalty,
            group.meritPointsLateCancel
        ];

        const { rows } = await this.pool.query(query, values);
        return this.mapRowToGroup(rows[0]);
    }

    async update(group: Group): Promise<Group> {
        const query = `
            UPDATE groups
            SET name = $2, description = $3, is_active = $4, updated_at = $5,
                merit_config_max_matches = $6, merit_points_played = $7, merit_points_no_show = $8,
                merit_points_reserve = $9, merit_points_positive_attitude = $10,
                merit_points_negative_attitude = $11, merit_config_hours_before_penalty = $12,
                merit_points_late_cancel = $13
            WHERE id = $1
            RETURNING *
        `;
        const values = [
            group.id,
            group.name,
            group.description,
            group.isActive,
            group.updatedAt,
            group.meritConfigMaxMatches,
            group.meritPointsPlayed,
            group.meritPointsNoShow,
            group.meritPointsReserve,
            group.meritPointsPositiveAttitude,
            group.meritPointsNegativeAttitude,
            group.meritConfigHoursBeforePenalty,
            group.meritPointsLateCancel
        ];

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
        if (!id || typeof id !== "string" || id === "undefined") return null;
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
        return rows.map((row) => this.mapRowToGroup(row));
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
        return rows.map((row) => this.mapRowToMember(row));
    }

    async findMember(groupId: string, userId: string): Promise<GroupMember | null> {
        if (!groupId || groupId === "undefined" || !userId || userId === "undefined") return null;
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
            updatedAt: new Date(row.updated_at),
            meritConfigMaxMatches: row.merit_config_max_matches,
            meritPointsPlayed: row.merit_points_played,
            meritPointsNoShow: row.merit_points_no_show,
            meritPointsReserve: row.merit_points_reserve,
            meritPointsPositiveAttitude: row.merit_points_positive_attitude,
            meritPointsNegativeAttitude: row.merit_points_negative_attitude,
            meritConfigHoursBeforePenalty: row.merit_config_hours_before_penalty,
            meritPointsLateCancel: row.merit_points_late_cancel
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
