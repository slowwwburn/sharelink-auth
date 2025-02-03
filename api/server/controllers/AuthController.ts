import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import UserService from "../services/UserService";
import AdminService from "../services/AdminService";
import AuthService from "../services/AuthService";

const log = createLogger(__filename);
const util = new Util();

class AuthController {
	static async authentication(req: Request, res: Response, next: NextFunction) {
		log("Authenticating request");
		const authorization = req.headers.authorization;
		const token = authorization?.split(" ")[1] ?? null;
		const apikey = req.headers.api_key;

		if (!token && !apikey) {
			log("No authentication provided");
			util.setError(401, "41", "Unauthorized");
			return util.send(res);
		}

		token ? log("Token retrieved", token) : null;
		apikey ? log("Apikey retrieved", apikey) : null;

		try {
			if (token) {
				log("Validating using token");
				const valid = await util.verifyToken(token);
				if (valid) {
					res.locals.userId = valid.id;
					log("User validated via token");
					return next();
				} else {
					log("Invalid token");
					util.setError(401, "41", "Unauthorized");
					return util.send(res);
				}
			}

			if (apikey && process.env.API_KEY === apikey) {
				res.locals.apikey = apikey;
				log("Authorization granted via apikey");
				return next();
			}

			log("Invalid API key");
			util.setError(401, "41", "Unauthorized");
			return util.send(res);
		} catch (err: any) {}
	}

	static async authenticateToken(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const authorization = req.headers.authorization;
		const token = authorization?.split(" ")[1] ?? null;

		log("Token retrieved", token);
		try {
			if (!token) {
				util.setError(400, "98", "Token not provided");
				return util.send(res);
			}

			const isUser = util.verifyToken(token);

			log(isUser);
			if (!isUser) {
				util.setError(400, "98", "Invalid token");
				return util.send(res);
			}

			log("Check if token has been revoked");
			const revoked = await util.redisGet(isUser.jti);
			if (isUser.jti && revoked) {
				log("Blacklisted Token");
				res.clearCookie("userToken");
				util.setError(400, "98", "Token is expired");
				return util.send(res);
			}

			log("Token is valid and still active");
			util.setSuccess(200, "00", "User successfully authenticated", isUser);
			return util.send(res);
		} catch (err: any) {
			log("Error occurred during authentication", err);
			util.setError(400, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async logOut(req: Request, res: Response) {
		log("Request to log out received");
		const authorization = req.headers.authorization;
		const token = authorization?.split(" ")[1] ?? null;

		log("Token retrieved", token);
		try {
			if (!token) {
				util.setError(400, "98", "Token not provided");
				return util.send(res);
			}
			const verify = util.verifyToken(token);
			log(verify);
			util.redisPost(
				verify.jti,
				verify.id,
				verify.exp - Math.floor(Date.now() / 1000)
			);
			res.clearCookie("userToken");
			util.setSuccess(200, "00", "Logout Successful");
			return util.send(res);
		} catch (err: any) {
			log("An error occurred ", err.message);
			util.setError(500, "99", "An Error Occurred");
			return util.send(res);
		}
	}

	static async forgotPassword(req: Request, res: Response) {
		log("Request to reset password received");
		try {
			const { loginId } = req.body;
			await AuthService.resetPassword(loginId);
			util.setSuccess(
				200,
				"00",
				"User's password has been successfully updated"
			);
			return util.send(res);
		} catch (err: any) {
			util.setError(500, "99", 'Internal Server Error');
			return util.send(res);
		}
	}
}

export default AuthController;
