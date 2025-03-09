import { Router } from "express";
import { handleRefresh } from "../controllers/refreshController";

const router = Router();

router.post("/", handleRefresh);

export default router;