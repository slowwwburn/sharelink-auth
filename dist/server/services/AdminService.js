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
const models_1 = __importDefault(require("../src/models"));
const Util_1 = __importDefault(require("../utils/Util"));
const Logger_1 = __importDefault(require("../utils/Logger"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class AdminService {
    static addAdmin(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                log("Creating Admin", params);
                if (params.password)
                    params.password = util.hashPassword(params.password);
                const admin = yield models_1.default.Admin.create(params);
                delete admin.password;
                return admin;
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.Admin.findAll();
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getAdminByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Getting Admin by username");
            try {
                return yield models_1.default.Admin.findOne({
                    attributes: { exclude: ["password"] },
                    where: { username },
                });
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getAdminById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.Admin.findOne({
                    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
                    where: { id },
                });
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.Admin.findOne({
                    attributes: { exclude: ["createdAt", "updatedAt"] },
                    where: { email },
                });
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getAdminByBVN(bvn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.Admin.findOne({
                    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
                    where: { bvn },
                });
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static updateAdmin(params) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = AdminService;
