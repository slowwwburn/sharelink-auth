"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const Util_1 = __importDefault(require("../../utils/Util"));
const util = new Util_1.default();
const log = (0, Logger_1.default)(__filename);
class Admin extends sequelize_1.Model {
    static associate(models) {
    }
}
const initModel = (sequelize) => {
    Admin.init({
        id: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {
        sequelize,
        modelName: "Admin",
        tableName: "Admins",
        timestamps: true,
    });
    Admin.beforeCreate((admin) => {
        admin.id = util.generatePrimaryKey();
    });
    return Admin;
};
exports.default = initModel;
