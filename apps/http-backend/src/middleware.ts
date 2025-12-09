import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { AuthRequest } from "./types";

export function middleware(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const token = header.split(" ")[1]; // Bearer abc.xyz

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

        req.userId = decoded.userId;

        next();
    } catch (err) {
        return res.status(403).json({ message: "Unauthorized" });
    }
}
