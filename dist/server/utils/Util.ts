import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import path from "path";
// import fs from 'fs';
import createLogger from "./Logger";
import fs from "fs-extra"; // Import fs-extra for file operations
import redis from "./RedisClient";

dotenv.config();

const saltRounds = Number(process.env.saltRounds);
const jwtSecret = process.env.jwtSecret;
const tokenExpireTime = process.env.tokenExpireTime;

const log = createLogger(__filename);

interface UtilOptions {
	statusCode?: string;
	message?: string;
	data?: any;
	remitaCode?: string;
	download?: string;
	file?: string;
	errorCode?: string;
}

class Util {
	private statusCode: number | null = null;
	private responseCode: string | null = null;
	private type: string | null = null;
	private data: any = null;
	private message: string | null = null;
	private download: string | null = null;
	private file: any | null = null;
	private errorCode: string | null = null;
	private cookies: { key?: string; value?: any; options?: any }[] | null = null;

	constructor() {}

	setSuccess(
		statusCode: number,
		responseCode: string,
		message: string,
		data?: any,
		file?: any,
		errorCode?: string | null
	) {
		this.statusCode = statusCode ?? null;
		this.responseCode = responseCode ?? null;
		this.message = message ?? null;
		this.data = data ?? null;
		this.type = "true";
		this.errorCode = errorCode ?? null;
	}

	setError(statusCode: number, responseCode: string, message: string) {
		this.statusCode = statusCode ?? null;
		this.responseCode = responseCode ?? null;
		this.message = message ?? null;
		this.type = "error";
	}

	setCookie(key: string, value: any, options: any) {
		log("here", this.cookies);
		this.cookies?.push({ key, value, options });
	}
	send(res) {
		this.cookies?.forEach((cookie) => {
			res.cookie(cookie.key, cookie.value, cookie.options);
		});
		log("Cookies about to be sent:", res.cookie);
		console.log("Cookies about to be sent:", res.getHeader("Set-Cookie"));
		const result: any = {};

		if (this.responseCode !== null) result.responseCode = this.responseCode;
		if (this.message !== null) result.message = this.message;
		if (this.data !== null) result.data = this.data;
		if (this.download !== null) result.download = this.download;
		if (this.file !== null) result.file = this.file;
		if (this.errorCode !== null) result.errorCode = this.errorCode;

		// if (this.type === "true") {
		return res.status(this.statusCode).json(result);
		// }
	}

