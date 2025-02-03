import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import UserService from "../services/UserService";
import AdminService from "../services/AdminService";

const log = createLogger(__filename);
const util = new Util();

class AuthController {
	static async loginAdmin(req: Request, res: Response) {
		const { user } = req.body;
		try {
			let d = Date();
			user.userId = Math.floor(Date.now() / 1000);
			const createduser = await AdminService.addAdmin(user);
			util.setSuccess(201, "00", "Registration successful", createduser);
			util.checkMemory();
			return util.send(res);
		} catch (err: any) {
			log(err.message);
			util.setError(400, "99", err.message);
			util.checkMemory();
			return util.send(res);
		}
	}

	static async registerAdmin(req: Request, res: Response) {
		const { admin } = req.body;
		try {
			let d = Date();
			const createdAdmin = await AdminService.addAdmin(admin);
			util.setSuccess(201, "00", "Registration successful", createdAdmin);
			util.checkMemory();
			return util.send(res);
		} catch (err: any) {
			log(err.message);
			util.setError(400, "99", err.message);
			util.checkMemory();
			return util.send(res);
		}
	}
}

export default AuthController;
