import { Router } from "express";
import { GetUserByIdUseCase } from "../../../domain/use-cases/get-user-by-id";
import { UpdatePasswordUseCase } from "../../../domain/use-cases/update-password";
import { UpdateUserUseCase } from "../../../domain/use-cases/update-user";
import { IUserRepository } from "../../persistence/user-repository";
import { BcryptPasswordHasher } from "../../security/bcrypt-hasher";
import { JwtService } from "../../security/jwt-service";
import { UserController } from "../controllers/user-controller";
import { createAuthMiddleware } from "../middleware/auth";

export function createUserRouter(userRepository: IUserRepository): Router {
    const router = Router();

    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtService();

    const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, passwordHasher);

    const userController = new UserController(
        getUserByIdUseCase,
        updateUserUseCase,
        updatePasswordUseCase
    );

    // Protected routes follow
    router.use(createAuthMiddleware(tokenService, userRepository));

    router.get("/:id", (req, res) => userController.getUserById(req, res));
    router.patch("/:id", (req, res) => userController.updateUser(req, res));
    router.patch("/:id/password", (req, res) => userController.updatePassword(req, res));

    return router;
}
