"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const Logger_1 = __importDefault(require("./Logger"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const RedisClient_1 = __importDefault(require("./RedisClient"));
const handlebars_1 = __importDefault(require("handlebars"));
const colors_json_1 = __importDefault(require("./colors.json"));
dotenv_1.default.config();
const saltRounds = Number(process.env.saltRounds);
const jwtSecret = process.env.jwtSecret;
const tokenExpireTime = process.env.tokenExpireTime;
const log = (0, Logger_1.default)(__filename);
class Util {
    constructor() {
        this.statusCode = null;
        this.responseCode = null;
        this.type = null;
        this.data = null;
        this.message = null;
        this.download = null;
        this.file = null;
        this.errorCode = null;
        this.cookies = [];
    }
    setSuccess(statusCode, responseCode, message, data, file, errorCode) {
        this.statusCode = statusCode !== null && statusCode !== void 0 ? statusCode : null;
        this.responseCode = responseCode !== null && responseCode !== void 0 ? responseCode : null;
        this.message = message !== null && message !== void 0 ? message : null;
        this.data = data !== null && data !== void 0 ? data : null;
        this.type = "true";
        this.errorCode = errorCode !== null && errorCode !== void 0 ? errorCode : null;
    }
    setError(statusCode, responseCode, message) {
        this.statusCode = statusCode !== null && statusCode !== void 0 ? statusCode : null;
        this.responseCode = responseCode !== null && responseCode !== void 0 ? responseCode : null;
        this.message = message !== null && message !== void 0 ? message : null;
        this.data = null;
        this.type = "error";
    }
    setCookie(key, value, options) {
        this.cookies.push({ key, value, options });
    }
    send(res) {
        this.cookies.forEach((cookie) => {
            res.cookie(cookie.key, cookie.value, cookie.options);
        });
        const result = {};
        if (this.responseCode !== null)
            result.responseCode = this.responseCode;
        if (this.message !== null)
            result.message = this.message;
        if (this.data !== null)
            result.data = this.data;
        if (this.download !== null)
            result.download = this.download;
        if (this.file !== null)
            result.file = this.file;
        if (this.errorCode !== null)
            result.errorCode = this.errorCode;
        return res.status(this.statusCode).json(result);
    }
    hashPassword(password) {
        log("Salting password");
        try {
            return bcryptjs_1.default.hashSync(password, saltRounds);
        }
        catch (err) {
            throw err;
        }
    }
    comparePassword(password, passwordHash) {
        log("Comparing password");
        try {
            if (password === passwordHash) {
                return true;
            }
            const result = bcryptjs_1.default.compareSync(password || "", passwordHash);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    compareSignature(body, signature) {
        log("Comparing signature");
        log(JSON.stringify(body));
        if (jwtSecret) {
            const hash = crypto_1.default
                .createHmac("sha512", Buffer.from(jwtSecret, "utf8"))
                .update(Buffer.from(body, "utf8"))
                .digest("hex");
            log(hash);
            log(signature);
            return signature === hash;
        }
        else {
            log("Secret key is not defined");
            return false;
        }
    }
    generateUUID() {
        return crypto_1.default.randomUUID();
    }
    generateToken(params, expire) {
        log("Generating token");
        log(params);
        params.jti = `${params.id}-${this.generateUUID()}`;
        try {
            const token = jsonwebtoken_1.default.sign(params, this.base64Encode(jwtSecret), {
                expiresIn: expire ? parseInt(expire) : parseInt(tokenExpireTime),
            });
            log("Token", token);
            log(`Token generated, to expire in, ${expire ? expire : tokenExpireTime}`);
            return { accessToken: token, expiresIn: expire || tokenExpireTime };
        }
        catch (err) {
            log(err);
            throw err;
        }
    }
    verifyToken(token) {
        try {
            const verify = jsonwebtoken_1.default.verify(token, this.base64Encode(jwtSecret));
            log(verify);
            return verify;
        }
        catch (err) {
            log(err.message);
            throw err;
        }
    }
    generateOTP() {
        const randomValue = crypto_1.default.randomInt(Math.pow(10, 6));
        return randomValue.toString().padStart(6, "0");
    }
    readJsonFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileContent = yield fs_extra_1.default.readFile(path, "utf8");
                return JSON.parse(fileContent);
            }
            catch (error) {
                console.error("Error reading or parsing JSON file:", error);
                throw error;
            }
        });
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
        return crypto_1.default.createHash("sha512").update(params).digest("hex");
    }
    generateChecksum(params) {
        const data = JSON.stringify(params);
        return crypto_1.default.createHash("sha512").update(data).digest("hex");
    }
    verifyChecksum(params, expectedChecksum) {
        delete params.checksum;
        const checksum = this.generateChecksum(params);
        return checksum === expectedChecksum;
    }
    sendMail(address, subject, params, html) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Mail is being composed");
            log(params);
            try {
                const templatePath = path_1.default.join(__dirname, `../templates/${params.template}.html`);
                if (!fs_extra_1.default.existsSync(templatePath)) {
                    throw new Error(`Template file not found: ${templatePath}`);
                }
                const templateSource = fs_extra_1.default.readFileSync(templatePath, "utf8");
                const template = handlebars_1.default.compile(templateSource);
                const htmlTemplate = template(params);
                var user = "olalekanbalogun95@gmail.com";
                var transporter = nodemailer_1.default.createTransport({
                    service: "Gmail",
                    auth: {
                        user,
                        pass: process.env.email,
                    },
                    logger: true,
                    debug: true,
                });
                const info = yield transporter.sendMail({
                    from: "The Loap App",
                    to: address,
                    subject: subject,
                    html: htmlTemplate,
                });
                log("Mail has been sent ", info.response);
                return info;
            }
            catch (err) {
                log(err);
                throw err;
            }
        });
    }
    generateRandomWord(length) {
        const alpha = "abcdefghijklmnopqrstuvwxyz";
        const wordLength = length || 4;
        let word = "";
        for (let i = 0; i < wordLength; i++) {
            const randomIndex = crypto_1.default.randomInt(0, alpha.length);
            word += alpha[randomIndex];
        }
        return word;
    }
    generateTempPassword(length) {
        const alpha = "abcdefghijklmnopqrstuvwxyz";
        const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const digits = "0123456789";
        const specialChars = "!@#$%^&*()_+-=[]{}|;:',.<>?";
        const allChars = alpha + upperAlpha + digits + specialChars;
        const wordLength = length || 6;
        if (wordLength < 6) {
            throw new Error("Length must be at least 6");
        }
        let word = "";
        word += upperAlpha[crypto_1.default.randomInt(0, upperAlpha.length)];
        word += digits[crypto_1.default.randomInt(0, digits.length)];
        word += specialChars[crypto_1.default.randomInt(0, specialChars.length)];
        for (let i = 3; i < wordLength; i++) {
            const randomIndex = crypto_1.default.randomInt(0, allChars.length);
            word += allChars[randomIndex];
        }
        return word
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");
    }
    getProfileColor() {
        const colors = colors_json_1.default.colors;
        try {
            if (!Array.isArray(colors) || colors.length === 0) {
                throw new Error("Invalid or empty colors.json file.");
            }
            const randomIndex = Math.floor(Math.random() * colors.length);
            return colors[randomIndex];
        }
        catch (error) {
            console.error("Error reading or parsing colors.json:", error);
            return { hex: "" };
        }
    }
    getInitials(firstName, lastName) {
        const firstNameInitial = (firstName === null || firstName === void 0 ? void 0 : firstName.charAt(0).toUpperCase()) || null;
        const lastNameInitial = (lastName === null || lastName === void 0 ? void 0 : lastName.charAt(0).toUpperCase()) || null;
        return `${firstNameInitial}${lastNameInitial}`;
    }
    isInvalid(value) {
        return value === undefined || value === null || value === "";
    }
    payloadisInvalid(params, requiredFields) {
        log("I am here", params, requiredFields);
        const hasMissingFields = requiredFields.some((field) => this.isInvalid(params[field]));
        return hasMissingFields;
    }
    getDate(t) {
        let d = new Date();
        let day = d.getDate();
        let month = d.getMonth() + 2;
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
        let startDate, endDate = null;
        if (t) {
            startDate = `${year}/${month}/${day}`;
            let endMonth = parseInt(month) + parseInt(t);
            if (endMonth <= 12)
                endDate = `${year}/${endMonth}/${day}`;
            else
                endDate = `${year + 1}/${endMonth - 12}/${day}`;
        }
        log(startDate, endDate);
        return { time, date, timestamp, dfloan, startDate, endDate };
    }
    formatDate(date) {
        let d;
        if (date) {
            d = new Date(date.toString());
        }
        else {
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
    redisPost(key, param, expInSecs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const insert = yield RedisClient_1.default.set(key, param, { EX: expInSecs });
                log("Insert to Redis successful"), insert;
                return;
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    redisGet(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const val = yield RedisClient_1.default.get(key);
                log("Get from redis successful", val);
                return val;
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
    redisExpiryCheck(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const expiry = yield RedisClient_1.default.ttl(key);
                log("Expiry check successful", expiry);
                return expiry;
            }
            catch (err) {
                throw err;
            }
        });
    }
    redisDelete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.del(key);
                log("Delete from redis successful");
            }
            catch (err) {
                log(`Failed to delete key: ${key} from Redis. Error: ${err.message}`);
                throw err;
            }
        });
    }
    redisGetAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.keys("*");
                log("Get from redis successful");
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
    redisFlush() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.flushAll();
                log("All entries deleted");
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
}
exports.default = Util;
