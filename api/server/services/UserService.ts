import { Op } from "sequelize";
import db from "../src/models";
import Util from "../utils/Util";
import createLogger from "../utils/Logger";
import { UserAttributes } from "@models/User";

const log = createLogger(__filename);
const util = new Util();

class UserService {
	static async addUser(params: UserAttributes): Promise<any> {
		try {
			log("Creating User", params);
			params.color = util.getProfileColor().hex;
			params.initials = util.getInitials(params.firstName, params.lastName);
			if (params.password) params.password = util.hashPassword(params.password);
			const user = await db.User.create(params);
			delete user.password;
			return user;
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async updatePassword({ password, id }: UserAttributes): Promise<any> {
		log("Updating user's password");

		if (!password || !id) {
			log("Password or ID is missing in updatePassword");
			throw new Error("Password and ID are required to update the password");
		}
		const transaction = await db.sequelize.transaction();
		try {
			const hashedPassword = util.hashPassword(password);

			const [updatedRows] = await db.User.update(
				{ password: hashedPassword, security: true },
				{ where: { id }, transaction }
			);

			if (updatedRows === 0) {
				log(`No user found with ID: ${id}`);
				await transaction.rollback();
				throw new Error("User not found or no changes were made");
			}
			if (updatedRows > 1) {
				log(`More than one row updated, rolling back changes`);
				await transaction.rollback();
				throw new Error("User not found or no changes were made");
			}
			log(`Password updated successfully for user with ID: ${id}`);
			await transaction.commit();
		} catch (err: any) {
			log("An error ocurred while trying to update password", err);
			await transaction.rollback();
			throw err;
		}
	}

	static async checkIfUserExists(params: UserAttributes): Promise<any> {
		log("Checking user's information");
		return await db.User.findOne({
			where: {
				[Op.or]: [
					{ phonenumber: params.phonenumber },
					{ email: params.email },
					{ bvn: params.bvn },
				],
			},
		});
	}

	static async getUsers(): Promise<any> {
		try {
			return await db.User.findAll();
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async searchUsers(searchInput: string, userId: string): Promise<any> {
		try {
			return await db.User.findAll({
				attributes: ["id", "username", "image", "color", "initials"],
				where: {
					username: {
						[Op.iLike]: `%${searchInput}%`, // Case-insensitive pattern matching
					},
					id: {
						[Op.ne]: userId, // Exclude the user with this ID
					},
				},
			});
		} catch (err: any) {
			throw err;
		}
	}

	static async getUserByUsername(username: string): Promise<any> {
		log("Getting user by username");
		try {
			return await db.User.findOne({
				attributes: { exclude: ["password"] },
				where: { username },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getUserById(id: string): Promise<any> {
		try {
			return await db.User.findOne({
				attributes: { exclude: ["password", "createdAt", "updatedAt"] },
				where: { id },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getUserByEmail(email: string): Promise<any> {
		try {
			return await db.User.findOne({
				attributes: { exclude: ["createdAt", "updatedAt"] },
				where: { email },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getUserByEmailorUsername(param: string): Promise<any> {
		try {
			log("Retrieving User using Email/Username", param);
			return await db.User.findOne({
				where: {
					[Op.or]: [{ email: param }, { username: param }],
				},
			});
		} catch (err: any) {
			log("An error occurred", err.message);
		}
	}

	static async getUserByBVN(bvn: string): Promise<any> {
		try {
			return await db.User.findOne({
				attributes: { exclude: ["password", "createdAt", "updatedAt"] },
				where: { bvn },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async updateUsername(params: UserAttributes): Promise<any> {
		const transaction = await db.sequelize.transaction();
		try {
			const [updatedRows] = await db.User.update(
				{ username: params.username },
				{ where: { id: params.id }, transaction }
			);

			if (updatedRows === 0) {
				log(`No user found with ID: ${params.id}`);
				await transaction.rollback();
				throw new Error("User not found or no changes were made");
			}
			if (updatedRows > 1) {
				log(`More than one row updated, rolling back changes`);
				await transaction.rollback();
				throw new Error("User not found or no changes were made");
			}
			log(`Username updated successfully for user with ID: ${params.id}`);
			await transaction.commit();

			return params.username;
		} catch (err: any) {
			if (err.name === "SequelizeUniqueConstraintError") {
				throw new Error("The username is already taken");
			}
			log(err.message);
			throw err;
		}
	}

	static async changePassword(
		curPassword: string,
		newPassword: string,
		userId: string
	): Promise<any> {
		log("Changing user's password");
		try {
			const user = await db.User.findOne({
				where: { id: userId },
				attributes: ["password"],
			});

			if (!user) {
				log("User not found");
				return;
			}

			if (util.comparePassword(curPassword, user.password)) {
				const [updated] = await db.User.update(
					{ password: newPassword, security: false },
					{
						where: { id: userId },
					}
				);

				log("Password changed successfully");
				return updated;
			} else {
				log("Provided password does not match stored password");
				throw new Error("Password mismatch");
			}
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}
}

export default UserService;
