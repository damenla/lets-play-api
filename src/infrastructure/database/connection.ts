import { Pool, type PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const config: PoolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "10000"),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "2000")
};

export const pool = new Pool(config);

export const ensureDatabaseExists = async (): Promise<void> => {
    const dbName = process.env.DB_NAME;
    const adminConfig: PoolConfig = {
        ...config,
        database: "postgres" // Connect to default admin db
    };
    const adminPool = new Pool(adminConfig);

    try {
        const res = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

        if (res.rowCount === 0) {
            console.log(`📡 Database "${dbName}" does not exist. Creating it...`);
            // CREATE DATABASE cannot be run inside a transaction or with parameters in some drivers,
            // but in pg it works like this if not using transactions.
            await adminPool.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database "${dbName}" created successfully.`);
        }
    } catch (error) {
        console.error("🧨 Error ensuring database exists:", error);
        throw error;
    } finally {
        await adminPool.end();
    }
};

export const connectDatabase = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        client.release();
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
