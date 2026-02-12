import type { Request, Response } from "express";
import { CreateUserUseCase } from "../../../domain/use-cases/create-user";
import { GetUserByIdUseCase } from "../../../domain/use-cases/get-user-by-id";

export class UserController {
    constructor(
        private readonly userCreateUseCase: CreateUserUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase
    ) {}

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

    getUserById = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        try {
            const user = await this.getUserByIdUseCase.execute(id as string);
            res.status(200).json(user);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (isKnownError && error.message === GetUserByIdUseCase.Errors.INVALID_UUID.code) {
                res.status(400).json(GetUserByIdUseCase.Errors.INVALID_UUID);
            } else if (
                isKnownError &&
                error.message === GetUserByIdUseCase.Errors.USER_NOT_FOUND.code
            ) {
                res.status(404).json(GetUserByIdUseCase.Errors.USER_NOT_FOUND);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };
}
