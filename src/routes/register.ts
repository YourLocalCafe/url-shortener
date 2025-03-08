import { Router } from "express";
import { handleRegister } from "../controllers/registerController";

const router = Router();

router.post("/", handleRegister);

export default router;