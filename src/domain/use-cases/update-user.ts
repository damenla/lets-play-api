import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

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
        EMAIL_ALREADY_EXISTS: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email already exists"
        }
    };

    async execute(id: string, updateData: Partial<User>): Promise<User> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error(UpdateUserUseCase.Errors.INVALID_UUID.code);
        }

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error(UpdateUserUseCase.Errors.USER_NOT_FOUND.code);
        }

        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await this.userRepository.findByEmail(updateData.email);
            if (emailExists) {
                throw new Error(UpdateUserUseCase.Errors.EMAIL_ALREADY_EXISTS.code);
            }
        }

        // Prevent updating ID
        const { id: _, ...safeUpdateData } = updateData;

        const updatedUser = await this.userRepository.update(id, safeUpdateData);
        if (!updatedUser) {
            // Should ideally not happen if findById passed, but for safety
            throw new Error(UpdateUserUseCase.Errors.USER_NOT_FOUND.code);
        }

        return updatedUser;
    }
}
