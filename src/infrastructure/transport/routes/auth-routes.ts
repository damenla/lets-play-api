import { Router } from "express";
import { LoginUserUseCase } from "../../../domain/use-cases/login-user";
import { RegisterUserUseCase } from "../../../domain/use-cases/register-user";
import { IUserRepository } from "../../persistence/user-repository";
import { BcryptPasswordHasher } from "../../security/bcrypt-hasher";
import { JwtService } from "../../security/jwt-service";
import { AuthController } from "../controllers/auth-controller";

export function createAuthRouter(userRepository: IUserRepository): Router {
    const router = Router();

    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtService();

    const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
    const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    const authController = new AuthController(registerUserUseCase, loginUserUseCase);

    router.post("/register", (req, res) => authController.register(req, res));
    router.post("/login", (req, res) => authController.login(req, res));

    return router;
}
