import express, { type Application } from "express";
import { createUserRouter } from "./infrastructure/transport/routes/user-routes";

export function createApp(): Application {
    const app = express();

    app.use(express.json());

    app.use("/api/users", createUserRouter());

    return app;
}
