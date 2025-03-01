import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import validator from "validator";

class CustomError extends Error {
  status?: number;
}

const prisma = new PrismaClient();

export const shortenUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      const error = new CustomError("Original URL is required");
      error.status = 400;
      next(error);
      return;
    }

    if(!validator.isURL(originalUrl, { require_protocol: true })) {
      const error = new CustomError("Invalid URL");
      error.status = 400;
      next(error);
      return;
    }

    let alreadyShortened = await prisma.urls.findFirst({
      where: { originalUrl },
    });

    if (alreadyShortened) {
      res.status(201).json({
        shortUrl: `${req.protocol}://${req.get("host")}/${
          alreadyShortened.shortUrl
        }`,
      });
      return;
    }

    let shortUrl: string;
    let exists: Boolean;
    do {
      shortUrl = nanoid(10);
      exists =
        (await prisma.urls.findUnique({
          where: { shortUrl },
        })) !== null;
    } while (exists);
    const newUrl = await prisma.urls.create({
      data: { originalUrl, shortUrl },
    });

    res.status(201).json({
      shortUrl: `${req.protocol}://${req.get("host")}/${newUrl.shortUrl}`,
    });
  } catch (error) {
    next(error);
  }
};
