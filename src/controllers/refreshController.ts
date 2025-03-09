import { PrismaClient } from "@prisma/client";
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

const prisma = new PrismaClient();

export const handleRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    const error = new CustomError("Unauthorized.");
    error.status = 401;
    next(error);
    return;
  }
  const refreshToken = cookies.jwt;
  try {
    const foundToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!foundToken) {
      const error = new CustomError("Forbidden.");
      error.status = 403;
      next(error);
      return;
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      (
        err: jwt.VerifyErrors | null,
        decoded: string | jwt.JwtPayload | undefined
      ) => {
        const decodedPayload: decodedToken = decoded as decodedToken;
        if (!decodedPayload.userName || !decodedPayload.email) {
          const error = new CustomError(
            "Token missing required payload fields."
          );
          error.status = 403;
          throw error;
        }
        if (
          err ||
          foundToken.user.userName !== decodedPayload.userName ||
          foundToken.user.email !== decodedPayload.email
        ) {
          const error = new CustomError("Forbidden.");
          error.status = 403;
          throw error;
        }
        const accessToken = jwt.sign(
          { userName: foundToken.user.userName, email: foundToken.user.email },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "15m" }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    let customError: CustomError;
    if (!(error instanceof CustomError)) {
      const msg =
        error instanceof Error ? error.message : "An unknown error occurred.";
      customError = new CustomError(msg);
    } else {
      customError = error;
    }
    next(customError);
    return;
  }
};
