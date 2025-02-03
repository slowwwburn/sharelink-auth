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
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../src/models"));
const Util_1 = __importDefault(require("../utils/Util"));
const Logger_1 = __importDefault(require("../utils/Logger"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class UserService {
    static addUser(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                log("Creating User", params);
                if (params.password)
                    params.password = util.hashPassword(params.password);
                const user = yield models_1.default.User.create(params);
                delete user.password;
                return user;
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.User.findAll();
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    static getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Getting user by username");
            try {
                return yield models_1.default.User.findOne({
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
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.User.findOne({
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
    static getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.User.findOne({
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
    static getUserByEmailorUsername(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                log("Retrieving User Using Email/Username");
                return yield models_1.default.User.findOne({
                    where: {
                        [sequelize_1.Op.or]: [{ email: param }, { username: param }],
                    },
                });
            }
            catch (err) {
                log("An error occurred", err.message);
            }
        });
    }
    static getUserByBVN(bvn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.User.findOne({
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
    static updateUser(params) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = UserService;
