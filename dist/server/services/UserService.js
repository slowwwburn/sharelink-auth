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
                params.color = util.getProfileColor().hex;
                params.initials = util.getInitials(params.firstName, params.lastName);
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
    static updatePassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ password, id }) {
            log("Updating user's password");
            if (!password || !id) {
                log("Password or ID is missing in updatePassword");
                throw new Error("Password and ID are required to update the password");
            }
            const transaction = yield models_1.default.sequelize.transaction();
            try {
                const hashedPassword = util.hashPassword(password);
                const [updatedRows] = yield models_1.default.User.update({ password: hashedPassword, security: true }, { where: { id }, transaction });
                if (updatedRows === 0) {
                    log(`No user found with ID: ${id}`);
                    yield transaction.rollback();
                    throw new Error("User not found or no changes were made");
                }
                if (updatedRows > 1) {
                    log(`More than one row updated, rolling back changes`);
                    yield transaction.rollback();
                    throw new Error("User not found or no changes were made");
                }
                log(`Password updated successfully for user with ID: ${id}`);
                yield transaction.commit();
            }
            catch (err) {
                log("An error ocurred while trying to update password", err);
                yield transaction.rollback();
                throw err;
            }
        });
    }
    static checkIfUserExists(params) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Checking user's information");
            return yield models_1.default.User.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { phonenumber: params.phonenumber },
                        { email: params.email },
                        { bvn: params.bvn },
                    ],
                },
            });
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
    static searchUsers(searchInput, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield models_1.default.User.findAll({
                    attributes: ["id", "username", "image", "color", "initials"],
                    where: {
                        username: {
                            [sequelize_1.Op.iLike]: `%${searchInput}%`,
                        },
                        id: {
                            [sequelize_1.Op.ne]: userId,
                        },
                    },
                });
            }
            catch (err) {
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
                log("Retrieving User using Email/Username");
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
    static updateUsername(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield models_1.default.sequelize.transaction();
            try {
                const [updatedRows] = yield models_1.default.User.update({ username: params.username }, { where: { id: params.id }, transaction });
                if (updatedRows === 0) {
                    log(`No user found with ID: ${params.id}`);
                    yield transaction.rollback();
                    throw new Error("User not found or no changes were made");
                }
                if (updatedRows > 1) {
                    log(`More than one row updated, rolling back changes`);
                    yield transaction.rollback();
                    throw new Error("User not found or no changes were made");
                }
                log(`Username updated successfully for user with ID: ${params.id}`);
                yield transaction.commit();
                return params.username;
            }
            catch (err) {
                if (err.name === "SequelizeUniqueConstraintError") {
                    throw new Error("The username is already taken");
                }
                log(err.message);
                throw err;
            }
        });
    }
    static changePassword(curPassword, newPassword, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Changing user's password");
            try {
                const user = yield models_1.default.User.findOne({
                    where: { id: userId },
                    attributes: ["password"],
                });
                if (!user) {
                    log("User not found");
                    return;
                }
                if (util.comparePassword(curPassword, user.password)) {
                    const [updated] = yield models_1.default.User.update({ password: newPassword, security: false }, {
                        where: { id: userId },
                    });
                    log("Password changed successfully");
                    return updated;
                }
                else {
                    log("Provided password does not match stored password");
                    throw new Error("Password mismatch");
                }
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
}
exports.default = UserService;
