import { Router } from "express";
import { CreateUserUseCase } from "../../../domain/use-cases/create-user";
import { GetUserByIdUseCase } from "../../../domain/use-cases/get-user-by-id";
import { InMemoryUserRepository } from "../../persistence/in-memory/user-repository";
import { UserController } from "../controllers/user-controller";

export function createUserRouter(): Router {
    const router = Router();

    const userRepository = new InMemoryUserRepository();
    const userCreateUseCase = new CreateUserUseCase(userRepository);
    const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    const userController = new UserController(userCreateUseCase, getUserByIdUseCase);

    router.post("/", (req, res) => userController.createUser(req, res));
    router.get("/:id", (req, res) => userController.getUserById(req, res));

    return router;
}
