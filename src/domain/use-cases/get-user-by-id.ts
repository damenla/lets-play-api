import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

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
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            throw new Error(GetUserByIdUseCase.Errors.INVALID_UUID.code);
        }

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error(GetUserByIdUseCase.Errors.USER_NOT_FOUND.code);
        }

        return user;
    }
}
