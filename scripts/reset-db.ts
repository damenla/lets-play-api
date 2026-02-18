import {
    connectDatabase,
    disconnectDatabase,
    pool
} from "../src/infrastructure/database/connection";

async function resetDatabase() {
    try {
        console.log("🗑️  Starting database reset...");

        await connectDatabase();

        // Drop all tables in reverse order (due to constraints)
        await pool.query("DROP SEQUENCE IF EXISTS factura_number_seq CASCADE;");
        await pool.query("DROP TABLE IF EXISTS facturas CASCADE;");
        await pool.query("DROP TABLE IF EXISTS migrations CASCADE;");

        console.log("✅ Database reset completed successfully");
        console.log('💡 Run "npm run db:migrate" to recreate the schema');
    } catch (error) {
        console.error("❌ Database reset failed:", error);
        process.exit(1);
    } finally {
        await disconnectDatabase();
    }
}

resetDatabase();
