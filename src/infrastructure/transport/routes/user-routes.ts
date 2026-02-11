import { Router } from "express";
import { CreateUserUseCase } from "../../../domain/use-cases/create-user";
import { InMemoryUserRepository } from "../../persistence/in-memory/user-repository";
import { UserController } from "../controllers/user-controller";

export function createUserRouter(): Router {
    const router = Router();

    const userRepository = new InMemoryUserRepository();
    const userCreateUseCase = new CreateUserUseCase(userRepository);
    const userController = new UserController(userCreateUseCase);

    router.post("/", (req, res) => userController.createUser(req, res));

    return router;
}
