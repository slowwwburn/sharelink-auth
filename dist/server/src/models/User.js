"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const Util_1 = __importDefault(require("../../utils/Util"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class User extends sequelize_1.Model {
    static associate(models) { }
}
const initModel = (sequelize) => {
    User.init({
        id: {
            type: sequelize_1.DataTypes.BIGINT,
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
            allowNull: true,
            unique: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        phonenumber: {
            type: sequelize_1.DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        image: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        bvn: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        accountNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        bankCode: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        initials: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        color: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        security: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        },
        paystackId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        paystackStatus: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: "User",
        tableName: "Users",
        timestamps: true,
        hooks: {
            beforeCreate: (user) => {
                log("BeforeCreate hook triggered");
                try {
                    user.id = util.generatePrimaryKey();
                }
                catch (err) {
                    log("Error generating primary key: ", err.message);
                    throw err;
                }
            },
        },
    });
    return User;
};
exports.default = initModel;
