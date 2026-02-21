import jwt from "jsonwebtoken";
import type { ITokenService, TokenPayload } from "../../domain/services/token-service";

export class JwtService implements ITokenService {
    private readonly secret: string;
    private readonly expiresInSeconds: number;

    constructor() {
        this.secret = process.env.JWT_SECRET || "";
        this.expiresInSeconds = Number(process.env.JWT_EXPIRATION_SECONDS || 300);
    }

    generateToken(payload: TokenPayload): string {
        if (!this.secret) {
            throw new Error("JWT secret is not configured");
        }
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresInSeconds });
    }

    verifyToken(token: string): TokenPayload {
        if (!this.secret) {
            throw new Error("JWT secret is not configured");
        }
        return jwt.verify(token, this.secret) as TokenPayload;
    }
}
