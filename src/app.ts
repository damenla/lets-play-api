import express, { type Application } from "express";
import { createUserRouter } from "./infrastructure/transport/routes/user-routes";
import { requestLogger } from "./infrastructure/transport/middleware/request-logger";

export function createApp(inMemoryData: boolean): Application {
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    app.use("/api/users", createUserRouter(inMemoryData));

    return app;
}
