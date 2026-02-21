import type { NextFunction, Request, Response } from "express";

interface LogData {
    timestamp: string;
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    userAgent?: string;
    ip: string;
}
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const originalEnd = res.end;

    res.end = function (chunk?: any, encoding?: any): Response {
        const responseTime = Date.now() - startTime;

        const logData: LogData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            responseTime,
            userAgent: req.get("user-agent"),
            ip: req.ip || req.socket.remoteAddress || "unknown"
        };

        const logMessage = `[${logData.timestamp}] ${logData.method} ${logData.url} ${logData.statusCode} ${logData.responseTime}ms ${logData.userAgent} ${logData.ip}`;

        if (logData.statusCode >= 500) {
            console.error(`${logMessage}`);
        } else if (logData.statusCode >= 400) {
            console.warn(`${logMessage}`);
        } else {
            console.info(`${logMessage}`);
        }

        return originalEnd.call(res, chunk, encoding);
    };

    next();
}
