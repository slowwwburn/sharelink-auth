"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
dotenv_1.default.config();
const debug = (0, Logger_1.default)(__filename);
const config = {
    development: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: "5432",
        dialect: "postgres",
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        logging: (msg) => debug(`[Sequelize]: ${msg}`),
    },
    test: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: "5432",
        dialect: "postgres",
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        logging: (msg) => debug(`[Sequelize]: ${msg}`),
    },
    production: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: "5432",
        dialect: "postgres",
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        logging: (msg) => debug(`[Sequelize]: ${msg}`),
    },
};
exports.default = config;
