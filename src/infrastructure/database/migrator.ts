import { pool } from "./connection";
import fs from "fs/promises";
import path from "path";

export class DatabaseMigrator {
    private migrationsPath = path.join(__dirname, "migrations");

    async createMigrationsTable(): Promise<void> {
        const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

        await pool.query(query);
    }

    async getExecutedMigrations(): Promise<string[]> {
        const result = await pool.query("SELECT filename FROM migrations ORDER BY id");
        return result.rows.map((row) => row.filename);
    }

    async executeMigration(filename: string): Promise<void> {
        const migrationPath = path.join(this.migrationsPath, filename);
        const sql = await fs.readFile(migrationPath, "utf-8");

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query("INSERT INTO migrations (filename) VALUES ($1)", [filename]);
            await client.query("COMMIT");
            console.log(`✅ Migration ${filename} executed successfully`);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async runMigrations(): Promise<void> {
        await this.createMigrationsTable();

        const executedMigrations = await this.getExecutedMigrations();
        const migrationFiles = await fs.readdir(this.migrationsPath);
        const sqlMigrations = migrationFiles.filter((file) => file.endsWith(".sql")).sort();

        for (const filename of sqlMigrations) {
            if (!executedMigrations.includes(filename)) {
                await this.executeMigration(filename);
            } else {
                console.log(`⏩ Migration ${filename} already executed`);
            }
        }

        console.log("🎯 All migrations completed");
    }
}
