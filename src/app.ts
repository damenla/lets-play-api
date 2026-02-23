import express, { type Application } from "express";
import { pool } from "./infrastructure/database/connection";
import { InMemoryGroupRepository } from "./infrastructure/persistence/in-memory/group-repository";
import { InMemoryMatchRepository } from "./infrastructure/persistence/in-memory/match-repository";
import { InMemoryUserRepository } from "./infrastructure/persistence/in-memory/user-repository";
import { PostgresGroupRepository } from "./infrastructure/persistence/postgres/group-repository";
import { PostgresMatchRepository } from "./infrastructure/persistence/postgres/match-repository";
import { PostgresUserRepository } from "./infrastructure/persistence/postgres/user-repository";
import { requestLogger } from "./infrastructure/transport/middleware/request-logger";
import { createAuthRouter } from "./infrastructure/transport/routes/auth-routes";
import { createGroupRouter } from "./infrastructure/transport/routes/group-routes";
import { createMatchRouter } from "./infrastructure/transport/routes/match-routes";
import { createUserRouter } from "./infrastructure/transport/routes/user-routes";

export function createApp(inMemoryData: boolean): Application {
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    if (inMemoryData) {
        console.log("📦 Persistence Mode: IN-MEMORY");
    } else {
        console.log("🗄️  Persistence Mode: POSTGRESQL");
    }

    const userRepository = inMemoryData
        ? new InMemoryUserRepository()
        : new PostgresUserRepository(pool);

    const groupRepository = inMemoryData
        ? new InMemoryGroupRepository()
        : new PostgresGroupRepository(pool);

    const matchRepository = inMemoryData
        ? new InMemoryMatchRepository()
        : new PostgresMatchRepository(pool);

    app.use("/api/auth", createAuthRouter(userRepository));
    app.use("/api/users", createUserRouter(userRepository));
    app.use("/api/groups", createGroupRouter(groupRepository, matchRepository, userRepository));
    app.use("/api/matches", createMatchRouter(matchRepository, groupRepository, userRepository));

    return app;
}