	hashPassword(password) {
		log("Salting password");
		try {
			return bcrypt.hashSync(password, saltRounds);
		} catch (err) {
			throw err;
		}
	}
	comparePassword(password, passwordHash) {
		log("Comparing password");
		try {
			if (password === passwordHash) {
				return true;
			}
			const result = bcrypt.compareSync(password || "", passwordHash);
			return result;
		} catch (err) {
			throw err;
		}
	}
	compareSignature(body, signature) {
		log("Comparing signature");
		log(JSON.stringify(body));
		if (jwtSecret) {
			const hash = crypto
				.createHmac("sha512", Buffer.from(jwtSecret, "utf8"))
				.update(Buffer.from(body, "utf8"))
				.digest("hex");
			log(hash);
			log(signature);
			return signature === hash;
		} else {
			log("Secret key is not defined");
			return false;
		}
	}
	generateToken(params, expire) {
		log("Generating token");
		log(params);
		try {
			const token = jwt.sign(params, this.base64Encode(jwtSecret), {
				expiresIn: expire
					? parseInt(expire)
					: parseInt(tokenExpireTime || "3600"),
			});
			log(
				`Token generated, to expire in, ${expire ? expire : tokenExpireTime}`
			);
			return { accessToken: token, expiresIn: expire || tokenExpireTime };
		} catch (err) {
			log(err);
			throw err;
		}
	}
	verifyToken(token) {
		try {
			const verify = jwt.verify(token, this.base64Encode(jwtSecret));
			return verify;
		} catch (err) {
			log(err);
			throw err;
		}
	}
	generateOTP() {
		const randomValue = crypto.randomInt(Math.pow(10, 6));
		return randomValue.toString().padStart(6, "0");
	}
	async readJsonFile<T>(path: string): Promise<T> {
		try {
			// Read the file content
			const fileContent = await fs.readFile(path, "utf8");
			// Parse the JSON content
			return JSON.parse(fileContent) as T;
		} catch (error) {
			console.error("Error reading or parsing JSON file:", error);
			throw error; // Rethrow the error to be handled by the caller
		}
	}
	base64Encode(params) {
		let bufferObj = Buffer.from(params, "utf8");
		let base64String = bufferObj.toString("base64");
		return base64String;
	}
	base64Decode(params) {
		let bufferObj = Buffer.from(params, "base64");
		let decodedString = bufferObj.toString("utf8");
		return decodedString;
	}
	cryptoHash(params) {
		return crypto.createHash("sha512").update(params).digest("hex");
	}
	async sendMail(html: string, address: string, subject: string): Promise<any> {
		log("Mail is being composed");
		var user = "olalekanbalogun95@gmail.com";

		var transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user,
				pass: process.env.email,
			},
		});

		try {
			const info = await transporter.sendMail({
				from: "The Loap App",
				to: address,
				subject: subject,
				html,
			});
			log("Mail has been sent ", info.response);
			return info;
		} catch (err: any) {
			log(err);
			throw err;
		}
	}
	generateRandomWord() {
		const alpha = "abcdefghijklmnopqrstuvwxyz";
		const wordLength = 4;
		let word = "";
		for (let i = 0; i < wordLength; i++) {
			const randomIndex = crypto.randomInt(0, alpha.length);
			word += alpha[randomIndex];
		}
		return word;
	}
	isInvalid(value) {
		log(value);
		return value === undefined || value === null || value === "";
	}
	payloadisInvalid(params, requiredFields) {
		log("I am here", params, requiredFields);
		const hasMissingFields = requiredFields.some((field) =>
			this.isInvalid(params[field])
		);
		return hasMissingFields;
	}
	getDate(t?: string): any {
		let d = new Date();
		let day: any = d.getDate();
		let month: any = d.getMonth() + 2;
		let year = d.getFullYear();
		if (day < 10) {
			day = "0" + day;
		}
		if (month < 10) {
			month = "0" + month;
		}

		let hours = d.getUTCHours();
		let minutes = d.getUTCMinutes();
		let seconds = d.getUTCSeconds();

		let time = d.getTime();
		let date = `${day}/${month}/${year} 00:00:00+0000`;
		let dfloan = `${day}-${month}-${year} 00:00:00+0000`;
		let timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+000000`;
		let startDate, endDate;

		if (t) {
			startDate = `${year}/${month}/${day}`;
			let endMonth = parseInt(month) + parseInt(t);

			if (endMonth <= 12) endDate = `${year}/${endMonth}/${day}`;
			else endDate = `${year + 1}/${endMonth - 12}/${day}`;
		}
		log(startDate, endDate);
		return { time, date, timestamp, dfloan, startDate, endDate };
	}
	formatDate(date) {
		let d;
		if (date) {
			d = new Date(date.toString());
		} else {
			d = new Date();
		}
		let dd = d.getDate();
		let mm = d.getMonth() + 1;
		let yyyy = d.getFullYear();
		let ddloan = `${dd}/${mm}/${yyyy}`;
		let dfloan = `${dd}-${mm}-${yyyy} 00:00:00+0000`;
		return { dfloan, ddloan };
	}
	checkMemory() {
		const memoryUsage = process.memoryUsage();
		log(`RSS: ${memoryUsage.rss}`);
		log(`Heap Total: ${memoryUsage.heapTotal}`);
		log(`Heap Used: ${memoryUsage.heapUsed}`);
		log(`External: ${memoryUsage.external}`);
	}
	generatePrimaryKey() {
		log("Generating primary key");
		const timestamp = Math.floor(Date.now() / 1000);
		const randomNumber = Math.floor(Math.random() * 1000) + 1;
		const formattedRandomNumber = randomNumber.toString().padStart(4, "0");
		log(timestamp, formattedRandomNumber);
		return parseInt(`${timestamp}${formattedRandomNumber}`);
	}

	async redisPost(
		key: string,
		param: string,
		expInSecs: number
	): Promise<void> {
		try {
			await redis.set(key, param, { EX: expInSecs });
			log("Insert to Redis successful");
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	async redisPostSet(key: string, params: any, expInSecs: number) {
		try {
			await redis.sAdd(key, params);
			await redis.expire(key, expInSecs);
			log("Insert to Redis successful");
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	async redisUpdateSet(key: string, param: string) {
		try {
			const exists = await redis.exists(key);
			if (exists) {
				const ttl = await redis.ttl(key);

				await redis.sAdd(key, param);
				log("Set update in Redis was successful");

				if (ttl > 0) {
					await redis.expire(key, ttl);
				}
				return;
			} else {
				log(`Set doesn't exist in redis`);
				throw new Error(`Set doesn't exist`);
			}
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	async redisGet(key: string): Promise<any> {
		try {
			const val = await redis.get(key);
			log("Get from redis successful");
			return val;
		} catch (err: any) {
			log("An error occurred", err.message);
			throw err;
		}
	}

	async redisDelete(key: string) {
		try {
			await redis.del(key);
			log("Delete from redis successful");
		} catch (err: any) {
			log("An error occurred", err.message);
			throw err;
		}
	}

	async redisGetAll() {
		try {
			await redis.keys("*");
			log("Get from redis successful");
		} catch (err: any) {
			log("An error occurred", err.message);
			throw err;
		}
	}

	async redisFlush() {
		try {
			await redis.flushAll();
			log("All entries deleted");
		} catch (err: any) {
			log("An error occurred", err.message);
			throw err;
		}
	}
}
exports.default = Util;
