export interface TokenPayload {
    id: string;
    username: string;
}

export interface ITokenService {
    generateToken(payload: TokenPayload): string;
    verifyToken(token: string): TokenPayload;
}
