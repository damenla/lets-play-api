import { randomUUID } from "node:crypto";
import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

export interface CreateUserDto {
    username: string;
    name: string;
    email: string;
    password: string;
}

export class CreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    static readonly Errors = {
        REQUIRED_FIELD_MISSING: {
            code: "REQUIRED_FIELD_MISSING",
            message: "Username, email, name and password are required"
        },
        INVALID_EMAIL_FORMAT: {
            code: "INVALID_EMAIL_FORMAT",
            message: "Invalid email format"
        },
        USERNAME_ALREADY_EXISTS: {
            code: "USERNAME_ALREADY_EXISTS",
            message: "Username already exists"
        }
    };

    async execute(input: CreateUserDto): Promise<User> {
        await this.validate(input);

        const newUser: User = {
            id: randomUUID(),
            username: input.username,
            email: input.email,
            name: input.name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.userRepository.create(newUser, input.password);
    }

    private async validate(input: CreateUserDto): Promise<void> {
        const { username, name, email, password } = input;
        if (!username || !email || !name || !password) {
            throw new Error(CreateUserUseCase.Errors.REQUIRED_FIELD_MISSING.code);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(CreateUserUseCase.Errors.INVALID_EMAIL_FORMAT.code);
        }

        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error(CreateUserUseCase.Errors.USERNAME_ALREADY_EXISTS.code);
        }
    }
}
