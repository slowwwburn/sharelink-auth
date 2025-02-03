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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.addColumn("Users", "phonenumber", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
        yield queryInterface.addColumn("Users", "bankCode", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
        yield queryInterface.addColumn("Users", "paystackId", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
        yield queryInterface.addColumn("Users", "paystackStatus", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.removeColumn("Users", "phonenumber");
        yield queryInterface.removeColumn("Users", "bankCode");
        yield queryInterface.removeColumn("Users", "paystackId");
        yield queryInterface.removeColumn("Users", "paystackStatus");
    }),
};
