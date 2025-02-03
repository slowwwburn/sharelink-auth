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
const UserService_1 = __importDefault(require("./UserService"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class AuthService {
    static authenticateFrontEnd(apiKey) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    static verifyCollector(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return util.verifyToken(token);
            }
            catch (err) {
                log(err.message);
            }
        });
    }
    static verifyUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                log("Verifying user token");
                let isUser;
                const verify = util.verifyToken(token);
                if (verify)
                    util.redisGet(verify.jti);
                isUser = yield UserService_1.default.getUserById(verify.id);
                return verify;
            }
            catch (err) {
                log("An error occurred ", err.message);
                throw err;
            }
        });
    }
    static resetPassword(loginId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserService_1.default.getUserByEmailorUsername(loginId);
                if (!user) {
                    log("User doesn't exist");
                    return;
                }
                log("Generating default password");
                const newPassword = util.generateTempPassword(10);
                yield UserService_1.default.updatePassword({
                    password: newPassword,
                    id: user.id,
                });
                yield util.sendMail(user.email, "Reset Your Sharelink Password", {
                    template: "forgot-password",
                    name: user.firstName,
                    support_email: "support@gates-sharelink.com",
                    password: newPassword,
                });
            }
            catch (err) {
                log("An error ocurred", err);
                throw err;
            }
        });
    }
}
exports.default = AuthService;
