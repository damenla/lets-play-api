import type { Request, Response } from "express";
import { CreateUserUseCase } from "../../../domain/use-cases/create-user";

export class UserController {
    constructor(private readonly userCreateUseCase: CreateUserUseCase) {}

    createUser = async (req: Request, res: Response): Promise<void> => {
        const { email, name } = req.body;

        try {
            const user = await this.userCreateUseCase.execute({ name, email });
            res.status(201).json(user);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (
                isKnownError &&
                error.message === CreateUserUseCase.Errors.REQUIRED_FIELD_MISSING.code
            ) {
                res.status(400).json(CreateUserUseCase.Errors.REQUIRED_FIELD_MISSING);
            } else if (
                isKnownError &&
                error.message === CreateUserUseCase.Errors.INVALID_EMAIL_FORMAT.code
            ) {
                res.status(400).json(CreateUserUseCase.Errors.INVALID_EMAIL_FORMAT);
            } else if (
                isKnownError &&
                error.message === CreateUserUseCase.Errors.EMAIL_ALREADY_EXISTS.code
            ) {
                res.status(409).json(CreateUserUseCase.Errors.EMAIL_ALREADY_EXISTS);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };
}
