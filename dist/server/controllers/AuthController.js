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
const AuthService_1 = __importDefault(require("../services/AuthService"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class AuthController {
    static authentication(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            log("Authenticating request");
            const authorization = req.headers.authorization;
            const token = (_a = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1]) !== null && _a !== void 0 ? _a : null;
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
                    const valid = yield util.verifyToken(token);
                    if (valid) {
                        res.locals.userId = valid.id;
                        log("User validated via token");
                        return next();
                    }
                    else {
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
            }
            catch (err) { }
        });
    }
    static authenticateToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const authorization = req.headers.authorization;
            const token = (_a = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1]) !== null && _a !== void 0 ? _a : null;
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
                const revoked = yield util.redisGet(isUser.jti);
                if (isUser.jti && revoked) {
                    log("Blacklisted Token");
                    res.clearCookie("userToken");
                    util.setError(400, "98", "Token is expired");
                    return util.send(res);
                }
                log("Token is valid and still active");
                util.setSuccess(200, "00", "User successfully authenticated", isUser);
                return util.send(res);
            }
            catch (err) {
                log("Error occurred during authentication", err);
                util.setError(400, "99", "Internal Server Error");
                return util.send(res);
            }
        });
    }
    static logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            log("Request to log out received");
            const authorization = req.headers.authorization;
            const token = (_a = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1]) !== null && _a !== void 0 ? _a : null;
            log("Token retrieved", token);
            try {
                if (!token) {
                    util.setError(400, "98", "Token not provided");
                    return util.send(res);
                }
                const verify = util.verifyToken(token);
                log(verify);
                util.redisPost(verify.jti, verify.id, verify.exp - Math.floor(Date.now() / 1000));
                res.clearCookie("userToken");
                util.setSuccess(200, "00", "Logout Successful");
                return util.send(res);
            }
            catch (err) {
                log("An error occurred ", err.message);
                util.setError(500, "99", "An Error Occurred");
                return util.send(res);
            }
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Request to reset password received");
            try {
                const { loginId } = req.body;
                yield AuthService_1.default.resetPassword(loginId);
                util.setSuccess(200, "00", "User's password has been successfully updated");
                return util.send(res);
            }
            catch (err) {
                util.setError(500, "99", 'Internal Server Error');
                return util.send(res);
            }
        });
    }
}
exports.default = AuthController;
