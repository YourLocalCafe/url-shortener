import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class CustomError extends Error {
  status?: number;
}

const prisma = new PrismaClient();

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userName, email, pwd } = req.body;
  if ((!userName && !email) || !pwd) {
    const error = new CustomError("Username/Email and password are required.");
    error.status = 400;
    next(error);
    return;
  }
  try {
    const foundUser = await prisma.user.findFirst({
      where: { OR: [{ userName }, { email }] },
    });
    if (!foundUser) {
      let msg: string;
      if (userName) msg = "Invalid username.";
      else msg = "Invalid email.";
      const error = new CustomError(msg);
      error.status = 401;
      throw error;
    }
    const match: Boolean =
      (await bcrypt.hash(pwd, 10)) === foundUser.passwordHash;
    if (!match) {
      const error = new CustomError("Invalid password.");
      error.status = 401;
      throw error;
    }

    const accessToken = jwt.sign(
      { userName: foundUser.userName },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userName: foundUser.userName },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );
    const refreshTokens = await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user: {
          connect: { id: foundUser.id },
        },
      },
    });
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken });
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
