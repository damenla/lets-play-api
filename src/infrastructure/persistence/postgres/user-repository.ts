import { pool } from "../../database/connection";
import type { IUserRepository } from "../user-repository";
import type { User } from "../../../types/user";

export class PostgresUserRepository implements IUserRepository {
    async create(user: User, passwordHash: string): Promise<User> {
        const query = `
            INSERT INTO users (id, username, email, name, password, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const now = new Date();
        const values = [
            user.id,
            user.username,
            user.email,
            user.name,
            passwordHash,
            user.isActive,
            now,
            now
        ];

        const result = await pool.query(query, values);
        return this.mapRowToUser(result.rows[0]);
    }

    async findByEmail(email: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToUser(result.rows[0]);
    }

    async findByUsername(username: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE username = $1";
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToUser(result.rows[0]);
    }

    async findById(id: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToUser(result.rows[0]);
    }

    async update(id: string, user: Partial<User>): Promise<User | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (user.username !== undefined) {
            fields.push(`username = $${paramIndex++}`);
            values.push(user.username);
        }
        if (user.email !== undefined) {
            fields.push(`email = $${paramIndex++}`);
            values.push(user.email);
        }
        if (user.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(user.name);
        }
        if (user.isActive !== undefined) {
            fields.push(`is_active = $${paramIndex++}`);
            values.push(user.isActive);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        // Always update updated_at
        fields.push(`updated_at = $${paramIndex++}`);
        values.push(new Date());

        values.push(id);
        const query = `
            UPDATE users
            SET ${fields.join(", ")}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToUser(result.rows[0]);
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        const query = "UPDATE users SET password = $1, updated_at = $2 WHERE id = $3";
        await pool.query(query, [passwordHash, new Date(), id]);
    }

    async getPasswordHash(id: string): Promise<string | null> {
        const query = "SELECT password FROM users WHERE id = $1";
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].password;
    }

    private mapRowToUser(row: any): User {
        return {
            id: row.id,
            username: row.username,
            email: row.email,
            name: row.name,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
