import express, { type Application } from "express";
import { InMemoryUserRepository } from "./infrastructure/persistence/in-memory/user-repository";
import { PostgresUserRepository } from "./infrastructure/persistence/postgres/user-repository";
import { requestLogger } from "./infrastructure/transport/middleware/request-logger";
import { createAuthRouter } from "./infrastructure/transport/routes/auth-routes";
import { createUserRouter } from "./infrastructure/transport/routes/user-routes";

export function createApp(inMemoryData: boolean): Application {
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    const userRepository = inMemoryData
        ? new InMemoryUserRepository()
        : new PostgresUserRepository();

    app.use("/api/auth", createAuthRouter(userRepository));
    app.use("/api/users", createUserRouter(userRepository));

    return app;
}
