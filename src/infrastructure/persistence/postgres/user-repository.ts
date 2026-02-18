import { pool } from "../../database/connection";
import type { IUserRepository } from "../user-repository";
import type { User } from "../../../types/user";

export class PostgresUserRepository implements IUserRepository {
    async create(user: User): Promise<User> {
        const query = `
            INSERT INTO users (id, email, name, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const now = new Date();
        const values = [user.id, user.email, user.name, user.isActive, now, now];

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

    private mapRowToUser(row: any): User {
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
