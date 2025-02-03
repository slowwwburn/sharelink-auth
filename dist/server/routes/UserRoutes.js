"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = __importDefault(require("../controllers/UserController"));
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const router = (0, express_1.Router)();
router.post("/register", UserController_1.default.registerUser);
router.post("/validate", UserController_1.default.validateUserLoginId);
router.post("/validate/bvn", UserController_1.default.validateBVN);
router.post("/resend", UserController_1.default.revalidateBVN);
router.post("/login", UserController_1.default.loginUser);
router.get("/search/:searchInput", AuthController_1.default.authentication, UserController_1.default.searchUsers);
router.get("/details", AuthController_1.default.authentication, UserController_1.default.getUser);
router.post("/update/username", AuthController_1.default.authentication, UserController_1.default.updateUsername);
router.post("/update/password", AuthController_1.default.authentication, UserController_1.default.changePassword);
exports.default = router;
