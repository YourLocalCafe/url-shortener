import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

class CustomError extends Error {
  status?: number;
}

const prisma = new PrismaClient();

export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) res.sendStatus(204);
  const refreshToken = cookies.jwt;
  try {
    const deletedToken = await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
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
