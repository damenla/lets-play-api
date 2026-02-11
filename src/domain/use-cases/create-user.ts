import { randomUUID } from "node:crypto";
import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";

export interface CreateUserDto {
    name: string;
    email: string;
}

export class CreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    static readonly Errors = {
        REQUIRED_FIELD_MISSING: {
            code: "REQUIRED_FIELD_MISSING",
            message: "Email and name are required"
        },
        INVALID_EMAIL_FORMAT: {
            code: "INVALID_EMAIL_FORMAT",
            message: "Invalid email format"
        },
        EMAIL_ALREADY_EXISTS: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email already exists"
        }
    };

    async execute(input: CreateUserDto): Promise<User> {
        await this.validate(input);

        const newUser: User = {
            id: randomUUID(),
            email: input.email,
            name: input.name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.userRepository.create(newUser);
    }

    private async validate(input: CreateUserDto): Promise<void> {
        const { name, email } = input;
        if (!email || !name) {
            throw new Error(CreateUserUseCase.Errors.REQUIRED_FIELD_MISSING.code);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(CreateUserUseCase.Errors.INVALID_EMAIL_FORMAT.code);
        }

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error(CreateUserUseCase.Errors.EMAIL_ALREADY_EXISTS.code);
        }
    }
}
