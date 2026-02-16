import type { NextFunction, Request, Response } from "express";

const TMP_TOKEN = "123456";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Token not found"
        });
        return;
    }

    const token = authHeader?.split(" ")[1];
    if (token !== TMP_TOKEN) {
        res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Invalid token"
        });
        return;
    }

    next();
}
