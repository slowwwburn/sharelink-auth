import { Router } from "express";
import userController from "../controllers/UserController";
import authController from "../controllers/AuthController";

const router = Router();

router.post("/register", userController.registerUser);
router.post("/validate", userController.validateUserLoginId);
router.post("/validate/bvn", userController.validateBVN);
router.post("/resend", userController.revalidateBVN);
router.post("/login", userController.loginUser);
router.get("/search/:searchInput", authController.authentication, userController.searchUsers);
router.get("/details", authController.authentication, userController.getUser);
router.post(
	"/update/username",
	authController.authentication,
	userController.updateUsername
);
router.post(
	"/update/password",
	authController.authentication,
	userController.changePassword
);

export default router;
