import type { NextFunction, Request, Response } from "express";
import type { ITokenService } from "../../../domain/services/token-service";
import type { IUserRepository } from "../../persistence/user-repository";

export function createAuthMiddleware(tokenService: ITokenService, userRepository: IUserRepository) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader: string | undefined = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Token not found"
            });
            return;
        }

        const token = authHeader?.split(" ")[1];
        if (!token) {
            res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Token not found"
            });
            return;
        }

        try {
            const decoded = tokenService.verifyToken(token);

            // Check if user still exists and is active
            const user = await userRepository.findById(decoded.id);
            if (!user) {
                res.status(401).json({
                    code: "UNAUTHORIZED",
                    message: "User no longer exists"
                });
                return;
            }

            if (!user.isActive) {
                res.status(403).json({
                    code: "USER_INACTIVE",
                    message: "User account is inactive"
                });
                return;
            }

            // Inject user info into request for further use
            (req as any).user = decoded;
            next();
        } catch (error) {
            res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Invalid token"
            });
        }
    };
}
