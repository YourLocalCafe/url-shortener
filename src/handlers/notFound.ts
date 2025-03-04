import { NextFunction, Request, Response } from "express";

class CustomError extends Error {
  status?: number;
}

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError("Not Found");
  error.status = 404;
  next(error);
};

export default notFound;
