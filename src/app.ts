import express, { type Application } from "express";
import { createUserRouter } from "./infrastructure/transport/routes/user-routes";
import { requestLogger } from "./infrastructure/transport/middleware/request-logger";

export function createApp(): Application {
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    app.use("/api/users", createUserRouter());

    return app;
}
