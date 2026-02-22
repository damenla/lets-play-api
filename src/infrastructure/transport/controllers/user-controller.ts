import type { Request, Response } from "express";
import { GetUserByIdUseCase } from "../../../domain/use-cases/get-user-by-id";
import { UpdateUserUseCase } from "../../../domain/use-cases/update-user";
import { UpdatePasswordUseCase } from "../../../domain/use-cases/update-password";
import { TokenPayload } from "../../../domain/services/token-service";

export class UserController {
    constructor(
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly updatePasswordUseCase: UpdatePasswordUseCase
    ) {}

    getUserById = async (req: Request, res: Response): Promise<void> => {
        const authenticated_user: TokenPayload = (req as any).authenticated_user;

        try {
            const user = await this.getUserByIdUseCase.execute(authenticated_user.id);
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

    updateUser = async (req: Request, res: Response): Promise<void> => {
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        const updateData = req.body;

        try {
            const user = await this.updateUserUseCase.execute(authenticated_user.id, updateData);
            res.status(200).json(user);
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (isKnownError && error.message === UpdateUserUseCase.Errors.INVALID_UUID.code) {
                res.status(400).json(UpdateUserUseCase.Errors.INVALID_UUID);
            } else if (
                isKnownError &&
                error.message === UpdateUserUseCase.Errors.USER_NOT_FOUND.code
            ) {
                res.status(404).json(UpdateUserUseCase.Errors.USER_NOT_FOUND);
            } else if (
                isKnownError &&
                error.message === UpdateUserUseCase.Errors.USERNAME_ALREADY_EXISTS.code
            ) {
                res.status(409).json(UpdateUserUseCase.Errors.USERNAME_ALREADY_EXISTS);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };

    updatePassword = async (req: Request, res: Response): Promise<void> => {
        const authenticated_user: TokenPayload = (req as any).authenticated_user;
        const { currentPassword, newPassword } = req.body;

        try {
            await this.updatePasswordUseCase.execute(authenticated_user.id, {
                currentPassword,
                newPassword
            });
            res.status(204).send();
        } catch (error) {
            const isKnownError = error instanceof Error;

            if (isKnownError && error.message === UpdatePasswordUseCase.Errors.INVALID_UUID.code) {
                res.status(400).json(UpdatePasswordUseCase.Errors.INVALID_UUID);
            } else if (
                isKnownError &&
                error.message === UpdatePasswordUseCase.Errors.CURRENT_PASSWORD_REQUIRED.code
            ) {
                res.status(400).json(UpdatePasswordUseCase.Errors.CURRENT_PASSWORD_REQUIRED);
            } else if (
                isKnownError &&
                error.message === UpdatePasswordUseCase.Errors.NEW_PASSWORD_REQUIRED.code
            ) {
                res.status(400).json(UpdatePasswordUseCase.Errors.NEW_PASSWORD_REQUIRED);
            } else if (
                isKnownError &&
                error.message === UpdatePasswordUseCase.Errors.INVALID_CURRENT_PASSWORD.code
            ) {
                res.status(401).json(UpdatePasswordUseCase.Errors.INVALID_CURRENT_PASSWORD);
            } else if (
                isKnownError &&
                error.message === UpdatePasswordUseCase.Errors.USER_NOT_FOUND.code
            ) {
                res.status(404).json(UpdatePasswordUseCase.Errors.USER_NOT_FOUND);
            } else {
                res.status(500).json({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal Server Error"
                });
            }
        }
    };
}
