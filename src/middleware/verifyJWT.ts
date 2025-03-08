import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();

class CustomError extends Error {
    status?: number;
}

interface decodedToken {
    userName: string;
    email: string;
}

interface CustomRequest extends Request {
    user?: {
        userName: string;
        email: string;
    }
}

const verifyJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader) {
        const error = new CustomError("Unauthorized.");
        error.status = 401;
        next(error);
        return;
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
        if(err) {
            const error = new CustomError("Forbidden.");
            error.status = 403;
            next(error);
            return;
        }
        const decodedPayload = decoded as decodedToken;
        if(!decodedPayload.userName || !decodedPayload.email) {
            const error = new CustomError("Token missing required payload fields.");
            error.status = 403;
            next(error);
            return;
        }
        req.user = { userName: decodedPayload.userName, email: decodedPayload.email };
        next();
    });
}

export default verifyJWT;