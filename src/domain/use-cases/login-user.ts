import type { IUserRepository } from "../../infrastructure/persistence/user-repository";
import type { IPasswordHasher } from "../services/password-hasher";
import type { ITokenService } from "../services/token-service";

export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ) {}

    static readonly Errors = {
        INVALID_CREDENTIALS: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid username or password"
        },
        REQUIRED_FIELD_MISSING: {
            code: "REQUIRED_FIELD_MISSING",
            message: "Username and password are required"
        },
        USER_INACTIVE: {
            code: "USER_INACTIVE",
            message: "User account is inactive"
        }
    };

    async execute(input: LoginDto): Promise<LoginResponse> {
        this.validate(input);

        const user = await this.userRepository.findByUsername(input.username);
        if (!user) {
            throw new Error(LoginUserUseCase.Errors.INVALID_CREDENTIALS.code);
        }

        if (!user.isActive) {
            throw new Error(LoginUserUseCase.Errors.USER_INACTIVE.code);
        }

        const passwordHash = await this.userRepository.getPasswordHash(user.id);
        if (!passwordHash) {
            throw new Error(LoginUserUseCase.Errors.INVALID_CREDENTIALS.code);
        }

        const isPasswordValid = await this.passwordHasher.compare(input.password, passwordHash);
        if (!isPasswordValid) {
            throw new Error(LoginUserUseCase.Errors.INVALID_CREDENTIALS.code);
        }

        const token = this.tokenService.generateToken({
            id: user.id,
            username: user.username
        });

        return { token };
    }

    private validate(input: LoginDto): void {
        if (!input.username || !input.password) {
            throw new Error(LoginUserUseCase.Errors.REQUIRED_FIELD_MISSING.code);
        }
    }
}
