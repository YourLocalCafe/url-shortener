import express from "express";
import { PrismaClient } from "@prisma/client";
import urlRoutes from './routes/urlRoutes';
import cors from "cors";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use("/api/url", urlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});