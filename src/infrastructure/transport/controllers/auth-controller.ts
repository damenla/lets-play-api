import type { Request, Response } from "express";
import { LoginUserUseCase } from "../../../domain/use-cases/login-user";
import { RegisterUserUseCase } from "../../../domain/use-cases/register-user";

export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase
    ) {}

    register = async (req: Request, res: Response): Promise<void> => {
        const { username, email, name, password } = req.body;

        try {
            const user = await this.registerUserUseCase.execute({
                username,
                email,
                name,
                password
            });
            res.status(201).json(user);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (
                isKnownError &&
                error.message === RegisterUserUseCase.Errors.REQUIRED_FIELD_MISSING.code
            ) {
                res.status(400).json(RegisterUserUseCase.Errors.REQUIRED_FIELD_MISSING);
            } else if (
                isKnownError &&
                error.message === RegisterUserUseCase.Errors.INVALID_EMAIL_FORMAT.code
            ) {
                res.status(400).json(RegisterUserUseCase.Errors.INVALID_EMAIL_FORMAT);
            } else if (
                isKnownError &&
                error.message === RegisterUserUseCase.Errors.USERNAME_ALREADY_EXISTS.code
            ) {
                res.status(409).json(RegisterUserUseCase.Errors.USERNAME_ALREADY_EXISTS);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        const { username, password } = req.body;

        try {
            const result = await this.loginUserUseCase.execute({ username, password });
            res.status(200).json(result);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (
                isKnownError &&
                error.message === LoginUserUseCase.Errors.INVALID_CREDENTIALS.code
            ) {
                res.status(401).json(LoginUserUseCase.Errors.INVALID_CREDENTIALS);
            } else if (
                isKnownError &&
                error.message === LoginUserUseCase.Errors.USER_INACTIVE.code
            ) {
                res.status(403).json(LoginUserUseCase.Errors.USER_INACTIVE);
            } else if (
                isKnownError &&
                error.message === LoginUserUseCase.Errors.REQUIRED_FIELD_MISSING.code
            ) {
                res.status(400).json(LoginUserUseCase.Errors.REQUIRED_FIELD_MISSING);
            } else if (isKnownError && error.message === "JWT secret is not configured") {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Server security configuration error"
                });
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };
}
