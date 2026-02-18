import { createApp } from "./app";
import { connectDatabase } from "./infrastructure/database/connection";

const PORT = process.env.PORT || 3000;
const IN_MEMORY_DATA: boolean = process.env.IN_MEMORY_DATA === "true";

async function startServer() {
    try {
        if (!IN_MEMORY_DATA) {
            await connectDatabase();
        }

        const app = createApp(IN_MEMORY_DATA);

        app.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("🧨 Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
