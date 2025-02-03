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
const AdminService_1 = __importDefault(require("../services/AdminService"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class AuthController {
    static loginAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = req.body;
            try {
                let d = Date();
                user.userId = Math.floor(Date.now() / 1000);
                const createduser = yield AdminService_1.default.addAdmin(user);
                util.setSuccess(201, "00", "Registration successful", createduser);
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
    static registerAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { admin } = req.body;
            try {
                let d = Date();
                const createdAdmin = yield AdminService_1.default.addAdmin(admin);
                util.setSuccess(201, "00", "Registration successful", createdAdmin);
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
}
exports.default = AuthController;
