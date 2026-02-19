import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

export interface UpdatePasswordDto {
    password: string;
}

export class UpdatePasswordUseCase {
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
        PASSWORD_REQUIRED: {
            code: "PASSWORD_REQUIRED",
            message: "Password is required"
        }
    };

    async execute(id: string, input: UpdatePasswordDto): Promise<void> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error(UpdatePasswordUseCase.Errors.INVALID_UUID.code);
        }

        if (!input.password) {
            throw new Error(UpdatePasswordUseCase.Errors.PASSWORD_REQUIRED.code);
        }

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error(UpdatePasswordUseCase.Errors.USER_NOT_FOUND.code);
        }

        await this.userRepository.updatePassword(id, input.password);
    }
}
