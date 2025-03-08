import { Router } from "express";
import { handleLogin } from "../controllers/loginController";

const router = Router();

router.post("/", handleLogin);

export default router;