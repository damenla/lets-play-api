import type { IUserRepository } from "../../infrastructure/persistence/user-repository";
import type { IPasswordHasher } from "../services/password-hasher";
import { FormatValidator } from "../validation/format-validator";

export interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export class UpdatePasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher
    ) {}

    static readonly Errors = {
        USER_NOT_FOUND: {
            code: "USER_NOT_FOUND",
            message: "User not found"
        },
        INVALID_UUID: {
            code: "INVALID_UUID",
            message: "Invalid UUID format"
        },
        CURRENT_PASSWORD_REQUIRED: {
            code: "CURRENT_PASSWORD_REQUIRED",
            message: "Current password is required"
        },
        NEW_PASSWORD_REQUIRED: {
            code: "NEW_PASSWORD_REQUIRED",
            message: "New password is required"
        },
        INVALID_CURRENT_PASSWORD: {
            code: "INVALID_CURRENT_PASSWORD",
            message: "Current password does not match"
        }
    };

    async execute(id: string, input: UpdatePasswordDto): Promise<void> {
        this.validate(id, input);

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error(UpdatePasswordUseCase.Errors.USER_NOT_FOUND.code);
        }

        const storedHash = await this.userRepository.getPasswordHash(id);
        if (!storedHash) {
            throw new Error(UpdatePasswordUseCase.Errors.USER_NOT_FOUND.code);
        }

        const isMatch = await this.passwordHasher.compare(input.currentPassword, storedHash);
        if (!isMatch) {
            throw new Error(UpdatePasswordUseCase.Errors.INVALID_CURRENT_PASSWORD.code);
        }

        const newHash = await this.passwordHasher.hash(input.newPassword);
        await this.userRepository.updatePassword(id, newHash);
    }

    private validate(id: string, input: UpdatePasswordDto): void {
        if (!FormatValidator.isValidUuid(id)) {
            throw new Error(UpdatePasswordUseCase.Errors.INVALID_UUID.code);
        }

        if (!input.currentPassword) {
            throw new Error(UpdatePasswordUseCase.Errors.CURRENT_PASSWORD_REQUIRED.code);
        }

        if (!input.newPassword) {
            throw new Error(UpdatePasswordUseCase.Errors.NEW_PASSWORD_REQUIRED.code);
        }
    }
}
