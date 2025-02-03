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
const Logger_1 = __importDefault(require("../../util/Logger"));
const Gift_1 = require("../models/Gift");
const log = (0, Logger_1.default)(__filename);
exports.default = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.createTable("Gifts", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                set: (val) => {
                    log("Cannot set `id` manually");
                },
            },
            firstName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: sequelize_1.DataTypes.ENUM(Gift_1.GiftType.open, Gift_1.GiftType.bet, Gift_1.GiftType.credit, Gift_1.GiftType.utility),
                defaultValue: Gift_1.GiftType.open,
            },
            size: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            sizeCount: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            amount: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            code: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(Gift_1.GiftStatus.rejected, Gift_1.GiftStatus.pending, Gift_1.GiftStatus.funded, Gift_1.GiftStatus.gifting, Gift_1.GiftStatus.gifted),
                defaultValue: Gift_1.GiftStatus.pending,
                allowNull: false,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        });
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable("Gifts");
    }),
};
