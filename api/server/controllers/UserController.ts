import { Request, Response } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import UserService from "../services/UserService";
import { integrationAxios, walletAxios } from "../utils/axiosInstance";
import { getuid } from "process";
import { randomUUID } from "crypto";

const log = createLogger(__filename);
const util = new Util();

class UserController {
	static async validateBVN(req: Request, res: Response) {
		log("Request to validate BVN received");
		const user = req.body;
		console.log(user);
		const requiredFields = [
			"firstName",
			"lastName",
			"bvn",
			"dob",
			"email",
			"password",
			"phonenumber",
		];
		const dateRegex = /^\d{2}\/[A-Za-z]{3}\/\d{4}$/;

		if (util.payloadisInvalid(user, requiredFields)) {
			log("Payload is invalid");
			util.setError(400, "98", "Bad Request");
			return util.send(res);
		}

		if (!dateRegex.test(user.dob)) {
			util.setError(400, "98", "Invalid date format");
			return util.send(res);
		}

		if (user.bvn.length !== 11) {
			util.setError(400, "98", "BVN must be 11 digits");
			return util.send(res);
		}

		try {
			const userExists = await UserService.checkIfUserExists(user);

			if (userExists) {
				log("User already exists");
				util.setError(400, "05", "User already exists");
				return util.send(res);
			}

			log("calling prembly");
			const { data }: any = await integrationAxios.post("/kyc/bvn/basic", user);

			if (!data) {
				util.setError(400, "99", "Internal Server Error");
				return util.send(res);
			}

			log("generating OTP");
			const otp = util.generateOTP();
			const otpId = randomUUID();
			const expiryTime = 180;
			const resendTime = 600;
			const contact = user.email;
			log("Inserting otp into redis");

			// if (await util.redisGet(user.bvn)) await util.redisDelete(user.bvn);
			await util.redisPost(user.bvn, JSON.stringify(user), resendTime);
			await util.redisPost(
				otpId,
				JSON.stringify({ bvn: user.bvn, otp }),
				expiryTime
			);
			log("Initiating mail trigger");
			await util.sendMail(contact, "Idenity Verification", {
				template: "verify_code",
				name: user.firstName,
				code: otp,
			});
			util.setSuccess(200, "00", "OTP sent to your BVN phone number", {
				otpId,
				expiryTime,
			});
			return util.send(res);
		} catch (err: any) {
			log("An error occurred ", err);
			err.response && err.response.data.responseCode === "05"
				? util.setError(400, "05", err.response.data.message)
				: util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async revalidateBVN(req: Request, res: Response) {
		log("Request to resend otp received");
		const { bvn, otpId } = req.body;
		try {
			log("Regenerating OTP");
			const otp = util.generateOTP();
			const newOtpId = crypto.randomUUID();
			const expiryTime = 180;
			log("Inserting otp into redis");

			const existingKey = await util.redisGet(bvn);
			if (existingKey) {
				const expired = await util.redisExpiryCheck(bvn);
				if (parseInt(expired) < 180) {
					util.setError(400, "98", "BVN validation request expired");
					return util.send(res);
				}
				if (await util.redisGet(otpId || "")) {
					await util.redisDelete(otpId);
				}

				const { email, firstName } = JSON.parse(existingKey);
				log(email);
				// await util.redisPost(
				// 	bvn,
				// 	JSON.stringify({ otp, contact, name }),
				// 	resendTime
				// );
				await util.redisPost(newOtpId, otp, expiryTime);
				log("Initiating mail trigger");
				await util.sendMail(email, "Idenity Verification", {
					template: "verify_code",
					name: firstName,
					code: otp,
				});
				util.setSuccess(200, "00", "OTP sent to your BVN phone number", {
					otpId: newOtpId,
					expiryTime,
				});
				return util.send(res);
			} else {
				util.setError(400, "98", "OTP request not found");
				return util.send(res);
			}
		} catch (err: any) {
			log("An error occurred ", err.message);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async registerUser(req: Request, res: Response) {
		log("Request to create user received");
		const user = req.body;
		const requiredFields = [
			"firstName",
			"lastName",
			"bvn",
			"dob",
			"email",
			"password",
			"phonenumber",
			"otp",
		];

		if (util.payloadisInvalid(user, requiredFields)) {
			log("Bad request payload", req.body);
			util.setError(400, "98", "Bad Request");
			return util.send(res);
		}

		try {
			const bvn = await util.redisGet(user.bvn);
			const { otp } = JSON.parse(bvn);
			const found = await util.redisGet(user.otp);
			if (found) {
				log(otp, user.otp);
				if (user.otp === otp) {
					log("otp is valid");
					const createdUser = await UserService.addUser(user);

					try {
						const { data } = await walletAxios.post<any>("wallet/create", {
							userId: createdUser.id,
						});
						if (data.responseCode === "00") {
							log("Wallet successfully created");
						} else {
							log(
								"Wallet creation failed:",
								data.responseMessage || "Unknown error"
							);
						}
					} catch (err: any) {
						log("Error occurred while creating wallet:", err.message || err);
					}

					const payload = {
						id: createdUser.id,
						username: createdUser.username,
						firstname: createdUser.firstName,
						lastname: createdUser.lastName,
						time: new Date(),
					};

					const token = util.generateToken(payload);
					util.setSuccess(201, "00", "Registration successful", token);
					util.checkMemory();
					return util.send(res);
				} else {
					util.setError(400, "43", "Otp expired");
					return util.send(res);
				}
			} else {
				util.setError(400, "43", "Invalid OTP");
				return util.send(res);
			}
		} catch (err: any) {
			log("Error occurred while registering user", err);
			util.setError(400, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async validateUserLoginId(req: Request, res: Response) {
		const { loginId } = req.body;
		try {
			const user = await UserService.getUserByEmailorUsername(loginId);
			log(user);
			const { firstName, lastName, id, password, username } = user;
			util.redisPost(
				loginId,
				JSON.stringify({ firstName, lastName, id, password, username }),
				180
			);
			util.setSuccess(201, "00", "User found", { firstName, lastName, id });
			return util.send(res);
		} catch (err: any) {
			log(err.message);
			util.setError(400, "99", "Internal Server Error");
			util.checkMemory();
			return util.send(res);
		}
	}

	static async loginUser(req: Request, res: Response) {
		const { loginId, password } = req.body;

		try {
			log("Authenticating user");
			const redisUser = JSON.parse(await util.redisGet(loginId));
			if (redisUser) {
				log(redisUser);
				if (util.comparePassword(password, redisUser.password)) {
					const payload = {
						id: redisUser.id,
						username: redisUser.username,
						firstname: redisUser.firstName,
						lastname: redisUser.lastName,
						type: "User",
						time: new Date().getTime(),
					};
					log(payload);
					const token = util.generateToken(payload);
					log("token", token);
					util.setSuccess(200, "00", "Successful", token);
				} else {
					log("Incorrect Password");
					util.setError(401, "05", "Invalid login details. Please try again.");
				}
			} else {
				const user = await UserService.getUserByEmailorUsername(loginId);
				if (user) {
					log("User gotten");
					if (util.comparePassword(password, user.password)) {
						const payload = {
							id: user.id,
							username: user.username,
							firstname: user.firstName,
							lastname: user.lastName,
							type: "User",
							time: new Date().getTime(),
						};
						const token = util.generateToken(payload);
						util.setSuccess(200, "00", "Successful", token);
					} else {
						log("Incorrect Password");
						util.setError(
							401,
							"05",
							"Invalid login details. Please try again."
						);
					}
				} else {
					log("User not found");
					util.setError(401, "05", `Invalid login details. Please try again.`);
				}
			}
			return util.send(res);
		} catch (err: any) {
			log("Error while user tried logging in", err.message);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async getUser(req: Request, res: Response) {
		log("Request to retrieve user details received");
		const { apikey } = res.locals;

		let userId;

		if (apikey) userId = req.body.userId;
		else userId = res.locals.userId;
		try {
			const user = await UserService.getUserById(userId);
			if (!user) {
				util.setError(404, "20", "User not found");
			} else {
				util.setSuccess(200, "00", "User retrieved", user);
			}
			return util.send(res);
		} catch (err: any) {
			log("Error while attempting to retrieve user details", err);
			util.setError(500, "99", "An error occurred");
			return util.send(res);
		}
	}

	static async searchUsers(req: Request, res: Response) {
		log("Request to search for users received");
		const { apikey } = res.locals;

		let userId;

		if (apikey) userId = req.body.userId;
		else userId = res.locals.userId;

		const { searchInput } = req.params;

		log(searchInput, userId);
		try {
			const users = await UserService.searchUsers(searchInput, userId);
			util.setSuccess(200, "00", "Users Retrieved", users);
			return util.send(res);
		} catch (err: any) {
			log(
				"An error occurred while attempting to search for users",
				err.message
			);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async updateUsername(req: Request, res: Response) {
		log("Request to update username received");
		const { apikey } = res.locals;

		let userId;

		if (apikey) userId = req.body.userId;
		else userId = res.locals.userId;
		const { username } = req.body;

		if (!username) {
			util.setError(400, "98", "Username is required");
			return util.send(res);
		}

		try {
			if (await UserService.updateUsername({ id: userId, username })) {
				util.setSuccess(200, "00", "Username updated");
			} else {
				util.setError(400, "23", "User not found");
			}
			return util.send(res);
		} catch (err: any) {
			log(err.message);
			util.setError(500, "99", err.message);
			return util.send(res);
		}
	}

	static async changePassword(req: Request, res: Response) {
		log("Request to change password received");
		const { apikey } = res.locals;

		let userId;

		if (apikey) userId = req.body.userId;
		else userId = res.locals.userId;

		const { curPassword, newPassword } = req.body;

		if (!curPassword || !newPassword || !userId) {
			util.setError(400, "98", "Bad Request");
			return util.send(res);
		}

		try {
			const update = await UserService.changePassword(
				curPassword,
				newPassword,
				userId
			);
			update
				? util.setSuccess(200, "00", "Password Updated")
				: util.setError(400, "98", "User not found");

			return util.send(res);
		} catch (err: any) {
			log("An Error Occurred processing the password update request", err);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}
}

export default UserController;
