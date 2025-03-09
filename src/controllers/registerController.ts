import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

class CustomError extends Error {
  status?: number;
}

const prisma = new PrismaClient();

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userName, email, pwd } = req.body;
  if (!userName || !email || !pwd) {
    const error = new CustomError("Username, Email and Password are required.");
    error.status = 400;
    throw error;
  }

  try {
    const duplicateUser = await prisma.user.findFirst({
      where: { OR: [{ userName }, { email }] },
    });
    if (duplicateUser) {
      let error: CustomError;
      if (duplicateUser.userName === userName) {
        error = new CustomError("Username is not available.");
      } else if (duplicateUser.email === email) {
        error = new CustomError("Email is already registered.");
      } else {
        error = new CustomError("Username and Email are already registered.");
      }
      error.status = 409;
      throw error;
    }
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const newUser = await prisma.user.create({
      data: { userName, email, passwordHash: hashedPwd },
    });
    const accessToken = jwt.sign(
      { userName: newUser.userName, email: newUser.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userName: newUser.userName, email: newUser.email },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );
    await prisma.refreshToken.upsert({
      where: { userId: newUser.id },
      update: { token: refreshToken },
      create: {
        token: refreshToken,
        user: { connect: { id: newUser.id } },
      },
    });
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(201)
      .json({ message: "Successfully registered user.", accessToken });
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
