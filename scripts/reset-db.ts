import {
    connectDatabase,
    disconnectDatabase,
    ensureDatabaseExists,
    pool
} from "../src/infrastructure/database/connection";

async function resetDatabase() {
    try {
        console.log("🗑️  Starting database reset...");

        await ensureDatabaseExists();
        await connectDatabase();

        // Drop all tables in reverse order (due to constraints)
        await pool.query("DROP TABLE IF EXISTS match_registrations CASCADE;");
        await pool.query("DROP TABLE IF EXISTS matches CASCADE;");
        await pool.query("DROP TABLE IF EXISTS group_members CASCADE;");
        await pool.query("DROP TABLE IF EXISTS groups CASCADE;");
        await pool.query("DROP TABLE IF EXISTS users CASCADE;");
        await pool.query("DROP TABLE IF EXISTS migrations CASCADE;");

        console.log("✅ Database reset completed successfully");
        console.log('💡 Run "npm run db:migrate" to recreate the schema');
    } catch (error) {
        console.error("❌ Database reset failed:", error);
        process.exitCode = 1;
    } finally {
        await disconnectDatabase();
    }
}

resetDatabase();
