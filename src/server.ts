import express, { NextFunction, Request, Response, urlencoded } from "express";
import urlRoutes from "./routes/urlRoutes";
import cors from "cors";
import notFound from "./handlers/notFound";
import errorHandler from "./handlers/error";
import path from "path";
import { PrismaClient } from "@prisma/client";
import logger from "./middleware/logger";
import register from "./routes/register";
import login from "./routes/login";
import cookieParser from "cookie-parser";
import verifyJWT from "./middleware/verifyJWT";
import refresh from "./routes/refresh";
import logout from "./routes/logout";

class CustomError extends Error {
  status?: number;
}

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(logger);

app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/register", register);
app.use("/login", login);
app.use("/api/refresh", refresh);
app.use("/api/logout", logout);

app.get(
  "/:shortUrl",
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

app.use("/api/url", verifyJWT, urlRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
