import { randomUUID } from "node:crypto";
import type { User } from "../../types/user";
import type { IUserRepository } from "../../infrastructure/persistence/user-repository";
import type { IPasswordHasher } from "../services/password-hasher";
import { FormatValidator } from "../validation/format-validator";

export interface RegisterUserDto {
    username: string;
    name: string;
    email: string;
    password: string;
}

export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher
    ) {}

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

    async execute(input: RegisterUserDto): Promise<User> {
        await this.validate(input);

        const passwordHash = await this.passwordHasher.hash(input.password);

        const newUser: User = {
            id: randomUUID(),
            username: input.username,
            email: input.email,
            name: input.name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await this.userRepository.create(newUser, passwordHash);
    }

    private async validate(input: RegisterUserDto): Promise<void> {
        const { username, name, email, password } = input;
        if (!username || !email || !name || !password) {
            throw new Error(RegisterUserUseCase.Errors.REQUIRED_FIELD_MISSING.code);
        }

        if (!FormatValidator.isValidEmail(email)) {
            throw new Error(RegisterUserUseCase.Errors.INVALID_EMAIL_FORMAT.code);
        }

        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error(RegisterUserUseCase.Errors.USERNAME_ALREADY_EXISTS.code);
        }
    }
}
