import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

export const shortenUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { originalUrl } = req.body;
        if(!originalUrl) {
            res.status(400).json({error: "Original URL is required"});
            return;
        }

        const shortUrl = "test";
        const newUrl = await prisma.urls.create({
            data: { originalUrl, shortUrl },
        });

        res.status(201).json(newUrl);
    } catch(error) {
        next(error);
    }
}

export const getOriginalUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { shortUrl } = req.params;
        const foundUrl = await prisma.urls.findUnique({
            where: { shortUrl },
        });

        if(!foundUrl) {
            res.status(404).json({error: "URL not found"});
            return;
        }

        res.redirect(foundUrl.originalUrl);
    } catch(error) {
        next(error);
    }
}