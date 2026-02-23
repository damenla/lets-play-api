import { DatabaseMigrator } from "../src/infrastructure/database/migrator";
import {
    connectDatabase,
    disconnectDatabase,
    ensureDatabaseExists
} from "../src/infrastructure/database/connection";

async function runMigrations() {
    try {
        console.log("🚀 Starting database migrations...");

        await ensureDatabaseExists();
        await connectDatabase();

        const migrator = new DatabaseMigrator();
        await migrator.runMigrations();

        console.log("✅ Database migrations completed successfully");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await disconnectDatabase();
    }
}

runMigrations();
