import { createApp } from "./app";
import { connectDatabase } from "./infrastructure/database/connection";
import { DatabaseMigrator } from "./infrastructure/database/migrator";

const PORT = process.env.PORT || 3000;
const IN_MEMORY_DATA: boolean = process.env.IN_MEMORY_DATA === "true";

async function startServer() {
    try {
        if (!IN_MEMORY_DATA) {
            await connectDatabase();
            const migrator = new DatabaseMigrator();
            await migrator.runMigrations();
        }

        const app = createApp(IN_MEMORY_DATA);

        const server = app.listen(Number(PORT), "0.0.0.0", () => {
            const address = server.address();
            const host = typeof address === "string" ? address : address?.address;
            const port = typeof address === "string" ? PORT : address?.port;
            console.log(`🚀 Server is running at http://${host}:${port}`);
        });
    } catch (error) {
        console.error("🧨 Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
