import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";

class CustomError extends Error {
  status?: number;
}

const prisma = new PrismaClient();

export const shortenUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      const error = new CustomError("Original URL is required");
      error.status = 400;
      next(error);
      return;
    }

    let shortUrl: string = nanoid(10);
    let exists: Boolean = false;
    do {
      exists =
        (await prisma.urls.findUnique({
          where: { shortUrl },
        })) !== null;
    } while (exists);
    const newUrl = await prisma.urls.create({
      data: { originalUrl, shortUrl },
    });

    res.status(201).json(newUrl);
  } catch (error) {
    next(error);
  }
};

export const getOriginalUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shortUrl } = req.params;
    const foundUrl = await prisma.urls.findUnique({
      where: { shortUrl },
    });

    if (!foundUrl) {
      const error = new CustomError("URL not found");
      error.status = 404;
      next(error);
      return;
    }

    res.redirect(foundUrl.originalUrl);
  } catch (error) {
    next(error);
  }
};
