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
const Logger_1 = __importDefault(require("../utils/Logger"));
const Util_1 = __importDefault(require("../utils/Util"));
const UserService_1 = __importDefault(require("../services/UserService"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class UserController {
    static validateBVN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Request to validate BVN received");
            const user = req.body;
            console.log(user);
            const requiredFields = ["firstName", "lastName", "dob", "bvn", "email"];
            const dateRegex = /^\d{2}\/[A-Za-z]{3}\/\d{4}$/;
            if (util.payloadisInvalid(user, requiredFields)) {
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
                log("generating OTP");
                const otp = util.generateOTP();
                const expiryTime = 180;
                log("Inserting otp into redis");
                const existingKey = yield util.redisGet(user.bvn);
                existingKey ? yield util.redisDelete(user.bvn) : null;
                yield util.redisPost(user.bvn, otp, expiryTime);
                log("Initiating mail trigger");
                const sent = yield util.sendMail(`<p>Your OTP is ${otp}</p>`, user.email, "Welcome to Sharelink");
                if (sent) {
                    util.setSuccess(200, "00", "OTP sent to BVN phone Number", expiryTime);
                    return util.send(res);
                }
            }
            catch (err) {
                log("An error occurred ", err.message);
                util.setError(500, "99", "An error occurred");
                return util.send(res);
            }
        });
    }
    static revalidateBVN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bvn } = req.body;
            try {
                log("Regenerating OTP");
                const otp = util.generateOTP();
                const expiryTime = 180;
                log("Inserting otp into redis");
                const existingKey = yield util.redisGet(bvn);
                existingKey ? yield util.redisDelete(bvn) : null;
                yield util.redisPost(bvn, otp, expiryTime);
                log("Initiating mail trigger");
                const sent = yield util.sendMail(`<p>Your OTP is ${otp}</p>`, 'olalekanbalogun@ymail.com', "Welcome to Sharelink");
                if (sent) {
                    util.setSuccess(200, "00", "OTP sent to BVN phone Number", expiryTime);
                    return util.send(res);
                }
            }
            catch (err) {
                log("An error occurred ", err.message);
                util.setError(500, "99", "An error occurred");
                return util.send(res);
            }
        });
    }
    static registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.body;
            const requiredFields = [
                "firstName",
                "lastName",
                "bvn",
                "dob",
                "email",
                "password",
                "phone",
                "otp",
            ];
            user.accountNumber = "0234547891";
            user.username = "Supes";
            if (util.payloadisInvalid(user, requiredFields)) {
                util.setError(400, "98", "Bad Request");
                return util.send(res);
            }
            try {
                const redisOtp = yield util.redisGet(user.bvn);
                log(redisOtp, user.otp);
                if (user.otp === redisOtp) {
                    log("otp is valid");
                    const createdUser = yield UserService_1.default.addUser(user);
                    const payload = {
                        id: createdUser.id,
                        username: createdUser.username,
                        firstname: createdUser.firstName,
                        lastname: createdUser.lastName,
                        time: new Date(),
                    };
                    const token = util.generateToken(payload);
                    util.setCookie("userToken", token.accessToken, {
                        httpOnly: false,
                        secure: false,
                        domain: "localhost",
                        sameSite: "Lax",
                        maxAge: parseInt(token.expiresIn) * 1000,
                        path: "/",
                    });
                    util.setCookie("userToken", token.accessToken, {
                        httpOnly: false,
                        secure: true,
                        domain: "carol-at-increase-sunshine.trycloudflare.com",
                        sameSite: "None",
                        maxAge: parseInt(token.expiresIn) * 1000,
                        path: "/",
                    });
                    util.setCookie("userToken", token.accessToken, {
                        httpOnly: false,
                        secure: true,
                        domain: "ada-consent-airline-are.trycloudflare.com",
                        sameSite: "None",
                        maxAge: parseInt(token.expiresIn) * 1000,
                        path: "/",
                    });
                    util.setSuccess(201, "00", "Registration successful", createdUser);
                    util.checkMemory();
                    return util.send(res);
                }
                else {
                    util.setError(400, "43", "Otp exipred");
                    return util.send(res);
                }
            }
            catch (err) {
                log(err.message);
                util.setError(400, "99", err.message);
                util.checkMemory();
                return util.send(res);
            }
        });
    }
    static validateUserLoginId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { loginId } = req.body;
            try {
                const user = yield UserService_1.default.getUserByEmailorUsername(loginId);
                log(user);
                util.redisPost(loginId, user.password, 180);
                const { firstName, lastName } = user;
                util.setSuccess(201, "00", "User found", { firstName, lastName });
                util.checkMemory();
                return util.send(res);
            }
            catch (err) {
                log(err.message);
                util.setError(400, "99", err.message);
                util.checkMemory();
                return util.send(res);
            }
        });
    }
    static loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { loginId, password } = req.body;
            try {
                log("Authenticating user");
                const redisUser = yield util.redisGet(loginId);
                if (redisUser) {
                    if (util.comparePassword(password, redisUser)) {
                        const payload = {
                            id: redisUser.id,
                            username: redisUser.username,
                            firstname: redisUser.firstName,
                            lastname: redisUser.lastName,
                            time: new Date(),
                        };
                        const token = util.generateToken(payload);
                        util.setCookie("userToken", token.accessToken, {
                            httpOnly: false,
                            secure: false,
                            domain: "localhost",
                            sameSite: "Lax",
                            maxAge: parseInt(token.accessToken.expiresIn) * 1000,
                            path: "/",
                        });
                        util.setCookie("userToken", token.accessToken, {
                            httpOnly: false,
                            secure: true,
                            domain: "carol-at-increase-sunshine.trycloudflare.com",
                            sameSite: "None",
                            maxAge: parseInt(token.expiresIn) * 1000,
                            path: "/",
                        });
                        util.setCookie("userToken", token.accessToken, {
                            httpOnly: false,
                            secure: true,
                            domain: "ada-consent-airline-are.trycloudflare.com",
                            sameSite: "None",
                            maxAge: parseInt(token.expiresIn) * 1000,
                            path: "/",
                        });
                        console.log("Cookies about to be sent:", res.getHeader("Set-Cookie"));
                        util.setSuccess(200, "00", "Successful", token);
                    }
                    else {
                        log("Incorrect Password");
                        util.setError(401, "05", "Incorrect Password");
                    }
                }
                else {
                    const user = yield UserService_1.default.getUserByEmailorUsername(loginId);
                    if (user) {
                        log("User gotten");
                        if (util.comparePassword(password, user.password)) {
                            const payload = {
                                id: user.id,
                                username: user.username,
                                firstname: user.firstName,
                                lastname: user.lastName,
                                type: "User",
                                time: new Date(),
                            };
                            const token = util.generateToken(payload);
                            log(token.expiresIn);
                            util.setCookie("userToken", token.accessToken, {
                                domain: "localhost",
                                sameSite: "lax",
                                maxAge: parseInt(token.expiresIn) * 1000,
                                path: "/",
                            });
                            util.setCookie("userToken", token.accessToken, {
                                httpOnly: false,
                                secure: true,
                                domain: "carol-at-increase-sunshine.trycloudflare.com",
                                sameSite: "lax",
                                maxAge: parseInt(token.expiresIn) * 1000,
                                path: "/",
                            });
                            util.setCookie("userToken", token.accessToken, {
                                httpOnly: false,
                                secure: true,
                                domain: "ada-consent-airline-are.trycloudflare.com",
                                sameSite: "lax",
                                maxAge: parseInt(token.expiresIn) * 1000,
                                path: "/",
                            });
                            util.setSuccess(200, "00", "Successful", token);
                        }
                        else {
                            log("Incorrect Password");
                            util.setError(401, "05", "Incorrect Password");
                        }
                    }
                    else {
                    }
                }
                util.checkMemory();
                return util.send(res);
            }
            catch (err) {
                log(err.message);
                util.setError(400, "99", "An Error Occurred");
                util.checkMemory();
                return util.send(res);
            }
        });
    }
}
exports.default = UserController;
