import { Router } from "express";
import { shortenUrl, getOriginalUrl } from '../controllers/urlController';

const router = Router();

router.post("/shorten", shortenUrl);
router.get("/:shortUrl", getOriginalUrl);

export default router;