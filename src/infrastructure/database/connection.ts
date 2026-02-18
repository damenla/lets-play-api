import { Pool, type PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const config: PoolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "lets_play_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "10000"),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "2000")
};

export const pool = new Pool(config);

export const connectDatabase = async (): Promise<void> => {
    try {
        await pool.connect();
        console.log("✅ Database connection established successfully.");
    } catch (error) {
        console.error("🧨 Unable to connect to the database:", error);
        throw error;
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await pool.end();
        console.log("✅ Database connection closed successfully.");
    } catch (error) {
        console.error("🧨 Unable to close the database connection:", error);
        throw error;
    }
};
