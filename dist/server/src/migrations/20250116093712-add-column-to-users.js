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
        yield queryInterface.addColumn("Users", "initials", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
        yield queryInterface.addColumn("Users", "color", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
        yield queryInterface.addColumn("Users", "security", {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        });
        yield queryInterface.addColumn("Users", "image", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.removeColumn("Users", "initials");
        yield queryInterface.removeColumn("Users", "color");
        yield queryInterface.removeColumn("Users", "security");
        yield queryInterface.removeColumn("Users", "image");
    }),
};
