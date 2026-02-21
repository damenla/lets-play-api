import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";
import { FormatValidator } from "../validation/format-validator";

export class UpdateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    static readonly Errors = {
        USER_NOT_FOUND: {
            code: "USER_NOT_FOUND",
            message: "User not found"
        },
        INVALID_UUID: {
            code: "INVALID_UUID",
            message: "Invalid UUID format"
        },
        USERNAME_ALREADY_EXISTS: {
            code: "USERNAME_ALREADY_EXISTS",
            message: "Username already exists"
        }
    };

    async execute(id: string, updateData: Partial<User>): Promise<User> {
        this.validateId(id);

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error(UpdateUserUseCase.Errors.USER_NOT_FOUND.code);
        }

        await this.validateUpdateData(updateData, existingUser.username);

        // Prevent updating ID
        const { id: _, ...safeUpdateData } = updateData;

        const updatedUser = await this.userRepository.update(id, safeUpdateData);
        if (!updatedUser) {
            // Should ideally not happen if findById passed, but for safety
            throw new Error(UpdateUserUseCase.Errors.USER_NOT_FOUND.code);
        }

        return updatedUser;
    }

    private validateId(id: string): void {
        if (!FormatValidator.isValidUuid(id)) {
            throw new Error(UpdateUserUseCase.Errors.INVALID_UUID.code);
        }
    }

    private async validateUpdateData(
        updateData: Partial<User>,
        currentUsername: string
    ): Promise<void> {
        if (updateData.username && updateData.username !== currentUsername) {
            const usernameExists = await this.userRepository.findByUsername(updateData.username);
            if (usernameExists) {
                throw new Error(UpdateUserUseCase.Errors.USERNAME_ALREADY_EXISTS.code);
            }
        }
    }
}
