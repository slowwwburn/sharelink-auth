import db from "../src/models";
import Util from "../utils/Util";
import createLogger from "../utils/Logger";
import { AdminAttributes } from "@models/Admin";

const log = createLogger(__filename);
const util = new Util();

class AdminService {
	static async addAdmin(params: AdminAttributes): Promise<any> {
		try {
			log("Creating Admin", params);
			if (params.password) params.password = util.hashPassword(params.password);
			const admin = await db.Admin.create(params);
			delete admin.password;
			return admin;
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getAdmins(): Promise<any> {
		try {
			return await db.Admin.findAll();
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getAdminByUsername(username: string): Promise<any> {
		log("Getting Admin by username");
		try {
			return await db.Admin.findOne({
				attributes: { exclude: ["password"] },
				where: { username },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getAdminById(id: string): Promise<any> {
		try {
			return await db.Admin.findOne({
				attributes: { exclude: ["password", "createdAt", "updatedAt"] },
				where: { id },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getAdminByEmail(email: string): Promise<any> {
		try {
			return await db.Admin.findOne({
				attributes: { exclude: ["createdAt", "updatedAt"] },
				where: { email },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async getAdminByBVN(bvn: string): Promise<any> {
		try {
			return await db.Admin.findOne({
				attributes: { exclude: ["password", "createdAt", "updatedAt"] },
				where: { bvn },
			});
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	static async updateAdmin(params: AdminAttributes): Promise<any> {}
}

export default AdminService;
