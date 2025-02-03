import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import db from "../src/models";
import Util from "../utils/Util";
import UserService from "./UserService";
import { UserAttributes } from "@models/User";

const log = createLogger(__filename);
const util = new Util();

class AuthService {
	static async authenticateFrontEnd(apiKey: string) {}

	static async verifyCollector(token: string) {
		try {
			return util.verifyToken(token);
		} catch (err: any) {
			log(err.message);
		}
	}

	static async verifyUser(token: string) {
		try {
			log("Verifying user token");
			let isUser;
			const verify = util.verifyToken(token);
			if (verify)
				// log("Token valid, details found", verify);
				util.redisGet(verify.jti);

			isUser = await UserService.getUserById(verify.id);
			// if (isUser) {
			// 	log(`User successfully authenticated`);
			return verify;
		} catch (err: any) {
			log("An error occurred ", err.message);
			throw err;
		}
	}

	static async resetPassword(loginId: string) {
		try {
			const user = await UserService.getUserByEmailorUsername(loginId);
			if (!user) {
				log("User doesn't exist");
				// throw new Error("User not found");
				return
			}

			log("Generating default password");
			const newPassword = util.generateTempPassword(10);

			await UserService.updatePassword({
				password: newPassword,
				id: user.id,
			});
			await util.sendMail(user.email, "Reset Your Sharelink Password", {
				template: "forgot-password",
				name: user.firstName,
				support_email: "support@gates-sharelink.com",
				password: newPassword,
			});
		} catch (err: any) {
			log("An error ocurred", err);
			throw err;
		}
	}
}

export default AuthService;
