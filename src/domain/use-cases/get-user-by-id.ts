import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";
import { FormatValidator } from "../validation/format-validator";

export class GetUserByIdUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    static readonly Errors = {
        USER_NOT_FOUND: {
            code: "USER_NOT_FOUND",
            message: "User not found"
        },
        INVALID_UUID: {
            code: "INVALID_UUID",
            message: "Invalid UUID format"
        }
    };

    async execute(id: string): Promise<User> {
        this.validate(id);

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error(GetUserByIdUseCase.Errors.USER_NOT_FOUND.code);
        }

        return user;
    }

    private validate(id: string): void {
        if (!FormatValidator.isValidUuid(id)) {
            throw new Error(GetUserByIdUseCase.Errors.INVALID_UUID.code);
        }
    }
}
