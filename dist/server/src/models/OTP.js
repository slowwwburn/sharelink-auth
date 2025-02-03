"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPUsed = void 0;
const sequelize_1 = require("sequelize");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const log = (0, Logger_1.default)(__filename);
var OTPUsed;
(function (OTPUsed) {
    OTPUsed["yes"] = "1";
    OTPUsed["no"] = "0";
})(OTPUsed || (exports.OTPUsed = OTPUsed = {}));
class OTP extends sequelize_1.Model {
    static association(models) { }
}
const initModel = (sequelize) => {
    OTP.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            set: (val) => {
                log("Cannot set id manually");
            },
        },
        otp: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        otpId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        isUsed: {
            type: sequelize_1.DataTypes.ENUM(OTPUsed.yes, OTPUsed.no),
            allowNull: false,
            defaultValue: OTPUsed.no,
        },
        expirationTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, { sequelize, modelName: "OTP", tableName: "OTPs", timestamps: true });
    return OTP;
};
exports.default = initModel;
