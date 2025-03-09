import { Router } from "express";
import { handleLogout } from "../controllers/logoutController";

const router = Router();

router.post("/", handleLogout);

export default router;