import type { Pool } from "pg";
import type {
    Match,
    MatchRegistration,
    SportType,
    MatchStatus,
    PlayerAttitude,
    RGB
} from "../../../types/match";
import type { IMatchRepository } from "../match-repository";

export class PostgresMatchRepository implements IMatchRepository {
    constructor(private readonly pool: Pool) {}

    async create(match: Match): Promise<Match> {
        const query = `
            INSERT INTO matches (
                id, group_id, sport, scheduled_at, duration_minutes, capacity,
                location, status, is_locked, team_a_color, team_b_color,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const values = [
            match.id,
            match.groupId,
            match.sport,
            match.scheduledAt,
            match.durationMinutes,
            match.capacity,
            match.location,
            match.status,
            match.isLocked,
            this.rgbToHex(match.teamAColor),
            this.rgbToHex(match.teamBColor),
            match.createdAt,
            match.updatedAt
        ];

        const { rows } = await this.pool.query(query, values);
        return this.mapRowToMatch(rows[0]);
    }

    async update(match: Match): Promise<Match> {
        const query = `
            UPDATE matches
            SET sport = $2, scheduled_at = $3, duration_minutes = $4, capacity = $5,
                location = $6, status = $7, is_locked = $8, team_a_color = $9,
                team_b_color = $10, updated_at = $11
            WHERE id = $1
            RETURNING *
        `;
        const values = [
            match.id,
            match.sport,
            match.scheduledAt,
            match.durationMinutes,
            match.capacity,
            match.location,
            match.status,
            match.isLocked,
            this.rgbToHex(match.teamAColor),
            this.rgbToHex(match.teamBColor),
            match.updatedAt
        ];

        const { rows } = await this.pool.query(query, values);
        if (rows.length === 0) throw new Error("MATCH_NOT_FOUND");
        return this.mapRowToMatch(rows[0]);
    }

    async findById(id: string): Promise<Match | null> {
        if (!id || id === "undefined") return null;
        const query = "SELECT * FROM matches WHERE id = $1";
        const { rows } = await this.pool.query(query, [id]);
        return rows.length ? this.mapRowToMatch(rows[0]) : null;
    }

    async findByGroupId(groupId: string): Promise<Match[]> {
        if (!groupId || groupId === "undefined") return [];
        const query = "SELECT * FROM matches WHERE group_id = $1 ORDER BY scheduled_at DESC";
        const { rows } = await this.pool.query(query, [groupId]);
        return rows.map((row) => this.mapRowToMatch(row));
    }

    async addRegistration(registration: MatchRegistration): Promise<void> {
        const query = `
            INSERT INTO match_registrations (
                match_id, user_id, registered_at, is_reserve, did_play, attitude, is_late_cancellation
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
            registration.matchId,
            registration.userId,
            registration.registeredAt,
            registration.isReserve,
            registration.didPlay,
            registration.attitude,
            registration.isLateCancellation
        ];
        await this.pool.query(query, values);
    }

    async updateRegistration(registration: MatchRegistration): Promise<void> {
        const query = `
            UPDATE match_registrations
            SET is_reserve = $3, did_play = $4, attitude = $5, is_late_cancellation = $6
            WHERE match_id = $1 AND user_id = $2
        `;
        const values = [
            registration.matchId,
            registration.userId,
            registration.isReserve,
            registration.didPlay,
            registration.attitude,
            registration.isLateCancellation
        ];
        await this.pool.query(query, values);
    }

    async removeRegistration(matchId: string, userId: string): Promise<void> {
        const query = "DELETE FROM match_registrations WHERE match_id = $1 AND user_id = $2";
        await this.pool.query(query, [matchId, userId]);
    }

    async findRegistrationsByMatchId(matchId: string): Promise<MatchRegistration[]> {
        const query =
            "SELECT * FROM match_registrations WHERE match_id = $1 ORDER BY registered_at ASC";
        const { rows } = await this.pool.query(query, [matchId]);
        return rows.map((row) => this.mapRowToRegistration(row));
    }

    async findRegistration(matchId: string, userId: string): Promise<MatchRegistration | null> {
        const query = "SELECT * FROM match_registrations WHERE match_id = $1 AND user_id = $2";
        const { rows } = await this.pool.query(query, [matchId, userId]);
        return rows.length ? this.mapRowToRegistration(rows[0]) : null;
    }

    async findLastMatchesByGroupId(groupId: string, limit: number): Promise<Match[]> {
        const query = `
            SELECT * FROM matches 
            WHERE group_id = $1 AND status = 'finished' 
            ORDER BY scheduled_at DESC 
            LIMIT $2
        `;
        const { rows } = await this.pool.query(query, [groupId, limit]);
        return rows.map((row) => this.mapRowToMatch(row));
    }

    async findRegistrationsByUserInGroupsMatches(
        userId: string,
        matchIds: string[]
    ): Promise<MatchRegistration[]> {
        if (matchIds.length === 0) return [];
        const query = `
            SELECT * FROM match_registrations 
            WHERE user_id = $1 AND match_id = ANY($2)
        `;
        const { rows } = await this.pool.query(query, [userId, matchIds]);
        return rows.map((row) => this.mapRowToRegistration(row));
    }

    private mapRowToMatch(row: any): Match {
        return {
            id: row.id,
            groupId: row.group_id,
            sport: row.sport as SportType,
            scheduledAt: new Date(row.scheduled_at),
            durationMinutes: row.duration_minutes,
            capacity: row.capacity,
            location: row.location,
            status: row.status as MatchStatus,
            isLocked: row.is_locked,
            teamAColor: this.hexToRgb(row.team_a_color),
            teamBColor: this.hexToRgb(row.team_b_color),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    private mapRowToRegistration(row: any): MatchRegistration {
        return {
            matchId: row.match_id,
            userId: row.user_id,
            registeredAt: new Date(row.registered_at),
            isReserve: row.is_reserve,
            didPlay: row.did_play === null ? undefined : row.did_play,
            attitude: row.attitude as PlayerAttitude,
            isLateCancellation: row.is_late_cancellation
        };
    }

    private rgbToHex(rgb: RGB): string {
        const toHex = (c: number) =>
            Math.round(c * 255)
                .toString(16)
                .padStart(2, "0");
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
    }

    private hexToRgb(hex: string): RGB {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return { r, g, b };
    }
}
