import { Router } from "express";
import { CreateUserUseCase } from "../../../domain/use-cases/create-user";
import { GetUserByIdUseCase } from "../../../domain/use-cases/get-user-by-id";
import { UpdateUserUseCase } from "../../../domain/use-cases/update-user";
import { InMemoryUserRepository } from "../../persistence/in-memory/user-repository";
import { PostgresUserRepository } from "../../persistence/postgres/user-repository";
import { UserController } from "../controllers/user-controller";
import { authMiddleware } from "../middleware/auth";

export function createUserRouter(inMemoryData: boolean): Router {
    const router = Router();

    const userRepository = inMemoryData
        ? new InMemoryUserRepository()
        : new PostgresUserRepository();

    const userCreateUseCase = new CreateUserUseCase(userRepository);
    const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);

    const userController = new UserController(
        userCreateUseCase,
        getUserByIdUseCase,
        updateUserUseCase
    );

    router.post("/", (req, res) => userController.createUser(req, res));
    router.get("/:id", (req, res) => userController.getUserById(req, res));
    router.patch("/:id", (req, res) => userController.updateUser(req, res));

    router.get("/test/protected", authMiddleware, (_req, res) => {
        res.status(200).json({ message: "Secret content" });
    });

    return router;
}
