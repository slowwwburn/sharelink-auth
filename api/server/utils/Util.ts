import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto, { verify } from "crypto";
import nodemailer from "nodemailer";
import path from "path";
import createLogger from "./Logger";
import fs from "fs-extra"; // Import fs-extra for file operations
import redis from "./RedisClient";
import handlebars from "handlebars";
import colorObj from "./colors.json";

dotenv.config();

const saltRounds = Number(process.env.saltRounds);
const jwtSecret = process.env.jwtSecret;
const tokenExpireTime = process.env.tokenExpireTime;

const log = createLogger(__filename);

class Util {
	private statusCode: number | null = null;
	private responseCode: string | null = null;
	private type: string | null = null;
	private data: any = null;
	private message: string | null = null;
	private download: string | null = null;
	private file: any | null = null;
	private errorCode: string | null = null;
	private cookies: { key: string; value: string; options: any }[] = [];

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
		this.data = null;
		this.type = "error";
	}

	setCookie(key: string, value: string, options?: any) {
		this.cookies.push({ key, value, options }); // Add cookie data to the list
	}

	send(res: any) {
		// Apply cookies
		this.cookies.forEach((cookie) => {
			res.cookie(cookie.key, cookie.value, cookie.options); // Set each cookie
		});

		const result: any = {};

		if (this.responseCode !== null) result.responseCode = this.responseCode;
		if (this.message !== null) result.message = this.message;
		if (this.data !== null) result.data = this.data;
		if (this.download !== null) result.download = this.download;
		if (this.file !== null) result.file = this.file;
		if (this.errorCode !== null) result.errorCode = this.errorCode;

		return res.status(this.statusCode).json(result);
	}

	hashPassword(password: string): string {
		log("Salting password");
		try {
			return bcrypt.hashSync(password, saltRounds);
		} catch (err: any) {
			throw err;
		}
	}

	comparePassword(password: string, passwordHash: string): boolean {
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

	compareSignature(body: string, signature: string | null) {
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

	generateUUID() {
		return crypto.randomUUID();
	}

	generateToken(params: any, expire?: string): any {
		log("Generating token");
		log(params);
		params.jti = `${params.id}-${this.generateUUID()}`;
		try {
			const token = jwt.sign(params, this.base64Encode(jwtSecret), {
				expiresIn: expire ? parseInt(expire) : parseInt(tokenExpireTime!),
			});
			log("Token", token);
			log(
				`Token generated, to expire in, ${expire ? expire : tokenExpireTime}`
			);
			return { accessToken: token, expiresIn: expire || tokenExpireTime };
		} catch (err: any) {
			log(err);
			throw err;
		}
	}

	verifyToken(token: string): any {
		try {
			const verify = jwt.verify(token, this.base64Encode(jwtSecret));
			log(verify);
			return verify;
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	generateOTP(): string {
		const randomValue = crypto.randomInt(Math.pow(10, 6));
		return randomValue.toString().padStart(6, "0");
	}

	// Function to read and parse the JSON file
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

	base64Encode(params: any): string {
		let bufferObj = Buffer.from(params, "utf8");
		let base64String = bufferObj.toString("base64");
		return base64String;
	}

	base64Decode(params: string): string {
		let bufferObj = Buffer.from(params, "base64");
		let decodedString = bufferObj.toString("utf8");
		return decodedString;
	}

	cryptoHash(params: string): string {
		return crypto.createHash("sha512").update(params).digest("hex");
	}

	generateChecksum(params: any): string {
		const data = JSON.stringify(params);
		return crypto.createHash("sha512").update(data).digest("hex");
	}

	verifyChecksum(params: any, expectedChecksum: string) {
		delete params.checksum;
		const checksum = this.generateChecksum(params);
		return checksum === expectedChecksum;
	}

	async sendMail(
		address: string,
		subject: string,
		params: any,
		html?: string
	): Promise<any> {
		log("Mail is being composed");
		log(params);
		try {
			const templatePath = path.join(
				__dirname,
				`../templates/${params.template}.html`
			);
			if (!fs.existsSync(templatePath)) {
				throw new Error(`Template file not found: ${templatePath}`);
			}
			const templateSource = fs.readFileSync(templatePath, "utf8");
			const template = handlebars.compile(templateSource);

			// const htmlTemplate = template({ name: params.name, resetLink: "" });
			const htmlTemplate = template(params);

			var user = "olalekanbalogun95@gmail.com";

			var transporter = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user,
					pass: process.env.email,
				},
				logger: true, // Enable logging
			});

			// try {
			const info = await transporter.sendMail({
				from: "The Loap App",
				to: address,
				subject: subject,
				html: htmlTemplate,
			});
			log("Mail has been sent ", info.response);
			return info;
		} catch (err: any) {
			log(err);
			throw err;
		}
	}

	generateRandomWord(length?: number): string {
		const alpha = "abcdefghijklmnopqrstuvwxyz";
		const wordLength = length || 4;
		let word = "";
		for (let i = 0; i < wordLength; i++) {
			const randomIndex = crypto.randomInt(0, alpha.length);
			word += alpha[randomIndex];
		}
		return word;
	}

	generateTempPassword(length?: number): string {
		const alpha = "abcdefghijklmnopqrstuvwxyz";
		const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const digits = "0123456789";
		const specialChars = "!@#$%^&*()_+-=[]{}|;:',.<>?";
		const allChars = alpha + upperAlpha + digits + specialChars;

		const wordLength = length || 6;

		// Ensure length is sufficient to meet all criteria
		if (wordLength < 6) {
			throw new Error("Length must be at least 6");
		}

		let word = "";

		// Ensure at least one character from each required set
		word += upperAlpha[crypto.randomInt(0, upperAlpha.length)]; // 1 uppercase letter
		word += digits[crypto.randomInt(0, digits.length)]; // 1 digit
		word += specialChars[crypto.randomInt(0, specialChars.length)]; // 1 special character

		// Fill the rest of the word with random characters
		for (let i = 3; i < wordLength; i++) {
			const randomIndex = crypto.randomInt(0, allChars.length);
			word += allChars[randomIndex];
		}

		// Shuffle the word to randomize the order of characters
		return word
			.split("")
			.sort(() => Math.random() - 0.5)
			.join("");
	}

	getProfileColor() {
		const colors = colorObj.colors;
		try {
			// Ensure the file contains valid color data
			if (!Array.isArray(colors) || colors.length === 0) {
				throw new Error("Invalid or empty colors.json file.");
			}

			// Select a random color
			const randomIndex = Math.floor(Math.random() * colors.length);
			log(colors[randomIndex])
			return colors[randomIndex];
		} catch (error) {
			console.error("Error reading or parsing colors.json:", error);
			return  {hex:""};
		}
	}

	getInitials(firstName?: string, lastName?: string) {
		const firstNameInitial = firstName?.charAt(0).toUpperCase() || null;
		const lastNameInitial = lastName?.charAt(0).toUpperCase() || null;

		return `${firstNameInitial}${lastNameInitial}`;
	}

	isInvalid(value: string) {
		// log(value);
		return value === undefined || value === null || value === "";
	}

	payloadisInvalid(params: any, requiredFields: any[]): boolean {
		// Check if any required field is missing or invalid
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
		let startDate,
			endDate = null;

		if (t) {
			startDate = `${year}/${month}/${day}`;
			let endMonth = parseInt(month) + parseInt(t);

			if (endMonth <= 12) endDate = `${year}/${endMonth}/${day}`;
			else endDate = `${year + 1}/${endMonth - 12}/${day}`;
		}
		log(startDate, endDate);
		return { time, date, timestamp, dfloan, startDate, endDate };
	}

	formatDate(date: Date | null) {
		let d: Date;
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
		const timestamp = Math.floor(Date.now() / 1000); // Unix epoch time in seconds
		const randomNumber = Math.floor(Math.random() * 1000) + 1; // Random number between 1 and 1000
		const formattedRandomNumber = randomNumber.toString().padStart(4, "0"); // Ensure 4-digit format
		log(timestamp, formattedRandomNumber);
		return parseInt(`${timestamp}${formattedRandomNumber}`);
	}

	async redisPost(
		key: string,
		param: string,
		expInSecs: number
	): Promise<void> {
		try {
			const insert = await redis.set(key, param, { EX: expInSecs });
			log("Insert to Redis successful"), insert;
			return;
		} catch (err: any) {
			log(err.message);
			throw err;
		}
	}

	async redisGet(key: string): Promise<any> {
		try {
			const val = await redis.get(key);
			log("Get from redis successful", val);
			return val;
		} catch (err: any) {
			log("An error occurred", err.message);
			throw err;
		}
	}

	async redisExpiryCheck(key: string): Promise<any> {
		try {
			const expiry = await redis.ttl(key);
			log("Expiry check successful", expiry);
			return expiry;
		} catch (err: any) {
			throw err;
		}
	}

	async redisDelete(key: string) {
		try {
			await redis.del(key);
			log("Delete from redis successful");
		} catch (err: any) {
			log(`Failed to delete key: ${key} from Redis. Error: ${err.message}`);
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

export default Util;
