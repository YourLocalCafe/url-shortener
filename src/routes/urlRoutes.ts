import { Router } from "express";
import { shortenUrl } from "../controllers/urlController";

const router = Router();

router.post("/shorten", shortenUrl);

export default router;
