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
const Logger_1 = __importDefault(require("../../util/Logger"));
const sequelize_1 = require("sequelize");
const OTP_1 = require("../models/OTP");
const log = (0, Logger_1.default)(__filename);
exports.default = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.createTable("OTPs", {
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
                type: sequelize_1.DataTypes.ENUM(OTP_1.OTPUsed.yes, OTP_1.OTPUsed.no),
                allowNull: false,
                defaultValue: OTP_1.OTPUsed.no,
            },
            expirationTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        });
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable("OTPs");
    }),
};
