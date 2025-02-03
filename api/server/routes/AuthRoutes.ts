import { Router } from "express";
import authController from "../controllers/AuthController";

const router = Router();

router.get("/token", authController.authenticateToken);
router.post("/logout", authController.logOut);
router.post("/forgot", authController.forgotPassword);

export default router;
